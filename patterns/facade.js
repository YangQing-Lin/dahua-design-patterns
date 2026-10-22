(function () {
  const SUBS = ['s1', 's2', 's3', 'nd', 'rt'];
  const each = (fn) => SUBS.map(fn);

  DP.register({
    id: 'facade',
    order: 12,
    type: 'structural',
    name: '外观模式',
    en: 'Facade',
    emoji: '🚪',
    chapter: '第 12 章 · 牛市股票还会亏钱？',
    mnemonic: '繁杂系统藏门后，对外只开一扇门',
    summary: '给一堆复杂的子系统装一个“总入口”，客户端只跟这个入口打交道，不用认识里面每一个零件。',
    intent: '为子系统中的一组接口提供一个一致的界面，此模式定义了一个高层接口，这个接口使得这一子系统更加容易使用。',
    story: '牛市里，一位同事炒股却亏了钱：他同时买了**股票1、股票2、股票3、国债、房地产**，每一样都得自己研究、自己盯盘、自己决定买卖，手忙脚乱。大鸟说：不如买**基金**——你只跟基金打交道，买哪些、何时卖，由基金经理在内部统一操作。基金就是那一堆投资品的**外观**。',
    analogy: '去医院看病：挂号、分诊、缴费、检查、取药，要跑好几个窗口。有些医院设了“一站式服务台”，你只跟服务台说一声，后面的流程它帮你逐个对接——服务台就是医院这堆部门的外观。',
    when: [
      '**设计初期**：分层架构里，在数据访问层、业务逻辑层、表示层**之间**建立外观，让层与层松耦合',
      '**开发阶段**：子系统因不断重构变得越来越复杂，给外部提供一个简单的入口',
      '**维护遗留系统**：老系统又大又乱没人敢动，为它写一个外观，新系统只和外观交互',
    ],
    pros: ['客户端**不必认识**子系统里的每个类，用起来简单', '客户端与子系统**解耦**，子系统内部怎么变，外部基本不受影响', '体现了迪米特法则：只和“直接的朋友”说话'],
    cons: ['子系统增减时，外观类本身要跟着改', '外观容易越长越胖，变成什么都管的“上帝类”'],
    keyPoints: [
      '两个角色：**Facade**（外观，知道该把请求交给哪些子系统）和 **SubSystem**（子系统类，各自干活）',
      '子系统**不知道**外观的存在——它们之间没有反向引用，外观只是“站在前面统一调度”',
      '外观不是封锁：需要精细控制时，客户端仍可以绕过外观直接用子系统',
    ],
    code: `
// 子系统：各自独立，完全不知道“基金”的存在
class Stock1 {
    void buy()  { System.out.println("股票1 买入"); }
    void sell() { System.out.println("股票1 卖出"); }
}
class Stock2 { void buy() { /*…*/ } void sell() { /*…*/ } }
class Stock3 { void buy() { /*…*/ } void sell() { /*…*/ } }
class NationalDebt1 { void buy() { /*…*/ } void sell() { /*…*/ } }   // 国债
class Realty1 { void buy() { /*…*/ } void sell() { /*…*/ } }         // 房地产

// 外观：基金。对外只暴露两个方法，内部统一调度所有子系统
class Fund {
    private Stock1 gu1 = new Stock1();
    private Stock2 gu2 = new Stock2();
    private Stock3 gu3 = new Stock3();
    private NationalDebt1 nd1 = new NationalDebt1();
    private Realty1 rt1 = new Realty1();

    public void buyFund() {
        gu1.buy(); gu2.buy(); gu3.buy(); nd1.buy(); rt1.buy();
    }
    public void sellFund() {
        gu1.sell(); gu2.sell(); gu3.sell(); nd1.sell(); rt1.sell();
    }
}

// 客户端：股民只认识基金
Fund jijin = new Fund();
jijin.buyFund();
jijin.sellFund();

// 对比：没有外观时，客户端要认识 5 个类、亲自调用 10 次`,
    codePython: `


# 子系统：各自独立，完全不知道“基金”的存在
class Subsystem:
    name: str

    def buy(self):
        print(self.name + " 买入")

    def sell(self):
        print(self.name + " 卖出")


class Stock1(Subsystem): name = "股票1"
class Stock2(Subsystem): name = "股票2"
class Stock3(Subsystem): name = "股票3"
class NationalDebt1(Subsystem): name = "国债1"      # 国债
class Realty1(Subsystem): name = "房地产1"          # 房地产


# 外观：基金。对外只暴露两个方法，内部统一调度所有子系统
class Fund:
    def __init__(self):
        self.parts = [Stock1(), Stock2(), Stock3(), NationalDebt1(), Realty1()]

    def buy_fund(self):
        for p in self.parts:
            p.buy()

    def sell_fund(self):
        for p in self.parts:
            p.sell()


# 客户端：股民只认识基金
if __name__ == "__main__":
    jijin = Fund()
    jijin.buy_fund()     # 股票1 买入 … 房地产1 买入（共 5 行）
    jijin.sell_fund()    # 股票1 卖出 … 房地产1 卖出（共 5 行）
    # 对比：没有外观时，客户端要认识 5 个类、亲自调用 10 次`,
    codeGo: `
package main

import "fmt"

// 子系统：各自独立，完全不知道“基金”的存在
// （Go 没有继承，用嵌入共享 Buy/Sell；Subsystem 接口按需隐式满足）
type Subsystem interface {
	Buy()
	Sell()
}

type base struct{ name string }

func (b base) Buy()  { fmt.Println(b.name + " 买入") }
func (b base) Sell() { fmt.Println(b.name + " 卖出") }

type Stock1 struct{ base }
type Stock2 struct{ base }
type Stock3 struct{ base }
type NationalDebt1 struct{ base } // 国债
type Realty1 struct{ base }       // 房地产

// 外观：基金。对外只暴露两个方法，内部统一调度所有子系统
type Fund struct{ parts []Subsystem }

func NewFund() *Fund {
	return &Fund{[]Subsystem{
		Stock1{base{"股票1"}}, Stock2{base{"股票2"}}, Stock3{base{"股票3"}},
		NationalDebt1{base{"国债1"}}, Realty1{base{"房地产1"}},
	}}
}

func (f *Fund) BuyFund() {
	for _, p := range f.parts {
		p.Buy()
	}
}

func (f *Fund) SellFund() {
	for _, p := range f.parts {
		p.Sell()
	}
}

// 客户端：股民只认识基金
func main() {
	jijin := NewFund()
	jijin.BuyFund()  // 股票1 买入 … 房地产1 买入（共 5 行）
	jijin.SellFund() // 股票1 卖出 … 房地产1 卖出（共 5 行）
	// 对比：没有外观时，客户端要认识 5 个类、亲自调用 10 次
}`,
    compare: [
      { id: 'adapter', text: '适配器是**接口对不上**，把一个已有接口转换成客户想要的接口（通常包一个对象）；外观是**接口太多太乱**，造一个新的、更简单的接口包住一整群对象。' },
      { id: 'mediator', text: '中介者协调的是**同事对象之间**的互相通信，同事们都认识中介者（双向）；外观只是**单向**地为外部提供入口，子系统根本不知道外观存在。' },
    ],
    quiz: [
      { q: '家庭影院有功放、投影仪、幕布、灯光、播放器五台设备，看一场电影要按顺序操作十几步。你写了一个类，只提供 watchMovie() 和 endMovie() 两个方法，用户按一个键，所有设备自动就位。', why: '为一组子系统提供一个统一的高层入口——外观模式。' },
      { q: '公司有一套十几年前的订单系统，类多、调用关系乱、没人敢改。新项目组写了一个类，对外只提供“下单 / 查询 / 退款”三个简单方法，内部再去调用老系统那一堆接口。', why: '为遗留系统包一层外观，新系统只与外观交互。' },
    ],

    nodes: {
      xiaocai: { kind: 'actor', icon: '👦', label: '小菜', x: 200, y: 300, tone: 'blue' },
      dani: { kind: 'actor', icon: '🧔', label: '大鸟', x: 800, y: 300, tone: 'orange' },
      gumin: { kind: 'actor', icon: '👨‍💼', label: '股民', sub: '一位炒股的同事', x: 500, y: 300, tone: 'gray' },

      s1: { kind: 'box', icon: '📈', label: '股票1', sub: 'Stock1', x: 830, y: 95, tone: 'blue', size: 'sm' },
      s2: { kind: 'box', icon: '📈', label: '股票2', sub: 'Stock2', x: 830, y: 185, tone: 'blue', size: 'sm' },
      s3: { kind: 'box', icon: '📈', label: '股票3', sub: 'Stock3', x: 830, y: 275, tone: 'blue', size: 'sm' },
      nd: { kind: 'box', icon: '📜', label: '国债', sub: 'NationalDebt1', x: 830, y: 365, tone: 'teal', size: 'sm' },
      rt: { kind: 'box', icon: '🏠', label: '房地产', sub: 'Realty1', x: 830, y: 455, tone: 'orange', size: 'sm' },
      gold: { kind: 'box', icon: '🥇', label: '黄金', sub: 'Gold', x: 640, y: 495, tone: 'yellow', size: 'sm', badge: 'NEW' },
      subzone: { kind: 'zone', label: '子系统：一堆投资品', x: 830, y: 275, w: 230, h: 470, tone: 'gray' },

      fund: {
        kind: 'class', title: 'Fund', sub: '基金（外观）', x: 470, y: 275, tone: 'indigo',
        lines: ['+ buyFund()', '+ sellFund()'],
      },

      // 三层架构
      zUi: { kind: 'zone', label: '表示层', x: 500, y: 118, w: 820, h: 96, tone: 'blue' },
      zBll: { kind: 'zone', label: '业务逻辑层', x: 500, y: 290, w: 820, h: 150, tone: 'purple' },
      zDal: { kind: 'zone', label: '数据访问层', x: 500, y: 470, w: 820, h: 140, tone: 'teal' },
      ui1: { kind: 'box', icon: '🖥️', label: '下单页面', x: 400, y: 120, tone: 'blue', size: 'sm' },
      ui2: { kind: 'box', icon: '📱', label: '手机 App', x: 600, y: 120, tone: 'blue', size: 'sm' },
      fBll: { kind: 'box', shape: 'pill', icon: '🚪', label: 'OrderFacade', sub: '业务层外观', x: 500, y: 250, tone: 'indigo' },
      b1: { kind: 'box', shape: 'chip', label: '订单', x: 280, y: 330, tone: 'purple' },
      b2: { kind: 'box', shape: 'chip', label: '库存', x: 400, y: 330, tone: 'purple' },
      b3: { kind: 'box', shape: 'chip', label: '会员', x: 600, y: 330, tone: 'purple' },
      b4: { kind: 'box', shape: 'chip', label: '支付', x: 720, y: 330, tone: 'purple' },
      fDal: { kind: 'box', shape: 'pill', icon: '🚪', label: 'DataFacade', sub: '数据层外观', x: 500, y: 435, tone: 'indigo' },
      d1: { kind: 'box', shape: 'chip', label: 'SQL 数据库', x: 300, y: 505, tone: 'teal' },
      d2: { kind: 'box', shape: 'chip', label: '缓存', x: 500, y: 505, tone: 'teal' },
      d3: { kind: 'box', shape: 'chip', label: '文件存储', x: 700, y: 505, tone: 'teal' },

      // 遗留系统
      newsys: { kind: 'box', icon: '✨', label: '新系统', sub: '新开发的功能', x: 120, y: 290, tone: 'green' },
      lf: { kind: 'class', title: 'LegacyFacade', sub: '给老系统开一扇新门', lines: ['+ placeOrder()', '+ query()', '+ refund()'], x: 400, y: 290, tone: 'indigo' },
      zOld: { kind: 'zone', label: '老系统：又大又乱，没人敢动', x: 770, y: 290, w: 380, h: 420, tone: 'red' },
      o1: { kind: 'box', shape: 'chip', label: 'OrderMgr2', x: 680, y: 150, tone: 'gray', mono: true },
      o2: { kind: 'box', shape: 'chip', label: 'Util_old', x: 860, y: 190, tone: 'gray', mono: true },
      o3: { kind: 'box', shape: 'chip', label: 'DBHelper', x: 700, y: 290, tone: 'gray', mono: true },
      o4: { kind: 'box', shape: 'chip', label: 'XmlParser', x: 870, y: 330, tone: 'gray', mono: true },
      o5: { kind: 'box', shape: 'chip', label: 'TmpFix_2009', x: 690, y: 420, tone: 'gray', mono: true },
      o6: { kind: 'box', shape: 'chip', label: 'CoreV1', x: 870, y: 450, tone: 'gray', mono: true },
    },
    links: Object.assign(
      { l_gf: { from: 'gumin', to: 'fund', kind: 'assoc' } },
      Object.fromEntries(each(id => ['l_g_' + id, { from: 'gumin', to: id, kind: 'assoc' }])),
      Object.fromEntries(each(id => ['l_f_' + id, { from: 'fund', to: id, kind: 'assoc' }])),
      {
        l_f_gold: { from: 'fund', to: 'gold', kind: 'assoc' },
        l_u1: { from: 'ui1', to: 'fBll', kind: 'assoc' },
        l_u2: { from: 'ui2', to: 'fBll', kind: 'assoc' },
        l_bd: { from: 'fBll', to: 'fDal', kind: 'assoc' },
        l_b1: { from: 'fBll', to: 'b1', kind: 'depend' },
        l_b2: { from: 'fBll', to: 'b2', kind: 'depend' },
        l_b3: { from: 'fBll', to: 'b3', kind: 'depend' },
        l_b4: { from: 'fBll', to: 'b4', kind: 'depend' },
        l_d1: { from: 'fDal', to: 'd1', kind: 'depend' },
        l_d2: { from: 'fDal', to: 'd2', kind: 'depend' },
        l_d3: { from: 'fDal', to: 'd3', kind: 'depend' },
        l_lo1: { from: 'lf', to: 'o1', kind: 'depend' },
        l_lo3: { from: 'lf', to: 'o3', kind: 'depend' },
        l_lo5: { from: 'lf', to: 'o5', kind: 'depend' },
        l_nl: { from: 'newsys', to: 'lf', kind: 'assoc' },
        l_o13: { from: 'o1', to: 'o3', kind: 'dotted' },
        l_o24: { from: 'o2', to: 'o4', kind: 'dotted' },
        l_o14: { from: 'o1', to: 'o4', kind: 'dotted' },
        l_o35: { from: 'o3', to: 'o5', kind: 'dotted' },
        l_o46: { from: 'o4', to: 'o6', kind: 'dotted' },
        l_o36: { from: 'o3', to: 'o6', kind: 'dotted' },
        l_o52: { from: 'o5', to: 'o2', kind: 'dotted', curve: 40 },
      }
    ),

    frames: [
      {
        title: '牛市里，同事亏了钱',
        text: '大家都在说牛市，小菜却听说一位**炒股的同事亏了钱**，很是不解。大鸟一听就明白：他同时买了好几样东西，**每一样都得自己研究、自己盯**，不亏才怪。',
        show: ['xiaocai', 'dani', 'gumin'],
        bubbles: [
          { node: 'xiaocai', text: '**牛市**股票还会亏钱？', side: 'top' },
          { node: 'gumin', text: '又跌了……😭', side: 'top', delay: 0.7 },
          { node: 'dani', text: '啥都**自己买、自己盯**，能不亏吗', side: 'top', delay: 1.4 },
        ],
      },
      {
        title: '股民自己买一大堆',
        text: '看看这位同事：股票1、股票2、股票3、国债、房地产，**一个个亲自去买**。他得认识每一个投资品，了解它们的行情——股民和这些“子系统”之间，牵了**五根线**。',
        hide: ['xiaocai', 'dani'],
        show: SUBS.concat(each(id => 'l_g_' + id)),
        set: { gumin: { x: 110, y: 275 } },
        flowGap: 0.75,
        flows: each(id => ({ from: 'gumin', to: id, label: 'buy()' })),
      },
      {
        title: '卖的时候更手忙脚乱',
        text: '行情一变，又要**一个个去卖**：这只该卖了吗？那只还要等吗？股民和每个子系统都**紧紧耦合**，任何一个变化都要他亲自应付。这就是“牛市也亏钱”的原因。',
        set: {
          gumin: { badge: '要懂 5 样东西' },
          s1: { sub: '📉 跌了' }, s3: { sub: '📉 又跌了' }, rt: { sub: '😵 看不懂' },
        },
        focus: ['gumin'].concat(SUBS, each(id => 'l_g_' + id)),
        flowGap: 0.75,
        flows: each(id => ({ from: 'gumin', to: id, label: 'sell()', tone: 'red' })),
        bubbles: [{ node: 'gumin', text: '这么多，**我顾不过来**！', side: 'bottom', step: 4 }],
      },
      {
        title: '大鸟：去买基金吧',
        text: '大鸟建议：**买基金**。股民只跟基金打交道，钱交给基金，买哪些股票、什么时候卖，由懂行的基金经理**在内部统一操作**。五根线，变成了**一根线**。',
        hide: each(id => 'l_g_' + id),
        show: ['fund', 'dani', 'l_gf'].concat(each(id => 'l_f_' + id)),
        set: {
          gumin: { badge: '' }, dani: { x: 470, y: 470 },
          s1: { sub: 'Stock1' }, s3: { sub: 'Stock3' }, rt: { sub: 'Realty1' },
        },
        focus: ['gumin', 'fund', 'dani', 'l_gf'],
        bubbles: [{ node: 'dani', text: '买**基金**吧，让专业的人操心', side: 'right' }],
      },
      {
        title: '基金 = 外观 Facade',
        text: '基金类 `Fund` 就是**外观**：它认识所有子系统，对外却只露出两个方法——`buyFund()` 和 `sellFund()`。而子系统**根本不知道基金的存在**，它们照常各干各的。',
        hide: ['dani'],
        set: { fund: { lines: ['- gu1, gu2, gu3: Stock', '- nd1: NationalDebt1', '- rt1: Realty1', '!+ buyFund()', '!+ sellFund()'] } },
        focus: ['fund'],
        bubbles: [
          { node: 'fund', text: '对外只有**两个按钮**', side: 'bottom' },
        ],
      },
      {
        title: '跑一遍：buyFund()',
        text: '股民只说一句 `jijin.buyFund()`。基金在内部依次调用 `gu1.buy()`、`gu2.buy()`……五个子系统**全部买入**。股民一个子系统都没碰，也不需要懂它们。',
        set: { fund: { lines: ['- gu1, gu2, gu3: Stock', '- nd1: NationalDebt1', '- rt1: Realty1', '!+ buyFund()', '+ sellFund()'] } },
        focus: ['gumin', 'fund', 'l_gf'].concat(SUBS),
        flows: [{ from: 'gumin', to: 'fund', label: 'buyFund()', icon: '💵' }]
          .concat(each(id => ({ from: 'fund', to: id, label: 'buy()', step: 1 })))
          .concat([{ from: 'fund', to: 'gumin', label: '买好了', icon: '✅', back: true, tone: 'teal', step: 2 }]),
      },
      {
        title: '再跑一遍：sellFund()',
        text: '要赎回时也一样：`jijin.sellFund()`，基金把五个子系统**统统卖出**，收回的钱汇总后交给股民。对股民来说，复杂的买卖只剩**两个按钮**。',
        set: { fund: { lines: ['- gu1, gu2, gu3: Stock', '- nd1: NationalDebt1', '- rt1: Realty1', '+ buyFund()', '!+ sellFund()'] } },
        focus: ['gumin', 'fund', 'l_gf'].concat(SUBS),
        flows: [{ from: 'gumin', to: 'fund', label: 'sellFund()' }]
          .concat(each(id => ({ from: 'fund', to: id, label: 'sell()', tone: 'red', step: 1 })))
          .concat([{ from: 'fund', to: 'gumin', label: '收益', icon: '💰', back: true, tone: 'teal', step: 2 }]),
      },
      {
        title: '子系统变了？股民无感',
        text: '后来基金经理决定再配一点**黄金**。改的是基金内部：多一个 `Gold`，`buyFund()` 里多调一行。股民这边**一行代码都不用改**，照样只按那两个按钮。',
        show: ['gold', 'l_f_gold'],
        set: { fund: { lines: ['- gu1, gu2, gu3: Stock', '- nd1, rt1, gold', '+ buyFund()', '+ sellFund()'] } },
        focus: ['gold', 'fund', 'gumin', 'l_f_gold', 'l_gf'],
        flows: [
          { from: 'gumin', to: 'fund', label: 'buyFund()', icon: '💵' },
          { from: 'fund', to: 'gold', label: 'buy()', step: 1 },
        ],
        bubbles: [{ node: 'gumin', text: '我还是只调 buyFund()', side: 'bottom', step: 1 }],
      },
      {
        title: '外观：统一的高层入口',
        text: '这就是外观模式：为子系统中的**一组接口**，提供**一个一致的高层接口**，让子系统更容易使用。外面的人只认识这扇门，门后再乱也与他无关——这也是**迪米特法则**的体现。',
        hide: ['gold', 'l_f_gold'],
        show: ['subzone'],
        set: { fund: { lines: ['- gu1, gu2, gu3: Stock', '- nd1: NationalDebt1', '- rt1: Realty1', '+ buyFund()', '+ sellFund()'] } },
        focus: ['fund', 'subzone', 'gumin', 'l_gf'],
        bubbles: [
          { node: 'fund', text: '对外：**一扇门**', side: 'bottom' },
          { node: 'subzone', text: '门后：一堆子系统', side: 'left', dy: 150 },
        ],
      },
      {
        title: '用途①：分层架构',
        text: '设计初期就该有意识地用外观：经典的**三层架构**里，在表示层与业务逻辑层、业务逻辑层与数据访问层**之间各放一个外观**。上层只认下层那扇门，层与层之间就**松耦合**了。',
        clear: true,
        show: ['zUi', 'zBll', 'zDal', 'ui1', 'ui2', 'fBll', 'b1', 'b2', 'b3', 'b4', 'fDal', 'd1', 'd2', 'd3', 'l_u1', 'l_u2', 'l_bd', 'l_b1', 'l_b2', 'l_b3', 'l_b4', 'l_d1', 'l_d2', 'l_d3'],
        flows: [
          { from: 'ui1', to: 'fBll', label: 'placeOrder()' },
          { from: 'fBll', to: 'b1', step: 1 },
          { from: 'fBll', to: 'b2', step: 1 },
          { from: 'fBll', to: 'b3', step: 1 },
          { from: 'fBll', to: 'b4', step: 1 },
          { from: 'fBll', to: 'fDal', label: 'save()', step: 2 },
          { from: 'fDal', to: 'd1', step: 3 },
          { from: 'fDal', to: 'd2', step: 3 },
          { from: 'fDal', to: 'd3', step: 3 },
        ],
      },
      {
        title: '用途②：包住遗留系统',
        text: '维护一个又大又乱的**老系统**时，别让新代码直接钻进去。为它写一个外观 `LegacyFacade`，提供几个清晰简单的方法；新系统只和外观交互，**脏活累活**都由外观去和老代码打交道。',
        clear: true,
        show: ['newsys', 'lf', 'zOld', 'o1', 'o2', 'o3', 'o4', 'o5', 'o6', 'l_nl', 'l_o13', 'l_o24', 'l_o14', 'l_o35', 'l_o46', 'l_o36', 'l_o52', 'l_lo1', 'l_lo3', 'l_lo5'],
        flows: [
          { from: 'newsys', to: 'lf', label: 'placeOrder()' },
          { from: 'lf', to: 'o1', step: 1 },
          { from: 'lf', to: 'o3', step: 1 },
          { from: 'lf', to: 'o5', step: 1 },
          { from: 'lf', to: 'newsys', label: '结果', back: true, tone: 'teal', step: 2 },
        ],
        bubbles: [{ node: 'newsys', text: '老系统多乱？**我不用知道**', side: 'bottom', step: 2 }],
      },
      {
        title: '总结：外观模式',
        text: '外观模式只有两个角色：**Facade**（统一入口，负责调度）和一群 **SubSystem**（各干各的，不知道外观存在）。客户端从“认识五个类”变成“只认识一个”。一句话：**繁杂系统藏门后，对外只开一扇门。**',
        clear: true,
        show: ['gumin', 'fund', 'subzone', 'l_gf'].concat(SUBS, each(id => 'l_f_' + id)),
        focus: ['fund', 'gumin', 'l_gf'],
        bubbles: [
          { node: 'fund', text: 'Facade：**我来调度**', side: 'bottom' },
          { node: 'gumin', text: '我只认识基金', side: 'bottom' },
        ],
      },
    ],
  });
})();
