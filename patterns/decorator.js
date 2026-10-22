(function () {
  // 舞台右侧“客户端代码”面板：idx 里的行会被高亮
  const mark = (lines, idx) => lines.map((l, i) => (idx.includes(i) ? '!' + l : l));
  const CODE1 = [
    'xc  = new Person("小菜");',
    'pqx = new Sneakers();',
    'kk  = new BigTrouser();',
    'dtx = new TShirts();',
    'pqx.decorate(xc);',
    'kk.decorate(pqx);',
    'dtx.decorate(kk);',
    'dtx.show();',
  ];
  const CODE2 = [
    'xc  = new Person("小菜");',
    'pxx = new LeatherShoes();',
    'ld  = new Tie();',
    'xz  = new Suit();',
    'pxx.decorate(xc);',
    'ld.decorate(pxx);',
    'xz.decorate(ld);',
    'xz.show();',
  ];

  DP.register({
    id: 'decorator',
    order: 6,
    type: 'structural',
    name: '装饰模式',
    en: 'Decorator',
    emoji: '🎀',
    chapter: '第 6 章 · 穿什么有这么重要？',
    mnemonic: '层层套娃包核心，想加功能再裹一层',
    summary: '把附加功能做成一层层“外衣”，运行时按需套在核心对象外面，想加就加、随意组合。',
    intent: '动态地给一个对象添加一些额外的职责。就增加功能来说，装饰模式比生成子类更为灵活。',
    story: '小菜要去约会，大鸟借机让他写一个**给人搭配服饰**的程序。第一版把穿 T 恤、穿垮裤……全写进 `Person`，加件衣服就得改类；第二版把服饰拆成子类，客户端却得“**光着身子当众一件件穿**”。最后大鸟让服饰类继承 Person、并**包住一个 Person**：衣服一层套一层，最外层一句 `show()` 就能层层往里秀出整身打扮。',
    analogy: '点一杯咖啡：先来一杯美式（核心），再“包”一层牛奶、一层焦糖、一层奶泡。每加一层，价格和名字都在上一层的基础上累加；想加什么、加几层、什么顺序，都由你当场决定，咖啡本身的做法一点没变。',
    when: [
      '需要给对象**动态、按需**地添加职责，并且这些职责可以**自由组合**',
      '用继承来扩展会导致子类爆炸（T恤+垮裤、T恤+西装、西装+领带+皮鞋……）',
      '想把类的**核心职责**和“锦上添花”的**装饰功能**分开，让核心类保持简单',
    ],
    pros: ['核心职责与装饰功能分离，原有类保持简洁', '装饰可以**任意组合、运行时增减**，比继承灵活得多', '新增一种装饰只需加一个类（开放-封闭）'],
    cons: ['会产生很多小对象，层层包裹时调试不直观', '**装饰顺序有讲究**：比如“先加密再过滤敏感词”就会出错，组合时要想清楚先后'],
    keyPoints: [
      '四个角色：**Component**（被装饰的抽象）、**ConcreteComponent**（核心对象，这里是 Person）、**Decorator**（装饰抽象，这里是 Finery）、**ConcreteDecorator**（TShirts、Sneakers……）',
      '关键两点：装饰者和被装饰者**是同一类型**；装饰者**持有一个**被装饰者（component）',
      '每层的 `show()` 都是“先做自己的事，再调用里面那层”，所以一次调用会**穿过所有层**',
      '书中简化：只有一个 ConcreteComponent 时，Decorator 可以直接继承它（Finery extends Person）',
    ],
    code: `
// 核心对象：人（ConcreteComponent）
class Person {
    private String name;
    Person() {}
    Person(String name) { this.name = name; }
    public void show() { System.out.println("装扮的" + name); }
}
// 装饰者：服饰也是 Person，并且手里包着一个 Person
class Finery extends Person {
    protected Person component;
    public void decorate(Person component) { this.component = component; }
    @Override
    public void show() { if (component != null) component.show(); }
}
// 具体装饰：先秀自己，再交给里面那层
class TShirts extends Finery {
    @Override
    public void show() { System.out.print("大T恤 "); super.show(); }
}
class BigTrouser extends Finery {
    @Override
    public void show() { System.out.print("垮裤 "); super.show(); }
}
class Sneakers extends Finery {
    @Override
    public void show() { System.out.print("破球鞋 "); super.show(); }
}
// Suit（西装）、Tie（领带）、LeatherShoes（皮鞋）同理……

// 客户端：一层层套上去，最后只调用最外层
Person xc = new Person("小菜");
Sneakers pqx = new Sneakers();
BigTrouser kk = new BigTrouser();
TShirts dtx = new TShirts();
pqx.decorate(xc);    // 破球鞋包住小菜
kk.decorate(pqx);    // 垮裤包住“穿了鞋的小菜”
dtx.decorate(kk);    // 大T恤包住全部
dtx.show();          // 输出：大T恤 垮裤 破球鞋 装扮的小菜`,
    codePython: `
# 注意：这是 GoF 的“对象包装”装饰模式，不是 Python 的 @decorator 语法
# （后者包装的是函数，思路相近，但这里包装的是对象）
class Person:                         # 核心对象：人（ConcreteComponent）
    def __init__(self, name=""):
        self.name = name

    def show(self):
        print("装扮的" + self.name)


class Finery(Person):                 # 装饰者：服饰也是 Person，并且包着一个 Person
    component = None

    def decorate(self, component):
        self.component = component

    def show(self):
        if self.component:
            self.component.show()


class TShirts(Finery):                # 具体装饰：先秀自己，再交给里面那层
    def show(self):
        print("大T恤 ", end="")
        super().show()


class BigTrouser(Finery):
    def show(self):
        print("垮裤 ", end="")
        super().show()


class Sneakers(Finery):
    def show(self):
        print("破球鞋 ", end="")
        super().show()


# Suit（西装）、Tie（领带）、LeatherShoes（皮鞋）同理……

# 客户端：一层层套上去，最后只调用最外层
if __name__ == "__main__":
    xc, pqx, kk, dtx = Person("小菜"), Sneakers(), BigTrouser(), TShirts()
    pqx.decorate(xc)    # 破球鞋包住小菜
    kk.decorate(pqx)    # 垮裤包住“穿了鞋的小菜”
    dtx.decorate(kk)    # 大T恤包住全部
    dtx.show()          # 大T恤 垮裤 破球鞋 装扮的小菜`,
    codeGo: `
package main

import "fmt"

// 组件接口：人和服饰都实现它（Go 没有继承，用接口 + 组合）
type Component interface{ Show() }

// 核心对象：人（ConcreteComponent）
type Person struct{ Name string }

func (p Person) Show() { fmt.Println("装扮的" + p.Name) }

// 装饰者：服饰也是 Component，并且手里包着一个 Component
type Finery struct{ component Component }

func (f *Finery) Decorate(c Component) { f.component = c }
func (f *Finery) Show() {
	if f.component != nil {
		f.component.Show()
	}
}

// 具体装饰：嵌入 Finery 复用转交逻辑；先秀自己，再交给里面那层
type TShirts struct{ Finery }

func (t *TShirts) Show() { fmt.Print("大T恤 "); t.Finery.Show() }

type BigTrouser struct{ Finery }

func (b *BigTrouser) Show() { fmt.Print("垮裤 "); b.Finery.Show() }

type Sneakers struct{ Finery }

func (s *Sneakers) Show() { fmt.Print("破球鞋 "); s.Finery.Show() }

// Suit（西装）、Tie（领带）、LeatherShoes（皮鞋）同理……

// 客户端：一层层套上去，最后只调用最外层
func main() {
	xc := Person{"小菜"}
	pqx, kk, dtx := &Sneakers{}, &BigTrouser{}, &TShirts{}
	pqx.Decorate(xc) // 破球鞋包住小菜
	kk.Decorate(pqx) // 垮裤包住“穿了鞋的小菜”
	dtx.Decorate(kk) // 大T恤包住全部
	dtx.Show()       // 大T恤 垮裤 破球鞋 装扮的小菜
}`,
    compare: [
      { id: 'proxy', text: '都是“同一接口 + 持有一个对象”。装饰的目的是**叠加功能**，由客户端一层层自由组合；代理的目的是**控制访问**，通常只有一层，客户端甚至不知道背后的真实对象。' },
      { id: 'composite', text: '组合也是“对象里套对象”，但它是**一棵树**（一个节点有很多孩子），为了统一对待部分与整体；装饰是**一条链**，每层只包一个，为了加功能。' },
    ],
    quiz: [
      { q: '奶茶店点单系统：一杯基础奶茶可以任意加珍珠、加椰果、加奶盖、再加一份布丁，加料的种类、数量和顺序都由顾客决定，价格和名称要自动累加，以后还会上新配料。', why: '核心对象 + 一层层可自由组合的附加功能，每层都在上一层基础上累加——装饰模式。' },
      { q: 'Java 读文件：先用 FileInputStream 打开文件，再在外面套一层 BufferedInputStream 加缓冲，再套一层 GZIPInputStream 边读边解压；每一层对外都还是 InputStream。', why: 'Java I/O 流就是装饰模式的经典应用：同一类型、层层包裹、动态叠加功能。' },
    ],

    nodes: {
      xiaocai: { kind: 'actor', icon: '👦', label: '小菜', sub: '今晚要约会', x: 330, y: 300, tone: 'blue' },
      dani: { kind: 'actor', icon: '🧔', label: '大鸟', x: 670, y: 300, tone: 'orange' },
      v1: {
        kind: 'class', title: 'Person', sub: '小菜的第一版：衣服全写在人身上', x: 500, y: 290, tone: 'red',
        lines: ['- name: String', '+ wearTShirts()', '+ wearBigTrouser()', '+ wearSneakers()', '+ wearSuit()', '+ wearTie()', '+ wearLeatherShoes()', '!+ wearCape()  // 超人？再改！', '+ show()'],
      },
      person: { kind: 'class', title: 'Person', sub: '人', lines: ['- name: String', '+ show()'], x: 150, y: 300, tone: 'blue' },
      finery: { kind: 'class', title: 'Finery', stereo: 'abstract', sub: '服饰', lines: ['+ show()'], x: 500, y: 300, tone: 'purple' },
      c1: { kind: 'class', title: 'TShirts', sub: '大T恤', x: 150, y: 470, tone: 'teal' },
      c2: { kind: 'class', title: 'BigTrouser', sub: '垮裤', x: 285, y: 470, tone: 'teal' },
      c3: { kind: 'class', title: 'Sneakers', sub: '破球鞋', x: 420, y: 470, tone: 'teal' },
      c4: { kind: 'class', title: 'Suit', sub: '西装', x: 555, y: 470, tone: 'teal' },
      c5: { kind: 'class', title: 'Tie', sub: '领带', x: 690, y: 470, tone: 'teal' },
      c6: { kind: 'class', title: 'LeatherShoes', sub: '皮鞋', x: 835, y: 470, tone: 'teal' },
      client2: {
        kind: 'class', title: '客户端', sub: '小菜第二版的穿法', x: 260, y: 280, tone: 'gray',
        lines: ['xc  = new Person("小菜");', 'dtx = new TShirts();', 'kk  = new BigTrouser();', 'pqx = new Sneakers();', '!dtx.show();', '!kk.show();', '!pqx.show();', '!xc.show();'],
      },
      tcode: { kind: 'class', title: 'TShirts.show()', sub: '每件衣服都这么写', lines: ['!print("大T恤 ");', '!super.show();'], x: 190, y: 295, tone: 'teal' },

      // 套娃现场
      z3: { kind: 'zone', label: 'dtx：TShirts', x: 300, y: 308, w: 420, h: 473, tone: 'purple' },
      z2: { kind: 'zone', label: 'kk：BigTrouser', x: 300, y: 358, w: 320, h: 355, tone: 'blue' },
      z1: { kind: 'zone', label: 'pqx：Sneakers', x: 300, y: 408, w: 220, h: 235, tone: 'teal' },
      closet: { kind: 'zone', label: '衣柜：三件衣服对象', x: 770, y: 495, w: 340, h: 84, tone: 'gray' },
      t1: { kind: 'box', shape: 'chip', icon: '👟', label: '破球鞋', x: 675, y: 500, tone: 'teal' },
      t2: { kind: 'box', shape: 'chip', icon: '👖', label: '垮裤', x: 775, y: 500, tone: 'blue' },
      t3: { kind: 'box', shape: 'chip', icon: '👕', label: '大T恤', x: 875, y: 500, tone: 'purple' },
      code: { kind: 'class', title: '客户端', sub: '一层层穿上去', lines: CODE1, x: 770, y: 225, tone: 'gray' },
    },
    links: {
      l_c1: { from: 'c1', to: 'finery', kind: 'inherit' },
      l_c2: { from: 'c2', to: 'finery', kind: 'inherit' },
      l_c3: { from: 'c3', to: 'finery', kind: 'inherit' },
      l_c4: { from: 'c4', to: 'finery', kind: 'inherit' },
      l_c5: { from: 'c5', to: 'finery', kind: 'inherit' },
      l_c6: { from: 'c6', to: 'finery', kind: 'inherit' },
      l_fp: { from: 'finery', to: 'person', kind: 'inherit' },
      l_fa: { from: 'finery', to: 'person', kind: 'aggregate', label: '持有 component', curve: -70, labelAt: 0.5, labelDx: -58 },
      l_tc: { from: 'c1', to: 'tcode', kind: 'dotted' },
    },

    frames: [
      {
        title: '约会前，聊聊穿衣',
        text: '小菜今晚要去见心仪的女孩，大鸟问他打算穿什么。小菜觉得**穿什么无所谓**。大鸟笑了：那就写个程序，给人**搭配不同的服饰**——就像 QQ 秀、游戏里的换装系统那样。',
        show: ['xiaocai', 'dani'],
        bubbles: [
          { node: 'dani', text: '今晚约会，**穿什么**想好了吗？', side: 'top' },
          { node: 'xiaocai', text: '穿什么有这么重要？', side: 'top', delay: 0.8 },
          { node: 'dani', text: '那你写个**换装系统**试试', side: 'bottom', delay: 1.6 },
        ],
      },
      {
        title: '第一版：衣服写进人里',
        text: '小菜的第一版：在 `Person` 里写满 `wearTShirts()`、`wearSneakers()`……大鸟问：要加一套**超人装扮**呢？“再改 Person 呗。”每加一件衣服就要**改一次人这个类**，违反了开放-封闭原则。',
        show: ['v1'],
        set: { xiaocai: { x: 120 }, dani: { x: 880 }, v1: { strike: true, badge: '加衣服就得改我' } },
        bubbles: [
          { node: 'dani', text: '要加**超人装扮**呢？', side: 'top' },
          { node: 'xiaocai', text: '再改改 Person 呗……', side: 'top', delay: 0.8 },
        ],
      },
      {
        title: '第二版：衣服各成一类',
        text: '小菜改进：抽出服饰抽象类 `Finery`，大T恤、垮裤、破球鞋、西装、领带、皮鞋**各写一个子类**，`Person` 只管 `show()` 自己。要加超人装扮？新增一个子类就行，人这个类不用再改了。',
        clear: true,
        show: ['person', 'finery', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'l_c1', 'l_c2', 'l_c3', 'l_c4', 'l_c5', 'l_c6'],
        set: { xiaocai: { x: 640, sub: '' } },
        focus: ['finery', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6'],
      },
      {
        title: '新问题：当众一件件穿',
        text: '可客户端是这么用的：`dtx.show()`、`kk.show()`、`pqx.show()`、`xc.show()` 一行行地调。大鸟说：这就像**光着身子在众人面前一件件穿衣服**！衣服应该先在内部**按顺序穿好**，再整体亮相。',
        clear: true,
        show: ['client2', 'xiaocai', 'dani'],
        set: { client2: { badge: '穿衣过程全暴露' } },
        focus: ['client2', 'xiaocai', 'dani'],
        flowGap: 0.95,
        flows: [
          { from: 'client2', to: 'xiaocai', icon: '👕', label: 'dtx.show()' },
          { from: 'client2', to: 'xiaocai', icon: '👖', label: 'kk.show()' },
          { from: 'client2', to: 'xiaocai', icon: '👟', label: 'pqx.show()' },
          { from: 'client2', to: 'xiaocai', icon: '🙋', label: 'xc.show()' },
        ],
        bubbles: [
          { node: 'dani', text: '这是**光着身子**当众穿衣服啊！', side: 'top', step: 3, dx: -30 },
        ],
      },
      {
        title: '关键：衣服也是“人”',
        text: '大鸟的关键一招：让 `Finery` **继承 Person**，同时**手里持有一个 Person**（`component`）。于是一件衣服既能被当成“人”，又能把另一个“人”包在里面——那个“人”可能是小菜本人，也可能是**已经穿了衣服的小菜**。',
        clear: true,
        trans: 1.1,
        show: ['person', 'finery', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'l_c1', 'l_c2', 'l_c3', 'l_c4', 'l_c5', 'l_c6', 'l_fp', 'l_fa'],
        set: {
          person: { x: 500, y: 95, sub: '人（被装饰的核心）' },
          finery: { stereo: '', sub: '服饰（装饰者）', lines: ['- component: Person', '+ decorate(component)', '+ show()'] },
          xiaocai: { x: 300, y: 462, sub: 'xc：Person' },
        },
        focus: ['finery', 'person', 'l_fp', 'l_fa'],
        bubbles: [
          { node: 'finery', text: '我**是** Person，\n肚子里还**包着一个** Person', side: 'right' },
        ],
      },
      {
        title: 'show()：秀完自己往里传',
        text: '每件衣服的 `show()` 只做两件事：**先秀自己**（比如打印“大T恤”），**再调用里面那层的** `show()`。它根本不关心里面包的是谁——反正都是 Person。各管各的，一层接一层。',
        show: ['tcode', 'l_tc'],
        set: { finery: { lines: ['- component: Person', '+ decorate(component)', '!+ show(): component.show()'] } },
        focus: ['tcode', 'c1', 'finery', 'l_tc'],
        bubbles: [
          { node: 'tcode', text: '① 先秀自己　② 再交给里面', side: 'top' },
        ],
      },
      {
        title: '准备：一个人三件衣服',
        text: '回到换装现场。客户端先造好四个对象：小菜本人 `xc`，还有破球鞋 `pqx`、垮裤 `kk`、大T恤 `dtx`。此刻衣服还**挂在衣柜里**，谁也没有包住谁。',
        clear: true,
        show: ['xiaocai', 'code', 'closet', 't1', 't2', 't3'],
        set: { code: { lines: mark(CODE1, [0, 1, 2, 3]) } },
        focus: ['xiaocai', 't1', 't2', 't3', 'code'],
      },
      {
        title: '第一层：鞋子包住小菜',
        text: '`pqx.decorate(xc)`：破球鞋把小菜**包了进去**，它的 `component` 就是小菜。注意：包好之后的 `pqx` 本身也是一个 Person，所以它还能**继续被别的衣服包**。',
        show: ['z1'],
        set: { t1: { x: 300, y: 345 }, code: { lines: mark(CODE1, [4]) } },
        focus: ['t1', 'z1', 'xiaocai', 'code'],
        bubbles: [
          { node: 't1', text: '我包住了**小菜**', side: 'right' },
        ],
      },
      {
        title: '第二层：垮裤再包一层',
        text: '`kk.decorate(pqx)`：垮裤包住的不是光着的小菜，而是**“穿了破球鞋的小菜”**。因为 `pqx` 也是 Person，垮裤照单全收——这就是“衣服也是人”的威力。',
        show: ['z2'],
        set: { t2: { x: 300, y: 235 }, code: { lines: mark(CODE1, [5]) } },
        focus: ['t2', 'z2', 'code'],
        bubbles: [
          { node: 't2', text: '我包住了**穿鞋的小菜**', side: 'right' },
        ],
      },
      {
        title: '第三层：T恤套在最外',
        text: '`dtx.decorate(kk)`：大T恤再把前面的一切包起来。一层套一层，像**俄罗斯套娃**。套几层、按什么顺序套，全由客户端**运行时决定**，一个类都不用改。',
        hide: ['closet'],
        show: ['z3'],
        set: { t3: { x: 300, y: 126 }, code: { lines: mark(CODE1, [6]) } },
        focus: ['t3', 'z3', 'code'],
        bubbles: [
          { node: 't3', text: '我在最外层，包住**全部**', side: 'right' },
        ],
      },
      {
        title: '一次 show()，层层往里',
        text: '最后只调用最外层的 `dtx.show()`：T恤先打印“大T恤”，再调 `kk.show()`；垮裤打印“垮裤”，再往里；破球鞋同理；最后到小菜本人：“装扮的小菜”。**一次调用，穿过所有层。**',
        set: { code: { lines: mark(CODE1, [7]) } },
        focus: ['code', 't3', 't2', 't1', 'xiaocai'],
        flows: [
          { from: 'code', to: 't3', label: 'show()' },
          { from: 't3', to: 't2', label: 'show()' },
          { from: 't2', to: 't1', label: 'show()' },
          { from: 't1', to: 'xiaocai', label: 'show()' },
        ],
        bubbles: [
          { node: 't3', text: '打印“大T恤”', side: 'right', step: 0 },
          { node: 't2', text: '打印“垮裤”', side: 'right', step: 1 },
          { node: 't1', text: '打印“破球鞋”', side: 'right', step: 2 },
          { node: 'xiaocai', text: '“装扮的小菜”', side: 'right', step: 3 },
          { node: 'code', text: '输出：**大T恤 垮裤 破球鞋 装扮的小菜**', side: 'bottom', step: 4, tone: 'green' },
        ],
      },
      {
        title: '换一身：西装领带皮鞋',
        text: '要正式点？换成皮鞋、领带、西装，同样一层层 `decorate`，再 `xz.show()`。Person 和所有服饰类**一行没改**，只是组合变了。顺序也能随便排——但**顺序不同，效果就不同**：内裤外穿，那就成超人了。',
        set: {
          t1: { icon: '👞', label: '皮鞋', tone: 'orange' },
          t2: { icon: '👔', label: '领带', tone: 'pink' },
          t3: { icon: '🤵', label: '西装', tone: 'indigo' },
          z1: { label: 'pxx：LeatherShoes', tone: 'orange' },
          z2: { label: 'ld：Tie', tone: 'pink' },
          z3: { label: 'xz：Suit', tone: 'indigo' },
          code: { lines: mark(CODE2, [4, 5, 6, 7]) },
        },
        focus: ['code', 't3', 't2', 't1', 'xiaocai'],
        flowGap: 0.9,
        flows: [
          { from: 'code', to: 't3', label: 'show()' },
          { from: 't3', to: 't2', label: 'show()' },
          { from: 't2', to: 't1', label: 'show()' },
          { from: 't1', to: 'xiaocai', label: 'show()' },
        ],
        bubbles: [
          { node: 'code', text: '输出：**西装 领带 皮鞋 装扮的小菜**', side: 'bottom', step: 4, tone: 'green' },
        ],
      },
      {
        title: '总结：装饰模式',
        text: '装饰模式把**核心职责**（小菜本人）和**装饰功能**（衣服）分开：装饰者和被装饰者是同一类型，每层只包一个、只加自己那点功能，需要时动态套上、自由组合。一句话：**层层套娃包核心，想加功能再裹一层。**',
        focus: ['xiaocai', 't3', 't2', 't1', 'z1', 'z2', 'z3'],
        bubbles: [
          { node: 'xiaocai', text: '**核心**：我只管做好自己', side: 'right' },
          { node: 't3', text: '**装饰**：想加就再套一层', side: 'right' },
        ],
      },
    ],
  });
})();
