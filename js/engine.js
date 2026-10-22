/*
 * 逐帧动画引擎
 * ----------------------------------------------------------------
 * 一个模式 = 一组「角色」(nodes) + 「连线」(links) + 若干「帧」(frames)。
 * 每一帧描述相对上一帧的变化（显示/隐藏/移动/改字），以及只在本帧出现的
 * 高亮(focus)、消息流(flows)、气泡(bubbles)。
 *
 * 引擎把所有帧预先“编译”成每帧的完整状态，于是任意时刻 t 的画面都可以
 * 由「上一帧状态 → 本帧状态」插值得到：这样进度条可以随意拖动、倒退、暂停。
 * 字段说明见 AUTHORING.md。
 */
(function () {
  'use strict';

  const W = 1000, H = 560;
  const DEF = { trans: 0.8, flowDur: 1.0, flowGap: 1.15, charSec: 0.14, minRead: 3.2, maxRead: 15 };

  const TONES = {
    blue: '#3b82f6', green: '#10b981', orange: '#f59e0b', purple: '#8b5cf6', red: '#ef4444',
    gray: '#94a3b8', teal: '#14b8a6', pink: '#ec4899', indigo: '#6366f1', yellow: '#eab308',
  };
  const LINE = '#64748b', HI = '#f97316';

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const easeOut = t => { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); };
  const clone = o => JSON.parse(JSON.stringify(o));
  const { esc, inline, plain } = DP.util;

  const CONTENT_KEYS = ['kind', 'title', 'label', 'sub', 'stereo', 'lines', 'icon', 'tone', 'badge', 'badgeTone', 'w', 'h', 'text', 'size', 'shape', 'strike', 'mono'];
  const sig = n => JSON.stringify(CONTENT_KEYS.map(k => n[k]));

  /* ---------------- 编译：把增量帧展开成完整状态 ---------------- */

  function compile(p) {
    const warn = (k, msg) => console.warn(`[DP:${p.id}] 第${k + 1}帧：${msg}`);
    const nodes = p.nodes || {}, links = p.links || {};
    let S = { n: {}, l: {} };
    for (const id in nodes) {
      S.n[id] = Object.assign({ x: W / 2, y: H / 2, scale: 1, opacity: 1, kind: 'box', tone: 'blue' }, nodes[id]);
      S.n[id].vis = nodes[id].visible ? 1 : 0;
    }
    for (const id in links) {
      S.l[id] = Object.assign({ kind: 'assoc' }, links[id]);
      S.l[id].vis = links[id].visible ? 1 : 0;
      if (!S.n[S.l[id].from] || !S.n[S.l[id].to]) console.warn(`[DP:${p.id}] 连线 ${id} 的端点不存在`);
    }
    const S0 = clone(S);
    const V0 = visual(S, new Set(), false);

    let start = 0;
    const frames = (p.frames || []).map((f, k) => {
      S = clone(S);
      const setVis = (id, v) => {
        if (S.n[id]) S.n[id].vis = v; else if (S.l[id]) S.l[id].vis = v; else warn(k, '未知 id ' + id);
      };
      if (f.clear) { for (const id in S.n) S.n[id].vis = 0; for (const id in S.l) S.l[id].vis = 0; }
      (f.hide || []).forEach(id => setVis(id, 0));
      (f.show || []).forEach(id => setVis(id, 1));
      for (const id in (f.set || {})) {
        const tgt = S.n[id] || S.l[id];
        if (tgt) Object.assign(tgt, f.set[id]); else warn(k, 'set 了未知 id ' + id);
      }
      const focus = new Set(f.focus || []);
      focus.forEach(id => { if (!S.n[id] && !S.l[id]) warn(k, 'focus 了未知 id ' + id); });

      const T = f.trans != null ? f.trans : DEF.trans;
      const gap = f.flowGap != null ? f.flowGap : DEF.flowGap;
      const stepStart = s => T * 0.75 + s * gap;
      const flows = (f.flows || []).map((fl, i) => {
        if (!S.n[fl.from] || !S.n[fl.to]) warn(k, `flow 端点不存在 ${fl.from}→${fl.to}`);
        const step = fl.step != null ? fl.step : i;
        return Object.assign({}, fl, { t0: stepStart(step) + (fl.delay || 0), d: fl.dur || DEF.flowDur });
      });
      const bubbles = (f.bubbles || []).map(b => {
        if (!S.n[b.node]) warn(k, 'bubble 指向未知节点 ' + b.node);
        const t0 = b.step != null ? stepStart(b.step) + DEF.flowDur * 0.85 : T * 0.55;
        return Object.assign({}, b, { t0: t0 + (b.delay || 0) });
      });
      let settle = T;
      flows.forEach(x => { settle = Math.max(settle, x.t0 + x.d + 0.3); });
      bubbles.forEach(b => { settle = Math.max(settle, b.t0 + 0.35); });
      settle += 0.1;
      const read = clamp(plain(f.text).length * DEF.charSec, DEF.minRead, DEF.maxRead);
      const dur = f.dur || Math.max(settle + 1.6, T + read);
      const fr = {
        k, title: f.title || '', text: f.text || '',
        S: clone(S), V: visual(S, focus, f.dim !== false),
        T, flows, bubbles, settle, dur, start,
      };
      start += dur;
      return fr;
    });
    return { p, S0, V0, frames, total: start };
  }

  function visual(S, focus, dim) {
    const any = dim && focus.size > 0;
    const V = { n: {}, l: {} };
    for (const id in S.n) {
      const s = S.n[id], f = focus.has(id);
      const dimF = any && !f ? (s.kind === 'zone' ? 0.6 : 0.3) : 1;
      V.n[id] = { x: s.x, y: s.y, o: s.vis * s.opacity * dimF, v: s.vis * s.opacity, sc: s.scale * (s.vis ? 1 : 0.8), f: f && s.vis ? 1 : 0 };
    }
    for (const id in S.l) {
      const s = S.l[id], a = S.n[s.from], b = S.n[s.to];
      const v = s.vis * (a ? a.vis : 0) * (b ? b.vis : 0);
      const f = focus.has(id) || (focus.has(s.from) && focus.has(s.to));
      V.l[id] = { r: v, o: v * (s.opacity != null ? s.opacity : 1) * (any && !f ? 0.25 : 1), f: f && v ? 1 : 0 };
    }
    return V;
  }

  /* ---------------- 几何 ---------------- */

  function edgePoint(g, tx, ty, pad) {
    const dx = tx - g.x, dy = ty - g.y;
    if (!dx && !dy) return { x: g.x, y: g.y };
    const hw = g.w / 2 + pad, hh = g.h / 2 + pad;
    const s = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
    return { x: g.x + dx * s, y: g.y + dy * s };
  }
  function geom(a, b, curve, padA = 5, padB = 5) {
    let c = null;
    if (curve) {
      const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
      c = { x: (a.x + b.x) / 2 - (dy / len) * curve, y: (a.y + b.y) / 2 + (dx / len) * curve };
    }
    const p0 = edgePoint(a, c ? c.x : b.x, c ? c.y : b.y, padA);
    const p1 = edgePoint(b, c ? c.x : a.x, c ? c.y : a.y, padB);
    return { p0, p1, c };
  }
  function pointAt(g, t) {
    if (!g.c) return { x: lerp(g.p0.x, g.p1.x, t), y: lerp(g.p0.y, g.p1.y, t) };
    const u = 1 - t;
    return {
      x: u * u * g.p0.x + 2 * u * t * g.c.x + t * t * g.p1.x,
      y: u * u * g.p0.y + 2 * u * t * g.c.y + t * t * g.p1.y,
    };
  }
  const f1 = n => Math.round(n * 10) / 10;
  function partialPath(g, r) {
    const q = pointAt(g, r);
    if (!g.c) return `M${f1(g.p0.x)},${f1(g.p0.y)} L${f1(q.x)},${f1(q.y)}`;
    const q1 = { x: lerp(g.p0.x, g.c.x, r), y: lerp(g.p0.y, g.c.y, r) };
    return `M${f1(g.p0.x)},${f1(g.p0.y)} Q${f1(q1.x)},${f1(q1.y)} ${f1(q.x)},${f1(q.y)}`;
  }

  /* ---------------- 全局 SVG 箭头定义（只注入一次） ---------------- */

  const MARK_SHAPES = {
    tri: { d: 'M1,1 L15,8 L1,15 Z', w: 16, ref: 15, fill: '#fff' },
    open: { d: 'M2,2 L14,8 L2,14', w: 16, ref: 14, fill: 'none' },
    solid: { d: 'M1,2 L13,8 L1,14 Z', w: 16, ref: 12, fill: 'C' },
    dia: { d: 'M1,8 L9,3 L17,8 L9,13 Z', w: 18, ref: 1, fill: '#fff' },
    diaf: { d: 'M1,8 L9,3 L17,8 L9,13 Z', w: 18, ref: 1, fill: 'C' },
  };
  function ensureDefs() {
    if (document.getElementById('dp-defs')) return;
    const colors = Object.assign({ base: LINE, hi: HI }, TONES);
    let s = '<svg id="dp-defs" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>';
    for (const cn in colors) {
      const col = colors[cn];
      for (const sn in MARK_SHAPES) {
        const m = MARK_SHAPES[sn];
        const fill = m.fill === 'C' ? col : m.fill;
        s += `<marker id="mk-${sn}-${cn}" viewBox="0 0 ${m.w} 16" refX="${m.ref}" refY="8" markerWidth="${m.w}" markerHeight="16" ` +
          `markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="${m.d}" fill="${fill}" stroke="${col}" stroke-width="1.8" stroke-linejoin="round"/></marker>`;
      }
    }
    s += '</defs></svg>';
    document.body.insertAdjacentHTML('beforeend', s);
  }
  // 连线种类 → [是否虚线, 起点标记, 终点标记]
  const LINK_KINDS = {
    inherit: [0, null, 'tri'], implement: [1, null, 'tri'],
    assoc: [0, null, 'open'], depend: [1, null, 'open'],
    aggregate: [0, 'dia', 'open'], compose: [0, 'diaf', 'open'],
    arrow: [0, null, 'solid'], dashed: [1, null, 'solid'],
    line: [0, null, null], dotted: [1, null, null],
  };

  /* ---------------- 舞台：负责把某一时刻画出来 ---------------- */

  function nodeHTML(s) {
    const bt = s.badgeTone || (/^[✓✔√]/.test(String(s.badge)) ? 'green' : '');
    const badge = s.badge != null && s.badge !== '' ? `<div class="badge${bt ? ' bt-' + bt : ''}">${esc(s.badge)}</div>` : '';
    switch (s.kind) {
      case 'class': {
        const lines = s.lines && s.lines.length ? `<div class="lines">${s.lines.map(l => l[0] === '!' ? `<div class="hl">${esc(l.slice(1))}</div>` : `<div>${esc(l)}</div>`).join('')}</div>` : '';
        return `<div class="hd">${s.stereo ? `<div class="stereo">«${esc(s.stereo)}»</div>` : ''}` +
          `<div class="title">${esc(s.title || s.label || '')}</div>${s.sub ? `<div class="sub">${inline(s.sub)}</div>` : ''}</div>${lines}${badge}`;
      }
      case 'actor':
        return `<div class="avatar">${esc(s.icon || '🙂')}${badge}</div><div class="label">${inline(s.label || '')}</div>` +
          (s.sub ? `<div class="sub">${inline(s.sub)}</div>` : '');
      case 'text':
        return inline(s.text || s.label || '') + badge;
      case 'zone':
        return `<div class="zone-label">${inline(s.label || '')}</div>${badge}`;
      default: // box
        return (s.icon ? `<div class="icon">${esc(s.icon)}</div>` : '') +
          `<div class="body"><div class="label">${inline(s.label || '')}</div>${s.sub ? `<div class="sub">${inline(s.sub)}</div>` : ''}</div>${badge}`;
    }
  }
  function nodeClass(s) {
    let c = `node k-${s.kind || 'box'} tone-${s.tone || 'blue'}`;
    if (s.stereo === 'interface') c += ' is-interface';
    if (s.stereo === 'abstract') c += ' is-abstract';
    if (s.strike) c += ' is-strike';
    if (s.shape) c += ' shape-' + s.shape;
    if (s.size) c += ' size-' + s.size;
    if (s.mono) c += ' is-mono';
    return c;
  }

  class Stage {
    constructor(host, compiled) {
      ensureDefs();
      this.c = compiled;
      this.k = -1;
      host.innerHTML =
        `<div class="stage-wrap"><div class="stage">` +
        `<div class="layer zones"></div>` +
        `<svg class="layer svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><g class="links"></g><g class="trails"></g></svg>` +
        `<div class="layer nodes"></div><div class="layer flows"></div><div class="layer bubbles"></div>` +
        `<div class="caption"><b class="cap-num"></b><span class="cap-title"></span></div>` +
        `</div></div>`;
      this.wrap = host.querySelector('.stage-wrap');
      this.stage = host.querySelector('.stage');
      this.gLinks = host.querySelector('g.links');
      this.gTrails = host.querySelector('g.trails');
      this.lFlows = host.querySelector('.layer.flows');
      this.lBubbles = host.querySelector('.layer.bubbles');
      this.capNum = host.querySelector('.cap-num');
      this.capTitle = host.querySelector('.cap-title');

      this.nodes = {};
      const S0 = compiled.S0;
      for (const id in S0.n) {
        const el = document.createElement('div');
        el.dataset.id = id;
        (S0.n[id].kind === 'zone' ? host.querySelector('.layer.zones') : host.querySelector('.layer.nodes')).appendChild(el);
        this.nodes[id] = el;
      }
      this.links = {};
      for (const id in S0.l) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.innerHTML = '<path class="ln"/><text class="lbl" text-anchor="middle" dominant-baseline="central"></text>';
        this.gLinks.appendChild(g);
        this.links[id] = { g, path: g.firstChild, text: g.lastChild, sig: '' };
      }
      this.geo = {};
      this.fit = this.fit.bind(this);
      if (window.ResizeObserver) { this.ro = new ResizeObserver(this.fit); this.ro.observe(this.wrap); }
      window.addEventListener('resize', this.fit);
      this.fit();
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => { for (const id in this.nodes) this.nodes[id]._sig = null; if (this.last) this.render(...this.last); });
      }
    }

    fit() {
      const w = this.wrap.clientWidth, h = this.wrap.clientHeight;
      if (!w || !h) return;
      const s = Math.min(w / W, h / H);
      this.stage.style.transform = `translate(${(w - W * s) / 2}px, ${(h - H * s) / 2}px) scale(${s})`;
    }

    destroy() {
      if (this.ro) this.ro.disconnect();
      window.removeEventListener('resize', this.fit);
    }

    setFrame(k) {
      this.k = k;
      const F = this.c.frames[k];
      this.capNum.textContent = k + 1;
      this.capTitle.textContent = F.title;
      this.gTrails.innerHTML = '';
      this.lFlows.innerHTML = '';
      this.lBubbles.innerHTML = '';
      this.flowEls = F.flows.map(fl => {
        const tone = fl.back ? (fl.tone || 'gray') : (fl.tone || 'orange');
        const el = document.createElement('div');
        el.className = `flow tone-${tone}${fl.back ? ' is-back' : ''}`;
        el.innerHTML = (fl.icon ? `<span class="fi">${esc(fl.icon)}</span>` : '') + (fl.label ? `<span>${inline(fl.label)}</span>` : '');
        if (!fl.icon && !fl.label) el.classList.add('is-dot');
        this.lFlows.appendChild(el);
        const tr = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        tr.setAttribute('class', 'trail' + (fl.back ? ' is-back' : ''));
        tr.setAttribute('stroke', TONES[tone] || HI);
        tr.setAttribute('marker-end', `url(#mk-solid-${TONES[tone] ? tone : 'hi'})`);
        this.gTrails.appendChild(tr);
        return { el, tr };
      });
      this.bubbleEls = F.bubbles.map(b => {
        const el = document.createElement('div');
        el.className = `bubble side-${b.side || 'top'} tone-${b.tone || 'gray'}`;
        el.innerHTML = inline(b.text || '');
        this.lBubbles.appendChild(el);
        return el;
      });
    }

    /* 画出第 k 帧、帧内时间 lt 的画面。opt.sheet=true 时用于静态预览（消息流停在路径中段）。 */
    render(k, lt, opt = {}) {
      const c = this.c, F = c.frames[k];
      if (!F) return;
      this.last = [k, lt, opt];
      if (k !== this.k) this.setFrame(k);
      const A = k > 0 ? c.frames[k - 1].V : c.V0, B = F.V;
      const SA = k > 0 ? c.frames[k - 1].S : c.S0, SB = F.S;
      const e = ease(lt / F.T);

      for (const id in this.nodes) {
        const el = this.nodes[id], a = A.n[id], b = B.n[id];
        const s = (b.o > 0 || a.o === 0) ? SB.n[id] : SA.n[id];
        const sg = sig(s);
        if (el._sig !== sg) {
          el._sig = sg;
          el.className = nodeClass(s);
          el.innerHTML = nodeHTML(s);
          el.style.width = s.w ? s.w + 'px' : '';
          el.style.height = s.h && (s.kind === 'zone' || s.kind === 'box') ? s.h + 'px' : '';
          el._w = 0;
        }
        if (!el._w) { el._w = el.offsetWidth; el._h = el.offsetHeight; if (!el._w) el._sig = null; }
        const x = lerp(a.x, b.x, e), y = lerp(a.y, b.y, e);
        const o = lerp(a.o, b.o, e), sc = lerp(a.sc, b.sc, e), f = lerp(a.f, b.f, e);
        this.geo[id] = { x, y, w: el._w * sc, h: el._h * sc, o, v: lerp(a.v, b.v, e) };
        el.style.transform = `translate(${f1(x - el._w / 2)}px,${f1(y - el._h / 2)}px) scale(${sc.toFixed(3)})`;
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o < 0.01 ? 'hidden' : '';
        el.style.setProperty('--f', f.toFixed(3));
        el.classList.toggle('has-f', f > 0.01);
      }

      for (const id in this.links) {
        const L = this.links[id], a = A.l[id], b = B.l[id];
        const s = (b.o > 0 || a.o === 0) ? SB.l[id] : SA.l[id];
        const r = lerp(a.r, b.r, e), o = lerp(a.o, b.o, e), f = lerp(a.f, b.f, e);
        if (o < 0.01 || r < 0.01) { L.g.style.display = 'none'; continue; }
        L.g.style.display = '';
        const ga = this.geo[s.from], gb = this.geo[s.to];
        if (!ga || !gb) continue;
        const g = geom(ga, gb, s.curve || 0);
        const kind = LINK_KINDS[s.kind] || LINK_KINDS.assoc;
        const cn = f > 0.5 ? 'hi' : (s.tone && TONES[s.tone] ? s.tone : 'base');
        const lsig = s.kind + cn + (s.label || '');
        if (L.sig !== lsig) {
          L.sig = lsig;
          L.g.setAttribute('class', `link lk-${s.kind}${f > 0.5 ? ' is-hi' : ''}`);
          L.path.setAttribute('stroke', cn === 'hi' ? HI : cn === 'base' ? LINE : TONES[cn]);
          L.path.setAttribute('stroke-dasharray', kind[0] ? '7 6' : '');
          if (kind[1]) L.path.setAttribute('marker-start', `url(#mk-${kind[1]}-${cn})`); else L.path.removeAttribute('marker-start');
          if (kind[2]) L.path.setAttribute('marker-end', `url(#mk-${kind[2]}-${cn})`); else L.path.removeAttribute('marker-end');
          L.text.textContent = s.label || '';
        }
        L.path.setAttribute('d', partialPath(g, r));
        L.g.style.opacity = o.toFixed(3);
        if (s.label) {
          const m = pointAt(g, s.labelAt != null ? s.labelAt : 0.5);
          L.text.setAttribute('x', f1(m.x + (s.labelDx || 0)));
          L.text.setAttribute('y', f1(m.y + (s.labelDy || 0)));
          L.text.style.opacity = clamp((r - 0.6) / 0.4, 0, 1);
        }
      }

      F.flows.forEach((fl, i) => {
        const { el, tr } = this.flowEls[i];
        const ga = this.geo[fl.from], gb = this.geo[fl.to];
        let u = (lt - fl.t0) / fl.d, op;
        if (opt.sheet) { u = fl.stay ? 1 : 0.62; op = 1; } else {
          op = clamp(u * 6, 0, 1);
          if (!fl.stay) op *= 1 - clamp((lt - fl.t0 - fl.d - 0.25) / 0.3, 0, 1);
        }
        if (u <= 0 || op <= 0.01 || !ga || !gb) { el.style.opacity = 0; tr.style.opacity = 0; return; }
        const g = geom(ga, gb, fl.curve != null ? fl.curve : (fl.back ? 28 : 0), 4, 8);
        const pr = opt.sheet ? u : ease(u);
        const pos = pointAt(g, pr);
        el.style.transform = `translate(${f1(pos.x)}px,${f1(pos.y)}px) translate(-50%,-50%)`;
        el.style.opacity = op.toFixed(3);
        tr.setAttribute('d', partialPath(g, pr));
        tr.style.opacity = (op * 0.85).toFixed(3);
      });

      F.bubbles.forEach((b, i) => {
        const el = this.bubbleEls[i], g = this.geo[b.node];
        const op = g ? (opt.sheet ? 1 : easeOut((lt - b.t0) / 0.35)) * clamp(g.v * 1.4, 0, 1) : 0; // 气泡不随“变淡”而变淡
        if (op <= 0.01) { el.style.opacity = 0; el.style.visibility = 'hidden'; return; }
        const side = b.side || 'top', gap = 12;
        let x = g.x, y = g.y, tf;
        if (side === 'top') { y -= g.h / 2 + gap; tf = 'translate(-50%,-100%)'; }
        else if (side === 'bottom') { y += g.h / 2 + gap; tf = 'translate(-50%,0)'; }
        else if (side === 'left') { x -= g.w / 2 + gap; tf = 'translate(-100%,-50%)'; }
        else { x += g.w / 2 + gap; tf = 'translate(0,-50%)'; }
        x += b.dx || 0; y += b.dy || 0;
        el.style.visibility = '';
        el.style.opacity = op.toFixed(3);
        el.style.transform = `translate(${f1(x)}px,${f1(y)}px) ${tf} scale(${(0.9 + 0.1 * op).toFixed(3)})`;
      });
    }
  }

  /* ---------------- 播放器：时间轴 + 控制条 ---------------- */

  const ICONS = {
    play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><rect x="5.5" y="4" width="4.5" height="16" rx="1.2" fill="currentColor"/><rect x="14" y="4" width="4.5" height="16" rx="1.2" fill="currentColor"/></svg>',
    prev: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    first: '<svg viewBox="0 0 24 24"><path d="M6 5v14M18 5l-8 7 8 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    replay: '<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.6-5.9M4 4v5h5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    voice: '<svg viewBox="0 0 24 24"><path d="M4 9.5v5h3.5L13 19V5L7.5 9.5H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    full: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };
  const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

  class Player {
    constructor(host, pattern, opts = {}) {
      this.p = pattern;
      this.opts = opts;
      this.c = compile(pattern);
      this.N = this.c.frames.length;
      this.t = 0; this.k = -1;
      this.playing = false; this.stopAt = null; this.ended = false;
      this.speed = opts.speed || 1;
      this.tts = false; this.speaking = false; this.speakToken = 0;

      host.innerHTML =
        `<div class="player">` +
        `<div class="stage-host"></div>` +
        `<div class="controls">` +
        `<div class="tl" role="slider" tabindex="0" aria-label="动画进度（按帧）" aria-valuemin="1" aria-valuemax="${this.N}">` +
        `<div class="tl-segs">${this.c.frames.map((F, i) => `<div class="tl-seg" data-k="${i}"><i></i></div>`).join('')}</div>` +
        `<div class="tl-thumb"></div><div class="tl-tip"></div></div>` +
        `<div class="ctl-row">` +
        `<button class="ib" data-a="first" title="回到第一帧 (Home)">${ICONS.first}</button>` +
        `<button class="ib" data-a="prev" title="上一帧 (←)">${ICONS.prev}</button>` +
        `<button class="ib big" data-a="toggle" title="播放 / 暂停 (空格)">${ICONS.play}</button>` +
        `<button class="ib" data-a="next" title="下一帧 (→)">${ICONS.next}</button>` +
        `<button class="ib" data-a="replay" title="重播本帧 (R)">${ICONS.replay}</button>` +
        `<span class="fc">第 <b class="fc-k">1</b> / ${this.N} 帧</span>` +
        `<span class="sp"></span>` +
        `<label class="speed" title="播放速度">速度 <select>${SPEEDS.map(s => `<option value="${s}"${s === this.speed ? ' selected' : ''}>${s}×</option>`).join('')}</select></label>` +
        `<button class="ib tog" data-a="tts" title="朗读讲解词（浏览器语音）">${ICONS.voice}<span>朗读</span></button>` +
        `<button class="ib" data-a="full" title="全屏 (F)">${ICONS.full}</button>` +
        `</div></div></div>`;
      this.root = host.querySelector('.player');
      this.stage = new Stage(host.querySelector('.stage-host'), this.c);
      this.tl = host.querySelector('.tl');
      this.segs = Array.from(host.querySelectorAll('.tl-seg i'));
      this.segEls = Array.from(host.querySelectorAll('.tl-seg'));
      this.thumb = host.querySelector('.tl-thumb');
      this.tip = host.querySelector('.tl-tip');
      this.fcK = host.querySelector('.fc-k');
      this.btnToggle = host.querySelector('[data-a=toggle]');
      this.btnTts = host.querySelector('[data-a=tts]');
      if (!window.speechSynthesis) this.btnTts.style.display = 'none';

      host.querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', () => this.action(b.dataset.a)));
      host.querySelector('.speed select').addEventListener('change', ev => this.setSpeed(+ev.target.value));
      this.bindTimeline();
      this._step = this._step.bind(this);
      this.render();
    }

    action(a) {
      ({
        first: () => this.stepTo(0), prev: () => this.prev(), next: () => this.next(), replay: () => this.stepTo(this.k),
        toggle: () => this.toggle(), tts: () => this.toggleTts(), full: () => this.fullscreen(),
      })[a]();
    }

    /* ----- 时间换算 ----- */
    frameAt(t) {
      const fr = this.c.frames;
      let k = 0;
      while (k < fr.length - 1 && t >= fr[k + 1].start) k++;
      return k;
    }
    get u() {
      const k = this.frameAt(this.t), F = this.c.frames[k];
      return k + clamp((this.t - F.start) / F.dur, 0, 1);
    }
    tFromU(u) {
      u = clamp(u, 0, this.N);
      const k = Math.min(this.N - 1, Math.floor(u)), F = this.c.frames[k];
      return F.start + (u - k) * F.dur - (u >= this.N ? 1e-4 : 0);
    }

    /* ----- 播放控制 ----- */
    play() {
      if (!this.N) return;
      if (this.ended || this.t >= this.c.total - 0.02) { this.t = 0; this.ended = false; this.k = -1; }
      this.stopAt = null;
      this.playing = true;
      this.updateButtons();
      if (this.tts) this.speak(this.c.frames[this.frameAt(this.t)].text);
      this.loop();
    }
    pause() {
      this.playing = false; this.stopAt = null;
      this.stopSpeak();
      this.updateButtons();
    }
    toggle() { (this.playing && this.stopAt == null) ? this.pause() : this.play(); }

    /* 跳到第 k 帧并播放这一帧的过渡动画；暂停状态下播完过渡就停住 */
    stepTo(k) {
      k = clamp(k, 0, this.N - 1);
      const F = this.c.frames[k];
      const continuous = this.playing && this.stopAt == null;
      this.ended = false;
      this.t = F.start;
      if (!continuous) this.stopAt = F.start + F.settle;
      this.playing = true;
      this.k = -1; // 强制触发帧切换（朗读等）
      this.render();
      this.updateButtons();
      this.loop();
    }
    next() { const k = this.frameAt(this.t); if (k < this.N - 1) this.stepTo(k + 1); else this.stepTo(k); }
    prev() { this.stepTo(this.frameAt(this.t) - 1); }

    /* 直接定位到某帧“已就绪”的静止画面（不播放） */
    showFrame(k) {
      k = clamp(k, 0, this.N - 1);
      this.pause();
      const F = this.c.frames[k];
      this.t = F.start + F.settle;
      this.render();
    }

    setSpeed(s) { this.speed = s; }

    loop() {
      if (this.raf) return;
      this.lastTs = performance.now();
      this.raf = requestAnimationFrame(this._step);
    }
    _step(now) {
      this.raf = 0;
      if (!this.playing) return;
      const dt = Math.min(0.1, (now - this.lastTs) / 1000) * this.speed;
      this.lastTs = now;
      let t = this.t + dt;
      const k = this.frameAt(this.t), F = this.c.frames[k];
      const end = F.start + F.dur;
      // 朗读没结束就在帧尾等一等
      if (this.stopAt == null && this.tts && this.speaking && t > end - 0.03 && performance.now() - this.speakAt < this.speakMax) {
        t = Math.max(this.t, end - 0.03);
      }
      if (this.stopAt != null && t >= this.stopAt) {
        this.t = this.stopAt; this.render(); this.playing = false; this.stopAt = null; this.updateButtons(); return;
      }
      if (t >= this.c.total) {
        this.t = this.c.total; this.render(); this.playing = false; this.ended = true; this.updateButtons();
        if (this.opts.onEnd) this.opts.onEnd();
        return;
      }
      this.t = t;
      this.render();
      this.raf = requestAnimationFrame(this._step);
    }

    render() {
      if (!this.N) return;
      const t = Math.min(this.t, this.c.total);
      const k = this.frameAt(t), F = this.c.frames[k];
      const lt = t - F.start;
      this.stage.render(k, lt);
      if (k !== this.k) {
        this.k = k;
        this.fcK.textContent = k + 1;
        this.tl.setAttribute('aria-valuenow', k + 1);
        this.segEls.forEach((s, i) => s.classList.toggle('cur', i === k));
        if (this.tts && this.playing) this.speak(F.text);
        if (this.opts.onFrame) this.opts.onFrame(k, F);
      }
      const u = this.u;
      this.segs.forEach((s, i) => { s.style.width = (clamp(u - i, 0, 1) * 100).toFixed(2) + '%'; });
      this.thumb.style.left = (u / this.N * 100).toFixed(3) + '%';
    }

    updateButtons() {
      const on = this.playing && this.stopAt == null;
      this.btnToggle.innerHTML = on ? ICONS.pause : ICONS.play;
      this.btnToggle.classList.toggle('on', on);
      this.root.classList.toggle('is-playing', on);
    }

    /* ----- 进度条拖动 ----- */
    bindTimeline() {
      const tl = this.tl;
      const uAt = ev => {
        const r = tl.getBoundingClientRect();
        return clamp((ev.clientX - r.left) / r.width, 0, 1) * this.N;
      };
      let drag = false, resume = false;
      tl.addEventListener('pointerdown', ev => {
        drag = true; resume = this.playing && this.stopAt == null;
        this.playing = false; this.stopAt = null; this.ended = false;
        this.stopSpeak(); this.updateButtons();
        tl.setPointerCapture(ev.pointerId);
        tl.classList.add('dragging');
        this.t = this.tFromU(uAt(ev)); this.render();
      });
      tl.addEventListener('pointermove', ev => {
        const u = uAt(ev), k = Math.min(this.N - 1, Math.floor(u));
        this.tip.textContent = `第 ${k + 1} 帧 · ${this.c.frames[k].title}`;
        this.tip.style.left = (u / this.N * 100) + '%';
        if (!drag) return;
        this.t = this.tFromU(u); this.render();
      });
      const up = () => {
        if (!drag) return;
        drag = false; tl.classList.remove('dragging');
        if (resume) this.play();
      };
      tl.addEventListener('pointerup', up);
      tl.addEventListener('pointercancel', up);
      tl.addEventListener('keydown', ev => {
        if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') { ev.preventDefault(); ev.stopPropagation(); ev.key === 'ArrowLeft' ? this.prev() : this.next(); }
      });
    }

    handleKey(ev) {
      if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
      const tag = (ev.target && ev.target.tagName) || '';
      if (/INPUT|SELECT|TEXTAREA/.test(tag)) return;
      const map = {
        ' ': () => this.toggle(), ArrowRight: () => this.next(), ArrowLeft: () => this.prev(),
        Home: () => this.stepTo(0), End: () => this.stepTo(this.N - 1),
        r: () => this.stepTo(this.k), R: () => this.stepTo(this.k), f: () => this.fullscreen(), F: () => this.fullscreen(),
      };
      if (map[ev.key]) {
        if (ev.key === ' ' && /BUTTON/.test(tag)) ev.target.blur();
        ev.preventDefault(); map[ev.key]();
      }
    }

    fullscreen() {
      const el = this.opts.fullscreenEl || this.root;
      if (document.fullscreenElement) document.exitFullscreen();
      else if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    }

    /* ----- 朗读（Web Speech API） ----- */
    toggleTts() {
      this.tts = !this.tts;
      this.btnTts.classList.toggle('on', this.tts);
      if (this.tts) {
        const F = this.c.frames[this.frameAt(this.t)];
        this.speak(F.text);
        if (!this.playing) this.play();
      } else this.stopSpeak();
    }
    voice() {
      const vs = window.speechSynthesis.getVoices();
      return vs.find(v => /zh[-_]CN/i.test(v.lang)) || vs.find(v => /^zh/i.test(v.lang)) || null;
    }
    speak(text) {
      const ss = window.speechSynthesis;
      if (!ss) return;
      ss.cancel();
      const token = ++this.speakToken;
      const msg = plain(text);
      this.speaking = true;
      this.speakAt = performance.now();
      this.speakMax = msg.length * 450 + 4000; // 兜底：语音引擎异常时不会无限等待
      setTimeout(() => {
        if (token !== this.speakToken) return;
        const u = new SpeechSynthesisUtterance(msg);
        u.lang = 'zh-CN';
        u.rate = clamp(this.speed * 1.1, 0.6, 2);
        const v = this.voice();
        if (v) u.voice = v;
        u.onend = u.onerror = () => { if (token === this.speakToken) this.speaking = false; };
        ss.speak(u);
      }, 60);
    }
    stopSpeak() {
      this.speakToken++;
      this.speaking = false;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    }

    destroy() {
      this.playing = false;
      if (this.raf) cancelAnimationFrame(this.raf);
      this.stopSpeak();
      this.stage.destroy();
    }
  }

  DP.engine = { compile, Stage, Player, W, H, DEF, TONES };
})();
