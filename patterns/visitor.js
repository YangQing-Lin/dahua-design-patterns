DP.register({
  id: 'visitor',
  order: 28,
  type: 'behavioral',
  name: '访问者模式',
  en: 'Visitor',
  emoji: '👫',
  chapter: '第 28 章 · 男人和女人',
  mnemonic: '结构稳如山，操作随时添',
  summary: '元素种类固定不变时，把各种“操作”做成访问者类，新增操作只需新增一个访问者。',
  intent: '表示一个作用于某对象结构中的各元素的操作。它使你可以在不改变各元素的类的前提下定义作用于这些元素的新操作。',
  story: '小菜和大鸟聊起男人和女人的不同：“男人成功时，背后多半有一个伟大的女人；女人成功时，背后大多有一个不成功的男人。”失败、恋爱时也各有说法。小菜先用 if/else 写在男人类、女人类里，一加“结婚”两边都得改。大鸟指出：**人只有男女两种，很稳定；状态却越来越多**——把每种状态做成一个**访问者**，新增状态只加一个类。',
  analogy: '体检中心：来体检的永远是“成人”和“儿童”两类人（元素稳定），但检查项目经常新增——抽血、B 超、视力、心电图（操作常变）。每个检查科室（访问者）都知道“成人怎么查、儿童怎么查”，新开一个科室，不用改“人”。',
  when: [
    '对象结构中的**元素类型很稳定**，但经常要在它们上面**新增操作**',
    '一个操作对不同类型的元素要**做不同的事**，又不想在元素类里塞满 if/else',
    '想把相关的操作集中到一个类里，而不是散落在各个元素类中',
  ],
  pros: [
    '新增操作**只需新增一个访问者类**，元素类一行不改（开放-封闭）',
    '同一种操作的相关代码集中在一个访问者里',
    '把“数据结构”和“作用在它上面的操作”解耦',
  ],
  cons: [
    '**新增元素类型很难**：每个访问者都得加一个方法',
    '访问者常要访问元素内部数据，可能破坏封装',
    '结构较绕（双分派），**大多数时候用不到**',
  ],
  keyPoints: [
    '角色：**Visitor**（Action，对每种元素各有一个 visit 方法）、**ConcreteVisitor**（成功、失败、恋爱、结婚）、**Element**（Person，accept 方法）、**ConcreteElement**（Man、Woman）、**ObjectStructure**（管理元素集合）',
    '**双分派**：`man.accept(success)` 先按“人”的类型选中 Man 的 accept，再在里面调 `success.getManConclusion(this)` 按“状态”的类型选中具体结论',
    '书中原话：大多时候你并不需要访问者模式，但当一旦需要它时，那就是真的需要它了',
  ],
  code: `
// 访问者：状态。对男人、女人各给一个结论
abstract class Action {
    public abstract void getManConclusion(Man man);
    public abstract void getWomanConclusion(Woman woman);
}
class Success extends Action {
    public void getManConclusion(Man m)     { System.out.println("男人成功时，背后多半有一个伟大的女人。"); }
    public void getWomanConclusion(Woman w) { System.out.println("女人成功时，背后大多有一个不成功的男人。"); }
}
class Failing extends Action {
    public void getManConclusion(Man m)     { System.out.println("男人失败时，闷头喝酒，谁也不用劝。"); }
    public void getWomanConclusion(Woman w) { System.out.println("女人失败时，眼泪汪汪，谁也劝不了。"); }
}
class Amativeness extends Action { /* 恋爱：男人不懂也要装懂；女人懂也装作不懂 */ }
class Marriage extends Action {      // 新增“结婚”：只加这一个类
    public void getManConclusion(Man m)     { System.out.println("男人结婚时：恋爱游戏终结时，‘有妻徒刑’遥无期。"); }
    public void getWomanConclusion(Woman w) { System.out.println("女人结婚时：爱情长跑路漫漫，婚姻保险保平安。"); }
}
// 元素：人。只有男、女两种（稳定）
abstract class Person {
    public abstract void accept(Action visitor);
}
class Man extends Person {
    public void accept(Action visitor) { visitor.getManConclusion(this); }    // 双分派
}
class Woman extends Person {
    public void accept(Action visitor) { visitor.getWomanConclusion(this); }
}
// 对象结构：管理一群人，让访问者挨个访问
class ObjectStructure {
    private List<Person> elements = new ArrayList<>();
    public void attach(Person p) { elements.add(p); }
    public void detach(Person p) { elements.remove(p); }
    public void display(Action visitor) {
        for (Person p : elements) p.accept(visitor);
    }
}
// 客户端
ObjectStructure o = new ObjectStructure();
o.attach(new Man());
o.attach(new Woman());
o.display(new Success());
o.display(new Marriage());`,
  codePython: `
from abc import ABC, abstractmethod


# 访问者：状态。对男人、女人各给一个结论
class Action(ABC):
    @abstractmethod
    def get_man_conclusion(self, man: "Man"): ...
    @abstractmethod
    def get_woman_conclusion(self, woman: "Woman"): ...


class Success(Action):
    def get_man_conclusion(self, man): print("男人成功时，背后多半有一个伟大的女人。")
    def get_woman_conclusion(self, woman): print("女人成功时，背后大多有一个不成功的男人。")


class Failing(Action):
    def get_man_conclusion(self, man): print("男人失败时，闷头喝酒，谁也不用劝。")
    def get_woman_conclusion(self, woman): print("女人失败时，眼泪汪汪，谁也劝不了。")


class Marriage(Action):          # 新增“结婚”：只加这一个类，Man / Woman 不用改
    def get_man_conclusion(self, man): print("男人结婚时：恋爱游戏终结时，‘有妻徒刑’遥无期。")
    def get_woman_conclusion(self, woman): print("女人结婚时：爱情长跑路漫漫，婚姻保险保平安。")


# 元素：人。只有男、女两种（稳定）
class Person(ABC):
    @abstractmethod
    def accept(self, visitor: Action): ...


# 双分派：先按 Person 的类型进入 accept，再按 visitor 的类型调用对应方法
# （Python 没有方法重载，所以 get_man_ / get_woman_ 要用不同的名字）
class Man(Person):
    def accept(self, visitor): visitor.get_man_conclusion(self)


class Woman(Person):
    def accept(self, visitor): visitor.get_woman_conclusion(self)


# 对象结构：管理一群人，让访问者挨个访问
class ObjectStructure:
    def __init__(self):
        self.elements = []

    def attach(self, p): self.elements.append(p)
    def detach(self, p): self.elements.remove(p)

    def display(self, visitor):
        for p in self.elements:
            p.accept(visitor)

if __name__ == "__main__":
    o = ObjectStructure()
    o.attach(Man())
    o.attach(Woman())
    o.display(Success())    # 男人成功时…… / 女人成功时……
    o.display(Marriage())   # 男人结婚时…… / 女人结婚时……`,
  codeGo: `
package main

import "fmt"

// 元素：人。只有男、女两种（稳定）
type Person interface{ Accept(visitor Action) }

// 访问者：状态。对男人、女人各给一个结论
// Go 没有方法重载，所以要用 GetManConclusion / GetWomanConclusion 两个名字
type Action interface {
	GetManConclusion(man *Man)
	GetWomanConclusion(woman *Woman)
}

type Man struct{}
type Woman struct{}

// 双分派：先按 Person 的类型进入 Accept，再按 visitor 的类型调用对应方法
func (m *Man) Accept(visitor Action)   { visitor.GetManConclusion(m) }
func (w *Woman) Accept(visitor Action) { visitor.GetWomanConclusion(w) }

type Success struct{}

func (Success) GetManConclusion(*Man) {
	fmt.Println("男人成功时，背后多半有一个伟大的女人。")
}
func (Success) GetWomanConclusion(*Woman) {
	fmt.Println("女人成功时，背后大多有一个不成功的男人。")
}

type Failing struct{}

func (Failing) GetManConclusion(*Man) {
	fmt.Println("男人失败时，闷头喝酒，谁也不用劝。")
}
func (Failing) GetWomanConclusion(*Woman) {
	fmt.Println("女人失败时，眼泪汪汪，谁也劝不了。")
}

// 新增“结婚”：只加这一个类型，Man / Woman 不用改
type Marriage struct{}

func (Marriage) GetManConclusion(*Man) {
	fmt.Println("男人结婚时：恋爱游戏终结时，‘有妻徒刑’遥无期。")
}
func (Marriage) GetWomanConclusion(*Woman) {
	fmt.Println("女人结婚时：爱情长跑路漫漫，婚姻保险保平安。")
}

// 对象结构：管理一群人，让访问者挨个访问
type ObjectStructure struct{ elements []Person }

func (o *ObjectStructure) Attach(p Person) { o.elements = append(o.elements, p) }
func (o *ObjectStructure) Detach(p Person) {
	for i, e := range o.elements {
		if e == p {
			o.elements = append(o.elements[:i], o.elements[i+1:]...)
			return
		}
	}
}

func (o *ObjectStructure) Display(visitor Action) {
	for _, p := range o.elements {
		p.Accept(visitor)
	}
}

// 客户端
func main() {
	o := &ObjectStructure{}
	o.Attach(&Man{})
	o.Attach(&Woman{})
	o.Display(Success{})  // 男人成功时…… / 女人成功时……
	o.Display(Marriage{}) // 男人结婚时…… / 女人结婚时……
}`,
  compare: [
    { id: 'iterator', text: '迭代器只负责“**挨个走到**每个元素”；访问者负责“走到之后**对它做什么**”，而且按元素类型做不同的事。两者常一起用。' },
    { id: 'strategy', text: '策略是“一件事换一种算法”，和元素类型无关；访问者的每个操作要**按元素类型分别实现**（getManConclusion / getWomanConclusion），靠双分派选中。' },
  ],
  quiz: [
    { q: '编译器的语法树节点类型多年不变（变量、常量、加法、函数调用……），但经常要新增对整棵树的处理：类型检查、代码优化、生成代码、格式化输出。你希望每加一种处理都不用改节点类。', why: '元素（节点类型）稳定、操作常变，每种处理做成一个访问者——访问者模式。' },
    { q: '公司员工只有“正式工”和“实习生”两类，固定不变；HR 却经常要新增各种统计：算工资、算假期、算绩效……每种统计对两类员工的算法都不同，希望新增统计时只写一个新类。' },
  ],

  nodes: {
    /* ---- 场景一：男人和女人 ---- */
    man_a: { kind: 'actor', icon: '👨', label: '男人', x: 300, y: 290, tone: 'blue' },
    woman_a: { kind: 'actor', icon: '👩', label: '女人', x: 700, y: 290, tone: 'pink' },
    st_succ: { kind: 'box', icon: '🏆', label: '成功', shape: 'chip', x: 500, y: 140, tone: 'yellow' },
    st_fail: { kind: 'box', icon: '😞', label: '失败', shape: 'chip', x: 580, y: 120, tone: 'gray' },
    st_love: { kind: 'box', icon: '💕', label: '恋爱', shape: 'chip', x: 780, y: 120, tone: 'red' },
    c_ms: { kind: 'box', shape: 'note', size: 'sm', w: 170, label: '背后多半有一个伟大的女人', x: 380, y: 240 },
    c_ws: { kind: 'box', shape: 'note', size: 'sm', w: 170, label: '背后大多有一个不成功的男人', x: 380, y: 400 },
    c_mf: { kind: 'box', shape: 'note', size: 'sm', w: 170, label: '闷头喝酒，谁也不用劝', x: 580, y: 240 },
    c_wf: { kind: 'box', shape: 'note', size: 'sm', w: 170, label: '眼泪汪汪，谁也劝不了', x: 580, y: 400 },
    c_ml: { kind: 'box', shape: 'note', size: 'sm', w: 170, label: '凡事不懂也要装懂', x: 780, y: 240 },
    c_wl: { kind: 'box', shape: 'note', size: 'sm', w: 170, label: '遇事懂也装作不懂', x: 780, y: 400 },
    z_stable: { kind: 'zone', label: '稳定：只有男、女', x: 150, y: 320, w: 190, h: 290, tone: 'green' },
    z_change: { kind: 'zone', label: '变化：状态越来越多', x: 600, y: 115, w: 640, h: 84, tone: 'orange' },
    st_more: { kind: 'box', icon: '💍', label: '结婚？', shape: 'chip', x: 930, y: 120, tone: 'orange', opacity: 0.6 },

    /* ---- 场景二：小菜的第一版 ---- */
    v1man: {
      kind: 'class', title: 'Man', sub: '小菜的第一版', x: 270, y: 290, tone: 'blue',
      lines: ['getConclusion() {', '  if (action == "成功") …', '  else if (action == "失败") …', '  else if (action == "恋爱") …', '}'],
    },
    v1woman: {
      kind: 'class', title: 'Woman', sub: '小菜的第一版', x: 730, y: 290, tone: 'pink',
      lines: ['getConclusion() {', '  if (action == "成功") …', '  else if (action == "失败") …', '  else if (action == "恋爱") …', '}'],
    },

    /* ---- 场景三：类结构 ---- */
    person: { kind: 'class', title: 'Person', stereo: 'abstract', sub: '人（元素）', x: 230, y: 108, tone: 'indigo', lines: ['+ accept(visitor)'] },
    woman: { kind: 'class', title: 'Woman', sub: '女人', x: 140, y: 265, tone: 'pink', lines: ['+ accept(v)'] },
    man: { kind: 'class', title: 'Man', sub: '男人', x: 320, y: 265, tone: 'blue', lines: ['+ accept(v)'] },
    action: {
      kind: 'class', title: 'Action', stereo: 'abstract', sub: '状态（访问者）', x: 690, y: 108, tone: 'purple',
      lines: ['+ getManConclusion(Man)', '+ getWomanConclusion(Woman)'],
    },
    succ: { kind: 'class', title: 'Success', sub: '成功', x: 500, y: 265, tone: 'yellow' },
    fail: { kind: 'class', title: 'Failing', sub: '失败', x: 640, y: 265, tone: 'gray' },
    love: { kind: 'class', title: 'Amativeness', sub: '恋爱', x: 785, y: 265, tone: 'red' },
    marry: { kind: 'class', title: 'Marriage', sub: '结婚', x: 925, y: 265, tone: 'orange', badge: 'NEW' },
    os: {
      kind: 'class', title: 'ObjectStructure', sub: '对象结构：一群人', x: 230, y: 445, tone: 'teal',
      lines: ['- elements: List<Person>', '+ attach(p) / detach(p)', '+ display(visitor)'],
    },
    client: { kind: 'actor', icon: '👨‍💻', label: '客户端', x: 560, y: 450, tone: 'gray', size: 'sm' },
    ghost: { kind: 'box', icon: '❓', label: '第三种“人”？', sub: '新增元素类型', shape: 'ghost', x: 520, y: 450, tone: 'red' },
    tip: { kind: 'text', text: 'Person、Man、Woman、ObjectStructure **一行没改**', x: 800, y: 515, tone: 'green', size: 'sm' },
  },
  links: {
    l_w: { from: 'woman', to: 'person', kind: 'inherit' },
    l_m: { from: 'man', to: 'person', kind: 'inherit' },
    l_s: { from: 'succ', to: 'action', kind: 'inherit' },
    l_f: { from: 'fail', to: 'action', kind: 'inherit' },
    l_l: { from: 'love', to: 'action', kind: 'inherit' },
    l_mr: { from: 'marry', to: 'action', kind: 'inherit' },
    l_os: { from: 'os', to: 'person', kind: 'aggregate', label: '一群人', labelAt: 0.3 },
    l_cl: { from: 'client', to: 'os', kind: 'assoc' },
  },

  frames: [
    {
      title: '男人和女人',
      text: '这一章叫“男人和女人”。小菜和大鸟聊起一组有趣的对比：**男人成功时，背后多半有一个伟大的女人；女人成功时，背后大多有一个不成功的男人。**同一件事“成功”，男人女人的结论完全不同。',
      show: ['man_a', 'woman_a', 'st_succ'],
      flows: [
        { from: 'st_succ', to: 'man_a', label: '成功', step: 0 },
        { from: 'st_succ', to: 'woman_a', label: '成功', step: 0 },
      ],
      bubbles: [
        { node: 'man_a', text: '背后多半有一个**伟大的女人**', side: 'bottom', step: 0 },
        { node: 'woman_a', text: '背后大多有一个**不成功的男人**', side: 'bottom', step: 0, delay: 0.5 },
      ],
    },
    {
      title: '人 × 状态 = 一张表',
      text: '再加上**失败**、**恋爱**：男人失败时闷头喝酒，谁也不用劝；女人失败时眼泪汪汪，谁也劝不了……排一排就是一张**表**：行是“人”（男、女），列是“状态”，每个格子是一句结论。',
      show: ['st_fail', 'st_love', 'c_ms', 'c_ws', 'c_mf', 'c_wf', 'c_ml', 'c_wl'],
      set: {
        man_a: { x: 150, y: 240, size: 'sm' },
        woman_a: { x: 150, y: 400, size: 'sm' },
        st_succ: { x: 380, y: 120 },
      },
      trans: 1.2,
    },
    {
      title: '小菜第一版：if/else',
      text: '小菜的第一版：男人类、女人类各写一个 `getConclusion()`，里面用 **if/else** 判断“成功、失败、恋爱”。大鸟说：再加个“**结婚**”试试？男人类要改，女人类也要改，if/else **越来越长**——违反了开放-封闭原则。',
      clear: true,
      show: ['v1man', 'v1woman'],
      set: {
        v1man: { badge: '加“结婚”要改', lines: ['getConclusion() {', '  if (action == "成功") …', '  else if (action == "失败") …', '  else if (action == "恋爱") …', '!  else if (action == "结婚") …', '}'] },
        v1woman: { badge: '这里也要改', lines: ['getConclusion() {', '  if (action == "成功") …', '  else if (action == "失败") …', '  else if (action == "恋爱") …', '!  else if (action == "结婚") …', '}'] },
      },
      focus: ['v1man', 'v1woman'],
    },
    {
      title: '大鸟：稳定的 vs 变化的',
      text: '大鸟点拨：回头看这张表，**行**只有男、女两种，几乎不会变——这是**稳定**的“元素”；**列**（状态）却会不断增加——这是**变化**的“操作”。那就把**每一列做成一个类**：新增状态 = 新增一个类。',
      clear: true,
      show: ['man_a', 'woman_a', 'st_succ', 'st_fail', 'st_love', 'c_ms', 'c_ws', 'c_mf', 'c_wf', 'c_ml', 'c_wl', 'z_stable', 'z_change', 'st_more'],
      focus: ['z_stable', 'z_change', 'man_a', 'woman_a', 'st_succ', 'st_fail', 'st_love', 'st_more'],
    },
    {
      title: '访问者：状态 Action',
      text: '每一列“状态”做成一个类，它们就是**访问者**。抽象类 `Action` 规定：对男人给一个结论 `getManConclusion(Man)`，对女人给一个结论 `getWomanConclusion(Woman)`。成功 `Success`、失败 `Failing`、恋爱 `Amativeness` 各自实现。',
      clear: true,
      show: ['action', 'succ', 'fail', 'love', 'l_s', 'l_f', 'l_l'],
      focus: ['action', 'succ', 'fail', 'love'],
    },
    {
      title: '元素：人 Person',
      text: '再看“人”这一侧——**元素**。抽象类 `Person` 只有一个方法 `accept(visitor)`：“请来访问我”。男人 `Man`、女人 `Woman` 各自实现它，而且**永远只有这两种**，非常稳定。',
      show: ['person', 'woman', 'man', 'l_w', 'l_m'],
      focus: ['person', 'woman', 'man', 'l_w', 'l_m'],
    },
    {
      title: '对象结构 ObjectStructure',
      text: '最后是**对象结构** `ObjectStructure`：它管着一群人（`attach` 加人、`detach` 删人），`display(visitor)` 让访问者**挨个访问**每个人。客户端只要说一句：“用‘成功’来访问大家。”',
      show: ['os', 'l_os', 'client', 'l_cl'],
      focus: ['os', 'client', 'l_os', 'l_cl'],
      flows: [{ from: 'client', to: 'os', label: 'display(成功)' }],
    },
    {
      title: '双分派·第一跳：accept',
      text: '跑一遍！对象结构先请男人接待：`man.accept(成功)`。这是**第一次分派**：同样是 `accept`，到底执行谁的？**看“人”的真实类型**——这里是男人，于是进入 `Man` 的 `accept`。',
      set: { man: { lines: ['!+ accept(v)'] } },
      focus: ['client', 'os', 'man'],
      flows: [
        { from: 'client', to: 'os', label: 'display(成功)' },
        { from: 'os', to: 'man', label: 'accept(成功)' },
      ],
      bubbles: [{ node: 'man', text: '我是**男人**，收到“成功”', side: 'top', step: 1 }],
    },
    {
      title: '第二跳：getManConclusion',
      text: '第二跳：男人的 `accept` 里只有一行——`visitor.getManConclusion(this)`，把**自己**交给访问者。这是**第二次分派**：看“状态”的真实类型，进入 `Success` 对男人的结论：**背后多半有一个伟大的女人**。',
      set: { man: { lines: ['+ accept(v)'] } },
      focus: ['man', 'succ'],
      flows: [{ from: 'man', to: 'succ', label: 'getManConclusion(this)' }],
      bubbles: [{ node: 'succ', text: '男人成功时，背后多半有一个**伟大的女人**。', side: 'bottom', step: 0 }],
    },
    {
      title: '换成女人：另一句结论',
      text: '接着访问女人：`woman.accept(成功)` → `成功.getWomanConclusion(this)`。**同一个访问者，遇到不同的人，走不同的方法**；同一个人遇到不同的访问者，结论也不同。两次选择，就叫**双分派**。',
      set: { woman: { lines: ['!+ accept(v)'] } },
      focus: ['os', 'woman', 'succ'],
      flows: [
        { from: 'os', to: 'woman', label: 'accept(成功)' },
        { from: 'woman', to: 'succ', label: 'getWomanConclusion(this)', curve: 130 },
      ],
      bubbles: [{ node: 'succ', text: '女人成功时，背后大多有一个**不成功的男人**。', side: 'bottom', step: 1 }],
    },
    {
      title: '新增“结婚”：只加一个类',
      text: '现在加“**结婚**”：只要新写一个 `Marriage` 继承 `Action`，实现对男人、女人的两个结论。人、对象结构**一行都不用改**。`display(new Marriage())`，男人就感慨：“恋爱游戏终结时，‘有妻徒刑’遥无期。”',
      show: ['marry', 'l_mr', 'tip'],
      set: { woman: { lines: ['+ accept(v)'] } },
      focus: ['marry', 'l_mr', 'man', 'os', 'client', 'tip'],
      flows: [
        { from: 'client', to: 'os', label: 'display(结婚)' },
        { from: 'os', to: 'man', label: 'accept(结婚)' },
        { from: 'man', to: 'marry', label: 'getManConclusion(this)', curve: 150 },
      ],
      bubbles: [{ node: 'marry', text: '男人结婚时：恋爱游戏终结时，“**有妻徒刑**”遥无期。', side: 'bottom', step: 2, dx: -70 }],
    },
    {
      title: '软肋：新增“元素”很难',
      text: '访问者的软肋：如果要新增一种“**人**”（元素类型），成功、失败、恋爱、结婚**每个访问者都得加一个方法**，改动遍地开花。所以它只适合**元素稳定、操作常变**。书里也说：大多时候你并不需要它，但一旦需要，那就是真的需要了。',
      hide: ['tip', 'client'],
      show: ['ghost'],
      set: {
        marry: { badge: '要改' }, succ: { badge: '要改' }, fail: { badge: '要改' }, love: { badge: '要改' },
        action: { badge: '+1 方法' },
      },
      focus: ['ghost', 'action', 'succ', 'fail', 'love', 'marry'],
      bubbles: [{ node: 'action', text: '**所有访问者**都要改！', side: 'left' }],
    },
    {
      title: '总结：访问者模式',
      text: '访问者模式：**Visitor**（状态 Action 及其子类）、**Element**（人 Person：男、女）、**ObjectStructure**（一群人），靠 `accept` + `getXxxConclusion(this)` **双分派**。一句话记住：**结构稳如山，操作随时添。**',
      hide: ['ghost'],
      show: ['client'],
      set: {
        marry: { badge: '' }, succ: { badge: '' }, fail: { badge: '' }, love: { badge: '' }, action: { badge: '' },
      },
      focus: ['person', 'man', 'woman', 'action', 'succ', 'fail', 'love', 'marry'],
      bubbles: [
        { node: 'person', text: '元素**稳如山**：只有男、女', side: 'right' },
        { node: 'action', text: '操作**随时添**', side: 'right', delay: 0.5 },
      ],
    },
  ],
});
