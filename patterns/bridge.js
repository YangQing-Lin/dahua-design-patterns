DP.register({
  id: 'bridge',
  order: 22,
  type: 'structural',
  name: '桥接模式',
  en: 'Bridge',
  emoji: '🌉',
  chapter: '第 22 章 · 手机软件何时统一',
  mnemonic: '两个维度各自变，聚合搭桥连两边',
  summary: '把“抽象”和“实现”拆成两棵独立的继承树，用聚合连起来，两边各自扩展、互不牵连。',
  intent: '将抽象部分与它的实现部分分离，使它们都可以独立地变化。',
  story: '当年手机软件不通用：小菜手机上的游戏，到了大鸟的手机上就玩不了。小菜按“先分品牌、再分软件”层层继承来设计，结果加一个 **MP3** 或一个新品牌 **S**，类就成倍增加。大鸟让他把**手机品牌**和**手机软件**拆成两棵树，品牌“持有”一个软件——这条聚合线就是那座**桥**。',
  analogy: '买画笔：蜡笔要“12 种颜色 × 3 种粗细”= 36 支；换成毛笔，只要 3 支粗细不同的笔 + 12 盒颜料，想画什么颜色就蘸什么颜色。笔（抽象）和颜料（实现）各自增加，互不影响。',
  when: [
    '一个东西有**两个（或更多）独立变化的维度**，比如“品牌 × 软件”“形状 × 颜色”',
    '用继承来组合各个维度，子类数量会**按乘法爆炸**',
    '希望抽象和实现都能**各自扩展**，甚至在运行时切换实现',
  ],
  pros: ['类的数量从“相乘”变成“相加”', '抽象和实现各自扩展，新增一边不用改另一边（开放-封闭）', '实现细节对客户隐藏，运行时可以换实现'],
  cons: ['要在一开始就识别出**独立变化的维度**，设计门槛更高', '多了一层聚合关系，代码读起来要多绕一步'],
  keyPoints: [
    '四个角色：**Abstraction**（抽象，`HandsetBrand`）、**RefinedAbstraction**（扩充抽象，品牌M/N）、**Implementor**（实现，`HandsetSoft`）、**ConcreteImplementor**（具体实现，游戏/通讯录）',
    '这里的“实现”不是指具体代码，而是指抽象类和它的派生类**用来实现自己的对象**（品牌靠软件来干活）',
    '那座“桥”就是 `HandsetBrand` 对 `HandsetSoft` 的**聚合**关系，是合成/聚合复用原则的典型应用',
  ],
  code: `
// 实现部分：手机软件
abstract class HandsetSoft {
    public abstract void run();
}
class HandsetGame extends HandsetSoft {
    public void run() { System.out.println("运行手机游戏"); }
}
class HandsetAddressList extends HandsetSoft {
    public void run() { System.out.println("运行手机通讯录"); }
}
class HandsetMP3 extends HandsetSoft {         // 新增软件：只加这一个类
    public void run() { System.out.println("运行手机MP3"); }
}
// 抽象部分：手机品牌，持有一个软件 —— 这条聚合就是“桥”
abstract class HandsetBrand {
    protected HandsetSoft soft;
    public void setHandsetSoft(HandsetSoft soft) { this.soft = soft; }
    public abstract void run();
}
class HandsetBrandM extends HandsetBrand {
    public void run() { System.out.print("品牌M："); soft.run(); }
}
class HandsetBrandN extends HandsetBrand {
    public void run() { System.out.print("品牌N："); soft.run(); }
}
class HandsetBrandS extends HandsetBrand {     // 新增品牌：也只加一个类
    public void run() { System.out.print("品牌S："); soft.run(); }
}
// 客户端：品牌和软件在运行时自由组合
HandsetBrand ab = new HandsetBrandN();
ab.setHandsetSoft(new HandsetGame());
ab.run();                                      // 品牌N：运行手机游戏
ab.setHandsetSoft(new HandsetAddressList());
ab.run();                                      // 品牌N：运行手机通讯录`,
  codePython: `
from abc import ABC, abstractmethod


# 实现部分：手机软件
class HandsetSoft(ABC):
    @abstractmethod
    def run(self): ...


class HandsetGame(HandsetSoft):
    def run(self):
        print("运行手机游戏")


class HandsetAddressList(HandsetSoft):
    def run(self):
        print("运行手机通讯录")


class HandsetMP3(HandsetSoft):            # 新增软件：只加这一个类
    def run(self):
        print("运行手机MP3")


# 抽象部分：手机品牌，持有一个软件 —— 这条聚合就是“桥”
class HandsetBrand(ABC):
    soft: HandsetSoft

    def set_handset_soft(self, soft):
        self.soft = soft

    @abstractmethod
    def run(self): ...


class HandsetBrandM(HandsetBrand):
    def run(self):
        print("品牌M：", end="")
        self.soft.run()


class HandsetBrandN(HandsetBrand):
    def run(self):
        print("品牌N：", end="")
        self.soft.run()


# 客户端：品牌和软件在运行时自由组合
if __name__ == "__main__":
    ab = HandsetBrandN()
    ab.set_handset_soft(HandsetGame())
    ab.run()                              # 品牌N：运行手机游戏
    ab.set_handset_soft(HandsetAddressList())
    ab.run()                              # 品牌N：运行手机通讯录
    ab = HandsetBrandM()
    ab.set_handset_soft(HandsetMP3())
    ab.run()                              # 品牌M：运行手机MP3`,
  codeGo: `
package main

import "fmt"

// 实现部分：手机软件
type HandsetSoft interface{ Run() }

type HandsetGame struct{}

func (HandsetGame) Run() { fmt.Println("运行手机游戏") }

type HandsetAddressList struct{}

func (HandsetAddressList) Run() { fmt.Println("运行手机通讯录") }

type HandsetMP3 struct{} // 新增软件：只加这一个类型

func (HandsetMP3) Run() { fmt.Println("运行手机MP3") }

// 抽象部分：手机品牌的接口，以及共享的基础结构体
type Brand interface {
	SetHandsetSoft(soft HandsetSoft)
	Run()
}

// soft 这个聚合字段就是“桥”；品牌们嵌入它来复用 SetHandsetSoft（Go 没有继承）
type HandsetBrand struct{ soft HandsetSoft }

func (b *HandsetBrand) SetHandsetSoft(soft HandsetSoft) { b.soft = soft }

type HandsetBrandM struct{ HandsetBrand }

func (b *HandsetBrandM) Run() { fmt.Print("品牌M："); b.soft.Run() }

type HandsetBrandN struct{ HandsetBrand }

func (b *HandsetBrandN) Run() { fmt.Print("品牌N："); b.soft.Run() }

// 客户端：品牌和软件在运行时自由组合
func main() {
	var ab Brand = &HandsetBrandN{}
	ab.SetHandsetSoft(HandsetGame{})
	ab.Run() // 品牌N：运行手机游戏
	ab.SetHandsetSoft(HandsetAddressList{})
	ab.Run() // 品牌N：运行手机通讯录
	ab = &HandsetBrandM{}
	ab.SetHandsetSoft(HandsetMP3{})
	ab.Run() // 品牌M：运行手机MP3
}`,
  compare: [
    { id: 'adapter', text: '适配器是**事后补救**：让两个已经存在、接口不兼容的类能一起工作；桥接是**事前设计**：一开始就把两个维度拆开，让它们各自变化。' },
    { id: 'strategy', text: '结构有点像（都是“持有一个抽象”）。策略只关心**一种算法可替换**；桥接的两边**都是继承树**，解决的是多个维度组合造成的类爆炸。' },
  ],
  quiz: [
    { q: '绘图程序要画圆形、矩形、三角形，还要能在 Windows、Linux、macOS 三套图形接口上绘制。如果每种组合写一个子类就要 9 个类，以后形状和平台还会继续增加。', why: '“形状”和“绘图平台”是两个独立变化的维度：形状持有一个绘图实现，两边各自扩展。' },
    { q: '通知系统里，消息分“普通 / 加急 / 特急”三个级别，发送渠道有“站内信 / 短信 / 邮件”，两边都会继续增加，并且要求任意级别都能配任意渠道。', why: '消息级别是抽象、发送渠道是实现，用聚合连起来，避免“级别 × 渠道”个子类。' },
  ],

  nodes: {
    // —— 场景一：故事引入 ——
    xc: { kind: 'actor', icon: '👦', label: '小菜', x: 125, y: 300, tone: 'blue' },
    db: { kind: 'actor', icon: '🧔', label: '大鸟', x: 890, y: 300, tone: 'orange' },
    phM: { kind: 'box', icon: '📱', label: '小菜的手机', sub: '品牌 M', x: 330, y: 300, tone: 'teal', size: 'lg' },
    phN: { kind: 'box', icon: '📱', label: '大鸟的手机', sub: '品牌 N', x: 670, y: 300, tone: 'indigo', size: 'lg' },

    // —— 场景二：按品牌继承，类爆炸 ——
    r: { kind: 'class', title: 'HandsetBrand', stereo: 'abstract', sub: '手机品牌', x: 500, y: 95, tone: 'purple' },
    rM: { kind: 'class', title: 'HandsetBrandM', sub: '品牌M', x: 270, y: 205, tone: 'blue' },
    rN: { kind: 'class', title: 'HandsetBrandN', sub: '品牌N', x: 730, y: 205, tone: 'blue' },
    rS: { kind: 'class', title: 'HandsetBrandS', sub: '品牌S', x: 830, y: 180, tone: 'red', scale: 0.85, badge: 'NEW' },
    mG: { kind: 'class', title: 'HandsetBrandMGame', sub: '品牌M的游戏', x: 145, y: 325, tone: 'teal' },
    mA: { kind: 'class', title: 'HandsetBrandMAddressList', sub: '品牌M的通讯录', x: 385, y: 325, tone: 'teal' },
    nG: { kind: 'class', title: 'HandsetBrandNGame', sub: '品牌N的游戏', x: 615, y: 325, tone: 'teal' },
    nA: { kind: 'class', title: 'HandsetBrandNAddressList', sub: '品牌N的通讯录', x: 855, y: 325, tone: 'teal' },
    mP: { kind: 'class', title: 'HandsetBrandMMP3', sub: '品牌M的MP3', x: 390, y: 300, tone: 'red', scale: 0.9, badge: 'NEW' },
    nP: { kind: 'class', title: 'HandsetBrandNMP3', sub: '品牌N的MP3', x: 890, y: 300, tone: 'red', scale: 0.9, badge: 'NEW' },
    sG: { kind: 'class', title: 'HandsetBrandSGame', sub: '品牌S的游戏', x: 738, y: 290, tone: 'red', scale: 0.72 },
    sA: { kind: 'class', title: 'HandsetBrandSAddressList', sub: '品牌S的通讯录', x: 830, y: 400, tone: 'red', scale: 0.72 },
    sP: { kind: 'class', title: 'HandsetBrandSMP3', sub: '品牌S的MP3', x: 922, y: 290, tone: 'red', scale: 0.72 },
    cnt: { kind: 'text', text: '一共 7 个类', x: 500, y: 470, tone: 'red', size: 'lg' },

    // —— 场景三：大鸟点拨 ——
    db2: { kind: 'actor', icon: '🧔', label: '大鸟', x: 500, y: 430, tone: 'orange' },
    dimB: { kind: 'box', icon: '📱', label: '手机品牌', sub: 'M、N、S……还会再加', x: 250, y: 170, tone: 'indigo', size: 'lg' },
    dimS: { kind: 'box', icon: '🧩', label: '手机软件', sub: '游戏、通讯录、MP3……', x: 750, y: 170, tone: 'teal', size: 'lg' },

    // —— 场景四：桥接 ——
    abs: { kind: 'class', title: 'HandsetBrand', stereo: 'abstract', sub: '手机品牌（抽象部分）', lines: ['# soft: HandsetSoft', '+ setHandsetSoft(soft)', '+ run()'], x: 250, y: 150, tone: 'indigo' },
    imp: { kind: 'class', title: 'HandsetSoft', stereo: 'abstract', sub: '手机软件（实现部分）', lines: ['+ run()'], x: 750, y: 150, tone: 'purple' },
    bM: { kind: 'class', title: 'HandsetBrandM', sub: '品牌M', x: 100, y: 370, tone: 'blue' },
    bN: { kind: 'class', title: 'HandsetBrandN', sub: '品牌N', x: 260, y: 370, tone: 'blue' },
    bS: { kind: 'class', title: 'HandsetBrandS', sub: '品牌S', x: 420, y: 370, tone: 'orange', badge: 'NEW' },
    gG: { kind: 'class', title: 'HandsetGame', sub: '游戏', x: 580, y: 370, tone: 'teal' },
    gA: { kind: 'class', title: 'HandsetAddressList', sub: '通讯录', x: 745, y: 370, tone: 'teal' },
    gP: { kind: 'class', title: 'HandsetMP3', sub: 'MP3', x: 910, y: 370, tone: 'orange', badge: 'NEW' },
    bridge: { kind: 'box', icon: '🌉', label: '这就是“桥”', shape: 'pill', x: 455, y: 88, tone: 'orange', size: 'sm' },
    cli: { kind: 'actor', icon: '👨‍💻', label: '客户端', x: 500, y: 260, tone: 'gray', size: 'sm' },
    tip: { kind: 'text', text: '', x: 500, y: 495, tone: 'green', size: 'lg' },
  },
  links: {
    l_rM: { from: 'rM', to: 'r', kind: 'inherit' },
    l_rN: { from: 'rN', to: 'r', kind: 'inherit' },
    l_rS: { from: 'rS', to: 'r', kind: 'inherit' },
    l_mG: { from: 'mG', to: 'rM', kind: 'inherit' },
    l_mA: { from: 'mA', to: 'rM', kind: 'inherit' },
    l_mP: { from: 'mP', to: 'rM', kind: 'inherit' },
    l_nG: { from: 'nG', to: 'rN', kind: 'inherit' },
    l_nA: { from: 'nA', to: 'rN', kind: 'inherit' },
    l_nP: { from: 'nP', to: 'rN', kind: 'inherit' },
    l_sG: { from: 'sG', to: 'rS', kind: 'inherit' },
    l_sA: { from: 'sA', to: 'rS', kind: 'inherit' },
    l_sP: { from: 'sP', to: 'rS', kind: 'inherit' },

    l_dim: { from: 'dimB', to: 'dimS', kind: 'dotted', label: '怎么组合？' },

    l_bM: { from: 'bM', to: 'abs', kind: 'inherit' },
    l_bN: { from: 'bN', to: 'abs', kind: 'inherit' },
    l_bS: { from: 'bS', to: 'abs', kind: 'inherit' },
    l_gG: { from: 'gG', to: 'imp', kind: 'inherit' },
    l_gA: { from: 'gA', to: 'imp', kind: 'inherit' },
    l_gP: { from: 'gP', to: 'imp', kind: 'inherit' },
    l_bridge: { from: 'abs', to: 'imp', kind: 'aggregate', label: '桥：持有一个软件', labelDy: 16 },
  },

  frames: [
    {
      title: '手机软件不通用',
      text: '故事发生在智能手机普及之前。小菜手机上的小游戏，拷到大鸟的手机上却**运行不了**。原因很简单：那时的手机软件都是**按品牌**各写一套，品牌M的游戏只认品牌M。',
      show: ['xc', 'db', 'phM', 'phN'],
      flows: [{ from: 'phM', to: 'phN', icon: '🎮', label: '拷过去玩', tone: 'red' }],
      bubbles: [
        { node: 'xc', text: '我的游戏到你手机上怎么就**玩不了**？', side: 'top', dx: 20 },
        { node: 'phN', text: '不兼容 ✕', side: 'bottom', step: 0 },
        { node: 'db', text: '因为软件是**按品牌**分别写的。', side: 'top', delay: 1.2 },
      ],
    },
    {
      title: '第一版：品牌下面分软件',
      text: '小菜照这个思路设计：手机品牌 `HandsetBrand` 下面分出品牌M、品牌N；每个品牌下面再**继承**出自己的**游戏**和**通讯录**。看起来挺整齐，一共 7 个类。',
      clear: true,
      show: ['r', 'rM', 'rN', 'mG', 'mA', 'nG', 'nA', 'l_rM', 'l_rN', 'l_mG', 'l_mA', 'l_nG', 'l_nA', 'cnt'],
      focus: ['mG', 'mA', 'nG', 'nA', 'l_mG', 'l_mA', 'l_nG', 'l_nA', 'cnt'],
    },
    {
      title: '要加 MP3？每个品牌都要加',
      text: '新需求：所有手机都要加 **MP3** 功能。在这棵树里，品牌M下面要加一个 `HandsetBrandMMP3`，品牌N下面也要加一个……**一个新功能，就得写两个类**。',
      show: ['mP', 'nP', 'l_mP', 'l_nP'],
      set: {
        r: { y: 85 },
        rM: { x: 250, y: 185 }, rN: { x: 750, y: 185 },
        mG: { x: 110, y: 300, scale: 0.9 }, mA: { x: 250, y: 410, scale: 0.9 },
        nG: { x: 610, y: 300, scale: 0.9 }, nA: { x: 750, y: 410, scale: 0.9 },
        cnt: { text: '一共 9 个类', y: 505 },
      },
      focus: ['mP', 'nP', 'l_mP', 'l_nP', 'cnt'],
    },
    {
      title: '再来个品牌S：树炸了',
      text: '紧接着又来了新品牌 **S**：它自己一个类，下面还得配游戏、通讯录、MP3 三个类。现在已经 **13 个类**了！每多一个品牌或一个功能，类的数量都是**成倍**往上涨。',
      show: ['rS', 'sG', 'sA', 'sP', 'l_rS', 'l_sG', 'l_sA', 'l_sP'],
      set: {
        r: { y: 80 },
        rM: { x: 170, y: 180, scale: 0.85 }, rN: { x: 500, y: 180, scale: 0.85 },
        mG: { x: 78, y: 290, scale: 0.72 }, mA: { x: 170, y: 400, scale: 0.72 }, mP: { x: 262, y: 290, scale: 0.72, badge: '', tone: 'teal' },
        nG: { x: 408, y: 290, scale: 0.72 }, nA: { x: 500, y: 400, scale: 0.72 }, nP: { x: 592, y: 290, scale: 0.72, badge: '', tone: 'teal' },
        cnt: { text: '1 + 3 + 3×3 = 13 个类！', y: 505 },
      },
      focus: ['rS', 'sG', 'sA', 'sP', 'l_rS', 'l_sG', 'l_sA', 'l_sP', 'cnt'],
    },
    {
      title: '大鸟：两个维度被绑死了',
      text: '大鸟一针见血：**品牌**是一个变化方向，**软件**是另一个变化方向。你用继承把它们捆在同一棵树上，类数只能相乘。按照**合成/聚合复用原则**，应该把两者拆开，让它们各自变化。',
      clear: true,
      show: ['db2', 'dimB', 'dimS', 'l_dim'],
      bubbles: [
        { node: 'db2', text: '别用继承把**品牌**和**软件**绑死，拆成两边，再“连”起来。', side: 'top' },
      ],
    },
    {
      title: '拆开①：品牌自成一棵树',
      text: '先把“品牌”单独拎出来：抽象类手机品牌 `HandsetBrand`，下面只有品牌M、品牌N。这一边叫**抽象部分**，它只关心“我是哪个牌子的手机”，不再管装了什么软件。',
      hide: ['db2', 'dimB', 'dimS'],
      show: ['abs', 'bM', 'bN', 'l_bM', 'l_bN'],
      focus: ['abs', 'bM', 'bN', 'l_bM', 'l_bN'],
    },
    {
      title: '拆开②：软件自成一棵树',
      text: '再把“软件”单独拎出来：抽象类手机软件 `HandsetSoft`，下面是游戏 `HandsetGame`、通讯录 `HandsetAddressList`。这一边叫**实现部分**，只管“这个软件怎么运行”。',
      show: ['imp', 'gG', 'gA', 'l_gG', 'l_gA'],
      focus: ['imp', 'gG', 'gA', 'l_gG', 'l_gA'],
    },
    {
      title: '搭桥：品牌“持有”软件',
      text: '关键一步：让品牌**持有**一个软件对象，并提供 `setHandsetSoft()` 给它装软件。从 `HandsetBrand` 指向 `HandsetSoft` 的这条**聚合线**，就是连接两棵树的那座**桥**。',
      show: ['l_bridge', 'bridge'],
      set: { abs: { lines: ['!# soft: HandsetSoft', '!+ setHandsetSoft(soft)', '+ run()'] } },
      focus: ['abs', 'imp', 'l_bridge', 'bridge'],
    },
    {
      title: '跑一遍：品牌N 装游戏',
      text: '客户端拿一部品牌N手机，先用 `setHandsetSoft()` 装上游戏，再调用 `run()`。品牌N自己不会玩游戏，它把活儿**转交**给手里的软件：`soft.run()`。',
      show: ['cli'],
      set: { abs: { lines: ['# soft: HandsetSoft', '+ setHandsetSoft(soft)', '+ run()'] } },
      focus: ['cli', 'bN', 'gG'],
      flows: [
        { from: 'cli', to: 'bN', label: 'setHandsetSoft(游戏)' },
        { from: 'cli', to: 'bN', label: 'run()' },
        { from: 'bN', to: 'gG', label: 'soft.run()' },
      ],
      bubbles: [{ node: 'gG', text: '品牌N：运行手机**游戏** 🎮', side: 'bottom', step: 2 }],
    },
    {
      title: '换个软件：还是这部手机',
      text: '同一部品牌N手机，换装**通讯录**再 `run()`，这次就转交给 `HandsetAddressList`。品牌和软件可以**自由组合**，组合是运行时“装”出来的，而不是靠继承写死的。',
      focus: ['cli', 'bN', 'gA'],
      flows: [
        { from: 'cli', to: 'bN', label: 'setHandsetSoft(通讯录)' },
        { from: 'cli', to: 'bN', label: 'run()' },
        { from: 'bN', to: 'gA', label: 'soft.run()', curve: 150 },
      ],
      bubbles: [{ node: 'gA', text: '品牌N：运行手机**通讯录** 📒', side: 'bottom', step: 2 }],
    },
    {
      title: '加 MP3：只加一个类',
      text: '现在要 **MP3**？只要新增一个 `HandsetMP3` 继承 `HandsetSoft`，所有品牌立刻都能装它，品牌那边**一个类都不用动**。在旧设计里，可是每个品牌都得各加一个！',
      hide: ['cli'],
      show: ['gP', 'l_gP', 'tip'],
      set: { tip: { text: '新功能 = 新增 1 个类' } },
      focus: ['gP', 'l_gP', 'tip'],
    },
    {
      title: '加品牌S：也只加一个类',
      text: '新品牌 **S** 上市？新增一个 `HandsetBrandS` 继承 `HandsetBrand` 就行，所有软件它都能装。类的数量从“品牌 × 软件”变成了“**品牌 + 软件**”，再也不会爆炸。',
      show: ['bS', 'l_bS'],
      set: { tip: { text: '新品牌 = 新增 1 个类' } },
      focus: ['bS', 'l_bS', 'tip'],
    },
    {
      title: '总结：桥接模式',
      text: '桥接模式：把**抽象部分**（品牌）和**实现部分**（软件）分开，各自成为一棵继承树，再用聚合这座桥连起来，让两边**独立变化**。一句话记住：**两个维度各自变，聚合搭桥连两边。**',
      set: { bS: { badge: '', tone: 'blue' }, gP: { badge: '', tone: 'teal' }, tip: { text: '两个维度各自变，聚合搭桥连两边', tone: 'indigo' } },
      focus: ['abs', 'imp', 'l_bridge', 'bridge', 'tip'],
      bubbles: [
        { node: 'bM', text: '抽象这边：**加品牌**', side: 'bottom' },
        { node: 'gP', text: '实现这边：**加软件**', side: 'bottom' },
      ],
    },
  ],
});
