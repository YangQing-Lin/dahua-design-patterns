DP.register({
  id: 'composite',
  order: 19,
  type: 'structural',
  name: '组合模式',
  en: 'Composite',
  emoji: '🌳',
  chapter: '第 19 章 · 分公司＝一部门',
  mnemonic: '分公司当部门用，一棵树递归到底',
  summary: '把对象组织成树形结构，让客户端对“单个对象”和“一组对象”一视同仁。',
  intent: '将对象组合成树形结构以表示“部分-整体”的层次结构。组合模式使得用户对单个对象和组合对象的使用具有一致性。',
  story: '大鸟的公司给一家集团做 OA 系统。集团总部在北京，有人力资源部、财务部，还有**上海华东分公司**；华东分公司下面又有自己的人力资源部、财务部，以及南京、杭州两个办事处。客户要求：总部的人事、财务管理功能，**分公司和办事处也都要能用**。小菜想给每个分公司复制一套代码，大鸟说：对总部来说，**分公司就相当于一个部门**——把它们搭成一棵树，一视同仁。',
  analogy: '电脑里的文件夹：文件夹里可以放文件，也可以放文件夹，层数不限。你右键“查看大小”时，根本不用管它是文件还是文件夹——文件报出自己的大小，文件夹把里面所有东西的大小加起来报给你。',
  when: [
    '需求里有明显的**部分-整体层次**：公司-部门、文件夹-文件、菜单-子菜单',
    '希望客户端**忽略单个对象与组合对象的差别**，用同一套方法调用',
    '层级深度不固定，需要**递归**处理整棵树',
  ],
  pros: ['客户端代码简单：叶子还是树枝，**同一个调用**', '新增节点类型（比如“IT 部”）很容易', '天然支持任意深度的树'],
  cons: ['透明方式下叶子也有 add/remove，调用了却没有意义', '设计更抽象，很难限制“哪些节点能挂在哪里”'],
  keyPoints: [
    '三个角色：**Component**（统一接口 `Company`）、**Leaf**（叶子：人力资源部、财务部）、**Composite**（树枝：具体公司，内部有孩子列表）',
    '**透明方式**：接口里声明 add/remove，叶子也有（空实现）——客户端完全不用区分；**安全方式**：只有树枝才有 add/remove——更安全，但客户端要区分',
    '核心是**递归**：树枝的方法 = 对每个孩子调用同一个方法',
  ],
  code: `
// 统一接口：不管是总公司、分公司还是部门，都是 Company
abstract class Company {
    protected String name;
    Company(String name) { this.name = name; }
    public abstract void add(Company c);
    public abstract void remove(Company c);
    public abstract void lineOfDuty();                // 履行职责
}
// 树枝：具体公司，下面可以挂部门，也可以挂公司
class ConcreteCompany extends Company {
    private List<Company> children = new ArrayList<>();
    ConcreteCompany(String name) { super(name); }
    public void add(Company c)    { children.add(c); }
    public void remove(Company c) { children.remove(c); }
    public void lineOfDuty() {
        for (Company c : children) c.lineOfDuty();   // 递归：每个孩子都来一遍
    }
}
// 叶子：人力资源部（透明方式：add/remove 也有，但什么都不做）
class HRDepartment extends Company {
    HRDepartment(String name) { super(name); }
    public void add(Company c) { }
    public void remove(Company c) { }
    public void lineOfDuty() { System.out.println(name + "：员工招聘培训管理"); }
}
// 叶子：财务部
class FinanceDepartment extends Company {
    FinanceDepartment(String name) { super(name); }
    public void add(Company c) { }
    public void remove(Company c) { }
    public void lineOfDuty() { System.out.println(name + "：公司财务收支管理"); }
}
// 客户端：搭一棵树，然后只对树根说一句话
ConcreteCompany root = new ConcreteCompany("北京总公司");
root.add(new HRDepartment("总公司人力资源部"));
root.add(new FinanceDepartment("总公司财务部"));
ConcreteCompany east = new ConcreteCompany("上海华东分公司");
east.add(new HRDepartment("华东分公司人力资源部"));
root.add(east);
root.lineOfDuty();   // 整棵树的部门全都履行职责`,
  codePython: `
from abc import ABC, abstractmethod


# 统一接口：不管是总公司、分公司还是部门，都是 Company
class Company(ABC):
    def __init__(self, name):
        self.name = name

    @abstractmethod
    def add(self, c): ...

    @abstractmethod
    def remove(self, c): ...

    @abstractmethod
    def line_of_duty(self): ...           # 履行职责


class ConcreteCompany(Company):           # 树枝：下面可以挂部门，也可以挂公司
    def __init__(self, name):
        super().__init__(name)
        self.children = []

    def add(self, c):
        self.children.append(c)

    def remove(self, c):
        self.children.remove(c)

    def line_of_duty(self):
        for c in self.children:           # 递归：每个孩子都来一遍
            c.line_of_duty()


class HRDepartment(Company):              # 叶子（透明方式：add/remove 也有，但什么都不做）
    def add(self, c): pass
    def remove(self, c): pass

    def line_of_duty(self):
        print(self.name + "：员工招聘培训管理")


class FinanceDepartment(Company):         # 叶子：财务部
    def add(self, c): pass
    def remove(self, c): pass

    def line_of_duty(self):
        print(self.name + "：公司财务收支管理")


# 客户端：搭一棵树，然后只对树根说一句话
if __name__ == "__main__":
    root = ConcreteCompany("北京总公司")
    root.add(HRDepartment("总公司人力资源部"))
    root.add(FinanceDepartment("总公司财务部"))
    east = ConcreteCompany("上海华东分公司")
    east.add(HRDepartment("华东分公司人力资源部"))
    root.add(east)
    root.line_of_duty()   # 总公司人力资源部：员工招聘培训管理 / 总公司财务部：公司财务收支管理 / 华东分公司人力资源部：员工招聘培训管理`,
  codeGo: `
package main

import "fmt"

// 统一接口：不管是总公司、分公司还是部门，都是 Company
type Company interface {
	Add(c Company)
	Remove(c Company)
	LineOfDuty() // 履行职责
}

// 树枝：具体公司，下面可以挂部门，也可以挂公司
type ConcreteCompany struct {
	Name     string
	children []Company
}

func (c *ConcreteCompany) Add(x Company) { c.children = append(c.children, x) }
func (c *ConcreteCompany) Remove(x Company) {
	for i, child := range c.children {
		if child == x {
			c.children = append(c.children[:i], c.children[i+1:]...)
			return
		}
	}
}
func (c *ConcreteCompany) LineOfDuty() {
	for _, child := range c.children { // 递归：每个孩子都来一遍
		child.LineOfDuty()
	}
}

// 透明方式：叶子也有 Add/Remove，但什么都不做（嵌入即可复用，Go 没有继承）
type leaf struct{}

func (leaf) Add(Company)    {}
func (leaf) Remove(Company) {}

type HRDepartment struct { // 叶子：人力资源部
	leaf
	Name string
}

func (h *HRDepartment) LineOfDuty() { fmt.Println(h.Name + "：员工招聘培训管理") }

type FinanceDepartment struct { // 叶子：财务部
	leaf
	Name string
}

func (f *FinanceDepartment) LineOfDuty() { fmt.Println(f.Name + "：公司财务收支管理") }

// 客户端：搭一棵树，然后只对树根说一句话
func main() {
	root := &ConcreteCompany{Name: "北京总公司"}
	root.Add(&HRDepartment{Name: "总公司人力资源部"})
	root.Add(&FinanceDepartment{Name: "总公司财务部"})
	east := &ConcreteCompany{Name: "上海华东分公司"}
	east.Add(&HRDepartment{Name: "华东分公司人力资源部"})
	root.Add(east)
	root.LineOfDuty() // 整棵树的三个部门依次输出
}`,
  compare: [
    { id: 'decorator', text: '都是“对象里套对象”的递归结构。组合是**一对多的树**，为了统一对待整体和部分；装饰是**一对一的链**，为了一层层叠加职责。' },
    { id: 'iterator', text: '组合关心“**怎么组织**”成一棵树；迭代器关心“**怎么遍历**”一个集合。遍历组合树时，两者常常一起出现。' },
  ],
  quiz: [
    { q: '做一个文件管理器：文件夹里既能放文件，也能放文件夹，层数不限。“计算大小”这个操作，对单个文件和整个文件夹都要能直接调用，调用方不想区分。', why: '部分-整体的树形结构，单个对象与组合对象一视同仁——组合模式。' },
    { q: '餐厅菜单系统：总菜单下有“主食”“饮品”等子菜单，子菜单下面还能再挂子菜单和具体菜品。打印时希望对总菜单调用一次 print()，整个层级就全部打印出来。', why: '树形层级 + 递归调用同一个方法——组合模式。' },
  ],

  nodes: {
    root: { kind: 'box', size: 'sm', icon: '🏢', label: '北京总公司', x: 360, y: 95, tone: 'indigo' },
    hr1: { kind: 'box', shape: 'chip', icon: '👥', label: '人力资源部', x: 110, y: 200, tone: 'green' },
    fi1: { kind: 'box', shape: 'chip', icon: '💰', label: '财务部', x: 260, y: 200, tone: 'green' },
    east: { kind: 'box', size: 'sm', icon: '🏢', label: '上海华东分公司', x: 575, y: 200, tone: 'indigo' },
    sz: { kind: 'box', size: 'sm', icon: '🏢', label: '深圳分公司', x: 420, y: 200, tone: 'pink', badge: 'NEW' },
    hr2: { kind: 'box', shape: 'chip', icon: '👥', label: '人力资源部', x: 330, y: 310, tone: 'green' },
    fi2: { kind: 'box', shape: 'chip', icon: '💰', label: '财务部', x: 460, y: 310, tone: 'green' },
    nj: { kind: 'box', size: 'sm', icon: '🏢', label: '南京办事处', x: 600, y: 310, tone: 'indigo' },
    hz: { kind: 'box', size: 'sm', icon: '🏢', label: '杭州办事处', x: 820, y: 310, tone: 'indigo' },
    hr3: { kind: 'box', shape: 'chip', icon: '👥', label: '人力资源部', x: 540, y: 420, tone: 'green' },
    fi3: { kind: 'box', shape: 'chip', icon: '💰', label: '财务部', x: 660, y: 420, tone: 'green' },
    hr4: { kind: 'box', shape: 'chip', icon: '👥', label: '人力资源部', x: 790, y: 420, tone: 'green' },
    fi4: { kind: 'box', shape: 'chip', icon: '💰', label: '财务部', x: 905, y: 420, tone: 'green' },

    xc: { kind: 'actor', icon: '👦', label: '小菜', x: 95, y: 410, tone: 'blue', size: 'sm' },
    db: { kind: 'actor', icon: '🧔', label: '大鸟', x: 95, y: 495, tone: 'purple', size: 'sm' },
    leafTip: { kind: 'text', text: '🍃 **叶子**：下面不能再挂东西', x: 230, y: 445, tone: 'green' },
    branchTip: { kind: 'text', text: '🌳 **树枝**：下面还能挂部门或公司', x: 245, y: 495, tone: 'indigo' },
    client: { kind: 'actor', icon: '👨‍💻', label: '客户端', x: 720, y: 95, tone: 'gray', size: 'sm' },

    comp: { kind: 'class', title: 'Company', stereo: 'abstract', sub: '公司（统一接口）', lines: ['+ add(c: Company)', '+ remove(c: Company)', '+ lineOfDuty()'], x: 500, y: 140, tone: 'purple' },
    ccC: { kind: 'class', title: 'ConcreteCompany', sub: '具体公司（树枝）', lines: ['- children: List<Company>', '+ add(c) / remove(c)', '+ lineOfDuty():', '    每个孩子都来一遍'], x: 250, y: 395, tone: 'indigo' },
    hrC: { kind: 'class', title: 'HRDepartment', sub: '人力资源部（叶子）', lines: ['+ add/remove：空着', '+ lineOfDuty():', '    员工招聘培训'], x: 560, y: 395, tone: 'green' },
    fiC: { kind: 'class', title: 'FinanceDepartment', sub: '财务部（叶子）', lines: ['+ add/remove：空着', '+ lineOfDuty():', '    财务收支管理'], x: 800, y: 395, tone: 'green' },
  },
  links: {
    t_hr1: { from: 'root', to: 'hr1', kind: 'line' },
    t_fi1: { from: 'root', to: 'fi1', kind: 'line' },
    t_east: { from: 'root', to: 'east', kind: 'line' },
    t_sz: { from: 'root', to: 'sz', kind: 'line', tone: 'pink' },
    t_hr2: { from: 'east', to: 'hr2', kind: 'line' },
    t_fi2: { from: 'east', to: 'fi2', kind: 'line' },
    t_nj: { from: 'east', to: 'nj', kind: 'line' },
    t_hz: { from: 'east', to: 'hz', kind: 'line' },
    t_hr3: { from: 'nj', to: 'hr3', kind: 'line' },
    t_fi3: { from: 'nj', to: 'fi3', kind: 'line' },
    t_hr4: { from: 'hz', to: 'hr4', kind: 'line' },
    t_fi4: { from: 'hz', to: 'fi4', kind: 'line' },
    l_cli: { from: 'client', to: 'root', kind: 'assoc' },

    i_cc: { from: 'ccC', to: 'comp', kind: 'inherit' },
    i_hr: { from: 'hrC', to: 'comp', kind: 'inherit' },
    i_fi: { from: 'fiC', to: 'comp', kind: 'inherit' },
    a_cc: { from: 'ccC', to: 'comp', kind: 'aggregate', label: 'children（多个）', curve: 70 },
  },

  frames: [
    {
      title: '集团要上 OA 系统',
      text: '第 19 章，大鸟的公司接了个单子：给一家集团做 **OA 办公系统**。集团总部在北京，下面有**人力资源部**和**财务部**。只做总部的话，很简单。',
      show: ['root', 'hr1', 'fi1', 't_hr1', 't_fi1'],
      focus: ['root', 'hr1', 'fi1'],
    },
    {
      title: '还有分公司和办事处',
      text: '可集团还有**上海华东分公司**，它下面也有人力资源部、财务部，还管着南京、杭州两个**办事处**，办事处里又各有部门。客户要求：**这些功能，分公司、办事处也都要能用**。',
      show: ['east', 'hr2', 'fi2', 'nj', 'hz', 'hr3', 'fi3', 'hr4', 'fi4', 't_east', 't_hr2', 't_fi2', 't_nj', 't_hz', 't_hr3', 't_fi3', 't_hr4', 't_fi4'],
      focus: ['east', 'hr2', 'fi2', 'nj', 'hz', 'hr3', 'fi3', 'hr4', 'fi4'],
    },
    {
      title: '小菜：复制几套？',
      text: '小菜的第一反应：总部一套代码，分公司**复制一套**，每个办事处再复制一套……可要是集团又开了新分公司呢？改一个功能，要同时改好几份代码。',
      show: ['xc'],
      set: { east: { badge: '复制一套？' }, nj: { badge: '再复制？' }, hz: { badge: '再复制？' } },
      focus: ['xc', 'east', 'nj', 'hz'],
      bubbles: [{ node: 'xc', text: '每个分公司复制一份代码？', side: 'right' }],
    },
    {
      title: '大鸟：分公司就是个部门',
      text: '大鸟提醒：你看这是一棵**树**。对总部来说，“上海分公司”和“财务部”没什么两样，都只是它下面的**一个孩子**。如果能**一视同仁**地对待它们，代码只需要写一份。',
      show: ['db'],
      set: { east: { badge: '' }, nj: { badge: '' }, hz: { badge: '' } },
      focus: ['db', 'root', 'hr1', 'fi1', 'east'],
      bubbles: [{ node: 'db', text: '对总部来说，分公司＝一个部门', side: 'right' }],
    },
    {
      title: '叶子和树枝',
      text: '树上的节点分两种：**叶子**——人力资源部、财务部，下面不会再挂别的；**树枝**——总公司、分公司、办事处，下面可以挂部门，也可以再挂公司。',
      hide: ['xc', 'db'],
      show: ['leafTip', 'branchTip'],
      focus: ['leafTip', 'branchTip', 'hr1', 'fi1', 'hr2', 'fi2', 'hr3', 'fi3', 'hr4', 'fi4', 'root', 'east', 'nj', 'hz'],
    },
    {
      title: '统一接口：Company',
      text: '先给所有节点一个**共同的抽象** `Company`：不管是公司还是部门，都有添加 `add`、删除 `remove`、履行职责 `lineOfDuty` 这些方法。客户端从此**只认 Company**。',
      clear: true,
      show: ['comp'],
      focus: ['comp'],
      bubbles: [{ node: 'comp', text: '公司、部门，都是 Company', side: 'right' }],
    },
    {
      title: '叶子类：各司其职',
      text: '叶子很简单：`HRDepartment` 负责员工招聘培训，`FinanceDepartment` 负责财务收支。它们也有 add / remove，但**什么都不做**——这叫**透明方式**：客户端完全不用区分叶子和树枝。',
      show: ['hrC', 'fiC', 'i_hr', 'i_fi'],
      focus: ['hrC', 'fiC'],
    },
    {
      title: '树枝类：肚子里装着孩子',
      text: '关键在树枝 `ConcreteCompany`：它内部有个 `children` 列表，装的是 **Company**——既可以是部门，也可以是另一个公司。它的 `lineOfDuty()` 就一件事：**让每个孩子都履行一遍职责**。',
      show: ['ccC', 'i_cc', 'a_cc'],
      focus: ['ccC', 'comp', 'a_cc'],
      bubbles: [{ node: 'ccC', text: '我里面还能装 Company → **递归**', side: 'top' }],
    },
    {
      title: '一句话，整棵树动起来',
      text: '客户端只对总公司说一句 `lineOfDuty()`。总公司转给每个孩子；遇到分公司，分公司再转给自己的孩子……**一层层递归**下去，整棵树里的每个部门都履行了职责。',
      clear: true,
      show: ['root', 'hr1', 'fi1', 'east', 'hr2', 'fi2', 'nj', 'hz', 'hr3', 'fi3', 'hr4', 'fi4',
        't_hr1', 't_fi1', 't_east', 't_hr2', 't_fi2', 't_nj', 't_hz', 't_hr3', 't_fi3', 't_hr4', 't_fi4', 'client', 'l_cli'],
      flowGap: 1.0,
      flows: [
        { from: 'client', to: 'root', label: 'lineOfDuty()', step: 0 },
        { from: 'root', to: 'hr1', step: 1 }, { from: 'root', to: 'fi1', step: 1 }, { from: 'root', to: 'east', step: 1 },
        { from: 'east', to: 'hr2', step: 2 }, { from: 'east', to: 'fi2', step: 2 }, { from: 'east', to: 'nj', step: 2 }, { from: 'east', to: 'hz', step: 2 },
        { from: 'nj', to: 'hr3', step: 3 }, { from: 'nj', to: 'fi3', step: 3 }, { from: 'hz', to: 'hr4', step: 3 }, { from: 'hz', to: 'fi4', step: 3 },
      ],
      bubbles: [
        { node: 'hr1', text: '招聘培训 ✓', side: 'bottom', step: 1, tone: 'green' },
        { node: 'fi1', text: '财务收支 ✓', side: 'bottom', step: 1, tone: 'green' },
        { node: 'hr3', text: '招聘培训 ✓', side: 'bottom', step: 3, tone: 'green' },
        { node: 'fi3', text: '财务收支 ✓', side: 'bottom', step: 3, tone: 'green' },
      ],
    },
    {
      title: '对局部调用，也一样',
      text: '如果客户端只想让**南京办事处**履行职责呢？同样是那一句 `lineOfDuty()`；对一个单独的财务部调用，也没问题。**整体和部分，用法完全一样**——这就是组合模式说的“一致性”。',
      focus: ['client', 'nj', 'hr3', 'fi3'],
      flows: [
        { from: 'client', to: 'nj', label: 'lineOfDuty()', curve: -50 },
        { from: 'nj', to: 'hr3', step: 1 }, { from: 'nj', to: 'fi3', step: 1 },
      ],
      bubbles: [{ node: 'client', text: '对谁都是同一句话', side: 'right' }],
    },
    {
      title: '新开分公司？挂上去',
      text: '集团又开了**深圳分公司**？`root.add(new ConcreteCompany("深圳分公司"))`，往树上一挂就行。人事、财务这些功能它**自动就有**，一行旧代码都不用改。',
      show: ['sz', 't_sz'],
      focus: ['sz', 't_sz', 'root', 'client'],
      flows: [{ from: 'client', to: 'root', label: 'add(深圳分公司)' }],
      bubbles: [{ node: 'sz', text: '人事、财务功能自动都有', side: 'bottom', step: 0 }],
    },
    {
      title: '总结：组合模式',
      text: '三个角色：**Component** 统一接口、**Leaf** 叶子、**Composite** 树枝（肚子里装着孩子）。透明方式让叶子也有 add/remove，安全方式只给树枝。一句话记住：**分公司当部门用，一棵树递归到底。**',
      clear: true,
      show: ['comp', 'ccC', 'hrC', 'fiC', 'i_cc', 'i_hr', 'i_fi', 'a_cc'],
      set: { sz: { badge: '' } },
      focus: ['comp', 'ccC', 'hrC', 'fiC', 'a_cc'],
      bubbles: [
        { node: 'comp', text: '整体和部分，**同一个接口**', side: 'right' },
        { node: 'ccC', text: '对每个孩子调用同一个方法', side: 'top' },
      ],
    },
  ],
});
