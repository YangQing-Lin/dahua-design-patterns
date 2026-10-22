DP.register({
  id: 'factory-method',
  order: 8,
  type: 'creational',
  name: '工厂方法模式',
  en: 'Factory Method',
  emoji: '🏗️',
  chapter: '第 8 章 · 雷锋依然在人间',
  mnemonic: '每个产品配个厂，扩展只加不改',
  summary: '把“new 哪个类”交给工厂子类：每种产品配一个工厂，客户端挑工厂。',
  intent: '定义一个用于创建对象的接口，让子类决定实例化哪一个类。工厂方法使一个类的实例化延迟到其子类。',
  story: '小菜的同学**薛磊风**以“学雷锋”的名义，长期帮一位孤寡老人扫地、洗衣、买米。后来他去不了，同学们和社区志愿者接着去。小菜把“雷锋”写成类，大鸟借此对比：简单工厂每多一种人就要改 switch；**工厂方法**给每种人配一个工厂，新增只加类、不改旧代码。',
  analogy: '寄快递：你选了“顺丰”网点，就由顺丰派快递员上门；选“京东”网点，就由京东派。平台新接入一家快递公司，只要新开一个网点，老网点的流程一行不改。至于用哪家，由你下单时决定。',
  when: [
    '产品种类会**不断增加**，不想每次都去改同一个工厂',
    '每种产品的创建过程各不相同，适合各自配一个**专属工厂**',
    '希望由客户端（或配置）决定用哪个工厂，而不是在工厂里写 switch',
  ],
  pros: ['新增产品 = 加一个产品类 + 一个工厂类，**旧代码一行不改**（开放-封闭）', '保留了“客户端不直接 new 具体产品”的好处', '每个工厂只管一种产品，职责单一'],
  cons: ['每多一种产品就**多一个工厂类**，类的数量成倍增加', '“选哪个工厂”的判断挪到了客户端（书中后面用反射 + 配置消除）'],
  keyPoints: [
    '四个角色：**产品** `LeiFeng`、**具体产品** `Undergraduate` / `Volunteer`、**工厂接口** `IFactory`、**具体工厂** `UndergraduateFactory` / `VolunteerFactory`',
    '和简单工厂的根本区别：简单工厂的判断在**工厂里**，工厂方法把判断**搬到了客户端**',
    '从大学生换成志愿者，客户端只改 `new UndergraduateFactory()` 这一行',
  ],
  code: `
// 产品：雷锋
class LeiFeng {
    public void sweep()   { System.out.println("扫地"); }
    public void wash()    { System.out.println("洗衣"); }
    public void buyRice() { System.out.println("买米"); }
}
class Undergraduate extends LeiFeng { }   // 学雷锋的大学生
class Volunteer extends LeiFeng { }       // 社区志愿者

// 工厂接口：只规定“能造一个雷锋”
interface IFactory {
    LeiFeng createLeiFeng();
}
// 每种产品配一个工厂，里面没有 switch
class UndergraduateFactory implements IFactory {
    public LeiFeng createLeiFeng() { return new Undergraduate(); }
}
class VolunteerFactory implements IFactory {
    public LeiFeng createLeiFeng() { return new Volunteer(); }
}

// 客户端：换人只改这一行
IFactory factory = new UndergraduateFactory();   // → new VolunteerFactory()
LeiFeng student = factory.createLeiFeng();
student.sweep();
student.wash();
student.buyRice();`,
  codePython: `
from abc import ABC, abstractmethod


# 产品：雷锋
class LeiFeng:
    def sweep(self):    print(f"{self.who}扫地")
    def wash(self):     print(f"{self.who}洗衣")
    def buy_rice(self): print(f"{self.who}买米")


class Undergraduate(LeiFeng):         # 学雷锋的大学生
    who = "大学生"


class Volunteer(LeiFeng):             # 社区志愿者
    who = "志愿者"


# 工厂接口：只规定“能造一个雷锋”
class IFactory(ABC):
    @abstractmethod
    def create_lei_feng(self) -> LeiFeng: ...


# 每种产品配一个工厂，里面没有 if/switch
class UndergraduateFactory(IFactory):
    def create_lei_feng(self): return Undergraduate()


class VolunteerFactory(IFactory):
    def create_lei_feng(self): return Volunteer()


# 客户端：换人只改这一行
if __name__ == "__main__":
    factory = UndergraduateFactory()   # → VolunteerFactory()
    student = factory.create_lei_feng()
    student.sweep()                    # 大学生扫地
    student.wash()                     # 大学生洗衣
    student.buy_rice()                 # 大学生买米
    # Python 小贴士：类本身就是可调用的“工厂”，传 Volunteer 也行`,
  codeGo: `
package main

import "fmt"

// 产品：雷锋。Go 没有继承，Undergraduate / Volunteer 用组合复用 LeiFeng 的行为
type LeiFeng struct{ Who string }

func (l LeiFeng) Sweep()   { fmt.Println(l.Who + "扫地") }
func (l LeiFeng) Wash()    { fmt.Println(l.Who + "洗衣") }
func (l LeiFeng) BuyRice() { fmt.Println(l.Who + "买米") }

type Undergraduate struct{ LeiFeng } // 学雷锋的大学生
type Volunteer struct{ LeiFeng }     // 社区志愿者

// 产品接口：Go 的接口是隐式实现的，嵌入 LeiFeng 就自动满足
type Helper interface {
	Sweep()
	Wash()
	BuyRice()
}

// 工厂接口：只规定“能造一个雷锋”
type IFactory interface {
	CreateLeiFeng() Helper
}

// 每种产品配一个工厂，里面没有 switch
type UndergraduateFactory struct{}

func (UndergraduateFactory) CreateLeiFeng() Helper { return Undergraduate{LeiFeng{"大学生"}} }

type VolunteerFactory struct{}

func (VolunteerFactory) CreateLeiFeng() Helper { return Volunteer{LeiFeng{"志愿者"}} }

// 客户端：换人只改这一行
func main() {
	var factory IFactory = UndergraduateFactory{} // → VolunteerFactory{}
	student := factory.CreateLeiFeng()
	student.Sweep()   // 大学生扫地
	student.Wash()    // 大学生洗衣
	student.BuyRice() // 大学生买米
}`,
  compare: [
    { id: 'simple-factory', text: '简单工厂：**一个工厂 + switch**，加产品要改工厂。工厂方法：**一个产品一个工厂**，加产品只加类，但“选哪个工厂”交给了客户端。' },
    { id: 'abstract-factory', text: '工厂方法的每个工厂只造**一种**产品；抽象工厂的每个工厂造**一整套**相关产品（如 User + Department）。' },
  ],
  quiz: [
    { q: '日志组件要支持写文件、写数据库、发到远程服务器三种 Logger，以后还会更多。架构师要求：每种 Logger 配一个专门负责创建它的类，这些创建类都实现同一个接口；新增 Logger 时，不许修改任何已有的创建代码。', why: '一种产品配一个工厂、工厂实现同一接口、扩展只加不改——工厂方法。' },
    { q: '游戏框架的关卡父类里写好了“开局 → 刷怪 → 结算”的流程，其中“造一只怪”是一个抽象方法：森林关卡子类返回狼，沙漠关卡子类返回蝎子。父类只管调用，不知道造出来的具体是什么。', why: '由子类决定实例化哪个类，创建被延迟到子类——工厂方法。' },
  ],

  nodes: {
    // 场景一：学雷锋
    xue: { kind: 'actor', icon: '👨‍🎓', label: '薛磊风', sub: '学雷锋的大学生', x: 200, y: 290, tone: 'blue' },
    granny: { kind: 'actor', icon: '👵', label: '孤寡老人', sub: '需要有人照顾', x: 720, y: 290, tone: 'orange', size: 'lg' },
    mates: { kind: 'actor', icon: '👫', label: '小菜和同学们', sub: '学雷锋的大学生', x: 200, y: 300, tone: 'teal' },
    volp: { kind: 'actor', icon: '🙋', label: '社区志愿者', x: 200, y: 450, tone: 'green' },

    // 场景二：类图
    lf: { kind: 'class', title: 'LeiFeng', sub: '雷锋（产品）', lines: ['+ sweep()\u00a0\u00a0\u00a0扫地', '+ wash()\u00a0\u00a0\u00a0\u00a0洗衣', '+ buyRice() 买米'], x: 500, y: 95, tone: 'purple' },
    ug: { kind: 'class', title: 'Undergraduate', sub: '学雷锋的大学生', x: 330, y: 215, tone: 'teal' },
    vol: { kind: 'class', title: 'Volunteer', sub: '社区志愿者', x: 670, y: 215, tone: 'teal' },
    nb: { kind: 'class', title: 'Neighbor', sub: '热心邻居', x: 770, y: 215, tone: 'orange', badge: 'NEW' },
    sf: {
      kind: 'class', title: 'SimpleFactory', sub: '简单工厂（第 1 章的老办法）', x: 500, y: 395, tone: 'gray',
      lines: ['switch (type) {', '\u00a0\u00a0"学雷锋的大学生": new Undergraduate()', '\u00a0\u00a0"社区志愿者": new Volunteer()', '}'],
    },
    client: { kind: 'actor', icon: '👨‍💻', label: '客户端', sub: '调用方', x: 70, y: 300, tone: 'gray' },
    ifac: { kind: 'class', title: 'IFactory', stereo: 'interface', sub: '工厂接口', lines: ['+ createLeiFeng(): LeiFeng'], x: 500, y: 495, tone: 'indigo' },
    ugf: { kind: 'class', title: 'UndergraduateFactory', sub: '大学生工厂', lines: ['+ createLeiFeng()', '\u00a0\u00a0return new Undergraduate()'], x: 330, y: 355, tone: 'blue' },
    vf: { kind: 'class', title: 'VolunteerFactory', sub: '志愿者工厂', lines: ['+ createLeiFeng()', '\u00a0\u00a0return new Volunteer()'], x: 670, y: 355, tone: 'blue' },
    nf: { kind: 'class', title: 'NeighborFactory', sub: '邻居工厂', lines: ['+ createLeiFeng()', '\u00a0\u00a0return new Neighbor()'], x: 770, y: 355, tone: 'orange', badge: 'NEW' },
    code: { kind: 'box', shape: 'chip', mono: true, label: 'IFactory f = new UndergraduateFactory();', x: 190, y: 520, tone: 'gray' },
  },
  links: {
    i_ug: { from: 'ug', to: 'lf', kind: 'inherit' },
    i_vol: { from: 'vol', to: 'lf', kind: 'inherit' },
    i_nb: { from: 'nb', to: 'lf', kind: 'inherit' },
    s_c: { from: 'client', to: 'sf', kind: 'assoc' },
    s_ug: { from: 'sf', to: 'ug', kind: 'depend' },
    s_vol: { from: 'sf', to: 'vol', kind: 'depend' },
    m_ug: { from: 'ugf', to: 'ifac', kind: 'implement' },
    m_vf: { from: 'vf', to: 'ifac', kind: 'implement' },
    m_nf: { from: 'nf', to: 'ifac', kind: 'implement' },
    c_ug: { from: 'ugf', to: 'ug', kind: 'depend', label: '创建' },
    c_vol: { from: 'vf', to: 'vol', kind: 'depend', label: '创建' },
    c_nb: { from: 'nf', to: 'nb', kind: 'depend', label: '创建' },
    l_cu: { from: 'client', to: 'ugf', kind: 'depend', label: 'new' },
    l_cv: { from: 'client', to: 'vf', kind: 'depend', label: 'new', curve: -80, labelAt: 0.6 },
  },

  frames: [
    {
      title: '学雷锋做好事',
      text: '小菜讲了件真事：他的同学**薛磊风**以“学雷锋”的名义，长期去帮一位孤寡老人**扫地、洗衣、买米**。这三件活儿，就是我们要写进代码的“雷锋”。',
      show: ['xue', 'granny'],
      flows: [
        { from: 'xue', to: 'granny', icon: '🧹', label: '扫地' },
        { from: 'xue', to: 'granny', icon: '👕', label: '洗衣' },
        { from: 'xue', to: 'granny', icon: '🍚', label: '买米' },
      ],
    },
    {
      title: '他去不了，大家接力',
      text: '后来薛磊风去不了了，就托小菜和同学们接着去；以后社区志愿者也会来帮忙。老人不在乎来的是谁，只要有人扫地、洗衣、买米。**做事的人会变，做的事不变。**',
      show: ['mates', 'volp'],
      set: { xue: { y: 150, opacity: 0.35, badge: '去不了了' } },
      focus: ['mates', 'volp', 'granny'],
      flows: [
        { from: 'mates', to: 'granny', label: '扫地 · 洗衣 · 买米' },
        { from: 'volp', to: 'granny', label: '扫地 · 洗衣 · 买米' },
      ],
      bubbles: [{ node: 'granny', text: '谁来都行，**活儿都一样**', side: 'top', step: 1 }],
    },
    {
      title: '雷锋类和它的子类',
      text: '写成代码：**雷锋** `LeiFeng` 有扫地、洗衣、买米三个方法；学雷锋的大学生 `Undergraduate`、社区志愿者 `Volunteer` 都继承它。派谁去帮忙，就是 new 哪个子类。',
      clear: true,
      show: ['lf', 'ug', 'vol', 'i_ug', 'i_vol'],
      focus: ['lf', 'ug', 'vol'],
    },
    {
      title: '先用简单工厂试试',
      text: '先用第 1 章的**简单工厂**：客户端把 `"学雷锋的大学生"` 交给 `SimpleFactory`，工厂里的 switch 判断后 new 出 `Undergraduate`，以雷锋的身份交回来。能用，但有个隐患——',
      show: ['sf', 'client', 's_c', 's_ug', 's_vol'],
      focus: ['sf', 'client', 'ug', 's_c', 's_ug'],
      flows: [
        { from: 'client', to: 'sf', label: '"学雷锋的大学生"' },
        { from: 'sf', to: 'ug', label: 'new' },
        { from: 'sf', to: 'client', label: 'LeiFeng', back: true, tone: 'purple' },
      ],
    },
    {
      title: '加一种人，就得改工厂',
      text: '要是又来一种人，比如**热心邻居**，就得打开工厂、在 switch 里**再加一个 case**。每加一种就改一次，改一次就可能把别的改坏——工厂对修改没有关闭，违背了**开放-封闭原则**。',
      set: {
        sf: {
          badge: '又要改这里', tone: 'red',
          lines: ['switch (type) {', '\u00a0\u00a0"学雷锋的大学生": new Undergraduate()', '\u00a0\u00a0"社区志愿者": new Volunteer()', '!\u00a0\u00a0"热心邻居": new Neighbor()', '}'],
        },
      },
      focus: ['sf'],
      bubbles: [{ node: 'sf', text: '对修改**没关上**！', side: 'right', tone: 'red', delay: 0.6 }],
    },
    {
      title: '把工厂也抽象出来',
      text: '大鸟的办法：别让一个工厂包办所有判断。先定义**工厂接口** `IFactory`，只规定一件事：`createLeiFeng()`——能造出一个雷锋。至于造哪一种，交给实现它的**具体工厂**决定。',
      hide: ['sf'],
      show: ['ifac'],
      focus: ['ifac'],
    },
    {
      title: '一种人，配一个工厂',
      text: '然后**每种雷锋配一个工厂**：`UndergraduateFactory` 只造大学生，`VolunteerFactory` 只造志愿者。它们都实现 IFactory，各管各的，里面**一个 switch 都没有**。',
      show: ['ugf', 'vf', 'm_ug', 'm_vf', 'c_ug', 'c_vol'],
      focus: ['ugf', 'vf', 'ifac', 'ug', 'vol', 'c_ug', 'c_vol'],
    },
    {
      title: '跑一遍：派大学生去',
      text: '客户端先 new 一个 `UndergraduateFactory`，调用 `createLeiFeng()` 拿到一个雷锋，再让他扫地、洗衣、买米。客户端后面的代码只认 `LeiFeng`，并不知道来的具体是谁。',
      show: ['l_cu', 'code'],
      focus: ['client', 'ugf', 'ug', 'code', 'l_cu', 'c_ug'],
      flows: [
        { from: 'client', to: 'ugf', label: 'createLeiFeng()' },
        { from: 'ugf', to: 'ug', label: 'new' },
        { from: 'ugf', to: 'client', label: 'LeiFeng', back: true, tone: 'purple' },
        { from: 'client', to: 'ug', label: '扫地 · 洗衣 · 买米' },
      ],
    },
    {
      title: '换人？只改一行',
      text: '改派社区志愿者？客户端只改**一行**：`new UndergraduateFactory()` 换成 `new VolunteerFactory()`。后面扫地、洗衣、买米的代码，一个字都不用动。',
      hide: ['l_cu'],
      show: ['l_cv'],
      set: { code: { label: 'IFactory f = new VolunteerFactory();', badge: '只改这一行', tone: 'orange' } },
      focus: ['client', 'vf', 'vol', 'code', 'l_cv', 'c_vol'],
      flows: [
        { from: 'client', to: 'vf', label: 'createLeiFeng()', curve: -80 },
        { from: 'vf', to: 'vol', label: 'new' },
        { from: 'vf', to: 'client', label: 'LeiFeng', back: true, tone: 'purple', curve: 80 },
        { from: 'client', to: 'vol', label: '扫地 · 洗衣 · 买米', curve: 40 },
      ],
    },
    {
      title: '新来一种人：只加不改',
      text: '热心邻居也来帮忙？新增产品 `Neighbor` 和工厂 `NeighborFactory` **两个类**就行，已有的类**一行不改**。对比简单工厂得改 switch——这才是对扩展开放、对修改关闭。',
      show: ['nb', 'nf', 'i_nb', 'm_nf', 'c_nb'],
      set: {
        ug: { x: 230 }, ugf: { x: 230 }, vol: { x: 500 }, vf: { x: 500 },
        code: { badge: '', tone: 'gray' },
        l_cv: { curve: -60, label: '' },
      },
      focus: ['nb', 'nf', 'i_nb', 'm_nf', 'c_nb'],
    },
    {
      title: '判断搬到了客户端',
      text: '注意：工厂方法并没有消灭“选哪个”的判断，而是把它**从工厂内部搬到了客户端**。换来的是扩展时不改旧代码，代价是类变多了。想连这一行都不改？后面抽象工厂一章会用**反射 + 配置文件**。',
      set: { nb: { badge: '' }, nf: { badge: '' } },
      focus: ['client', 'code', 'l_cv'],
      bubbles: [
        { node: 'client', text: '用哪个工厂，**我说了算**', side: 'right', dy: -28 },
        { node: 'code', text: '判断从工厂里搬到了这一行', side: 'top', delay: 0.6 },
      ],
    },
    {
      title: '总结：工厂方法',
      text: '四个角色：**产品** LeiFeng、具体产品（大学生、志愿者、邻居）、**工厂接口** IFactory、具体工厂（各造各的）。“实例化哪个类”延迟到工厂子类决定。一句话记住：**每个产品配个厂，扩展只加不改。**',
      focus: ['ifac', 'lf', 'ugf', 'vf', 'nf', 'c_ug', 'c_vol', 'c_nb'],
      bubbles: [
        { node: 'ifac', text: '我只定规矩：能造雷锋', side: 'right' },
        { node: 'lf', text: '谁来都是雷锋', side: 'right', delay: 0.5 },
      ],
    },
  ],
});
