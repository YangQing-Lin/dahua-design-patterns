DP.register({
  id: 'singleton',
  order: 21,
  type: 'creational',
  name: '单例模式',
  en: 'Singleton',
  emoji: '☝️',
  chapter: '第 21 章 · 有些类也需计划生育',
  mnemonic: '关掉 new 的门，全局只留一个',
  summary: '保证一个类只有一个实例，并提供一个访问它的全局访问点。',
  intent: '保证一个类仅有一个实例，并提供一个访问它的全局访问点。',
  story: '小菜写了个窗体程序：点“工具箱”菜单就弹出一个工具箱窗口，结果每点一次就**多出一个**。他先在主窗体里加了个 `if (ftb == null)` 判断，可工具栏按钮也要打开工具箱，判断就得到处复制。大鸟说：“只能有一个”应该是**工具箱这个类自己**的职责——把构造方法藏起来，只留一个 `getInstance()` 出口。书里还讲了多线程下的**双重锁定**，以及**懒汉式 / 饿汉式**两种写法。',
  analogy: '公司的**公章**只有一枚：谁要盖章，都得去行政那里用同一枚，绝不允许自己私刻一个。“私刻”就是 new，行政窗口就是 getInstance()。',
  when: [
    '系统里**只应该有一个**的东西：配置中心、线程池、日志器、窗口里的工具箱',
    '需要一个**全局访问点**，又不希望别人随手 new',
    '创建代价大、需要被大家共享的对象',
  ],
  pros: ['严格控制实例数量，**不会重复创建**', '全局访问点，用起来方便', '懒汉式可以等到第一次用时才创建，节省资源'],
  cons: ['本质是全局变量，**滥用会把依赖藏起来**，也不好写单元测试', '多线程下必须小心处理（加锁 / 双重锁定）', '一个类既管业务又管“只能有一个”，职责变多'],
  keyPoints: [
    '三件套：**私有构造方法**（关门）+ **私有静态变量**（唯一的那一个）+ **公有静态 `getInstance()`**（唯一出口）',
    '**懒汉式**：第一次调用才创建，多线程下要用**双重锁定**（外层判断免排队，内层判断防重复）',
    '**饿汉式**：类加载时就创建（静态初始化），天然线程安全，但可能早早占用资源',
    'Java 里双重锁定的实例变量要加 `volatile`，防止指令重排拿到“半成品”',
  ],
  code: `
// 懒汉式 + 双重锁定
class ToolBox {
    private static volatile ToolBox instance;   // 唯一的那一个
    private ToolBox() { }                         // 关门：外面不能 new

    public static ToolBox getInstance() {         // 唯一出口
        if (instance == null) {                   // 第一重：已经有了就别排队
            synchronized (ToolBox.class) {
                if (instance == null) {           // 第二重：防止排队进来的线程重复创建
                    instance = new ToolBox();
                }
            }
        }
        return instance;
    }
}

// 饿汉式：类一加载就创建好，天然线程安全
class ToolBoxEager {
    private static final ToolBoxEager INSTANCE = new ToolBoxEager();
    private ToolBoxEager() { }
    public static ToolBoxEager getInstance() { return INSTANCE; }
}

// 客户端
ToolBox a = ToolBox.getInstance();
ToolBox b = ToolBox.getInstance();
System.out.println(a == b);   // true：两个变量指向同一个对象
// ToolBox c = new ToolBox(); // 编译错误：构造方法是 private 的`,
  codePython: `
import threading


# 懒汉式 + 双重锁定
class ToolBox:
    _instance = None                          # 唯一的那一个
    _lock = threading.Lock()

    def __new__(cls):                         # Python 没有 private 构造，拦截 __new__ 来“关门”
        if cls._instance is None:             # 第一重：已经有了就别排队
            with cls._lock:
                if cls._instance is None:     # 第二重：防止排队进来的线程重复创建
                    cls._instance = super().__new__(cls)
        return cls._instance


# 饿汉式：模块加载时就创建好，天然线程安全
class ToolBoxEager:
    pass


TOOL_BOX = ToolBoxEager()                     # 模块级实例：Python 里最常见的单例写法，
                                              # 别处 from 本模块 import TOOL_BOX 即可


# 客户端
if __name__ == "__main__":
    a = ToolBox()
    b = ToolBox()
    print(a is b)                             # True：两个变量指向同一个对象
    print(a == b)                             # True：默认的 == 比较的也是身份`,
  codeGo: `
package main

import (
	"fmt"
	"sync"
)

// 懒汉式：Go 里 sync.Once 就是标准写法，
// 它内部已经做好了“加锁 + 双重检查”，不用手写双重锁定
type ToolBox struct{}

var (
	instance *ToolBox
	once     sync.Once
)

// 唯一出口。Go 没有 private 构造方法：ToolBox 类型小写化或只暴露 GetInstance 即可“关门”
func GetInstance() *ToolBox {
	once.Do(func() { // 无论多少个 goroutine 同时来，函数体只执行一次
		instance = &ToolBox{}
	})
	return instance
}

// 饿汉式：包初始化时就创建好，天然线程安全
type ToolBoxEager struct{ Name string }

var eager = &ToolBoxEager{"工具箱"}

func GetEager() *ToolBoxEager { return eager }

// 客户端
func main() {
	a := GetInstance()
	b := GetInstance()
	fmt.Println(a == b)                   // true：两个指针指向同一个对象
	fmt.Println(GetEager() == GetEager()) // true
}`,
  compare: [
    { id: 'flyweight', text: '单例是一个类**只有一个**实例；享元是按“种类”共享，**每种一个**、可以有很多种，还要区分内部状态和外部状态。' },
    { id: 'factory-method', text: '工厂负责“造出哪种对象”，每次都可能造新的；单例的 `getInstance()` 永远**交出同一个**。' },
  ],
  quiz: [
    { q: '系统需要一个“全局配置管理器”：所有模块读到的必须是同一份配置；它加载很慢，绝不能被重复创建，也不允许别人自己 new 一个。', why: '只能有一个实例 + 全局访问点——单例。' },
    { q: '编辑器里点“查找替换”菜单，不管点多少次、从哪个入口点，都只能弹出同一个查找窗口，不能出现第二个。', why: '“只能有一个”应由类自己保证——单例。' },
  ],

  nodes: {
    xc: { kind: 'actor', icon: '👦', label: '小菜', x: 110, y: 290, tone: 'blue' },
    form: { kind: 'box', icon: '🖥️', label: '主窗体', sub: '菜单：工具箱', x: 330, y: 290, tone: 'blue' },
    btn2: { kind: 'box', icon: '🔘', label: '工具栏按钮', sub: '也能打开工具箱', x: 330, y: 130, tone: 'blue' },
    tb1: { kind: 'box', icon: '🧰', label: '工具箱', sub: '窗口 #1', x: 660, y: 160, tone: 'orange' },
    tb2: { kind: 'box', icon: '🧰', label: '工具箱', sub: '窗口 #2', x: 720, y: 280, tone: 'orange' },
    tb3: { kind: 'box', icon: '🧰', label: '工具箱', sub: '窗口 #3', x: 780, y: 400, tone: 'orange' },
    fix: {
      kind: 'class', title: 'FormMain', sub: '在调用处加判断', x: 330, y: 445, tone: 'gray',
      lines: ['if (ftb == null) {', '    ftb = new FormToolbox();', '}', 'ftb.show();'],
    },

    db: { kind: 'actor', icon: '🧔', label: '大鸟', x: 120, y: 120, tone: 'purple', size: 'sm' },
    sing: {
      kind: 'class', title: 'ToolBox', sub: '单例类', x: 480, y: 270, tone: 'purple',
      lines: ['- static instance', '- ToolBox()', '+ static getInstance()'],
    },
    ca: { kind: 'actor', icon: '👨‍💻', label: '代码 A', x: 130, y: 260, tone: 'gray', size: 'sm' },
    cb: { kind: 'actor', icon: '👩‍💻', label: '代码 B', x: 130, y: 430, tone: 'gray', size: 'sm' },
    inst: { kind: 'box', icon: '🧰', label: '唯一的工具箱', sub: 'ToolBox 实例', x: 820, y: 270, tone: 'orange' },

    th1: { kind: 'actor', icon: '🧵', label: '线程 1', x: 110, y: 190, tone: 'teal', size: 'sm' },
    th2: { kind: 'actor', icon: '🧵', label: '线程 2', x: 110, y: 400, tone: 'pink', size: 'sm' },
    lock: { kind: 'box', icon: '🔒', label: '锁', sub: 'synchronized', x: 275, y: 295, tone: 'gray' },
    inst2: { kind: 'box', icon: '🧰', label: '又一个工具箱！', sub: 'ToolBox 实例', x: 850, y: 420, tone: 'red' },

    lazy: { kind: 'box', icon: '🛌', label: '懒汉式', sub: '第一次用时才创建\n多线程要加锁（双重锁定）', x: 270, y: 170, w: 250, tone: 'teal', size: 'lg' },
    eager: { kind: 'box', icon: '🍚', label: '饿汉式', sub: '类一加载就创建好\n天然线程安全，但早早占资源', x: 730, y: 170, w: 250, tone: 'orange', size: 'lg' },
  },
  links: {
    l_tb2: { from: 'btn2', to: 'tb1', kind: 'dashed' },
    l_inst: { from: 'sing', to: 'inst', kind: 'assoc', label: 'instance' },
    l_ca: { from: 'ca', to: 'sing', kind: 'depend' },
    l_cb: { from: 'cb', to: 'sing', kind: 'depend' },
  },

  frames: [
    {
      title: '点一下，出一个工具箱',
      text: '第 21 章，小菜写了个窗体程序：点菜单里的“**工具箱**”，就弹出一个工具箱窗口，里面放着各种画图工具。看起来没毛病。',
      show: ['xc', 'form', 'tb1'],
      flows: [
        { from: 'xc', to: 'form', label: '点击「工具箱」' },
        { from: 'form', to: 'tb1', label: 'new FormToolbox()' },
      ],
    },
    {
      title: '再点……又一个！',
      text: '可多点几下，屏幕上就**冒出好几个一模一样的工具箱**。工具箱明明应该只有一个——这就是本章标题说的“计划生育”：**有些类，只能生一个**。',
      show: ['tb2', 'tb3'],
      set: { tb3: { badge: '×3' } },
      focus: ['xc', 'form', 'tb1', 'tb2', 'tb3'],
      flows: [
        { from: 'form', to: 'tb2', label: 'new' },
        { from: 'form', to: 'tb3', label: 'new' },
      ],
      bubbles: [{ node: 'xc', text: '怎么冒出**三个**工具箱？', side: 'top' }],
    },
    {
      title: '第一次修：调用处加判断',
      text: '小菜先在主窗体里加了个判断：工具箱变量 `ftb` 为 null 时才 new，否则直接显示原来那个。点多少次都只有一个了，问题**暂时**解决。',
      hide: ['tb2', 'tb3'],
      show: ['fix'],
      set: { tb1: { badge: '×1' } },
      focus: ['fix', 'form', 'tb1'],
    },
    {
      title: '可入口不止一个',
      text: '可工具栏上还有个按钮也能打开工具箱，判断就得**再复制一份**；以后入口更多呢？而且谁都可以随手 `new` 一个，“只能有一个”这件事，**根本没人管得住**。',
      show: ['btn2', 'l_tb2'],
      set: { fix: { badge: '判断要复制 N 份' } },
      focus: ['btn2', 'fix', 'l_tb2', 'tb1', 'xc'],
      bubbles: [{ node: 'xc', text: '入口一多，到处都是判断……', side: 'bottom' }],
    },
    {
      title: '大鸟：让类自己负责',
      text: '大鸟说：生不生、生几个，应该由**工具箱自己**说了算，而不是让每个调用者去操心。于是有了单例模式的**三件套**：私有构造、静态实例、静态出口。',
      clear: true,
      show: ['db', 'sing'],
      set: { tb1: { badge: '' } },
      focus: ['db', 'sing'],
      bubbles: [{ node: 'db', text: '“只能有一个”是**它自己**的职责', side: 'right' }],
    },
    {
      title: '第一件：关上 new 的门',
      text: '第一件：把构造方法设成 **private**。从此类外面谁也 `new` 不出工具箱——想偷偷再生一个？**编译都通不过**。门关上了。',
      hide: ['db'],
      show: ['ca', 'l_ca'],
      set: { sing: { lines: ['- static instance', '!- ToolBox()      // private', '+ static getInstance()'] } },
      focus: ['ca', 'sing'],
      flows: [{ from: 'ca', to: 'sing', label: 'new ToolBox() ✗', tone: 'red' }],
      bubbles: [{ node: 'sing', text: '编译错误：构造方法是 **private**', side: 'top', step: 0, tone: 'red' }],
    },
    {
      title: '第二件：唯一的出口',
      text: '第二件：类里放一个**私有静态变量** `instance`，存那唯一的实例；第三件：提供**公有静态方法** `getInstance()`。代码 A 第一次来要，发现还没有，就**当场创建一个**。',
      show: ['inst', 'l_inst'],
      set: { sing: { lines: ['!- static instance', '- ToolBox()', '!+ static getInstance()'] } },
      focus: ['ca', 'sing', 'inst', 'l_inst'],
      flows: [
        { from: 'ca', to: 'sing', label: 'getInstance()' },
        { from: 'sing', to: 'inst', label: '还没有 → 创建' },
        { from: 'sing', to: 'ca', label: '工具箱', back: true, tone: 'orange' },
      ],
    },
    {
      title: '再要？还是那一个',
      text: '之后不管谁来、调用多少次 `getInstance()`，拿到的都是**同一个对象**：`a == b` 为 true。工具箱再也不会冒出第二个了。',
      show: ['cb', 'l_cb'],
      set: { sing: { lines: ['- static instance', '- ToolBox()', '+ static getInstance()'] }, inst: { badge: '×1' } },
      focus: ['cb', 'ca', 'sing', 'inst'],
      flows: [
        { from: 'cb', to: 'sing', label: 'getInstance()' },
        { from: 'sing', to: 'cb', label: '同一个工具箱', back: true, tone: 'orange' },
      ],
      bubbles: [{ node: 'inst', text: '从头到尾**只有我一个**', side: 'bottom' }],
    },
    {
      title: '多线程：两人同时闯入',
      text: '但多线程下有坑：两个线程**同时**调用 `getInstance()`，都看到 `instance == null`，于是**各自 new 了一个**——单例又破功了。',
      clear: true,
      show: ['th1', 'th2', 'sing', 'inst', 'inst2', 'l_inst'],
      set: {
        sing: { x: 520, y: 290, lines: ['getInstance() {', '!  if (instance == null)', '!    instance = new ToolBox();', '  return instance;', '}'] },
        inst: { x: 850, y: 170, badge: '' },
        inst2: { badge: '×2 破功' },
      },
      flows: [
        { from: 'th1', to: 'sing', label: 'getInstance()', step: 0 },
        { from: 'th2', to: 'sing', label: 'getInstance()', step: 0 },
        { from: 'sing', to: 'inst', label: 'new', step: 1 },
        { from: 'sing', to: 'inst2', label: 'new', step: 1, tone: 'red' },
      ],
    },
    {
      title: '加锁：一次只放一个',
      text: '办法是**加锁**：同一时刻只放一个线程进去，另一个在门外等着。可如果每次调用都要加锁，实例早就创建好了还得排队，**太浪费性能**。',
      hide: ['inst2'],
      show: ['lock'],
      set: { sing: { lines: ['getInstance() {', '!  synchronized (锁) {', '    if (instance == null)', '      instance = new ToolBox();', '  }', '  return instance;', '}'] }, inst: { badge: '×1' } },
      focus: ['th1', 'th2', 'lock', 'sing'],
      flows: [
        { from: 'th1', to: 'lock', label: 'getInstance()', step: 0 },
        { from: 'th2', to: 'lock', label: 'getInstance()', step: 0 },
        { from: 'lock', to: 'sing', label: '只放 1 个', step: 1 },
      ],
      bubbles: [{ node: 'th2', text: '每次都排队……', side: 'right', step: 1 }],
    },
    {
      title: '双重锁定',
      text: '于是有了**双重锁定**：外层先判断一次——实例已经有了就直接返回，**不用排队**；还没有才加锁，锁里**再判断一次**，防止排队进来的线程重复创建。',
      hide: ['lock'],
      set: {
        sing: { x: 500, lines: ['getInstance() {', '!  if (instance == null) {      // 第一重', '    synchronized (锁) {', '!      if (instance == null)    // 第二重', '        instance = new ToolBox();', '    }', '  }', '  return instance;', '}'] },
      },
      focus: ['th1', 'th2', 'sing', 'inst'],
      flows: [
        { from: 'th2', to: 'sing', label: 'getInstance()' },
        { from: 'sing', to: 'th2', label: '已经有了，直接拿', back: true, tone: 'teal' },
      ],
      bubbles: [{ node: 'th2', text: '不用排队了！', side: 'right', step: 1 }],
    },
    {
      title: '懒汉式 vs 饿汉式',
      text: '单例有两种写法：**懒汉式**，用到时才创建，多线程要靠双重锁定；**饿汉式**，类一加载就创建好，天然线程安全，代价是早早占了资源。两种都是那三件套。',
      clear: true,
      show: ['lazy', 'eager', 'sing'],
      set: { sing: { x: 500, y: 410, lines: ['- static instance          // 唯一的那一个', '- ToolBox()                // 关门', '+ static getInstance()     // 唯一出口'] } },
      focus: ['lazy', 'eager'],
    },
    {
      title: '总结：单例模式',
      text: '单例模式就是一个类给自己搞“**计划生育**”：私有构造方法把 new 的门关上，静态变量存着唯一的实例，静态方法是唯一出口。一句话记住：**关掉 new 的门，全局只留一个。**',
      focus: ['sing'],
      bubbles: [
        { node: 'sing', text: '想要工具箱？只能找我拿', side: 'top' },
      ],
    },
  ],
});
