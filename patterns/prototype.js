DP.register({
  id: 'prototype',
  order: 9,
  type: 'creational',
  name: '原型模式',
  en: 'Prototype',
  emoji: '📑',
  chapter: '第 9 章 · 简历复印',
  mnemonic: '复印一份改一改，引用记得深拷贝',
  summary: '不用 new 从头造，而是从一个现成对象“复印”出新对象，再按需修改。',
  intent: '用原型实例指定创建对象的种类，并且通过拷贝这些原型创建新的对象。',
  story: '小菜找工作要投很多份简历。每份都从头写，就像每次都 `new` 一个对象再逐项填写；不如写好一份，**复印**多份再稍作修改。可当“工作经历”变成一个独立对象后，复印出来的简历竟然共用同一份经历，改一份全跟着变——这就引出了**浅复制**与**深复制**。',
  analogy: '用 Word 写合同：打开上一份合同“另存为”，改改甲方名称和金额就是新合同，不用从空白页重新排版。但如果附件只是个“共享链接”，改了附件，所有合同看到的都变了——得把附件也另存一份才安全。',
  when: [
    '创建对象的**成本高**（初始化复杂、要读文件或查数据库），而新对象和已有对象**大部分相同**',
    '想根据一个现成对象生成新对象，而不关心它的具体类和构造细节',
    '需要保存对象某一时刻的副本，再在副本上修改',
  ],
  pros: ['不用重新执行构造函数，**性能好**、写法简单', '隐藏创建细节：拿到原型就能复制，不必知道它是怎么构造的', '可以在运行时动态地复制出新对象'],
  cons: ['对象里有引用字段时要小心：**浅复制会共享**同一个子对象', '深复制要逐层处理，引用嵌套很深或有循环引用时比较麻烦'],
  keyPoints: [
    '**浅复制**：值类型字段复制一份，引用类型字段只复制“地址”，新旧对象**指向同一个**子对象',
    '**深复制**：连引用的子对象也克隆一份，各改各的、互不影响',
    'Java 里实现 `Cloneable` 并重写 `clone()`；`super.clone()` 默认是浅复制（相当于书中 C# 的 `MemberwiseClone()`）',
  ],
  code: `
class WorkExperience implements Cloneable {
    private String workDate, company;
    public void setWorkDate(String d) { workDate = d; }
    public void setCompany(String c)  { company = c; }
    public WorkExperience clone() throws CloneNotSupportedException {
        return (WorkExperience) super.clone();
    }
}
class Resume implements Cloneable {
    private String name, sex;
    private int age;
    private WorkExperience work = new WorkExperience();   // 引用类型字段
    public Resume(String name) { this.name = name; }
    public void setPersonalInfo(String sex, int age) { this.sex = sex; this.age = age; }
    public void setWorkExperience(String date, String company) {
        work.setWorkDate(date);
        work.setCompany(company);
    }
    public Resume clone() throws CloneNotSupportedException {
        Resume r = (Resume) super.clone();   // 浅复制：work 只复制了地址
        r.work = this.work.clone();          // 深复制：经历也复印一份
        return r;                            // （去掉上一行就是浅复制）
    }
}
// 客户端：只 new 一次，其余都复印
Resume a = new Resume("大鸟");
a.setPersonalInfo("男", 29);
a.setWorkExperience("1998-2000", "XX公司");
Resume b = a.clone();
b.setWorkExperience("1998-2006", "YY企业");
Resume c = a.clone();
c.setPersonalInfo("男", 24);
c.setWorkExperience("1998-2003", "ZZ企业");
// 深复制：a、b、c 的经历各不相同；浅复制：三份全是 ZZ企业`,
  codePython: `
import copy


class WorkExperience:
    def __init__(self):
        self.work_date = self.company = ""


class Resume:
    def __init__(self, name):
        self.name, self.sex, self.age = name, "", 0
        self.work = WorkExperience()          # 引用类型字段

    def set_personal_info(self, sex, age):
        self.sex, self.age = sex, age

    def set_work_experience(self, date, company):
        self.work.work_date, self.work.company = date, company

    def shallow_clone(self):
        return copy.copy(self)                # 浅复制：work 只复制了地址

    def clone(self):
        return copy.deepcopy(self)            # 深复制：经历也复印一份

    def __str__(self):
        w = self.work
        return f"{self.name} {self.sex} {self.age} {w.work_date} {w.company}"


def make_three(copy_method):
    a = Resume("大鸟")
    a.set_personal_info("男", 29)
    a.set_work_experience("1998-2000", "XX公司")
    b = copy_method(a)
    b.set_work_experience("1998-2006", "YY企业")
    c = copy_method(a)
    c.set_personal_info("男", 24)
    c.set_work_experience("1998-2003", "ZZ企业")
    return a, b, c


# 客户端：只 new 一次，其余都复印
if __name__ == "__main__":
    print("-- 浅复制（bug）")
    for r in make_three(Resume.shallow_clone):
        print(r)    # 三行经历全是 1998-2003 ZZ企业
    print("-- 深复制")
    for r in make_three(Resume.clone):
        print(r)    # 大鸟 男 29 1998-2000 XX公司
                    # 大鸟 男 29 1998-2006 YY企业
                    # 大鸟 男 24 1998-2003 ZZ企业
    # Python 小贴士：也可以自己实现 __copy__ / __deepcopy__ 来定制复制行为`,
  codeGo: `
package main

import "fmt"

type WorkExperience struct{ WorkDate, Company string }

type Resume struct {
	Name, Sex string
	Age       int
	Work      *WorkExperience // 指针字段：赋值复制时只复制地址
}

func NewResume(name string) *Resume {
	return &Resume{Name: name, Work: &WorkExperience{}}
}

func (r *Resume) SetPersonalInfo(sex string, age int) { r.Sex, r.Age = sex, age }
func (r *Resume) SetWorkExperience(date, company string) {
	r.Work.WorkDate, r.Work.Company = date, company
}

// Go 没有 Cloneable：结构体赋值就是浅复制，指针字段仍指向同一个对象
func (r *Resume) ShallowClone() *Resume {
	c := *r
	return &c
}

// 深复制：把指针指向的工作经历也复印一份
func (r *Resume) Clone() *Resume {
	c := *r
	w := *r.Work
	c.Work = &w
	return &c
}

func (r *Resume) String() string {
	return fmt.Sprint(r.Name, " ", r.Sex, " ", r.Age, " ", r.Work.WorkDate, " ", r.Work.Company)
}

func makeThree(clone func(*Resume) *Resume) []*Resume {
	a := NewResume("大鸟")
	a.SetPersonalInfo("男", 29)
	a.SetWorkExperience("1998-2000", "XX公司")
	b := clone(a)
	b.SetWorkExperience("1998-2006", "YY企业")
	c := clone(a)
	c.SetPersonalInfo("男", 24)
	c.SetWorkExperience("1998-2003", "ZZ企业")
	return []*Resume{a, b, c}
}

// 客户端：只 new 一次，其余都复印
func main() {
	fmt.Println("-- 浅复制（bug）")
	for _, r := range makeThree((*Resume).ShallowClone) {
		fmt.Println(r) // 三行经历全是 1998-2003 ZZ企业
	}
	fmt.Println("-- 深复制")
	for _, r := range makeThree((*Resume).Clone) {
		fmt.Println(r) // 大鸟 男 29 1998-2000 XX公司 / 大鸟 男 29 1998-2006 YY企业 / 大鸟 男 24 1998-2003 ZZ企业
	}
}`,
  compare: [
    { id: 'factory-method', text: '工厂方法要准备一套**平行的工厂类**，由工厂 new 出新对象；原型不需要工厂，直接让现成对象**自己 clone 自己**。' },
    { id: 'memento', text: '备忘录复制对象的状态，是为了**以后恢复**；原型复制整个对象，是为了**快速造出新对象**。' },
  ],
  quiz: [
    { q: '报表系统里，每个“报表配置”对象要读模板、查数据库，构造一次要好几秒。用户常常想基于已有配置新建一份再微调，开发者便给配置类加了 clone() 方法，直接复制现成对象再改。', why: '构造代价高、从现成对象复制出新对象——原型。' },
    { q: '游戏里要刷出 100 只同样的小怪，只有坐标不同。程序先配好一只“样板怪”，其余都从它复制出来。结果发现所有小怪共用同一个装备对象：一只捡了装备，全体都变了。', why: '从样板对象复制 + 浅复制共享引用的坑——原型模式要注意深复制。' },
  ],

  nodes: {
    // 场景一：投简历
    xc: { kind: 'actor', icon: '👨‍🎓', label: '小菜', sub: '找工作中', x: 150, y: 290, tone: 'blue' },
    res: { kind: 'box', icon: '📄', label: '我的简历', sub: '姓名 · 性别 · 年龄 · 工作经历', x: 430, y: 290, tone: 'blue' },
    coA: { kind: 'box', icon: '🏢', label: 'A 公司', x: 800, y: 160, tone: 'gray', size: 'sm' },
    coB: { kind: 'box', icon: '🏢', label: 'B 公司', x: 800, y: 290, tone: 'gray', size: 'sm' },
    coC: { kind: 'box', icon: '🏢', label: 'C 公司', x: 800, y: 420, tone: 'gray', size: 'sm' },
    // 场景二：一份份 new
    badc: {
      kind: 'class', title: 'Client', sub: '第一版：要几份就 new 几次', x: 420, y: 290, tone: 'red',
      lines: ['Resume a = new Resume("大鸟");', 'a.setPersonalInfo("男", 29);', 'a.setWorkExperience("1998-2000", "XX公司");', 'Resume b = new Resume("大鸟");', 'b.setPersonalInfo("男", 29);', 'b.setWorkExperience("1998-2000", "XX公司");', '// 第 3 份、第 20 份……'],
    },
    dn: { kind: 'actor', icon: '🦅', label: '大鸟', x: 840, y: 290, tone: 'orange' },
    // 场景三：b = a
    va: { kind: 'box', shape: 'chip', mono: true, label: 'Resume a', x: 220, y: 170, tone: 'blue' },
    vb: { kind: 'box', shape: 'chip', mono: true, label: 'Resume b = a', x: 220, y: 290, tone: 'blue' },
    vc: { kind: 'box', shape: 'chip', mono: true, label: 'Resume c = a', x: 220, y: 410, tone: 'blue' },
    obj: { kind: 'box', icon: '📄', label: '唯一的简历对象', sub: '大鸟 · 男 · 29', x: 660, y: 290, tone: 'purple', size: 'lg' },
    // 场景四：类
    clo: { kind: 'class', title: 'Cloneable', stereo: 'interface', sub: '原型：表示“我可以被复制”', x: 500, y: 100, tone: 'purple' },
    rcls: { kind: 'class', title: 'Resume', sub: '简历（具体原型）', lines: ['- name, sex, age', '- timeArea, company', '+ setPersonalInfo(sex, age)', '+ setWorkExperience(time, company)', '!+ clone()'], x: 500, y: 320, tone: 'teal' },
    client: { kind: 'actor', icon: '👨‍💻', label: '客户端', x: 150, y: 320, tone: 'gray' },
    // 场景五：对象图
    resA: { kind: 'box', icon: '📄', label: '简历 a（原型）', sub: '男 · 29 · XX公司', x: 170, y: 290, tone: 'blue' },
    resB: { kind: 'box', icon: '📄', label: '简历 b（复印）', sub: '男 · 29 · YY企业', x: 450, y: 160, tone: 'teal' },
    resC: { kind: 'box', icon: '📄', label: '简历 c（复印）', sub: '男 · 24 · ZZ企业', x: 450, y: 420, tone: 'teal' },
    work: { kind: 'box', icon: '💼', label: '工作经历', sub: '1998-2000 · XX公司', x: 800, y: 290, tone: 'orange' },
    wa: { kind: 'box', icon: '💼', label: '经历 a', sub: '1998-2000 · XX公司', x: 800, y: 290, tone: 'blue' },
    wb: { kind: 'box', icon: '💼', label: '经历 b', sub: '1998-2000 · XX公司', x: 800, y: 290, tone: 'teal' },
    wc: { kind: 'box', icon: '💼', label: '经历 c', sub: '1998-2000 · XX公司', x: 800, y: 290, tone: 'teal' },
    // 场景六：为什么快
    ctor: { kind: 'box', icon: '🏗️', label: '构造函数', sub: '读模板、查数据库……很慢', x: 300, y: 130, tone: 'gray' },
    proto: { kind: 'box', icon: '📄', label: '原型对象', sub: '已经初始化好', x: 300, y: 320, tone: 'blue', size: 'lg' },
    cp1: { kind: 'box', icon: '📄', label: '副本 1', x: 740, y: 190, tone: 'teal', size: 'sm' },
    cp2: { kind: 'box', icon: '📄', label: '副本 2', x: 740, y: 320, tone: 'teal', size: 'sm' },
    cp3: { kind: 'box', icon: '📄', label: '副本 3', x: 740, y: 450, tone: 'teal', size: 'sm' },
  },
  links: {
    l_xr: { from: 'xc', to: 'res', kind: 'assoc' },
    r_a: { from: 'va', to: 'obj', kind: 'arrow' },
    r_b: { from: 'vb', to: 'obj', kind: 'arrow' },
    r_c: { from: 'vc', to: 'obj', kind: 'arrow' },
    l_impl: { from: 'rcls', to: 'clo', kind: 'implement' },
    l_cr: { from: 'client', to: 'rcls', kind: 'assoc' },
    s_a: { from: 'resA', to: 'work', kind: 'aggregate', label: '引用' },
    s_b: { from: 'resB', to: 'work', kind: 'aggregate' },
    s_c: { from: 'resC', to: 'work', kind: 'aggregate' },
    d_a: { from: 'resA', to: 'wa', kind: 'aggregate', label: '引用' },
    d_b: { from: 'resB', to: 'wb', kind: 'aggregate' },
    d_c: { from: 'resC', to: 'wc', kind: 'aggregate' },
    l_ct: { from: 'ctor', to: 'proto', kind: 'dashed', label: '只在最开始用一次' },
  },

  frames: [
    {
      title: '小菜要投很多份简历',
      text: '小菜毕业找工作，要往好多家公司投简历。每份内容几乎一样：姓名、性别、年龄、工作经历。要是一份一份**从头手写**，得写到什么时候？',
      show: ['xc', 'res', 'coA', 'coB', 'coC', 'l_xr'],
      flows: [
        { from: 'res', to: 'coA', icon: '📄', label: '投递' },
        { from: 'res', to: 'coB', icon: '📄', label: '投递' },
        { from: 'res', to: 'coC', icon: '📄', label: '投递' },
      ],
      bubbles: [{ node: 'xc', text: '每份都要**手写**一遍？', side: 'top' }],
    },
    {
      title: '第一版：要几份 new 几次',
      text: '第一版代码（书里拿大鸟的简历做例子）：要三份简历就 `new` 三次，每次把姓名、年龄、经历重新填一遍。要 20 份呢？更糟的是，年龄写错了，得**改 20 处**。',
      clear: true,
      show: ['badc', 'dn'],
      set: { badc: { badge: '手写 20 遍' } },
      focus: ['badc', 'dn'],
      bubbles: [{ node: 'dn', text: '这和手抄 20 份有啥区别？', side: 'top' }],
    },
    {
      title: '“b = a” 不是复印',
      text: '小菜改成 `Resume b = a;`——这可不是复印！这只是在 b 这张纸上写了句“简历在 a 那儿”。a、b、c 指向的是**同一份**简历：c 改了年龄，a 和 b 也跟着变。',
      clear: true,
      show: ['va', 'vb', 'vc', 'obj', 'r_a', 'r_b', 'r_c'],
      set: { obj: { sub: '大鸟 · 男 · 24', badge: '被 c 改了' } },
      focus: ['va', 'vb', 'vc', 'obj', 'r_a', 'r_b', 'r_c'],
      flows: [{ from: 'vc', to: 'obj', label: 'c.setPersonalInfo("男", 24)' }],
      bubbles: [{ node: 'va', text: '我怎么也变成 24 岁了？', side: 'top', step: 0 }],
    },
    {
      title: '原型：让简历自己会复印',
      text: '大鸟：让简历类**自己会复印**——实现 `Cloneable`，提供一个 **`clone()`** 方法。拿着一份写好的简历调用它，就得到一个新的**独立对象**，再按需修改。这就是**原型模式**：用一个原型实例，复制出新对象。',
      clear: true,
      show: ['clo', 'rcls', 'l_impl'],
      focus: ['rcls', 'clo'],
    },
    {
      title: '只 new 一次，其余复印',
      text: '现在只 `new` 一次：a 写好后，b、c 都由 `a.clone()` 复印出来，再各自改改。复印**不用再跑一遍构造函数**，也不用知道简历是怎么造出来的。此时三份互不影响，一切正常。',
      clear: true,
      show: ['resA', 'resB', 'resC'],
      focus: ['resA', 'resB', 'resC'],
      flows: [
        { from: 'resA', to: 'resB', label: 'clone()' },
        { from: 'resA', to: 'resC', label: 'clone()' },
      ],
      bubbles: [
        { node: 'resB', text: '改成 **YY企业**', side: 'right', step: 0 },
        { node: 'resC', text: '改成 **24 岁、ZZ企业**', side: 'right', step: 1 },
      ],
    },
    {
      title: '工作经历变成了对象',
      text: '后来简历升级：工作经历单独做成一个类 `WorkExperience`（时间、公司），简历里只存一个指向它的**引用**。看起来只是一次普通的重构，却埋下了一个坑……',
      hide: ['resB', 'resC'],
      show: ['work', 's_a'],
      set: { resA: { sub: '大鸟 · 男 · 29' }, resB: { sub: '大鸟 · 男 · 29' }, resC: { sub: '大鸟 · 男 · 29' } },
      focus: ['resA', 'work', 's_a'],
    },
    {
      title: '浅复制：经历是共用的',
      text: 'Java 的 `super.clone()`（书里 C# 的 `MemberwiseClone()`）是**浅复制**：姓名、年龄这些值字段复印了一份，可工作经历只复印了“地址”——三份简历**指向同一个** WorkExperience。',
      show: ['resB', 'resC', 's_b', 's_c'],
      set: { work: { badge: '三份共用！' } },
      focus: ['resA', 'resB', 'resC', 'work', 's_a', 's_b', 's_c'],
      flows: [
        { from: 'resA', to: 'resB', label: 'clone()' },
        { from: 'resA', to: 'resC', label: 'clone()' },
      ],
    },
    {
      title: '改 b 改 c，三份全变了',
      text: '给 b 写上“YY企业”，再给 c 写上“ZZ企业”。打印出来：三份简历的工作经历**全是 ZZ企业**！因为它们改的其实是**同一个对象**，后写的覆盖了先写的。这就是浅复制的坑。',
      set: { work: { sub: '1998-2003 · ZZ企业', badge: '三份都显示它', tone: 'red' }, resC: { sub: '大鸟 · 男 · 24' } },
      focus: ['resB', 'resC', 'work', 'resA'],
      flows: [
        { from: 'resB', to: 'work', label: 'YY企业' },
        { from: 'resC', to: 'work', label: 'ZZ企业' },
      ],
      bubbles: [
        { node: 'resA', text: '我的经历怎么成了 ZZ企业？', side: 'bottom', step: 1 },
        { node: 'resB', text: '我的 YY企业 呢？', side: 'top', step: 1 },
      ],
    },
    {
      title: '深复制：经历也复印一份',
      text: '解决办法：**深复制**。在 Resume 的 `clone()` 里，顺手把工作经历也 `clone()` 一份，交给新简历。从此每份简历都有**自己的**工作经历对象。',
      hide: ['work', 's_a', 's_b', 's_c'],
      show: ['wa', 'wb', 'wc', 'd_a', 'd_b', 'd_c'],
      set: { wb: { y: 160 }, wc: { y: 420 } },
      focus: ['wa', 'wb', 'wc', 'd_a', 'd_b', 'd_c'],
      flows: [
        { from: 'wa', to: 'wb', label: 'clone()' },
        { from: 'wa', to: 'wc', label: 'clone()' },
      ],
    },
    {
      title: '再改一次：各改各的',
      text: '再来一遍：b 改成 YY企业，c 改成 ZZ企业，a 仍然是 XX公司——**各改各的，互不影响**。记住：对象里有**引用类型**的字段，复制时就要想想要不要深复制。',
      set: { wb: { sub: '1998-2006 · YY企业' }, wc: { sub: '1998-2003 · ZZ企业' } },
      focus: ['resB', 'resC', 'wb', 'wc', 'resA', 'wa'],
      flows: [
        { from: 'resB', to: 'wb', label: 'YY企业', step: 0 },
        { from: 'resC', to: 'wc', label: 'ZZ企业', step: 0 },
      ],
      bubbles: [{ node: 'resA', text: '我还是 **XX公司** ✓', side: 'bottom', step: 0 }],
    },
    {
      title: '为什么不直接 new？',
      text: '原型的价值：①**不用重新执行构造函数**——初始化很贵（读模板、查数据库）时，复制快得多；②**隐藏创建细节**——拿到一个现成对象就能复制，不必知道它怎么造的，甚至不必知道它的具体类。',
      clear: true,
      show: ['ctor', 'proto', 'cp1', 'cp2', 'cp3', 'l_ct'],
      set: { ctor: { opacity: 0.6 } },
      focus: ['proto', 'cp1', 'cp2', 'cp3'],
      flows: [
        { from: 'proto', to: 'cp1', icon: '⚡', label: 'clone()', step: 0 },
        { from: 'proto', to: 'cp2', icon: '⚡', label: 'clone()', step: 0 },
        { from: 'proto', to: 'cp3', icon: '⚡', label: 'clone()', step: 0 },
      ],
      bubbles: [{ node: 'proto', text: '不用知道我是怎么造出来的', side: 'bottom', step: 0 }],
    },
    {
      title: '总结：原型模式',
      text: '两个角色：**原型**（声明“我能被复制”）和**具体原型** Resume（实现 `clone()`）。客户端拿着一个现成对象，让它复制自己。一句话记住：**复印一份改一改，引用记得深拷贝。**',
      clear: true,
      show: ['clo', 'rcls', 'l_impl', 'client', 'l_cr'],
      set: { rcls: { lines: ['- name, sex, age', '- work: WorkExperience', '+ setPersonalInfo(sex, age)', '+ setWorkExperience(time, company)', '!+ clone()\u00a0\u00a0\u00a0// 连 work 一起复制'] } },
      focus: ['rcls', 'clo', 'client', 'l_cr'],
      flows: [
        { from: 'client', to: 'rcls', label: 'a.clone()' },
        { from: 'rcls', to: 'client', label: '新简历', back: true, tone: 'teal' },
      ],
      bubbles: [{ node: 'rcls', text: '浅复制共用引用，**深复制各有一份**', side: 'right', step: 1 }],
    },
  ],
});
