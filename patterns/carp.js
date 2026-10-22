DP.register({
  id: 'carp',
  order: 22.5,
  type: 'principle',
  name: '合成/聚合复用原则',
  en: 'Composite Reuse Principle',
  emoji: '🧩',
  chapter: '第 22 章 · 手机软件何时统一',
  mnemonic: '能用“拥有”，就别用“继承”',
  summary: '想复用别人的功能时，优先把它当成自己的“部件”拿来用，而不是认它当“父类”。',
  intent: '尽量使用合成/聚合，尽量不要使用类继承。',
  story: '讲桥接模式之前，小菜按“品牌 → 软件”层层继承，类多得收不住。大鸟先讲了这条原则：**聚合**是弱的“拥有”，像雁群和大雁，大雁离群照样活；**合成**是强的“拥有”，像大雁和翅膀，同生共死。把软件从品牌的继承树里拿出来，变成品牌“拥有”的部件，两边就都轻松了。',
  analogy: '组装电脑：显卡是插在主板上的部件（组合），想升级拔下来换一块就行；如果显卡和主板是焊死的一整块（继承），升级显卡就得连主板一起换。',
  when: [
    '想复用某个类的功能，但两者**并不是真正的“是一种”（is-a）关系**',
    '某个部分会**独立变化**，或者希望运行时能替换它',
    '继承层次越来越深，子类开始**成倍增加**',
  ],
  pros: ['被复用的类保持封装（黑箱复用），它内部怎么改都不波及使用者', '每个类专注一件事，继承层次小而浅', '部件可以在运行时替换，更灵活'],
  cons: ['对象和接口会变多，要写一些“转交”调用', '并不是禁止继承：真正的 is-a 关系（并且满足里氏代换）仍然应该用继承'],
  keyPoints: [
    '**聚合**（空心菱形）：弱的拥有，A 包含 B，但 B 不是 A 的一部分，可以独立存在——雁群和大雁',
    '**合成**（实心菱形）：强的拥有，B 是 A 的一部分，生命周期相同——大雁和翅膀',
    '继承是**白箱复用**：父类的实现细节对子类可见，父类一变子类跟着变；合成/聚合是**黑箱复用**，只通过接口打交道',
    '判断法：说得通“B **是一种** A”才用继承；说“A **有一个** B”更顺口，就用合成/聚合',
  ],
  code: `
// ✘ 为了复用而继承：品牌和软件绑死在同一棵树上
class HandsetBrandM extends HandsetBrand { /* ... */ }
class HandsetBrandMGame extends HandsetBrandM { /* 游戏 */ }
class HandsetBrandMAddressList extends HandsetBrandM { /* 通讯录 */ }
// 每加一个品牌或一种软件，子类就成倍增加……

// ✔ 用聚合复用：品牌“拥有”一个软件，软件可以随时换
abstract class HandsetSoft { public abstract void run(); }
class HandsetGame extends HandsetSoft {
    public void run() { System.out.println("运行手机游戏"); }
}
abstract class HandsetBrand {
    protected HandsetSoft soft;                   // 只认接口：黑箱复用
    public void setHandsetSoft(HandsetSoft soft) { this.soft = soft; }
    public abstract void run();
}

// 合成：翅膀是大雁的一部分，随大雁一起创建、一起消亡
class WideGoose {
    private Wing wing;
    public WideGoose() { wing = new Wing(); }
}
// 聚合：雁群拥有大雁，但大雁离开雁群也能独立存在
class WideGooseAggregate {
    private List<WideGoose> geese = new ArrayList<>();
    public void add(WideGoose g)    { geese.add(g); }
    public void remove(WideGoose g) { geese.remove(g); }
}`,
  codePython: `
from abc import ABC, abstractmethod

# ✘ 为了复用而继承：品牌和软件绑死在同一棵树上
#   class HandsetBrandMGame(HandsetBrandM): ...        # 游戏
#   class HandsetBrandMAddressList(HandsetBrandM): ... # 通讯录
#   每加一个品牌或一种软件，子类就成倍增加……

# ✔ 用聚合复用：品牌“拥有”一个软件，软件可以随时换
class HandsetSoft(ABC):
    @abstractmethod
    def run(self): ...

class HandsetGame(HandsetSoft):
    def run(self): print("运行手机游戏")

class HandsetAddressList(HandsetSoft):
    def run(self): print("运行手机通讯录")

class HandsetBrand(ABC):
    def __init__(self):
        self._soft: HandsetSoft | None = None   # 只认接口：黑箱复用

    def set_handset_soft(self, soft: HandsetSoft):
        self._soft = soft

    @abstractmethod
    def run(self): ...

class HandsetBrandM(HandsetBrand):              # 新品牌只是一个子类，和软件互不相干
    def run(self):
        print("M 品牌：", end="")
        self._soft.run()

class Wing:
    pass

# 合成：翅膀是大雁的一部分，随大雁一起创建、一起消亡
class WideGoose:
    def __init__(self):
        self._wing = Wing()                     # 自己创建，不对外传递

# 聚合：雁群拥有大雁，但大雁离开雁群也能独立存在
class WideGooseAggregate:
    def __init__(self):
        self._geese: list[WideGoose] = []

    def add(self, g): self._geese.append(g)
    def remove(self, g): self._geese.remove(g)
    def __len__(self): return len(self._geese)

if __name__ == "__main__":
    m = HandsetBrandM()
    m.set_handset_soft(HandsetGame())
    m.run()                                     # M 品牌：运行手机游戏
    m.set_handset_soft(HandsetAddressList())    # 随时换软件
    m.run()                                     # M 品牌：运行手机通讯录
    flock, goose = WideGooseAggregate(), WideGoose()
    flock.add(goose)
    flock.remove(goose)
    print(len(flock), goose is not None)        # 0 True（离群的大雁照样活）`,
  codeGo: `
package main

import "fmt"

// Go 根本没有类继承，复用只能靠组合（结构体字段 / 嵌入）。
// 所以“合成/聚合复用原则”在 Go 里是天生的，想违反都难。
// ✘ 反面做法（Java 里的 HandsetBrandMGame extends HandsetBrandM……）在 Go 里写不出来

// ✔ 用聚合复用：品牌“拥有”一个软件，软件可以随时换
type HandsetSoft interface{ Run() }

type HandsetGame struct{}

func (HandsetGame) Run() { fmt.Println("运行手机游戏") }

type HandsetAddressList struct{}

func (HandsetAddressList) Run() { fmt.Println("运行手机通讯录") }

type HandsetBrand interface {
	SetHandsetSoft(soft HandsetSoft)
	Run()
}

// 新品牌只是一个结构体，字段里装着接口：只认接口，黑箱复用
type HandsetBrandM struct{ soft HandsetSoft }

func (b *HandsetBrandM) SetHandsetSoft(soft HandsetSoft) { b.soft = soft }
func (b *HandsetBrandM) Run() {
	fmt.Print("M 品牌：")
	b.soft.Run()
}

type Wing struct{}

// 合成：翅膀是大雁的一部分（值字段），随大雁一起创建、一起消亡
type WideGoose struct{ wing Wing }

// 聚合：雁群拥有大雁（指针），但大雁离开雁群也能独立存在
type WideGooseAggregate struct{ geese []*WideGoose }

func (a *WideGooseAggregate) Add(g *WideGoose) { a.geese = append(a.geese, g) }
func (a *WideGooseAggregate) Remove(g *WideGoose) {
	for i, x := range a.geese {
		if x == g {
			a.geese = append(a.geese[:i], a.geese[i+1:]...)
			return
		}
	}
}

func main() {
	var m HandsetBrand = &HandsetBrandM{}
	m.SetHandsetSoft(HandsetGame{})
	m.Run()                                // M 品牌：运行手机游戏
	m.SetHandsetSoft(HandsetAddressList{}) // 随时换软件
	m.Run()                                // M 品牌：运行手机通讯录
	flock, goose := &WideGooseAggregate{}, &WideGoose{}
	flock.Add(goose)
	flock.Remove(goose)
	fmt.Println(len(flock.geese), goose != nil) // 0 true（离群的大雁照样活）
}`,
  compare: [
    { id: 'lsp', text: '里氏代换讲“**该继承时**怎样才算继承得对”（子类必须能替换父类）；合成/聚合复用讲“**能不继承**就别继承”。' },
    { id: 'bridge', text: '桥接模式就是这条原则的落地：把“软件”从品牌的继承树里拿出来，让品牌**聚合**一个软件。' },
  ],
  quiz: [
    { q: '为了让“员工”类能发邮件，有人让 `Employee` 继承了 `EmailSender`；后来又想让员工能打印报表，可 Java 只能有一个父类，只好再造一个 `EmailSenderWithPrinter` 当父类……', why: '员工并不“是一种”邮件发送器。应该让 Employee 持有 EmailSender、Printer 对象（合成/聚合），而不是继承它们。' },
    { q: '有人写了一个栈类，为了省事直接继承了 `ArrayList`。结果使用者可以调用 `add(index, e)` 往栈中间插元素，栈的规矩被破坏；而且 ArrayList 内部实现一改，这个栈也可能跟着出问题。', why: '继承是白箱复用、破坏封装。栈应该在内部持有一个列表，只对外暴露 push / pop。' },
  ],

  nodes: {
    // —— 场景一：回顾类爆炸 ——
    r: { kind: 'class', title: 'HandsetBrand', stereo: 'abstract', sub: '手机品牌', x: 500, y: 85, tone: 'purple', badge: '9 个类' },
    rM: { kind: 'class', title: 'HandsetBrandM', sub: '品牌M', x: 250, y: 185, tone: 'blue' },
    rN: { kind: 'class', title: 'HandsetBrandN', sub: '品牌N', x: 750, y: 185, tone: 'blue' },
    mG: { kind: 'class', title: 'HandsetBrandMGame', sub: '品牌M的游戏', x: 110, y: 300, tone: 'teal', scale: 0.9 },
    mP: { kind: 'class', title: 'HandsetBrandMMP3', sub: '品牌M的MP3', x: 390, y: 300, tone: 'teal', scale: 0.9 },
    mA: { kind: 'class', title: 'HandsetBrandMAddressList', sub: '品牌M的通讯录', x: 250, y: 410, tone: 'teal', scale: 0.9 },
    nG: { kind: 'class', title: 'HandsetBrandNGame', sub: '品牌N的游戏', x: 610, y: 300, tone: 'teal', scale: 0.9 },
    nP: { kind: 'class', title: 'HandsetBrandNMP3', sub: '品牌N的MP3', x: 890, y: 300, tone: 'teal', scale: 0.9 },
    nA: { kind: 'class', title: 'HandsetBrandNAddressList', sub: '品牌N的通讯录', x: 750, y: 410, tone: 'teal', scale: 0.9 },
    db: { kind: 'actor', icon: '🧔', label: '大鸟', x: 500, y: 445, tone: 'orange', size: 'sm' },

    // —— 场景二：原则 ——
    pr: { kind: 'text', text: '尽量使用合成/聚合，尽量不要使用类继承', x: 500, y: 120, tone: 'indigo', size: 'lg' },
    hasA: { kind: 'box', icon: '🧩', label: '合成 / 聚合', sub: '“我**有**一个它” → 优先用', x: 290, y: 280, tone: 'green', size: 'lg' },
    isA: { kind: 'box', icon: '🧬', label: '类继承', sub: '“我**是**它的一种” → 慎用', x: 710, y: 280, tone: 'red', size: 'lg' },
    db2: { kind: 'actor', icon: '🧔', label: '大鸟', x: 500, y: 440, tone: 'orange' },

    // —— 场景三：聚合 / 合成 ——
    flock: { kind: 'zone', label: '雁群', x: 280, y: 300, w: 380, h: 250, tone: 'blue' },
    g1: { kind: 'box', icon: '🦆', label: '大雁', x: 180, y: 240, tone: 'blue', size: 'sm' },
    g2: { kind: 'box', icon: '🦆', label: '大雁', x: 360, y: 240, tone: 'blue', size: 'sm' },
    g3: { kind: 'box', icon: '🦆', label: '大雁', x: 180, y: 360, tone: 'blue', size: 'sm' },
    g4: { kind: 'box', icon: '🦆', label: '大雁', x: 360, y: 360, tone: 'orange', size: 'sm' },
    cAgg: { kind: 'class', title: 'WideGooseAggregate', sub: '雁群', lines: ['- geese: List<WideGoose>', '+ add(goose)', '+ remove(goose)'], x: 790, y: 140, tone: 'blue' },
    cGoose: { kind: 'class', title: 'WideGoose', sub: '大雁', x: 790, y: 380, tone: 'teal' },
    cWing: { kind: 'class', title: 'Wing', sub: '翅膀', x: 790, y: 400, tone: 'orange' },
    bird: { kind: 'zone', label: '一只大雁', x: 300, y: 300, w: 300, h: 220, tone: 'teal' },
    body: { kind: 'box', icon: '🦆', label: '大雁', x: 300, y: 300, tone: 'teal', size: 'lg' },
    w1: { kind: 'box', label: '左翅膀', x: 300, y: 225, tone: 'orange', size: 'sm' },
    w2: { kind: 'box', label: '右翅膀', x: 300, y: 375, tone: 'orange', size: 'sm' },

    // —— 场景四：继承是白箱 ——
    pW: { kind: 'class', title: 'HandsetBrandM', sub: '父类', lines: ['# 屏幕尺寸', '# 按键布局', '+ run()'], x: 500, y: 130, tone: 'blue' },
    cW1: { kind: 'class', title: 'HandsetBrandMGame', sub: '子类：游戏', x: 290, y: 370, tone: 'teal' },
    cW2: { kind: 'class', title: 'HandsetBrandMAddressList', sub: '子类：通讯录', x: 710, y: 370, tone: 'teal' },

    // —— 场景五：回到手机，用聚合 ——
    abs: { kind: 'class', title: 'HandsetBrand', stereo: 'abstract', sub: '手机品牌', lines: ['# soft: HandsetSoft', '+ run()'], x: 250, y: 140, tone: 'indigo' },
    imp: { kind: 'class', title: 'HandsetSoft', stereo: 'abstract', sub: '手机软件', lines: ['+ run()'], x: 745, y: 140, tone: 'purple' },
    bM: { kind: 'class', title: 'HandsetBrandM', sub: '品牌M', x: 150, y: 360, tone: 'blue' },
    bN: { kind: 'class', title: 'HandsetBrandN', sub: '品牌N', x: 350, y: 360, tone: 'blue' },
    sG: { kind: 'class', title: 'HandsetGame', sub: '游戏', x: 590, y: 360, tone: 'teal' },
    sA: { kind: 'class', title: 'HandsetAddressList', sub: '通讯录', x: 745, y: 360, tone: 'teal' },
    sP: { kind: 'class', title: 'HandsetMP3', sub: 'MP3', x: 905, y: 360, tone: 'teal' },
    sum: { kind: 'text', text: '两棵小树：品牌 + 软件，加什么都只加 1 个类', x: 500, y: 490, tone: 'green', size: 'lg' },

    // —— 场景六：不是不准继承 ——
    tP1: { kind: 'class', title: 'HandsetBrand', sub: '手机品牌', x: 260, y: 130, tone: 'indigo' },
    tC1: { kind: 'class', title: 'HandsetBrandM', sub: '品牌M', x: 260, y: 330, tone: 'blue' },
    tP2: { kind: 'class', title: 'HandsetBrandM', sub: '品牌M', x: 740, y: 130, tone: 'blue' },
    tC2: { kind: 'class', title: 'HandsetBrandMGame', sub: '品牌M的游戏', x: 740, y: 330, tone: 'red' },
    v1: { kind: 'text', text: '✅ 真正的“是一种” → 用继承', x: 260, y: 450, tone: 'green', size: 'lg' },
    v2: { kind: 'text', text: '❌ 其实是“手机有游戏” → 用聚合', x: 740, y: 450, tone: 'red', size: 'lg' },
  },
  links: {
    l_rM: { from: 'rM', to: 'r', kind: 'inherit' },
    l_rN: { from: 'rN', to: 'r', kind: 'inherit' },
    l_mG: { from: 'mG', to: 'rM', kind: 'inherit' },
    l_mP: { from: 'mP', to: 'rM', kind: 'inherit' },
    l_mA: { from: 'mA', to: 'rM', kind: 'inherit' },
    l_nG: { from: 'nG', to: 'rN', kind: 'inherit' },
    l_nP: { from: 'nP', to: 'rN', kind: 'inherit' },
    l_nA: { from: 'nA', to: 'rN', kind: 'inherit' },

    l_agg: { from: 'cAgg', to: 'cGoose', kind: 'aggregate', label: '聚合：弱拥有', labelDx: 52 },
    l_cmp: { from: 'cGoose', to: 'cWing', kind: 'compose', label: '合成：强拥有', labelDx: 52 },

    l_w1: { from: 'cW1', to: 'pW', kind: 'inherit' },
    l_w2: { from: 'cW2', to: 'pW', kind: 'inherit' },

    l_bM: { from: 'bM', to: 'abs', kind: 'inherit' },
    l_bN: { from: 'bN', to: 'abs', kind: 'inherit' },
    l_sG: { from: 'sG', to: 'imp', kind: 'inherit' },
    l_sA: { from: 'sA', to: 'imp', kind: 'inherit' },
    l_sP: { from: 'sP', to: 'imp', kind: 'inherit' },
    l_has: { from: 'abs', to: 'imp', kind: 'aggregate', label: '拥有一个软件', labelDy: 15 },

    l_t1: { from: 'tC1', to: 'tP1', kind: 'inherit', label: '是一种 ✓', labelDx: 40, tone: 'green' },
    l_t2: { from: 'tC2', to: 'tP2', kind: 'inherit', label: '是一种？✗', labelDx: 44, tone: 'red' },
  },

  frames: [
    {
      title: '类爆炸的根源：继承',
      text: '还记得手机软件那一章吗？小菜让软件**继承**品牌，品牌M、品牌N下面各挂游戏、通讯录、MP3，已经 9 个类了，再加什么都是成倍增长。大鸟说：先别急着写，有个**原则**要先讲给你听。',
      show: ['r', 'rM', 'rN', 'mG', 'mP', 'mA', 'nG', 'nP', 'nA', 'l_rM', 'l_rN', 'l_mG', 'l_mP', 'l_mA', 'l_nG', 'l_nP', 'l_nA', 'db'],
      focus: ['r', 'db'],
      dim: false,
      bubbles: [{ node: 'db', text: '毛病出在**继承**用错了地方', side: 'top' }],
    },
    {
      title: '原则：优先合成/聚合',
      text: '这条原则就一句话：**尽量使用合成/聚合，尽量不要使用类继承**。想复用一个类的本事时，先问问：是“我**有**一个它”，还是“我**是**它的一种”？前者就该拿来当部件，而不是认它当父类。',
      clear: true,
      show: ['pr', 'hasA', 'isA', 'db2'],
      focus: ['pr', 'hasA'],
      dim: false,
      bubbles: [{ node: 'db2', text: '能“拥有”，就别“继承”', side: 'top' }],
    },
    {
      title: '聚合：雁群与大雁',
      text: '先分清两种“拥有”。**聚合**是弱的拥有：雁群包含很多大雁，但每只大雁**不是**雁群的一部分，它离开雁群照样能飞、照样活。UML 里画成**空心菱形**，菱形在“整体”雁群那一端。',
      clear: true,
      trans: 1.4,
      show: ['flock', 'g1', 'g2', 'g3', 'g4', 'cAgg', 'cGoose', 'l_agg'],
      set: { g4: { x: 560, y: 470 } },
      focus: ['g4', 'cAgg', 'cGoose', 'l_agg'],
      dim: false,
      bubbles: [{ node: 'g4', text: '我离开雁群，**照样活**', side: 'top' }],
    },
    {
      title: '合成：大雁与翅膀',
      text: '**合成**是强的拥有：翅膀是大雁身体的**一部分**，大雁出生时翅膀一起长出来，大雁没了翅膀也就没了，两者**生命周期相同**。UML 里画成**实心菱形**。',
      hide: ['flock', 'g1', 'g2', 'g3', 'g4', 'cAgg'],
      show: ['bird', 'body', 'w1', 'w2', 'cWing', 'l_cmp'],
      set: { cGoose: { y: 150 } },
      focus: ['body', 'w1', 'w2', 'cGoose', 'cWing', 'l_cmp'],
      bubbles: [{ node: 'w2', text: '和大雁**同生共死**', side: 'bottom' }],
    },
    {
      title: '继承的毛病：白箱复用',
      text: '为什么要少用继承？继承是**白箱复用**：父类的内部细节对子类全都可见，子类和父类的实现**紧紧绑在一起**。父类改一行，所有子类都可能跟着出问题；而且继承关系编译时就定死了，运行时换不了。',
      clear: true,
      show: ['pW', 'cW1', 'cW2', 'l_w1', 'l_w2'],
      set: { pW: { lines: ['# 屏幕尺寸', '!# 按键布局  ← 改了', '+ run()'] } },
      focus: ['pW', 'cW1', 'cW2'],
      flows: [
        { from: 'pW', to: 'cW1', label: '跟着受影响', tone: 'red', step: 0 },
        { from: 'pW', to: 'cW2', label: '跟着受影响', tone: 'red', step: 0 },
      ],
      bubbles: [
        { node: 'cW1', text: '又得**重新测**一遍…', side: 'bottom', step: 0 },
        { node: 'cW2', text: '我也是…', side: 'bottom', step: 0 },
      ],
    },
    {
      title: '回到手机：品牌拥有软件',
      text: '改用聚合：品牌**拥有**一个软件，只通过 `run()` 和它打交道，软件内部怎么写品牌看不见，这叫**黑箱复用**。每个类只管自己那一件事，两棵继承树都**又小又浅**，加品牌、加软件都只加一个类。',
      clear: true,
      show: ['abs', 'imp', 'bM', 'bN', 'sG', 'sA', 'sP', 'l_bM', 'l_bN', 'l_sG', 'l_sA', 'l_sP', 'l_has', 'sum'],
      focus: ['abs', 'imp', 'l_has', 'sum'],
      flows: [{ from: 'abs', to: 'imp', label: 'soft.run()' }],
      bubbles: [{ node: 'imp', text: '品牌只看到我的 `run()`，里面是**黑箱**', side: 'bottom', dy: 6, dx: -10 }],
    },
    {
      title: '注意：不是不准继承',
      text: '原则说的是“**尽量**”，不是“禁止”。判断方法很简单：品牌M **是一种**手机品牌，说得通，用继承没问题；可“品牌M的游戏**是一种**品牌M”？说不通，它其实是手机**拥有**的软件，应该用聚合。',
      clear: true,
      show: ['tP1', 'tC1', 'tP2', 'tC2', 'l_t1', 'l_t2', 'v1', 'v2'],
      set: { tC2: { strike: true } },
    },
    {
      title: '总结：合成/聚合复用',
      text: '合成/聚合复用原则：复用功能时，**优先让它当你的部件**（合成/聚合），而不是当你的父类。这样每个类保持封装、专注一件事，继承层次小而浅。一句话记住：**能用“拥有”，就别用“继承”。**',
      clear: true,
      show: ['pr', 'hasA', 'isA', 'db2'],
      set: { pr: { text: '能用“拥有”，就别用“继承”', size: 'xl' } },
      focus: ['pr', 'hasA'],
      dim: false,
      bubbles: [
        { node: 'hasA', text: '雁群有大雁、大雁有翅膀、品牌有软件', side: 'bottom' },
        { node: 'isA', text: '只留给真正的“**是一种**”', side: 'bottom' },
      ],
    },
  ],
});
