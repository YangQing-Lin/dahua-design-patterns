DP.register({
  id: 'flyweight',
  order: 26,
  type: 'structural',
  name: '享元模式',
  en: 'Flyweight',
  emoji: '🎈',
  chapter: '第 26 章 · 项目多也别傻做',
  mnemonic: '相同部分共享用，不同部分外面送',
  summary: '大量相似的对象只保留几份共享实例，各自不同的数据在使用时从外部传进去。',
  intent: '运用共享技术有效地支持大量细粒度的对象。',
  story: '小菜接私活给客户做网站，好几家小客户都只要**产品展示**或**博客**，小菜打算每家复制一套代码、租一个空间。大鸟说：这些网站代码一模一样，只是**账号数据**不同，应该让同类网站**共享一个实例**，由网站工厂用一个“池子”管理，账号作为外部状态在使用时传进去。',
  analogy: '排版软件里，一篇文章可能有上万个“的”字，但“的”的字形只需要存一份；每个字出现在第几行、第几列、什么颜色，排版时再告诉它就行。',
  when: [
    '程序里有**大量相似对象**，占用了大量内存或资源',
    '对象的大部分状态可以**挪到外部**，由调用方在使用时传入',
    '去掉外部状态后，可以用**少量共享对象**代替成千上万个对象',
  ],
  pros: ['对象数量大幅减少，节省内存和资源', '相同的内部状态只存一份，修改一处处处生效'],
  cons: ['要把状态拆成内部 / 外部两部分，设计更复杂', '外部状态由客户端保存并传入，逻辑变绕，还多一点运行时开销', '对象不多时用它得不偿失'],
  keyPoints: [
    '**内部状态**：存在享元内部、不随环境改变、可以共享——如网站类型、棋子颜色',
    '**外部状态**：随环境改变、不能共享——如用户账号、棋子位置，调用时由客户端传入',
    '享元工厂用一个**哈希表做池子**：有就直接返回，没有才新建',
    'Java 的字符串常量池（两个相同的字面量 `"abc"` 是同一个对象）、`Integer.valueOf()` 对 -128～127 的缓存，都是享元思想',
  ],
  code: `
// 外部状态：用户账号，每个客户不同，不能共享
class User {
    private String name;
    User(String name) { this.name = name; }
    public String getName() { return name; }
}
// 享元抽象
abstract class WebSite {
    public abstract void use(User user);
}
// 具体享元：name（网站类型）是内部状态，可以共享
class ConcreteWebSite extends WebSite {
    private String name;
    ConcreteWebSite(String name) { this.name = name; }
    public void use(User user) {
        System.out.println("网站分类：" + name + "  用户：" + user.getName());
    }
}
// 享元工厂：池子里有就复用，没有才创建
class WebSiteFactory {
    private Map<String, WebSite> flyweights = new HashMap<>();
    public WebSite getWebSiteCategory(String key) {
        if (!flyweights.containsKey(key))
            flyweights.put(key, new ConcreteWebSite(key));
        return flyweights.get(key);
    }
    public int getWebSiteCount() { return flyweights.size(); }
}
// 客户端
WebSiteFactory f = new WebSiteFactory();
f.getWebSiteCategory("产品展示").use(new User("小菜"));
f.getWebSiteCategory("产品展示").use(new User("大鸟"));
f.getWebSiteCategory("产品展示").use(new User("娇娇"));
f.getWebSiteCategory("博客").use(new User("老顽童"));
f.getWebSiteCategory("博客").use(new User("桃谷六仙"));
f.getWebSiteCategory("博客").use(new User("南海鳄神"));
System.out.println(f.getWebSiteCount());       // 2`,
  codePython: `
from abc import ABC, abstractmethod


# 外部状态：用户账号，每个客户不同，不能共享
class User:
    def __init__(self, name):
        self.name = name


# 享元抽象
class WebSite(ABC):
    @abstractmethod
    def use(self, user: User): ...


# 具体享元：name（网站类型）是内部状态，可以共享
class ConcreteWebSite(WebSite):
    def __init__(self, name):
        self.name = name

    def use(self, user):
        print(f"网站分类：{self.name}  用户：{user.name}")


# 享元工厂：池子里有就复用，没有才创建
class WebSiteFactory:
    def __init__(self):
        self._flyweights = {}               # 用 dict 当池子

    def get_web_site_category(self, key):
        if key not in self._flyweights:
            self._flyweights[key] = ConcreteWebSite(key)
        return self._flyweights[key]

    def get_web_site_count(self):
        return len(self._flyweights)


# 客户端
if __name__ == "__main__":
    f = WebSiteFactory()
    for key, name in [("产品展示", "小菜"), ("产品展示", "大鸟"),
                      ("产品展示", "娇娇"), ("博客", "老顽童"),
                      ("博客", "桃谷六仙"), ("博客", "南海鳄神")]:
        f.get_web_site_category(key).use(User(name))
        # 网站分类：产品展示  用户：小菜   （其余五行格式相同）
    print(f.get_web_site_count())           # 2`,
  codeGo: `
package main

import "fmt"

// 外部状态：用户账号，每个客户不同，不能共享
type User struct{ Name string }

// 享元抽象
type WebSite interface {
	Use(user User)
}

// 具体享元：name（网站类型）是内部状态，可以共享
type ConcreteWebSite struct{ name string }

func (c *ConcreteWebSite) Use(user User) {
	fmt.Println("网站分类：" + c.name + "  用户：" + user.Name)
}

// 享元工厂：池子里有就复用，没有才创建
type WebSiteFactory struct {
	flyweights map[string]WebSite // 用 map 当池子（并发场景要加 sync.Mutex）
}

func NewWebSiteFactory() *WebSiteFactory {
	return &WebSiteFactory{flyweights: map[string]WebSite{}}
}

func (f *WebSiteFactory) GetWebSiteCategory(key string) WebSite {
	if _, ok := f.flyweights[key]; !ok {
		f.flyweights[key] = &ConcreteWebSite{name: key}
	}
	return f.flyweights[key]
}

func (f *WebSiteFactory) GetWebSiteCount() int { return len(f.flyweights) }

// 客户端
func main() {
	f := NewWebSiteFactory()
	f.GetWebSiteCategory("产品展示").Use(User{"小菜"}) // 网站分类：产品展示  用户：小菜
	f.GetWebSiteCategory("产品展示").Use(User{"大鸟"}) // 网站分类：产品展示  用户：大鸟
	f.GetWebSiteCategory("产品展示").Use(User{"娇娇"}) // 网站分类：产品展示  用户：娇娇
	f.GetWebSiteCategory("博客").Use(User{"老顽童"})  // 网站分类：博客  用户：老顽童
	f.GetWebSiteCategory("博客").Use(User{"桃谷六仙"}) // 网站分类：博客  用户：桃谷六仙
	f.GetWebSiteCategory("博客").Use(User{"南海鳄神"}) // 网站分类：博客  用户：南海鳄神
	fmt.Println(f.GetWebSiteCount())             // 2
}`,
  compare: [
    { id: 'singleton', text: '单例是“整个类**只有一个**实例”；享元是“**每种内部状态一个**实例”（产品展示一个、博客一个），并且要把外部状态剥离出去。' },
    { id: 'prototype', text: '原型是**复制**出一个新对象来用；享元恰恰相反，**不复制**，大家直接共用同一个对象。' },
  ],
  quiz: [
    { q: '一款游戏的地图上要画成千上万棵树，但树的模型和贴图只有 3 种，每棵树只有坐标和缩放比例不同。现在每棵树都 new 一个完整对象，内存吃不消。', why: '模型和贴图是可共享的内部状态，坐标和缩放是外部状态：3 个共享对象 + 外部传入的位置即可。' },
    { q: '在线文档编辑器里，一篇长文有几十万个字符。改造方案：同一字体、同一字号的字形对象只保留一份，放在一张表里按需取用，字符所在的行列在排版时再传进去。', why: '字形共享（内部状态），位置传入（外部状态），用工厂 + 池子管理。' },
  ],

  nodes: {
    // —— 场景一：接私活 ——
    xc: { kind: 'actor', icon: '👦', label: '小菜', sub: '接私活做网站', x: 130, y: 290, tone: 'blue' },
    k1: { kind: 'box', icon: '🏪', label: '服装店', sub: '想要：产品展示', x: 470, y: 150, tone: 'teal', size: 'sm' },
    k2: { kind: 'box', icon: '☕', label: '咖啡馆', sub: '想要：产品展示', x: 470, y: 290, tone: 'teal', size: 'sm' },
    k3: { kind: 'box', icon: '🎨', label: '设计工作室', sub: '想要：产品展示', x: 470, y: 430, tone: 'teal', size: 'sm' },
    k4: { kind: 'box', icon: '✍️', label: '自由撰稿人', sub: '想要：博客', x: 760, y: 150, tone: 'purple', size: 'sm' },
    k5: { kind: 'box', icon: '📷', label: '摄影师', sub: '想要：博客', x: 760, y: 290, tone: 'purple', size: 'sm' },
    k6: { kind: 'box', icon: '🏃', label: '跑步达人', sub: '想要：博客', x: 760, y: 430, tone: 'purple', size: 'sm' },

    // —— 场景二：复制 6 份 → 共享 2 份 ——
    s1: { kind: 'box', icon: '🛍️', label: '产品展示 · 1号', sub: '一套代码 + 一个空间', x: 170, y: 170, tone: 'teal' },
    s2: { kind: 'box', icon: '🛍️', label: '产品展示 · 2号', sub: '一套代码 + 一个空间', x: 410, y: 170, tone: 'teal' },
    s3: { kind: 'box', icon: '🛍️', label: '产品展示 · 3号', sub: '一套代码 + 一个空间', x: 650, y: 170, tone: 'teal' },
    s4: { kind: 'box', icon: '📝', label: '博客 · 1号', sub: '一套代码 + 一个空间', x: 170, y: 330, tone: 'purple' },
    s5: { kind: 'box', icon: '📝', label: '博客 · 2号', sub: '一套代码 + 一个空间', x: 410, y: 330, tone: 'purple' },
    s6: { kind: 'box', icon: '📝', label: '博客 · 3号', sub: '一套代码 + 一个空间', x: 650, y: 330, tone: 'purple' },
    sCnt: { kind: 'text', text: '6 个客户 = 6 套代码 + 6 个空间', x: 410, y: 470, tone: 'red', size: 'lg' },
    db: { kind: 'actor', icon: '🧔', label: '大鸟', x: 880, y: 250, tone: 'orange' },

    // —— 场景三：内部状态 / 外部状态 ——
    zIn: { kind: 'zone', label: '内部状态：大家都一样 → 共享', x: 290, y: 300, w: 300, h: 260, tone: 'green' },
    zEx: { kind: 'zone', label: '外部状态：每家不同 → 传进来', x: 710, y: 300, w: 300, h: 260, tone: 'orange' },
    in1: { kind: 'box', icon: '🧩', label: '网站程序代码', x: 290, y: 215, tone: 'green', shape: 'chip' },
    in2: { kind: 'box', icon: '🎨', label: '页面模板', x: 290, y: 300, tone: 'green', shape: 'chip' },
    in3: { kind: 'box', icon: '⚙️', label: '功能模块', x: 290, y: 385, tone: 'green', shape: 'chip' },
    ex1: { kind: 'box', icon: '👤', label: '用户账号', x: 710, y: 215, tone: 'orange', shape: 'chip' },
    ex2: { kind: 'box', icon: '📦', label: '商品 / 文章数据', x: 710, y: 300, tone: 'orange', shape: 'chip' },
    ex3: { kind: 'box', icon: '🖼️', label: '店名和 Logo', x: 710, y: 385, tone: 'orange', shape: 'chip' },

    // —— 场景四：类图 ——
    ws: { kind: 'class', title: 'WebSite', stereo: 'abstract', sub: '网站（享元抽象）', lines: ['+ use(user: User)'], x: 560, y: 115, tone: 'purple' },
    cws: { kind: 'class', title: 'ConcreteWebSite', sub: '具体网站（被共享）', lines: ['- name: String  // 内部状态', '+ use(user: User)'], x: 560, y: 320, tone: 'teal' },
    usr: { kind: 'class', title: 'User', sub: '用户账号（外部状态）', lines: ['- name: String'], x: 870, y: 320, tone: 'orange' },
    facC: { kind: 'class', title: 'WebSiteFactory', sub: '网站工厂', lines: ['- flyweights: HashMap', '+ getWebSiteCategory(key)', '+ getWebSiteCount()'], x: 190, y: 320, tone: 'indigo' },

    // —— 场景五：运行 ——
    cli: { kind: 'actor', icon: '👨‍💻', label: '客户端', x: 95, y: 140, tone: 'gray', size: 'sm' },
    fac: { kind: 'class', title: 'WebSiteFactory', sub: '网站工厂', lines: ['- flyweights: HashMap', '+ getWebSiteCategory(key)'], x: 430, y: 120, tone: 'indigo' },
    pool: { kind: 'zone', label: '享元池（HashMap）', x: 770, y: 330, w: 320, h: 300, tone: 'indigo' },
    inst1: { kind: 'box', icon: '🛍️', label: '"产品展示"', sub: 'ConcreteWebSite', x: 770, y: 255, tone: 'teal', badge: '新建', size: 'lg' },
    inst2: { kind: 'box', icon: '📝', label: '"博客"', sub: 'ConcreteWebSite', x: 770, y: 410, tone: 'purple', badge: '新建', size: 'lg' },
    uz: { kind: 'zone', label: '外部状态：User', x: 120, y: 380, w: 190, h: 270, tone: 'orange' },
    u1: { kind: 'box', icon: '👤', label: '小菜', x: 120, y: 280, tone: 'teal', shape: 'chip' },
    u2: { kind: 'box', icon: '👤', label: '大鸟', x: 120, y: 320, tone: 'teal', shape: 'chip' },
    u3: { kind: 'box', icon: '👤', label: '娇娇', x: 120, y: 360, tone: 'teal', shape: 'chip' },
    u4: { kind: 'box', icon: '👤', label: '老顽童', x: 120, y: 400, tone: 'purple', shape: 'chip' },
    u5: { kind: 'box', icon: '👤', label: '桃谷六仙', x: 120, y: 440, tone: 'purple', shape: 'chip' },
    u6: { kind: 'box', icon: '👤', label: '南海鳄神', x: 120, y: 480, tone: 'purple', shape: 'chip' },
    cnt: { kind: 'text', text: 'getWebSiteCount() = 2', x: 470, y: 515, tone: 'green', size: 'lg', mono: true },

    // —— 场景六：围棋 ——
    board: { kind: 'zone', label: '棋盘：一盘棋几百颗子', x: 310, y: 300, w: 440, h: 390, tone: 'yellow' },
    g1: { kind: 'text', text: '⚫', x: 170, y: 180, size: 'xl' },
    g2: { kind: 'text', text: '⚪', x: 250, y: 180, size: 'xl' },
    g3: { kind: 'text', text: '⚪', x: 330, y: 260, size: 'xl' },
    g4: { kind: 'text', text: '⚫', x: 250, y: 260, size: 'xl' },
    g5: { kind: 'text', text: '⚫', x: 450, y: 180, size: 'xl' },
    g6: { kind: 'text', text: '⚪', x: 450, y: 340, size: 'xl' },
    g7: { kind: 'text', text: '⚫', x: 170, y: 420, size: 'xl' },
    g8: { kind: 'text', text: '⚪', x: 330, y: 420, size: 'xl' },
    g9: { kind: 'text', text: '⚫', x: 410, y: 420, size: 'xl' },
    fB: { kind: 'box', icon: '⚫', label: '黑子对象', sub: '颜色：黑（内部状态）', x: 790, y: 150, tone: 'gray', badge: '只有 1 个' },
    fW: { kind: 'box', icon: '⚪', label: '白子对象', sub: '颜色：白（内部状态）', x: 790, y: 440, tone: 'gray', badge: '只有 1 个' },
    pos: { kind: 'box', icon: '📋', label: '坐标 (x, y)', sub: '外部状态：客户端自己保存', x: 790, y: 295, tone: 'orange' },
  },
  links: {
    l_cws: { from: 'cws', to: 'ws', kind: 'inherit' },
    l_usr: { from: 'cws', to: 'usr', kind: 'depend', label: '调用时传入' },
    l_fac: { from: 'facC', to: 'ws', kind: 'aggregate', label: '池子里存享元', labelAt: 0.45 },
  },

  frames: [
    {
      title: '接私活：客户越来越多',
      text: '小菜接了个私活，给一家小公司做**产品展示**网站。做完口碑不错，又陆续来了好几家：有的也要产品展示，有的想要个**博客**。都是小本生意，预算有限。',
      show: ['xc', 'k1', 'k2', 'k3', 'k4', 'k5', 'k6'],
      flows: [
        { from: 'k1', to: 'xc', label: '产品展示', step: 0 },
        { from: 'k2', to: 'xc', label: '产品展示', step: 0, delay: 0.3 },
        { from: 'k5', to: 'xc', label: '博客', step: 1, tone: 'purple', curve: -40 },
      ],
      bubbles: [{ node: 'xc', text: '生意来了！一家**做一套**就行吧？', side: 'top' }],
    },
    {
      title: '小菜：一家复制一套',
      text: '小菜的打算很朴素：做好一套，**复制**给下一家，每家再单独租一个空间。6 个客户，就是 **6 套代码、6 个空间**，以后改个 bug，也得改 6 遍。',
      clear: true,
      show: ['s1', 's2', 's3', 's4', 's5', 's6', 'sCnt'],
      focus: ['sCnt'],
      dim: false,
    },
    {
      title: '大鸟：大部分是重复的',
      text: '大鸟看了直摇头：三个产品展示网站，代码**一模一样**；三个博客也一样。不同的只是每家的**账号和数据**。为了这点不同，把整套东西复制好几份，太浪费了。',
      show: ['db'],
      set: {
        s2: { opacity: 0.45, badge: '重复' }, s3: { opacity: 0.45, badge: '重复' },
        s5: { opacity: 0.45, badge: '重复' }, s6: { opacity: 0.45, badge: '重复' },
      },
      bubbles: [{ node: 'db', text: '代码**一模一样**，只是**数据**不同！', side: 'top', dx: -8 }],
    },
    {
      title: '共享：同类只留一个',
      text: '大鸟的办法：同一类网站**只留一个实例**，大家共用。三个产品展示合成一个，三个博客合成一个，6 个客户只要 **2 个网站对象**。这种被大量共享的细粒度对象，就叫**享元**。',
      hide: ['s2', 's3', 's5', 's6'],
      set: {
        s1: { x: 410, label: '产品展示', sub: '共享实例', badge: '3 家共用' },
        s4: { x: 410, label: '博客', sub: '共享实例', badge: '3 家共用' },
        s2: { x: 410 }, s3: { x: 410 }, s5: { x: 410 }, s6: { x: 410 },
        sCnt: { text: '6 个客户 → 只要 2 个实例', tone: 'green' },
      },
      focus: ['s1', 's4', 'sCnt', 'db'],
      bubbles: [{ node: 'db', text: '这就叫**享元**：被共享的对象', side: 'top', dx: -40 }],
    },
    {
      title: '内部状态 vs 外部状态',
      text: '能共享的前提是分清两类状态。**内部状态**：程序代码、模板、功能，大家都一样，放进享元里共享。**外部状态**：账号、商品数据，每家不同，不能共享，用的时候**从外面传进来**。',
      clear: true,
      show: ['zIn', 'zEx', 'in1', 'in2', 'in3', 'ex1', 'ex2', 'ex3'],
    },
    {
      title: '享元：具体网站类',
      text: '落到代码：网站抽象类 `WebSite` 只有一个方法 `use(User user)`。具体网站 `ConcreteWebSite` 只存内部状态 `name`（网站类型）；用户账号 `User` 是外部状态，调用 `use()` 时**传进来**。',
      clear: true,
      show: ['ws', 'cws', 'usr', 'l_cws', 'l_usr'],
      focus: ['cws', 'usr', 'l_usr'],
    },
    {
      title: '享元工厂：带池子的工厂',
      text: '再加一个网站工厂 `WebSiteFactory`。它用一个**哈希表**当“池子”：`getWebSiteCategory(key)` 时，池里**有就直接返回**，没有才 new 一个放进去。客户端不自己 new 网站，一律找工厂要。',
      show: ['facC', 'l_fac'],
      set: { facC: { lines: ['!- flyweights: HashMap', '!+ getWebSiteCategory(key)', '+ getWebSiteCount()'] } },
      focus: ['facC', 'ws', 'l_fac'],
    },
    {
      title: '第一次要“产品展示”',
      text: '客户端向工厂要“产品展示”。池子是空的，工厂就 **new** 一个 `ConcreteWebSite` 放进池里再返回。客户端调用 `use()`，把账号**小菜**作为外部状态传进去。',
      clear: true,
      show: ['cli', 'fac', 'pool', 'inst1', 'uz', 'u1'],
      focus: ['cli', 'fac', 'inst1', 'u1'],
      flows: [
        { from: 'cli', to: 'fac', label: 'get("产品展示")' },
        { from: 'fac', to: 'inst1', label: '池里没有 → new' },
        { from: 'fac', to: 'cli', icon: '🛍️', back: true, tone: 'teal' },
        { from: 'u1', to: 'inst1', label: 'use(小菜)', tone: 'teal' },
      ],
    },
    {
      title: '第二次：直接从池里拿',
      text: '第二次再要“产品展示”，工厂一查：池里**已经有了**，直接返回同一个对象，**不再 new**。这次传进去的账号是**大鸟**。同一个网站对象，换个外部状态，就服务了另一位客户。',
      show: ['u2'],
      set: { inst1: { badge: '复用' } },
      focus: ['cli', 'fac', 'inst1', 'u2'],
      flows: [
        { from: 'cli', to: 'fac', label: 'get("产品展示")' },
        { from: 'fac', to: 'inst1', label: '池里有 ✓' },
        { from: 'fac', to: 'cli', icon: '🛍️', label: '同一个', back: true, tone: 'teal' },
        { from: 'u2', to: 'inst1', label: 'use(大鸟)', tone: 'teal' },
      ],
    },
    {
      title: '6 个客户，2 个实例',
      text: '剩下的客户也一样：第一次要“博客”时新建一个，之后全部复用。最后 6 个账号都在用网站，`getWebSiteCount()` 却只有 **2**。客户越多，省得越多。',
      show: ['u3', 'u4', 'u5', 'u6', 'inst2', 'cnt'],
      set: { inst1: { badge: '×3' }, inst2: { badge: '×3' } },
      focus: ['inst1', 'inst2', 'cnt'],
      dim: false,
      flows: [
        { from: 'fac', to: 'inst2', label: '"博客"：new', step: 0 },
        { from: 'u3', to: 'inst1', label: 'use(娇娇)', tone: 'teal', step: 1 },
        { from: 'u4', to: 'inst2', label: 'use(老顽童)', tone: 'purple', step: 1 },
        { from: 'u5', to: 'inst2', label: 'use(桃谷六仙)', tone: 'purple', step: 2 },
        { from: 'u6', to: 'inst2', label: 'use(南海鳄神)', tone: 'purple', step: 3 },
      ],
      bubbles: [{ node: 'inst2', text: '我一个对象，服务 **3** 位客户', side: 'bottom', step: 3 }],
    },
    {
      title: '围棋：几百颗子 2 个对象',
      text: '书里还举了**围棋**的例子：一盘棋几百颗子，要是每颗子一个对象，内存很快吃紧。其实棋子只有**黑、白两种**，颜色是内部状态；**位置**是外部状态，落子时传进去就行。',
      clear: true,
      show: ['board', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'fB', 'fW'],
      focus: ['fB', 'fW'],
      dim: false,
      flows: [
        { from: 'fB', to: 'g5', label: '(15, 3)', step: 0 },
        { from: 'fW', to: 'g6', label: '(15, 10)', step: 0, tone: 'teal' },
        { from: 'fB', to: 'g4', label: '(7, 7)', step: 1, curve: -30 },
        { from: 'fW', to: 'g8', label: '(10, 16)', step: 1, tone: 'teal' },
      ],
    },
    {
      title: '代价：外部状态要自己管',
      text: '享元不是白给的：外部状态被**剥离**出来以后，要由客户端自己保存、每次调用时传进去，程序逻辑更复杂了。所以只有当对象**多到真的浪费资源**时，才值得用它。',
      show: ['pos'],
      focus: ['pos'],
      flows: [
        { from: 'pos', to: 'fB', label: '传入坐标', step: 0 },
        { from: 'pos', to: 'fW', label: '传入坐标', step: 0, tone: 'teal' },
      ],
      bubbles: [{ node: 'pos', text: '坐标得**客户端**自己记', side: 'left', step: 0 }],
    },
    {
      title: '总结：享元模式',
      text: '享元模式三件套：**享元工厂**管理池子、**享元**保存可共享的内部状态、**外部状态**由客户端在使用时传入。一句话记住：**相同部分共享用，不同部分外面送。**',
      clear: true,
      show: ['cli', 'fac', 'pool', 'inst1', 'inst2', 'uz', 'u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'cnt'],
      set: { inst2: { badge: '×3' }, cnt: { text: '相同部分共享用，不同部分外面送', mono: false, tone: 'indigo' } },
      focus: ['fac', 'inst1', 'inst2', 'uz', 'cnt'],
      bubbles: [
        { node: 'fac', text: '有就复用，没有才 new', side: 'right' },
        { node: 'inst1', text: '内部状态：**共享**', side: 'left' },
        { node: 'uz', text: '外部状态：**传进来**', side: 'right' },
      ],
    },
  ],
});
