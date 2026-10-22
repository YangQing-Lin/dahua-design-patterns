DP.register({
  id: 'state',
  order: 16,
  type: 'behavioral',
  name: '状态模式',
  en: 'State',
  emoji: '🌗',
  chapter: '第 16 章 · 无尽加班何时休',
  mnemonic: '状态各管一段，到点自己交班',
  summary: '把每种状态的行为和“下一站去哪”各自装进一个状态类，替代一长串 if/else。',
  intent: '当一个对象的内在状态改变时允许改变其行为，这个对象看起来像是改变了其类。',
  story: '小菜连续**加班**，一天里的状态不停变化：上午精神百倍，中午犯困，下午还行，傍晚疲累，深夜睡着；活干完了才能下班。他用一个大方法 `writeProgram()` 加一长串 `if/else` 来描述，大鸟说这是“**方法过长**”的坏味道，教他把**每种状态写成一个类**，由状态自己决定何时**交班**给下一个状态。',
  analogy: '红绿灯：同一个路口，红灯时让车停、绿灯时放行、黄灯时提醒减速。每种灯色只管自己的规则，并且**自己决定**多少秒后切到下一种颜色，路口本身不需要写一堆判断。',
  when: [
    '一个对象的**行为取决于它的状态**，并且要在运行时随状态改变',
    '代码里有庞大的、按状态分支的 `if/else` 或 `switch`',
    '状态之间的**转换规则**复杂，希望每种状态的逻辑各自独立',
  ],
  pros: ['每种状态的行为**局部化**在自己的类里，一目了然', '消除庞大的条件分支，符合单一职责', '新增或修改某个状态，基本不影响其他状态'],
  cons: ['状态类数量增多', '状态之间互相知道“下一个是谁”，存在一定耦合', '状态很少、很简单时用它反而啰嗦'],
  keyPoints: [
    '三个角色：**Context**（上下文 `Work`，持有当前状态）、**State**（抽象状态）、**ConcreteState**（各个具体状态）',
    '上下文自己**不做判断**，只把请求委托给当前状态：`current.writeProgram(this)`',
    '状态转换写在**状态类内部**：处理不了就 `w.setState(下一个状态)`，再让 `w.writeProgram()` 重新执行',
  ],
  code: `
abstract class State {                              // 抽象状态
    public abstract void writeProgram(Work w);
}
class Work {                                        // 上下文
    private State current = new ForenoonState();    // 初始：上午
    private int hour;
    private boolean finished;
    public void writeProgram() { current.writeProgram(this); }   // 交给当前状态
    public void setState(State s) { current = s; }
    public int getHour() { return hour; }
    public void setHour(int h) { hour = h; }
    public boolean isFinished() { return finished; }
    public void setFinished(boolean f) { finished = f; }
}
class ForenoonState extends State {
    public void writeProgram(Work w) {
        if (w.getHour() < 12) System.out.println(w.getHour() + "点 上午工作，精神百倍");
        else { w.setState(new NoonState()); w.writeProgram(); }   // 交班
    }
}
class NoonState extends State {
    public void writeProgram(Work w) {
        if (w.getHour() < 13) System.out.println(w.getHour() + "点 饿了，午饭；犯困，午休");
        else { w.setState(new AfternoonState()); w.writeProgram(); }
    }
}
// AfternoonState 同理：17 点前“下午状态还不错，继续努力”，否则交给 EveningState
class EveningState extends State {
    public void writeProgram(Work w) {
        if (w.isFinished()) { w.setState(new RestState()); w.writeProgram(); }
        else if (w.getHour() < 21) System.out.println(w.getHour() + "点 加班哦，疲累之极");
        else { w.setState(new SleepingState()); w.writeProgram(); }
    }
}
class SleepingState extends State {
    public void writeProgram(Work w) { System.out.println(w.getHour() + "点 不行了，睡着了"); }
}
class RestState extends State {
    public void writeProgram(Work w) { System.out.println(w.getHour() + "点 下班回家了"); }
}
// 客户端
Work project = new Work();
project.setHour(9);  project.writeProgram();   // 上午工作，精神百倍
project.setHour(14); project.writeProgram();   // 上午→中午→下午：状态还不错`,
  codePython: `
from abc import ABC, abstractmethod

class State(ABC):                           # 抽象状态
    @abstractmethod
    def write_program(self, work: "Work"): ...

class Work:                                 # 上下文
    def __init__(self):
        self.state, self.hour, self.finished = ForenoonState(), 0, False  # 初始：上午

    def write_program(self):                # 交给当前状态
        self.state.write_program(self)

    def hand_off(self, state: State):       # 交班：换状态，再执行一次
        self.state = state
        self.write_program()

class ForenoonState(State):
    def write_program(self, w):
        if w.hour < 12:
            print(f"{w.hour}点 上午工作，精神百倍")
        else:
            w.hand_off(NoonState())

class NoonState(State):
    def write_program(self, w):
        if w.hour < 13:
            print(f"{w.hour}点 饿了，午饭；犯困，午休")
        else:
            w.hand_off(AfternoonState())

class AfternoonState(State):
    def write_program(self, w):
        if w.hour < 17:
            print(f"{w.hour}点 下午状态还不错，继续努力")
        else:
            w.hand_off(EveningState())

class EveningState(State):
    def write_program(self, w):
        if w.finished:
            w.hand_off(RestState())
        elif w.hour < 21:
            print(f"{w.hour}点 加班哦，疲累之极")
        else:
            w.hand_off(SleepingState())

class SleepingState(State):
    def write_program(self, w): print(f"{w.hour}点 不行了，睡着了")

class RestState(State):
    def write_program(self, w): print(f"{w.hour}点 下班回家了")

if __name__ == "__main__":                  # 客户端
    project = Work()
    for project.hour in (9, 14, 22):        # 依次改钟点（相当于 Java 的 setHour）
        project.write_program()   # 9点 上午工作，精神百倍 / 14点 下午状态还不错，继续努力 / 22点 不行了，睡着了
    done = Work()
    done.hour, done.finished = 19, True
    done.write_program()                    # 19点 下班回家了`,
  codeGo: `
package main

import "fmt"

type State interface{ WriteProgram(w *Work) } // 抽象状态：Go 用接口表达

type Work struct { // 上下文
	state    State
	hour     int
	finished bool
}

func (w *Work) WriteProgram() { w.state.WriteProgram(w) } // 交给当前状态

func (w *Work) say(s string) { fmt.Println(fmt.Sprint(w.hour) + "点 " + s) }

func (w *Work) handoff(next State) { w.state = next; w.WriteProgram() } // 交班

type ForenoonState struct{}

func (ForenoonState) WriteProgram(w *Work) {
	if w.hour < 12 {
		w.say("上午工作，精神百倍")
	} else {
		w.handoff(NoonState{})
	}
}

type NoonState struct{}

func (NoonState) WriteProgram(w *Work) {
	if w.hour < 13 {
		w.say("饿了，午饭；犯困，午休")
	} else {
		w.handoff(AfternoonState{})
	}
}

type AfternoonState struct{}

func (AfternoonState) WriteProgram(w *Work) {
	if w.hour < 17 {
		w.say("下午状态还不错，继续努力")
	} else {
		w.handoff(EveningState{})
	}
}

type EveningState struct{}

func (EveningState) WriteProgram(w *Work) {
	if w.finished {
		w.handoff(RestState{})
	} else if w.hour < 21 {
		w.say("加班哦，疲累之极")
	} else {
		w.handoff(SleepingState{})
	}
}

type SleepingState struct{}

func (SleepingState) WriteProgram(w *Work) { w.say("不行了，睡着了") }

type RestState struct{}

func (RestState) WriteProgram(w *Work) { w.say("下班回家了") }

// 客户端：初始状态是上午
func main() {
	project := &Work{state: ForenoonState{}}
	for _, h := range []int{9, 14, 22} {
		project.hour = h
		project.WriteProgram()
	}
	// 9点 上午工作，精神百倍 / 14点 下午状态还不错，继续努力（自动交班）/ 22点 不行了，睡着了
	done := &Work{state: ForenoonState{}, hour: 19, finished: true}
	done.WriteProgram() // 19点 下班回家了
}`,
  compare: [
    { id: 'strategy', text: '结构几乎一样！策略由**客户端主动选**用哪个算法；状态模式里由**状态自己决定**何时切换到下一个状态，客户端只管调用。' },
    { id: 'chain-of-responsibility', text: '都像在“往下交”。职责链是**一个请求**在多个处理者之间传递，找到能处理的就停；状态模式是**一个对象自身**的状态在变，行为跟着变。' },
  ],
  quiz: [
    { q: '自动售货机：没投币时按按钮没反应，投币后可以选商品，售罄时自动退币。同一个按钮在不同情况下反应完全不同，而且出货后机器会自动回到“等待投币”。', why: '行为取决于内部状态，且状态会自己切换——每种情况写成一个类。' },
    { q: '订单有“待支付 / 已支付 / 已发货 / 已完成”几个阶段，同样调用 cancel()，在不同阶段的处理完全不同；原来写成了一大串 if/else，每加一个阶段都要改它。' },
  ],

  nodes: {
    // —— 场景一：加班 ——
    xc: { kind: 'actor', icon: '👨‍💻', label: '小菜', sub: '又在加班……', x: 330, y: 250, tone: 'blue', size: 'lg' },
    db: { kind: 'actor', icon: '🧔', label: '大鸟', x: 690, y: 250, tone: 'orange', size: 'lg' },

    // —— 场景二：一天的状态 ——
    d1: { kind: 'box', icon: '☀️', label: '上午', sub: '精神百倍', x: 160, y: 190, tone: 'yellow' },
    d2: { kind: 'box', icon: '🍚', label: '中午', sub: '吃饭、犯困午休', x: 460, y: 190, tone: 'orange' },
    d3: { kind: 'box', icon: '💪', label: '下午', sub: '状态不错', x: 770, y: 190, tone: 'green' },
    d4: { kind: 'box', icon: '😩', label: '傍晚', sub: '加班，疲累', x: 770, y: 340, tone: 'purple' },
    d5: { kind: 'box', icon: '😴', label: '深夜', sub: '睡着了', x: 460, y: 340, tone: 'indigo' },
    d6: { kind: 'box', icon: '🏠', label: '下班回家', sub: '活干完了', x: 770, y: 480, tone: 'teal' },

    // —— 场景三：小菜的第一版 ——
    bad: {
      kind: 'class', title: 'Work', sub: '小菜的第一版', x: 500, y: 280, tone: 'red',
      lines: ['writeProgram() {', '  if (hour < 12)      上午，精神百倍', '  else if (hour < 13) 中午，午饭午休', '  else if (hour < 17) 下午，状态不错', '  else if (finished)  下班回家', '  else if (hour < 21) 加班，疲累之极', '  else                睡着了', '}'],
    },

    // —— 场景四：状态模式 ——
    clock: { kind: 'box', icon: '🕘', label: '9 点', sub: 'hour', x: 90, y: 135, tone: 'yellow', size: 'lg' },
    work: { kind: 'class', title: 'Work', sub: '工作（上下文）', x: 300, y: 135, tone: 'indigo', lines: ['- hour: int', '- finished: boolean', '- current: State', '+ writeProgram()', '+ setState(State s)'] },
    state: { kind: 'class', title: 'State', stereo: 'abstract', sub: '状态', x: 730, y: 120, tone: 'purple', lines: ['+ writeProgram(Work w)'] },
    zone: { kind: 'zone', label: '具体状态（都继承 State）', x: 500, y: 400, w: 930, h: 270, tone: 'gray' },
    s1: { kind: 'class', title: 'ForenoonState', sub: '上午 · 精神百倍', x: 150, y: 350, tone: 'yellow' },
    s2: { kind: 'class', title: 'NoonState', sub: '中午 · 午饭午休', x: 370, y: 350, tone: 'orange' },
    s3: { kind: 'class', title: 'AfternoonState', sub: '下午 · 继续努力', x: 600, y: 350, tone: 'green' },
    s4: { kind: 'class', title: 'EveningState', sub: '傍晚 · 加班疲累', x: 840, y: 350, tone: 'purple' },
    s5: { kind: 'class', title: 'RestState', sub: '下班回家', x: 560, y: 465, tone: 'teal' },
    s6: { kind: 'class', title: 'SleepingState', sub: '深夜 · 睡着了', x: 840, y: 465, tone: 'indigo' },
    ptr: { kind: 'box', shape: 'chip', icon: '📍', label: '当前', x: 150, y: 300, tone: 'red' },
  },
  links: {
    t12: { from: 'd1', to: 'd2', kind: 'arrow', label: '12点', labelDy: -12 },
    t23: { from: 'd2', to: 'd3', kind: 'arrow', label: '13点', labelDy: -12 },
    t34: { from: 'd3', to: 'd4', kind: 'arrow', label: '17点', labelDx: 26 },
    t45: { from: 'd4', to: 'd5', kind: 'arrow', label: '21点', labelDy: -12 },
    t46: { from: 'd4', to: 'd6', kind: 'arrow', label: '干完了', labelDx: 30 },

    l_ws: { from: 'work', to: 'state', kind: 'aggregate', label: '持有当前状态', labelDy: -12 },
    l_zs: { from: 'zone', to: 'state', kind: 'inherit' },
    a12: { from: 's1', to: 's2', kind: 'dashed', label: '12点后', labelDy: -11 },
    a23: { from: 's2', to: 's3', kind: 'dashed', label: '13点后', labelDy: -11 },
    a34: { from: 's3', to: 's4', kind: 'dashed', label: '17点后', labelDy: -11 },
    a45: { from: 's4', to: 's5', kind: 'dashed', label: '干完了', labelDy: -12 },
    a46: { from: 's4', to: 's6', kind: 'dashed', label: '21点后', labelDx: 30 },
  },

  frames: [
    {
      title: '无尽加班何时休',
      text: '项目上线前，小菜天天**加班**到深夜。大鸟问他：你这一天的**工作状态**，是不是一直在变？小菜苦笑：上午精神百倍，中午犯困，下午还行，晚上就累趴了。',
      show: ['xc', 'db'],
      bubbles: [
        { node: 'xc', text: '又要加班到半夜了……😩', side: 'top' },
        { node: 'db', text: '你一天里的**状态**变了好几回吧？', side: 'top', delay: 0.7 },
      ],
    },
    {
      title: '状态随时间变化',
      text: '把小菜的一天画出来：**上午**精神百倍 → **中午**吃饭犯困 → **下午**状态不错 → **傍晚**加班疲累 → **深夜**睡着；要是活儿干完了，就**下班回家**。同一个人写程序，**表现完全取决于当前状态**。',
      clear: true,
      show: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 't12', 't23', 't34', 't45', 't46'],
      flows: [
        { from: 'd1', to: 'd2', icon: '🕛' },
        { from: 'd2', to: 'd3', icon: '🕐' },
        { from: 'd3', to: 'd4', icon: '🕔' },
        { from: 'd4', to: 'd5', icon: '🕘' },
      ],
    },
    {
      title: '小菜的第一版：一个大方法',
      text: '小菜把它写成 `Work` 类的 `writeProgram()`：根据钟点 `hour` 和是否完成 `finished`，用一长串 `if/else` 判断该输出什么。能跑，但所有状态的逻辑**都挤在一个方法里**。',
      clear: true,
      show: ['bad'],
      focus: ['bad'],
    },
    {
      title: '坏味道：方法过长',
      text: '大鸟一眼看出坏味道：**方法过长**。一个方法管了所有时段，违背单一职责；老板要是规定“**20 点前必须下班**”，又得钻进这个大方法改判断，违背开放-封闭。分支越多，越不敢动。',
      set: { bad: { strike: true, badge: '方法过长' } },
      bubbles: [
        { node: 'bad', text: '所有时段**挤在一起**', side: 'left' },
        { node: 'bad', text: '20 点前必须下班？\n又得**改这里**', side: 'right', delay: 0.6 },
      ],
    },
    {
      title: '抽象出“状态”',
      text: '大鸟的思路：**把每种状态的判断逻辑，分散到各自的类里**。先定义抽象状态 `State`，只有一个方法 `writeProgram(Work w)`：每个状态都要回答“这个钟点，我该怎么写程序”。',
      clear: true,
      show: ['state'],
      focus: ['state'],
    },
    {
      title: '上下文：Work',
      text: '工作类 `Work` 成了**上下文**：它记着钟点 `hour`、是否完成 `finished`，还**持有一个当前状态** `current`。它的 `writeProgram()` 里不再有任何判断，**直接交给当前状态去处理**。',
      show: ['work', 'l_ws'],
      focus: ['work', 'l_ws'],
    },
    {
      title: '每个时段一个状态类',
      text: '再把每个时段写成一个**具体状态类**：上午 `ForenoonState`、中午 `NoonState`、下午、傍晚，外加睡着 `SleepingState`、下班 `RestState`。它们**都继承** `State`，每个类只管**一个时段**。',
      show: ['zone', 'l_zs', 's1', 's2', 's3', 's4', 's5', 's6'],
      focus: ['l_zs', 's1', 's2', 's3', 's4', 's5', 's6'],
    },
    {
      title: '下一站由状态自己定',
      text: '关键在这里：每个状态**只管自己的时段**。上午状态：12 点前就干活，过了 12 点就 `w.setState(new NoonState())`，把 `Work` 交给下一个状态。**转换规则写在状态里，不在 Work 里。**',
      show: ['a12', 'a23', 'a34', 'a45', 'a46'],
      set: {
        s1: { lines: ['!if (hour < 12) 干活', 'else 交班给 Noon'] },
        s4: { lines: ['if (finished) → Rest', 'else if (hour < 21) 加班', 'else → Sleeping'] },
      },
      focus: ['s1', 's4', 'a12', 'a23', 'a34', 'a45', 'a46'],
    },
    {
      title: '9 点：上午状态处理',
      text: '跑起来。现在 **9 点**，`Work` 的当前状态是上午。调用 `writeProgram()`，`Work` 把自己传给 `ForenoonState`：9 点在它的时段内，输出“**上午工作，精神百倍**”。',
      show: ['clock', 'ptr'],
      set: {
        s1: { lines: [] }, s4: { lines: [] },
        work: { lines: ['- hour = 9', '- finished = false', '- current = 上午', '!+ writeProgram()', '+ setState(State s)'] },
      },
      focus: ['clock', 'work', 's1', 'ptr'],
      flows: [
        { from: 'work', to: 's1', label: 'writeProgram(this)' },
      ],
      bubbles: [
        { node: 's1', text: '9点：上午工作，**精神百倍**', side: 'bottom', step: 0 },
      ],
    },
    {
      title: '14 点：一路交班到下午',
      text: '时间到了 **14 点**，当前状态还是上午。上午状态一看：不归我管，**切到中午**并让 Work 再执行一次；中午状态也说不归我，**切到下午**；下午状态接手：“**状态不错，继续努力**”。',
      set: {
        clock: { label: '14 点' },
        work: { lines: ['- hour = 14', '- finished = false', '- current = 下午', '!+ writeProgram()', '!+ setState(State s)'] },
        ptr: { x: 600 },
      },
      focus: ['clock', 'work', 's1', 's2', 's3', 'ptr'],
      flowGap: 1.05,
      flows: [
        { from: 'work', to: 's1', label: 'writeProgram()' },
        { from: 's1', to: 'work', label: 'setState(中午)', tone: 'red' },
        { from: 'work', to: 's2', label: 'writeProgram()' },
        { from: 's2', to: 'work', label: 'setState(下午)', tone: 'red' },
        { from: 'work', to: 's3', label: 'writeProgram()' },
      ],
      bubbles: [
        { node: 's3', text: '14点：下午状态不错，**继续努力**', side: 'bottom', step: 4 },
      ],
    },
    {
      title: '22 点：加班到睡着',
      text: '傍晚还在加班，疲累之极。到了 **22 点**，活还没干完，当前的傍晚状态判断：过了 21 点，切到 `SleepingState`——“**不行了，睡着了**”。这些规则 `Work` 一概不知，全在状态里。',
      set: {
        clock: { label: '22 点', icon: '🕙' },
        work: { lines: ['- hour = 22', '- finished = false', '- current = 睡着', '!+ writeProgram()', '!+ setState(State s)'] },
        ptr: { x: 840, y: 515 },
      },
      focus: ['clock', 'work', 's4', 's6', 'ptr'],
      flows: [
        { from: 'work', to: 's4', label: 'writeProgram()' },
        { from: 's4', to: 'work', label: 'setState(睡着)', tone: 'red' },
        { from: 'work', to: 's6', label: 'writeProgram()' },
      ],
      bubbles: [
        { node: 's6', text: '不行了，**睡着了** 💤', side: 'left', step: 2 },
      ],
    },
    {
      title: '干完了：下班回家',
      text: '如果活干完了 `finished = true`，傍晚状态就切到 `RestState`：“**下班回家**”。老板新规“20 点前必须走”？只改 `EveningState` 的判断（或再加一个状态类），**其他状态一行不用动**。',
      set: {
        clock: { label: '19 点', icon: '🕖' },
        work: { lines: ['- hour = 19', '!- finished = true', '- current = 下班', '!+ writeProgram()', '+ setState(State s)'] },
        ptr: { x: 560, y: 515 },
        s4: { badge: '新规只改我' },
      },
      focus: ['clock', 'work', 's4', 's5', 'ptr'],
      flows: [
        { from: 'work', to: 's4', label: 'writeProgram()' },
        { from: 's4', to: 'work', label: 'setState(下班)', tone: 'red' },
        { from: 'work', to: 's5', label: 'writeProgram()' },
      ],
      bubbles: [
        { node: 's5', text: '活干完了，**下班回家**！🏠', side: 'left', step: 2 },
      ],
    },
    {
      title: '总结：状态模式',
      text: '状态模式：当一个对象的**行为取决于它的状态**、并且要在运行时跟着变时，把每种状态写成一个类，由**状态自己决定**何时切换到下一个。一句话记住：**状态各管一段，到点自己交班。**',
      hide: ['clock', 'ptr'],
      set: {
        s4: { badge: '' },
        work: { lines: ['- hour: int', '- finished: boolean', '- current: State', '+ writeProgram()', '+ setState(State s)'] },
      },
      focus: ['work', 'state', 'l_ws', 'l_zs', 's1', 's2', 's3', 's4', 's5', 's6'],
      bubbles: [
        { node: 'work', text: '我不判断，**交给当前状态**', side: 'right', dy: 40 },
        { node: 'state', text: '该换谁，**状态自己说了算**', side: 'bottom' },
      ],
    },
  ],
});
