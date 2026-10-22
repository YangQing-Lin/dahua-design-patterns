DP.register({
  id: 'lod',
  order: 11,
  type: 'principle',
  name: '迪米特法则',
  en: 'Law of Demeter',
  emoji: '🤝',
  chapter: '第 11 章 · 无熟人难办事？',
  mnemonic: '只跟直接朋友说话，生人托人转达',
  summary: '两个类不必直接打交道就别打交道；要找“陌生人”，就请中间人转达。',
  intent: '如果两个类不必彼此直接通信，那么这两个类就不应当发生直接的相互作用。如果其中一个类需要调用另一个类的某一个方法的话，可以通过第三者转发这个调用。（又叫**最少知识原则**）',
  story: '小菜第一天上班，电脑要装系统、开账号。IT 部的**小张**负责他，偏偏被叫走了；小菜只好自己去找**小李**，小李也在忙……办事全靠“认识谁”。大鸟说：你该找的是 **IT 部门**，由主管安排有空的人——不认识任何人，事情也能办成。',
  analogy: '点外卖：你只和外卖平台打交道，不需要认识餐馆的厨师、也不用知道今天是哪位骑手。厨师换了、骑手换了，你下单的方式一点都不变。',
  when: [
    '代码里出现 `a.getB().getC().doIt()` 这样跨好几层去使唤“朋友的朋友”',
    '多个对象之间相互调用，连成了一张**蜘蛛网**',
    '设计类的公开方法和字段时：判断哪些**不该**让外面知道',
  ],
  pros: ['类之间**松耦合**，一个类改了，波及的范围很小', '每个类知道得越少，越容易**复用**和测试', '内部人员（实现）变动，对调用方完全透明'],
  cons: ['会多出不少负责“转达”的中间类或方法', '中间人可能越来越臃肿，变成什么都管的“上帝类”'],
  keyPoints: [
    '“直接的朋友”：自己（this）、成员变量、方法参数、自己创建的对象；**朋友的朋友就是陌生人**',
    '前提：每个类都应当**尽量降低成员的访问权限**——能 private 就 private，不需要让别人知道的就别公开',
    '根本思想是**松耦合**：类之间耦合越弱，越利于复用；一个类被修改，不会牵连一大片',
    '**外观模式**（给子系统开总窗口）、**中介者模式**（对象之间不直接说话）都是它的典型应用',
  ],
  code: `
// ❌ 小菜直接使唤“朋友的朋友”：小张变了，小菜也得改
class NewEmployeeBad {
    private ITDepartment dept;
    public void startWork() {
        dept.getStaff("小张").setupPC("小菜");   // 跟陌生人说话
    }
}

// ✅ 只跟直接朋友（部门）说话，具体派谁由部门决定
abstract class ITStaff {
    public abstract boolean isFree();
    public abstract void setupPC(String who);
}
class ITDepartment {                              // 第三者：负责转发
    private List<ITStaff> staff = new ArrayList<>();   // 内部细节：private
    public void addStaff(ITStaff s) { staff.add(s); }
    public void request(String who) {
        for (ITStaff s : staff) {
            if (s.isFree()) { s.setupPC(who); return; }   // 谁有空派谁
        }
    }
}
class NewEmployee {
    private final ITDepartment dept;              // 唯一的“直接朋友”
    NewEmployee(ITDepartment dept) { this.dept = dept; }
    public void startWork() {
        dept.request("小菜");                     // 不认识任何具体的人
    }
}`,
  codePython: `
from abc import ABC, abstractmethod


# ❌ 小菜直接使唤“朋友的朋友”：小张变了，小菜也得改
#     self._dept.get_staff("小张").setup_pc("小菜")   # 跟陌生人说话


# ✅ 只跟直接朋友（部门）说话，具体派谁由部门决定
class ITStaff(ABC):
    @abstractmethod
    def is_free(self) -> bool: ...

    @abstractmethod
    def setup_pc(self, who: str) -> None: ...


class Staff(ITStaff):                      # 具体的 IT 员工（小张、小李）
    def __init__(self, name: str, free: bool):
        self.name, self._free = name, free

    def is_free(self):
        return self._free

    def setup_pc(self, who):
        print(f"{self.name}给{who}装系统、开账号")


class ITDepartment:                        # 第三者：负责转发
    def __init__(self):
        # 下划线开头 = Python 约定的“私有”：内部细节，外人别碰
        self._staff: list[ITStaff] = []

    def add_staff(self, s: ITStaff):
        self._staff.append(s)

    def request(self, who: str):
        for s in self._staff:
            if s.is_free():                # 谁有空派谁
                s.setup_pc(who)
                return


class NewEmployee:
    def __init__(self, dept: ITDepartment):
        self._dept = dept                  # 唯一的“直接朋友”

    def start_work(self):
        self._dept.request("小菜")         # 不认识任何具体的人


if __name__ == "__main__":
    dept = ITDepartment()
    dept.add_staff(Staff("小张", free=False))   # 小张被叫走了
    dept.add_staff(Staff("小李", free=True))
    NewEmployee(dept).start_work()         # 小李给小菜装系统、开账号`,
  codeGo: `
package main

import "fmt"

// ❌ 小菜直接使唤“朋友的朋友”：小张变了，小菜也得改
//     e.dept.GetStaff("小张").SetupPC("小菜") // 跟陌生人说话

// ✅ 只跟直接朋友（部门）说话，具体派谁由部门决定
type ITStaff interface {
	IsFree() bool
	SetupPC(who string)
}

type Staff struct { // 具体的 IT 员工（小张、小李）
	name string
	free bool
}

func (s Staff) IsFree() bool { return s.free }
func (s Staff) SetupPC(who string) {
	fmt.Println(s.name + "给" + who + "装系统、开账号")
}

type ITDepartment struct { // 第三者：负责转发
	staff []ITStaff // 小写字段 = 未导出，包外访问不到，内部细节天然被藏起来
}

func (d *ITDepartment) AddStaff(s ITStaff) { d.staff = append(d.staff, s) }

func (d *ITDepartment) Request(who string) {
	for _, s := range d.staff {
		if s.IsFree() { // 谁有空派谁
			s.SetupPC(who)
			return
		}
	}
}

type NewEmployee struct {
	dept *ITDepartment // 唯一的“直接朋友”
}

func (e NewEmployee) StartWork() {
	e.dept.Request("小菜") // 不认识任何具体的人
}

func main() {
	dept := &ITDepartment{}
	dept.AddStaff(Staff{"小张", false}) // 小张被叫走了
	dept.AddStaff(Staff{"小李", true})
	NewEmployee{dept}.StartWork() // 小李给小菜装系统、开账号
}`,
  compare: [
    { id: 'facade', text: '迪米特是**原则**（少认识人，请人转达）；外观是它的一种**具体做法**：给一堆子系统开一个统一窗口，客户只跟窗口说话。' },
    { id: 'mediator', text: '中介者也是迪米特的落地，不过用在**同一层的对象之间**：同事对象互不认识，消息全部经由中介者转发。' },
  ],
  quiz: [
    { q: '代码里到处是 `order.getCustomer().getWallet().getCard().charge(100)` 这样的长调用链。后来钱包类的内部结构一改，几十个调用处全部报错。重构后，调用方只写 `order.pay(100)`，后面的事由 order 自己去协调。', why: '调用方只该和直接的朋友（order）说话，不该深入使唤“朋友的朋友”。' },
    { q: '聊天室里有 20 个用户对象，每个用户都保存着其他所有人的引用、直接互相发消息，新加一个用户要改一堆对象。重构后，用户只认识“聊天室”这一个对象，消息都交给它转发。', why: '对象之间不必直接通信，就通过第三者转发调用，尽量少认识别人。' },
  ],

  nodes: {
    /* —— 场景一：新人报到 —— */
    xc: { kind: 'actor', icon: '👦', label: '小菜', sub: '新员工', x: 150, y: 285, tone: 'blue' },
    pc: { kind: 'box', icon: '💻', label: '小菜的电脑', sub: '没系统 · 没账号', x: 150, y: 455, tone: 'gray', size: 'sm' },
    hr: { kind: 'actor', icon: '👩‍💼', label: '人事', x: 470, y: 285, tone: 'pink' },
    zhang: { kind: 'actor', icon: '👨‍🔧', label: '小张', sub: 'IT 部', x: 500, y: 190, tone: 'teal' },
    li: { kind: 'actor', icon: '👨‍💻', label: '小李', sub: 'IT 部', x: 500, y: 395, tone: 'teal' },
    dn: { kind: 'actor', icon: '🧔', label: '大鸟', x: 150, y: 105, tone: 'purple', size: 'sm' },
    dept: { kind: 'zone', label: 'IT 部门', x: 660, y: 285, w: 420, h: 300, tone: 'indigo' },
    mgr: { kind: 'actor', icon: '👨‍💼', label: 'IT 主管', sub: '统一派活', x: 660, y: 200, tone: 'indigo' },
    wang: { kind: 'actor', icon: '👩‍💻', label: '小王', sub: '有空', x: 770, y: 355, tone: 'teal' },
    def: { kind: 'text', text: '不必直接通信的两个类，就别直接打交道；真要调用，请**第三者转发**', x: 590, y: 505, tone: 'indigo' },

    /* —— 场景二：代码 —— */
    emp: { kind: 'class', title: 'NewEmployee', sub: '新员工（小菜）', lines: ['- dept: ITDepartment', '!dept.getStaff("小张")', '!    .setupPC("小菜");'], x: 170, y: 290, tone: 'blue' },
    itd: { kind: 'class', title: 'ITDepartment', sub: 'IT 部门：直接朋友', lines: ['+ staff: List<ITStaff>', '+ getStaff(name)'], x: 560, y: 130, tone: 'indigo' },
    czhang: { kind: 'class', title: 'XiaoZhang', sub: '小张：朋友的朋友', lines: ['+ setupPC(who)'], x: 470, y: 420, tone: 'teal' },
    cli: { kind: 'class', title: 'XiaoLi', sub: '小李', lines: ['+ setupPC(who)'], x: 700, y: 420, tone: 'teal' },
    apply: { kind: 'zone', label: '用到这个思想的模式', x: 850, y: 205, w: 236, h: 180, tone: 'green' },
    facade: { kind: 'box', icon: '🏛️', label: '外观模式', sub: '给子系统开一个总窗口', x: 850, y: 170, tone: 'green', size: 'sm' },
    mediator: { kind: 'box', icon: '📮', label: '中介者模式', sub: '同事之间不直接说话', x: 850, y: 245, tone: 'green', size: 'sm' },
  },
  links: {
    l_z: { from: 'xc', to: 'zhang', kind: 'depend', tone: 'red', label: '得认识小张' },
    l_l: { from: 'xc', to: 'li', kind: 'depend', tone: 'red', label: '得认识小李' },
    l_dept: { from: 'xc', to: 'dept', kind: 'assoc', label: '只找部门' },
    l_ed: { from: 'emp', to: 'itd', kind: 'assoc', label: '直接朋友' },
    l_dz: { from: 'itd', to: 'czhang', kind: 'aggregate' },
    l_dl: { from: 'itd', to: 'cli', kind: 'aggregate' },
    l_ez: { from: 'emp', to: 'czhang', kind: 'depend', tone: 'red', label: '陌生人！' },
  },

  frames: [
    {
      title: '新人报到第一天',
      text: '小菜第一天去新公司上班，电脑还没装系统、也没开账号，什么都干不了。人事告诉他：IT 部的**小张**负责帮你弄。听起来很简单，对吧？',
      show: ['xc', 'pc', 'hr'],
      bubbles: [
        { node: 'xc', text: '电脑还**不能用**……', side: 'top' },
        { node: 'hr', text: '去找 IT 部的**小张**', side: 'top', delay: 0.9 },
      ],
    },
    {
      title: '找小张：被叫走了',
      text: '小菜去找小张。小张刚要动手，就被领导叫去处理别的急事，临走丢下一句：你去找**小李**吧。小菜站在原地，只能接着等。',
      hide: ['hr'],
      show: ['zhang'],
      focus: ['xc', 'zhang'],
      flows: [{ from: 'xc', to: 'zhang', label: '帮我装下电脑' }],
      bubbles: [{ node: 'zhang', text: '领导叫我，你**找小李**吧', side: 'right', step: 0 }],
    },
    {
      title: '再找小李：也在忙',
      text: '小张一走，小菜只好自己去找小李。小李手上正忙，也说等会儿。一上午过去，电脑还是没装好——小菜办事全靠**认识的人**，人一不在，事就卡住。',
      show: ['li'],
      set: { zhang: { x: 880, y: 110, opacity: 0.45, badge: '被叫走了' } },
      focus: ['xc', 'li'],
      flows: [{ from: 'xc', to: 'li', label: '小张让我找你' }],
      bubbles: [{ node: 'li', text: '手上正忙，**等会儿**吧', side: 'right', step: 0 }],
    },
    {
      title: '问题：办事全靠熟人',
      text: '问题在哪？小菜直接和**具体的某个人**绑在了一起：先依赖小张，又依赖小李。谁请假、谁调岗，小菜都得重新找人。这就像一个类直接认识一大堆别的类——**耦合太紧**。',
      show: ['l_z', 'l_l'],
      focus: ['xc', 'l_z', 'l_l', 'zhang', 'li'],
      bubbles: [{ node: 'xc', text: '办点事全靠**熟人**……', side: 'bottom' }],
    },
    {
      title: '大鸟：找部门，别找人',
      text: '大鸟说：你该找的不是小张、小李，而是 **IT 部门**。部门有主管统一派活，里面有谁、谁有空，你都不用知道。小菜只需要认识**一个窗口**。',
      hide: ['l_z', 'l_l'],
      show: ['dn', 'dept', 'mgr', 'wang', 'l_dept'],
      set: {
        zhang: { x: 550, y: 355, opacity: 0.45, badge: '外出' },
        li: { x: 660, y: 355, opacity: 0.45, badge: '在忙' },
      },
      focus: ['dn', 'xc', 'l_dept', 'mgr', 'wang'],
      bubbles: [{ node: 'dn', text: '别找人，**找部门**！', side: 'right' }],
    },
    {
      title: '无熟人也能办事',
      text: '小菜把需求交给 IT 主管，主管一看小王正好有空，就派小王过来装系统、开账号。小菜一个 IT 的人都不认识，事情照样办成——**无熟人也能办事**。',
      set: { pc: { badge: '✓ 搞定', sub: '系统装好 · 账号开好', tone: 'green' } },
      focus: ['xc', 'mgr', 'wang', 'pc'],
      flows: [
        { from: 'xc', to: 'mgr', label: '新人要装电脑' },
        { from: 'mgr', to: 'wang', label: '小王，你去' },
        { from: 'wang', to: 'pc', icon: '🔧', label: '装系统、开账号', curve: -70 },
      ],
    },
    {
      title: '迪米特法则',
      text: '这就是**迪米特法则**，也叫最少知识原则：两个类如果不必直接通信，就不要直接打交道；真要调用，就通过**第三者转发**。IT 主管就是那个第三者。',
      show: ['def'],
      set: { mgr: { badge: '第三者' } },
      focus: ['mgr', 'def', 'xc', 'l_dept'],
      bubbles: [{ node: 'mgr', text: '有事找我，**我来转达**', side: 'right' }],
    },
    {
      title: '代码：跟陌生人说话',
      text: '换成代码。`NewEmployee` 写了 `dept.getStaff("小张").setupPC()`：先从部门要到小张，再直接使唤他。小张本是**朋友的朋友**，这下成了直接依赖——小张类一改，新员工类也得跟着改。',
      clear: true,
      show: ['emp', 'itd', 'czhang', 'cli', 'l_ed', 'l_dz', 'l_dl', 'l_ez'],
      focus: ['emp', 'itd', 'czhang', 'l_ez'],
      flows: [
        { from: 'emp', to: 'itd', label: 'getStaff("小张")' },
        { from: 'itd', to: 'emp', label: '小张对象', back: true, tone: 'teal' },
        { from: 'emp', to: 'czhang', label: 'setupPC("小菜")', tone: 'red' },
      ],
    },
    {
      title: '只跟直接朋友说话',
      text: '改成 `dept.request("小菜")`：新员工只和**直接朋友**——部门说话，派谁由部门内部决定。部门的人员名单 `staff` 改成 **private**，外人看不到也碰不着。每个类都尽量少暴露自己。',
      hide: ['l_ez'],
      set: {
        emp: { lines: ['- dept: ITDepartment', '!dept.request("小菜");'] },
        itd: { sub: 'IT 部门：负责转发', lines: ['!- staff: List<ITStaff>', '+ request(who)'] },
        czhang: { sub: '小张（外出）', opacity: 0.5 },
        cli: { sub: '小李（有空）' },
      },
      focus: ['emp', 'itd', 'cli', 'l_ed', 'l_dl'],
      flows: [
        { from: 'emp', to: 'itd', label: 'request("小菜")' },
        { from: 'itd', to: 'cli', label: 'setupPC("小菜")' },
        { from: 'cli', to: 'itd', label: '✓', back: true, tone: 'teal' },
        { from: 'itd', to: 'emp', label: '✓ 搞定', back: true, tone: 'teal' },
      ],
    },
    {
      title: '总结：迪米特法则',
      text: '迪米特法则的根本是**松耦合**：类知道得越少，改动波及越小，越容易复用。**外观模式**、**中介者模式**都是它的典型应用。一句话记住：**只跟直接朋友说话，生人托人转达。**',
      show: ['apply', 'facade', 'mediator'],
      focus: ['emp', 'itd', 'l_ed', 'facade', 'mediator'],
      bubbles: [{ node: 'emp', text: '我只认识**部门**一个朋友', side: 'bottom' }],
    },
  ],
});
