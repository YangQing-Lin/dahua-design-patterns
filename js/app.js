/* 页面：首页 / 模式详情 / 记忆测验 / 联系表(开发预览) —— 基于 hash 的单页路由 */
(function () {
  'use strict';
  const { esc, inline, highlight } = DP.util;
  const app = document.getElementById('app');
  let player = null, keyHandler = null;
  const home = { type: 'all', sort: 'type', q: '' };

  const isPrinciple = p => p.type === 'principle';
  const chapNo = p => (String(p.chapter || '').match(/第\s*(\d+)\s*章/) || [])[1] || '';

  function cleanup() {
    if (player) { player.destroy(); player = null; window.__player = null; }
    if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }

  function setNav(name) {
    document.querySelectorAll('.nav a').forEach(a => a.classList.toggle('on', a.dataset.nav === name));
  }

  function route() {
    cleanup();
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    window.scrollTo(0, 0);
    if (parts[0] === 'p' && DP.byId[parts[1]]) return pagePattern(DP.byId[parts[1]], parts[2]);
    if (parts[0] === 'quiz') return pageQuiz();
    if (parts[0] === 'sheet' && DP.byId[parts[1]]) return pageSheet(DP.byId[parts[1]]);
    if (parts[0] === 'random') {
      const ps = DP.list;
      location.replace('#/p/' + ps[Math.floor(Math.random() * ps.length)].id);
      return;
    }
    pageHome();
  }

  /* ======================= 首页 ======================= */

  function pageHome() {
    setNav('home');
    document.title = '大话设计模式 · 逐帧动画图解';
    const all = DP.sorted();
    const pats = all.filter(p => !isPrinciple(p));
    const learned = DP.learned.all().filter(id => DP.byId[id]);
    const frames = all.reduce((s, p) => s + (p.frames || []).length, 0);
    const pct = all.length ? Math.round(learned.length / all.length * 100) : 0;
    const first = all[0];

    app.innerHTML = `
      <section class="hero">
        <h1>把设计模式「看」进脑子里<span>《大话设计模式》逐帧动画图解 · ${pats.length} 个模式 + ${all.length - pats.length} 条原则</span></h1>
        <p>每个模式都被拆成十来帧小动画：先看书里的故事遇到了什么麻烦，再看模式中的角色一个个登场、消息怎么流动，最后看需求变化时它如何从容应对。每一帧配一段大白话讲解，可以<b>暂停、拖动进度、一帧一帧地前后翻看</b>。</p>
        <div class="hero-actions">
          ${first ? `<a class="btn primary" href="#/p/${first.id}">▶ 从第 1 章开始</a>` : ''}
          <a class="btn" href="#/quiz">🎯 测测记住了多少</a>
          <a class="btn" href="#/random">🎲 随机来一个</a>
        </div>
        <div class="hero-stats">
          <div class="st"><b>${pats.length}</b><span>个设计模式</span></div>
          <div class="st"><b>${all.length - pats.length}</b><span>条设计原则</span></div>
          <div class="st"><b>${frames}</b><span>帧动画讲解</span></div>
          <div class="prog">
            <div class="prog-txt"><span>学习进度：已看完 <b>${learned.length}</b> / ${all.length}</span>${learned.length ? '<button class="reset">清空进度</button>' : ''}</div>
            <div class="prog-bar"><i style="width:${pct}%"></i></div>
          </div>
        </div>
      </section>
      <section class="howto">
        <div><b>① 先看故事</b>每个模式都从书里的场景出发：小菜写的代码哪里不好？大鸟是怎么点拨的？</div>
        <div><b>② 再看动画</b>角色登场、消息流动、需求变化……一帧只讲一件事，看不懂就倒回去再看一遍。</div>
        <div><b>③ 最后巩固</b>记住“一句话口诀”，看看代码骨架，再去做几道场景测验。</div>
      </section>
      <div class="toolbar">
        <div class="chips">
          <button class="chip" data-type="all">全部 <span class="cnt">${all.length}</span></button>
          ${Object.keys(DP.TYPES).map(t => `<button class="chip t-${t}" data-type="${t}"><span class="dot"></span>${DP.TYPES[t].name} <span class="cnt">${all.filter(p => p.type === t).length}</span></button>`).join('')}
        </div>
        <span class="grow"></span>
        <div class="seg"><button data-sort="type">按分类</button><button data-sort="book">按书中章节</button></div>
        <input class="search" type="search" placeholder="搜索：名称 / 英文 / 口诀…" value="${esc(home.q)}">
      </div>
      <div id="cards"></div>
      ${cheatSheet(all)}`;

    const reset = app.querySelector('.reset');
    if (reset) reset.onclick = () => { if (confirm('确定清空学习进度吗？')) { DP.learned.clear(); pageHome(); } };
    app.querySelectorAll('.chip').forEach(b => b.onclick = () => { home.type = b.dataset.type; renderCards(); });
    app.querySelectorAll('.seg button').forEach(b => b.onclick = () => { home.sort = b.dataset.sort; renderCards(); });
    app.querySelector('.search').oninput = ev => { home.q = ev.target.value.trim(); renderCards(); };
    renderCards();
  }

  function card(p) {
    const done = DP.learned.has(p.id);
    return `<a class="card t-${p.type}" href="#/p/${p.id}">
      <div class="card-top"><span class="emoji">${p.emoji || '📦'}</span>${done ? '<span class="learned-mark">✓ 已学</span>' : ''}<span>${chapNo(p) ? '第 ' + chapNo(p) + ' 章' : ''}</span></div>
      <h3>${esc(p.name)}<small>${esc(p.en)}</small></h3>
      <p class="mn">${inline(p.mnemonic || '')}</p>
      <div class="card-foot"><span class="tag">${DP.TYPES[p.type].name}</span><span>${(p.frames || []).length} 帧 · ${esc((p.chapter || '').replace(/^第\s*\d+\s*章\s*[·・]?\s*/, ''))}</span></div>
    </a>`;
  }

  function renderCards() {
    app.querySelectorAll('.chip').forEach(b => b.classList.toggle('on', b.dataset.type === home.type));
    app.querySelectorAll('.seg button').forEach(b => b.classList.toggle('on', b.dataset.sort === home.sort));
    const q = home.q.toLowerCase();
    const items = DP.sorted().filter(p =>
      (home.type === 'all' || p.type === home.type) &&
      (!q || [p.name, p.en, p.mnemonic, p.summary, p.chapter, p.id].join(' ').toLowerCase().includes(q)));
    const box = app.querySelector('#cards');
    if (!items.length) { box.innerHTML = '<div class="empty">没有找到匹配的内容 🤔</div>'; return; }
    if (home.sort === 'book') { box.innerHTML = `<div class="grid">${items.map(card).join('')}</div>`; return; }
    box.innerHTML = Object.keys(DP.TYPES).map(t => {
      const g = items.filter(p => p.type === t);
      if (!g.length) return '';
      return `<div class="group-h t-${t}"><h2>${DP.TYPES[t].name}</h2><p>${esc(DP.TYPES[t].desc)}</p></div><div class="grid">${g.map(card).join('')}</div>`;
    }).join('');
  }

  function cheatSheet(all) {
    return `<section class="cheat">
      <h2>📝 一页纸速记</h2>
      <p>复习时扫一眼：每个模式一句话。点名字可以直接跳到动画。</p>
      <div class="cheat-cols">${Object.keys(DP.TYPES).filter(t => t !== 'principle').map(t => `
        <div class="cheat-col t-${t}"><h3>${DP.TYPES[t].name}</h3>
          ${all.filter(p => p.type === t).map(p => `<a href="#/p/${p.id}"><b>${esc(p.name)}</b><span>${inline(p.mnemonic || '')}</span></a>`).join('')}
        </div>`).join('')}
      </div>
    </section>`;
  }

  /* ======================= 模式详情 ======================= */

  function pagePattern(p, frameArg) {
    setNav('');
    document.title = `${p.name} · 大话设计模式动画图解`;
    const T = DP.TYPES[p.type];
    const seq = DP.sorted(), idx = seq.indexOf(p);
    const prev = seq[idx - 1], next = seq[idx + 1];
    const frames = p.frames || [];

    app.innerHTML = `
      <div class="pp t-${p.type}">
        <div class="crumbs"><a href="#/">← 全部模式</a><span>/</span><span>${esc(T.name)}</span></div>
        <header class="p-head">
          <span class="emoji">${p.emoji || '📦'}</span>
          <div><h1>${esc(p.name)}<small>${esc(p.en)}</small></h1>
            <div class="meta"><span class="tag">${esc(T.name)}</span><span>${esc(p.chapter || '')}</span><span>· ${frames.length} 帧</span></div></div>
          <span class="done">${DP.learned.has(p.id) ? '✓ 已学完' : ''}</span>
        </header>
        <div class="mnemonic"><span class="lb">一句话记住</span><b>${inline(p.mnemonic || '')}</b>${p.summary ? `<span class="sum">${inline(p.summary)}</span>` : ''}</div>
        <section class="learn">
          <div class="learn-main"><div id="ph"></div></div>
          <aside class="narr">
            <div class="narr-head"><span>讲解词</span><span class="nc"></span></div>
            <h2 class="narr-title"></h2>
            <div class="narr-text"></div>
            <ol class="steps">${frames.map((f, i) => `<li data-k="${i}"><span class="i">${i + 1}</span><span>${esc(f.title || '')}</span></li>`).join('')}</ol>
            <div class="kbd-tip"><kbd>空格</kbd> 播放/暂停 · <kbd>←</kbd><kbd>→</kbd> 上/下一帧 · <kbd>R</kbd> 重播本帧 · <kbd>F</kbd> 全屏</div>
          </aside>
        </section>
        ${infoCards(p)}
        <nav class="pager">
          ${prev ? `<a class="pv" href="#/p/${prev.id}">← 上一个<b>${esc(prev.name)}</b></a>` : '<span class="ph"></span>'}
          ${next ? `<a class="nx" href="#/p/${next.id}">下一个 →<b>${esc(next.name)}</b></a>` : '<a class="nx" href="#/quiz">学完啦 →<b>🎯 去做测验</b></a>'}
        </nav>
      </div>`;

    const nTitle = app.querySelector('.narr-title'), nText = app.querySelector('.narr-text'), nc = app.querySelector('.nc');
    const lis = Array.from(app.querySelectorAll('.steps li'));
    const seen = new Set();
    const markDone = () => {
      if (!DP.learned.has(p.id)) { DP.learned.add(p.id); app.querySelector('.p-head .done').textContent = '✓ 已学完'; }
    };
    player = new DP.engine.Player(app.querySelector('#ph'), p, {
      fullscreenEl: app.querySelector('.learn'),
      onFrame(k, F) {
        seen.add(k);
        nc.textContent = `${k + 1} / ${frames.length}`;
        nTitle.innerHTML = `<span class="n">${k + 1}</span>${esc(F.title)}`;
        nText.innerHTML = inline(F.text);
        nText.style.animation = 'none'; void nText.offsetWidth; nText.style.animation = '';
        lis.forEach((li, i) => { li.classList.toggle('cur', i === k); li.classList.toggle('seen', seen.has(i)); });
        const cur = lis[k];
        if (cur) {
          const box = cur.parentElement;
          if (cur.offsetTop < box.scrollTop || cur.offsetTop + cur.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = cur.offsetTop - box.clientHeight / 2;
        }
        if (k === frames.length - 1) markDone();
      },
      onEnd: markDone,
    });
    window.__player = player;
    lis.forEach(li => li.onclick = () => player.stepTo(+li.dataset.k));
    bindCodeCard(app);
    keyHandler = ev => player && player.handleKey(ev);
    document.addEventListener('keydown', keyHandler);

    const fa = parseInt(frameArg, 10);
    if (fa >= 1) player.showFrame(fa - 1); else player.stepTo(0);
  }

  const CODE_LANGS = [
    { id: 'java', name: 'Java', field: 'code' },
    { id: 'python', name: 'Python 3', field: 'codePython' },
    { id: 'go', name: 'Go', field: 'codeGo' },
  ];
  function codeLang(set) {
    try {
      if (set) localStorage.setItem('dp:lang', set);
      return localStorage.getItem('dp:lang') || 'java';
    } catch (e) { return set || 'java'; }
  }

  // 代码卡片：切换语言（记住选择）、复制
  function bindCodeCard(root) {
    const card = root.querySelector('.code-card');
    if (!card) return;
    const show = lang => {
      card.querySelectorAll('.code-tabs button').forEach(b => b.classList.toggle('on', b.dataset.lang === lang));
      card.querySelectorAll('pre.code').forEach(pre => { pre.hidden = pre.dataset.lang !== lang; });
    };
    card.querySelectorAll('.code-tabs button').forEach(b => b.onclick = () => { codeLang(b.dataset.lang); show(b.dataset.lang); });
    const copy = card.querySelector('.code-copy');
    copy.onclick = () => {
      const text = card.querySelector('pre.code:not([hidden])').textContent;
      const done = () => { copy.textContent = '已复制 ✓'; setTimeout(() => { copy.textContent = '复制'; }, 1500); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, () => {});
      else {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { /* 浏览器不支持就算了 */ }
        ta.remove();
      }
    };
  }

  function infoCards(p) {
    const cards = [];
    if (p.story) cards.push(`<div class="ic"><h3>📖 书中的故事</h3><p>${inline(p.story)}</p></div>`);
    if (p.intent) cards.push(`<div class="ic"><h3>📐 定义</h3><p class="def">${inline(p.intent)}</p></div>`);
    if (p.analogy) cards.push(`<div class="ic"><h3>🏠 生活中的类比</h3><p>${inline(p.analogy)}</p></div>`);
    if (p.when && p.when.length) cards.push(`<div class="ic"><h3>✅ 什么时候用</h3><ul>${p.when.map(w => `<li>${inline(w)}</li>`).join('')}</ul></div>`);
    if (p.keyPoints && p.keyPoints.length) cards.push(`<div class="ic"><h3>🔑 关键要点</h3><ul>${p.keyPoints.map(w => `<li>${inline(w)}</li>`).join('')}</ul></div>`);
    if ((p.pros && p.pros.length) || (p.cons && p.cons.length)) {
      cards.push(`<div class="ic"><h3>⚖️ 优点与代价</h3><div class="pc">
        <div class="good"><h4>👍 优点</h4><ul>${(p.pros || []).map(w => `<li>${inline(w)}</li>`).join('')}</ul></div>
        <div class="bad"><h4>👎 代价</h4><ul>${(p.cons || []).map(w => `<li>${inline(w)}</li>`).join('')}</ul></div></div></div>`);
    }
    if (p.compare && p.compare.length) {
      cards.push(`<div class="ic cmp"><h3>🔀 别和它搞混</h3>${p.compare.map(c => {
        const o = DP.byId[c.id];
        return o ? `<a href="#/p/${o.id}"><b>${o.emoji || ''} ${esc(o.name)}</b>${inline(c.text)}</a>` : `<a><b>${esc(c.id)}</b>${inline(c.text)}</a>`;
      }).join('')}</div>`);
    }
    const codes = CODE_LANGS.filter(l => p[l.field]);
    if (codes.length) {
      const pick = codes.find(l => l.id === codeLang()) || codes[0];
      cards.push(`<div class="ic wide code-card"><h3>💻 代码骨架
        <span class="code-tabs" role="tablist">${codes.map(l => `<button role="tab" data-lang="${l.id}" class="${l === pick ? 'on' : ''}">${l.name}</button>`).join('')}</span>
        <button class="code-copy" title="复制代码">复制</button></h3>
        ${codes.map(l => `<pre class="code" data-lang="${l.id}"${l === pick ? '' : ' hidden'}>${highlight(p[l.field].replace(/^\n+|\s+$/g, ''), l.id)}</pre>`).join('')}</div>`);
    }
    // 让奇数张卡片时最后一张不孤零零
    const narrow = cards.filter(c => !c.includes('ic wide'));
    if (narrow.length % 2 === 1) {
      const last = narrow[narrow.length - 1];
      cards[cards.indexOf(last)] = last.replace('class="ic', 'class="ic wide');
    }
    return `<section class="info">${cards.join('')}</section>`;
  }

  /* ======================= 记忆测验 ======================= */

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  function pageQuiz() {
    setNav('quiz');
    document.title = '记忆测验 · 大话设计模式动画图解';
    const pool = [];
    DP.list.forEach(p => (p.quiz || []).forEach(q => pool.push(Object.assign({ a: p.id }, q))));
    const qs = shuffle(pool.filter(q => DP.byId[q.a])).slice(0, 10).map(q => {
      const ans = DP.byId[q.a];
      const sameKind = DP.list.filter(o => o.id !== ans.id && isPrinciple(o) === isPrinciple(ans));
      const preferred = shuffle((ans.compare || []).map(c => DP.byId[c.id]).filter(o => o && sameKind.includes(o))).slice(0, 2);
      const rest = shuffle(sameKind.filter(o => !preferred.includes(o)));
      const opts = shuffle([ans].concat(preferred, rest).slice(0, 4));
      return Object.assign({}, q, { ans, opts });
    });
    const st = { i: 0, score: 0, wrong: [] };

    function draw() {
      if (!qs.length) { app.innerHTML = '<div class="quiz"><div class="qcard">还没有题目。</div></div>'; return; }
      if (st.i >= qs.length) return result();
      const q = qs[st.i];
      app.innerHTML = `<div class="quiz">
        <div class="quiz-head"><h1>🎯 场景测验</h1><span>得分 <b>${st.score}</b> / ${qs.length}</span></div>
        <div class="qbar"><i style="width:${st.i / qs.length * 100}%"></i></div>
        <div class="qcard">
          <div class="qn">第 ${st.i + 1} 题 · 这个场景最适合用哪个？</div>
          <div class="qq">${inline(q.q)}</div>
          <div class="opts">${q.opts.map(o => `<button class="opt" data-id="${o.id}"><span class="e">${o.emoji || ''}</span><span>${esc(o.name)}</span></button>`).join('')}</div>
          <div class="qslot"></div>
        </div></div>`;
      app.querySelectorAll('.opt').forEach(b => b.onclick = () => answer(q, b));
    }
    function answer(q, btn) {
      const ok = btn.dataset.id === q.ans.id;
      if (ok) st.score++; else st.wrong.push(q.ans);
      app.querySelectorAll('.opt').forEach(b => {
        b.disabled = true;
        if (b.dataset.id === q.ans.id) b.classList.add('right');
        else if (b === btn) b.classList.add('wrong');
      });
      app.querySelector('.qslot').innerHTML = `
        <div class="qexp">${ok ? '✅ 答对了！' : '❌ 差一点。'} 正确答案是 <b>${esc(q.ans.name)}</b>：${inline(q.why || q.ans.mnemonic || '')}
          <br><a href="#/p/${q.ans.id}">去看「${esc(q.ans.name)}」的动画 →</a></div>
        <div class="qnext"><button class="btn primary">${st.i + 1 < qs.length ? '下一题 →' : '看结果'}</button></div>`;
      app.querySelector('.qnext button').onclick = () => { st.i++; draw(); };
      app.querySelector('.qnext button').focus();
    }
    function result() {
      const r = st.score / qs.length;
      const uniq = Array.from(new Set(st.wrong));
      app.innerHTML = `<div class="quiz"><div class="qcard qres">
        <div class="big">${st.score} / ${qs.length}</div>
        <p>${r === 1 ? '全对！这些模式已经刻进 DNA 了 🎉' : r >= 0.7 ? '很不错，再把错的几个复习一下就稳了 💪' : '别灰心，回去看看动画，再来一轮 📚'}</p>
        ${uniq.length ? `<div>建议复习：</div><ul>${uniq.map(p => `<li><a href="#/p/${p.id}"><b>${esc(p.name)}</b></a> —— ${inline(p.mnemonic || '')}</li>`).join('')}</ul>` : ''}
        <div><button class="btn primary again">再来一轮</button> <a class="btn" href="#/">回到首页</a></div>
      </div></div>`;
      app.querySelector('.again').onclick = pageQuiz;
    }
    draw();
  }

  /* ======================= 联系表：一次看全部帧（开发校对用） ======================= */

  function pageSheet(p) {
    setNav('');
    const c = DP.engine.compile(p);
    app.innerHTML = `<div class="t-${p.type}"><h2 style="margin:0 0 12px">${esc(p.name)} · 全部 ${c.frames.length} 帧</h2><div class="sheet">${c.frames.map((F, k) =>
      `<div class="cell"><div class="sh" data-k="${k}"></div><p><b>${k + 1}. ${esc(F.title)}</b>　${inline(F.text)}</p></div>`).join('')}</div></div>`;
    app.querySelectorAll('.sh').forEach(host => {
      const k = +host.dataset.k;
      const st = new DP.engine.Stage(host, c);
      st.render(k, c.frames[k].settle, { sheet: true });
    });
  }

  window.addEventListener('hashchange', route);
  route();
})();
