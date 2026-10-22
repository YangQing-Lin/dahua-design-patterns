DP.register({
  id: 'observer',
  order: 14,
  type: 'behavioral',
  name: '观察者模式',
  en: 'Observer',
  emoji: '📢',
  chapter: '第 14 章 · 老板回来，我不知道',
  mnemonic: '状态一变喊一声，登记的人全知道',
  summary: '一个对象状态变了，自动通知所有登记过的对象，双方只依赖抽象。',
  intent: '定义了一种一对多的依赖关系，让多个观察者对象同时监听某一个主题对象。这个主题对象在状态发生变化时，会通知所有观察者对象，使它们能够自动更新自己。',
  story: '同事们上班时间偷偷**看股票**、**看 NBA**，和前台秘书童子喆约好：老板胡汉三一回来就打电话通知。结果有一天老板直接走了进来，前台**来不及通知**，看股票的魏关姹被抓了个正着。大鸟借此讲了观察者模式：**通知者**维护一份名单，状态一变就挨个通知；**观察者**收到通知自己做出反应。',
  analogy: '订牛奶：你在奶站登记之后，每天新奶一到，送奶员就把奶送到**所有订户**门口；不想喝了退订就行。奶站不需要知道你拿牛奶去做什么，你也不用每天跑去奶站问“到了没”。',
  when: [
    '一个对象的改变需要**同时改变其他对象**，而且不知道具体有多少对象要跟着变',
    '希望通知方和接收方**解耦**，各自独立变化、独立复用',
    '接收方需要随时**订阅 / 退订**',
  ],
  pros: ['通知者和观察者都**依赖抽象**，互不认识具体类', '可以随时增加新的观察者，通知者代码不用改', '天然支持“一对多”广播'],
  cons: ['观察者很多时，逐个通知会比较耗时', '要求观察者有统一的 `update()` 接口（可以用事件委托缓解）', '通知顺序不确定，观察者之间不应互相依赖'],
  keyPoints: [
    '四个角色：**Subject**（抽象通知者）、**ConcreteSubject**（老板 / 前台）、**Observer**（抽象观察者）、**ConcreteObserver**（看股票 / 看 NBA 的同事）',
    '书中（C#）的方法叫 `Notify()`；Java 里 `notify()` 是 `Object` 的 final 方法，所以这里写成 `notifyObservers()`',
    '**事件委托**：观察者的方法名各不相同（`closeStockMarket()`、`closeNBADirectSeeding()`）时，通知者只保存“要调用的方法”；C# 用 delegate/event，Java 可用函数式接口 + 方法引用',
  ],
  code: `
// 抽象通知者（书中叫 Notify；Java 的 notify() 是 Object 的 final 方法，故改名）
interface Subject {
    void attach(Observer o);
    void detach(Observer o);
    void notifyObservers();
    String getSubjectState();
}
// 抽象观察者：只认识抽象的 Subject
abstract class Observer {
    protected String name;
    protected Subject sub;
    Observer(String name, Subject sub) { this.name = name; this.sub = sub; }
    public abstract void update();
}
class StockObserver extends Observer {          // 看股票的同事
    StockObserver(String n, Subject s) { super(n, s); }
    public void update() { System.out.println(sub.getSubjectState() + name + " 关闭股票行情，继续工作！"); }
}
class NBAObserver extends Observer {            // 看 NBA 的同事
    NBAObserver(String n, Subject s) { super(n, s); }
    public void update() { System.out.println(sub.getSubjectState() + name + " 关闭NBA直播，继续工作！"); }
}
// 具体通知者：老板（前台 Secretary 的写法完全一样）
class Boss implements Subject {
    private final List<Observer> observers = new ArrayList<>();   // 通知名单
    private String action;
    public void attach(Observer o) { observers.add(o); }
    public void detach(Observer o) { observers.remove(o); }
    public void notifyObservers() { for (Observer o : observers) o.update(); }
    public String getSubjectState() { return action; }
    public void setSubjectState(String s) { action = s; }
}
// 客户端
Boss huhansan = new Boss();
Observer wei = new StockObserver("魏关姹", huhansan);
Observer yi  = new NBAObserver("易管查", huhansan);
huhansan.attach(wei);
huhansan.attach(yi);
huhansan.detach(wei);                        // 魏关姹不在名单上了……
huhansan.setSubjectState("我胡汉三回来了！");
huhansan.notifyObservers();                  // 只有易管查收到通知`,
  codePython: `
from abc import ABC, abstractmethod


# 抽象观察者：只认识抽象的 Subject
class Observer(ABC):
    def __init__(self, name, sub):
        self.name, self.sub = name, sub

    @abstractmethod
    def update(self): ...


# 抽象通知者（书中叫 Notify；Python 抽象类可直接带默认实现，Boss / Secretary 不必重复写）
class Subject(ABC):
    def __init__(self):
        self._observers = []                # 通知名单
        self.subject_state = ""

    def attach(self, o): self._observers.append(o)
    def detach(self, o): self._observers.remove(o)

    def notify_observers(self):             # 沿用 Java 版的名字
        for o in self._observers:
            o.update()


class StockObserver(Observer):              # 看股票的同事
    def update(self):
        print(f"{self.sub.subject_state}{self.name} 关闭股票行情，继续工作！")


class NBAObserver(Observer):                # 看 NBA 的同事
    def update(self):
        print(f"{self.sub.subject_state}{self.name} 关闭NBA直播，继续工作！")


class Boss(Subject):                        # 具体通知者：老板
    pass


class Secretary(Subject):                   # 具体通知者：前台，写法完全一样
    pass


# 客户端
if __name__ == "__main__":
    huhansan = Boss()
    wei = StockObserver("魏关姹", huhansan)
    yi = NBAObserver("易管查", huhansan)
    huhansan.attach(wei)
    huhansan.attach(yi)
    huhansan.detach(wei)                    # 魏关姹不在名单上了……
    huhansan.subject_state = "我胡汉三回来了！"
    huhansan.notify_observers()             # 我胡汉三回来了！易管查 关闭NBA直播，继续工作！`,
  codeGo: `
package main

import (
	"fmt"
	"slices"
)

// 抽象通知者（书中叫 Notify；沿用 Java 版的 NotifyObservers）
type Subject interface {
	Attach(o Observer)
	Detach(o Observer)
	NotifyObservers()
	SubjectState() string
}

// 抽象观察者：只认识抽象的 Subject
type Observer interface {
	Update()
}

// Go 没有继承：通知名单的通用逻辑放进 notifier，具体通知者嵌入它即可复用
type notifier struct {
	observers []Observer // 通知名单
	State     string
}

func (n *notifier) Attach(o Observer) { n.observers = append(n.observers, o) }
func (n *notifier) Detach(o Observer) {
	n.observers = slices.DeleteFunc(n.observers, func(x Observer) bool { return x == o })
}
func (n *notifier) NotifyObservers() {
	for _, o := range n.observers {
		o.Update()
	}
}
func (n *notifier) SubjectState() string { return n.State }

type Boss struct{ notifier }      // 具体通知者：老板
type Secretary struct{ notifier } // 具体通知者：前台，写法完全一样

type StockObserver struct { // 看股票的同事
	name string
	sub  Subject
}

func (s *StockObserver) Update() {
	fmt.Println(s.sub.SubjectState() + s.name + " 关闭股票行情，继续工作！")
}

type NBAObserver struct { // 看 NBA 的同事
	name string
	sub  Subject
}

func (n *NBAObserver) Update() {
	fmt.Println(n.sub.SubjectState() + n.name + " 关闭NBA直播，继续工作！")
}

// 客户端
func main() {
	huhansan := &Boss{}
	wei := &StockObserver{"魏关姹", huhansan}
	yi := &NBAObserver{"易管查", huhansan}
	huhansan.Attach(wei)
	huhansan.Attach(yi)
	huhansan.Detach(wei) // 魏关姹不在名单上了……
	huhansan.State = "我胡汉三回来了！"
	huhansan.NotifyObservers() // 我胡汉三回来了！易管查 关闭NBA直播，继续工作！
}`,
  compare: [
    { id: 'mediator', text: '中介者是“**多对多**”的调停中心，同事之间通过它互相沟通；观察者是“**一对多**”的广播，通知者只管喊，观察者只管听。' },
    { id: 'chain-of-responsibility', text: '职责链里请求**沿着链传**，通常只有一个对象处理；观察者是**同时通知名单上所有人**，每个人都会响应。' },
  ],
  quiz: [
    { q: '气象站的温度一更新，手机 App、门口的电子屏、空调控制器都要立刻跟着刷新；以后还会接入新的显示设备，但不希望改气象站的代码。', why: '一个对象变化，多个对象自动更新，且接收方可随时增加——通知者维护名单、逐个调用 update()。' },
    { q: '公众号作者发布新文章后，所有关注了这个号的读者都会收到推送；读者可以随时关注或取关，作者完全不需要知道读者是谁。', why: '订阅 / 退订 + 一对多广播，正是“发布-订阅”。' },
  ],

  nodes: {
    // —— 场景一：办公室 ——
    stock: { kind: 'actor', icon: '📈', label: '魏关姹', sub: '看股票的同事', x: 170, y: 330, tone: 'teal' },
    nba: { kind: 'actor', icon: '🏀', label: '易管查', sub: '看 NBA 的同事', x: 380, y: 330, tone: 'teal' },
    sec: { kind: 'actor', icon: '💁‍♀️', label: '童子喆', sub: '前台秘书', x: 660, y: 330, tone: 'pink' },
    boss: { kind: 'actor', icon: '👔', label: '胡汉三', sub: '老板', x: 900, y: 330, tone: 'orange' },

    // —— 场景二：小菜的第一版 ——
    sec1: {
      kind: 'class', title: 'Secretary', sub: '前台秘书（第一版）', x: 280, y: 250, tone: 'pink',
      lines: ['- colleagues: List<StockObserver>', '+ attach(StockObserver o)', '+ notify()', '+ action: String'],
    },
    stk1: { kind: 'class', title: 'StockObserver', sub: '看股票的同事', x: 730, y: 250, tone: 'teal', lines: ['- name: String', '- sub: Secretary', '+ update()'] },
    nba1: { kind: 'class', title: 'NBAObserver', sub: '看 NBA 的同事', x: 730, y: 450, tone: 'gray', badge: '想加进来', lines: ['- name: String', '- sub: Secretary', '+ update()'] },

    // —— 场景三：类图 ——
    subj: {
      kind: 'class', title: 'Subject', stereo: 'interface', sub: '通知者', x: 250, y: 150, tone: 'purple',
      lines: ['+ attach(Observer o)', '+ detach(Observer o)', '+ notifyObservers()', '+ getSubjectState()'],
    },
    obs: { kind: 'class', title: 'Observer', stereo: 'abstract', sub: '观察者', x: 750, y: 150, tone: 'purple', lines: ['# name: String', '# sub: Subject', '+ update()'] },
    bossC: { kind: 'class', title: 'Boss', sub: '老板', x: 150, y: 430, tone: 'orange' },
    secC: { kind: 'class', title: 'Secretary', sub: '前台', x: 350, y: 430, tone: 'pink' },
    stkC: { kind: 'class', title: 'StockObserver', sub: '看股票的同事', x: 650, y: 430, tone: 'teal', lines: ['+ update()'] },
    nbaC: { kind: 'class', title: 'NBAObserver', sub: '看 NBA 的同事', x: 860, y: 430, tone: 'teal', lines: ['+ update()'] },

    // —— 场景四：运行 ——
    hu: { kind: 'actor', icon: '👔', label: '胡汉三', sub: '通知者 Boss', x: 170, y: 220, tone: 'orange' },
    tz: { kind: 'actor', icon: '💁‍♀️', label: '童子喆', sub: '通知者 Secretary', x: 170, y: 220, tone: 'pink' },
    list: { kind: 'box', shape: 'note', icon: '📋', label: '通知名单', sub: '（空）', x: 170, y: 420, w: 160, tone: 'yellow' },
    o1: { kind: 'actor', icon: '📈', label: '魏关姹', sub: 'StockObserver', x: 640, y: 120, tone: 'teal' },
    o2: { kind: 'actor', icon: '🏀', label: '易管查', sub: 'NBAObserver', x: 640, y: 280, tone: 'teal' },
    o3: { kind: 'actor', icon: '📺', label: '新同事', sub: 'TVObserver（新写的类）', x: 640, y: 440, tone: 'green', badge: 'NEW' },

    // —— 场景五：事件委托 ——
    bossD: { kind: 'class', title: 'Boss', sub: '通知者（事件委托版）', x: 240, y: 270, tone: 'orange', lines: ['- update: List<Runnable>', '+ notifyObservers()'] },
    stkD: { kind: 'class', title: 'StockObserver', sub: '看股票的同事', x: 730, y: 150, tone: 'teal', lines: ['+ closeStockMarket()'] },
    nbaD: { kind: 'class', title: 'NBAObserver', sub: '看 NBA 的同事', x: 730, y: 390, tone: 'teal', lines: ['+ closeNBADirectSeeding()'] },
    tipD: { kind: 'text', text: '没有共同的 update()？没关系，通知者只存“要调用的方法”', x: 500, y: 510, tone: 'gray', size: 'sm' },
  },
  links: {
    l_s2o: { from: 'sec1', to: 'stk1', kind: 'assoc', label: '认识具体同事', curve: 34 },
    l_o2s: { from: 'stk1', to: 'sec1', kind: 'assoc', label: '认识具体前台', curve: 34 },

    l_stk: { from: 'stkC', to: 'obs', kind: 'inherit' },
    l_nba: { from: 'nbaC', to: 'obs', kind: 'inherit' },
    l_boss: { from: 'bossC', to: 'subj', kind: 'implement' },
    l_sec: { from: 'secC', to: 'subj', kind: 'implement' },
    l_agg: { from: 'subj', to: 'obs', kind: 'aggregate', label: '通知名单 List<Observer>', labelDy: -13 },
    l_dep: { from: 'obs', to: 'subj', kind: 'depend', label: '只认识抽象通知者', curve: -70 },

    l_dD1: { from: 'bossD', to: 'stkD', kind: 'dashed', label: 'stock::closeStockMarket', labelDy: -14 },
    l_dD2: { from: 'bossD', to: 'nbaD', kind: 'dashed', label: 'nba::closeNBADirectSeeding', labelDy: 14 },
  },

  frames: [
    {
      title: '上班时间的“约定”',
      text: '小菜跟大鸟讲公司里的趣事：老板**胡汉三**出门了，同事魏关姹趁机**看股票**，易管查**看 NBA 直播**。他们和前台秘书**童子喆**约好：老板一回来，她就马上打电话通知大家。',
      show: ['stock', 'nba', 'sec'],
      flows: [
        { from: 'stock', to: 'sec', label: '老板回来叫我们！', step: 0, curve: -70 },
        { from: 'nba', to: 'sec', label: '拜托啦', step: 0, delay: 0.3 },
      ],
      bubbles: [
        { node: 'sec', text: '放心，老板一回来我就**打电话**通知你们！', side: 'top', step: 0 },
        { node: 'stock', text: '今天大盘又涨了 📈', side: 'bottom', delay: 0.3 },
        { node: 'nba', text: '这球进了！🏀', side: 'bottom', delay: 0.6 },
      ],
    },
    {
      title: '老板突然回来了',
      text: '可那天老板**直接走了进来**，童子喆根本**来不及打电话**。魏关姹还盯着股票行情，被抓了个正着。大鸟听完笑了：你们这套“放哨通知”，其实就是一个**观察者模式**，只是实现得太脆弱了。',
      show: ['boss'],
      set: { boss: { x: 300, y: 145 }, stock: { badge: '被抓包！' } },
      focus: ['boss', 'stock', 'sec'],
      trans: 1.4,
      bubbles: [
        { node: 'boss', text: '上班时间**看股票**？', side: 'right', delay: 0.8 },
        { node: 'sec', text: '老板直接进来了，来不及打电话……', side: 'top', delay: 1.2 },
      ],
    },
    {
      title: '小菜的第一版：互相认识',
      text: '小菜把它写成代码：前台类 `Secretary` 里存着一个**看股票同事的列表**，老板来了就挨个通知；同事类 `StockObserver` 里也存着前台，好去读“老板回来了”的消息。两个具体类**你中有我，我中有你**。',
      clear: true,
      show: ['sec1', 'stk1', 'l_s2o', 'l_o2s'],
      focus: ['sec1', 'stk1', 'l_s2o', 'l_o2s'],
    },
    {
      title: '问题：双向耦合',
      text: '麻烦马上来了：想通知看 NBA 的同事？得改 `Secretary`。前台没空，换老板亲自通知？又得改 `StockObserver`。大鸟说这叫**双向耦合**——谁都离不开谁，**一动就要改一片**。',
      show: ['nba1'],
      set: { sec1: { strike: true, badge: '要改' }, stk1: { strike: true, badge: '也要改' } },
      focus: ['sec1', 'stk1', 'nba1'],
      bubbles: [
        { node: 'sec1', text: '加一种同事？**改我**！', side: 'bottom' },
        { node: 'nba1', text: '我也想被通知……', side: 'left', delay: 0.5 },
      ],
    },
    {
      title: '抽象观察者：Observer',
      text: '第一步，把同事们抽象一下：不管看股票还是看 NBA，都是“**等通知，收到就行动**”。于是有了抽象类**观察者** `Observer`，核心只有一个 `update()`。具体同事各自继承它，写自己的反应。',
      clear: true,
      show: ['obs', 'stkC', 'nbaC', 'l_stk', 'l_nba'],
      focus: ['obs', 'stkC', 'nbaC', 'l_stk', 'l_nba'],
    },
    {
      title: '抽象通知者：Subject',
      text: '第二步，通知的一方也抽象出来：**通知者**接口 `Subject`，能登记 `attach()`、退订 `detach()`、通知 `notifyObservers()`。老板 `Boss` 和前台 `Secretary` 都实现它——**谁都能当通知者**。',
      show: ['subj', 'bossC', 'secC', 'l_boss', 'l_sec'],
      focus: ['subj', 'bossC', 'secC', 'l_boss', 'l_sec'],
    },
    {
      title: '两边都只认抽象',
      text: '现在通知者手里攥着一份 `List<Observer>` 名单，观察者也只认识抽象的 `Subject`。**双方都依赖抽象，不依赖具体**：加一种同事、换一个通知者，另一边的代码**一行都不用改**。',
      show: ['l_agg', 'l_dep'],
      focus: ['subj', 'obs', 'l_agg', 'l_dep'],
    },
    {
      title: '登记：attach()',
      text: '跑起来看看。这次老板**胡汉三**自己当通知者。同事们先通过 `attach()` **登记到名单上**：魏关姹、易管查。名单就是一个 `List<Observer>`，可以随时加人、减人。',
      clear: true,
      show: ['hu', 'list', 'o1', 'o2'],
      set: { list: { sub: '① 魏关姹\n② 易管查' } },
      focus: ['list', 'o1', 'o2'],
      flows: [
        { from: 'o1', to: 'list', label: 'attach(魏关姹)', curve: -30 },
        { from: 'o2', to: 'list', label: 'attach(易管查)' },
      ],
    },
    {
      title: '广播：一喊全响应',
      text: '老板回来了！他把状态改成“**我胡汉三回来了**”，然后调用 `notifyObservers()`：**遍历名单**，调用每个人的 `update()`。看股票的关行情，看 NBA 的关直播——**一个变化，所有登记者一起响应**。',
      focus: ['hu', 'list', 'o1', 'o2'],
      flows: [
        { from: 'hu', to: 'o1', label: 'update()', step: 0 },
        { from: 'hu', to: 'o2', label: 'update()', step: 0 },
      ],
      bubbles: [
        { node: 'hu', text: '我胡汉三**回来了**！', side: 'top' },
        { node: 'o1', text: '关闭股票行情，继续工作！', side: 'right', step: 0 },
        { node: 'o2', text: '关闭 NBA 直播，继续工作！', side: 'right', step: 0 },
      ],
    },
    {
      title: '退订：detach()',
      text: '那魏关姹为什么被抓？书里的代码中，他被 `detach()` **从名单上移除**了。于是 `notifyObservers()` 只通知到易管查，魏关姹还在看股票……**不在名单上，就收不到通知。**',
      set: { list: { sub: '② 易管查' }, o1: { opacity: 0.55, badge: '已退订' } },
      focus: ['list', 'o1', 'o2', 'hu'],
      flows: [
        { from: 'o1', to: 'list', label: 'detach(魏关姹)', tone: 'red', curve: -30 },
        { from: 'hu', to: 'o2', label: 'update()' },
      ],
      bubbles: [
        { node: 'o2', text: '关闭 NBA 直播！', side: 'right', step: 1 },
        { node: 'o1', text: '还在看股票……被抓了 😱', side: 'right', step: 1, delay: 0.4 },
      ],
    },
    {
      title: '换通知者、加观察者',
      text: '这次换前台**童子喆**当通知者，再来一位看剧的新同事：只需新写一个继承 `Observer` 的类，登记进名单。通知者换了、观察者多了，`notifyObservers()` 照样**一次通知到所有人**，**双方都不用改代码**。',
      hide: ['hu'],
      show: ['tz', 'o3'],
      set: { list: { sub: '① 魏关姹\n② 易管查\n③ 新同事' }, o1: { opacity: 1, badge: '' } },
      focus: ['tz', 'o1', 'o2', 'o3', 'list'],
      flows: [
        { from: 'tz', to: 'o1', label: 'update()', step: 0 },
        { from: 'tz', to: 'o2', label: 'update()', step: 0 },
        { from: 'tz', to: 'o3', label: 'update()', step: 0 },
      ],
      bubbles: [
        { node: 'o1', text: '关闭股票行情！', side: 'right', step: 0 },
        { node: 'o2', text: '关闭 NBA 直播！', side: 'right', step: 0 },
        { node: 'o3', text: '关掉电视剧！', side: 'right', step: 0 },
      ],
    },
    {
      title: '进阶：事件委托',
      text: '还有个限制：如果同事的方法名不统一，一个叫“关闭股票行情”，一个叫“关闭 NBA 直播”，没有共同的 `update()` 怎么办？书中用 C# 的**事件委托**：通知者只存“**要调用的方法**”。Java 里可用函数式接口 + 方法引用。',
      clear: true,
      show: ['bossD', 'stkD', 'nbaD', 'l_dD1', 'l_dD2', 'tipD'],
      flows: [
        { from: 'bossD', to: 'stkD', label: 'closeStockMarket()', step: 0 },
        { from: 'bossD', to: 'nbaD', label: 'closeNBADirectSeeding()', step: 0 },
      ],
    },
    {
      title: '总结：观察者模式',
      text: '观察者模式又叫**发布-订阅**：**Subject**（通知者）维护一份名单，状态一变就通知所有人；**Observer**（观察者）只管实现 `update()`。双方都只依赖抽象。一句话记住：**状态一变喊一声，登记的人全知道。**',
      clear: true,
      show: ['subj', 'obs', 'bossC', 'secC', 'stkC', 'nbaC', 'l_stk', 'l_nba', 'l_boss', 'l_sec', 'l_agg', 'l_dep'],
      focus: ['subj', 'obs', 'l_agg'],
      bubbles: [
        { node: 'subj', text: '状态一变，我就**通知名单上的所有人**', side: 'bottom' },
        { node: 'obs', text: '我只等 **update()** 被调用', side: 'bottom' },
      ],
    },
  ],
});
