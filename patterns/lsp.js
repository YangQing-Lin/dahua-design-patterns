DP.register({
  id: 'lsp',
  order: 5.5,
  type: 'principle',
  name: '里氏代换原则',
  en: 'Liskov Substitution Principle',
  emoji: '🐧',
  chapter: '第 5 章 · 会修电脑不会修收音机？',
  mnemonic: '父类能用之处，子类照样能跑',
  summary: '凡是用父类的地方，换成任何一个子类，程序都不出错、也察觉不到区别。',
  intent: '子类型必须能够替换掉它们的父类型。也就是说：一个软件实体如果使用的是父类，那么一定适用于它的子类，而且察觉不出父类对象和子类对象的区别。',
  story: '大鸟问小菜：**企鹅是鸟吗？**生物学上当然是。可如果“鸟”类有一个 `fly()` 方法，企鹅继承了它，程序一调用 fly 就出问题——企鹅**不能替换**鸟，所以在这个程序里企鹅不该继承“鸟”。反过来，写给“动物”的代码交给猫、狗、牛、羊都能照常运行，把猫换成狗，别的代码一个字不用改。',
  analogy: '公司规定“持 C 照的司机”都能开班车。只要真有 C 照，派谁去都行，乘客根本不用知道换了人。可要是有人挂着“C 照司机”的名头，却只会开自动挡、一上手动挡就熄火——他就不能顶班，这个“继承关系”是假的。',
  when: [
    '设计继承关系时，判断“B 到底该不该继承 A”',
    '子类想**重写**父类方法、改变它的行为之前，先自查：调用方还能放心用吗？',
    '写面向父类 / 接口的通用代码（集合、框架、插件）时',
  ],
  pros: ['父类能被放心**复用**，子类只需在此基础上增加新行为', '面向父类写的客户端，加新子类也不用改——开放-封闭、依赖倒转才真正成立', '避免运行时冒出“这个子类不支持”的意外'],
  cons: ['要按“行为”而不是“现实分类”建模，需要多想一步', '为了可替换，有时要拆分父类（如“鸟”拆成“会飞的鸟”和“不会飞的鸟”），类会变多'],
  keyPoints: [
    '判断标准不是“生活里它算不算一种 X”，而是**行为上能不能顶替**：父类承诺能做的事，子类都得做到',
    '危险信号：子类重写后**抛异常 / 空实现 / 偷偷改了意思**；调用方被迫写 `if (b instanceof Penguin)` 特判',
    '有了里氏代换，父类才能真正被复用，子类也能在父类的基础上**增加**新行为',
    '它是开放-封闭与依赖倒转的“地基”：依赖抽象之所以安全，是因为抽象背后的任何子类都能顶上',
  ],
  code: `
// ❌ 违反里氏代换：企鹅继承了“会飞的鸟”
class Bird {
    public void layEggs() { System.out.println("下蛋"); }
    public void fly()     { System.out.println("扇翅膀，飞起来"); }
}
class Penguin extends Bird {
    @Override
    public void fly() { throw new UnsupportedOperationException("企鹅不会飞！"); }
}
void migrate(Bird b) { b.fly(); }       // 给 Bird 写的代码
migrate(new Penguin());                 // 运行时炸了

// ✅ 按“行为”建模：只有真会飞的，才继承 Bird
abstract class Animal {
    public abstract void shout();       // 所有动物都会叫
}
class Cat extends Animal { public void shout() { System.out.println("喵"); } }
class Dog extends Animal { public void shout() { System.out.println("汪"); } }
class Cow extends Animal { public void shout() { System.out.println("哞"); } }

abstract class Bird2 extends Animal {   // 会飞的鸟
    public abstract void fly();
}
class Penguin2 extends Animal {         // 企鹅不碰 fly()
    public void shout() { System.out.println("嘎"); }
    public void swim()  { System.out.println("游泳"); }   // 子类可以加新本事
}

// 客户端只认 Animal：把猫换成狗，只改 new 这一处
Animal a = new Dog();                   // 原来是 new Cat()
a.shout();`,
  codePython: `
from abc import ABC, abstractmethod


# ❌ 违反里氏代换：企鹅继承了“会飞的鸟”
class Bird:
    def lay_eggs(self):
        print("下蛋")

    def fly(self):
        print("扇翅膀，飞起来")


class Penguin(Bird):
    def fly(self):
        raise NotImplementedError("企鹅不会飞！")


def migrate(b: Bird):                    # 给 Bird 写的代码
    b.fly()


# ✅ 按“行为”建模：只有真会飞的，才继承 Bird
class Animal(ABC):
    @abstractmethod
    def shout(self): ...                 # 所有动物都会叫


class Cat(Animal):
    def shout(self): print("喵")


class Dog(Animal):
    def shout(self): print("汪")


class Cow(Animal):
    def shout(self): print("哞")


class Bird2(Animal):                     # 会飞的鸟
    @abstractmethod
    def fly(self): ...


class Penguin2(Animal):                  # 企鹅不碰 fly()
    def shout(self): print("嘎")

    def swim(self): print("游泳")        # 子类可以加新本事


if __name__ == "__main__":
    try:
        migrate(Penguin())               # 运行时炸了
    except NotImplementedError as e:
        print("炸了：", e)               # 炸了： 企鹅不会飞！
    # 客户端只认 Animal：把猫换成狗，只改创建这一处
    for a in (Cat(), Dog(), Cow(), Penguin2()):
        a.shout()                        # 喵 汪 哞 嘎（每行一个）`,
  codeGo: `
package main

import "fmt"

// Go 没有继承，里氏代换靠“接口”：能当某个接口用，就必须真能做到
// ❌ 反面教材（保留为注释）：嵌入 Bird 会把 Fly 一起“提升”给企鹅，
// 企鹅就自动满足 Flyer，却飞不起来：
// type Penguin struct{ Bird }

// ✅ 按“行为”拆成小接口：所有动物都会叫，只有真会飞的才是 Flyer
type Animal interface{ Shout() }
type Flyer interface{ Fly() }
type Bird2 interface { // 会飞的鸟 = 动物 + 会飞
	Animal
	Flyer
}

var _ Bird2 = Sparrow{} // 编译期确认：麻雀是会飞的鸟（Animal + Flyer）

type Cat struct{}

func (Cat) Shout() { fmt.Println("喵") }

type Dog struct{}

func (Dog) Shout() { fmt.Println("汪") }

type Cow struct{}

func (Cow) Shout() { fmt.Println("哞") }

type Sparrow struct{}

func (Sparrow) Shout() { fmt.Println("叽") }
func (Sparrow) Fly()   { fmt.Println("扇翅膀，飞起来") }

// 企鹅不实现 Fly()，所以它不是 Flyer，也就不会被误交给 migrate
type Penguin struct{}

func (Penguin) Shout() { fmt.Println("嘎") }
func (Penguin) Swim()  { fmt.Println("游泳") } // 可以加新本事

func migrate(f Flyer) { f.Fly() } // 给 Flyer 写的代码

func main() {
	migrate(Sparrow{}) // 扇翅膀，飞起来
	// migrate(Penguin{}) // 编译期就报错：Penguin 没有 Fly 方法
	var a Animal = Penguin{}
	_, ok := a.(Flyer)
	fmt.Println("企鹅是 Flyer 吗？", ok) // 企鹅是 Flyer 吗？ false
	// 客户端只认 Animal：把猫换成狗，只改创建这一处
	for _, a := range []Animal{Cat{}, Dog{}, Cow{}, Penguin{}} {
		a.Shout() // 喵 汪 哞 嘎（每行一个）
	}
}`,
  compare: [
    { id: 'dip', text: '依赖倒转让大家**都依赖抽象**；里氏代换保证抽象背后的**每个子类都靠得住**。没有后者，前者就是空中楼阁。' },
    { id: 'carp', text: '合成/聚合复用说“**能不用继承就别用**”；里氏代换说“**真要继承，子类必须能完全顶替父类**”。' },
  ],
  quiz: [
    { q: '`Rectangle` 有 `setWidth()` 和 `setHeight()`。`Square extends Rectangle` 后把它们重写成“设宽的同时也设高”。一段为矩形写的代码：设宽 5、高 4，断言面积是 20——传入 Square 时断言失败了。', why: '子类改变了父类承诺的行为，无法无缝顶替父类。' },
    { q: '“文件存储”基类有 `save()` 方法。团队新写了一个只读子类，它的 `save()` 直接抛异常。结果所有拿着基类引用调用 `save()` 的地方，都得先加一句 `if (s instanceof ReadOnlyStorage)` 判断。', why: '子类不能安全地替换父类，逼得调用方去特判子类型。' },
  ],

  nodes: {
    /* —— 场景一：企鹅是鸟吗 —— */
    dn: { kind: 'actor', icon: '🧔', label: '大鸟', x: 200, y: 300, tone: 'purple' },
    xc: { kind: 'actor', icon: '👦', label: '小菜', x: 470, y: 300, tone: 'blue' },
    pg0: { kind: 'box', icon: '🐧', label: '企鹅', sub: '有羽毛 · 会下蛋 · 不会飞', x: 770, y: 300, tone: 'teal', size: 'lg' },

    /* —— 场景二：鸟的继承树 + 只认 Bird 的代码 —— */
    bird: { kind: 'class', title: 'Bird', sub: '鸟（父类）', lines: ['+ layEggs()', '+ fly()'], x: 750, y: 125, tone: 'purple' },
    sparrow: { kind: 'class', title: 'Sparrow', sub: '麻雀', x: 615, y: 335, tone: 'teal' },
    swallow: { kind: 'class', title: 'Swallow', sub: '燕子', x: 755, y: 335, tone: 'teal' },
    penguin: { kind: 'class', title: 'Penguin', sub: '企鹅', x: 895, y: 335, tone: 'teal' },
    client: { kind: 'class', title: 'Migration', sub: '迁徙程序：只认 Bird', lines: ['+ migrate(Bird b) {', '!    b.fly();', '  }'], x: 140, y: 305, tone: 'blue' },
    slot: { kind: 'zone', label: '参数 Bird b 的位置', x: 445, y: 305, w: 200, h: 120, tone: 'indigo' },
    def: { kind: 'text', text: '子类型必须能够替换掉它们的父类型', x: 470, y: 462, size: 'lg', tone: 'orange' },
    def2: { kind: 'text', text: '用父类的地方换成任何子类，程序照常运行、察觉不出区别', x: 470, y: 500, size: 'sm', tone: 'gray' },

    /* —— 场景三：猫狗牛羊 —— */
    client2: { kind: 'class', title: 'Client', sub: '客户端：只认 Animal', lines: ['Animal a = new Cat();', '!a.shout();'], x: 165, y: 290, tone: 'blue' },
    animal: { kind: 'class', title: 'Animal', stereo: 'abstract', sub: '动物（父类）', lines: ['+ shout()'], x: 620, y: 125, tone: 'purple' },
    cat: { kind: 'class', title: 'Cat', sub: '猫 🐱', x: 420, y: 370, tone: 'teal' },
    dog: { kind: 'class', title: 'Dog', sub: '狗 🐶', x: 555, y: 370, tone: 'teal' },
    cow: { kind: 'class', title: 'Cow', sub: '牛 🐮', x: 690, y: 370, tone: 'teal' },
    sheep: { kind: 'class', title: 'Sheep', sub: '羊 🐑', x: 825, y: 370, tone: 'teal' },
    base: { kind: 'text', text: '子类能顶替父类 ➜ 才敢依赖抽象（依赖倒转）➜ 才能只加不改（开放-封闭）', x: 500, y: 492, tone: 'green' },
  },
  links: {
    l_sp: { from: 'sparrow', to: 'bird', kind: 'inherit' },
    l_sw: { from: 'swallow', to: 'bird', kind: 'inherit' },
    l_pg: { from: 'penguin', to: 'bird', kind: 'inherit' },
    l_cli: { from: 'client', to: 'slot', kind: 'assoc', label: '传进来' },
    l_c2: { from: 'client2', to: 'animal', kind: 'depend', label: '只依赖 Animal', labelAt: 0.45 },
    l_cat: { from: 'cat', to: 'animal', kind: 'inherit' },
    l_dog: { from: 'dog', to: 'animal', kind: 'inherit' },
    l_cow: { from: 'cow', to: 'animal', kind: 'inherit' },
    l_shp: { from: 'sheep', to: 'animal', kind: 'inherit' },
  },

  frames: [
    {
      title: '企鹅是鸟吗？',
      text: '还是第 5 章。大鸟考小菜：**企鹅是鸟吗？**小菜脱口而出：当然是！有羽毛、会下蛋。大鸟笑了：生物学上没错，可在**编程世界**里，答案可能是“不是”。',
      show: ['dn', 'xc', 'pg0'],
      bubbles: [
        { node: 'dn', text: '**企鹅**是鸟吗？', side: 'top' },
        { node: 'xc', text: '当然是！有羽毛，会下蛋', side: 'top', delay: 0.9 },
        { node: 'pg0', text: '可我**不会飞**……', side: 'top', delay: 1.8 },
      ],
    },
    {
      title: '照生物学建继承树',
      text: '小菜照生物学建了继承树：父类 `Bird` 有下蛋 `layEggs()` 和飞 `fly()` 两个方法，麻雀 `Sparrow`、燕子 `Swallow`、企鹅 `Penguin` 都继承它。看上去天经地义。',
      clear: true,
      show: ['bird', 'sparrow', 'swallow', 'penguin', 'l_sp', 'l_sw', 'l_pg'],
      focus: ['bird', 'penguin', 'l_pg'],
      bubbles: [{ node: 'penguin', text: '我也是**鸟**！', side: 'bottom' }],
    },
    {
      title: '一段只认“鸟”的代码',
      text: '再写一段迁徙程序 `migrate(Bird b)`：它只认识父类 Bird，不管传进来的是哪种鸟，都调用 `b.fly()`。这就是面向父类编程——它**相信**每个 Bird 都会飞。',
      show: ['client', 'slot', 'l_cli'],
      focus: ['client', 'slot', 'l_cli'],
      bubbles: [{ node: 'client', text: '给我一只 **Bird**，我就让它飞', side: 'top' }],
    },
    {
      title: '放进麻雀：照常飞',
      text: '把麻雀放进 Bird 的位置：调用 fly()，麻雀扑棱扑棱飞走了，程序完全察觉不到它是麻雀。**子类顶替父类，一切照常**——这正是我们想要的。',
      set: { sparrow: { x: 445, y: 312, badge: '✓' } },
      focus: ['client', 'sparrow'],
      flows: [
        { from: 'client', to: 'sparrow', label: 'b.fly()' },
        { from: 'sparrow', to: 'client', label: '✓ 飞起来了', back: true, tone: 'green' },
      ],
    },
    {
      title: '换成企鹅：程序崩了',
      text: '换成企鹅试试：调用 fly()……企鹅不会飞！它只能抛异常，或者偷偷什么都不做。迁徙程序明明是按 Bird 的约定办事，却被一个子类**坑了**。企鹅**不能替换**鸟。',
      set: {
        sparrow: { x: 615, y: 335, badge: '' },
        penguin: { x: 445, y: 312, tone: 'red', badge: '💥 不会飞！' },
      },
      focus: ['client', 'penguin'],
      flows: [
        { from: 'client', to: 'penguin', label: 'b.fly()' },
        { from: 'penguin', to: 'client', label: '💥 异常！', back: true, tone: 'red' },
      ],
    },
    {
      title: '里氏代换原则',
      text: '这就是**里氏代换原则**：子类型必须能够替换掉它们的父类型。凡是用父类的地方，换成任何子类，程序都照常运行、察觉不出区别。判断能不能继承，看的是**行为**，不是生物学分类。',
      show: ['def', 'def2'],
      focus: ['def', 'def2', 'penguin', 'bird'],
    },
    {
      title: '企鹅另立门户',
      text: '所以在这个程序里，企鹅**不该继承** Bird：可以让它直接继承“动物”，或把鸟拆成“会飞的鸟”和“不会飞的鸟”。现在凡是 Bird 的子类，放进来**都能飞**，燕子一试就灵。',
      hide: ['l_pg', 'def', 'def2'],
      set: {
        penguin: { x: 880, y: 475, tone: 'teal', badge: '不再继承 Bird', sub: '企鹅：另立门户' },
        swallow: { x: 445, y: 312, badge: '✓' },
      },
      focus: ['client', 'swallow', 'penguin', 'bird'],
      flows: [
        { from: 'client', to: 'swallow', label: 'b.fly()' },
        { from: 'swallow', to: 'client', label: '✓ 飞起来了', back: true, tone: 'green' },
      ],
    },
    {
      title: '正面例子：猫狗牛羊',
      text: '再看书里的正面例子：父类“动物” `Animal` 有个叫 `shout()` 的方法，猫、狗、牛、羊都继承它，而且**都真的会叫**。客户端只依赖 Animal，现在手里是一只猫：喵～',
      clear: true,
      show: ['client2', 'animal', 'cat', 'dog', 'cow', 'sheep', 'l_c2', 'l_cat', 'l_dog', 'l_cow', 'l_shp'],
      focus: ['client2', 'cat', 'animal', 'l_c2'],
      flows: [
        { from: 'client2', to: 'cat', label: 'a.shout()' },
        { from: 'cat', to: 'client2', label: '喵～', back: true, tone: 'teal' },
      ],
    },
    {
      title: '把猫换成狗',
      text: '要换成狗？只改 `new Cat()` 这一处，其余代码**一个字不动**，叫声就变成了“汪”。正因为子类能顶替父类，父类才能被放心**复用**，子类也能在此基础上增加新本事。',
      set: { client2: { lines: ['!Animal a = new Dog();', 'a.shout();'], badge: '只改这一处' } },
      focus: ['client2', 'dog', 'animal', 'l_c2'],
      flows: [
        { from: 'client2', to: 'dog', label: 'a.shout()' },
        { from: 'dog', to: 'client2', label: '汪！', back: true, tone: 'teal' },
      ],
    },
    {
      title: '总结：里氏代换原则',
      text: '里氏代换是**开放-封闭**和**依赖倒转**的地基：只有子类真能替换父类，依赖抽象才安全，加新子类才不用改旧代码。一句话记住：**父类能用之处，子类照样能跑。**',
      show: ['base'],
      set: { client2: { badge: '' } },
      focus: ['animal', 'base', 'l_cat', 'l_dog', 'l_cow', 'l_shp'],
      bubbles: [{ node: 'animal', text: '我出现的地方，**哪个子类都能顶上**', side: 'right' }],
    },
  ],
});
