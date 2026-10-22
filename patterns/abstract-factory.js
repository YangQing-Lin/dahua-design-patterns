DP.register({
  id: 'abstract-factory',
  order: 15,
  type: 'creational',
  name: '抽象工厂模式',
  en: 'Abstract Factory',
  emoji: '🗄️',
  chapter: '第 15 章 · 就不能不换DB吗？',
  mnemonic: '一个工厂造一套，换套只换工厂',
  summary: '一个工厂负责创建一整套相关的对象；要换一整套实现，只需换一个工厂。',
  intent: '提供一个创建一系列相关或相互依赖对象的接口，而无需指定它们具体的类。',
  story: '小菜给一家企业做的项目用的是 **SQL Server**，另一家公司也要同样的系统，却只有 **Access**。代码里到处是 `new SqlserverUser()`，换库等于大改。大鸟带他先用工厂方法，再加上部门表，发展成**抽象工厂**：用户表、部门表这一整套访问类由同一个工厂创建；最后用**反射 + 配置文件**连 switch 都去掉了。',
  analogy: '装修选整套风格：选“北欧风”套餐，沙发、餐桌、灯具全是北欧风；换“中式”套餐，就整套一起换。你不会买到北欧沙发配中式茶几——一个套餐（工厂）保证了整套风格（产品族）一致。',
  when: [
    '系统要在**多个产品系列**之间切换（如 SQL Server / Access 两套数据访问类）',
    '同一系列的产品必须**配套使用**，不能混搭',
    '希望客户端只依赖接口，代码里不出现具体类名',
  ],
  pros: ['换一整个系列只需换**一个具体工厂**（配合反射甚至只改配置）', '保证同一系列的产品配套使用，不会混搭', '客户端只认识接口，具体类名被隔离在工厂里'],
  cons: ['新增一种**产品**（如项目表 Project）要改工厂接口和**所有**具体工厂', '类的数量多：每个系列 × 每种产品都要一个类'],
  keyPoints: [
    '**产品族**（横向：SQL Server 一套、Access 一套）vs **产品种类**（纵向：User、Department）',
    '加一个**系列**（如 Oracle）很容易，只加不改；加一种**产品**（如 Project 表）很痛苦，所有工厂都要改',
    '书中改进：简单工厂 `DataAccess` + **反射** + **配置文件**，换数据库连代码都不用改',
  ],
  code: `
// 两种产品的抽象：用户表、部门表的访问接口
interface IUser       { void insert(User u);       User getUser(int id); }
interface IDepartment { void insert(Department d); Department getDepartment(int id); }

// SQL Server 一套（Access 一套同理：AccessUser、AccessDepartment）
class SqlserverUser implements IUser { /* 用 SQL Server 访问 User 表 */ }
class SqlserverDepartment implements IDepartment { /* … */ }

// 抽象工厂：声明“一整套”产品的创建方法
interface IFactory {
    IUser createUser();
    IDepartment createDepartment();
}
class SqlServerFactory implements IFactory {
    public IUser createUser()             { return new SqlserverUser(); }
    public IDepartment createDepartment() { return new SqlserverDepartment(); }
}
class AccessFactory implements IFactory {
    public IUser createUser()             { return new AccessUser(); }
    public IDepartment createDepartment() { return new AccessDepartment(); }
}

// 客户端：换数据库只改这一行
IFactory factory = new AccessFactory();
IUser iu = factory.createUser();
iu.insert(user);
IDepartment idept = factory.createDepartment();
idept.insert(dept);

// 书中改进：简单工厂 + 反射 + 配置文件（db=Access），连上面那一行都不用改
class DataAccess {
    private static final String db = Config.read("db");   // "Sqlserver" 或 "Access"
    public static IUser createUser() throws Exception {
        return (IUser) Class.forName(db + "User").getDeclaredConstructor().newInstance();
    }
    public static IDepartment createDepartment() throws Exception {
        return (IDepartment) Class.forName(db + "Department").getDeclaredConstructor().newInstance();
    }
}`,
  codePython: `
from abc import ABC, abstractmethod


# 两种产品的抽象：用户表、部门表的访问接口
class IUser(ABC):
    @abstractmethod
    def insert(self, user): ...


class IDepartment(ABC):
    @abstractmethod
    def insert(self, dept): ...


# SQL Server 一套、Access 一套（这里只打印，代替真正的数据库访问）
class SqlserverUser(IUser):
    def insert(self, user): print(f"在 SQL Server 中给 User 表增加一条记录 {user}")


class SqlserverDepartment(IDepartment):
    def insert(self, dept): print(f"在 SQL Server 中给 Department 表增加一条记录 {dept}")


class AccessUser(IUser):
    def insert(self, user): print(f"在 Access 中给 User 表增加一条记录 {user}")


class AccessDepartment(IDepartment):
    def insert(self, dept): print(f"在 Access 中给 Department 表增加一条记录 {dept}")


# 抽象工厂：声明“一整套”产品的创建方法
class IFactory(ABC):
    @abstractmethod
    def create_user(self) -> IUser: ...
    @abstractmethod
    def create_department(self) -> IDepartment: ...


class SqlServerFactory(IFactory):
    def create_user(self): return SqlserverUser()
    def create_department(self): return SqlserverDepartment()


class AccessFactory(IFactory):
    def create_user(self): return AccessUser()
    def create_department(self): return AccessDepartment()


# 书中改进（反射 + 配置）：Python 用“配置字符串 → 工厂类”查表，也可以 getattr(模块, db + "Factory")
FACTORIES = {"Sqlserver": SqlServerFactory, "Access": AccessFactory}
db = "Access"                          # 假装从配置文件读到的，改它就换了整套数据库

if __name__ == "__main__":
    factory = FACTORIES[db]()          # 或直接写 AccessFactory()
    factory.create_user().insert("小菜")           # 在 Access 中给 User 表增加一条记录 小菜
    factory.create_department().insert("研发部")   # 在 Access 中给 Department 表增加一条记录 研发部`,
  codeGo: `
package main

import "fmt"

// 两种产品的抽象：用户表、部门表的访问接口
type IUser interface{ Insert(user string) }
type IDepartment interface{ Insert(dept string) }

// SQL Server 一套、Access 一套（这里只打印，代替真正的数据库访问）
type SqlserverUser struct{}
type SqlserverDepartment struct{}
type AccessUser struct{}
type AccessDepartment struct{}

func (SqlserverUser) Insert(u string) {
	fmt.Println("在 SQL Server 中给 User 表增加一条记录", u)
}
func (SqlserverDepartment) Insert(d string) {
	fmt.Println("在 SQL Server 中给 Department 表增加一条记录", d)
}
func (AccessUser) Insert(u string) { fmt.Println("在 Access 中给 User 表增加一条记录", u) }
func (AccessDepartment) Insert(d string) {
	fmt.Println("在 Access 中给 Department 表增加一条记录", d)
}

// 抽象工厂：声明“一整套”产品的创建方法
type IFactory interface {
	CreateUser() IUser
	CreateDepartment() IDepartment
}

type SqlServerFactory struct{}

func (SqlServerFactory) CreateUser() IUser             { return SqlserverUser{} }
func (SqlServerFactory) CreateDepartment() IDepartment { return SqlserverDepartment{} }

type AccessFactory struct{}

func (AccessFactory) CreateUser() IUser             { return AccessUser{} }
func (AccessFactory) CreateDepartment() IDepartment { return AccessDepartment{} }

// 书中改进（反射 + 配置）：Go 不能按类名字符串反射出构造函数，
// 惯用做法是注册表 map[string]func() IFactory，用配置里的字符串查表
var factories = map[string]func() IFactory{
	"Sqlserver": func() IFactory { return SqlServerFactory{} },
	"Access":    func() IFactory { return AccessFactory{} },
}

func main() {
	db := "Access" // 假装从配置文件读到的，改它就换了整套数据库
	factory := factories[db]()
	factory.CreateUser().Insert("小菜")        // 在 Access 中给 User 表增加一条记录 小菜
	factory.CreateDepartment().Insert("研发部") // 在 Access 中给 Department 表增加一条记录 研发部
}`,
  compare: [
    { id: 'factory-method', text: '工厂方法：一个工厂只造**一种**产品；抽象工厂：一个工厂造**一整套相关产品**（User + Department），切换的是整个系列。' },
    { id: 'builder', text: '建造者关心**一个复杂对象**如何按步骤组装；抽象工厂关心**一系列相关对象**由谁来造，每个产品造好立即返回。' },
  ],
  quiz: [
    { q: '跨平台 UI 库：Windows 下按钮、滚动条、菜单都要 Windows 风格，Mac 下全部换成 Mac 风格。程序启动时根据操作系统选定一个“组件工厂”，之后所有控件都从这个工厂拿，保证风格统一。', why: '一个工厂造一整套配套产品（产品族），换平台 = 换工厂。' },
    { q: '游戏有“中世纪”和“科幻”两种主题，每个主题都有配套的士兵、建筑、武器。切换主题时必须整套一起换，绝不能出现科幻士兵住进中世纪城堡。', why: '多个产品要按“系列”配套创建、整体切换——抽象工厂。' },
  ],

  nodes: {
    // 场景一：故事
    xc: { kind: 'actor', icon: '👨‍💻', label: '小菜', x: 130, y: 290, tone: 'blue' },
    proj: { kind: 'box', icon: '💻', label: '项目代码', sub: '给一家企业做的系统', x: 400, y: 290, tone: 'blue' },
    sqldb: { kind: 'box', icon: '🗄️', label: 'SQL Server', sub: '原来的客户', x: 750, y: 170, tone: 'indigo' },
    accdb: { kind: 'box', icon: '🗃️', label: 'Access', sub: '新客户只有它', x: 750, y: 400, tone: 'green' },
    // 场景二：坏代码
    badc: { kind: 'class', title: 'Client', sub: '小菜最初的写法', lines: ['User user = new User();', '!SqlserverUser su = new SqlserverUser();', 'su.insert(user);', 'su.getUser(1);'], x: 330, y: 290, tone: 'red' },
    badu: { kind: 'class', title: 'SqlserverUser', sub: '只会访问 SQL Server', lines: ['+ insert(user)', '+ getUser(id)'], x: 750, y: 290, tone: 'indigo' },

    // 场景三：抽象工厂（行 = 产品族，列 = 产品种类）
    zSql: { kind: 'zone', label: 'SQL Server 一套', x: 595, y: 145, w: 750, h: 150, tone: 'indigo' },
    zAcc: { kind: 'zone', label: 'Access 一套', x: 595, y: 475, w: 750, h: 150, tone: 'green' },
    client: { kind: 'actor', icon: '👨‍💻', label: '客户端', sub: 'new SqlServerFactory()', x: 90, y: 310, tone: 'gray' },
    ifac: { kind: 'class', title: 'IFactory', stereo: 'interface', sub: '抽象工厂', lines: ['+ createUser()'], x: 330, y: 310, tone: 'purple' },
    sf: { kind: 'class', title: 'SqlServerFactory', sub: '具体工厂', lines: ['+ createUser()'], x: 330, y: 150, tone: 'indigo' },
    af: { kind: 'class', title: 'AccessFactory', sub: '具体工厂', lines: ['+ createUser()'], x: 330, y: 470, tone: 'green' },
    iu: { kind: 'class', title: 'IUser', stereo: 'interface', sub: '用户表访问接口', lines: ['+ insert(user)', '+ getUser(id)'], x: 590, y: 310, tone: 'purple' },
    su: { kind: 'class', title: 'SqlserverUser', sub: 'SQL Server 版', x: 590, y: 150, tone: 'indigo' },
    au: { kind: 'class', title: 'AccessUser', sub: 'Access 版', x: 590, y: 470, tone: 'green' },
    idp: { kind: 'class', title: 'IDepartment', stereo: 'interface', sub: '部门表访问接口', lines: ['+ insert(dept)', '+ getDepartment(id)'], x: 840, y: 310, tone: 'purple' },
    sd: { kind: 'class', title: 'SqlserverDepartment', sub: 'SQL Server 版', x: 840, y: 150, tone: 'indigo' },
    ad: { kind: 'class', title: 'AccessDepartment', sub: 'Access 版', x: 840, y: 470, tone: 'green' },
    note: { kind: 'box', shape: 'note', icon: '➕', label: '还要新增 3 个类', sub: 'IProject、SqlserverProject、AccessProject', w: 196, x: 114, y: 470 },
    da: {
      kind: 'class', title: 'DataAccess', sub: '简单工厂：一个顶三个', x: 330, y: 310, tone: 'orange',
      lines: ['- db = "Sqlserver"', '+ createUser()', '\u00a0\u00a0switch (db) { … }', '+ createDepartment()', '\u00a0\u00a0switch (db) { … }'],
    },
    cfg: { kind: 'box', shape: 'note', icon: '📄', label: 'App.config', sub: 'db = Access', x: 110, y: 470 },
  },
  links: {
    p_sql: { from: 'proj', to: 'sqldb', kind: 'assoc' },
    p_acc: { from: 'proj', to: 'accdb', kind: 'dashed', label: '能直接换吗？' },
    b_l: { from: 'badc', to: 'badu', kind: 'assoc', label: '焊死了' },
    m_su: { from: 'su', to: 'iu', kind: 'implement' },
    m_au: { from: 'au', to: 'iu', kind: 'implement' },
    m_sd: { from: 'sd', to: 'idp', kind: 'implement' },
    m_ad: { from: 'ad', to: 'idp', kind: 'implement' },
    m_sf: { from: 'sf', to: 'ifac', kind: 'implement' },
    m_af: { from: 'af', to: 'ifac', kind: 'implement' },
    k_su: { from: 'sf', to: 'su', kind: 'depend', label: '创建' },
    k_au: { from: 'af', to: 'au', kind: 'depend', label: '创建' },
    k_sd: { from: 'sf', to: 'sd', kind: 'depend', curve: -110 },
    k_ad: { from: 'af', to: 'ad', kind: 'depend', curve: 110 },
    l_ci: { from: 'client', to: 'ifac', kind: 'assoc' },
    l_cd: { from: 'client', to: 'da', kind: 'assoc' },
    l_dd: { from: 'da', to: 'iu', kind: 'depend', label: '创建' },
  },

  frames: [
    {
      title: '同一套系统，换个数据库',
      text: '小菜帮一家企业做了个项目，数据库用的是 **SQL Server**。另一家公司也想要一套一模一样的，可他们只有 **Access**。“不就是换个数据库嘛？”小菜一动手才发现：到处都得改。',
      show: ['xc', 'proj', 'sqldb', 'accdb', 'p_sql', 'p_acc'],
      flows: [{ from: 'xc', to: 'proj', icon: '🤔', label: '改改就行？' }],
      bubbles: [{ node: 'accdb', text: '我们只有 **Access**！', side: 'bottom' }],
    },
    {
      title: '问题：new 写死了',
      text: '小菜最初的写法：客户端里直接 `new SqlserverUser()`。这一行把代码和 SQL Server **焊死**了。换成 Access？得把每个 new 的地方都找出来改，项目里这样的地方可不止一两处。',
      clear: true,
      show: ['badc', 'badu', 'b_l'],
      set: { badc: { badge: '换库就得改' } },
      focus: ['badc', 'badu', 'b_l'],
    },
    {
      title: '第一步：面向接口',
      text: '大鸟：先把“访问用户表”抽象成接口 `IUser`（insert、getUser），SQL Server 和 Access 各写一个实现：`SqlserverUser`、`AccessUser`。客户端只面向 **IUser** 编程，不关心背后是哪个库。',
      clear: true,
      show: ['iu', 'su', 'au', 'm_su', 'm_au'],
      focus: ['iu', 'su', 'au'],
    },
    {
      title: '第二步：工厂方法',
      text: '再用上回学的**工厂方法**：工厂接口 `IFactory` 规定“能造一个 IUser”，`SqlServerFactory` 造 SQL Server 版，`AccessFactory` 造 Access 版。换库时，客户端只改 new 哪个工厂这一行。',
      show: ['ifac', 'sf', 'af', 'client', 'm_sf', 'm_af', 'k_su', 'k_au', 'l_ci'],
      focus: ['ifac', 'sf', 'af', 'client', 'k_su', 'k_au'],
    },
    {
      title: '加张部门表：抽象工厂诞生',
      text: '可数据库里不止一张表。加上**部门表**：接口 `IDepartment` 和两个实现；每个工厂也多了一个 `createDepartment()`。一个工厂负责造**一整套**相关产品——这就是**抽象工厂**。',
      show: ['idp', 'sd', 'ad', 'm_sd', 'm_ad', 'k_sd', 'k_ad'],
      set: {
        ifac: { lines: ['+ createUser()', '!+ createDepartment()'] },
        sf: { lines: ['+ createUser()', '!+ createDepartment()'] },
        af: { lines: ['+ createUser()', '!+ createDepartment()'] },
      },
      focus: ['idp', 'sd', 'ad', 'ifac', 'sf', 'af', 'k_sd', 'k_ad'],
    },
    {
      title: '一套一套地换：产品族',
      text: '横着看：SQL Server 的 User、Department 和它的工厂是**一家人**，叫一个**产品族**；Access 是另一族。竖着看：User、Department 是不同的产品种类。换数据库，就是**整族一起换**。',
      show: ['zSql', 'zAcc'],
      set: {
        ifac: { lines: ['+ createUser()', '+ createDepartment()'] },
        sf: { lines: ['+ createUser()', '+ createDepartment()'] },
        af: { lines: ['+ createUser()', '+ createDepartment()'] },
      },
      focus: ['zSql', 'zAcc', 'sf', 'su', 'sd', 'af', 'au', 'ad'],
    },
    {
      title: '跑一遍：SQL Server',
      text: '客户端拿着 `SqlServerFactory`：要用户表就 `createUser()`，要部门表就 `createDepartment()`。拿到手的是接口 `IUser`、`IDepartment`，客户端根本不知道背后是 SQL Server。',
      focus: ['client', 'sf', 'su', 'sd', 'zSql'],
      flows: [
        { from: 'client', to: 'sf', label: 'createUser()' },
        { from: 'sf', to: 'su', label: 'new' },
        { from: 'client', to: 'sf', label: 'createDepartment()' },
        { from: 'sf', to: 'sd', label: 'new', curve: -110 },
      ],
    },
    {
      title: '换成 Access：只改一行',
      text: '新客户用 Access？客户端只把 `new SqlServerFactory()` 改成 `new AccessFactory()`，后面的代码一字不改。造出来的 User、Department **整套都是 Access 版**，绝不会混搭。',
      set: { client: { sub: 'new AccessFactory()', badge: '只改这一行' } },
      focus: ['client', 'af', 'au', 'ad', 'zAcc'],
      flows: [
        { from: 'client', to: 'af', label: 'createUser()' },
        { from: 'af', to: 'au', label: 'new' },
        { from: 'client', to: 'af', label: 'createDepartment()' },
        { from: 'af', to: 'ad', label: 'new', curve: 110 },
      ],
    },
    {
      title: '短板：加一张表很痛苦',
      text: '抽象工厂也有软肋：要是再加一张**项目表** Project，除了新增 3 个类，还得改 `IFactory`、`SqlServerFactory`、`AccessFactory` **所有工厂**。加一“族”容易，加一种“产品”难。',
      show: ['note'],
      set: {
        client: { badge: '' },
        ifac: { badge: '要改', lines: ['+ createUser()', '+ createDepartment()', '!+ createProject()'] },
        sf: { badge: '要改', lines: ['+ createUser()', '+ createDepartment()', '!+ createProject()'] },
        af: { badge: '要改', lines: ['+ createUser()', '+ createDepartment()', '!+ createProject()'] },
      },
      focus: ['ifac', 'sf', 'af', 'note'],
    },
    {
      title: '改进：简单工厂 DataAccess',
      text: '大鸟：既然换库是**一整套**一起换，不如扔掉 IFactory 和那几个工厂类，只用一个**简单工厂** `DataAccess`，由字段 `db` 决定 new 哪一套。客户端连工厂都不用选了。可 switch 又回来了：加个 Oracle，每个 switch 都得改。',
      hide: ['ifac', 'sf', 'af', 'note'],
      show: ['da', 'l_cd', 'l_dd'],
      set: { client: { sub: '只认识 DataAccess' }, da: { badge: 'switch 又回来了' } },
      focus: ['da', 'client', 'l_cd'],
      flows: [
        { from: 'client', to: 'da', label: 'createUser()' },
        { from: 'da', to: 'su', label: 'new' },
      ],
    },
    {
      title: '终极：反射 + 配置文件',
      text: '最后一招：**反射 + 配置文件**。类名用字符串拼出来——`"Access" + "User"`——再用反射创建对象；`db` 的值写在配置文件里。从此换数据库**只改配置，一行代码都不用动**，switch 也消失了。',
      show: ['cfg'],
      set: {
        da: { badge: '', lines: ['- db = 读配置文件', '+ createUser()', '!\u00a0\u00a0反射 new (db + "User")', '+ createDepartment()', '!\u00a0\u00a0反射 new (db + "Department")'] },
        cfg: { badge: '只改这里' },
      },
      focus: ['cfg', 'da', 'au', 'ad'],
      flows: [
        { from: 'cfg', to: 'da', label: 'db = "Access"' },
        { from: 'da', to: 'au', label: '"AccessUser"' },
        { from: 'da', to: 'ad', label: '"AccessDepartment"' },
      ],
    },
    {
      title: '总结：抽象工厂',
      text: '四个角色：**抽象工厂** IFactory、具体工厂（每族一个）、**抽象产品** IUser / IDepartment、具体产品。它提供一个创建**一系列相关对象**的接口。一句话记住：**一个工厂造一套，换套只换工厂。**',
      hide: ['da', 'cfg'],
      show: ['ifac', 'sf', 'af', 'l_ci'],
      set: {
        client: { sub: 'new AccessFactory()' },
        ifac: { badge: '', lines: ['+ createUser()', '+ createDepartment()'] },
        sf: { badge: '', lines: ['+ createUser()', '+ createDepartment()'] },
        af: { badge: '', lines: ['+ createUser()', '+ createDepartment()'] },
      },
      focus: ['ifac', 'sf', 'af', 'zSql', 'zAcc'],
      bubbles: [{ node: 'zSql', text: '一个工厂，负责**一整套**', side: 'top', dx: 120 }],
    },
  ],
});
