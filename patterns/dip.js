DP.register({
  id: 'dip',
  order: 5,
  type: 'principle',
  name: '依赖倒转原则',
  en: 'Dependency Inversion Principle',
  emoji: '🔌',
  chapter: '第 5 章 · 会修电脑不会修收音机？',
  mnemonic: '上下都插接口，谁也不焊死谁',
  summary: '高层和底层都只认接口：针对接口编程，而不是针对具体实现编程。',
  intent: 'A. 高层模块不应该依赖低层模块，两个都应该依赖抽象。B. 抽象不应该依赖细节，细节应该依赖于抽象。说白了就是：**针对接口编程，不要对实现编程**。',
  story: '小菜帮一位 MM 修电脑，换根内存条就好了，很是得意；大鸟却问他会不会修**收音机**。电脑零件都按**标准接口**生产，内存坏了拔掉换一根，哪个牌子都能插；收音机的元件却全**焊死**在一起，一处坏了牵连一片。程序也该像电脑：大家都依赖接口，而不是互相焊死。',
  analogy: '墙上的插座：台灯、手机充电器、电饭煲只认“国标插头”这个标准，电网也只管往插座里供电。家电和电厂互不认识，换哪一边都不用拆墙重新接线。',
  when: [
    '业务逻辑要调用数据库、文件、网络、第三方服务等**可能被更换**的底层实现',
    '希望写单元测试时，能用“假对象”替换真实的数据库或外部接口',
    '同一套业务逻辑要在不同项目里**复用**，而每个项目的底层技术不一样',
  ],
  pros: ['底层可以**随意替换**（换数据库、换供应商），高层代码不动', '模块之间松耦合，便于**并行开发、单独测试**', '是实现“开放-封闭”的主要手段：扩展靠新增实现类'],
  cons: ['多了一层接口，很简单的场景会显得啰嗦', '需要有人负责“把具体实现插进来”（工厂 / 依赖注入），初学者容易找不到对象在哪创建'],
  keyPoints: [
    '“倒转”指的是**依赖箭头的方向**：原来 业务 → SQL Server；现在 SQL Server → 接口 ← 业务，底层反过来去迎合接口',
    '接口应该按**高层的需要**来定义（业务需要什么方法就定义什么），而不是照抄某个数据库的 API',
    '能放心依赖抽象，前提是任何子类都真能顶替父类——这由**里氏代换原则**保证',
    '书中观点：依赖倒转是**面向对象设计的标志**；如果依赖关系都终止于具体类，那就是过程化的设计',
  ],
  code: `
// ❌ 倒转之前：业务逻辑（高层）直接依赖 SQL Server（低层）
class SqlServerDao {
    public void insert(String user) { /* SQL Server 的写法 */ }
}
class UserServiceOld {
    private SqlServerDao dao = new SqlServerDao();    // 焊死了
    public void register(String user) { dao.insert(user); }
}

// ✅ 倒转之后：高层和低层都依赖“抽象”
interface IDataAccess {                  // 按业务的需要来定义
    void insert(String user);
}
class SqlServerDataAccess implements IDataAccess {    // 细节依赖抽象
    public void insert(String user) { /* SQL Server 的写法 */ }
}
class AccessDataAccess implements IDataAccess {       // 换库？加一个实现
    public void insert(String user) { /* Access 的写法 */ }
}
class UserService {                      // 高层只认 IDataAccess
    private final IDataAccess db;
    UserService(IDataAccess db) { this.db = db; }     // 从外面“插”进来
    public void register(String user) { db.insert(user); }
}

// 组装：换数据库只改这一行，UserService 一个字不动
UserService service = new UserService(new AccessDataAccess());
service.register("小菜");`,
  codePython: `
from abc import ABC, abstractmethod


# ❌ 倒转之前：业务逻辑（高层）直接依赖 SQL Server（低层）
class SqlServerDao:
    def insert(self, user):
        print(f"SQL Server 写入：{user}")      # SQL Server 的写法


class UserServiceOld:
    def __init__(self):
        self._dao = SqlServerDao()              # 焊死了

    def register(self, user):
        self._dao.insert(user)


# ✅ 倒转之后：高层和低层都依赖“抽象”
class IDataAccess(ABC):                         # 按业务的需要来定义
    @abstractmethod
    def insert(self, user: str) -> None: ...


class SqlServerDataAccess(IDataAccess):         # 细节依赖抽象
    def insert(self, user):
        print(f"SQL Server 写入：{user}")


class AccessDataAccess(IDataAccess):            # 换库？加一个实现
    def insert(self, user):
        print(f"Access 写入：{user}")


class UserService:                              # 高层只认 IDataAccess
    def __init__(self, db: IDataAccess):
        self._db = db                           # 从外面“插”进来

    def register(self, user):
        self._db.insert(user)


# 组装：换数据库只改这一行，UserService 一个字不动
if __name__ == "__main__":
    service = UserService(AccessDataAccess())
    service.register("小菜")                    # Access 写入：小菜
    UserService(SqlServerDataAccess()).register("小菜")   # SQL Server 写入：小菜
    # Python 小贴士：鸭子类型下，不继承 IDataAccess 只要有 insert 也能插进来`,
  codeGo: `
package main

import "fmt"

// ✅ 倒转之后：高层和低层都依赖“抽象”
// 接口由高层（业务）按需要定义，放在使用方这一侧
type IDataAccess interface {
	Insert(user string)
}

// Go 的接口是隐式满足的：下面两个低层模块根本没写 implements，
// 甚至不用 import 或认识 IDataAccess，只要方法对得上就能插进来。
// 这让依赖倒转在 Go 里非常自然。
type SqlServerDataAccess struct{}

func (SqlServerDataAccess) Insert(user string) { fmt.Println("SQL Server 写入：" + user) }

type AccessDataAccess struct{} // 换库？加一个实现

func (AccessDataAccess) Insert(user string) { fmt.Println("Access 写入：" + user) }

// ❌ 倒转之前（保留为注释）：高层直接依赖低层，焊死了
// type UserServiceOld struct{ dao SqlServerDataAccess }

// 高层只认 IDataAccess
type UserService struct{ db IDataAccess }

// 从外面“插”进来（构造函数注入）
func NewUserService(db IDataAccess) *UserService { return &UserService{db} }

func (s *UserService) Register(user string) { s.db.Insert(user) }

// 组装：换数据库只改这一行，UserService 一个字不动
func main() {
	service := NewUserService(AccessDataAccess{})
	service.Register("小菜")                               // Access 写入：小菜
	NewUserService(SqlServerDataAccess{}).Register("小菜") // SQL Server 写入：小菜
}`,
  compare: [
    { id: 'lsp', text: '依赖倒转说“**大家都去依赖接口**”；里氏代换保证“**接口背后的任何子类都真能顶上**”。前者定方向，后者保质量。' },
    { id: 'ocp', text: '开放-封闭是**目标**（只加不改）；依赖倒转是实现它的**手段**（面向接口，新实现插进来就行）。' },
  ],
  quiz: [
    { q: '订单服务里直接写着 `new MySqlOrderRepository()`。公司要迁移到 PostgreSQL，结果订单服务的业务代码也得跟着大改。架构师建议：订单服务只认一个“仓储接口”，具体用哪种数据库的实现，由外部传进来。', why: '高层业务依赖了低层的具体实现；改成两者都依赖抽象接口，换底层不动高层。' },
    { q: '给一个业务类写单元测试时发现：它在构造函数里直接 new 了一个连接真实支付网关的 `AlipayClient`，一跑测试就真的扣钱。改法是让业务类只依赖一个“支付接口”，测试时传入假的实现。', why: '业务类焊死在具体底层类上，测试时换不掉；面向接口编程后，生产和测试可以插入不同实现。' },
  ],

  nodes: {
    /* —— 场景一：修电脑 —— */
    mm: { kind: 'actor', icon: '👩', label: 'MM', sub: '电脑老是死机', x: 170, y: 290, tone: 'pink' },
    xc: { kind: 'actor', icon: '👦', label: '小菜', x: 450, y: 290, tone: 'blue' },
    pc: { kind: 'box', icon: '🖥️', label: '她的电脑', sub: '一开机就蓝屏', x: 770, y: 290, tone: 'gray' },

    /* —— 场景二：主板与插槽 —— */
    board: { kind: 'zone', label: '主板', x: 360, y: 300, w: 500, h: 320, tone: 'gray' },
    slotRam: { kind: 'zone', label: '内存插槽 · 标准接口', x: 245, y: 245, w: 210, h: 90, tone: 'indigo' },
    slotCpu: { kind: 'zone', label: 'CPU 插座 · 标准接口', x: 485, y: 245, w: 210, h: 90, tone: 'indigo' },
    slotDisk: { kind: 'zone', label: 'SATA 接口 · 标准接口', x: 360, y: 390, w: 240, h: 90, tone: 'indigo' },
    cpu: { kind: 'box', shape: 'chip', icon: '🔲', label: 'Intel CPU', x: 485, y: 255, tone: 'teal' },
    disk: { kind: 'box', shape: 'chip', icon: '💽', label: '希捷硬盘', x: 360, y: 400, tone: 'teal' },
    ramOld: { kind: 'box', shape: 'chip', icon: '💳', label: '旧内存条', x: 245, y: 255, tone: 'red' },
    ramNew: { kind: 'box', shape: 'chip', icon: '💳', label: '金士顿 8G', x: 820, y: 170, tone: 'green' },
    ramAlt: { kind: 'box', shape: 'chip', icon: '💳', label: '三星 8G', x: 820, y: 290, tone: 'green' },

    /* —— 场景三：收音机 —— */
    radio: { kind: 'zone', label: '收音机：元件全焊在电路板上', x: 370, y: 300, w: 480, h: 300, tone: 'orange' },
    c1: { kind: 'box', shape: 'chip', icon: '〰️', label: '电阻', x: 240, y: 220, tone: 'orange' },
    c2: { kind: 'box', shape: 'chip', icon: '🔋', label: '电容', x: 500, y: 220, tone: 'orange' },
    c3: { kind: 'box', shape: 'chip', icon: '🔺', label: '三极管', x: 240, y: 385, tone: 'orange' },
    c4: { kind: 'box', shape: 'chip', icon: '🌀', label: '线圈', x: 500, y: 385, tone: 'orange' },
    dn: { kind: 'actor', icon: '🧔', label: '大鸟', x: 820, y: 170, tone: 'purple' },

    /* —— 场景四：代码 —— */
    svc: { kind: 'class', title: 'UserService', sub: '业务逻辑 · 高层模块', lines: ['- dao: SqlServerDataAccess', '!+ register(user)'], x: 360, y: 118, tone: 'blue' },
    sql: { kind: 'class', title: 'SqlServerDataAccess', sub: '数据访问 · 低层模块', lines: ['+ insert(user)'], x: 360, y: 340, tone: 'teal' },
    iface: { kind: 'class', title: 'IDataAccess', stereo: 'interface', sub: '抽象：按业务需要定义', lines: ['+ insert(user)'], x: 360, y: 292, tone: 'purple' },
    access: { kind: 'class', title: 'AccessDataAccess', sub: '另一种数据库', lines: ['+ insert(user)'], x: 640, y: 340, tone: 'orange' },
    client: { kind: 'actor', icon: '👔', label: '新客户', x: 830, y: 410, tone: 'gray' },
    tBefore: { kind: 'text', text: '以前：业务 ➜ SQL Server\n高层依赖低层', x: 790, y: 235, w: 270, tone: 'red' },
    tAfter: { kind: 'text', text: '现在：业务 ➜ 接口 ⬅ SQL Server\n大家都依赖抽象，箭头倒过来了', x: 790, y: 335, w: 270, tone: 'green' },
  },
  links: {
    lr1: { from: 'c1', to: 'c2', kind: 'line', tone: 'red', label: '焊死' },
    lr2: { from: 'c2', to: 'c4', kind: 'line', tone: 'red' },
    lr3: { from: 'c3', to: 'c4', kind: 'line', tone: 'red', label: '焊死' },
    lr4: { from: 'c1', to: 'c3', kind: 'line', tone: 'red' },
    lr5: { from: 'c1', to: 'c4', kind: 'line', tone: 'red' },
    l_bad: { from: 'svc', to: 'sql', kind: 'assoc', label: '直接 new，焊死了', tone: 'red' },
    l_use: { from: 'svc', to: 'iface', kind: 'depend', label: '只依赖接口' },
    l_sql: { from: 'sql', to: 'iface', kind: 'implement', label: '实现' },
    l_acc: { from: 'access', to: 'iface', kind: 'implement', label: '实现' },
  },

  frames: [
    {
      title: '小菜帮 MM 修电脑',
      text: '小菜跟大鸟炫耀：他帮一位 MM 修好了电脑。电脑老是死机，他拆开机箱一看，是**内存条**坏了，换一根就搞定，前后不到十分钟。为什么修电脑能这么轻松？',
      show: ['mm', 'xc', 'pc'],
      flows: [{ from: 'xc', to: 'pc', icon: '🔧', label: '拆机箱，换内存' }],
      bubbles: [
        { node: 'mm', text: '电脑老死机，帮我看看？', side: 'top' },
        { node: 'xc', text: '小意思，**换根内存**就好！', side: 'top', step: 0 },
      ],
    },
    {
      title: '主板只认标准插槽',
      text: '打开机箱：CPU、内存、硬盘都插在主板上，每个位置都是一个**标准插槽**。主板根本不认识插进来的是谁家的零件，它只认“插槽规格”这个**约定**。',
      clear: true,
      show: ['board', 'slotRam', 'slotCpu', 'slotDisk', 'cpu', 'disk', 'ramOld'],
      set: { ramOld: { badge: '坏了' } },
      bubbles: [{ node: 'board', text: '我只认**插槽规格**，不认牌子', side: 'right' }],
    },
    {
      title: '换内存：什么牌子都行',
      text: '坏的拔掉，新的插上。金士顿、三星，**什么牌子都行**，只要符合插槽标准。主板厂和内存厂彼此不认识，却能完美配合——因为它们**都依赖同一个标准**。这就叫易插拔。',
      show: ['ramNew', 'ramAlt'],
      set: {
        ramOld: { x: 820, y: 420, strike: true, badge: '' },
        ramNew: { x: 245, y: 255 },
        xc: { x: 830, y: 400 },
      },
      focus: ['ramNew', 'ramAlt', 'ramOld'],
      bubbles: [
        { node: 'ramNew', text: '我插得进去！', side: 'bottom' },
        { node: 'ramAlt', text: '换我**也行**', side: 'top' },
      ],
    },
    {
      title: '收音机：全焊死了',
      text: '大鸟反问：那**收音机**你会修吗？小菜傻眼了。收音机里电阻、电容、三极管全**焊在一起**，一个坏了要顺着线路查半天，拆一个还可能牵连一片。这就是**强耦合**。',
      clear: true,
      show: ['radio', 'c1', 'c2', 'c3', 'c4', 'lr1', 'lr2', 'lr3', 'lr4', 'lr5', 'dn', 'xc'],
      set: { c3: { badge: '坏了' } },
      focus: ['c3', 'lr3', 'lr4', 'lr5', 'dn', 'xc'],
      bubbles: [
        { node: 'dn', text: '那**收音机**你会修吗？', side: 'top' },
        { node: 'xc', text: '呃……全焊在一起，**动一个牵一片**', side: 'bottom', delay: 0.8 },
      ],
    },
    {
      title: '程序里的“收音机”',
      text: '很多程序就是收音机。业务逻辑 `UserService`（**高层模块**）要存数据，就直接 new 了一个 SQL Server 的数据访问类 `SqlServerDataAccess`（**低层模块**）。高层直接依赖低层，焊死了。',
      clear: true,
      show: ['svc', 'sql', 'l_bad', 'dn'],
      focus: ['svc', 'sql', 'l_bad', 'dn'],
      flows: [{ from: 'svc', to: 'sql', label: 'insert("小菜")' }],
      bubbles: [{ node: 'dn', text: '这不就是**收音机**吗？', side: 'bottom', step: 0 }],
    },
    {
      title: '换数据库？业务跟着改',
      text: '新项目的业务逻辑一模一样，可客户说：我们只用 **Access**。麻烦了：UserService 里写死了 SQL Server，想复用业务代码，就得**拆开重焊**。高层模块被低层**绑架**了。',
      show: ['access', 'client'],
      set: { svc: { strike: true, badge: '业务代码被迫修改' }, access: { badge: '插不进去' } },
      focus: ['svc', 'access', 'client'],
      bubbles: [{ node: 'client', text: '我们公司只用 **Access**', side: 'top' }],
    },
    {
      title: '倒转：都依赖抽象',
      text: '大鸟的办法：中间加一个接口 `IDataAccess`，就像主板上的“插槽”。UserService 只认这个接口；SqlServerDataAccess 去**实现**它。高层、低层**都依赖抽象**，谁也不直接认识谁。',
      hide: ['l_bad', 'access', 'client'],
      show: ['iface', 'l_use', 'l_sql'],
      set: {
        svc: { strike: false, badge: '', lines: ['- db: IDataAccess', '+ register(user)'] },
        sql: { x: 230, y: 468 },
      },
      focus: ['iface', 'l_use', 'l_sql', 'dn'],
      bubbles: [{ node: 'dn', text: '高层、低层**都去依赖接口**', side: 'bottom' }],
    },
    {
      title: '为什么叫“倒转”？',
      text: '看箭头：以前是业务 → SQL Server，**高层依赖低层**；现在 SQL Server 的箭头**反过来**指向接口，而接口是按业务的需要定的。**抽象不依赖细节，细节依赖抽象**——依赖方向倒过来了。',
      hide: ['dn'],
      show: ['tBefore', 'tAfter'],
      focus: ['sql', 'l_sql', 'iface', 'tBefore', 'tAfter'],
      bubbles: [{ node: 'sql', text: '我反过来去**迎合接口**', side: 'right' }],
    },
    {
      title: '换 Access：插上就行',
      text: '客户要 Access？新写一个 `AccessDataAccess` 实现接口，组装时把它“插”给 UserService 就行。业务代码**一行不改**，就像给主板换了一根别家的内存条。',
      hide: ['tBefore', 'tAfter'],
      show: ['access', 'l_acc', 'client'],
      set: { access: { x: 510, y: 468, badge: 'NEW' }, svc: { badge: '一行没改' } },
      focus: ['svc', 'iface', 'access', 'l_use', 'l_acc', 'client'],
      flows: [
        { from: 'svc', to: 'iface', label: 'db.insert("小菜")' },
        { from: 'iface', to: 'access', label: '实际由 Access 干活', tone: 'teal' },
      ],
      bubbles: [{ node: 'client', text: '这么快就换好了？', side: 'top', step: 1 }],
    },
    {
      title: '总结：依赖倒转原则',
      text: '依赖倒转两句话：**高层、低层都依赖抽象；细节依赖抽象**。说白了：针对接口编程，不要对实现编程。依赖都指向抽象，才是面向对象；反之就是过程化设计。口诀：**上下都插接口，谁也不焊死谁。**',
      hide: ['client'],
      set: {
        svc: { badge: '', sub: '高层 ≈ 主板', x: 480 },
        iface: { sub: '抽象 ≈ 插槽标准', x: 480 },
        sql: { sub: '细节 ≈ 金士顿内存', x: 350 },
        access: { sub: '细节 ≈ 三星内存', badge: '', x: 630 },
      },
      bubbles: [
        { node: 'iface', text: '针对**接口**编程，不针对实现', side: 'right' },
        { node: 'svc', text: '我只认插槽，不认牌子', side: 'right' },
      ],
    },
  ],
});
