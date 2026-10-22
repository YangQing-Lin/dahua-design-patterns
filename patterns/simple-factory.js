DP.register({
  id: 'simple-factory',
  order: 1,
  type: 'creational',
  name: '简单工厂模式',
  en: 'Simple Factory',
  emoji: '🏭',
  chapter: '第 1 章 · 代码无错就是优？',
  mnemonic: '报上名字给工厂，new 谁它说了算',
  summary: '由一个工厂类根据参数决定 new 哪个子类，客户端只认识工厂和父类。',
  intent: '由一个工厂对象根据传入的参数，决定创建出哪一种产品类的实例。（它不属于 GoF 的 23 种设计模式，但它是本书的起点。）',
  story: '小菜去面试，题目是写一个**计算器**控制台程序。他很快交卷却没了下文。大鸟一看：变量叫 A、B、C，除数为 0 不处理，计算和界面搅在一起。大鸟用**活字印刷**讲了“可维护、可复用、可扩展、灵活性好”，带他把运算拆成 `Operation` 和加减乘除子类，再用 **简单工厂** 根据运算符造出对应的对象。',
  analogy: '奶茶店点单：你只对前台说“一杯珍珠奶茶”，前台按单子让后厨做出对应的饮品交给你。你不用知道是谁做的、怎么做的——前台就是那个 switch，菜单上加新品时，前台的单子也得跟着改。',
  when: [
    '有一组**同一父类**的子类，要根据条件（字符串、配置）决定创建哪一个',
    '不想让客户端到处写 `new 具体类`，希望把创建逻辑**集中到一处**',
    '产品种类不多、也不常增加',
  ],
  pros: ['客户端和具体类**解耦**：只认识工厂和父类', '创建逻辑集中在一个地方，便于维护', '业务和界面分开后，计算类可以在控制台、Web、手机里**复用**'],
  cons: ['每加一种产品都要**修改工厂的 switch**，违背开放-封闭原则', '工厂类集中了全部创建逻辑，它一出错，所有产品都受影响'],
  keyPoints: [
    '三个角色：**工厂** `OperationFactory`、**抽象产品** `Operation`、**具体产品** `OperationAdd` 等',
    '第 1 章的三步：先**业务与界面分离**（封装），再用**继承 + 多态**把每种运算拆开，最后用**简单工厂**决定实例化谁',
    '不属于 GoF 23 种模式，却是理解工厂方法、抽象工厂的起点',
  ],
  code: `
// 运算父类（抽象产品）：两个数 + 一个“算结果”的方法
abstract class Operation {
    public double numberA, numberB;
    public abstract double getResult();
}
class OperationAdd extends Operation {
    public double getResult() { return numberA + numberB; }
}
class OperationSub extends Operation {
    public double getResult() { return numberA - numberB; }
}
class OperationMul extends Operation {
    public double getResult() { return numberA * numberB; }
}
class OperationDiv extends Operation {
    public double getResult() {
        if (numberB == 0) throw new ArithmeticException("除数不能为0");
        return numberA / numberB;
    }
}
// 简单工厂：根据运算符决定 new 哪个子类
class OperationFactory {
    public static Operation createOperate(String operate) {
        switch (operate) {
            case "+": return new OperationAdd();
            case "-": return new OperationSub();
            case "*": return new OperationMul();
            case "/": return new OperationDiv();
            // 要加“平方根”？除了写新类，还得回来改这里
            default: throw new IllegalArgumentException("不支持的运算符");
        }
    }
}
// 客户端：只认识工厂和 Operation
Operation oper = OperationFactory.createOperate("+");
oper.numberA = 1;
oper.numberB = 2;
double result = oper.getResult();   // 3.0`,
  codePython: `
from abc import ABC, abstractmethod


# 运算父类（抽象产品）：两个数 + 一个“算结果”的方法
class Operation(ABC):
    def __init__(self):
        self.number_a = 0
        self.number_b = 0

    @abstractmethod
    def get_result(self) -> float: ...


class OperationAdd(Operation):
    def get_result(self): return self.number_a + self.number_b


class OperationSub(Operation):
    def get_result(self): return self.number_a - self.number_b


class OperationMul(Operation):
    def get_result(self): return self.number_a * self.number_b


class OperationDiv(Operation):
    def get_result(self):
        if self.number_b == 0:
            raise ZeroDivisionError("除数不能为0")
        return self.number_a / self.number_b


# 简单工厂：Python 里一张“运算符 → 类”的字典就够了，不需要 switch
class OperationFactory:
    _classes = {"+": OperationAdd, "-": OperationSub,
                "*": OperationMul, "/": OperationDiv}

    @staticmethod
    def create_operate(operate: str) -> Operation:
        # 要加“平方根”？除了写新类，还得回来改这张表
        if operate not in OperationFactory._classes:
            raise ValueError("不支持的运算符")
        return OperationFactory._classes[operate]()


# 客户端：只认识工厂和 Operation
if __name__ == "__main__":
    oper = OperationFactory.create_operate("+")
    oper.number_a, oper.number_b = 1, 2
    print(oper.get_result())             # 3
    div = OperationFactory.create_operate("/")
    div.number_a, div.number_b = 1, 0
    try:
        div.get_result()
    except ZeroDivisionError as e:
        print("出错：", e)               # 出错： 除数不能为0`,
  codeGo: `
package main

import (
	"errors"
	"fmt"
)

// 运算接口（抽象产品）：Go 没有继承，用接口表达“父类”
type Operation interface {
	GetResult() (float64, error) // 除数为 0 时返回 error，而不是抛异常
}

// 两个操作数放进嵌入结构体，各运算通过组合复用（代替继承）
type Base struct{ NumberA, NumberB float64 }

type OperationAdd struct{ Base }
type OperationSub struct{ Base }
type OperationMul struct{ Base }
type OperationDiv struct{ Base }

func (o OperationAdd) GetResult() (float64, error) { return o.NumberA + o.NumberB, nil }
func (o OperationSub) GetResult() (float64, error) { return o.NumberA - o.NumberB, nil }
func (o OperationMul) GetResult() (float64, error) { return o.NumberA * o.NumberB, nil }
func (o OperationDiv) GetResult() (float64, error) {
	if o.NumberB == 0 {
		return 0, errors.New("除数不能为0")
	}
	return o.NumberA / o.NumberB, nil
}

// 简单工厂：就是一个返回接口的函数，根据运算符决定造哪个
func CreateOperate(operate string, a, b float64) (Operation, error) {
	base := Base{a, b}
	switch operate {
	case "+":
		return OperationAdd{base}, nil
	case "-":
		return OperationSub{base}, nil
	case "*":
		return OperationMul{base}, nil
	case "/":
		return OperationDiv{base}, nil
	}
	// 要加“平方根”？除了写新类型，还得回来改这里
	return nil, errors.New("不支持的运算符")
}

// 客户端：只认识工厂函数和 Operation 接口
func main() {
	oper, _ := CreateOperate("+", 1, 2)
	result, _ := oper.GetResult()
	fmt.Println(result) // 3

	div, _ := CreateOperate("/", 1, 0)
	if _, err := div.GetResult(); err != nil {
		fmt.Println("出错：", err) // 出错： 除数不能为0
	}
}`,
  compare: [
    { id: 'factory-method', text: '简单工厂把“new 谁”写在**一个 switch** 里，加产品就得改工厂；工厂方法给**每个产品配一个工厂**，加产品只加类、不改旧代码。' },
    { id: 'strategy', text: '简单工厂的目的是**造出对象**交给你；策略模式关心的是**用哪种算法**，客户端通过 Context 调用，算法可随时替换。' },
  ],
  quiz: [
    { q: '绘图软件里，用户在工具栏点“圆形 / 矩形 / 三角形”，程序把这个字符串交给一个类，由它内部的 switch 判断并 new 出对应的图形对象，调用方只拿到一个 Shape 父类引用。', why: '一个类根据参数集中决定实例化哪个子类，客户端只认识它和父类——简单工厂。' },
    { q: '支付模块里有个 PaymentCreator.create(type) 静态方法，根据 "alipay" / "wechat" / "card" 返回不同的支付对象；每接入一种新支付方式，都要回到这个方法里加一个 case。', why: '一个工厂 + 一个 switch，加产品要改工厂——这正是简单工厂的特点（也是它的缺点）。' },
  ],

  nodes: {
    // 场景一：面试
    xc: { kind: 'actor', icon: '👨‍💻', label: '小菜', sub: '应聘程序员', x: 200, y: 280, tone: 'blue' },
    exam: { kind: 'box', shape: 'note', icon: '📝', label: '面试题', sub: '用任意一种面向对象语言，写一个计算器控制台程序：输入两个数和运算符，得到结果。', w: 300, x: 610, y: 280 },
    bad: {
      kind: 'class', title: 'Program', sub: '小菜的答卷：一个 main 写到底', x: 430, y: 290, tone: 'red',
      lines: ['A = 读入("请输入数字A")', 'B = 读入("请选择运算符")', 'C = 读入("请输入数字B")', 'if (B == "+") D = A + C;', 'if (B == "-") D = A - C;', 'if (B == "*") D = A * C;', 'if (B == "/") D = A / C;', '输出("结果是：" + D)'],
    },
    dn: { kind: 'actor', icon: '🦅', label: '大鸟', sub: '资深程序员', x: 870, y: 290, tone: 'orange' },

    // 场景二：活字印刷
    cao: { kind: 'actor', icon: '👑', label: '曹操', sub: '酒后吟诗', x: 170, y: 230, tone: 'purple', size: 'lg' },
    board: { kind: 'box', icon: '📜', label: '喝酒唱歌，人生真爽', sub: '刻好的整块雕版', x: 560, y: 230, tone: 'orange', size: 'lg' },
    c1: { kind: 'box', shape: 'chip', size: 'lg', label: '对', x: 378, y: 490, tone: 'orange' },
    c2: { kind: 'box', shape: 'chip', size: 'lg', label: '酒', x: 428, y: 400, tone: 'gray' },
    c3: { kind: 'box', shape: 'chip', size: 'lg', label: '当', x: 478, y: 490, tone: 'orange' },
    c4: { kind: 'box', shape: 'chip', size: 'lg', label: '歌', x: 528, y: 400, tone: 'gray' },
    c5: { kind: 'box', shape: 'chip', size: 'lg', label: '人', x: 592, y: 400, tone: 'gray' },
    c6: { kind: 'box', shape: 'chip', size: 'lg', label: '生', x: 642, y: 400, tone: 'gray' },
    c7: { kind: 'box', shape: 'chip', size: 'lg', label: '几', x: 692, y: 490, tone: 'orange' },
    c8: { kind: 'box', shape: 'chip', size: 'lg', label: '何', x: 742, y: 490, tone: 'orange' },
    four: { kind: 'text', text: '可维护 · 可复用 · 可扩展 · 灵活性好', x: 560, y: 495, tone: 'green', size: 'lg' },

    // 场景三：代码
    client: { kind: 'actor', icon: '🖥️', label: '客户端', sub: '控制台界面', x: 200, y: 280, tone: 'gray' },
    op: { kind: 'class', title: 'Operation', sub: '运算类（业务逻辑）', lines: ['+ getResult(A, B, 运算符)', '\u00a0\u00a0switch (运算符) { … }', '\u00a0\u00a0除数为 0 → 给出提示'], x: 590, y: 280, tone: 'purple' },
    add: { kind: 'class', title: 'OperationAdd', sub: '加法', x: 392, y: 265, tone: 'teal', scale: 0.88 },
    sub: { kind: 'class', title: 'OperationSub', sub: '减法', x: 524, y: 265, tone: 'teal', scale: 0.88 },
    mul: { kind: 'class', title: 'OperationMul', sub: '乘法', x: 656, y: 265, tone: 'teal', scale: 0.88 },
    div: { kind: 'class', title: 'OperationDiv', sub: '除法（会查除数）', x: 788, y: 265, tone: 'teal', scale: 0.88 },
    sqrt: { kind: 'class', title: 'OperationSqrt', sub: '平方根', x: 920, y: 265, tone: 'orange', scale: 0.88, badge: 'NEW' },
    fac: {
      kind: 'class', title: 'OperationFactory', sub: '简单工厂', x: 300, y: 440, tone: 'indigo',
      lines: ['+ static createOperate(op)', '\u00a0\u00a0switch (op) {', '\u00a0\u00a0\u00a0\u00a0case "+": new OperationAdd', '\u00a0\u00a0\u00a0\u00a0case "-": new OperationSub', '\u00a0\u00a0\u00a0\u00a0case "*": new OperationMul', '\u00a0\u00a0\u00a0\u00a0case "/": new OperationDiv', '\u00a0\u00a0}'],
    },
  },
  links: {
    l_add: { from: 'add', to: 'op', kind: 'inherit' },
    l_sub: { from: 'sub', to: 'op', kind: 'inherit' },
    l_mul: { from: 'mul', to: 'op', kind: 'inherit' },
    l_div: { from: 'div', to: 'op', kind: 'inherit' },
    l_sq: { from: 'sqrt', to: 'op', kind: 'inherit' },
    l_co: { from: 'client', to: 'op', kind: 'assoc', label: '只认识父类', labelAt: 0.42 },
    l_cf: { from: 'client', to: 'fac', kind: 'assoc' },
    l_fadd: { from: 'fac', to: 'add', kind: 'depend' },
    l_fsub: { from: 'fac', to: 'sub', kind: 'depend' },
    l_fmul: { from: 'fac', to: 'mul', kind: 'depend' },
    l_fdiv: { from: 'fac', to: 'div', kind: 'depend' },
    l_fsq: { from: 'fac', to: 'sqrt', kind: 'depend' },
  },

  frames: [
    {
      title: '一道面试题',
      text: '第一章从一场面试开始。题目是：用任意一种面向对象语言，写一个**计算器**控制台程序，输入两个数和运算符，输出结果。小菜觉得太简单，十来分钟就交了卷，结果……石沉大海。',
      show: ['xc', 'exam'],
      flows: [{ from: 'xc', to: 'exam', icon: '✍️', label: '十分钟交卷' }],
      bubbles: [{ node: 'xc', text: '这题也太简单了！', side: 'top' }],
    },
    {
      title: '小菜的答卷',
      text: '小菜的代码大概是这样：一个 `main` 从头写到尾，变量叫 A、B、C、D，四个 `if` 依次判断运算符。**能跑，结果也对**。那面试官为什么不满意？',
      clear: true,
      show: ['xc', 'bad'],
      set: { xc: { x: 150, y: 290 } },
      focus: ['bad'],
      bubbles: [{ node: 'xc', text: '能跑，结果也对啊！', side: 'top' }],
    },
    {
      title: '大鸟挑刺：代码无错≠优',
      text: '大鸟一眼挑出毛病：变量名 A、B、C 没人看得懂；除数输入 0 程序就崩；最要命的是**计算和界面搅在一起**，想做成 Windows 版、Web 版只能整个重写。“代码无错”离“好代码”还远着呢。',
      show: ['dn'],
      set: {
        bad: {
          badge: '三处硬伤',
          lines: ['!A = 读入("请输入数字A")', '!B = 读入("请选择运算符")', '!C = 读入("请输入数字B")', 'if (B == "+") D = A + C;', 'if (B == "-") D = A - C;', 'if (B == "*") D = A * C;', '!if (B == "/") D = A / C;', '!输出("结果是：" + D)'],
        },
      },
      focus: ['bad', 'dn'],
      bubbles: [
        { node: 'bad', text: '① 命名：A、B、C 是啥？', side: 'right', dy: -70, tone: 'red' },
        { node: 'bad', text: '② 除数是 **0** 怎么办？', side: 'right', dy: 0, tone: 'red', delay: 0.6 },
        { node: 'bad', text: '③ **计算和界面**混在一起', side: 'right', dy: 70, tone: 'red', delay: 1.2 },
        { node: 'dn', text: '代码无错就是优？', side: 'top', delay: 1.8 },
      ],
    },
    {
      title: '曹操刻诗',
      text: '大鸟先讲了个故事：曹操在宴席上一高兴，吟出“喝酒唱歌，人生真爽”。众人齐声叫好，他便命工匠**刻成一整块雕版**，准备印出来让大家传阅。',
      clear: true,
      show: ['cao', 'board'],
      flows: [{ from: 'cao', to: 'board', icon: '🔨', label: '刻成雕版' }],
      bubbles: [{ node: 'cao', text: '喝酒唱歌，人生真爽！', side: 'top' }],
    },
    {
      title: '改一句诗，整版作废',
      text: '第二天曹操觉得太俗，改成“**对酒当歌，人生几何**”。雕版是一整块刻死的，改几个字也得**整块重刻**，工匠欲哭无泪。小菜那段 main 也一样：动一处，就得整个重来。',
      set: { board: { strike: true, badge: '整块重刻' } },
      focus: ['cao', 'board'],
      bubbles: [{ node: 'cao', text: '改成**对酒当歌，人生几何**！', side: 'top' }],
    },
    {
      title: '活字印刷：只换四个字',
      text: '要是用**活字印刷**：只换“喝、唱、真、爽”四个字，“酒、歌、人、生”照用。这就是好程序的四个标准：**可维护**（只改要改的）、可复用（字能反复用）、可扩展（加字另刻）、灵活性好（横排竖排随便排）。',
      show: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'four', 'dn'],
      set: { c1: { y: 400 }, c3: { y: 400 }, c7: { y: 400 }, c8: { y: 400 } },
      focus: ['c1', 'c3', 'c7', 'c8', 'four', 'dn'],
      dim: false,
      bubbles: [{ node: 'dn', text: '程序也该像**活字**一样！', side: 'top', delay: 0.8 }],
    },
    {
      title: '第一步：业务和界面分开',
      text: '回到代码。第一步是**封装**：把“计算”从界面里拆出来，放进 `Operation` 类；控制台只管输入输出。这样 Windows 版、Web 版、手机版都能**复用**同一段计算。',
      clear: true,
      show: ['client', 'op'],
      focus: ['client', 'op'],
      flows: [
        { from: 'client', to: 'op', label: '1, 2, "+"' },
        { from: 'op', to: 'client', label: '3', back: true, tone: 'teal' },
      ],
    },
    {
      title: '第二步：每种运算一个类',
      text: '第二步：**继承 + 多态**。`Operation` 变成父类，只留两个数和一个 `getResult()`；加减乘除各写一个子类。要改乘法时，根本碰不到加法的代码，也就不会把加法改坏。',
      show: ['add', 'sub', 'mul', 'div', 'l_add', 'l_sub', 'l_mul', 'l_div'],
      set: {
        client: { x: 90, y: 280 },
        op: { y: 105, stereo: 'abstract', sub: '运算类（抽象产品）', lines: ['+ numberA, numberB', '+ getResult()'] },
      },
      focus: ['op', 'add', 'sub', 'mul', 'div'],
    },
    {
      title: '第三步：谁来 new？工厂',
      text: '新问题：客户端怎么知道该 new 哪个子类？交给**简单工厂** `OperationFactory`：给它一个运算符，它返回对应的子类对象。从此客户端只认识两个类——**工厂**和 **Operation**。',
      show: ['fac', 'l_cf', 'l_co', 'l_fadd', 'l_fsub', 'l_fmul', 'l_fdiv'],
      focus: ['fac', 'client', 'l_cf', 'l_co', 'op'],
    },
    {
      title: '跑一遍：1 + 2',
      text: '跑一遍：客户端对工厂说 `"+"`，工厂 new 出 `OperationAdd`，以 **Operation** 的身份交回来；客户端填好 1 和 2，调用 `getResult()` 得到 3。整个过程，客户端**从没写过** `new OperationAdd()`。',
      set: { fac: { lines: ['+ static createOperate(op)', '\u00a0\u00a0switch (op) {', '!\u00a0\u00a0\u00a0\u00a0case "+": new OperationAdd', '\u00a0\u00a0\u00a0\u00a0case "-": new OperationSub', '\u00a0\u00a0\u00a0\u00a0case "*": new OperationMul', '\u00a0\u00a0\u00a0\u00a0case "/": new OperationDiv', '\u00a0\u00a0}'] } },
      focus: ['client', 'fac', 'add', 'l_fadd'],
      flows: [
        { from: 'client', to: 'fac', label: '"+"' },
        { from: 'fac', to: 'add', label: 'new' },
        { from: 'fac', to: 'client', label: 'Operation', back: true, tone: 'indigo' },
        { from: 'client', to: 'add', label: '1, 2 → getResult()' },
        { from: 'add', to: 'client', label: '3', back: true, tone: 'teal' },
      ],
    },
    {
      title: '换成除法：只换一个符号',
      text: '换成除法：客户端只把 `"+"` 换成 `"/"`，别的代码一字不改。输入 8 和 0？`OperationDiv` 自己检查除数，给出“除数不能为0”——大鸟挑的毛病，被**关进了各自的类里**。',
      set: { fac: { lines: ['+ static createOperate(op)', '\u00a0\u00a0switch (op) {', '\u00a0\u00a0\u00a0\u00a0case "+": new OperationAdd', '\u00a0\u00a0\u00a0\u00a0case "-": new OperationSub', '\u00a0\u00a0\u00a0\u00a0case "*": new OperationMul', '!\u00a0\u00a0\u00a0\u00a0case "/": new OperationDiv', '\u00a0\u00a0}'] } },
      focus: ['client', 'fac', 'div', 'l_fdiv'],
      flows: [
        { from: 'client', to: 'fac', label: '"/"' },
        { from: 'fac', to: 'div', label: 'new' },
        { from: 'fac', to: 'client', label: 'Operation', back: true, tone: 'indigo' },
        { from: 'client', to: 'div', label: '8, 0 → getResult()' },
        { from: 'div', to: 'client', label: '⚠ 除数不能为0', back: true, tone: 'red' },
      ],
    },
    {
      title: '加平方根：工厂也得改',
      text: '要加**平方根**：新写一个 `OperationSqrt` 继承 Operation，加减乘除一个都不用碰，很好。可工厂的 `switch` **也得打开来改**。每加一种运算就改一次工厂，违背了开放-封闭原则——第 8 章的工厂方法会解决它。',
      show: ['sqrt', 'l_sq', 'l_fsq'],
      set: {
        op: { x: 656 },
        fac: { badge: '还得改这里', lines: ['+ static createOperate(op)', '\u00a0\u00a0switch (op) {', '\u00a0\u00a0\u00a0\u00a0case "+": new OperationAdd', '\u00a0\u00a0\u00a0\u00a0case "-": new OperationSub', '\u00a0\u00a0\u00a0\u00a0case "*": new OperationMul', '\u00a0\u00a0\u00a0\u00a0case "/": new OperationDiv', '!\u00a0\u00a0\u00a0\u00a0case "√": new OperationSqrt', '\u00a0\u00a0}'] },
      },
      focus: ['sqrt', 'fac', 'l_sq', 'l_fsq'],
    },
    {
      title: '总结：简单工厂',
      text: '简单工厂三个角色：**工厂**（根据参数决定 new 谁）、抽象产品 `Operation`、具体产品加减乘除。它不在 GoF 的 23 种模式里，却是全书的起点。一句话记住：**报上名字给工厂，new 谁它说了算。**',
      set: {
        sqrt: { badge: '' },
        fac: { badge: '', lines: ['+ static createOperate(op)', '\u00a0\u00a0switch (op) {', '\u00a0\u00a0\u00a0\u00a0case "+": new OperationAdd', '\u00a0\u00a0\u00a0\u00a0case "-": new OperationSub', '\u00a0\u00a0\u00a0\u00a0case "*": new OperationMul', '\u00a0\u00a0\u00a0\u00a0case "/": new OperationDiv', '\u00a0\u00a0\u00a0\u00a0case "√": new OperationSqrt', '\u00a0\u00a0}'] },
      },
      focus: ['fac', 'op', 'client', 'l_cf', 'l_co'],
      bubbles: [
        { node: 'fac', text: '给我一个符号，还你一个对象', side: 'right' },
        { node: 'client', text: '我只认识工厂和父类', side: 'bottom' },
      ],
    },
  ],
});
