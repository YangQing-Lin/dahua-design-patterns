DP.register({
  id: 'chain-of-responsibility',
  order: 24,
  type: 'behavioral',
  name: '职责链模式',
  en: 'Chain of Responsibility',
  emoji: '⛓️',
  chapter: '第 24 章 · 加薪非要老总批？',
  mnemonic: '能批就批，批不了就往上递',
  summary: '把处理者串成一条链，请求沿链传递，直到有人处理；发送者不用知道最后是谁处理的。',
  intent: '使多个对象都有机会处理请求，从而避免请求的发送者和接收者之间的耦合关系。将这个对象连成一条链，并沿着这条链传递该请求，直到有一个对象处理它为止。',
  story: '小菜想**加薪**，找经理，经理说“我没这个权限”，报给总监；总监也做不了主，再报总经理……公司的规矩是：请假 2 天内经理批、5 天内总监批、更多找总经理；加薪只有总经理能批，500 以内批准，再多就“再说吧”。大鸟让小菜把每位管理者写成一个类，**管不了就交给上级**。',
  analogy: '去医院看病：先到分诊台，处理不了转普通门诊，再处理不了转专家门诊。你只需要在入口挂号，**不用事先知道**最后是哪位医生给你看的病。',
  when: [
    '有**多个对象**可以处理同一个请求，具体由谁处理要在运行时才确定',
    '不想让请求的发送者**指定**具体的接收者',
    '处理者的集合或顺序需要**动态调整**',
  ],
  pros: ['发送者和接收者**解耦**，客户端只认识链头', '每个处理者只管自己权限内的事，职责单一', '可以随时**增删处理者、调整顺序**，只改链的配置'],
  cons: ['请求可能走到链尾都**没人处理**', '链太长时不易调试，性能也会受影响', '链如果**配置错了**（比如漏设上级），请求就断了'],
  keyPoints: [
    '两个角色：**Handler**（抽象处理者 `Manager`，持有一个后继者 `superior`）、**ConcreteHandler**（经理 / 总监 / 总经理）',
    '每个处理者的套路都一样：**在我权限内就处理，否则转给后继者**',
    '链由**客户端组装**（`setSuperior()`），请求只发给链头',
  ],
  code: `
class Request {                                     // 申请
    String requestType;                             // "请假" / "加薪"
    String requestContent;
    int number;                                     // 天数 / 金额
    Request(String t, String c, int n) { requestType = t; requestContent = c; number = n; }
}
abstract class Manager {                            // 抽象管理者
    protected String name;
    protected Manager superior;                     // 关键：上级，也是 Manager
    Manager(String name) { this.name = name; }
    public void setSuperior(Manager superior) { this.superior = superior; }
    public abstract void requestApplications(Request r);
}
class CommonManager extends Manager {               // 经理：请假 ≤ 2 天
    CommonManager(String n) { super(n); }
    public void requestApplications(Request r) {
        if (r.requestType.equals("请假") && r.number <= 2)
            System.out.println(name + "：" + r.requestContent + " " + r.number + " 天，被批准");
        else if (superior != null) superior.requestApplications(r);     // 转给上级
    }
}
class Majordomo extends Manager {                   // 总监：请假 ≤ 5 天
    Majordomo(String n) { super(n); }
    public void requestApplications(Request r) {
        if (r.requestType.equals("请假") && r.number <= 5)
            System.out.println(name + "：" + r.requestContent + " " + r.number + " 天，被批准");
        else if (superior != null) superior.requestApplications(r);
    }
}
class GeneralManager extends Manager {              // 总经理：链的末端
    GeneralManager(String n) { super(n); }
    public void requestApplications(Request r) {
        if (r.requestType.equals("请假")) System.out.println(name + "：" + r.requestContent + "，被批准");
        else if (r.requestType.equals("加薪") && r.number <= 500) System.out.println(name + "：加薪 " + r.number + "，被批准");
        else System.out.println(name + "：加薪 " + r.number + "，再说吧");
    }
}
// 客户端：先组链，之后只找经理
Manager jinli = new CommonManager("金利"), zongjian = new Majordomo("宗剑"), zhongjingli = new GeneralManager("钟精励");
jinli.setSuperior(zongjian);
zongjian.setSuperior(zhongjingli);
jinli.requestApplications(new Request("请假", "小菜请假", 1));        // 经理批
jinli.requestApplications(new Request("请假", "小菜请假", 4));        // 总监批
jinli.requestApplications(new Request("加薪", "小菜请求加薪", 500));  // 总经理批
jinli.requestApplications(new Request("加薪", "小菜请求加薪", 1000)); // 再说吧`,
  codePython: `
from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class Request:                              # 申请
    request_type: str                       # "请假" / "加薪"
    request_content: str
    number: int                             # 天数 / 金额


class Manager(ABC):                         # 抽象管理者
    def __init__(self, name):
        self.name = name
        self.superior = None                # 关键：上级，也是 Manager

    def set_superior(self, superior):
        self.superior = superior

    @abstractmethod
    def request_applications(self, r: Request): ...


class CommonManager(Manager):               # 经理：请假 <= 2 天
    def request_applications(self, r):
        if r.request_type == "请假" and r.number <= 2:
            print(f"{self.name}：{r.request_content} {r.number} 天，被批准")
        elif self.superior:
            self.superior.request_applications(r)   # 转给上级


class Majordomo(Manager):                   # 总监：请假 <= 5 天
    def request_applications(self, r):
        if r.request_type == "请假" and r.number <= 5:
            print(f"{self.name}：{r.request_content} {r.number} 天，被批准")
        elif self.superior:
            self.superior.request_applications(r)


class GeneralManager(Manager):              # 总经理：链的末端
    def request_applications(self, r):
        if r.request_type == "请假":
            print(f"{self.name}：{r.request_content}，被批准")
        elif r.request_type == "加薪" and r.number <= 500:
            print(f"{self.name}：加薪 {r.number}，被批准")
        else:
            print(f"{self.name}：加薪 {r.number}，再说吧")


# 客户端：先组链，之后只找经理
if __name__ == "__main__":
    jinli, zongjian = CommonManager("金利"), Majordomo("宗剑")
    zhongjingli = GeneralManager("钟精励")
    jinli.set_superior(zongjian)
    zongjian.set_superior(zhongjingli)
    jinli.request_applications(Request("请假", "小菜请假", 1))        # 金利：小菜请假 1 天，被批准
    jinli.request_applications(Request("请假", "小菜请假", 4))        # 宗剑：小菜请假 4 天，被批准
    jinli.request_applications(Request("加薪", "小菜请求加薪", 500))  # 钟精励：加薪 500，被批准
    jinli.request_applications(Request("加薪", "小菜请求加薪", 1000)) # 钟精励：加薪 1000，再说吧`,
  codeGo: `
package main

import "fmt"

type Request struct { // 申请
	RequestType    string // "请假" / "加薪"
	RequestContent string
	Number         int // 天数 / 金额
}

// 抽象管理者：Go 用接口表达
type Manager interface {
	SetSuperior(m Manager)
	RequestApplications(r Request)
}

// Go 没有继承：把 name 和 superior 放进基础结构体，具体管理者嵌入它来复用
type manager struct {
	name     string
	superior Manager // 关键：上级，也是 Manager
}

func (m *manager) SetSuperior(s Manager) { m.superior = s }

// 转给上级
func (m *manager) pass(r Request) {
	if m.superior != nil {
		m.superior.RequestApplications(r)
	}
}

type CommonManager struct{ manager } // 经理：请假 <= 2 天

func (m *CommonManager) RequestApplications(r Request) {
	if r.RequestType == "请假" && r.Number <= 2 {
		fmt.Println(m.name+"："+r.RequestContent, r.Number, "天，被批准")
	} else {
		m.pass(r)
	}
}

type Majordomo struct{ manager } // 总监：请假 <= 5 天

func (m *Majordomo) RequestApplications(r Request) {
	if r.RequestType == "请假" && r.Number <= 5 {
		fmt.Println(m.name+"："+r.RequestContent, r.Number, "天，被批准")
	} else {
		m.pass(r)
	}
}

type GeneralManager struct{ manager } // 总经理：链的末端

func (m *GeneralManager) RequestApplications(r Request) {
	switch {
	case r.RequestType == "请假":
		fmt.Println(m.name + "：" + r.RequestContent + "，被批准")
	case r.RequestType == "加薪" && r.Number <= 500:
		fmt.Println(m.name + "：加薪 " + fmt.Sprint(r.Number) + "，被批准")
	default:
		fmt.Println(m.name + "：加薪 " + fmt.Sprint(r.Number) + "，再说吧")
	}
}

// 客户端：先组链，之后只找经理
func main() {
	jinli := &CommonManager{manager{name: "金利"}}
	zongjian := &Majordomo{manager{name: "宗剑"}}
	zhongjingli := &GeneralManager{manager{name: "钟精励"}}
	jinli.SetSuperior(zongjian)
	zongjian.SetSuperior(zhongjingli)
	jinli.RequestApplications(Request{"请假", "小菜请假", 1})      // 经理批
	jinli.RequestApplications(Request{"请假", "小菜请假", 4})      // 总监批
	jinli.RequestApplications(Request{"加薪", "小菜请求加薪", 500})  // 总经理批
	jinli.RequestApplications(Request{"加薪", "小菜请求加薪", 1000}) // 再说吧
}`,
  compare: [
    { id: 'state', text: '状态模式里“下一个是谁”由**状态自己在运行时决定**，变的是一个对象的行为；职责链的链条由**客户端事先组装**，请求在多个处理者之间传递。' },
    { id: 'decorator', text: '装饰模式里**每一层都要处理**，再交给下一层，层层叠加功能；职责链通常**只有一个处理者**真正处理，处理完就停下。' },
  ],
  quiz: [
    { q: '报销审批：1000 元以内组长批，5000 元以内部门经理批，再多要财务总监批。员工只把报销单交给组长，不关心最后是谁批的；公司以后还可能增加审批层级。', why: '多个处理者按权限逐级上交，发送者只认识第一个处理者。' },
    { q: '客服系统：用户的问题先交给机器人，机器人答不了转人工客服，人工也解决不了再转技术专家。用户只管提问，不知道最后是谁回答的。' },
  ],

  nodes: {
    // —— 场景一：故事 / 运行 ——
    xc: { kind: 'actor', icon: '👨‍💻', label: '小菜', sub: '想加薪', x: 95, y: 250, tone: 'blue' },
    jl: { kind: 'actor', icon: '👨‍💼', label: '经理', sub: 'CommonManager', x: 320, y: 250, tone: 'teal' },
    zj: { kind: 'actor', icon: '👩‍💼', label: '总监', sub: 'Majordomo', x: 560, y: 250, tone: 'indigo' },
    zjl: { kind: 'actor', icon: '👔', label: '总经理', sub: 'GeneralManager', x: 810, y: 250, tone: 'orange' },
    fz: { kind: 'actor', icon: '🕴️', label: '副总', sub: '请假 ≤ 10 天', x: 680, y: 250, tone: 'green', badge: 'NEW' },
    reqCard: { kind: 'box', shape: 'note', icon: '📝', label: 'Request', sub: '请假 · 1 天', x: 110, y: 420, tone: 'yellow' },
    motto: { kind: 'text', text: '能批就批，批不了就往上递', x: 500, y: 450, tone: 'purple', size: 'xl' },
    endTip: { kind: 'text', text: '链尾也处理不了？请求就“石沉大海”', x: 810, y: 475, tone: 'red', size: 'sm' },

    // —— 场景二：小菜的第一版 ——
    bad: {
      kind: 'class', title: 'Manager', sub: '小菜的第一版：一个类管所有', x: 500, y: 280, tone: 'red',
      lines: [
        'getResult(managerLevel, request) {',
        '  if (level == "经理") {',
        '    if (请假 && 天数 <= 2) 批准',
        '    else 无权处理',
        '  } else if (level == "总监") {',
        '    if (请假 && 天数 <= 5) 批准',
        '    else 无权处理',
        '  } else if (level == "总经理") {',
        '    if (请假) 批准',
        '    else if (加薪 && 金额 <= 500) 批准',
        '    else 再说吧',
        '  }',
        '}',
      ],
    },

    // —— 场景三：类图 ——
    req: { kind: 'class', title: 'Request', sub: '申请', x: 150, y: 140, tone: 'gray', lines: ['- requestType  请假/加薪', '- requestContent', '- number  天数/金额'] },
    mgr: {
      kind: 'class', title: 'Manager', stereo: 'abstract', sub: '管理者', x: 540, y: 140, tone: 'purple',
      lines: ['# name: String', '# superior: Manager', '+ setSuperior(Manager m)', '+ requestApplications(r)'],
    },
    sup: { kind: 'box', shape: 'ghost', icon: '👆', label: '上级', sub: '也是一个 Manager', x: 850, y: 140, tone: 'purple' },
    c1: { kind: 'class', title: 'CommonManager', sub: '经理：请假 ≤ 2 天', x: 260, y: 420, tone: 'teal' },
    c2: { kind: 'class', title: 'Majordomo', sub: '总监：请假 ≤ 5 天', x: 520, y: 420, tone: 'indigo' },
    c3: { kind: 'class', title: 'GeneralManager', sub: '总经理：其余请假、加薪', x: 790, y: 420, tone: 'orange' },
  },
  links: {
    k_xj: { from: 'xc', to: 'jl', kind: 'assoc', label: '只交给经理', labelDy: -12 },
    k_jz: { from: 'jl', to: 'zj', kind: 'arrow', label: 'superior', labelDy: -12 },
    k_zz: { from: 'zj', to: 'zjl', kind: 'arrow', label: 'superior', labelDy: -12 },
    k_zf: { from: 'zj', to: 'fz', kind: 'arrow', label: 'superior', labelDy: -12 },
    k_fz: { from: 'fz', to: 'zjl', kind: 'arrow', label: 'superior', labelDy: -12 },

    l_sup: { from: 'mgr', to: 'sup', kind: 'aggregate', label: 'superior', labelDy: -12 },
    l_c1: { from: 'c1', to: 'mgr', kind: 'inherit' },
    l_c2: { from: 'c2', to: 'mgr', kind: 'inherit' },
    l_c3: { from: 'c3', to: 'mgr', kind: 'inherit' },
    l_rq: { from: 'mgr', to: 'req', kind: 'depend', label: '处理', labelDy: -12 },
  },

  frames: [
    {
      title: '小菜想加薪',
      text: '小菜工作满一年，鼓起勇气找**经理**申请加薪。经理说：“这事我**做不了主**，得报给总监。”总监又说要报总经理。层层上报一圈，最后总经理一句：“**再说吧**。”',
      show: ['xc', 'jl', 'zj', 'zjl'],
      flows: [
        { from: 'xc', to: 'jl', label: '📝 加薪申请' },
        { from: 'jl', to: 'zj', label: '📝 加薪申请' },
        { from: 'zj', to: 'zjl', label: '📝 加薪申请' },
      ],
      bubbles: [
        { node: 'jl', text: '我**做不了主**，报总监', side: 'bottom', step: 0 },
        { node: 'zj', text: '我也没这权限……', side: 'bottom', step: 1 },
        { node: 'zjl', text: '……**再说吧**', side: 'bottom', step: 2 },
      ],
    },
    {
      title: '每一级权限不同',
      text: '原来公司的规矩是：**请假 2 天内**经理就能批，**5 天内**总监批，再多得找总经理；**加薪**只有总经理能批，500 以内批准，再多就“再说吧”。每一级都**只能处理自己权限内**的事。',
      focus: ['jl', 'zj', 'zjl'],
      bubbles: [
        { node: 'jl', text: '请假 **≤ 2 天**，我批', side: 'bottom' },
        { node: 'zj', text: '请假 **≤ 5 天**，我批', side: 'bottom', delay: 0.4 },
        { node: 'zjl', text: '其余请假我批；\n加薪 **≤ 500** 批，再多：再说吧', side: 'bottom', delay: 0.8 },
      ],
    },
    {
      title: '小菜的第一版：一个大类',
      text: '小菜照着规则写了个管理者类 `Manager`，用一个 `getResult()` 按“经理 / 总监 / 总经理”和“请假 / 加薪”层层 `if/else`。更麻烦的是，客户端还得**自己挨个去问**每一级。',
      clear: true,
      show: ['bad'],
      focus: ['bad'],
    },
    {
      title: '问题：牵一发动全身',
      text: '大鸟指出：这个类**职责太多**，管理级别、请求类型全挤在一起。公司要加一个新的管理级别，或者把经理的权限改成 3 天，都得**改这个大类**——违背单一职责，也违背开放-封闭。',
      set: { bad: { strike: true, badge: '又长又难改' } },
      bubbles: [
        { node: 'bad', text: '加一个级别？\n**改我**', side: 'left' },
        { node: 'bad', text: '客户端还得\n**自己挨个去问**', side: 'right', delay: 0.5 },
      ],
    },
    {
      title: '请求 + 抽象管理者',
      text: '大鸟的办法：先把申请做成**请求** `Request`（类型、内容、数量）。再写**抽象管理者** `Manager`：关键是它手里**还持有一个上级** `superior`，也是 Manager。自己管不了的，就**交给上级**。',
      clear: true,
      show: ['req', 'mgr', 'sup', 'l_sup', 'l_rq'],
      focus: ['mgr', 'sup', 'l_sup'],
    },
    {
      title: '三级管理者各管一段',
      text: '每一级写成一个子类：**经理** `CommonManager`、**总监** `Majordomo`、**总经理** `GeneralManager`。它们的 `requestApplications()` 都是一个套路：**在我权限内就处理，否则转给上级**。',
      show: ['c1', 'c2', 'c3', 'l_c1', 'l_c2', 'l_c3'],
      focus: ['c1', 'c2', 'c3', 'l_c1', 'l_c2', 'l_c3'],
    },
    {
      title: '组链：串起上下级',
      text: '客户端把它们串起来：经理的上级是总监，总监的上级是总经理，一条**职责链**就搭好了。从此小菜**只把申请交给经理**，至于最后是谁批的，他**不需要知道**。',
      clear: true,
      show: ['xc', 'jl', 'zj', 'zjl', 'k_xj', 'k_jz', 'k_zz'],
      set: {
        xc: { sub: '客户端' },
        jl: { sub: '请假 ≤ 2 天' },
        zj: { sub: '请假 ≤ 5 天' },
        zjl: { sub: '其余请假 · 加薪 ≤ 500' },
      },
      focus: ['k_jz', 'k_zz', 'jl', 'zj', 'zjl'],
      flows: [
        { from: 'jl', to: 'zj', label: 'setSuperior(总监)', tone: 'purple', curve: -50 },
        { from: 'zj', to: 'zjl', label: 'setSuperior(总经理)', tone: 'purple', curve: -50 },
      ],
    },
    {
      title: '请假 1 天',
      text: '第一个请求：**请假 1 天**。交给经理，1 天在“2 天以内”的权限里，**经理直接批了**。请求到此为止，后面的总监、总经理根本不知道这件事。',
      show: ['reqCard'],
      set: { reqCard: { sub: 'requestType = 请假\nnumber = 1' } },
      focus: ['xc', 'jl', 'k_xj', 'reqCard'],
      flows: [
        { from: 'xc', to: 'jl', label: '📝 请假 1 天' },
      ],
      bubbles: [
        { node: 'jl', text: '✅ 1 天，**我批了**', side: 'bottom', step: 0 },
      ],
    },
    {
      title: '请假 4 天',
      text: '**请假 4 天**：经理一看超过 2 天，**转给上级**总监；4 天在总监的 5 天权限内，**总监批了**。小菜的做法没有任何变化，还是只交给经理。',
      set: { reqCard: { sub: 'requestType = 请假\nnumber = 4' } },
      focus: ['xc', 'jl', 'zj', 'k_xj', 'k_jz', 'reqCard'],
      flows: [
        { from: 'xc', to: 'jl', label: '📝 请假 4 天' },
        { from: 'jl', to: 'zj', label: '📝 请假 4 天' },
      ],
      bubbles: [
        { node: 'jl', text: '超过 2 天，**往上递**', side: 'bottom', step: 0 },
        { node: 'zj', text: '✅ 4 天，**我批了**', side: 'bottom', step: 1 },
      ],
    },
    {
      title: '加薪 500',
      text: '**加薪 500**：经理不管加薪，转总监；总监也没这个权限，转总经理；总经理一看 500 以内，**批准**！请求沿着链**一路往上走**，直到遇见能处理它的人。',
      set: { reqCard: { sub: 'requestType = 加薪\nnumber = 500' } },
      focus: ['xc', 'jl', 'zj', 'zjl', 'k_xj', 'k_jz', 'k_zz', 'reqCard'],
      flows: [
        { from: 'xc', to: 'jl', label: '📝 加薪 500' },
        { from: 'jl', to: 'zj', label: '📝 加薪 500' },
        { from: 'zj', to: 'zjl', label: '📝 加薪 500' },
      ],
      bubbles: [
        { node: 'jl', text: '加薪？**往上递**', side: 'bottom', step: 0 },
        { node: 'zj', text: '我也批不了，**往上递**', side: 'bottom', step: 1 },
        { node: 'zjl', text: '✅ 500 以内，**批准**', side: 'bottom', step: 2 },
      ],
    },
    {
      title: '加薪 1000：再说吧',
      text: '**加薪 1000**：一路传到总经理——“**再说吧**”。这也暴露了职责链的风险：如果链尾也处理不了，请求就会**石沉大海**；链要是配置错了（比如漏设上级），请求也会**没人接**。',
      show: ['endTip'],
      set: { reqCard: { sub: 'requestType = 加薪\nnumber = 1000' } },
      focus: ['xc', 'jl', 'zj', 'zjl', 'k_xj', 'k_jz', 'k_zz', 'endTip', 'reqCard'],
      flows: [
        { from: 'xc', to: 'jl', label: '📝 加薪 1000' },
        { from: 'jl', to: 'zj', label: '📝 加薪 1000' },
        { from: 'zj', to: 'zjl', label: '📝 加薪 1000' },
      ],
      bubbles: [
        { node: 'zjl', text: '1000？……**再说吧**', side: 'bottom', step: 2 },
      ],
    },
    {
      title: '加一环：只改配置',
      text: '公司新设**副总**，请假 10 天内归他批？只要**新写一个 Manager 子类**，把总监的上级改成副总、副总的上级设为总经理。原有的类**一行不改**，**请假 8 天**就停在副总这儿。',
      hide: ['endTip', 'k_zz'],
      show: ['fz', 'k_zf', 'k_fz'],
      set: {
        xc: { x: 80 }, jl: { x: 265 }, zj: { x: 465 }, fz: { x: 665 }, zjl: { x: 880 },
        reqCard: { x: 100, sub: 'requestType = 请假\nnumber = 8' },
      },
      trans: 1.2,
      focus: ['xc', 'jl', 'zj', 'fz', 'k_xj', 'k_jz', 'k_zf', 'reqCard'],
      flows: [
        { from: 'xc', to: 'jl', label: '📝 请假 8 天' },
        { from: 'jl', to: 'zj', label: '📝 请假 8 天' },
        { from: 'zj', to: 'fz', label: '📝 请假 8 天' },
      ],
      bubbles: [
        { node: 'zj', text: '超过 5 天，往上递', side: 'bottom', step: 1 },
        { node: 'fz', text: '✅ 8 天，**我批了**', side: 'bottom', step: 2 },
      ],
    },
    {
      title: '总结：职责链模式',
      text: '职责链：让多个对象都有机会处理请求，把它们**连成一条链**，请求沿链传递，**直到有对象处理它**。发送者和接收者**互不认识**，链可以随时调整。一句话记住：**能批就批，批不了就往上递。**',
      hide: ['reqCard'],
      show: ['motto'],
      focus: ['xc', 'jl', 'zj', 'fz', 'zjl', 'k_xj', 'k_jz', 'k_zf', 'k_fz', 'motto'],
      bubbles: [
        { node: 'jl', text: '能批就批', side: 'bottom' },
        { node: 'zj', text: '批不了就**往上递**', side: 'bottom', delay: 0.3 },
        { node: 'xc', text: '我只认识**链头**', side: 'top', delay: 0.6 },
      ],
    },
  ],
});
