// 运行全部代码骨架（无 npm 依赖，需要本机有 python3 和 go）：
//   node tools/check-code.js             检查全部模式
//   node tools/check-code.js strategy    只检查某几个
// 从 patterns/<id>.js 取出 codePython / codeGo 真实运行：
//   Python：python3 运行（超时 60 秒），打印输出
//   Go：gofmt 格式检查（不符合时打印 gofmt 后的版本）、go vet、go run，打印输出
// 找不到 python3 / go 时跳过对应检查并给出提示；有失败时退出码为 1。
const fs = require('fs'), vm = require('vm'), path = require('path'), os = require('os');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const run = (cmd, args, cwd, input) => spawnSync(cmd, args, { cwd, input, encoding: 'utf8', timeout: 60000 });
const has = cmd => !run(cmd, ['--version'], ROOT).error || !run(cmd, ['version'], ROOT).error;
const lines = s => String(s || '').replace(/^\n+|\s+$/g, '').split('\n').length;
const indent = s => String(s || '').trim().split('\n').map(l => '    │ ' + l).join('\n');

const hasPy = has('python3'), hasGo = has('go');
if (!hasPy) console.log('⚠ 没有找到 python3，跳过 Python 检查');
if (!hasGo) console.log('⚠ 没有找到 go，跳过 Go 检查（安装：https://go.dev/dl/）');

let ids = process.argv.slice(2);
if (!ids.length) ids = fs.readdirSync(path.join(ROOT, 'patterns')).filter(f => f.endsWith('.js')).map(f => f.slice(0, -3)).sort();

let bad = 0;
for (const id of ids) {
  const file = path.join(ROOT, 'patterns', id + '.js');
  let p = null;
  try {
    vm.runInNewContext(fs.readFileSync(file, 'utf8'), { DP: { register: x => { p = x; } } }, { filename: file });
  } catch (e) { console.log(`❌ ${id}: 文件无法加载 —— ${e.message}`); bad++; continue; }
  const probs = [];
  console.log(`\n=== ${id}（Java ${lines(p.code)} 行 / Python ${p.codePython ? lines(p.codePython) : '—'} 行 / Go ${p.codeGo ? lines(p.codeGo) : '—'} 行）`);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dpc-'));

  if (!p.codePython) probs.push('缺少 codePython');
  else {
    const src = p.codePython.replace(/^\n+|\s+$/g, '') + '\n';
    if (lines(src) > 60) probs.push(`Python ${lines(src)} 行，超过 60 行`);
    if (hasPy) {
      fs.writeFileSync(path.join(dir, 'main.py'), src);
      const r = run('python3', ['-I', '-X', 'utf8', 'main.py'], dir);
      if (r.status !== 0) probs.push('Python 运行失败:\n' + indent(r.stderr || r.error));
      else console.log('  Python 输出:\n' + indent(r.stdout));
    }
  }

  if (!p.codeGo) probs.push('缺少 codeGo');
  else {
    const src = p.codeGo.replace(/^\n+|\s+$/g, '') + '\n';
    if (lines(src) > 80) probs.push(`Go ${lines(src)} 行，超过 80 行`);
    if (hasGo) {
      fs.writeFileSync(path.join(dir, 'main.go'), src);
      const f = run('gofmt', [], dir, src);
      if (f.status !== 0) probs.push('gofmt 解析失败:\n' + indent(f.stderr));
      else if (f.stdout !== src) probs.push('Go 代码未按 gofmt 格式化，gofmt 后应为:\n' + f.stdout);
      const v = run('go', ['vet', 'main.go'], dir);
      if (v.status !== 0) probs.push('go vet 失败:\n' + indent(v.stderr));
      const r = run('go', ['run', 'main.go'], dir);
      if (r.status !== 0) probs.push('go run 失败:\n' + indent(r.stderr || r.error));
      else console.log('  Go 输出:\n' + indent(r.stdout));
    }
  }
  fs.rmSync(dir, { recursive: true, force: true });
  if (probs.length) { bad++; console.log('❌ ' + probs.join('\n❌ ')); } else console.log('✅ 通过');
}
console.log(bad ? `\n${bad} 个模式有问题` : '\nALL OK');
process.exit(bad ? 1 : 0);
