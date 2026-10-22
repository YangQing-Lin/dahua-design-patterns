DP.register({
  id: 'iterator',
  order: 20,
  type: 'behavioral',
  name: '迭代器模式',
  en: 'Iterator',
  emoji: '🎫',
  chapter: '第 20 章 · 想走？可以！先买票',
  mnemonic: '集合只管装，迭代器带你逛',
  summary: '把“挨个访问集合里每个元素”的工作交给迭代器，集合本身只负责装数据。',
  intent: '提供一种方法顺序访问一个聚合对象中各个元素，而又不暴露该对象的内部表示。',
  story: '小菜和大鸟坐公交车，售票员要求**上车的都买票**：不管是人还是大件行李，是本地人还是老外，哪怕是**小偷**，也得从第一位查到最后一位。大鸟说，售票员就是一个**迭代器**：车厢只管装乘客，“挨个走一遍”这件事交给售票员；想从后往前查，换个售票员（迭代器）就行。',
  analogy: '超市收银台的扫码枪：购物车里装的是蔬菜、饮料还是日用品，扫码枪不关心，它只会“拿起下一件——扫一下——还有没有？”。购物车（集合）负责装东西，扫码这件事交给收银员和扫码枪（迭代器）。',
  when: [
    '要访问一个集合的内容，又**不想暴露它内部怎么存**（数组？链表？树？）',
    '同一个集合需要**多种遍历方式**：正序、倒序、跳着走……',
    '想用**统一的方式**遍历各种不同的集合',
  ],
  pros: [
    '遍历和存储**分离**，集合类更简单，职责单一',
    '新增一种遍历方式只需**新增一个迭代器类**，集合不用改',
    '同一个集合可以同时有多个迭代器，各走各的',
  ],
  cons: [
    '简单场景下多出几个类，略显繁琐（好在现代语言都已内置）',
    '遍历过程中修改集合，容易出错（Java 会抛 ConcurrentModificationException）',
  ],
  keyPoints: [
    '四个角色：**Iterator**（迭代器抽象：first / next / isDone / currentItem）、**ConcreteIterator**（记住当前位置）、**Aggregate**（聚集抽象：createIterator）、**ConcreteAggregate**（真正装数据）',
    '迭代器手里拿着集合的引用和一个**当前位置 current**，这就是它全部的“记忆”',
    'Java 的 `Iterable` / `Iterator`（hasNext、next）和 for-each 就是这个模式，日常很少自己写，但天天在用',
  ],
  code: `
// 迭代器抽象：定义“怎么挨个走”
abstract class Iterator {
    public abstract Object first();
    public abstract Object next();
    public abstract boolean isDone();
    public abstract Object currentItem();
}
// 聚集抽象：能生出一个迭代器
abstract class Aggregate {
    public abstract Iterator createIterator();
}
// 具体聚集：一车乘客
class ConcreteAggregate extends Aggregate {
    private List<Object> items = new ArrayList<>();
    public Iterator createIterator() { return new ConcreteIterator(this); }
    public int count()               { return items.size(); }
    public Object get(int i)         { return items.get(i); }
    public void add(Object o)        { items.add(o); }
}
// 具体迭代器：售票员，记住“现在走到第几个”
class ConcreteIterator extends Iterator {
    private ConcreteAggregate aggregate;
    private int current = 0;
    ConcreteIterator(ConcreteAggregate a) { aggregate = a; }
    public Object first()       { current = 0; return aggregate.get(0); }
    public Object next()        { current++; return isDone() ? null : aggregate.get(current); }
    public boolean isDone()     { return current >= aggregate.count(); }
    public Object currentItem() { return aggregate.get(current); }
}
// 倒序迭代器 ConcreteIteratorDesc：current 从 count()-1 开始，next() 时 current--

// 客户端
ConcreteAggregate bus = new ConcreteAggregate();
bus.add("大鸟"); bus.add("小菜"); bus.add("行李"); bus.add("老外"); bus.add("小偷");
Iterator i = bus.createIterator();
i.first();
while (!i.isDone()) {
    System.out.println(i.currentItem() + " 请买车票！");
    i.next();
}
// Java 早已内置：for (String p : list) { ... }`,
  codePython: `
from abc import ABC, abstractmethod

# 迭代器抽象：定义“怎么挨个走”
class Iterator(ABC):
    @abstractmethod
    def first(self): ...
    @abstractmethod
    def next(self): ...
    @abstractmethod
    def is_done(self) -> bool: ...
    @abstractmethod
    def current_item(self): ...

# 聚集抽象：能生出一个迭代器
class Aggregate(ABC):
    @abstractmethod
    def create_iterator(self) -> Iterator: ...

# 具体聚集：一车乘客
class ConcreteAggregate(Aggregate):
    def __init__(self):
        self.items = []

    def create_iterator(self):
        return ConcreteIterator(self)

    def __iter__(self):      # 让 for p in bus 直接可用，见文末说明
        yield from self.items

# 具体迭代器：售票员，记住“现在走到第几个”
class ConcreteIterator(Iterator):
    def __init__(self, aggregate):
        self.aggregate, self.current = aggregate, 0

    def first(self):
        self.current = 0
        return self.aggregate.items[0]

    def next(self):
        self.current += 1

    def is_done(self):
        return self.current >= len(self.aggregate.items)

    def current_item(self):
        return self.aggregate.items[self.current]
# 倒序迭代器 ConcreteIteratorDesc：current 从最后一个开始，next() 时 current -= 1

if __name__ == "__main__":
    bus = ConcreteAggregate()
    bus.items += ["大鸟", "小菜", "行李", "老外", "小偷"]
    i = bus.create_iterator()
    i.first()
    while not i.is_done():
        print(i.current_item(), "请买车票！")   # 大鸟 请买车票！ … 小偷 请买车票！
        i.next()
    # 迭代器模式已内置在 Python 里：__iter__ / 生成器，for 循环直接用
    for p in bus:
        print(p, "请买车票！")                  # 同上，不用手写迭代器`,
  codeGo: `
package main

import (
	"fmt"
	"iter"
)

// 迭代器抽象：定义“怎么挨个走”
type Iterator interface {
	First() string
	Next()
	IsDone() bool
	CurrentItem() string
}

// 聚集抽象：能生出一个迭代器
type Aggregate interface{ CreateIterator() Iterator }

// 具体聚集：一车乘客
type ConcreteAggregate struct{ items []string }

func (a *ConcreteAggregate) Add(s string)             { a.items = append(a.items, s) }
func (a *ConcreteAggregate) CreateIterator() Iterator { return &ConcreteIterator{agg: a} }

// 具体迭代器：售票员，记住“现在走到第几个”（Go 没有继承，直接实现接口）
type ConcreteIterator struct {
	agg     *ConcreteAggregate
	current int
}

func (c *ConcreteIterator) First() string       { c.current = 0; return c.agg.items[0] }
func (c *ConcreteIterator) Next()               { c.current++ }
func (c *ConcreteIterator) IsDone() bool        { return c.current >= len(c.agg.items) }
func (c *ConcreteIterator) CurrentItem() string { return c.agg.items[c.current] }

// 倒序迭代器 ConcreteIteratorDesc：current 从最后一个开始，Next() 时 current--
// Go 1.23+ 内置了迭代器：iter.Seq 配合 for range，不用手写迭代器类型
func (a *ConcreteAggregate) All() iter.Seq[string] {
	return func(yield func(string) bool) {
		for _, p := range a.items {
			if !yield(p) {
				return
			}
		}
	}
}

func main() {
	bus := &ConcreteAggregate{}
	for _, p := range []string{"大鸟", "小菜", "行李", "老外", "小偷"} {
		bus.Add(p)
	}
	i := bus.CreateIterator()
	for i.First(); !i.IsDone(); i.Next() {
		fmt.Println(i.CurrentItem(), "请买车票！") // 大鸟 请买车票！ … 小偷 请买车票！
	}
	for p := range bus.All() { // range-over-func：语言自带的迭代器
		fmt.Println(p, "请买车票！") // 同上
	}
}`,
  compare: [
    { id: 'visitor', text: '迭代器只负责“**挨个走到每个元素**”；访问者负责“走到之后**对它做什么操作**”，而且按元素类型做不同的事。' },
    { id: 'composite', text: '组合模式决定数据“**怎么组织**”（树形结构）；迭代器决定数据“**怎么遍历**”。二者常搭配：用迭代器遍历一棵组合树。' },
  ],
  quiz: [
    { q: '一个报表程序要逐条打印数据，数据有时来自数组、有时来自链表、有时来自数据库游标。你希望打印代码只用“还有没有下一个？取下一个”这两个动作，而完全不知道数据在内部是怎么存的。', why: '统一的顺序访问接口，隐藏集合内部表示——迭代器模式。' },
    { q: '社交 App 的好友列表需要支持“按添加顺序看”和“倒序看”，以后可能还要“只看在线的”。你不想在好友列表类里为每种看法都加一堆循环方法，而是把每种“走法”单独做成一个类。' },
  ],

  nodes: {
    /* ---- 场景一：公交车 ---- */
    bus: { kind: 'zone', label: '🚌 公交车', x: 520, y: 290, w: 860, h: 300, tone: 'blue' },
    p0: { kind: 'actor', icon: '🧔', label: '大鸟', x: 230, y: 250, tone: 'purple', size: 'sm' },
    p1: { kind: 'actor', icon: '🧑', label: '小菜', x: 380, y: 250, tone: 'blue', size: 'sm' },
    p2: { kind: 'actor', icon: '🧳', label: '大件行李', x: 530, y: 250, tone: 'orange', size: 'sm' },
    p3: { kind: 'actor', icon: '👱', label: '老外', x: 680, y: 250, tone: 'teal', size: 'sm' },
    p4: { kind: 'actor', icon: '🦹', label: '小偷', x: 830, y: 250, tone: 'gray', size: 'sm' },
    conductor: { kind: 'actor', icon: '👩‍💼', label: '售票员', x: 150, y: 380, tone: 'pink' },

    /* ---- 场景二：类结构 ---- */
    it: {
      kind: 'class', title: 'Iterator', stereo: 'abstract', sub: '迭代器（售票员会的四招）', x: 560, y: 125, tone: 'purple',
      lines: ['+ first()', '+ next()', '+ isDone()', '+ currentItem()'],
    },
    agg: { kind: 'class', title: 'Aggregate', stereo: 'abstract', sub: '聚集（一群对象）', x: 200, y: 125, tone: 'indigo', lines: ['+ createIterator()'] },
    cagg: {
      kind: 'class', title: 'ConcreteAggregate', sub: '具体聚集：一车乘客', x: 200, y: 300, tone: 'blue',
      lines: ['- items: List', '+ createIterator()', '+ count() / get(i)'],
    },
    cit: {
      kind: 'class', title: 'ConcreteIterator', sub: '具体迭代器：售票员', x: 560, y: 300, tone: 'pink',
      lines: ['- aggregate', '- current = 0', '+ next(): current++'],
    },
    desc: {
      kind: 'class', title: 'ConcreteIteratorDesc', sub: '倒序迭代器：从后往前', x: 830, y: 300, tone: 'teal', badge: 'NEW',
      lines: ['- current = count-1', '+ next(): current--'],
    },
    cursor: { kind: 'box', icon: '👇', label: 'current = 0', shape: 'chip', mono: true, x: 230, y: 395, tone: 'pink' },
    cursor2: { kind: 'box', icon: '👇', label: 'current = 4', shape: 'chip', mono: true, x: 830, y: 395, tone: 'teal' },

    /* ---- 场景三：现代语言 ---- */
    bookIt: {
      kind: 'class', title: 'Iterator', stereo: 'abstract', sub: '书里的迭代器', x: 240, y: 190, tone: 'purple',
      lines: ['+ first()', '+ next() / currentItem()', '+ isDone()'],
    },
    javaIt: {
      kind: 'class', title: 'java.util.Iterator<E>', stereo: 'interface', sub: 'Java 内置', x: 760, y: 190, tone: 'orange',
      lines: ['+ hasNext(): boolean', '+ next(): E'],
    },
    forEach: {
      kind: 'class', title: 'for-each', sub: '你平时写的代码', x: 500, y: 420, tone: 'green',
      lines: ['List<String> bus = …;', 'for (String p : bus) {', '\u00a0\u00a0\u00a0\u00a0System.out.println(p + " 请买票！");', '}'],
    },
    tipLang: { kind: 'text', text: 'C# 的 foreach、Python 的 for…in，也都是它', x: 500, y: 530, tone: 'gray', size: 'sm' },
  },
  links: {
    l_ca: { from: 'cagg', to: 'agg', kind: 'inherit' },
    l_ci: { from: 'cit', to: 'it', kind: 'inherit' },
    l_di: { from: 'desc', to: 'it', kind: 'inherit' },
    l_ai: { from: 'agg', to: 'it', kind: 'depend', label: '创建' },
    l_cc: { from: 'cit', to: 'cagg', kind: 'assoc', label: '持有' },
    l_map: { from: 'bookIt', to: 'javaIt', kind: 'dotted', label: '同一个东西，换了名字' },
    l_fe: { from: 'forEach', to: 'javaIt', kind: 'depend', label: '编译器替你调用', labelAt: 0.3 },
  },

  frames: [
    {
      title: '想走？先买票！',
      text: '这一章发生在**公交车**上。小菜和大鸟刚上车，售票员就喊：“上车的都请买票！”车上有大鸟、小菜，有一件大行李，有个老外，后面还站着一个**小偷**。',
      show: ['bus', 'p0', 'p1', 'p2', 'p3', 'p4', 'conductor'],
      bubbles: [{ node: 'conductor', text: '上车的乘客，**请买票**！', side: 'right' }],
    },
    {
      title: '从第一位开始，挨个来',
      text: '售票员从**第一位**乘客开始：大鸟，请买票。买完了，再走向**下一位**。她要做的事就两件：记住**现在走到第几个**，然后**一个接一个**往后走。',
      set: { conductor: { x: 230 } },
      trans: 1.2,
      focus: ['conductor', 'p0'],
      bubbles: [
        { node: 'conductor', text: '请买票', side: 'right' },
        { node: 'p0', text: '给，买票。', side: 'top', delay: 0.6 },
      ],
    },
    {
      title: '行李也得买票',
      text: '走到行李这儿：**大件行李也要买票**！售票员才不管眼前是人还是东西。在她眼里，每一个都只是“**下一个要检查的乘客**”，处理方式一模一样。',
      set: { conductor: { x: 530 } },
      trans: 1.6,
      focus: ['conductor', 'p1', 'p2'],
      bubbles: [
        { node: 'p1', text: '我买过了', side: 'top' },
        { node: 'conductor', text: '行李也得**买票**！', side: 'right', delay: 0.6 },
      ],
    },
    {
      title: '连小偷也不放过',
      text: '老外也买了票，最后走到**小偷**面前：照样请买票！直到最后一位查完，售票员才停下。这就是“**遍历**”：不管集合里装的是什么，**从头到尾、一个不漏**地走一遍。',
      set: { conductor: { x: 830 } },
      trans: 1.6,
      focus: ['conductor', 'p3', 'p4'],
      bubbles: [
        { node: 'p3', text: 'OK，Ticket！', side: 'top' },
        { node: 'p4', text: '……我也要买？', side: 'top', delay: 0.5 },
        { node: 'conductor', text: '上了车，**都得买票**！', side: 'left', delay: 1 },
      ],
    },
    {
      title: '大鸟：售票员就是迭代器',
      text: '大鸟点破：车厢只负责**装乘客**，售票员负责**挨个走一遍**——这是两件事。把“遍历”从集合里分离出来，交给一个专门的对象，它就叫**迭代器**。想从后往前查票？换个走法就行，车厢不用改。',
      set: {
        bus: { label: '聚集：车厢只管“装了谁”' },
        conductor: { x: 150, label: '售票员 = 迭代器', sub: '只管“挨个走”' },
      },
      trans: 1.4,
      focus: ['conductor', 'bus', 'p0', 'p1', 'p2', 'p3', 'p4'],
    },
    {
      title: '迭代器 Iterator',
      text: '先定义**迭代器** `Iterator`：售票员会的四招——`first()` 到第一个、`next()` 走到下一个、`isDone()` 走完没有、`currentItem()` 当前是谁。不管遍历什么集合，**都是这四招**。',
      hide: ['bus', 'conductor'],
      show: ['it'],
      set: {
        p0: { y: 465, label: '[0] 大鸟' }, p1: { y: 465, label: '[1] 小菜' }, p2: { y: 465, label: '[2] 行李' },
        p3: { y: 465, label: '[3] 老外' }, p4: { y: 465, label: '[4] 小偷' },
      },
      trans: 1.2,
      focus: ['it'],
    },
    {
      title: '聚集 Aggregate',
      text: '再定义**聚集** `Aggregate`，就是“一群对象”。它只多一个本事：`createIterator()`，**生出一个迭代器**。具体聚集 `ConcreteAggregate` 就是这一车乘客，内部用列表 `items` 装着大家。',
      show: ['agg', 'cagg', 'l_ca', 'l_ai'],
      focus: ['agg', 'cagg', 'l_ca', 'p0', 'p1', 'p2', 'p3', 'p4'],
    },
    {
      title: '具体迭代器：记住走到哪',
      text: '具体迭代器 `ConcreteIterator` 就是售票员本人：手里**拿着这车乘客**（聚集的引用），心里记着一个数 `current`——**现在走到第几个**。调用 `first()`，指针指向第 0 位：大鸟，请买票！',
      show: ['cit', 'l_ci', 'l_cc', 'cursor'],
      set: { it: { lines: ['!+ first()', '+ next()', '+ isDone()', '!+ currentItem()'] } },
      focus: ['cit', 'cagg', 'l_cc', 'cursor', 'p0'],
      flows: [
        { from: 'cagg', to: 'cit', label: 'createIterator()', curve: -40 },
        { from: 'cit', to: 'p0', label: 'first()' },
      ],
      bubbles: [{ node: 'p0', text: '请买票', side: 'bottom', step: 1 }],
    },
    {
      title: '跑一遍：next() 到底',
      text: '接着就是一个循环：`while (!isDone())`，先 `currentItem()` 喊“请买票”，再 `next()` 走向下一位。小菜、行李、老外、小偷……**一个不漏**。走过最后一位，`isDone()` 返回 true，查票结束。',
      hide: ['cursor'],
      set: {
        it: { lines: ['+ first()', '!+ next()', '!+ isDone()', '+ currentItem()'] },
        cit: { lines: ['- aggregate', '!- current = 0 → 4', '+ next(): current++'] },
      },
      focus: ['cit', 'it', 'p0', 'p1', 'p2', 'p3', 'p4'],
      flows: [
        { from: 'p0', to: 'p1', icon: '🎫', label: 'next()', curve: -80 },
        { from: 'p1', to: 'p2', icon: '🎫', label: 'next()', curve: -80 },
        { from: 'p2', to: 'p3', icon: '🎫', label: 'next()', curve: -80 },
        { from: 'p3', to: 'p4', icon: '🎫', label: 'next()', curve: -80 },
      ],
      bubbles: [
        { node: 'p1', text: '请买票', side: 'bottom', step: 0 },
        { node: 'p2', text: '请买票', side: 'bottom', step: 1 },
        { node: 'p3', text: '请买票', side: 'bottom', step: 2 },
        { node: 'p4', text: '请买票', side: 'bottom', step: 3 },
        { node: 'cit', text: '`isDone()` = true，查完！', side: 'right', step: 3, delay: 0.6 },
      ],
    },
    {
      title: '倒着查：再写一个迭代器',
      text: '售票员想**从后往前**查票？不改车厢，也不改原来的迭代器，只要**再写一个** `ConcreteIteratorDesc`：`current` 从最后一位开始，每次 `next()` 往前退一格。**走法换了，集合一行不动。**',
      show: ['desc', 'l_di', 'cursor2'],
      set: {
        it: { lines: ['+ first()', '+ next()', '+ isDone()', '+ currentItem()'] },
        cit: { lines: ['- aggregate', '- current = 0', '+ next(): current++'] },
      },
      focus: ['desc', 'l_di', 'cursor2', 'p0', 'p1', 'p2', 'p3', 'p4'],
      flows: [
        { from: 'p4', to: 'p3', icon: '🎫', label: 'next()', tone: 'teal', curve: 80 },
        { from: 'p3', to: 'p2', icon: '🎫', label: 'next()', tone: 'teal', curve: 80 },
        { from: 'p2', to: 'p1', icon: '🎫', label: 'next()', tone: 'teal', curve: 80 },
        { from: 'p1', to: 'p0', icon: '🎫', label: 'next()', tone: 'teal', curve: 80 },
      ],
    },
    {
      title: '现代语言：早就内置了',
      text: '好消息：这个模式**太常用**，现代语言早已内置。Java 的 `Iterator`（`hasNext()`、`next()`）就是书里那四招换了名字；你写 `for (p : bus)`，编译器替你调用迭代器。**你很少自己写，却天天在用。**',
      clear: true,
      show: ['bookIt', 'javaIt', 'forEach', 'tipLang', 'l_map', 'l_fe'],
      flows: [
        { from: 'forEach', to: 'javaIt', label: 'hasNext() / next()' },
      ],
    },
    {
      title: '总结：迭代器模式',
      text: '迭代器模式四个角色：**Iterator**（遍历的四招）、**ConcreteIterator**（记住走到哪）、**Aggregate**（能生出迭代器的集合）、**ConcreteAggregate**（真正装数据）。一句话记住：**集合只管装，迭代器带你逛。**',
      clear: true,
      show: ['it', 'agg', 'cagg', 'cit', 'desc', 'l_ca', 'l_ci', 'l_di', 'l_ai', 'l_cc', 'p0', 'p1', 'p2', 'p3', 'p4'],
      set: { desc: { badge: '' } },
      focus: ['it', 'cagg', 'cit', 'desc'],
      bubbles: [
        { node: 'it', text: '我只管“**怎么走**”', side: 'right' },
        { node: 'cagg', text: '我只管“**装了谁**”', side: 'top', delay: 0.5 },
      ],
    },
  ],
});
