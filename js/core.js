/* 全局注册表 + 小工具。所有 patterns/*.js 都通过 DP.register(...) 注册自己。 */
window.DP = (function () {
  'use strict';

  const TYPES = {
    creational: { name: '创建型', color: '#10b981', desc: '关心“怎么造对象”——把 new 的活儿管起来' },
    structural: { name: '结构型', color: '#3b82f6', desc: '关心“怎么搭结构”——把类和对象组装成更大的结构' },
    behavioral: { name: '行为型', color: '#8b5cf6', desc: '关心“怎么分工协作”——对象之间如何沟通、分配职责' },
    principle: { name: '设计原则', color: '#f59e0b', desc: '一切模式背后的“内功心法”' },
  };

  const list = [];
  const byId = {};

  function register(p) {
    if (!p || !p.id) { console.error('[DP] pattern 缺少 id', p); return; }
    if (byId[p.id]) console.warn('[DP] 重复注册', p.id);
    list.push(p);
    byId[p.id] = p;
  }

  function sorted() {
    return list.slice().sort((a, b) => (a.order - b.order) || String(a.id).localeCompare(b.id));
  }

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ESC[c]); }

  // 迷你标记：**粗体**  ==高亮==  `代码`  以及换行
  function inline(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/==(.+?)==/g, '<mark>$1</mark>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }
  function plain(s) { return String(s || '').replace(/\*\*|==|`/g, ''); }

  // 极简代码高亮：Java / Python / Go。正则分组依次为：注释、字符串、数字、注解/装饰器、单词
  const words = s => new Set(s.split(' '));
  const LANGS = {
    java: {
      re: /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])')|(\b\d+(?:\.\d+)?\b)|(@\w+)|(\b[A-Za-z_][A-Za-z0-9_]*\b)/g,
      kw: words('abstract class interface extends implements public private protected static final void new return if else for while ' +
        'switch case default break continue this super null true false int long double float boolean char var import package try catch finally ' +
        'throw throws synchronized volatile instanceof enum record'),
      types: words('String Object List ArrayList Map HashMap Integer Double Boolean System Math'),
    },
    python: {
      re: /(#[^\n]*)|([rRbBfFuU]{0,2}(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'))|(\b\d+(?:\.\d+)?\b)|(@[\w.]+)|(\b[A-Za-z_][A-Za-z0-9_]*\b)/g,
      kw: words('def class return if elif else for while in not and or is None True False import from as pass raise try except finally ' +
        'with lambda yield global nonlocal async await del assert break continue match case'),
      types: words('self cls super print len range isinstance dict list set tuple str int float bool object property staticmethod classmethod'),
    },
    go: {
      re: /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|`[^`]*`|'(?:\\.|[^'\\])+')|(\b\d+(?:\.\d+)?\b)|(@\w+)|(\b[A-Za-z_][A-Za-z0-9_]*\b)/g,
      kw: words('break case chan const continue default defer else fallthrough for func go goto if import interface map package range ' +
        'return select struct switch type var nil true false iota'),
      types: words('int int64 int32 uint float64 float32 string bool byte rune error any make new len cap append delete panic recover'),
    },
  };
  function highlight(src, lang) {
    const L = LANGS[lang] || LANGS.java;
    const re = new RegExp(L.re.source, 'g');
    let out = '', last = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index));
      const [tok, com, str, num, ann, word] = m;
      if (com) out += `<span class="hl-c">${esc(com)}</span>`;
      else if (str) out += `<span class="hl-s">${esc(str)}</span>`;
      else if (num) out += `<span class="hl-n">${esc(num)}</span>`;
      else if (ann) out += `<span class="hl-a">${esc(ann)}</span>`;
      else if (L.kw.has(word)) out += `<span class="hl-k">${word}</span>`;
      else if (L.types.has(word) || /^[A-Z]/.test(word)) out += `<span class="hl-t">${word}</span>`;
      else out += esc(tok);
      last = re.lastIndex;
    }
    return out + esc(src.slice(last));
  }

  const LS_KEY = 'dp:learned';
  const learned = {
    all() { try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch (e) { return []; } },
    has(id) { return this.all().includes(id); },
    add(id) {
      const a = this.all();
      if (!a.includes(id)) { a.push(id); try { localStorage.setItem(LS_KEY, JSON.stringify(a)); } catch (e) { /* 隐私模式 */ } }
    },
    clear() { try { localStorage.removeItem(LS_KEY); } catch (e) { /* ignore */ } },
  };

  return { TYPES, list, byId, register, sorted, learned, util: { esc, inline, plain, highlight } };
})();
