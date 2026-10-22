(function () {
  const FWD = ['- gg: Pursuit', '+ giveDolls(): gg.giveDolls()', '+ giveFlowers(): gg.giveFlowers()', '+ giveChocolate(): gg.giveChocolate()'];
  const REAL = ['- mm: SchoolGirl', '+ giveDolls(): 🎎', '+ giveFlowers(): 💐', '+ giveChocolate(): 🍫'];
  const mark = (lines, idx) => lines.map((l, i) => (idx.includes(i) ? '!' + l : l));

  DP.register({
    id: 'proxy',
    order: 7,
    type: 'structural',
    name: '代理模式',
    en: 'Proxy',
    emoji: '🎭',
    chapter: '第 7 章 · 为别人做嫁衣',
    mnemonic: '接口一样当替身，先把关再转交',
    summary: '给真实对象找个“替身”，替身和它接口一样，所有访问都先经过替身，由替身把关、转交。',
    intent: '为其他对象提供一种代理以控制对这个对象的访问。',
    story: '**卓贾易**喜欢**李娇娇**，可两人素不相识，于是他托朋友**戴励**（谐音“代理”）替自己送洋娃娃、鲜花和巧克力。礼物全是卓贾易买的，娇娇却只见过戴励——最后她喜欢上了戴励，卓贾易真是**为别人做嫁衣**。代码里，追求者 `Pursuit` 和代理 `Proxy` 实现同一个送礼接口，代理肚子里握着追求者，每个方法都原样转交给他。',
    analogy: '明星和经纪人：想找明星拍广告，你只能先联系经纪人。经纪人和明星“能谈的事”一样（档期、报价、合同），但他会先替明星把关——价格太低、档期冲突直接回绝，合适的才转给明星本人。你全程可能都见不到明星。',
    when: [
      '**远程代理**：对象在另一台机器上，用一个本地代表隐藏“它不在本机”的事实（如 WebService 引用）',
      '**虚拟代理**：对象创建很贵，先用代理顶着，真正需要时再创建（如网页大图先显示占位框）',
      '**安全代理**：控制访问权限，不同角色能调用的操作不同',
      '**智能指引**：访问真实对象时顺手做点事，如计算引用次数、首次使用才加载、访问前检查是否加锁',
    ],
    pros: ['在不改动真实对象的前提下，**控制对它的访问**', '客户端面向同一接口编程，感觉不到代理的存在', '把权限、延迟加载、远程通信等杂事从真实对象中剥离'],
    cons: ['多了一层间接调用，可能变慢', '代理类要实现接口的全部方法，接口一变两边都要改'],
    keyPoints: [
      '三个角色：**Subject**（共同接口 IGiveGift）、**RealSubject**（真实对象 Pursuit）、**Proxy**（代理，持有 RealSubject）',
      '关键：代理和真实对象**实现同一接口**，所以任何用到真实对象的地方都能换成代理',
      '书中两次错误尝试：①让追求者直接送（两人不认识）；②让代理自己送（礼物和追求者脱节）',
    ],
    code: `
// 共同接口：送礼物（Subject）
interface IGiveGift {
    void giveDolls();
    void giveFlowers();
    void giveChocolate();
}
class SchoolGirl { String name; }

// 真实对象：追求者卓贾易（RealSubject）——礼物是他买的
class Pursuit implements IGiveGift {
    private SchoolGirl mm;
    Pursuit(SchoolGirl mm) { this.mm = mm; }
    public void giveDolls()     { System.out.println(mm.name + "，送你洋娃娃"); }
    public void giveFlowers()   { System.out.println(mm.name + "，送你鲜花"); }
    public void giveChocolate() { System.out.println(mm.name + "，送你巧克力"); }
}

// 代理：戴励（Proxy）——同一接口，肚子里握着追求者，全部原样转交
class Proxy implements IGiveGift {
    private Pursuit gg;
    Proxy(SchoolGirl mm) { gg = new Pursuit(mm); }
    public void giveDolls()     { gg.giveDolls(); }
    public void giveFlowers()   { gg.giveFlowers(); }
    public void giveChocolate() { gg.giveChocolate(); }
}

// 客户端：娇娇从头到尾只和“戴励”打交道
SchoolGirl jiaojiao = new SchoolGirl();
jiaojiao.name = "李娇娇";
Proxy daili = new Proxy(jiaojiao);
daili.giveDolls();
daili.giveFlowers();
daili.giveChocolate();`,
    codePython: `
from abc import ABC, abstractmethod


# 共同接口：送礼物（Subject）
class IGiveGift(ABC):
    @abstractmethod
    def give_dolls(self): ...

    @abstractmethod
    def give_flowers(self): ...

    @abstractmethod
    def give_chocolate(self): ...


class SchoolGirl:
    def __init__(self, name):
        self.name = name


class Pursuit(IGiveGift):             # 真实对象：追求者卓贾易（RealSubject）
    def __init__(self, mm):
        self.mm = mm

    def give_dolls(self):
        print(self.mm.name + "，送你洋娃娃")

    def give_flowers(self):
        print(self.mm.name + "，送你鲜花")

    def give_chocolate(self):
        print(self.mm.name + "，送你巧克力")


class Proxy(IGiveGift):               # 代理：戴励（Proxy）——同一接口，全部原样转交
    def __init__(self, mm):
        self.gg = Pursuit(mm)

    def give_dolls(self):
        self.gg.give_dolls()

    def give_flowers(self):
        self.gg.give_flowers()

    def give_chocolate(self):
        self.gg.give_chocolate()


# 客户端：娇娇从头到尾只和“戴励”打交道
if __name__ == "__main__":
    daili = Proxy(SchoolGirl("李娇娇"))
    daili.give_dolls()        # 李娇娇，送你洋娃娃
    daili.give_flowers()      # 李娇娇，送你鲜花
    daili.give_chocolate()    # 李娇娇，送你巧克力`,
    codeGo: `
package main

import "fmt"

// 共同接口：送礼物（Subject）。Go 的接口是隐式实现的，不用写 implements
type IGiveGift interface {
	GiveDolls()
	GiveFlowers()
	GiveChocolate()
}

type SchoolGirl struct{ Name string }

// 真实对象：追求者卓贾易（RealSubject）——礼物是他买的
type Pursuit struct{ mm *SchoolGirl }

func (p Pursuit) GiveDolls()     { fmt.Println(p.mm.Name + "，送你洋娃娃") }
func (p Pursuit) GiveFlowers()   { fmt.Println(p.mm.Name + "，送你鲜花") }
func (p Pursuit) GiveChocolate() { fmt.Println(p.mm.Name + "，送你巧克力") }

// 代理：戴励（Proxy）——同一接口，肚子里握着追求者，全部原样转交
type Proxy struct{ gg Pursuit }

func NewProxy(mm *SchoolGirl) *Proxy { return &Proxy{Pursuit{mm}} }

func (p *Proxy) GiveDolls()     { p.gg.GiveDolls() }
func (p *Proxy) GiveFlowers()   { p.gg.GiveFlowers() }
func (p *Proxy) GiveChocolate() { p.gg.GiveChocolate() }

// 客户端：娇娇从头到尾只和“戴励”打交道
func main() {
	var daili IGiveGift = NewProxy(&SchoolGirl{"李娇娇"})
	daili.GiveDolls()     // 李娇娇，送你洋娃娃
	daili.GiveFlowers()   // 李娇娇，送你鲜花
	daili.GiveChocolate() // 李娇娇，送你巧克力
}`,
    compare: [
      { id: 'decorator', text: '结构很像（同一接口 + 持有一个对象）。代理的目的是**控制访问**，真实对象通常由代理自己创建、对客户端隐藏；装饰的目的是**叠加功能**，由客户端一层层自由套。' },
      { id: 'adapter', text: '适配器是因为**接口对不上**才出现，它把一种接口转成另一种；代理和真实对象**接口完全相同**，只是在前面把一道关。' },
    ],
    quiz: [
      { q: '相册 App 打开时先显示灰色方框和图片尺寸，等高清原图在后台下载完，再把方框换成真图；显示页面的代码完全不知道这层“先占位、后加载”的存在，它调用的接口和真图对象一模一样。', why: '虚拟代理：用一个同接口的替身推迟创建开销大的对象。' },
      { q: '公司的薪资查询服务只允许 HR 调用。你没有改动原服务，而是写了一个实现同样接口的类挡在它前面：每次调用先检查当前用户的角色，通过了才转给真正的服务，否则直接拒绝。', why: '安全代理：接口相同，在前面控制对真实对象的访问。' },
    ],

    nodes: {
      zjy: { kind: 'actor', icon: '🧑', label: '卓贾易', sub: '暗恋娇娇的追求者', x: 150, y: 290, tone: 'blue' },
      dl: { kind: 'actor', icon: '😎', label: '戴励', sub: '帮忙送礼的朋友', x: 500, y: 290, tone: 'teal' },
      jj: { kind: 'actor', icon: '👧', label: '李娇娇', sub: '心仪的女孩', x: 850, y: 290, tone: 'pink' },

      girl: { kind: 'class', title: 'SchoolGirl', sub: '李娇娇', lines: ['- name: String'], x: 720, y: 280, tone: 'pink' },
      pursuit: { kind: 'class', title: 'Pursuit', sub: '追求者 · 卓贾易', lines: ['- mm: SchoolGirl', '+ giveDolls()', '+ giveFlowers()', '+ giveChocolate()'], x: 300, y: 280, tone: 'blue' },
      proxy: { kind: 'class', title: 'Proxy', sub: '代理 · 戴励', lines: ['- mm: SchoolGirl', '+ giveDolls()', '+ giveFlowers()', '+ giveChocolate()'], x: 300, y: 200, tone: 'teal' },
      iface: { kind: 'class', title: 'IGiveGift', stereo: 'interface', sub: '送礼物', lines: ['+ giveDolls()', '+ giveFlowers()', '+ giveChocolate()'], x: 610, y: 108, tone: 'purple' },
      client: { kind: 'actor', icon: '👨‍💻', label: '客户端', sub: 'main()', x: 90, y: 300, tone: 'gray', size: 'sm' },
      curtain: { kind: 'zone', label: '幕后（娇娇看不见）', x: 840, y: 300, w: 236, h: 196, tone: 'gray' },

      // 虚拟代理场景
      page: { kind: 'zone', label: '🌐 网页', x: 190, y: 300, w: 300, h: 320, tone: 'blue' },
      words: { kind: 'box', icon: '📝', label: '文字内容', sub: '马上就显示', x: 190, y: 215, tone: 'blue' },
      slot: { kind: 'box', shape: 'ghost', icon: '⏳', label: '图片占位框', sub: '先按尺寸画个框', x: 190, y: 360, tone: 'gray' },
      iproxy: { kind: 'class', title: 'ImageProxy', sub: '虚拟代理', lines: ['- real: RealImage', '+ display()'], x: 560, y: 360, tone: 'teal' },
      realimg: { kind: 'box', icon: '🖼️', label: '高清大图', sub: 'RealImage · 20MB', x: 860, y: 360, tone: 'orange' },

      // 四种用途
      u1: { kind: 'box', icon: '🌍', label: '远程代理', sub: '对象在另一台机器上，用本地代表隐藏“它不在本机”的事实，如 WebService 引用', w: 380, x: 280, y: 165, tone: 'blue' },
      u2: { kind: 'box', icon: '🖼️', label: '虚拟代理', sub: '创建很贵的对象先用代理顶着，真正需要时才创建，如网页大图', w: 380, x: 720, y: 165, tone: 'teal' },
      u3: { kind: 'box', icon: '🔒', label: '安全代理', sub: '控制谁能访问真实对象、能做哪些操作', w: 380, x: 280, y: 370, tone: 'red' },
      u4: { kind: 'box', icon: '🧠', label: '智能指引', sub: '访问时顺手做点事：统计引用次数、首次使用才加载、访问前检查是否加锁', w: 380, x: 720, y: 370, tone: 'purple' },
      hub: { kind: 'box', shape: 'pill', icon: '🎭', label: '代理', x: 500, y: 268, tone: 'indigo', size: 'lg' },
      common: { kind: 'text', text: '共同点：**接口不变**，在真实对象前面**把一道关**', x: 500, y: 500, size: 'lg', tone: 'indigo' },
    },
    links: {
      l_pg: { from: 'pursuit', to: 'girl', kind: 'assoc', label: '直接送礼' },
      l_xg: { from: 'proxy', to: 'girl', kind: 'assoc', label: '自己送礼' },
      l_pi: { from: 'pursuit', to: 'iface', kind: 'implement' },
      l_xi: { from: 'proxy', to: 'iface', kind: 'implement' },
      l_xp: { from: 'proxy', to: 'pursuit', kind: 'aggregate', label: '持有 gg' },
      l_cx: { from: 'client', to: 'proxy', kind: 'assoc' },
      l_pp: { from: 'slot', to: 'iproxy', kind: 'assoc' },
      l_ir: { from: 'iproxy', to: 'realimg', kind: 'aggregate', label: '持有' },
      l_h1: { from: 'hub', to: 'u1', kind: 'dotted' },
      l_h2: { from: 'hub', to: 'u2', kind: 'dotted' },
      l_h3: { from: 'hub', to: 'u3', kind: 'dotted' },
      l_h4: { from: 'hub', to: 'u4', kind: 'dotted' },
    },

    frames: [
      {
        title: '卓贾易的心事',
        text: '**卓贾易**喜欢上了**李娇娇**，可两人根本不认识，他又不好意思开口。于是托朋友**戴励**帮忙：洋娃娃、鲜花、巧克力，全由戴励**替他送去**。',
        show: ['zjy', 'dl', 'jj'],
        flows: [
          { from: 'zjy', to: 'dl', icon: '🎎', label: '洋娃娃', tone: 'pink' },
          { from: 'dl', to: 'jj', icon: '🎎', label: '洋娃娃', tone: 'pink' },
        ],
        bubbles: [
          { node: 'zjy', text: '她**不认识我**，你帮我送吧', side: 'top' },
          { node: 'dl', text: '包在我身上！', side: 'top', step: 0 },
          { node: 'jj', text: '谢谢你，**戴励**！', side: 'top', step: 1 },
        ],
      },
      {
        title: '第一版：追求者直接送',
        text: '小菜的第一版：追求者 `Pursuit` 直接持有 `SchoolGirl`，自己调用送礼方法。可故事里娇娇**根本不认识**卓贾易——代码和现实对不上，这样写不对。',
        clear: true,
        show: ['pursuit', 'girl', 'l_pg'],
        set: { jj: { x: 400, y: 495 } },
        flows: [{ from: 'pursuit', to: 'girl', icon: '🎎', label: 'giveDolls()', tone: 'pink' }],
        bubbles: [{ node: 'girl', text: '你谁呀？**我不认识你**', side: 'top', step: 0 }],
      },
      {
        title: '第二版：代理自己送',
        text: '第二版：换成代理 `Proxy` 持有 `SchoolGirl` 去送礼。可这样一来，礼物变成了**戴励自己的**，真正掏钱的卓贾易**被弄丢了**。大鸟说：送礼的是代理，买礼物的得是追求者。',
        hide: ['l_pg'],
        show: ['proxy', 'l_xg'],
        set: { pursuit: { x: 300, y: 455, opacity: 0.45, badge: '那我呢？' } },
        focus: ['proxy', 'girl', 'l_xg', 'pursuit'],
        flows: [{ from: 'proxy', to: 'girl', icon: '🎎', label: '洋娃娃', tone: 'pink' }],
        bubbles: [{ node: 'girl', text: '谢谢**戴励**送的礼物！', side: 'top', step: 0 }],
      },
      {
        title: '共同点：都会送礼物',
        text: '大鸟点拨：追求者和代理有个共同点——**都会送礼物**。把它抽成接口 `IGiveGift`：送洋娃娃、送鲜花、送巧克力。让 `Pursuit` 和 `Proxy` **都实现这个接口**。',
        hide: ['girl', 'l_xg'],
        show: ['iface', 'l_pi', 'l_xi'],
        trans: 1.1,
        set: {
          pursuit: { x: 840, y: 300, opacity: 1, badge: '' },
          proxy: { x: 400, y: 300, lines: ['+ giveDolls()', '+ giveFlowers()', '+ giveChocolate()'] },
        },
        focus: ['iface', 'l_pi', 'l_xi'],
        bubbles: [{ node: 'iface', text: '他俩都会**送礼物**', side: 'right' }],
      },
      {
        title: '追求者：真正的主角',
        text: '追求者 `Pursuit` 是**真实对象**：他认识娇娇（持有 `mm`），每样礼物都是**他掏钱买的**，`giveDolls()` 等方法里是真正的送礼逻辑。',
        set: { pursuit: { lines: mark(REAL, [1, 2, 3]) } },
        focus: ['pursuit'],
        bubbles: [{ node: 'pursuit', text: '礼物都是**我**买的', side: 'bottom' }],
      },
      {
        title: '代理：握着追求者转交',
        text: '代理 `Proxy` 也实现 `IGiveGift`，但它**自己不买礼物**：肚子里握着一个追求者 `gg`，每个方法都只是**原样转交**——`giveDolls()` 就调用 `gg.giveDolls()`。',
        show: ['l_xp'],
        set: { proxy: { lines: mark(FWD, [1, 2, 3]) }, pursuit: { lines: REAL } },
        focus: ['proxy', 'pursuit', 'l_xp'],
        bubbles: [{ node: 'proxy', text: '我**只负责转交**', side: 'bottom' }],
      },
      {
        title: '跑一遍：送洋娃娃',
        text: '客户端只调用代理：`daili.giveDolls()`。戴励转身调用 `gg.giveDolls()`，卓贾易拿出洋娃娃，再经戴励之手递给娇娇。**娇娇只看见戴励。**',
        show: ['client', 'jj', 'l_cx'],
        set: { proxy: { lines: mark(FWD, [1]) }, pursuit: { lines: mark(REAL, [1]) } },
        focus: ['client', 'proxy', 'pursuit', 'jj'],
        flows: [
          { from: 'client', to: 'proxy', label: 'giveDolls()' },
          { from: 'proxy', to: 'pursuit', label: 'gg.giveDolls()' },
          { from: 'pursuit', to: 'proxy', icon: '🎎', label: '卓贾易买的', back: true, tone: 'pink' },
          { from: 'proxy', to: 'jj', icon: '🎎', label: '洋娃娃', tone: 'pink' },
        ],
        bubbles: [{ node: 'jj', text: '谢谢**戴励**！', side: 'right', step: 3 }],
      },
      {
        title: '鲜花、巧克力，照旧',
        text: '鲜花、巧克力也一样：每次都是**代理出面、真身干活**。真实对象躲在幕后，客户端和娇娇只和代理打交道——因为两者**接口一样**，根本分不出来。',
        show: ['curtain'],
        set: { proxy: { lines: mark(FWD, [2, 3]) }, pursuit: { lines: mark(REAL, [2, 3]) } },
        focus: ['proxy', 'jj', 'client'],
        flowGap: 0.9,
        flows: [
          { from: 'client', to: 'proxy', label: 'giveFlowers()' },
          { from: 'proxy', to: 'pursuit', label: 'gg.giveFlowers()' },
          { from: 'proxy', to: 'jj', icon: '💐', label: '鲜花', tone: 'pink' },
          { from: 'client', to: 'proxy', label: 'giveChocolate()' },
          { from: 'proxy', to: 'pursuit', label: 'gg.giveChocolate()' },
          { from: 'proxy', to: 'jj', icon: '🍫', label: '巧克力', tone: 'pink' },
        ],
        bubbles: [{ node: 'jj', text: '戴励**对我真好**……', side: 'right', step: 5 }],
      },
      {
        title: '结局：为别人做嫁衣',
        text: '结局你猜到了：娇娇天天收到戴励递来的礼物，最后喜欢上了**戴励**。卓贾易花了钱，却**为别人做了嫁衣**——“卓贾易”谐音就是“做嫁衣”。这也正说明：**外界只认识代理**。',
        set: { pursuit: { badge: '为他人做嫁衣', lines: REAL }, proxy: { lines: FWD } },
        focus: ['jj', 'proxy', 'pursuit'],
        flows: [{ from: 'jj', to: 'proxy', icon: '💘', label: '我喜欢你', tone: 'red', stay: true }],
        bubbles: [
          { node: 'pursuit', text: '礼物明明是我买的……😭', side: 'bottom', step: 0 },
        ],
      },
      {
        title: '用途：虚拟代理',
        text: '代理在编程里很常用。比如**虚拟代理**：打开一个图片很多的网页，文字马上出来，图片位置先放一个**占位框**，真图在后台慢慢下载，到了再换上。那个图片框，就是真实大图的代理。',
        clear: true,
        show: ['page', 'words', 'slot', 'iproxy', 'realimg', 'l_pp', 'l_ir'],
        flows: [
          { from: 'slot', to: 'iproxy', label: 'display()' },
          { from: 'iproxy', to: 'slot', icon: '⏳', label: '先画个框', back: true, tone: 'gray', curve: 50, step: 1 },
          { from: 'iproxy', to: 'realimg', label: '后台慢慢下载', step: 1 },
          { from: 'realimg', to: 'iproxy', icon: '✅', label: '下载完成', back: true, tone: 'orange', step: 2 },
          { from: 'iproxy', to: 'slot', icon: '🖼️', label: '换上真图', tone: 'orange', curve: -40, step: 3 },
        ],
        bubbles: [
          { node: 'words', text: '文字**秒开**，不用等图', side: 'top', step: 1 },
          { node: 'slot', text: '🖼️ 真图到了，**换上**！', side: 'bottom', step: 3, tone: 'orange' },
        ],
      },
      {
        title: '代理的四种用途',
        text: '书中总结了代理的四种用途：**远程代理**、**虚拟代理**、**安全代理**、**智能指引**。场景各不相同，套路完全一样：和真实对象**接口相同**，所有访问先经过它。',
        clear: true,
        show: ['hub', 'u1', 'u2', 'u3', 'u4', 'common', 'l_h1', 'l_h2', 'l_h3', 'l_h4'],
        set: { u2: { badge: '刚才那个' } },
      },
      {
        title: '总结：代理模式',
        text: '代理模式三件套：共同接口 **Subject**、真实对象 **RealSubject**、代理 **Proxy**。代理和真身长得一样，外界只跟代理打交道，由它决定何时、如何转给真身。一句话：**接口一样当替身，先把关再转交。**',
        clear: true,
        show: ['iface', 'proxy', 'pursuit', 'client', 'jj', 'curtain', 'l_pi', 'l_xi', 'l_xp', 'l_cx'],
        set: { pursuit: { badge: '' } },
        focus: ['proxy', 'iface', 'l_xi', 'l_xp'],
        bubbles: [
          { node: 'proxy', text: '和真身**同一接口**，替它把关、转交', side: 'top' },
          { node: 'iface', text: 'Subject：大家都认这个接口', side: 'right' },
        ],
      },
    ],
  });
})();
