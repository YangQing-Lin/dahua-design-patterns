// 端到端测试（需要 Playwright，先起本地服务）：node tools/e2e.js
// 覆盖：播放/暂停、上一帧/下一帧、拖动进度条、步骤列表、播完记进度、深链接、代码语言切换、
//       所有模式页逐帧渲染无报错、首页卡片数、测验流程。失败时退出码为 1。
const { chromium } = require('playwright');
const base = process.env.DP_URL || 'http://localhost:8765/';
const id = process.argv[2] || 'strategy';

(async () => {
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  let failed = 0;
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (['error', 'warning'].includes(m.type())) errs.push(m.text()); });
  const st = () => page.evaluate(() => ({ k: __player.k, t: +__player.t.toFixed(2), playing: __player.playing, stopAt: __player.stopAt }));
  const ok = (cond, msg) => { if (!cond) failed++; console.log((cond ? '✅ ' : '❌ ') + msg); };
  const wait = ms => page.waitForTimeout(ms);

  await page.goto(base + '#/p/' + id); await wait(2500);
  let s = await st(); ok(s.k === 0 && !s.playing, '打开后停在第 1 帧且暂停');
  await page.keyboard.press('ArrowRight'); await wait(300);
  s = await st(); ok(s.k === 1 && s.playing && s.stopAt != null, '→ 进入第 2 帧并播放过渡');
  await wait(4000);
  s = await st(); ok(s.k === 1 && !s.playing, '过渡结束后自动停住');
  await page.keyboard.press('ArrowLeft'); await wait(2500);
  s = await st(); ok(s.k === 0, '← 回到第 1 帧');
  await page.keyboard.press('Space'); await wait(1200);
  s = await st(); ok(s.playing && s.stopAt == null, '空格开始连续播放');
  await page.keyboard.press('Space'); await wait(500);
  const s2 = await st(); await wait(500); const s3 = await st();
  ok(!s2.playing && s2.t === s3.t, '空格暂停，时间不再前进');

  const box = await (await page.$('.tl')).boundingBox();
  const n = await page.evaluate(() => __player.N);
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height / 2); await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.55, box.y + box.height / 2, { steps: 6 });
  s = await st(); ok(s.k === Math.floor(0.55 * n), `拖动中画面实时跟随（第 ${s.k + 1} 帧）`);
  await page.mouse.move(box.x + box.width * 0.75, box.y + box.height / 2, { steps: 6 }); await page.mouse.up();
  s = await st(); ok(s.k === Math.floor(0.75 * n) && !s.playing, `松手停在第 ${s.k + 1} 帧`);

  await page.click('.steps li[data-k="2"]'); await wait(2500);
  s = await st(); ok(s.k === 2, '点击步骤列表跳到第 3 帧');
  await page.click('[data-a=next]'); await wait(2500);
  s = await st(); ok(s.k === 3, '“下一帧”按钮');
  await page.click('[data-a=prev]'); await wait(2500);
  s = await st(); ok(s.k === 2, '“上一帧”按钮');
  await page.click('[data-a=first]'); await wait(400);
  s = await st(); ok(s.k === 0, '“回到第一帧”按钮');

  await page.selectOption('.speed select', '2');
  await page.evaluate(() => { const p = __player; p.pause(); p.t = p.c.total - 1.5; p.render(); });
  await page.click('[data-a=toggle]'); await wait(1500);
  s = await st();
  ok(!s.playing && s.k === n - 1 && await page.evaluate(() => DP.learned.has(__player.p.id)), '播完自动停止并记为已学');
  await page.click('[data-a=toggle]'); await wait(300);
  s = await st(); ok(s.k === 0 && s.playing, '播完后再点播放从头开始');

  await page.goto(base + '#/p/' + id + '/5'); await wait(600);
  s = await st(); ok(s.k === 4 && !s.playing, '深链接 /5 打开第 5 帧');

  await page.click('.code-tabs button[data-lang=go]');
  await page.reload(); await wait(500);
  ok(await page.$eval('.code-tabs .on', e => e.dataset.lang) === 'go', '代码语言切换后刷新仍记住 Go');

  const ids = await page.evaluate(() => DP.sorted().map(p => p.id));
  const before = errs.length;
  for (const pid of ids) {
    await page.goto(base + '#/p/' + pid); await wait(250);
    await page.evaluate(() => {
      const p = __player;
      for (let k = 0; k < p.N; k++) {
        const F = p.c.frames[k];
        for (const f of [0.1, 0.5, 1, 2, 4, F.settle, F.dur - 0.01]) { p.t = F.start + Math.min(f, F.dur - 0.01); p.render(); }
      }
      p.pause();
    });
  }
  ok(errs.length === before, `${ids.length} 个模式页逐帧渲染无报错`);
  await page.goto(base + '#/'); await wait(500);
  ok((await page.$$eval('.card', a => a.length)) === ids.length, `首页卡片数 = ${ids.length}`);
  await page.goto(base + '#/quiz'); await wait(300);
  for (let i = 0; i < 10; i++) {
    if ((await page.$$eval('.opt', a => a.length)) !== 4) { ok(false, `第 ${i + 1} 题选项数不是 4`); break; }
    await page.click('.opt'); await page.click('.qnext button');
  }
  ok(!!(await page.$('.qres')), '测验做完 10 题出结果页');
  ok(errs.length === 0, '全程无页面错误 ' + errs.join(' | '));
  await browser.close();
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
