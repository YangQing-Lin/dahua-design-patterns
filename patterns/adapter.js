(function () {
  const TR = ['- wjzf: ForeignCenter', '+ attack(): wjzf.进攻()', '+ defense(): wjzf.防守()'];
  const mark = (lines, idx) => lines.map((l, i) => (idx.includes(i) ? '!' + l : l));
  const PLAYERS = ['fw', 'ct', 'gd'];

  DP.register({
    id: 'adapter',
    order: 17,
    type: 'structural',
    name: '适配器模式',
    en: 'Adapter',
    emoji: '🔌',
    chapter: '第 17 章 · 在NBA我需要翻译',
    mnemonic: '接口对不上，中间加个翻译官',
    summary: '两边接口不匹配又都改不动时，在中间加一个“翻译”，把一种接口转换成另一种。',
    intent: '将一个类的接口转换成客户希望的另外一个接口。Adapter 模式使得原本由于接口不兼容而不能一起工作的那些类可以一起工作。',
    story: '**姚明**刚到 NBA 火箭队时还听不懂英语。教练对所有球员都喊 `attack()`、`defense()`，可姚明只懂“**进攻**”“**防守**”。让全联盟改说中文不可能，让姚明一夜学会英语也来不及——于是球队给他配了一位**翻译**：翻译站在球员的位置上接收教练的指令，再用中文转告姚明。',
    analogy: '出国旅行带的电器是国标插头，酒店墙上却是英标插座。你不会去改墙，也不会去拆电器，而是买一个**转换插头**夹在中间——转换插头就是适配器。',
    when: [
      '想复用一个已有的类，但它的**接口和你要求的不一样**',
      '两个类做的事情相同或相似，只是接口不同，而且**双方都不方便修改**',
      '使用第三方组件，它的接口与自己系统的接口不同，又没必要为了迁就它改自己的接口',
    ],
    pros: ['让原本**不兼容**的类一起工作，复用已有代码', '客户端只面对统一的目标接口，**感觉不到**被适配者的存在', '被适配类和客户端都**不用改**'],
    cons: ['多一层转换，系统更绕', '它是一种**补救**手段：设计时就该统一的接口，不该靠适配器到处打补丁'],
    keyPoints: [
      '三个角色：**Target**（客户期待的接口 Player）、**Adaptee**（需要适配的类 ForeignCenter）、**Adapter**（适配器 Translator）',
      '**对象适配器**：适配器持有被适配者（组合），书中用的就是它，最常用',
      '**类适配器**：适配器同时继承两边，需要多重继承；Java 里只能 `extends Adaptee implements Target`',
      '一般在**后期维护**阶段才用；设计阶段发现接口不一致，应优先统一接口',
    ],
    code: `
// 目标接口：教练只认识 Player（Target）
abstract class Player {
    protected String name;
    Player(String name) { this.name = name; }
    public abstract void attack();
    public abstract void defense();
}
class Forwards extends Player {                  // 前锋
    Forwards(String name) { super(name); }
    public void attack()  { System.out.println("前锋 " + name + " 进攻"); }
    public void defense() { System.out.println("前锋 " + name + " 防守"); }
}
// Center（中锋）、Guards（后卫）同理……

// 被适配者：外籍中锋，只听得懂中文（Adaptee）
class ForeignCenter {
    private String name;
    public void setName(String name) { this.name = name; }
    public void 进攻() { System.out.println("外籍中锋 " + name + " 进攻"); }
    public void 防守() { System.out.println("外籍中锋 " + name + " 防守"); }
}

// 适配器：翻译。外表是 Player，肚子里装着外籍中锋（Adapter）
class Translator extends Player {
    private ForeignCenter wjzf = new ForeignCenter();
    Translator(String name) { super(name); wjzf.setName(name); }
    public void attack()  { wjzf.进攻(); }     // attack  → 进攻
    public void defense() { wjzf.防守(); }     // defense → 防守
}

// 客户端：教练对所有人一视同仁
Player b  = new Forwards("巴蒂尔");
Player m  = new Guards("麦克格雷迪");
Player ym = new Translator("姚明");
b.attack();
m.attack();
ym.attack();     // 翻译转成 wjzf.进攻()
ym.defense();    // 翻译转成 wjzf.防守()`,
    codePython: `
from abc import ABC, abstractmethod


# 目标接口：教练只认识 Player（Target）
class Player(ABC):
    def __init__(self, name):
        self.name = name

    @abstractmethod
    def attack(self): ...

    @abstractmethod
    def defense(self): ...


class Forwards(Player):                  # 前锋
    def attack(self):
        print(f"前锋 {self.name} 进攻")

    def defense(self):
        print(f"前锋 {self.name} 防守")

class Guards(Player):                    # 后卫（Center 中锋同理……）
    def attack(self):
        print(f"后卫 {self.name} 进攻")

    def defense(self):
        print(f"后卫 {self.name} 防守")


# 被适配者：外籍中锋，只听得懂中文（Adaptee）；Python 允许中文标识符
class ForeignCenter:
    def __init__(self, name):
        self.name = name

    def 进攻(self):
        print(f"外籍中锋 {self.name} 进攻")

    def 防守(self):
        print(f"外籍中锋 {self.name} 防守")


# 适配器：翻译。外表是 Player，肚子里装着外籍中锋（Adapter）
class Translator(Player):
    def __init__(self, name):
        super().__init__(name)
        self.wjzf = ForeignCenter(name)

    def attack(self):
        self.wjzf.进攻()       # attack  → 进攻

    def defense(self):
        self.wjzf.防守()       # defense → 防守


# 客户端：教练对所有人一视同仁
if __name__ == "__main__":
    for p in (Forwards("巴蒂尔"), Guards("麦克格雷迪"), Translator("姚明")):
        p.attack()      # 前锋 巴蒂尔 进攻 / 后卫 麦克格雷迪 进攻 / 外籍中锋 姚明 进攻
    Translator("姚明").defense()    # 外籍中锋 姚明 防守`,
    codeGo: `
package main

import "fmt"

// 目标接口：教练只认识 Player（Target）
type Player interface {
	Attack()
	Defense()
}

type Forwards struct{ Name string } // 前锋

func (f Forwards) Attack()  { fmt.Println("前锋", f.Name, "进攻") }
func (f Forwards) Defense() { fmt.Println("前锋", f.Name, "防守") }

type Guards struct{ Name string } // 后卫（Center 中锋同理……）

func (g Guards) Attack()  { fmt.Println("后卫", g.Name, "进攻") }
func (g Guards) Defense() { fmt.Println("后卫", g.Name, "防守") }

// 被适配者：外籍中锋，只听得懂中文（Adaptee）
// Go 允许中文标识符；首字母不是大写，所以是包内私有方法
type ForeignCenter struct{ Name string }

func (f *ForeignCenter) 进攻() { fmt.Println("外籍中锋", f.Name, "进攻") }
func (f *ForeignCenter) 防守() { fmt.Println("外籍中锋", f.Name, "防守") }

// 适配器：翻译。持有外籍中锋，并实现 Player 接口（Adapter）
type Translator struct{ wjzf *ForeignCenter }

func NewTranslator(name string) *Translator {
	return &Translator{&ForeignCenter{name}}
}

func (t *Translator) Attack()  { t.wjzf.进攻() } // Attack  → 进攻
func (t *Translator) Defense() { t.wjzf.防守() } // Defense → 防守

// 客户端：教练对所有人一视同仁
func main() {
	b := Forwards{"巴蒂尔"}
	m := Guards{"麦克格雷迪"}
	var ym Player = NewTranslator("姚明")
	b.Attack()   // 前锋 巴蒂尔 进攻
	m.Attack()   // 后卫 麦克格雷迪 进攻
	ym.Attack()  // 外籍中锋 姚明 进攻
	ym.Defense() // 外籍中锋 姚明 防守
}`,
    compare: [
      { id: 'proxy', text: '代理和真实对象**接口完全相同**，目的是控制访问；适配器存在的前提恰恰是**接口不同**，目的是把接口转换过来。' },
      { id: 'facade', text: '外观为**一群**子系统**定义一个新的**简单接口；适配器把**一个**已有类的接口**转换成**客户早就在用的那个旧接口。' },
    ],
    quiz: [
      { q: '系统里到处在调用 `sendSms(phone, text)`，现在要换成另一家短信服务商，它的 SDK 只提供 `pushMessage(Message msg)`。SDK 改不了，原来那么多调用代码也不想动，于是你写了一个类夹在中间转换一下。', why: '两边接口不一致且都不便修改，用适配器做转换。' },
      { q: '老的报表模块只接收 XML 格式的数据，新的数据服务只返回 JSON；两边分别由不同团队维护，谁也不肯改。你写了一个实现“XML 数据源”接口的类，内部调用新服务再把 JSON 转成 XML。', why: '把被适配者（JSON 服务）的接口转换成客户期望的目标接口（XML 数据源）。' },
    ],

    nodes: {
      coach: { kind: 'actor', icon: '👨‍🏫', label: '教练', sub: '火箭队', x: 300, y: 290, tone: 'orange' },
      yao: { kind: 'actor', icon: '🏀', label: '姚明', sub: '刚到 NBA', x: 700, y: 290, tone: 'red' },

      player: { kind: 'class', title: 'Player', stereo: 'abstract', sub: '球员', lines: ['+ attack()', '+ defense()'], x: 500, y: 108, tone: 'purple' },
      fw: { kind: 'class', title: 'Forwards', sub: '前锋 · 巴蒂尔', x: 230, y: 290, tone: 'teal' },
      ct: { kind: 'class', title: 'Center', sub: '中锋', x: 380, y: 290, tone: 'teal' },
      gd: { kind: 'class', title: 'Guards', sub: '后卫 · 麦克格雷迪', x: 535, y: 290, tone: 'teal' },
      fc: { kind: 'class', title: 'ForeignCenter', sub: '外籍中锋 · 姚明', lines: ['+ 进攻()', '+ 防守()'], x: 790, y: 290, tone: 'red' },
      tr: { kind: 'class', title: 'Translator', sub: '翻译（适配器）', lines: TR, x: 790, y: 290, tone: 'indigo' },
      optA: { kind: 'box', shape: 'note', icon: '🌐', label: '改 Player 接口？', sub: '全联盟都得改说中文', x: 190, y: 112, tone: 'gray' },
      optB: { kind: 'box', shape: 'note', icon: '📚', label: '改 ForeignCenter？', sub: '姚明没法一夜学会英语', x: 820, y: 112, tone: 'gray' },

      // 对象适配器 vs 类适配器
      zObj: { kind: 'zone', label: '对象适配器（书中用法，推荐）', x: 255, y: 300, w: 440, h: 400, tone: 'teal' },
      zCls: { kind: 'zone', label: '类适配器（需要多重继承）', x: 745, y: 300, w: 440, h: 400, tone: 'orange' },
      oT: { kind: 'class', title: 'Player', stereo: 'abstract', sub: 'Target', x: 150, y: 180, tone: 'purple' },
      oA: { kind: 'class', title: 'Translator', sub: 'Adapter', lines: ['- wjzf: ForeignCenter'], x: 150, y: 390, tone: 'indigo' },
      oE: { kind: 'class', title: 'ForeignCenter', sub: 'Adaptee', x: 370, y: 390, tone: 'red' },
      cT: { kind: 'class', title: 'Player', stereo: 'interface', sub: 'Target（只能是接口）', x: 640, y: 180, tone: 'purple' },
      cE: { kind: 'class', title: 'ForeignCenter', sub: 'Adaptee', x: 860, y: 180, tone: 'red' },
      cA: { kind: 'class', title: 'Translator', sub: 'extends ForeignCenter implements Player', x: 745, y: 390, tone: 'indigo' },

      // 什么时候用
      ph1: { kind: 'box', icon: '📐', label: '设计阶段', x: 180, y: 120, tone: 'blue' },
      ph2: { kind: 'box', icon: '🔨', label: '开发阶段', x: 500, y: 120, tone: 'purple' },
      ph3: { kind: 'box', icon: '🔧', label: '维护阶段', x: 820, y: 120, tone: 'orange' },
      n1: { kind: 'box', shape: 'note', icon: '✏️', label: '能改就先统一接口', sub: '发现接口不一致，及时重构，别急着套适配器', w: 250, x: 180, y: 300, tone: 'gray' },
      n2: { kind: 'box', shape: 'note', icon: '🧩', label: '第三方组件', sub: '接口和自己的不同，又没必要迁就它改自己——可以适配', w: 250, x: 500, y: 300, tone: 'gray' },
      n3: { kind: 'box', shape: 'note', icon: '🔒', label: '双方都改不动', sub: '旧系统已上线、外部类改不了——适配器的主场', w: 250, x: 820, y: 300, tone: 'gray' },
    },
    links: {
      l_fw: { from: 'fw', to: 'player', kind: 'inherit' },
      l_ct: { from: 'ct', to: 'player', kind: 'inherit' },
      l_gd: { from: 'gd', to: 'player', kind: 'inherit' },
      l_tr: { from: 'tr', to: 'player', kind: 'inherit' },
      l_tf: { from: 'tr', to: 'fc', kind: 'aggregate', label: '持有 wjzf' },
      l_oa: { from: 'oA', to: 'oT', kind: 'inherit' },
      l_oe: { from: 'oA', to: 'oE', kind: 'aggregate', label: '持有' },
      l_ca: { from: 'cA', to: 'cT', kind: 'implement' },
      l_ce: { from: 'cA', to: 'cE', kind: 'inherit' },
      l_p12: { from: 'ph1', to: 'ph2', kind: 'arrow' },
      l_p23: { from: 'ph2', to: 'ph3', kind: 'arrow' },
      l_n1: { from: 'ph1', to: 'n1', kind: 'dotted' },
      l_n2: { from: 'ph2', to: 'n2', kind: 'dotted' },
      l_n3: { from: 'ph3', to: 'n3', kind: 'dotted' },
    },

    frames: [
      {
        title: '姚明来到 NBA',
        text: '**姚明**刚加盟 NBA 火箭队。球技没问题，麻烦在语言：教练用英语喊战术 **Attack**、**Defense**，姚明一句也听不懂。人才就在场上，却**接不上话**。',
        show: ['coach', 'yao'],
        flows: [{ from: 'coach', to: 'yao', label: 'Attack!' }],
        bubbles: [
          { node: 'coach', text: '**Attack!** Pick and roll!', side: 'top' },
          { node: 'yao', text: '？？？……听不懂', side: 'top', step: 0 },
        ],
      },
      {
        title: '球员的统一接口',
        text: '先看球队的代码：所有球员都继承抽象类 `Player`，都有 `attack()` 和 `defense()`。前锋 `Forwards`、中锋 `Center`、后卫 `Guards` 各自实现。教练只认 `Player` 这个**统一接口**。',
        hide: ['yao'],
        show: ['player', 'fw', 'ct', 'gd', 'l_fw', 'l_ct', 'l_gd'],
        set: { coach: { x: 450, y: 482 } },
        focus: ['player', 'fw', 'ct', 'gd'],
      },
      {
        title: '教练统一指挥',
        text: '比赛中，教练对每个球员喊的都是同一句 `attack()`。巴蒂尔、中锋、麦克格雷迪都听得懂，立刻进攻。**接口统一，指挥起来就简单。**',
        focus: ['coach', 'fw', 'ct', 'gd'],
        flowGap: 0.4,
        flows: PLAYERS.map(id => ({ from: 'coach', to: id, label: 'attack()' })),
        bubbles: [
          { node: 'fw', text: '前锋进攻！', side: 'top', step: 0, dx: -20 },
          { node: 'gd', text: '后卫进攻！', side: 'top', step: 2, dx: 20 },
        ],
      },
      {
        title: '外籍中锋：接口不同',
        text: '姚明来了，他是外籍中锋 `ForeignCenter`，只懂 `进攻()` 和 `防守()`。他**没有继承 Player**，方法名也对不上——教练喊 `attack()`，他完全接不住。**接口不兼容。**',
        show: ['fc'],
        set: { fc: { badge: '接口不兼容' } },
        focus: ['coach', 'fc'],
        flows: [{ from: 'coach', to: 'fc', label: 'attack()', tone: 'red' }],
        bubbles: [{ node: 'fc', text: 'attack 是啥？我只会 **进攻()**', side: 'top', step: 0 }],
      },
      {
        title: '两边都改不动',
        text: '能不能改代码？改 `Player`，所有球员、教练的战术板都得跟着改；改 `ForeignCenter`，等于让姚明一夜学会英语。**两边都动不了**——这正是适配器出场的时候。',
        show: ['optA', 'optB'],
        set: { optA: { strike: true }, optB: { strike: true } },
        focus: ['optA', 'optB', 'player', 'fc'],
        bubbles: [{ node: 'coach', text: '两边都改不了，**怎么办**？', side: 'left' }],
      },
      {
        title: '翻译登场：Translator',
        text: '请一位**翻译** `Translator`：他**继承 Player**，站在球员的位置上；肚子里**持有一个外籍中锋** `wjzf`。教练喊 `attack()`，他就转告 `wjzf.进攻()`。姚明退到翻译身后。',
        hide: ['optA', 'optB'],
        show: ['tr', 'l_tr', 'l_tf'],
        trans: 1.1,
        set: { fc: { y: 470, badge: '' } },
        focus: ['tr', 'fc', 'l_tr', 'l_tf', 'player'],
        bubbles: [{ node: 'tr', text: '外表是 Player，**里面是姚明**', side: 'top', dx: 40 }],
      },
      {
        title: '跑一遍：进攻！',
        text: '教练照常喊 `attack()`，喊的对象是翻译。翻译把它翻成 `wjzf.进攻()`，姚明立刻冲上去。教练**完全不需要懂中文**，姚明也**不需要懂英文**。',
        set: { tr: { lines: mark(TR, [1]) }, fc: { lines: ['!+ 进攻()', '+ 防守()'] } },
        focus: ['coach', 'tr', 'fc'],
        flows: [
          { from: 'coach', to: 'tr', label: 'attack()' },
          { from: 'tr', to: 'fc', label: '进攻()', tone: 'red' },
        ],
        bubbles: [{ node: 'fc', text: '姚明：**进攻！**', side: 'left', step: 1 }],
      },
      {
        title: '教练眼里人人一样',
        text: '换成防守也一样：教练对**四个 Player** 同时喊 `defense()`。前锋、中锋、后卫直接执行；翻译把它转成 `防守()` 交给姚明。在教练眼里，大家**都是 Player**，没有任何特殊处理。',
        set: { tr: { lines: mark(TR, [2]) }, fc: { lines: ['+ 进攻()', '!+ 防守()'] } },
        focus: ['coach', 'fw', 'ct', 'gd', 'tr', 'fc'],
        flows: PLAYERS.concat('tr').map(id => ({ from: 'coach', to: id, label: 'defense()', step: 0 }))
          .concat([{ from: 'tr', to: 'fc', label: '防守()', tone: 'red', step: 1 }]),
        bubbles: [{ node: 'coach', text: '我只管喊 defense()', side: 'left' }],
      },
      {
        title: '角色对号入座',
        text: '对号入座：教练眼中的 `Player` 是**目标接口 Target**；姚明 `ForeignCenter` 是**被适配者 Adaptee**；翻译 `Translator` 是**适配器 Adapter**。适配器把 Adaptee 的接口**转换成** Target 的接口。',
        set: {
          tr: { lines: TR, badge: 'Adapter 适配器' },
          fc: { lines: ['+ 进攻()', '+ 防守()'], badge: 'Adaptee 被适配者' },
          player: { badge: 'Target 目标' },
          coach: { badge: 'Client' },
        },
        focus: ['player', 'tr', 'fc', 'coach', 'l_tr', 'l_tf'],
      },
      {
        title: '对象适配器 vs 类适配器',
        text: '适配器有两种写法。**对象适配器**：翻译“持有”姚明（组合），灵活，书里用的就是它。**类适配器**：翻译同时继承两边，要多重继承；Java 只能 `extends ForeignCenter implements Player`，所以 Target 必须是接口。**优先用对象适配器。**',
        clear: true,
        show: ['zObj', 'zCls', 'oT', 'oA', 'oE', 'cT', 'cE', 'cA', 'l_oa', 'l_oe', 'l_ca', 'l_ce'],
        bubbles: [
          { node: 'oA', text: '组合：**更灵活**', side: 'bottom' },
          { node: 'cA', text: '继承：和被适配类**绑死**', side: 'bottom' },
        ],
      },
      {
        title: '什么时候才用它',
        text: '适配器是“**亡羊补牢**”：设计阶段就发现接口不一致，应该直接统一接口；用第三方组件、不想迁就它时可以考虑；最常见的是**后期维护**，双方都改不动了，才在中间加个翻译。',
        clear: true,
        show: ['ph1', 'ph2', 'ph3', 'n1', 'n2', 'n3', 'l_p12', 'l_p23', 'l_n1', 'l_n2', 'l_n3'],
        set: { n3: { badge: '最常见' } },
        focus: ['ph3', 'n3', 'l_n3'],
        flows: [
          { from: 'ph1', to: 'ph2', icon: '⏳' },
          { from: 'ph2', to: 'ph3', icon: '⏳' },
        ],
        bubbles: [{ node: 'n3', text: '就像姚明刚来时**先请个翻译**', side: 'bottom' }],
      },
      {
        title: '总结：适配器模式',
        text: '适配器模式：客户只认**目标接口**，被适配者接口对不上又改不动，就在中间放一个**适配器**——外表是目标接口，里面调用被适配者。一句话：**接口对不上，中间加个翻译官。**',
        clear: true,
        show: ['player', 'fw', 'ct', 'gd', 'tr', 'fc', 'coach', 'l_fw', 'l_ct', 'l_gd', 'l_tr', 'l_tf'],
        focus: ['tr', 'fc', 'l_tf', 'coach'],
        flows: [
          { from: 'coach', to: 'tr', label: 'attack()' },
          { from: 'tr', to: 'fc', label: '进攻()', tone: 'red' },
        ],
        bubbles: [
          { node: 'tr', text: '我是**翻译官**：attack → 进攻', side: 'top', dx: 40, step: 1 },
        ],
      },
    ],
  });
})();
