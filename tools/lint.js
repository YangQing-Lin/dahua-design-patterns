// 内容检查（无依赖）：node tools/lint.js
// 检查每个 patterns/*.js：必填字段、口诀长度、compare/quiz 引用、三种语言代码是否齐全，
// 以及 index.html 是否引入了全部模式文件。有问题时退出码为 1（CI 会因此阻止部署）。
const fs = require('fs'), vm = require('vm'), path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'patterns');
const list = [];
const ctx = { DP: { register: p => list.push(p) } };
vm.createContext(ctx);
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.js')).sort();
for (const f of files) vm.runInContext(fs.readFileSync(path.join(DIR, f), 'utf8'), ctx, { filename: f });

const ids = new Set(list.map(p => p.id));
const plain = s => String(s || '').replace(/\*\*|==|`/g, '');
let bad = 0;

for (const p of list.sort((a, b) => a.order - b.order)) {
  const w = [];
  for (const k of ['id', 'order', 'type', 'name', 'en', 'emoji', 'chapter', 'mnemonic', 'summary', 'intent', 'story', 'analogy', 'code', 'codePython', 'codeGo']) {
    if (!p[k] && p[k] !== 0) w.push('缺少 ' + k);
  }
  for (const k of ['when', 'pros', 'cons', 'compare', 'quiz', 'frames']) if (!Array.isArray(p[k]) || !p[k].length) w.push('缺少数组 ' + k);
  if (plain(p.mnemonic).length > 18) w.push(`口诀 ${plain(p.mnemonic).length} 字（应 ≤ 18）`);
  (p.compare || []).forEach(c => { if (!ids.has(c.id)) w.push('compare 引用了不存在的 id: ' + c.id); });
  (p.quiz || []).forEach(q => { if (q.a && !ids.has(q.a)) w.push('quiz 答案不存在: ' + q.a); });
  const lens = (p.frames || []).map(f => plain(f.text).length);
  console.log(`${String(p.order).padEnd(5)} ${p.id.padEnd(24)} ${p.type.padEnd(11)} 帧:${String((p.frames || []).length).padEnd(3)} ` +
    `讲解字数:${Math.min(...lens)}-${Math.max(...lens)}${w.length ? '  ⚠ ' + w.join('；') : ''}`);
  if (w.length) bad++;
}

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const included = new Set([...html.matchAll(/src="patterns\/([^"]+)\.js"/g)].map(m => m[1]));
for (const f of files) if (!included.has(f.slice(0, -3))) { console.log(`⚠ index.html 没有引入 patterns/${f}`); bad++; }
for (const id of included) if (!files.includes(id + '.js')) { console.log(`⚠ index.html 引入了不存在的 patterns/${id}.js`); bad++; }

console.log(`\n共 ${list.length} 个模式 / 原则，${list.reduce((s, p) => s + (p.frames || []).length, 0)} 帧` + (bad ? `，${bad} 处问题` : '，全部通过'));
process.exit(bad ? 1 : 0);
