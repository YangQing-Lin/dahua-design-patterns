DP.register({
  id: 'strategy',
  order: 2,
  type: 'behavioral',
  name: '策略模式',
  en: 'Strategy',
  emoji: '🎯',
  chapter: '第 2 章 · 商场促销',
  mnemonic: '算法各自装进盒，用哪个就换哪个',
  summary: '把一族可互换的算法分别封装起来，让客户端在运行时自由切换。',
  intent: '定义算法家族，分别封装起来，让它们之间可以互相替换。此模式让算法的变化，不会影响到使用算法的客户。',
  story: '小菜要给商场写收银软件。一开始只有“正常收费”，后来经理要打八折、满 300 返 100……小菜在一个大 switch 里不停加分支。大鸟告诉他：这些促销方式本质都是“给原价、算应收”的不同**算法**，应该各自封装成策略类，再由 CashContext 统一调用。',
  analogy: '出门去机场：打车、地铁、机场大巴都是“到达机场”的不同策略。你（客户端）只要说“今天走地铁”，导航（Context）就按这个策略帮你算路线，换策略不影响你出门这件事本身。',
  when: [
    '同一件事有**多种做法**（算法），并且需要在运行时切换',
    '代码里出现一长串 `if/else` 或 `switch` 在挑选算法',
    '想把算法的细节对客户端隐藏起来，单独测试每种算法',
  ],
  pros: ['每种算法一个类，**单独修改、单独测试**', '新增算法只加类不改旧代码（开放-封闭）', '消除大段条件判断'],
  cons: ['策略类数量会变多', '客户端（或工厂）需要知道有哪些策略可选'],
  keyPoints: [
    '三个角色：**Context**（上下文）、**Strategy**（策略抽象）、**ConcreteStrategy**（具体策略）',
    '书中做法：策略模式 + 简单工厂，把“选哪个策略”的 switch 收进 CashContext，客户端只认识 Context 一个类',
  ],
  code: `
// 策略抽象：所有促销算法的共同接口
abstract class CashSuper {
    public abstract double acceptCash(double money);
}
class CashNormal extends CashSuper {           // 正常收费
    public double acceptCash(double money) { return money; }
}
class CashRebate extends CashSuper {           // 打折
    private double rate;
    CashRebate(double rate) { this.rate = rate; }
    public double acceptCash(double money) { return money * rate; }
}
class CashReturn extends CashSuper {           // 满 condition 返 back
    private double condition, back;
    CashReturn(double c, double b) { condition = c; back = b; }
    public double acceptCash(double money) {
        return money >= condition ? money - Math.floor(money / condition) * back : money;
    }
}
// 上下文：持有一个策略（这里顺便用简单工厂来创建它）
class CashContext {
    private CashSuper cs;
    CashContext(String type) {
        switch (type) {
            case "正常收费":   cs = new CashNormal(); break;
            case "满300返100": cs = new CashReturn(300, 100); break;
            case "打8折":      cs = new CashRebate(0.8); break;
        }
    }
    public double getResult(double money) { return cs.acceptCash(money); }
}
// 客户端：只认识 CashContext
double total = new CashContext("打8折").getResult(1000);   // 800`,
  codePython: `
from abc import ABC, abstractmethod


# 策略抽象：所有促销算法的共同接口
class CashSuper(ABC):
    @abstractmethod
    def accept_cash(self, money: float) -> float: ...


class CashNormal(CashSuper):          # 正常收费
    def accept_cash(self, money):
        return money


class CashRebate(CashSuper):          # 打折
    def __init__(self, rate):
        self.rate = rate

    def accept_cash(self, money):
        return money * self.rate


class CashReturn(CashSuper):          # 满 condition 返 back
    def __init__(self, condition, back):
        self.condition, self.back = condition, back

    def accept_cash(self, money):
        if money >= self.condition:
            return money - money // self.condition * self.back
        return money


# 上下文：持有一个策略（这里顺便用简单工厂来创建它）
class CashContext:
    def __init__(self, kind: str):
        factory = {
            "正常收费": lambda: CashNormal(),
            "满300返100": lambda: CashReturn(300, 100),
            "打8折": lambda: CashRebate(0.8),
        }
        self.cs = factory[kind]()

    def get_result(self, money):
        return self.cs.accept_cash(money)


# 客户端：只认识 CashContext
if __name__ == "__main__":
    print(CashContext("打8折").get_result(1000))       # 800.0
    print(CashContext("满300返100").get_result(1000))  # 700
    # Python 小贴士：函数是一等公民，简单的策略也可以直接传一个函数`,
  codeGo: `
package main

import (
	"fmt"
	"math"
)

// 策略接口：所有促销算法的共同接口
type CashSuper interface {
	AcceptCash(money float64) float64
}

type CashNormal struct{} // 正常收费

func (CashNormal) AcceptCash(money float64) float64 { return money }

type CashRebate struct{ Rate float64 } // 打折

func (c CashRebate) AcceptCash(money float64) float64 { return money * c.Rate }

type CashReturn struct{ Condition, Back float64 } // 满 Condition 返 Back

func (c CashReturn) AcceptCash(money float64) float64 {
	if money >= c.Condition {
		return money - math.Floor(money/c.Condition)*c.Back
	}
	return money
}

// 上下文：持有一个策略（这里顺便用简单工厂来创建它）
type CashContext struct{ cs CashSuper }

func NewCashContext(kind string) *CashContext {
	switch kind {
	case "满300返100":
		return &CashContext{CashReturn{300, 100}}
	case "打8折":
		return &CashContext{CashRebate{0.8}}
	default:
		return &CashContext{CashNormal{}}
	}
}

func (c *CashContext) GetResult(money float64) float64 { return c.cs.AcceptCash(money) }

// 客户端：只认识 CashContext
func main() {
	fmt.Println(NewCashContext("打8折").GetResult(1000))      // 800
	fmt.Println(NewCashContext("满300返100").GetResult(1000)) // 700
}`,
  compare: [
    { id: 'simple-factory', text: '简单工厂关心“**造出哪个对象**”；策略关心“**用哪种算法**”，而且算法可以随时换。' },
    { id: 'state', text: '结构几乎一样！区别：策略由**客户端主动选**；状态模式里是**状态自己决定**下一个状态。' },
  ],
  quiz: [
    { q: '导航软件支持“最快路线 / 少收费 / 不走高速”三种算路方式，用户可随时切换，而且以后还会加新的算法。', why: '多种可互换的算法、运行时切换——典型的策略模式。' },
    { q: '电商下单时根据会员等级使用不同的折扣算法：普通会员原价、银卡 95 折、金卡 9 折，且以后会增加新的等级。' },
  ],

  nodes: {
    customer: { kind: 'actor', icon: '🛒', label: '顾客', sub: '买了 ¥1000 的东西', x: 120, y: 290, tone: 'gray' },
    app: { kind: 'box', icon: '💻', label: '收银软件', sub: '单价 × 数量 = 总价', x: 400, y: 290, tone: 'blue' },
    boss: { kind: 'actor', icon: '👔', label: '商场经理', x: 720, y: 290, tone: 'orange' },
    bad: {
      kind: 'class', title: 'CashForm', sub: '小菜的第一版：全写在一起', x: 500, y: 300, tone: 'red',
      lines: ['switch (促销方式) {', '  case "正常收费":   ...', '  case "打8折":      ...', '  case "打7折":      ...', '  case "满300返100": ...', '  case "满500返200": ...', '  // 还会越来越长……', '}'],
    },
    sup: { kind: 'class', title: 'CashSuper', stereo: 'abstract', sub: '现金收费（策略）', lines: ['+ acceptCash(money)'], x: 640, y: 150, tone: 'purple' },
    normal: { kind: 'class', title: 'CashNormal', sub: '正常收费', x: 440, y: 410, tone: 'teal' },
    rebate: { kind: 'class', title: 'CashRebate', sub: '打折  ×0.8', x: 590, y: 410, tone: 'teal' },
    ret: { kind: 'class', title: 'CashReturn', sub: '满300返100', x: 740, y: 410, tone: 'teal' },
    point: { kind: 'class', title: 'CashPoint', sub: '送积分', x: 890, y: 410, tone: 'orange', badge: 'NEW' },
    ctx: { kind: 'class', title: 'CashContext', sub: '上下文', lines: ['- cs: CashSuper', '+ getResult(money)'], x: 290, y: 280, tone: 'indigo' },
    client: { kind: 'actor', icon: '👨‍💻', label: '客户端', sub: '收银界面', x: 90, y: 280, tone: 'gray' },
    tip: { kind: 'text', text: '旧代码一行没改！', x: 890, y: 488, tone: 'green', size: 'sm' },
  },
  links: {
    l_cus: { from: 'customer', to: 'app', kind: 'assoc' },
    l_n: { from: 'normal', to: 'sup', kind: 'inherit' },
    l_r: { from: 'rebate', to: 'sup', kind: 'inherit' },
    l_t: { from: 'ret', to: 'sup', kind: 'inherit' },
    l_p: { from: 'point', to: 'sup', kind: 'inherit' },
    l_ctx: { from: 'ctx', to: 'sup', kind: 'aggregate', label: '持有一个策略' },
    l_cli: { from: 'client', to: 'ctx', kind: 'assoc' },
  },

  frames: [
    {
      title: '一个简单的收银软件',
      text: '故事从商场收银开始。小菜要写一个**收银软件**：输入单价和数量，算出总价。顾客买了 1000 块的东西，软件直接收 1000 元。到这里，一切都很简单。',
      show: ['customer', 'app', 'l_cus'],
      flows: [{ from: 'customer', to: 'app', label: '¥1000' }],
    },
    {
      title: '经理：要搞促销！',
      text: '麻烦来了：商场经理说周年庆要**打八折**，过两天又要**满 300 返 100**，以后说不定还有积分活动……收费的**算法**，变成了一个经常变化的东西。',
      show: ['boss'],
      focus: ['boss'],
      bubbles: [
        { node: 'boss', text: '周年庆，全场**打八折**！', side: 'top' },
        { node: 'boss', text: '满 **300** 返 **100**！', side: 'right', delay: 0.6 },
        { node: 'boss', text: '下个月还要搞积分……', side: 'bottom', delay: 1.2 },
      ],
    },
    {
      title: '小菜的写法：一个大 switch',
      text: '小菜的第一反应：在收银代码里加一个 `switch`，每种促销一个 case。功能是实现了，但所有算法都**挤在同一个类里**。',
      clear: true,
      show: ['bad'],
      focus: ['bad'],
    },
    {
      title: '问题：越改越乱',
      text: '每来一种新促销，就得**打开这个类改代码**，然后把所有收费方式重新测一遍。改错一个 case，可能连“正常收费”都跟着出错。大鸟说：**变化的部分，应该被封装起来**。',
      set: { bad: { badge: '每次都要改这里', strike: true } },
    },
    {
      title: '找共同点：抽象出策略',
      text: '先找共同点：不管哪种促销，本质都是“给我一个**原价**，还你一个**应收金额**”。把这个共同点抽成抽象类 `CashSuper`，只有一个方法 `acceptCash()`。',
      hide: ['bad'],
      show: ['sup'],
      focus: ['sup'],
    },
    {
      title: '每种促销 = 一个策略类',
      text: '然后**每种促销算法单独写成一个子类**：正常收费 `CashNormal`、打折 `CashRebate`、返利 `CashReturn`。它们是一个**算法家族**，可以互相替换。',
      show: ['normal', 'rebate', 'ret', 'l_n', 'l_r', 'l_t'],
      focus: ['normal', 'rebate', 'ret'],
    },
    {
      title: '上下文：CashContext',
      text: '再加一个**上下文** `CashContext`：它手里**持有一个策略对象**，对外只提供一个 `getResult()`。具体用哪种算法，交给它手里的那个策略去算。',
      show: ['ctx', 'l_ctx'],
      focus: ['ctx', 'sup', 'l_ctx'],
    },
    {
      title: '运行：选择“打8折”',
      text: '收银界面（客户端）只说一句：“这单**打8折**”。CashContext 用简单工厂造出 `CashRebate`，把 1000 元交给它算，得到 **800 元**再返回。',
      show: ['client', 'l_cli'],
      focus: ['client', 'ctx', 'rebate'],
      flows: [
        { from: 'client', to: 'ctx', label: '"打8折", ¥1000' },
        { from: 'ctx', to: 'rebate', label: 'acceptCash(1000)' },
        { from: 'rebate', to: 'ctx', label: '¥800', back: true, tone: 'teal' },
        { from: 'ctx', to: 'client', label: '¥800', back: true, tone: 'teal' },
      ],
    },
    {
      title: '换个策略：满300返100',
      text: '换成“满300返100”呢？客户端仍然只调用同一个 `getResult()`，Context 换了一个策略对象而已：1000 元返 300，收 **700 元**。**算法换了，使用算法的人毫无感觉。**',
      focus: ['client', 'ctx', 'ret'],
      flows: [
        { from: 'client', to: 'ctx', label: '"满300返100", ¥1000' },
        { from: 'ctx', to: 'ret', label: 'acceptCash(1000)' },
        { from: 'ret', to: 'ctx', label: '¥700', back: true, tone: 'teal' },
        { from: 'ctx', to: 'client', label: '¥700', back: true, tone: 'teal' },
      ],
    },
    {
      title: '新活动？加个类就行',
      text: '下个月要搞积分活动？新写一个 `CashPoint` 继承 `CashSuper`，再在 Context 的工厂里登记一下。其余的**策略类一行都不用动**——这就是对扩展开放、对修改关闭。',
      show: ['point', 'l_p', 'tip'],
      focus: ['point', 'l_p', 'tip'],
    },
    {
      title: '总结：策略模式',
      text: '策略模式三件套：**Strategy**（算法的抽象）、**ConcreteStrategy**（各种具体算法）、**Context**（持有并调用策略）。一句话记住：**算法各自装进盒，用哪个就换哪个。**',
      hide: ['tip'],
      set: { point: { badge: '' } },
      focus: ['ctx', 'sup', 'l_ctx'],
      bubbles: [
        { node: 'sup', text: '算法家族：**可以互相替换**', side: 'right' },
        { node: 'ctx', text: '我只管调用，不管怎么算', side: 'top' },
      ],
    },
  ],
});
