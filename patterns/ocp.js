DP.register({
  id: 'ocp',
  order: 4,
  type: 'principle',
  name: '开放-封闭原则',
  en: 'Open-Closed Principle',
  emoji: '🚪',
  chapter: '第 4 章 · 考研求职两不误',
  mnemonic: '扩展开门，修改关门：只加不改',
  summary: '需求变化时，靠增加新代码来应对，而不是去改已经能用的旧代码。',
  intent: '软件实体（类、模块、函数等）应该可以扩展，但是不可修改。',
  story: '小菜的同学一边准备**考研**一边**找工作**：复习这条主线不变，求职是额外加的一条路。大鸟借题发挥：香港回归时，国家没有修改根本制度，而是增加了“一国两制”的安排；公司为解决迟到，没改“每天 8 小时”，而是开放了上班时间。写代码也一样：计算器第一次要加减法时就抽象出 `Operation`，以后的乘除法都只是**新增类**。',
  analogy: '电脑的 USB 接口：想加鼠标、U 盘、摄像头，插上就能用，不用拆开主板重新焊接。接口标准对修改是关闭的，对新设备是开放的。',
  when: [
    '同一类需求**反复变化**：不断加新运算、新促销、新导出格式……',
    '已经上线、测试通过的代码，不希望每次需求变化都去动它',
    '发现自己总在同一个 `switch / if` 里加分支',
  ],
  pros: ['旧代码不动，就不会把原来好好的功能改坏', '新功能是独立的新类，便于测试和维护', '可维护、可扩展、可复用、灵活性好'],
  cons: ['需要抽象，设计更复杂，类会变多', '不可能对所有变化都封闭，过度抽象和不抽象一样有害'],
  keyPoints: [
    '书中金句：面对需求，对程序的改动是通过**增加新代码**进行的，而不是**更改现有的代码**',
    '最初写代码时，假设变化不会发生；**当变化第一次发生时**，立即创建抽象来隔离以后发生的同类变化',
    '只对程序中呈现出**频繁变化**的那些部分做出抽象；拒绝不成熟的抽象和抽象本身一样重要',
    '开放-封闭原则是面向对象设计的**核心**，其他原则和许多设计模式都在为它服务',
  ],
  code: `
// 第一次需求：只有加法 —— 先别急着抽象
// 第二次需求：要减法了！变化第一次发生，马上抽象出运算类
abstract class Operation {
    protected double numberA, numberB;
    public abstract double getResult();
}
class OperationAdd extends Operation {
    public double getResult() { return numberA + numberB; }
}
class OperationSub extends Operation {
    public double getResult() { return numberA - numberB; }
}
// 之后再要乘、除：只“增加”新类，上面的代码一行不改
class OperationMul extends Operation {
    public double getResult() { return numberA * numberB; }
}
class OperationDiv extends Operation {
    public double getResult() {
        if (numberB == 0) throw new ArithmeticException("除数不能为0");
        return numberA / numberB;
    }
}
// 客户端只面向抽象 Operation 编程
Operation op = new OperationMul();   // 配合工厂，连这一行都可以不改
op.numberA = 6;
op.numberB = 7;
double result = op.getResult();      // 42`,
  codePython: `
from abc import ABC, abstractmethod


# 第一次需求：只有加法 —— 先别急着抽象
# 第二次需求：要减法了！变化第一次发生，马上抽象出运算类
class Operation(ABC):
    def __init__(self, number_a: float, number_b: float):
        self.number_a, self.number_b = number_a, number_b

    @abstractmethod
    def get_result(self) -> float: ...


class OperationAdd(Operation):
    def get_result(self):
        return self.number_a + self.number_b


class OperationSub(Operation):
    def get_result(self):
        return self.number_a - self.number_b


# 之后再要乘、除：只“增加”新类，上面的代码一行不改
class OperationMul(Operation):
    def get_result(self):
        return self.number_a * self.number_b


class OperationDiv(Operation):
    def get_result(self):
        if self.number_b == 0:
            raise ValueError("除数不能为0")
        return self.number_a / self.number_b


# 客户端只面向抽象 Operation 编程
def calc(op: Operation) -> float:
    return op.get_result()


if __name__ == "__main__":
    print(calc(OperationMul(6, 7)))        # 42
    print(calc(OperationAdd(6, 7)))        # 13
    try:
        calc(OperationDiv(6, 0))
    except ValueError as e:
        print(e)                           # 除数不能为0
    # Python 小贴士：鸭子类型下，任何有 get_result() 的对象都能传给 calc`,
  codeGo: `
package main

import (
	"errors"
	"fmt"
)

// 第一次需求：只有加法 —— 先别急着抽象
// 第二次需求：要减法了！变化第一次发生，马上抽象出运算接口
// Go 的接口是隐式实现的，新增运算只要“多写一个类型”，不用改任何旧代码
type Operation interface {
	GetResult() (float64, error) // 除法可能出错，Go 习惯返回 error 而不是抛异常
}

type OperationAdd struct{ NumberA, NumberB float64 }

func (o OperationAdd) GetResult() (float64, error) { return o.NumberA + o.NumberB, nil }

type OperationSub struct{ NumberA, NumberB float64 }

func (o OperationSub) GetResult() (float64, error) { return o.NumberA - o.NumberB, nil }

// 之后再要乘、除：只“增加”新类型，上面的代码一行不改
type OperationMul struct{ NumberA, NumberB float64 }

func (o OperationMul) GetResult() (float64, error) { return o.NumberA * o.NumberB, nil }

type OperationDiv struct{ NumberA, NumberB float64 }

func (o OperationDiv) GetResult() (float64, error) {
	if o.NumberB == 0 {
		return 0, errors.New("除数不能为0")
	}
	return o.NumberA / o.NumberB, nil
}

// 客户端只面向抽象 Operation 编程
func calc(op Operation) {
	if result, err := op.GetResult(); err != nil {
		fmt.Println(err)
	} else {
		fmt.Println(result)
	}
}

func main() {
	calc(OperationMul{6, 7}) // 42
	calc(OperationAdd{6, 7}) // 13
	calc(OperationDiv{6, 0}) // 除数不能为0
}`,
  compare: [
    { id: 'dip', text: '开放-封闭是**目标**（只加不改）；依赖倒转是**手段**（都依赖抽象）。依赖了抽象，才做得到对修改关闭。' },
    { id: 'simple-factory', text: '简单工厂每加一种运算，还得改工厂里的 `switch`，并**没有完全**做到对修改关闭；工厂方法模式把这一点补上了。' },
  ],
  quiz: [
    { q: '报表系统支持导出 Excel 和 PDF。每次要支持一种新格式（CSV、Word……），开发都得打开同一个 `ExportService` 类，在 if-else 里加分支，再把所有格式重新测一遍。', why: '应抽象出导出接口，新格式只新增一个实现类，已有代码不改。' },
    { q: '一个已经上线的支付模块要接入新的支付方式。团队定了规矩：已经测试通过的微信、支付宝代码一行都不许碰，只能通过新增一个实现了支付接口的类来接入。', why: '对扩展开放（新增支付类）、对修改关闭（旧支付类不动）。' },
  ],

  nodes: {
    // —— 场景一：考研求职 ——
    mate: { kind: 'actor', icon: '👨‍🎓', label: '小菜的同学', x: 140, y: 300, tone: 'blue' },
    exam: { kind: 'box', icon: '📚', label: '考研复习', sub: '主线：照常进行', x: 500, y: 190, tone: 'indigo', size: 'lg', badge: '不改' },
    job: { kind: 'box', icon: '💼', label: '找工作', sub: '额外加的一条路', x: 500, y: 410, tone: 'green', size: 'lg', badge: '新增' },
    db: { kind: 'actor', icon: '🧔', label: '大鸟', x: 860, y: 300, tone: 'orange' },

    // —— 场景二：一国两制 ——
    base: { kind: 'box', icon: '🏛️', label: '国家根本制度', sub: '保持不变', x: 500, y: 160, tone: 'red', size: 'lg', badge: '不修改' },
    hk: { kind: 'box', icon: '🏙️', label: '香港：一国两制', sub: '在原有基础上增加的安排', x: 500, y: 390, tone: 'green', size: 'lg', badge: '扩展' },

    // —— 场景三：弹性上班 ——
    rule: { kind: 'box', icon: '⏰', label: '每天工作满 8 小时', sub: '核心制度', x: 500, y: 150, tone: 'red', size: 'lg', badge: '关闭：不能改' },
    t1: { kind: 'box', icon: '🌅', label: '8:00 来，16:00 走', x: 500, y: 150, tone: 'green', size: 'sm' },
    t2: { kind: 'box', icon: '☀️', label: '9:00 来，17:00 走', x: 500, y: 150, tone: 'green', size: 'sm' },
    t3: { kind: 'box', icon: '🌤️', label: '10:00 来，18:00 走', x: 500, y: 150, tone: 'green', size: 'sm' },
    open: { kind: 'text', text: '几点来：开放，自己选', x: 500, y: 470, tone: 'green', size: 'lg' },

    // —— 场景四：原则 ——
    pr: { kind: 'text', text: '软件实体应该可以扩展，但是不可修改', x: 500, y: 120, tone: 'indigo', size: 'lg' },
    door1: { kind: 'box', icon: '🚪', label: '对扩展：开放', sub: '欢迎增加新代码', x: 290, y: 280, tone: 'green', size: 'lg' },
    door2: { kind: 'box', icon: '🔒', label: '对修改：关闭', sub: '能用的旧代码别动', x: 710, y: 280, tone: 'red', size: 'lg' },
    quote: { kind: 'text', text: '“面对需求，对程序的改动是通过**增加新代码**进行的，而不是**更改现有的代码**。”', x: 500, y: 430, tone: 'gray', w: 560 },

    // —— 场景五：计算器 ——
    cli: { kind: 'actor', icon: '👨‍💻', label: '客户端', x: 110, y: 300, tone: 'gray', size: 'sm' },
    calc: { kind: 'class', title: 'Calculator', sub: '第一版：只有加法', lines: ['+ add(a, b)'], x: 450, y: 300, tone: 'blue' },
    op: { kind: 'class', title: 'Operation', stereo: 'abstract', sub: '运算类（抽象）', lines: ['# numberA, numberB', '+ getResult()'], x: 530, y: 130, tone: 'purple' },
    add: { kind: 'class', title: 'OperationAdd', sub: '加法', x: 450, y: 300, tone: 'teal' },
    sub: { kind: 'class', title: 'OperationSub', sub: '减法', x: 680, y: 350, tone: 'teal', badge: 'NEW' },
    mul: { kind: 'class', title: 'OperationMul', sub: '乘法', x: 640, y: 350, tone: 'orange', badge: 'NEW' },
    div: { kind: 'class', title: 'OperationDiv', sub: '除法', x: 820, y: 350, tone: 'orange', badge: 'NEW' },
    tip: { kind: 'text', text: '旧代码一行没改，只是新增了两个类', x: 550, y: 470, tone: 'green', size: 'lg' },
    gh1: { kind: 'box', label: '平方？', x: 280, y: 470, tone: 'gray', shape: 'ghost', opacity: 0.75 },
    gh2: { kind: 'box', label: '开根号？', x: 460, y: 470, tone: 'gray', shape: 'ghost', opacity: 0.75 },
    gh3: { kind: 'box', label: '对数？', x: 640, y: 470, tone: 'gray', shape: 'ghost', opacity: 0.75 },
    gh4: { kind: 'box', label: '三角函数？', x: 820, y: 470, tone: 'gray', shape: 'ghost', opacity: 0.75 },
    mn: { kind: 'text', text: '扩展开门，修改关门：只加不改', x: 550, y: 480, tone: 'indigo', size: 'xl' },
  },
  links: {
    l_exam: { from: 'mate', to: 'exam', kind: 'arrow' },
    l_job: { from: 'mate', to: 'job', kind: 'arrow' },
    l_hk: { from: 'hk', to: 'base', kind: 'dashed', label: '核心不动，旁边扩展', labelDx: 80 },
    l_t1: { from: 't1', to: 'rule', kind: 'dotted' },
    l_t2: { from: 't2', to: 'rule', kind: 'dotted' },
    l_t3: { from: 't3', to: 'rule', kind: 'dotted' },
    l_calc: { from: 'cli', to: 'calc', kind: 'assoc' },
    l_op: { from: 'cli', to: 'op', kind: 'assoc', label: '只认抽象', labelDy: -12 },
    l_add: { from: 'add', to: 'op', kind: 'inherit' },
    l_sub: { from: 'sub', to: 'op', kind: 'inherit' },
    l_mul: { from: 'mul', to: 'op', kind: 'inherit' },
    l_div: { from: 'div', to: 'op', kind: 'inherit' },
  },

  frames: [
    {
      title: '考研求职两不误',
      text: '小菜的同学在准备**考研**，同时也在**找工作**。大鸟很赞同：复习这条主线**不改**，求职是额外**加上**的一条路，两边互不耽误。这其实就是今天要讲的原则。',
      show: ['mate', 'exam', 'job', 'l_exam', 'l_job', 'db'],
      flows: [
        { from: 'mate', to: 'exam', label: '每天复习', step: 0 },
        { from: 'mate', to: 'job', label: '投简历', step: 1, tone: 'green' },
      ],
      bubbles: [
        { node: 'mate', text: '**两手准备**，哪边都不耽误！', side: 'top' },
        { node: 'db', text: '主线**不改**，再**加**一条路。', side: 'top', step: 1 },
      ],
    },
    {
      title: '一国两制：扩展而不修改',
      text: '大鸟又举了个大例子：香港回归时，国家没有为此**修改**根本制度，而是**增加**了“一国两制”的安排。核心不动，在旁边扩展出新的东西，这就是“对修改关闭，对扩展开放”。',
      clear: true,
      show: ['base', 'hk', 'l_hk'],
      focus: ['hk', 'l_hk'],
      dim: false,
    },
    {
      title: '弹性上班：8 小时不变',
      text: '再看公司：有员工总迟到，公司没去改“**每天工作 8 小时**”这条核心制度，而是**开放**了上班时间：早来早走，晚来晚走。不变的部分关起来，会变的部分放开。',
      clear: true,
      show: ['rule', 't1', 't2', 't3', 'l_t1', 'l_t2', 'l_t3', 'open'],
      set: { t1: { x: 220, y: 350 }, t2: { x: 500, y: 350 }, t3: { x: 780, y: 350 } },
      focus: ['t1', 't2', 't3', 'open'],
      dim: false,
    },
    {
      title: '原则：可扩展，不可修改',
      text: '这就是**开放-封闭原则**：软件实体（类、模块、函数等）应该可以扩展，但是不可修改。说成大白话：面对新需求，靠**增加新代码**来应对，而不是去改已经能用的旧代码。',
      clear: true,
      show: ['pr', 'door1', 'door2', 'quote'],
      focus: ['pr', 'quote'],
      dim: false,
    },
    {
      title: '计算器：起初只有加法',
      text: '回到代码。客户端要一个计算器，最初只要**加法**。这时没必要搞什么抽象，直接写一个类就好。书里的建议是：最初写代码时，可以**先假设变化不会发生**。',
      clear: true,
      show: ['cli', 'calc', 'l_calc'],
      flows: [
        { from: 'cli', to: 'calc', label: 'add(1, 2)' },
        { from: 'calc', to: 'cli', label: '3', back: true, tone: 'teal' },
      ],
    },
    {
      title: '第一次变化：马上抽象',
      text: '有一天要加**减法**了，变化**第一次**发生！这时别在原来的类和客户端里修修补补，而是立刻**创建抽象**：运算类 `Operation`，加法、减法各自成为它的子类，客户端只认 `Operation`。',
      hide: ['calc'],
      show: ['op', 'add', 'sub', 'l_op', 'l_add', 'l_sub'],
      set: { add: { x: 400, y: 350 } },
      focus: ['op', 'add', 'sub', 'cli', 'l_op'],
      bubbles: [{ node: 'cli', text: '还要**减法**！', side: 'top' }],
    },
    {
      title: '再要乘除：只加不改',
      text: '后来又要**乘法**、**除法**？有了抽象，只需新增 `OperationMul`、`OperationDiv` 两个类。加法、减法和客户端**一行都不用动**。面对需求，改动是通过**增加新代码**完成的。',
      show: ['mul', 'div', 'l_mul', 'l_div', 'tip'],
      set: {
        add: { x: 280, badge: '🔒 没改' }, sub: { x: 460, badge: '🔒 没改' },
      },
      focus: ['mul', 'div', 'l_mul', 'l_div', 'tip'],
      dim: false,
    },
    {
      title: '别过度抽象',
      text: '但也别走极端：一上来就把平方、开根号、对数……所有“**可能的**变化”都抽象好，只会让程序又大又难懂。只对**频繁变化**的部分做抽象，拒绝不成熟的抽象和抽象本身一样重要。',
      hide: ['tip'],
      show: ['gh1', 'gh2', 'gh3', 'gh4'],
      set: {
        add: { badge: '' }, sub: { badge: '' }, mul: { badge: '' }, div: { badge: '' },
        gh1: { badge: '先别做' }, gh2: { badge: '先别做' }, gh3: { badge: '先别做' }, gh4: { badge: '先别做' },
      },
      focus: ['gh1', 'gh2', 'gh3', 'gh4', 'op'],
      bubbles: [{ node: 'op', text: '等变化**真的来了**再抽象', side: 'right' }],
    },
    {
      title: '总结：开放-封闭原则',
      text: '开放-封闭原则是面向对象设计的**核心**：守住已经稳定的代码，让变化通过**新增**的方式进来，系统才可维护、可扩展、可复用。一句话记住：**扩展开门，修改关门：只加不改。**',
      hide: ['gh1', 'gh2', 'gh3', 'gh4'],
      show: ['mn'],
      focus: ['op', 'mn', 'mul', 'div'],
      bubbles: [
        { node: 'op', text: '稳定的抽象：对修改**关闭**', side: 'right' },
        { node: 'div', text: '新类随时加：对扩展**开放**', side: 'top', dx: -20 },
      ],
    },
  ],
});
