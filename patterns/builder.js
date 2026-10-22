DP.register({
  id: 'builder',
  order: 13,
  type: 'creational',
  name: '建造者模式',
  en: 'Builder',
  emoji: '🧱',
  chapter: '第 13 章 · 好菜每回味不同',
  mnemonic: '流程交给指挥者，细节交给建造者',
  summary: '把复杂对象的组装步骤固定下来，同一套步骤能造出不同的成品。',
  intent: '将一个复杂对象的构建与它的表示分离，使得同样的构建过程可以创建不同的表示。',
  story: '小菜和大鸟吃夜宵：路边小店的炒面这次咸、下次淡，全看厨师心情；麦当劳、肯德基的汉堡却在哪儿吃都一个味——因为它们的**制作流程**是定死的。回到编程，小菜画小人（头、身体、两手、两腿），画胖小人时复制粘贴，结果**少画了一条腿**。大鸟说：把“必须画哪几步”定成抽象建造者，再让**指挥者**按顺序调用，谁也别想漏掉一步。',
  analogy: '装修房子：施工顺序（水电 → 泥瓦 → 木工 → 油漆）由监理把控，绝不能先刷墙再埋水管；不同的装修队负责把每一步做成中式或北欧风格。监理是“指挥者”，装修队是“具体建造者”。',
  when: [
    '对象很复杂，由多个部件**按固定顺序**组装而成',
    '同样的组装流程，要产出**不同的表示**（胖小人 / 瘦小人、PDF / 网页）',
    '想把“怎么组装”（顺序）和“组装成什么样”（细节）分开管理',
  ],
  pros: ['步骤写在指挥者里，**顺序固定、一步不漏**', '新增一种表示，只加一个具体建造者', '客户端不需要知道产品内部是怎么拼起来的'],
  cons: ['产品之间差异太大、步骤都不同时就用不上', '每种表示一个建造者，类的数量会增加'],
  keyPoints: [
    '四个角色：**Builder**（抽象建造者，规定有哪些步骤）、**ConcreteBuilder**（具体建造者，每一步怎么做）、**Director**（指挥者，按什么顺序做）、**Product**（产品）',
    '抽象方法强制子类实现每一步——少实现一步，**编译器直接报错**，这就是“不会少一条腿”的保障',
    '和抽象工厂的区别：抽象工厂一下子给你一套产品；建造者是**一步步**组装**一个**复杂产品，最后才交货',
  ],
  code: `
// 产品：一个小人
class Person {
    private List<String> parts = new ArrayList<>();
    public void add(String part) { parts.add(part); }
}
// 抽象建造者：规定画小人必须有哪几步，一步都不能少
abstract class PersonBuilder {
    protected Person person = new Person();
    public abstract void buildHead();
    public abstract void buildBody();
    public abstract void buildArmLeft();
    public abstract void buildArmRight();
    public abstract void buildLegLeft();
    public abstract void buildLegRight();
    public Person getResult() { return person; }
}
// 具体建造者：瘦小人（胖小人 PersonFatBuilder 同理，每步画胖一点）
class PersonThinBuilder extends PersonBuilder {
    public void buildHead()     { person.add("小圆头"); }
    public void buildBody()     { person.add("瘦身体"); }
    public void buildArmLeft()  { person.add("细左手"); }
    public void buildArmRight() { person.add("细右手"); }
    public void buildLegLeft()  { person.add("细左腿"); }
    public void buildLegRight() { person.add("细右腿"); }
}
// 指挥者：控制建造顺序
class PersonDirector {
    public Person createPerson(PersonBuilder pb) {
        pb.buildHead();
        pb.buildBody();
        pb.buildArmLeft();
        pb.buildArmRight();
        pb.buildLegLeft();
        pb.buildLegRight();
        return pb.getResult();
    }
}
// 客户端：想要什么样的小人，就递给指挥者什么样的建造者
PersonDirector director = new PersonDirector();
Person thin = director.createPerson(new PersonThinBuilder());
Person fat  = director.createPerson(new PersonFatBuilder());`,
  codePython: `
from abc import ABC, abstractmethod

# 产品：一个小人
class Person:
    def __init__(self): self.parts = []
    def add(self, part): self.parts.append(part)

# 抽象建造者：规定画小人必须有哪几步，一步都不能少
class PersonBuilder(ABC):
    def __init__(self): self.person = Person()

    @abstractmethod
    def build_head(self): ...
    @abstractmethod
    def build_body(self): ...
    @abstractmethod
    def build_arm_left(self): ...
    @abstractmethod
    def build_arm_right(self): ...
    @abstractmethod
    def build_leg_left(self): ...
    @abstractmethod
    def build_leg_right(self): ...

    def get_result(self): return self.person

# 具体建造者：瘦小人
class PersonThinBuilder(PersonBuilder):
    def build_head(self): self.person.add("小圆头")
    def build_body(self): self.person.add("瘦身体")
    def build_arm_left(self): self.person.add("细左手")
    def build_arm_right(self): self.person.add("细右手")
    def build_leg_left(self): self.person.add("细左腿")
    def build_leg_right(self): self.person.add("细右腿")

# 具体建造者：胖小人，每步画胖一点
class PersonFatBuilder(PersonBuilder):
    def build_head(self): self.person.add("大圆头")
    def build_body(self): self.person.add("胖身体")
    def build_arm_left(self): self.person.add("粗左手")
    def build_arm_right(self): self.person.add("粗右手")
    def build_leg_left(self): self.person.add("粗左腿")
    def build_leg_right(self): self.person.add("粗右腿")

# 指挥者：控制建造顺序
class PersonDirector:
    def create_person(self, pb: PersonBuilder) -> Person:
        for step in (pb.build_head, pb.build_body, pb.build_arm_left,
                     pb.build_arm_right, pb.build_leg_left, pb.build_leg_right):
            step()
        return pb.get_result()

# 客户端：想要什么样的小人，就递给指挥者什么样的建造者
if __name__ == "__main__":
    director = PersonDirector()
    print(director.create_person(PersonThinBuilder()).parts)  # ['小圆头', '瘦身体', '细左手', '细右手', '细左腿', '细右腿']
    print(director.create_person(PersonFatBuilder()).parts)   # ['大圆头', '胖身体', '粗左手', '粗右手', '粗左腿', '粗右腿']`,
  codeGo: `
package main

import "fmt"

// 产品：一个小人
type Person struct{ Parts []string }

func (p *Person) Add(part string) { p.Parts = append(p.Parts, part) }

// 抽象建造者：Go 用接口规定画小人必须有哪几步，一步都不能少
type PersonBuilder interface {
	BuildHead()
	BuildBody()
	BuildArmLeft()
	BuildArmRight()
	BuildLegLeft()
	BuildLegRight()
	GetResult() *Person
}

// 具体建造者：瘦小人
type PersonThinBuilder struct{ person Person }

func (b *PersonThinBuilder) BuildHead()         { b.person.Add("小圆头") }
func (b *PersonThinBuilder) BuildBody()         { b.person.Add("瘦身体") }
func (b *PersonThinBuilder) BuildArmLeft()      { b.person.Add("细左手") }
func (b *PersonThinBuilder) BuildArmRight()     { b.person.Add("细右手") }
func (b *PersonThinBuilder) BuildLegLeft()      { b.person.Add("细左腿") }
func (b *PersonThinBuilder) BuildLegRight()     { b.person.Add("细右腿") }
func (b *PersonThinBuilder) GetResult() *Person { return &b.person }

// 具体建造者：胖小人，每步画胖一点
type PersonFatBuilder struct{ person Person }

func (b *PersonFatBuilder) BuildHead()         { b.person.Add("大圆头") }
func (b *PersonFatBuilder) BuildBody()         { b.person.Add("胖身体") }
func (b *PersonFatBuilder) BuildArmLeft()      { b.person.Add("粗左手") }
func (b *PersonFatBuilder) BuildArmRight()     { b.person.Add("粗右手") }
func (b *PersonFatBuilder) BuildLegLeft()      { b.person.Add("粗左腿") }
func (b *PersonFatBuilder) BuildLegRight()     { b.person.Add("粗右腿") }
func (b *PersonFatBuilder) GetResult() *Person { return &b.person }

// 指挥者：控制建造顺序，参数是接口，不关心具体是哪种建造者
type PersonDirector struct{}

func (PersonDirector) CreatePerson(pb PersonBuilder) *Person {
	pb.BuildHead()
	pb.BuildBody()
	pb.BuildArmLeft()
	pb.BuildArmRight()
	pb.BuildLegLeft()
	pb.BuildLegRight()
	return pb.GetResult()
}

// 客户端：想要什么样的小人，就递给指挥者什么样的建造者
func main() {
	director := PersonDirector{}
	fmt.Println(director.CreatePerson(&PersonThinBuilder{}).Parts) // [小圆头 瘦身体 细左手 细右手 细左腿 细右腿]
	fmt.Println(director.CreatePerson(&PersonFatBuilder{}).Parts)  // [大圆头 胖身体 粗左手 粗右手 粗左腿 粗右腿]
}`,
  compare: [
    { id: 'abstract-factory', text: '抽象工厂一次交给你**一整套**相关产品；建造者是按步骤**一步步组装一个**复杂产品，组装完才交货。' },
    { id: 'template-method', text: '都把“流程”固定下来。模板方法靠**继承**，流程写在父类里；建造者靠**组合**，流程写在独立的指挥者里，建造者可以随时换。' },
  ],
  quiz: [
    { q: '体检中心生成报告：必须依次填写“基本信息 → 各项指标 → 医生结论 → 签章”，一步都不能少；同一套流程，既要输出 PDF 版，也要输出网页版。', why: '固定顺序的组装流程（指挥者）+ 不同的成品表示（PDF / 网页建造者）。' },
    { q: '游戏里捏角色：系统总是按“身体 → 发型 → 服装 → 武器”的顺序生成，同样的生成流程，换一套部件做法就能造出战士或法师。', why: '构建过程相同、表示不同——建造者。' },
  ],

  nodes: {
    xc: { kind: 'actor', icon: '👦', label: '小菜', x: 150, y: 300, tone: 'blue' },
    db: { kind: 'actor', icon: '🧔', label: '大鸟', x: 360, y: 300, tone: 'purple' },
    noodle: { kind: 'box', icon: '🍜', label: '小饭馆的炒面', sub: '这次咸，下次淡', x: 620, y: 200, tone: 'orange' },
    burger: { kind: 'box', icon: '🍔', label: '麦当劳的汉堡', sub: '在哪儿吃都一个味', x: 620, y: 400, tone: 'green' },
    recipe: { kind: 'box', shape: 'note', icon: '📋', label: '制作流程', sub: '烤面包 30 秒\n肉饼 1 片 · 酱 1 勺', x: 860, y: 400, w: 150 },

    draw: {
      kind: 'class', title: 'DrawPerson', sub: '小菜的画小人代码', x: 430, y: 300, tone: 'gray',
      lines: ['g.drawEllipse(头);', 'g.drawRect(身体);', 'g.drawLine(左手);', 'g.drawLine(右手);', 'g.drawLine(左腿);', 'g.drawLine(右腿);'],
    },

    zone: { kind: 'zone', label: 'Person（产品）', x: 830, y: 290, w: 250, h: 330, tone: 'teal' },
    head: { kind: 'box', shape: 'chip', icon: '🙂', label: '头', x: 830, y: 165, tone: 'teal' },
    body: { kind: 'box', label: '身体', x: 830, y: 280, w: 64, h: 90, tone: 'teal' },
    armL: { kind: 'box', shape: 'chip', label: '左手', x: 752, y: 230, tone: 'teal' },
    armR: { kind: 'box', shape: 'chip', label: '右手', x: 908, y: 230, tone: 'teal' },
    legL: { kind: 'box', shape: 'chip', label: '左腿', x: 790, y: 395, tone: 'teal' },
    legR: { kind: 'box', shape: 'chip', label: '右腿', x: 870, y: 395, tone: 'teal' },
    legMiss: { kind: 'box', shape: 'ghost', label: '右腿？', x: 870, y: 395, tone: 'red', size: 'sm' },

    builder: {
      kind: 'class', title: 'PersonBuilder', stereo: 'abstract', sub: '抽象建造者：规定步骤', x: 470, y: 175, tone: 'purple',
      lines: ['+ buildHead()', '+ buildBody()', '+ buildArmLeft()', '+ buildArmRight()', '+ buildLegLeft()', '+ buildLegRight()', '+ getResult()'],
    },
    thinB: { kind: 'class', title: 'PersonThinBuilder', sub: '瘦小人建造者', x: 360, y: 410, tone: 'teal' },
    fatB: { kind: 'class', title: 'PersonFatBuilder', sub: '胖小人建造者', x: 590, y: 410, tone: 'orange' },
    tallB: { kind: 'class', title: 'PersonTallBuilder', sub: '高个小人建造者', x: 475, y: 505, tone: 'pink', badge: 'NEW' },
    director: {
      kind: 'class', title: 'PersonDirector', sub: '指挥者：控制顺序', x: 150, y: 290, tone: 'indigo',
      lines: ['createPerson(pb) {', '  pb.buildHead();', '  pb.buildBody();', '  pb.buildArmLeft();', '  pb.buildArmRight();', '  pb.buildLegLeft();', '  pb.buildLegRight();', '}'],
    },
    client: { kind: 'actor', icon: '👨‍💻', label: '客户端', x: 150, y: 480, tone: 'gray', size: 'sm' },
  },
  links: {
    l_recipe: { from: 'recipe', to: 'burger', kind: 'arrow', label: '照做' },
    lh: { from: 'head', to: 'body', kind: 'line', tone: 'teal' },
    la1: { from: 'body', to: 'armL', kind: 'line', tone: 'teal' },
    la2: { from: 'body', to: 'armR', kind: 'line', tone: 'teal' },
    ll1: { from: 'body', to: 'legL', kind: 'line', tone: 'teal' },
    ll2: { from: 'body', to: 'legR', kind: 'line', tone: 'teal' },
    llm: { from: 'body', to: 'legMiss', kind: 'dotted', tone: 'red' },
    i_thin: { from: 'thinB', to: 'builder', kind: 'inherit' },
    i_fat: { from: 'fatB', to: 'builder', kind: 'inherit' },
    i_tall: { from: 'tallB', to: 'builder', kind: 'inherit' },
    l_dir: { from: 'director', to: 'builder', kind: 'assoc', label: '按顺序调用' },
    l_cli: { from: 'client', to: 'director', kind: 'assoc' },
  },

  frames: [
    {
      title: '好菜每回味不同',
      text: '第 13 章从一盘炒面开始。小菜和大鸟去吃夜宵，路边小店的炒面上次挺好吃，这次却**咸得要命**。同一个店、同一道菜，味道全看厨师当天的心情和手感。',
      show: ['xc', 'db', 'noodle'],
      focus: ['noodle', 'xc'],
      bubbles: [{ node: 'xc', text: '上次挺好吃，这次怎么**咸**成这样？', side: 'top' }],
    },
    {
      title: '麦当劳的秘诀',
      text: '可麦当劳、肯德基的汉堡，无论在北京还是上海吃，味道都一样。秘诀不在厨师多厉害，而在于它们有一套**严格的制作流程**：面包烤几秒、放几片肉、几勺酱，全都定死了。',
      show: ['burger', 'recipe', 'l_recipe'],
      set: { noodle: { badge: '看厨师心情' }, burger: { badge: '✓ 流程定死' } },
      focus: ['burger', 'recipe', 'db'],
      bubbles: [{ node: 'db', text: '好吃不好吃，关键看**流程**有没有定下来', side: 'top' }],
    },
    {
      title: '回到代码：画个小人',
      text: '回到编程。大鸟让小菜写个程序画小人：**头、身体、左手、右手、左腿、右腿**，一共六步。小菜三下五除二，一个瘦小人就画好了。',
      clear: true,
      show: ['xc', 'draw', 'head', 'body', 'armL', 'armR', 'legL', 'legR', 'lh', 'la1', 'la2', 'll1', 'll2'],
      set: { xc: { x: 130 } },
      focus: ['xc', 'draw', 'head', 'body', 'armL', 'armR', 'legL', 'legR'],
      bubbles: [{ node: 'xc', text: '六步，搞定！', side: 'top' }],
    },
    {
      title: '胖小人少了一条腿',
      text: '再画一个胖的？小菜把代码**复制粘贴**改了改，一运行——胖小人**少了一条腿**！程序照样跑，编译器也不报错，这种漏步骤的错误最难发现。',
      hide: ['legR'],
      show: ['legMiss', 'llm', 'db'],
      set: {
        db: { x: 130, y: 470 },
        draw: { sub: '复制过来改成胖小人', tone: 'red', lines: ['g.drawEllipse(大头);', 'g.drawRect(胖身体);', 'g.drawLine(左手);', 'g.drawLine(右手);', 'g.drawLine(左腿);', '!// 右腿……忘了'] },
        head: { tone: 'orange', icon: '😄', label: '大头' },
        body: { tone: 'orange', label: '胖身体', w: 96, h: 100 },
        armL: { tone: 'orange', x: 740 }, armR: { tone: 'orange', x: 920 }, legL: { tone: 'orange' },
      },
      focus: ['draw', 'legMiss', 'db', 'head', 'body', 'armL', 'armR', 'legL'],
      bubbles: [{ node: 'db', text: '你这小人怎么**少了一条腿**？', side: 'right' }],
    },
    {
      title: '把步骤定死：抽象建造者',
      text: '大鸟说：画小人的**步骤是稳定的**——头、身体、两手、两腿，一个都不能少；变化的只是胖瘦。把这六步写成抽象类 `PersonBuilder` 的**抽象方法**，谁继承它，就必须把每一步都实现，少一步编译都通不过。',
      clear: true,
      show: ['builder'],
      focus: ['builder'],
      bubbles: [{ node: 'builder', text: '抽象方法 = **必须实现**，想漏都漏不掉', side: 'right' }],
    },
    {
      title: '具体建造者：瘦的、胖的',
      text: '然后每种小人一个**具体建造者**：`PersonThinBuilder` 把每一步画得细细的，`PersonFatBuilder` 把每一步画得胖胖的。它们只管“**每一步怎么画**”，不管先画哪步。',
      show: ['thinB', 'fatB', 'i_thin', 'i_fat'],
      focus: ['thinB', 'fatB'],
    },
    {
      title: '指挥者：控制顺序',
      text: '光有建造者还不够，还得有人**按顺序**调用。指挥者 `PersonDirector` 的 `createPerson()` 里固定写好：先头、再身体、再两手、最后两腿。客户端只需要告诉它：**用哪个建造者**。',
      show: ['director', 'l_dir'],
      focus: ['director', 'builder', 'l_dir'],
      bubbles: [{ node: 'director', text: '顺序我说了算', side: 'top' }],
    },
    {
      title: '开工：先头、身体和手',
      text: '客户端说：“用**瘦小人建造者**造一个。”指挥者照着清单一步步喊：画头、画身体、画左手、画右手……每一步具体怎么画，由 `PersonThinBuilder` 决定。产品就在右边一点点拼起来。',
      show: ['client', 'l_cli', 'zone', 'head', 'body', 'armL', 'armR', 'lh', 'la1', 'la2'],
      set: {
        director: { lines: ['createPerson(pb) {', '!  pb.buildHead();', '!  pb.buildBody();', '!  pb.buildArmLeft();', '!  pb.buildArmRight();', '  pb.buildLegLeft();', '  pb.buildLegRight();', '}'] },
        head: { tone: 'teal', icon: '🙂', label: '头' },
        body: { tone: 'teal', label: '身体', w: 64, h: 90 },
        armL: { tone: 'teal', x: 752 }, armR: { tone: 'teal', x: 908 }, legL: { tone: 'teal' },
      },
      focus: ['client', 'director', 'thinB', 'zone', 'head', 'body', 'armL', 'armR'],
      flows: [
        { from: 'client', to: 'director', label: 'createPerson(瘦)' },
        { from: 'director', to: 'thinB', label: 'buildHead()' },
        { from: 'director', to: 'thinB', label: 'buildBody()' },
        { from: 'director', to: 'thinB', label: 'buildArm…()' },
      ],
    },
    {
      title: '两条腿，一步不少',
      text: '最后两步：左腿、右腿。因为顺序写死在指挥者里，**一步都不会漏**。全部画完后调用 `getResult()`，拿到一个完整的瘦小人。“少一条腿”的事故，从此不会再发生。',
      show: ['legL', 'legR', 'll1', 'll2'],
      set: {
        director: { lines: ['createPerson(pb) {', '  pb.buildHead();', '  pb.buildBody();', '  pb.buildArmLeft();', '  pb.buildArmRight();', '!  pb.buildLegLeft();', '!  pb.buildLegRight();', '}'] },
        zone: { badge: '✓ 完整' },
      },
      focus: ['director', 'thinB', 'client', 'zone', 'head', 'body', 'armL', 'armR', 'legL', 'legR'],
      flows: [
        { from: 'director', to: 'thinB', label: 'buildLeg…()' },
        { from: 'thinB', to: 'client', label: '瘦小人 ✓', back: true, tone: 'teal' },
      ],
    },
    {
      title: '换个建造者：胖小人',
      text: '想要胖小人？指挥者的流程**一个字都不改**，只是递进去的建造者换成了 `PersonFatBuilder`。**同样的构建过程，得到了不同的表示**——这正是建造者模式的定义。',
      set: {
        director: { lines: ['createPerson(pb) {', '!  pb.buildHead();', '!  pb.buildBody();', '!  pb.buildArmLeft();', '!  pb.buildArmRight();', '!  pb.buildLegLeft();', '!  pb.buildLegRight();', '}'] },
        head: { tone: 'orange', icon: '😄', label: '大头' },
        body: { tone: 'orange', label: '胖身体', w: 96, h: 100 },
        armL: { tone: 'orange', x: 740 }, armR: { tone: 'orange', x: 920 },
        legL: { tone: 'orange' }, legR: { tone: 'orange' },
        zone: { tone: 'orange' },
      },
      focus: ['client', 'director', 'fatB', 'zone', 'head', 'body', 'armL', 'armR', 'legL', 'legR'],
      flows: [
        { from: 'client', to: 'director', label: 'createPerson(胖)' },
        { from: 'director', to: 'fatB', label: '同样的 6 步' },
        { from: 'fatB', to: 'client', label: '胖小人 ✓', back: true, tone: 'orange' },
      ],
    },
    {
      title: '再来一种？加个建造者',
      text: '以后要画“高个小人”？新写一个 `PersonTallBuilder` 继承 `PersonBuilder` 就行，指挥者和其他建造者**都不用动**。而且编译器会盯着它：六个步骤**少实现一个都不行**。',
      show: ['tallB', 'i_tall'],
      focus: ['tallB', 'i_tall', 'builder'],
      bubbles: [{ node: 'tallB', text: '六步全实现，少一步编译不过', side: 'right' }],
    },
    {
      title: '总结：建造者模式',
      text: '四个角色：**Builder** 规定有哪些步骤，**ConcreteBuilder** 决定每步怎么做，**Director** 控制先后顺序，**Product** 是最后的成品。一句话记住：**流程交给指挥者，细节交给建造者。**',
      set: { tallB: { badge: '' } },
      focus: ['director', 'builder', 'thinB', 'fatB', 'tallB', 'zone', 'l_dir'],
      bubbles: [
        { node: 'director', text: '我管**顺序**', side: 'top' },
        { node: 'builder', text: '我管**有哪些步骤**', side: 'right' },
      ],
    },
  ],
});
