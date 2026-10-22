DP.register({
  id: 'command',
  order: 23,
  type: 'behavioral',
  name: '命令模式',
  en: 'Command',
  emoji: '🍢',
  chapter: '第 23 章 · 烤羊肉串引来的思考',
  mnemonic: '请求写成单，排队撤销都好办',
  summary: '把“请求”包装成命令对象，于是请求可以排队、记日志、撤销，请求者与执行者解耦。',
  intent: '将一个请求封装为一个对象，从而使你可用不同的请求对客户进行参数化；对请求排队或记录请求日志，以及支持可撤销的操作。',
  story: '小菜和大鸟路过**烤羊肉串**的路边摊：一群人围着摊主喊单，谁点了什么、谁给了钱全靠摊主记，乱成一团。旁边的**烤肉店**却井然有序：**服务员**把点单写下来交给后厨，能排队、能记账、能退单，鸡翅卖完了当场就告诉你。大鸟说：把“请求”写成一张张**订单（命令对象）**，就是命令模式。',
  analogy: '电视遥控器：每个按键背后是一条“命令”，按键自己不懂电视怎么换台，只负责把命令发出去；还可以“预约录制”——先把命令存起来，到点再执行。',
  when: [
    '需要把**请求的发出者**和**请求的执行者**解耦',
    '需要对请求**排队**、**记录日志**，或支持**撤销 / 重做**',
    '需要把一组操作组合成“宏命令”，或者延后执行',
  ],
  pros: ['请求者与执行者**解耦**，服务员不需要懂烤肉', '能方便地实现**排队、日志、撤销**，接收方还可以**否决**请求', '新增一种命令只需**新写一个命令类**，不影响其他类'],
  cons: ['每种请求一个命令类，类的数量会增多', '简单场景直接调用更省事——不需要时别硬加'],
  keyPoints: [
    '四个角色：**Command**（抽象命令）、**ConcreteCommand**（烤羊肉串命令 / 烤鸡翅命令）、**Receiver**（接收者：烤肉串者）、**Invoker**（调用者：服务员）',
    '命令对象在创建时就**绑定了接收者**，`executeCommand()` 里只是转调接收者的方法',
    '书中提醒（敏捷开发原则）：不要为了“可能需要”而提前引入命令模式，**真正需要撤销 / 重做等功能时再重构**成命令模式',
    '书中（C#）调用者的方法叫 `Notify()`；Java 的 `notify()` 是 `Object` 的 final 方法，所以这里叫 `notifyCook()`',
  ],
  code: `
// 接收者：真正干活的烤肉串者
class Barbecuer {
    public void bakeMutton()      { System.out.println("烤羊肉串！"); }
    public void bakeChickenWing() { System.out.println("烤鸡翅！"); }
}
// 抽象命令：持有接收者
abstract class Command {
    protected Barbecuer receiver;
    Command(Barbecuer receiver) { this.receiver = receiver; }
    public abstract void executeCommand();
}
class BakeMuttonCommand extends Command {
    BakeMuttonCommand(Barbecuer r) { super(r); }
    public void executeCommand() { receiver.bakeMutton(); }
}
class BakeChickenWingCommand extends Command {
    BakeChickenWingCommand(Barbecuer r) { super(r); }
    public void executeCommand() { receiver.bakeChickenWing(); }
}
// 调用者：服务员（书中叫 Notify；Java 的 notify() 是 final 的，故改名）
class Waiter {
    private final List<Command> orders = new ArrayList<>();
    public void setOrder(Command c) {
        if (c instanceof BakeChickenWingCommand) {
            System.out.println("服务员：鸡翅没有了，请点别的烧烤。");    // 否决请求
        } else {
            orders.add(c);                                                // 排队
            System.out.println("增加订单：" + c + " 时间：" + LocalTime.now());  // 日志
        }
    }
    public void cancelOrder(Command c) {
        orders.remove(c);                                                 // 撤销
        System.out.println("取消订单：" + c + " 时间：" + LocalTime.now());
    }
    public void notifyCook() { for (Command c : orders) c.executeCommand(); }
}
// 客户端：开店前的准备
Barbecuer boy = new Barbecuer();
Command m1 = new BakeMuttonCommand(boy), m2 = new BakeMuttonCommand(boy), m3 = new BakeMuttonCommand(boy);
Command w1 = new BakeChickenWingCommand(boy);
Waiter girl = new Waiter();
girl.setOrder(m1); girl.setOrder(m2); girl.setOrder(m3);
girl.setOrder(w1);        // 鸡翅没了，被拒
girl.cancelOrder(m3);     // 退一串
girl.notifyCook();        // 一声令下，按单执行`,
  codePython: `
from abc import ABC, abstractmethod
from datetime import datetime


# 接收者：真正干活的烤肉串者
class Barbecuer:
    def bake_mutton(self): print("烤羊肉串！")
    def bake_chicken_wing(self): print("烤鸡翅！")


# 抽象命令：持有接收者
class Command(ABC):
    def __init__(self, receiver: Barbecuer):
        self.receiver = receiver

    @abstractmethod
    def execute_command(self): ...


class BakeMuttonCommand(Command):
    def execute_command(self):
        self.receiver.bake_mutton()


class BakeChickenWingCommand(Command):
    def execute_command(self):
        self.receiver.bake_chicken_wing()


# 调用者：服务员（书中叫 Notify；沿用 Java 版改名后的 notify_cook）
class Waiter:
    def __init__(self):
        self.orders = []

    def set_order(self, c: Command):
        if isinstance(c, BakeChickenWingCommand):
            print("服务员：鸡翅没有了，请点别的烧烤。")   # 否决请求
        else:
            self.orders.append(c)                           # 排队
            print(f"增加订单：{type(c).__name__} 时间：{datetime.now():%H:%M:%S}")  # 日志

    def cancel_order(self, c: Command):
        self.orders.remove(c)                               # 撤销
        print(f"取消订单：{type(c).__name__} 时间：{datetime.now():%H:%M:%S}")

    def notify_cook(self):
        for c in self.orders:
            c.execute_command()


# 客户端：开店前的准备
if __name__ == "__main__":
    boy = Barbecuer()
    m1, m2, m3 = (BakeMuttonCommand(boy) for _ in range(3))
    w1 = BakeChickenWingCommand(boy)
    girl = Waiter()
    for c in (m1, m2, m3, w1):
        girl.set_order(c)   # 三条“增加订单：BakeMuttonCommand 时间：…”，鸡翅被拒
    girl.cancel_order(m3)   # 取消订单：BakeMuttonCommand 时间：10:30:00
    girl.notify_cook()      # 烤羊肉串！ 烤羊肉串！（按单执行两次）`,
  codeGo: `
package main

import (
	"fmt"
	"slices"
	"time"
)

// 接收者：真正干活的烤肉串者
type Barbecuer struct{}

func (Barbecuer) BakeMutton()      { fmt.Println("烤羊肉串！") }
func (Barbecuer) BakeChickenWing() { fmt.Println("烤鸡翅！") }

// 抽象命令：Go 用接口表达，各个具体命令自己持有接收者（没有继承）
type Command interface {
	ExecuteCommand()
}

type BakeMuttonCommand struct{ receiver *Barbecuer }

func (c *BakeMuttonCommand) ExecuteCommand() { c.receiver.BakeMutton() }

type BakeChickenWingCommand struct{ receiver *Barbecuer }

func (c *BakeChickenWingCommand) ExecuteCommand() { c.receiver.BakeChickenWing() }

// 调用者：服务员（书中叫 Notify；沿用 Java 版改名后的 NotifyCook）
type Waiter struct{ orders []Command }

// 日志：%T 打印命令的类型名（形如 *main.BakeMuttonCommand）
func log(action string, c Command) {
	fmt.Println(action + "订单：" + fmt.Sprintf("%T", c) + " 时间：" + time.Now().Format("15:04:05"))
}

func (w *Waiter) SetOrder(c Command) {
	if _, ok := c.(*BakeChickenWingCommand); ok {
		fmt.Println("服务员：鸡翅没有了，请点别的烧烤。") // 否决请求
		return
	}
	w.orders = append(w.orders, c) // 排队
	log("增加", c)
}

func (w *Waiter) CancelOrder(c Command) {
	w.orders = slices.DeleteFunc(w.orders, func(x Command) bool { return x == c }) // 撤销
	log("取消", c)
}

func (w *Waiter) NotifyCook() {
	for _, c := range w.orders {
		c.ExecuteCommand()
	}
}

// 客户端：开店前的准备
func main() {
	boy := &Barbecuer{}
	m1, m2, m3 := &BakeMuttonCommand{boy}, &BakeMuttonCommand{boy}, &BakeMuttonCommand{boy}
	w1 := &BakeChickenWingCommand{boy}
	girl := &Waiter{}
	girl.SetOrder(m1)
	girl.SetOrder(m2)
	girl.SetOrder(m3)
	girl.SetOrder(w1)    // 鸡翅没了，被拒
	girl.CancelOrder(m3) // 退一串
	girl.NotifyCook()    // 一声令下：烤羊肉串！烤羊肉串！
}`,
  compare: [
    { id: 'strategy', text: '都把东西装进对象。策略封装的是“**怎么算**”的可互换算法；命令封装的是“**要做什么**”的请求，并绑定了接收者，重点在**排队、记录、撤销**。' },
    { id: 'chain-of-responsibility', text: '都让请求者和执行者解耦。命令里**执行者是确定的**（命令里绑好了接收者）；职责链里发送者**不知道谁会处理**，请求沿链寻找。' },
  ],
  quiz: [
    { q: '做一个文本编辑器：希望把每次“加粗”“插入文字”“删除”都记录下来，支持撤销 / 重做，还能把一串操作录成宏，一键回放。', why: '把每个操作封装成对象，才能存进历史列表，撤销、重做、回放。' },
    { q: '智能家居遥控器上的每个按钮可以绑定不同的操作（开灯、开空调、拉窗帘），按钮本身不知道是哪个电器在干活；还要支持“撤销上一步”和“定时执行”。' },
  ],

  nodes: {
    // —— 场景一：路边摊 ——
    bbq: { kind: 'actor', icon: '👨‍🍳', label: '烤肉串者', sub: '路边摊摊主', x: 680, y: 290, tone: 'orange', size: 'lg' },
    c1: { kind: 'actor', icon: '🧔', label: '顾客甲', x: 180, y: 130, tone: 'gray' },
    c2: { kind: 'actor', icon: '👩', label: '顾客乙', x: 130, y: 290, tone: 'gray' },
    c3: { kind: 'actor', icon: '👨', label: '顾客丙', x: 180, y: 450, tone: 'gray' },
    code0: { kind: 'text', text: '小菜的代码也一样：boy.bakeMutton(); boy.bakeMutton(); boy.bakeChickenWing(); …', x: 500, y: 525, tone: 'gray', size: 'sm', mono: true },

    // —— 场景二：烤肉店 ——
    guest: { kind: 'actor', icon: '🧑', label: '顾客', x: 120, y: 290, tone: 'gray' },
    girl: { kind: 'actor', icon: '👩‍💼', label: '服务员', sub: '记单、排队、退单', x: 450, y: 290, tone: 'pink' },
    slip: { kind: 'box', shape: 'note', icon: '🧾', label: '订单', sub: '羊肉串 ×3', x: 450, y: 440, tone: 'yellow', size: 'sm' },
    chef: { kind: 'actor', icon: '👨‍🍳', label: '烤肉师傅', sub: '只管照单烤', x: 820, y: 290, tone: 'orange' },

    // —— 场景三：类图 ——
    waiterC: {
      kind: 'class', title: 'Waiter', sub: '服务员（调用者）', x: 145, y: 135, tone: 'pink',
      lines: ['- orders: List<Command>', '+ setOrder(Command c)', '+ cancelOrder(Command c)', '+ notifyCook()'],
    },
    cmd: { kind: 'class', title: 'Command', stereo: 'abstract', sub: '命令', x: 520, y: 130, tone: 'purple', lines: ['# receiver: Barbecuer', '+ executeCommand()'] },
    mutton: { kind: 'class', title: 'BakeMuttonCommand', sub: '烤羊肉串命令', x: 330, y: 320, tone: 'teal', lines: ['+ executeCommand()'] },
    wing: { kind: 'class', title: 'BakeChickenWingCommand', sub: '烤鸡翅命令', x: 720, y: 320, tone: 'teal', lines: ['+ executeCommand()'] },
    bbqC: { kind: 'class', title: 'Barbecuer', sub: '烤肉串者（接收者）', x: 520, y: 475, tone: 'orange', lines: ['+ bakeMutton()', '+ bakeChickenWing()'] },

    // —— 场景四：运行 ——
    cust: { kind: 'actor', icon: '🧑', label: '顾客', sub: '客户端', x: 85, y: 290, tone: 'gray' },
    queue: { kind: 'zone', label: '订单列表 orders', x: 545, y: 300, w: 240, h: 250, tone: 'pink' },
    waiter: { kind: 'actor', icon: '👩‍💼', label: '服务员', sub: 'Waiter（调用者）', x: 545, y: 105, tone: 'pink', size: 'sm' },
    m1: { kind: 'box', shape: 'note', icon: '🍢', label: '羊肉串 ①', sub: 'BakeMuttonCommand', x: 280, y: 170, tone: 'yellow', size: 'sm' },
    m2: { kind: 'box', shape: 'note', icon: '🍢', label: '羊肉串 ②', sub: 'BakeMuttonCommand', x: 280, y: 260, tone: 'yellow', size: 'sm' },
    m3: { kind: 'box', shape: 'note', icon: '🍢', label: '羊肉串 ③', sub: 'BakeMuttonCommand', x: 280, y: 350, tone: 'yellow', size: 'sm' },
    w1: { kind: 'box', shape: 'note', icon: '🍗', label: '鸡翅', sub: 'BakeChickenWingCommand', x: 280, y: 440, tone: 'yellow', size: 'sm' },
    boy: { kind: 'actor', icon: '👨‍🍳', label: '烤肉串者', sub: 'Barbecuer（接收者）', x: 875, y: 300, tone: 'orange' },
    log: { kind: 'box', shape: 'note', icon: '📒', label: '日志', sub: '（空）', x: 545, y: 495, w: 240, tone: 'gray', size: 'sm' },
  },
  links: {
    l_gg: { from: 'guest', to: 'girl', kind: 'assoc', label: '点单' },
    l_gc: { from: 'girl', to: 'chef', kind: 'assoc', label: '交单' },

    l_m: { from: 'mutton', to: 'cmd', kind: 'inherit' },
    l_w: { from: 'wing', to: 'cmd', kind: 'inherit' },
    l_cr: { from: 'cmd', to: 'bbqC', kind: 'aggregate', label: '持有接收者', labelDx: 44 },
    l_wc: { from: 'waiterC', to: 'cmd', kind: 'aggregate', label: '订单列表', labelDy: -12 },
  },

  frames: [
    {
      title: '路边烤肉摊',
      text: '小菜和大鸟下班路过一个**烤羊肉串**的路边摊。一群人围着摊主七嘴八舌地喊：“10 串羊肉！”“我的先来！”“再加 2 个鸡翅！”所有人都**直接对着烤肉的人下命令**。',
      show: ['bbq', 'c1', 'c2', 'c3'],
      flows: [
        { from: 'c1', to: 'bbq', label: '10 串羊肉！', step: 0 },
        { from: 'c2', to: 'bbq', label: '我的先烤！', step: 0, delay: 0.25 },
        { from: 'c3', to: 'bbq', label: '2 个鸡翅！', step: 0, delay: 0.5 },
      ],
      bubbles: [
        { node: 'bbq', text: '别急别急，一个一个来！😵', side: 'right', step: 0, delay: 0.6 },
      ],
    },
    {
      title: '乱：请求者和执行者绑死了',
      text: '摊主忙得团团转：谁点了什么、谁先来、谁给过钱，全靠脑子记，**很容易出错**；想排队、想退单都没法做。小菜写的代码也一样：客户端直接调 `boy.bakeMutton()`。大鸟说这叫“**行为请求者**”与“**行为实现者**”**紧耦合**。',
      show: ['code0'],
      set: { bbq: { badge: '记不住了', strike: true } },
      focus: ['bbq', 'code0', 'c1', 'c2', 'c3'],
      bubbles: [
        { node: 'c1', text: '我的怎么还没好？', side: 'right' },
        { node: 'c3', text: '我给过钱了吧？', side: 'right', delay: 0.4 },
        { node: 'c2', text: '不要了，**能退吗**？', side: 'right', delay: 0.8 },
      ],
    },
    {
      title: '开门店：多了一个服务员',
      text: '再看旁边的**烤肉店**：顾客跟**服务员**点单，服务员写在单子上，再交给后厨的烤肉师傅。鸡翅卖完了？服务员**当场就告诉你**。中间多了一个人、多了一张单子，一切都有条理了。',
      clear: true,
      show: ['guest', 'girl', 'slip', 'chef', 'l_gg', 'l_gc'],
      flows: [
        { from: 'guest', to: 'girl', label: '羊肉串 ×3、鸡翅 ×1' },
        { from: 'girl', to: 'chef', icon: '🧾', label: '羊肉串 ×3' },
      ],
      bubbles: [
        { node: 'girl', text: '鸡翅**卖完了**，请点别的～', side: 'top', step: 0 },
        { node: 'chef', text: '照单烤就行', side: 'top', step: 1 },
      ],
    },
    {
      title: '接收者与命令',
      text: '对应到代码：烤肉串者 `Barbecuer` 是真正干活的**接收者**，会 `bakeMutton()`、`bakeChickenWing()`。再抽象出**命令** `Command`：它**持有一个接收者**，对外只有一个 `executeCommand()`。',
      clear: true,
      show: ['bbqC', 'cmd', 'l_cr'],
      focus: ['bbqC', 'cmd', 'l_cr'],
    },
    {
      title: '每道菜一个命令类',
      text: '每一种点单都写成具体命令：烤羊肉串 `BakeMuttonCommand`、烤鸡翅 `BakeChickenWingCommand`。它们的 `executeCommand()` 就一句话：**叫接收者去干对应的活**。请求，被**包装成了对象**。',
      show: ['mutton', 'wing', 'l_m', 'l_w'],
      focus: ['mutton', 'wing', 'l_m', 'l_w'],
      flows: [
        { from: 'mutton', to: 'bbqC', label: 'bakeMutton()', step: 0 },
        { from: 'wing', to: 'bbqC', label: 'bakeChickenWing()', step: 0 },
      ],
    },
    {
      title: '调用者：Waiter',
      text: '服务员 `Waiter` 是**调用者**：手里一份订单列表，`setOrder()` 记单，`cancelOrder()` 撤单，`notifyCook()` 通知后厨开烤。注意：**服务员根本不知道怎么烤**，她只和“命令”打交道。',
      show: ['waiterC', 'l_wc'],
      focus: ['waiterC', 'cmd', 'l_wc'],
    },
    {
      title: '点单：写出一张张订单',
      text: '跑起来。顾客点了 **3 串羊肉、1 个鸡翅**：客户端 `new` 出 4 个命令对象，每张单子在创建时就**绑定了接收者**——那位烤肉师傅。“请求”变成了**看得见、拿得住的东西**。',
      clear: true,
      show: ['cust', 'm1', 'm2', 'm3', 'w1'],
      focus: ['cust', 'm1', 'm2', 'm3', 'w1'],
      flows: [
        { from: 'cust', to: 'm1', label: 'new', step: 0 },
        { from: 'cust', to: 'm2', label: 'new', step: 0, delay: 0.2 },
        { from: 'cust', to: 'm3', label: 'new', step: 0, delay: 0.4 },
        { from: 'cust', to: 'w1', label: 'new', step: 0, delay: 0.6 },
      ],
    },
    {
      title: 'setOrder：订单排队',
      text: '顾客把单子交给服务员 `setOrder()`：三张羊肉串订单**进入列表排队**，同时**记下日志**“增加订单：羊肉串”。谁先谁后、点了几串，白纸黑字，一目了然。',
      show: ['waiter', 'queue', 'log'],
      set: {
        m1: { x: 545, y: 218 }, m2: { x: 545, y: 298 }, m3: { x: 545, y: 378 },
        log: { sub: '增加订单：羊肉串 ①②③', tone: 'yellow' },
      },
      trans: 1.2,
      focus: ['waiter', 'm1', 'm2', 'm3', 'log'],
      flows: [
        { from: 'cust', to: 'waiter', label: 'setOrder(羊肉串) ×3' },
      ],
      bubbles: [
        { node: 'waiter', text: '记下了：羊肉串 **3 串**', side: 'right', step: 0 },
      ],
    },
    {
      title: '鸡翅没了：当场拒绝',
      text: '轮到鸡翅这张单。服务员在 `setOrder()` 里一查：**鸡翅卖完了**，当场回复“请点别的烧烤”，这张单**根本不进列表**。接收请求的一方，可以**决定是否否决**请求。',
      set: { w1: { strike: true, badge: '被拒' } },
      focus: ['waiter', 'w1', 'cust'],
      flows: [
        { from: 'cust', to: 'waiter', label: 'setOrder(鸡翅)' },
      ],
      bubbles: [
        { node: 'waiter', text: '鸡翅没有了，**请点别的烧烤**。', side: 'right', step: 0 },
      ],
    },
    {
      title: 'cancelOrder：撤单',
      text: '顾客觉得点多了：“退一串羊肉！”服务员调用 `cancelOrder()`，把第 ③ 张单子**从列表里拿掉**，并记下日志“取消订单”。还没执行的请求，随时可以**撤销**。',
      set: {
        m3: { x: 280, y: 350, opacity: 0.5, badge: '已撤' },
        log: { sub: '增加订单：羊肉串 ①②③\n取消订单：羊肉串 ③' },
      },
      trans: 1.2,
      focus: ['cust', 'waiter', 'm3', 'log'],
      flows: [
        { from: 'cust', to: 'waiter', label: 'cancelOrder(羊肉串③)' },
      ],
      bubbles: [
        { node: 'cust', text: '点多了，退一串！', side: 'top' },
      ],
    },
    {
      title: 'notifyCook：开烤！',
      text: '单子定了，服务员调用 `notifyCook()`：**遍历订单列表**，对每张单子调用 `executeCommand()`，单子再去叫烤肉师傅 `bakeMutton()`。服务员和烤肉师傅之间，**只隔着一张张命令对象**。',
      show: ['boy'],
      hide: ['w1', 'm3'],
      focus: ['waiter', 'm1', 'm2', 'boy'],
      flows: [
        { from: 'waiter', to: 'm1', label: 'executeCommand()' },
        { from: 'm1', to: 'boy', label: 'bakeMutton()' },
        { from: 'waiter', to: 'm2', label: 'executeCommand()', curve: -60 },
        { from: 'm2', to: 'boy', label: 'bakeMutton()' },
      ],
      bubbles: [
        { node: 'boy', text: '烤羊肉串！🍢', side: 'top', step: 1 },
        { node: 'boy', text: '再来一串！🍢', side: 'bottom', step: 3 },
      ],
    },
    {
      title: '命令模式的好处',
      text: '回头看：命令能**排队**、能**记日志**、接收方能**否决**、没执行的能**撤销**；加一道新菜只需**新写一个命令类**。但大鸟也提醒：**别为猜测的需求提前加**，真需要撤销、重做时再重构引入。',
      show: ['w1', 'm3'],
      set: {
        queue: { badge: '① 排队' }, log: { badge: '② 记日志' },
        w1: { badge: '③ 可否决' }, m3: { badge: '④ 可撤销' }, boy: { badge: '⑤ 解耦' },
      },
      focus: ['queue', 'log', 'w1', 'm3', 'boy', 'm1', 'm2'],
    },
    {
      title: '总结：命令模式',
      text: '命令模式：把**请求封装成对象**，从而可以对请求排队、记录日志、撤销。四个角色：**Command**、**ConcreteCommand**、**Receiver**（接收者）、**Invoker**（调用者）。一句话记住：**请求写成单，排队撤销都好办。**',
      clear: true,
      show: ['waiterC', 'cmd', 'mutton', 'wing', 'bbqC', 'l_m', 'l_w', 'l_cr', 'l_wc'],
      focus: ['cmd', 'waiterC', 'bbqC', 'l_wc', 'l_cr'],
      bubbles: [
        { node: 'waiterC', text: '我只管**单子**，不懂烤肉', side: 'bottom' },
        { node: 'cmd', text: '一个请求 = **一张单子（对象）**', side: 'right' },
      ],
    },
  ],
});
