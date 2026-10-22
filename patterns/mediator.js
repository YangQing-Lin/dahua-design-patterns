DP.register({
  id: 'mediator',
  order: 25,
  type: 'behavioral',
  name: '中介者模式',
  en: 'Mediator',
  emoji: '🕊️',
  chapter: '第 25 章 · 世界需要和平！',
  mnemonic: '网状变星状，有事找中介',
  summary: '一群对象不再互相直接打交道，统一通过一个中介者来协调和转达。',
  intent: '用一个中介对象来封装一系列的对象交互。中介者使各对象不需要显式地相互引用，从而使其耦合松散，而且可以独立地改变它们之间的交互。',
  story: '小菜看国际新闻，感叹国与国的关系太复杂：每个国家都直接和别的国家打交道，就是一张**多对多的网**。大鸟说：所以才需要**联合国**——各国有事都通过它来协调。代码里，美国和伊拉克都只持有**安理会**的引用，彼此的声明由安理会**转达**给对方。',
  analogy: '机场塔台：几十架飞机从不互相通话商量谁先起飞、谁先降落，而是全部只和**塔台**联系，由塔台统一调度。没有塔台，飞机之间的对话会乱成一锅粥。',
  when: [
    '一组对象之间**通信方式明确但关系复杂**，互相依赖、难以理解',
    '某个对象引用了太多别的对象，想复用它却拆不出来',
    '想把分散在多个类里的交互规则**集中到一处**来管理',
  ],
  pros: [
    '同事对象之间**解耦**，可以各自独立修改、复用',
    '**多对多**变成**一对多**，关系一目了然',
    '交互规则集中在中介者里，改协作方式只改一处',
  ],
  cons: [
    '中介者**集中了所有控制**，同事越多它越复杂，可能比任何一个同事都难维护',
    '中介者一出问题，整个协作都受影响',
  ],
  keyPoints: [
    '两组角色：**Mediator / ConcreteMediator**（抽象 / 具体中介者，具体中介者认识所有同事）；**Colleague / ConcreteColleague**（抽象 / 具体同事，只持有中介者引用）',
    '同事之间**不互相引用**，有事就调用 `mediator.declare(...)`，由中介者决定转给谁',
    '是迪米特法则的典型应用：不跟“陌生人”直接说话，通过第三者转达',
  ],
  code: `
// 抽象中介者：联合国
abstract class UnitedNations {
    public abstract void declare(String message, Country colleague);
}
// 抽象同事：国家，只认识中介者
abstract class Country {
    protected UnitedNations mediator;
    Country(UnitedNations mediator) { this.mediator = mediator; }
}
class USA extends Country {
    USA(UnitedNations m) { super(m); }
    public void declare(String message) { mediator.declare(message, this); }  // 交给联合国
    public void getMessage(String message) { System.out.println("美国获得对方信息：" + message); }
}
class Iraq extends Country {
    Iraq(UnitedNations m) { super(m); }
    public void declare(String message) { mediator.declare(message, this); }
    public void getMessage(String message) { System.out.println("伊拉克获得对方信息：" + message); }
}
// 具体中介者：安理会，认识所有同事，负责转达
class UnitedNationsSecurityCouncil extends UnitedNations {
    private USA usa;
    private Iraq iraq;
    public void setUsa(USA usa)    { this.usa = usa; }
    public void setIraq(Iraq iraq) { this.iraq = iraq; }
    public void declare(String message, Country colleague) {
        if (colleague == usa) iraq.getMessage(message);   // 美国说的 → 转给伊拉克
        else                  usa.getMessage(message);    // 伊拉克说的 → 转给美国
    }
}
// 客户端
UnitedNationsSecurityCouncil unsc = new UnitedNationsSecurityCouncil();
USA usa = new USA(unsc);
Iraq iraq = new Iraq(unsc);
unsc.setUsa(usa);
unsc.setIraq(iraq);
usa.declare("不准研制核武器，否则要发动战争！");
iraq.declare("我们没有核武器，也不怕侵略。");`,
  codePython: `
from abc import ABC, abstractmethod


# 抽象中介者：联合国
class UnitedNations(ABC):
    @abstractmethod
    def declare(self, message: str, colleague: "Country"): ...


# 抽象同事：国家，只认识中介者，不认识对方
class Country(ABC):
    name = ""

    def __init__(self, mediator: UnitedNations):
        self.mediator = mediator

    def declare(self, message):                  # 交给联合国
        self.mediator.declare(message, self)

    def get_message(self, message):
        print(f"{self.name}获得对方信息：{message}")


class USA(Country):
    name = "美国"


class Iraq(Country):
    name = "伊拉克"


# 具体中介者：安理会，认识所有同事，负责转达
class UnitedNationsSecurityCouncil(UnitedNations):
    def __init__(self):
        self.usa = self.iraq = None

    def declare(self, message, colleague):
        if colleague is self.usa:
            self.iraq.get_message(message)       # 美国说的 → 转给伊拉克
        else:
            self.usa.get_message(message)        # 伊拉克说的 → 转给美国


# 客户端
if __name__ == "__main__":
    unsc = UnitedNationsSecurityCouncil()
    unsc.usa = USA(unsc)
    unsc.iraq = Iraq(unsc)
    unsc.usa.declare("不准研制核武器，否则要发动战争！")
    # 伊拉克获得对方信息：不准研制核武器，否则要发动战争！
    unsc.iraq.declare("我们没有核武器，也不怕侵略。")
    # 美国获得对方信息：我们没有核武器，也不怕侵略。`,
  codeGo: `
package main

import "fmt"

// 抽象中介者：联合国
type UnitedNations interface {
	Declare(message string, colleague Country)
}

// 抽象同事：国家，只认识中介者。Go 没有继承，用接口表达
type Country interface{ GetMessage(message string) }

type USA struct{ mediator UnitedNations }

func (u *USA) Declare(message string) { u.mediator.Declare(message, u) } // 交给联合国
func (u *USA) GetMessage(message string) {
	fmt.Println("美国获得对方信息：" + message)
}

type Iraq struct{ mediator UnitedNations }

func (i *Iraq) Declare(message string) { i.mediator.Declare(message, i) }
func (i *Iraq) GetMessage(message string) {
	fmt.Println("伊拉克获得对方信息：" + message)
}

// 具体中介者：安理会，认识所有同事，负责转达
type UnitedNationsSecurityCouncil struct {
	Usa  *USA
	Iraq *Iraq
}

func (c *UnitedNationsSecurityCouncil) Declare(message string, colleague Country) {
	if colleague == Country(c.Usa) {
		c.Iraq.GetMessage(message) // 美国说的 → 转给伊拉克
	} else {
		c.Usa.GetMessage(message) // 伊拉克说的 → 转给美国
	}
}

// 客户端
func main() {
	unsc := &UnitedNationsSecurityCouncil{}
	unsc.Usa = &USA{unsc}
	unsc.Iraq = &Iraq{unsc}
	unsc.Usa.Declare("不准研制核武器，否则要发动战争！")
	// 伊拉克获得对方信息：不准研制核武器，否则要发动战争！
	unsc.Iraq.Declare("我们没有核武器，也不怕侵略。")
	// 美国获得对方信息：我们没有核武器，也不怕侵略。
}`,
  compare: [
    { id: 'facade', text: '外观是**单向**的：客户端通过外观调用子系统，子系统并不知道外观；中介者是**双向**的：同事们通过中介者**互相**通信，中介者也认识每个同事。' },
    { id: 'observer', text: '观察者是一个主题**广播**给一群订阅者；中介者是一群**平等的同事**通过中心互相协调，消息转给谁由中介者的规则决定。' },
  ],
  quiz: [
    { q: '一个注册对话框里：选了“省份”要刷新“城市”下拉框，勾选“同意协议”后“提交”按钮才可点，填了手机号要显示“发送验证码”……控件之间互相牵连。你把它改成：每个控件只通知对话框，由对话框统一决定其他控件怎么变。', why: '控件（同事）之间不直接引用，由对话框（中介者）集中协调。' },
    { q: '聊天室里的用户不直接互相持有引用，发消息时都交给聊天室，由聊天室决定转发给谁（私聊、群发、屏蔽黑名单）；新增一个用户时，其他用户的代码完全不用改。' },
  ],

  nodes: {
    /* ---- 场景一：世界 ---- */
    us: { kind: 'box', icon: '🗽', label: '美国', x: 500, y: 95, tone: 'blue', shape: 'pill' },
    iq: { kind: 'box', icon: '🛢️', label: '伊拉克', x: 760, y: 195, tone: 'orange', shape: 'pill' },
    uk: { kind: 'box', icon: '💂', label: '英国', x: 760, y: 405, tone: 'red', shape: 'pill' },
    fr: { kind: 'box', icon: '🗼', label: '法国', x: 240, y: 405, tone: 'purple', shape: 'pill' },
    ru: { kind: 'box', icon: '🐻', label: '俄罗斯', x: 240, y: 195, tone: 'teal', shape: 'pill' },
    nw: { kind: 'box', icon: '🏳️', label: '新成员国', x: 500, y: 505, tone: 'gray', shape: 'pill', badge: 'NEW' },
    un: { kind: 'box', icon: '🕊️', label: '联合国', sub: '中介者', x: 500, y: 300, tone: 'indigo', size: 'lg' },
    xiaocai: { kind: 'actor', icon: '👨‍💻', label: '小菜', x: 100, y: 490, tone: 'blue', size: 'sm' },
    dabird: { kind: 'actor', icon: '👨‍🏫', label: '大鸟', x: 900, y: 490, tone: 'purple', size: 'sm' },
    tipCount: { kind: 'text', text: '网状：6 国要 **15** 条线 · 星状：只要 **6** 条', x: 800, y: 510, tone: 'green', size: 'sm' },

    /* ---- 场景二：代码结构 ---- */
    m_un: {
      kind: 'class', title: 'UnitedNations', stereo: 'abstract', sub: '联合国（抽象中介者）', x: 500, y: 88, tone: 'indigo',
      lines: ['+ declare(message, colleague)'],
    },
    m_sc: {
      kind: 'class', title: 'UnitedNationsSecurityCouncil', sub: '联合国安理会（具体中介者）', x: 500, y: 280, tone: 'indigo',
      lines: ['- usa: USA', '- iraq: Iraq', '+ declare(msg, colleague):', '   美国说的 → 转给伊拉克', '   伊拉克说的 → 转给美国'],
    },
    m_country: {
      kind: 'class', title: 'Country', stereo: 'abstract', sub: '国家（抽象同事）', x: 500, y: 482, tone: 'gray',
      lines: ['# mediator: UnitedNations'],
    },
    m_usa: { kind: 'class', title: 'USA', sub: '美国（具体同事）', x: 150, y: 280, tone: 'blue', lines: ['+ declare(message)', '+ getMessage(message)'] },
    m_iraq: { kind: 'class', title: 'Iraq', sub: '伊拉克（具体同事）', x: 850, y: 280, tone: 'orange', lines: ['+ declare(message)', '+ getMessage(message)'] },
  },
  links: {
    /* 网状：5 国两两相连 = 10 条 */
    a1: { from: 'us', to: 'iq', kind: 'line', tone: 'red' },
    a2: { from: 'us', to: 'uk', kind: 'line', tone: 'red' },
    a3: { from: 'us', to: 'fr', kind: 'line', tone: 'red' },
    a4: { from: 'us', to: 'ru', kind: 'line', tone: 'red' },
    a5: { from: 'iq', to: 'uk', kind: 'line', tone: 'red' },
    a6: { from: 'iq', to: 'fr', kind: 'line', tone: 'red' },
    a7: { from: 'iq', to: 'ru', kind: 'line', tone: 'red' },
    a8: { from: 'uk', to: 'fr', kind: 'line', tone: 'red' },
    a9: { from: 'uk', to: 'ru', kind: 'line', tone: 'red' },
    a10: { from: 'fr', to: 'ru', kind: 'line', tone: 'red' },
    /* 星状：都只连联合国 */
    s1: { from: 'us', to: 'un', kind: 'line', tone: 'indigo' },
    s2: { from: 'iq', to: 'un', kind: 'line', tone: 'indigo' },
    s3: { from: 'uk', to: 'un', kind: 'line', tone: 'indigo' },
    s4: { from: 'fr', to: 'un', kind: 'line', tone: 'indigo' },
    s5: { from: 'ru', to: 'un', kind: 'line', tone: 'indigo' },
    s6: { from: 'nw', to: 'un', kind: 'line', tone: 'indigo' },
    /* 代码结构 */
    l_sc: { from: 'm_sc', to: 'm_un', kind: 'inherit' },
    l_usa: { from: 'm_usa', to: 'm_country', kind: 'inherit' },
    l_iraq: { from: 'm_iraq', to: 'm_country', kind: 'inherit' },
    l_us_sc: { from: 'm_usa', to: 'm_sc', kind: 'line', tone: 'indigo' },
    l_sc_iq: { from: 'm_sc', to: 'm_iraq', kind: 'line', tone: 'indigo' },
  },

  frames: [
    {
      title: '国与国：一团乱麻',
      text: '小菜看国际新闻直犯晕：美国、伊拉克、英国、法国、俄罗斯……**每个国家都要和其他所有国家直接打交道**。5 个国家两两之间，就有 **10 条**关系线，像一团乱麻。',
      show: ['us', 'iq', 'uk', 'fr', 'ru', 'xiaocai', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'a10'],
      bubbles: [{ node: 'xiaocai', text: '这关系也太**乱**了吧！', side: 'top' }],
    },
    {
      title: '牵一发而动全身',
      text: '更麻烦的是：美国想调整政策，就得**分别**去通知、说服另外 4 个国家；任何一个国家变了，都可能牵动所有人。对象之间**互相引用、互相依赖**，谁也改不动谁。',
      focus: ['us', 'a1', 'a2', 'a3', 'a4'],
      flows: [
        { from: 'us', to: 'iq', label: '📢', step: 0 },
        { from: 'us', to: 'uk', label: '📢', step: 0 },
        { from: 'us', to: 'fr', label: '📢', step: 0 },
        { from: 'us', to: 'ru', label: '📢', step: 0 },
      ],
      bubbles: [{ node: 'us', text: '我要改政策，得挨个通知……', side: 'right' }],
    },
    {
      title: '大鸟：找个中间人',
      text: '大鸟说：现实里不就有个**联合国**吗？各国有事都**先找联合国**，由它来协调、转达。国家之间不再直接拉扯，**网状**关系一下子变成了以联合国为中心的**星状**。',
      hide: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'a10'],
      show: ['un', 's1', 's2', 's3', 's4', 's5', 'dabird'],
      focus: ['un', 'us', 'iq', 's1', 's2'],
      flows: [
        { from: 'us', to: 'un', label: '📢 声明' },
        { from: 'un', to: 'iq', label: '转达' },
      ],
      bubbles: [{ node: 'dabird', text: '有事找**联合国**！', side: 'top' }],
    },
    {
      title: '新国家加入：只连一条',
      text: '再来一个新成员国：网状结构下，它要和 5 个国家**各连一条线**，总数涨到 15 条；星状结构下，它只要**认识联合国**就够了。多对多变成了**一对多**，复杂度一下子降下来。',
      hide: ['xiaocai', 'dabird'],
      show: ['nw', 's6', 'tipCount'],
      focus: ['nw', 's6', 'un', 'tipCount'],
      flows: [{ from: 'nw', to: 'un', label: '你好，联合国' }],
    },
    {
      title: '抽象中介者：联合国',
      text: '落到代码上。先定义**抽象中介者**——联合国 `UnitedNations`。它只有一个方法 `declare(message, colleague)`，意思是：“某个成员国发表了一段声明，请你**转达**。”',
      clear: true,
      show: ['m_un'],
      focus: ['m_un'],
    },
    {
      title: '同事：国家只认识联合国',
      text: '再定义**抽象同事**——国家 `Country`。关键在构造函数：每个国家都**持有一个联合国的引用**。美国 `USA`、伊拉克 `Iraq` 继承它；要说话时就调用 `mediator.declare(...)`，**谁也不直接找谁**。',
      show: ['m_country', 'm_usa', 'm_iraq', 'l_usa', 'l_iraq'],
      set: { m_country: { lines: ['!# mediator: UnitedNations'] } },
      focus: ['m_country', 'm_usa', 'm_iraq', 'l_usa', 'l_iraq'],
    },
    {
      title: '具体中介者：安理会',
      text: '**具体中介者**是联合国安理会 `UnitedNationsSecurityCouncil`。它**认识所有成员国**（手里有美国和伊拉克），`declare()` 里写着协调规则：美国说的转给伊拉克，伊拉克说的转给美国。',
      show: ['m_sc', 'l_sc', 'l_us_sc', 'l_sc_iq'],
      set: { m_country: { lines: ['# mediator: UnitedNations'] } },
      focus: ['m_sc', 'l_sc', 'l_us_sc', 'l_sc_iq', 'm_un'],
    },
    {
      title: '美国发表声明',
      text: '跑一遍：美国发表声明“**不准研制核武器，否则要发动战争！**”它并不直接找伊拉克，而是交给安理会；安理会一看是美国说的，就调用 `iraq.getMessage()` **转达**给伊拉克。',
      set: {
        m_sc: { lines: ['- usa: USA', '- iraq: Iraq', '+ declare(msg, colleague):', '!   美国说的 → 转给伊拉克', '   伊拉克说的 → 转给美国'] },
        m_usa: { lines: ['!+ declare(message)', '+ getMessage(message)'] },
        m_iraq: { lines: ['+ declare(message)', '!+ getMessage(message)'] },
      },
      focus: ['m_usa', 'm_sc', 'm_iraq'],
      flows: [
        { from: 'm_usa', to: 'm_sc', label: '📢 declare(msg)' },
        { from: 'm_sc', to: 'm_iraq', label: 'getMessage(msg)' },
      ],
      bubbles: [
        { node: 'm_usa', text: '不准研制核武器，否则要**发动战争**！', side: 'top' },
        { node: 'm_iraq', text: '伊拉克收到美国的声明', side: 'top', step: 1 },
      ],
    },
    {
      title: '伊拉克回应',
      text: '伊拉克回应：“**我们没有核武器，也不怕侵略。**”同样交给安理会，由安理会转给美国。两国你来我往吵了一架，却**从头到尾没直接说过一句话**。',
      set: {
        m_sc: { lines: ['- usa: USA', '- iraq: Iraq', '+ declare(msg, colleague):', '   美国说的 → 转给伊拉克', '!   伊拉克说的 → 转给美国'] },
        m_usa: { lines: ['+ declare(message)', '!+ getMessage(message)'] },
        m_iraq: { lines: ['!+ declare(message)', '+ getMessage(message)'] },
      },
      focus: ['m_usa', 'm_sc', 'm_iraq'],
      flows: [
        { from: 'm_iraq', to: 'm_sc', label: '📢 declare(msg)' },
        { from: 'm_sc', to: 'm_usa', label: 'getMessage(msg)' },
      ],
      bubbles: [
        { node: 'm_iraq', text: '我们**没有核武器**，也不怕侵略。', side: 'top' },
        { node: 'm_usa', text: '美国收到伊拉克的回应', side: 'top', step: 1 },
      ],
    },
    {
      title: '好处：同事互不认识',
      text: '这就是好处：`USA` 类里**没有一行**提到伊拉克，`Iraq` 类里也没有美国。同事之间**解耦**了，各自可以独立修改、复用；原来的**多对多**，变成了每个国家只对联合国的**一对多**。',
      set: {
        m_sc: { lines: ['- usa: USA', '- iraq: Iraq', '+ declare(msg, colleague):', '   美国说的 → 转给伊拉克', '   伊拉克说的 → 转给美国'] },
        m_usa: { lines: ['+ declare(message)', '+ getMessage(message)'] },
        m_iraq: { lines: ['+ declare(message)', '+ getMessage(message)'] },
        m_country: { lines: ['!# mediator: UnitedNations'] },
      },
      focus: ['m_usa', 'm_iraq', 'm_country', 'l_usa', 'l_iraq'],
      bubbles: [
        { node: 'm_usa', text: '伊拉克？**不认识**，我只认识联合国', side: 'top' },
        { node: 'm_iraq', text: '我也只认识**联合国**', side: 'top', delay: 0.6 },
      ],
    },
    {
      title: '代价：中介者会变“胖”',
      text: '代价也很明显：所有交互规则都**集中到中介者身上**。成员国越多、关系越复杂，安理会的 `declare()` 就越庞大，最后可能比任何一个国家都复杂。所以它适合：一组对象**通信方式明确、但关系复杂**的场景，别滥用。',
      set: {
        m_country: { lines: ['# mediator: UnitedNations'] },
        m_sc: {
          badge: '越来越复杂',
          lines: ['- usa, iraq, uk, france, russia …', '+ declare(msg, colleague):', '   美国说的 → 转给伊拉克', '   伊拉克说的 → 转给美国', '!   英国说的 → 转给谁？', '!   法国说的 → 看情况……', '!   …… 规则越堆越多'],
        },
      },
      focus: ['m_sc'],
    },
    {
      title: '总结：中介者模式',
      text: '中介者模式两组角色：**Mediator**（中介者：联合国、安理会）负责协调；**Colleague**（同事：各个国家）只认识中介者，彼此不直接说话。一句话记住：**网状变星状，有事找中介。**',
      set: {
        m_sc: { badge: '', lines: ['- usa: USA', '- iraq: Iraq', '+ declare(msg, colleague):', '   美国说的 → 转给伊拉克', '   伊拉克说的 → 转给美国'] },
      },
      focus: ['m_un', 'm_sc', 'm_country', 'l_sc', 'l_us_sc', 'l_sc_iq'],
      bubbles: [
        { node: 'm_un', text: '有事找我，**我来协调**', side: 'right' },
        { node: 'm_country', text: '我只认识**中介者**', side: 'right', delay: 0.5 },
      ],
    },
  ],
});
