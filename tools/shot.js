// 截图 + 布局检查（需要 Playwright：cd tools && npm install && npx playwright install chromium）
// 先在项目根目录起服务：python3 -m http.server 8765
//   node tools/shot.js <id>                     联系表（全部帧）截图 + 布局检查（重叠 / 越界 / 遮挡标题）
//   node tools/shot.js <id> --frame 5           第 5 帧（就绪状态）的大图
//   node tools/shot.js <id> --frame 5 --at 1.6  第 5 帧第 1.6 秒（看消息流动中）
//   node tools/shot.js --page "#/"              任意页面整页截图
// 截图保存在 tools/shots/。环境变量：DP_URL（默认 http://localhost:8765/），CHROME_PATH（可选，指定浏览器）
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const id = args[0] && !args[0].startsWith('--') ? args[0] : null;
const frame = opt('--frame'), at = opt('--at'), pageHash = opt('--page');
const width = +opt('--width', frame ? 1440 : 1400);
const base = process.env.DP_URL || 'http://localhost:8765/';
const dir = path.join(__dirname, 'shots');
fs.mkdirSync(dir, { recursive: true });

(async () => {
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const logs = [];
  page.on('console', m => { if (['error', 'warning'].includes(m.type())) logs.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', e => logs.push('[pageerror] ' + e.message));

  let out;
  if (pageHash) {
    await page.goto(base + pageHash);
    await page.waitForTimeout(900);
    out = path.join(dir, `page-${pageHash.replace(/[^a-z0-9]+/gi, '_') || 'home'}-${width}.png`);
    await page.screenshot({ path: out, fullPage: true });
  } else if (frame) {
    await page.goto(`${base}#/p/${id}/${frame}`);
    await page.waitForTimeout(500);
    await page.evaluate(([k, at]) => {
      const p = window.__player, F = p.c.frames[k - 1];
      p.pause();
      p.t = F.start + (at != null ? +at : F.settle);
      p.render();
    }, [+frame, at == null ? null : +at]);
    await page.waitForTimeout(150);
    out = path.join(dir, `${id}-f${frame}${at != null ? '-t' + at : ''}.png`);
    await (await page.$('.learn')).screenshot({ path: out });
  } else {
    await page.goto(`${base}#/sheet/${id}`);
    await page.waitForTimeout(700);
    const issues = await page.evaluate(() => {
      const res = [];
      document.querySelectorAll('.sheet .cell').forEach((cell, k) => {
        const stage = cell.querySelector('.stage');
        const sr = stage.getBoundingClientRect(), s = sr.width / 1000;
        const R = r => ({ l: (r.left - sr.left) / s, t: (r.top - sr.top) / s, r: (r.right - sr.left) / s, b: (r.bottom - sr.top) / s });
        const shown = el => el.style.visibility !== 'hidden' && +(el.style.opacity || 1) > 0.05;
        const items = [];
        stage.querySelectorAll('.layer.nodes .node, .layer.zones .node').forEach(el => {
          if (shown(el)) items.push({ name: el.dataset.id, zone: el.classList.contains('k-zone'), r: R(el.getBoundingClientRect()) });
        });
        stage.querySelectorAll('.bubble').forEach(el => {
          if (shown(el)) items.push({ name: `气泡「${el.textContent.slice(0, 12)}」`, r: R(el.getBoundingClientRect()) });
        });
        const cap = R(stage.querySelector('.caption').getBoundingClientRect());
        const hit = (a, b, m = 2) => a.l < b.r - m && b.l < a.r - m && a.t < b.b - m && b.t < a.b - m;
        const msgs = [];
        items.forEach(a => {
          const r = a.r;
          if (r.l < 2 || r.t < 2 || r.r > 998 || r.b > 558) msgs.push(`${a.name} 超出舞台 [${Math.round(r.l)},${Math.round(r.t)} → ${Math.round(r.r)},${Math.round(r.b)}]`);
          if (hit(r, cap)) msgs.push(`${a.name} 遮挡了左上角标题`);
        });
        for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
          const a = items[i], b = items[j];
          if (!a.zone && !b.zone && hit(a.r, b.r)) msgs.push(`${a.name} 与 ${b.name} 重叠`);
        }
        if (msgs.length) res.push(`第${k + 1}帧: ` + msgs.join('；'));
      });
      return res;
    });
    out = path.join(dir, `${id}.png`);
    await page.screenshot({ path: out, fullPage: true });
    console.log(issues.length ? '布局问题:\n  ' + issues.join('\n  ') : '布局检查通过（无重叠/越界）');
  }
  if (logs.length) console.log('控制台:\n  ' + logs.join('\n  '));
  console.log('截图: ' + out);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
