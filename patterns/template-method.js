DP.register({
  id: 'template-method',
  order: 10,
  type: 'behavioral',
  name: '模板方法模式',
  en: 'Template Method',
  emoji: '📝',
  chapter: '第 10 章 · 考题抄错会做也白搭',
  mnemonic: '流程父类定死，细节子类来填',
  summary: '父类写好固定流程，把会变的几步留给子类去实现，去掉重复代码。',
  intent: '定义一个操作中的算法的骨架，而将一些步骤延迟到子类中。模板方法使得子类可以不改变一个算法的结构即可重定义该算法的某些特定步骤。',
  story: '小菜想起上学时老师把考题写在黑板上，学生**各自抄一遍**再作答——题目抄错了，会做也白搭。他写的试卷程序也犯了同样的错：学生甲、乙的试卷类**各自把题目写了一遍**。大鸟让他把题目和出题流程搬进父类 `TestPaper`，子类**只填答案**。',
  analogy: '填报销单：财务印好统一格式的表格（日期 → 事由 → 金额 → 签字，顺序固定），每个人只填自己的内容。表格要改格式，财务**重印一版**就行，不用每个人各画一张表。',
  when: [
    '几个子类的**流程一模一样**，只有其中几步不同',
    '子类里出现了大段**重复代码**，想把不变的部分提到父类',
    '希望**控制流程**，只允许子类在指定的步骤上做扩展',
  ],
  pros: ['不变的行为搬到父类，**去除子类中的重复代码**', '流程只写一次，改流程**只改一处**', '提供了很好的代码复用平台'],
  cons: ['每多一种“细节”就多一个子类', '流程被父类锁死，子类想调整顺序很难', '靠继承实现，父子类耦合较紧'],
  keyPoints: [
    '两个角色：**AbstractClass**（父类，写模板方法 + 抽象步骤）、**ConcreteClass**（子类，实现那些步骤）',
    '模板方法 = 父类里的**骨架方法**：不变的步骤直接写死，可变的步骤调用抽象方法（书中是返回空串的虚方法）',
    'Java 里常把模板方法声明为 `final`，防止子类改掉流程；也可以再写一个 `takeExam()` 依次调用三道题',
  ],
  code: `
// 父类：题目和流程只写一次（模板）
abstract class TestPaper {
    public final void testQuestion1() {                 // 模板方法：骨架固定
        System.out.println("杨过得到的玄铁可能是[ ] a.球磨铸铁 b.马口铁 c.高速合金钢 d.碳素纤维");
        System.out.println("答案：" + answer1());       // 可变的一步，交给子类
    }
    public final void testQuestion2() {
        System.out.println("杨过等人铲除了情花，造成[ ] a.不再害人 b.珍稀物种灭绝 c.生态失衡 d.沙漠化");
        System.out.println("答案：" + answer2());
    }
    public final void testQuestion3() {
        System.out.println("蓝凤凰让众人呕吐不止，该开什么药[ ] a.阿司匹林 b.牛黄解毒片 c.氟哌酸 d.生牛奶");
        System.out.println("答案：" + answer3());
    }
    protected abstract String answer1();                // 留给子类的“空”
    protected abstract String answer2();
    protected abstract String answer3();
}
// 子类：只填答案，一个字的题目都没有
class TestPaperA extends TestPaper {
    protected String answer1() { return "b"; }
    protected String answer2() { return "c"; }
    protected String answer3() { return "a"; }
}
class TestPaperB extends TestPaper {
    protected String answer1() { return "c"; }
    protected String answer2() { return "a"; }
    protected String answer3() { return "a"; }
}
// 客户端：声明为父类类型，享受多态
TestPaper studentA = new TestPaperA();
studentA.testQuestion1();
studentA.testQuestion2();
studentA.testQuestion3();
TestPaper studentB = new TestPaperB();   // 换学生只改这一处
studentB.testQuestion1();                // 同一套流程，答案不同`,
  codePython: `
from abc import ABC, abstractmethod


# 父类：题目和流程只写一次（模板）
class TestPaper(ABC):
    def test_question1(self):               # 模板方法：骨架固定
        print("杨过得到的玄铁可能是[ ] a.球磨铸铁 b.马口铁 c.高速合金钢 d.碳素纤维")
        print("答案：" + self.answer1())    # 可变的一步，交给子类

    def test_question2(self):
        print("杨过等人铲除了情花，造成[ ] a.不再害人 b.珍稀物种灭绝 c.生态失衡 d.沙漠化")
        print("答案：" + self.answer2())

    def test_question3(self):
        print("蓝凤凰让众人呕吐不止，该开什么药[ ] a.阿司匹林 b.牛黄解毒片 c.氟哌酸 d.生牛奶")
        print("答案：" + self.answer3())

    @abstractmethod                         # 留给子类的“空”
    def answer1(self) -> str: ...

    @abstractmethod
    def answer2(self) -> str: ...

    @abstractmethod
    def answer3(self) -> str: ...


# 子类：只填答案，一个字的题目都没有
class TestPaperA(TestPaper):
    def answer1(self): return "b"
    def answer2(self): return "c"
    def answer3(self): return "a"


class TestPaperB(TestPaper):
    def answer1(self): return "c"
    def answer2(self): return "a"
    def answer3(self): return "a"


# 客户端：声明为父类类型，享受多态（self.answer1() 会动态分派到子类）
if __name__ == "__main__":
    student_a: TestPaper = TestPaperA()
    student_a.test_question1()              # 答案：b
    student_a.test_question2()              # 答案：c
    student_a.test_question3()              # 答案：a
    student_b: TestPaper = TestPaperB()     # 换学生只改这一处
    student_b.test_question1()              # 同一套流程，答案：c`,
  codeGo: `
package main

import "fmt"

// Go 没有继承，也没有虚方法：如果模板方法写在被嵌入的“父”结构体上，
// 它调用 t.Answer1() 时找到的是自己的方法，不会分派到“子类”。
// 所以把可变的步骤抽成接口，模板通过接口去调用，这才是 Go 版的模板方法。
type Answers interface {
	Answer1() string
	Answer2() string
	Answer3() string
}

// 父类：题目和流程只写一次（模板），可变的答案通过接口交出去
type TestPaper struct{ answers Answers }

func (t TestPaper) TestQuestion1() { // 模板方法：骨架固定
	fmt.Println("杨过得到的玄铁可能是[ ] a.球磨铸铁 b.马口铁 c.高速合金钢 d.碳素纤维")
	fmt.Println("答案：" + t.answers.Answer1()) // 可变的一步，交给实现者
}

func (t TestPaper) TestQuestion2() {
	fmt.Println("杨过等人铲除了情花，造成[ ] a.不再害人 b.珍稀物种灭绝 c.生态失衡 d.沙漠化")
	fmt.Println("答案：" + t.answers.Answer2())
}

func (t TestPaper) TestQuestion3() {
	fmt.Println("蓝凤凰让众人呕吐不止，该开什么药[ ] a.阿司匹林 b.牛黄解毒片 c.氟哌酸 d.生牛奶")
	fmt.Println("答案：" + t.answers.Answer3())
}

// “子类”：只填答案，一个字的题目都没有
type TestPaperA struct{}

func (TestPaperA) Answer1() string { return "b" }
func (TestPaperA) Answer2() string { return "c" }
func (TestPaperA) Answer3() string { return "a" }

type TestPaperB struct{}

func (TestPaperB) Answer1() string { return "c" }
func (TestPaperB) Answer2() string { return "a" }
func (TestPaperB) Answer3() string { return "a" }

// 客户端：换学生只改传进去的实现
func main() {
	studentA := TestPaper{TestPaperA{}}
	studentA.TestQuestion1() // 答案：b
	studentA.TestQuestion2() // 答案：c
	studentA.TestQuestion3() // 答案：a
	studentB := TestPaper{TestPaperB{}}
	studentB.TestQuestion1() // 同一套流程，答案：c
}`,
  compare: [
    { id: 'strategy', text: '模板方法靠**继承**：父类定骨架，子类只换其中几步；策略靠**组合**：整个算法是一个对象，运行时可以整体替换。' },
    { id: 'builder', text: '建造者的指挥者也固定了步骤顺序，但目的是**造出一个复杂对象**；模板方法关心的是**一段流程**的复用，靠子类重写其中的步骤。' },
  ],
  quiz: [
    { q: '系统里有 Excel、PDF、CSV 三种报表导出，步骤都是“查数据 → 格式化 → 写文件 → 发邮件”，只有“格式化”这一步不同，现在三个导出类各自把整套流程复制了一遍。', why: '流程固定、个别步骤不同、子类大量重复——把骨架提到父类，差异步骤留给子类。' },
    { q: '泡茶和冲咖啡的步骤都是“烧水 → 冲泡 → 倒进杯子 → 加调料”，区别只在冲泡什么、加什么调料，希望整个流程只写一次，而且不允许子类打乱顺序。' },
  ],

  nodes: {
    // —— 场景一：抄题 ——
    board: { kind: 'box', icon: '👨‍🏫', label: '黑板上的考题', sub: '3 道金庸武侠选择题', x: 500, y: 130, tone: 'green', size: 'lg' },
    stuA: { kind: 'actor', icon: '👨‍🎓', label: '学生甲', x: 290, y: 300, tone: 'blue' },
    stuB: { kind: 'actor', icon: '👦', label: '学生乙', x: 710, y: 300, tone: 'indigo' },
    paperA: { kind: 'box', shape: 'note', icon: '📝', label: '甲的卷子', sub: '题目抄对 · 答案 b', x: 290, y: 450, tone: 'yellow' },
    paperB: { kind: 'box', shape: 'note', icon: '📝', label: '乙的卷子', sub: '选项抄错 · 答案也对不上', x: 710, y: 450, tone: 'yellow' },

    // —— 场景二：小菜的第一版 ——
    dupA: {
      kind: 'class', title: 'TestPaperA', sub: '学生甲抄的试卷', x: 255, y: 280, tone: 'blue',
      lines: ['testQuestion1() {', '  print("玄铁可能是[ ] a.球磨铸铁…")', '  print("答案：b")', '}', 'testQuestion2() { 题目 + 答案c }', 'testQuestion3() { 题目 + 答案a }'],
    },
    dupB: {
      kind: 'class', title: 'TestPaperB', sub: '学生乙抄的试卷', x: 745, y: 280, tone: 'indigo',
      lines: ['testQuestion1() {', '  print("玄铁可能是[ ] a.球磨铸铁…")', '  print("答案：c")', '}', 'testQuestion2() { 题目 + 答案a }', 'testQuestion3() { 题目 + 答案a }'],
    },
    same: { kind: 'text', text: '≈', x: 500, y: 280, tone: 'red', size: 'xl' },

    // —— 场景三：父类 + 子类 ——
    base: {
      kind: 'class', title: 'TestPaper', stereo: 'abstract', sub: '试卷（题目只写一次）', x: 500, y: 165, tone: 'purple',
      lines: ['+ testQuestion1()', '+ testQuestion2()', '+ testQuestion3()'],
    },
    tplNote: { kind: 'box', shape: 'note', icon: '📌', label: 'testQuestionN() =', sub: '① 印出第 N 题（写死）\n② 填入 answerN()（留空）', x: 815, y: 165, w: 232, tone: 'yellow' },
    subA: { kind: 'class', title: 'TestPaperA', sub: '学生甲', x: 330, y: 440, tone: 'blue', lines: ['# answer1() → "b"', '# answer2() → "c"', '# answer3() → "a"'] },
    subB: { kind: 'class', title: 'TestPaperB', sub: '学生乙', x: 670, y: 440, tone: 'indigo', lines: ['# answer1() → "c"', '# answer2() → "a"', '# answer3() → "a"'] },
    client: { kind: 'actor', icon: '👨‍💻', label: '客户端', sub: 'new TestPaperA()', x: 120, y: 200, tone: 'gray' },
    tipFix: { kind: 'text', text: '子类一行都没动 ✔', x: 500, y: 530, tone: 'green', size: 'sm' },
  },
  links: {
    l_a: { from: 'subA', to: 'base', kind: 'inherit' },
    l_b: { from: 'subB', to: 'base', kind: 'inherit' },
    l_cli: { from: 'client', to: 'base', kind: 'assoc' },
  },

  frames: [
    {
      title: '回忆：抄黑板上的考题',
      text: '小菜想起上学时：老师把考题写在**黑板**上，学生甲、学生乙各自**抄一份**再作答。题目是几道金庸武侠选择题，比如“杨过给郭靖的**玄铁**，可能是什么材料？”',
      show: ['board', 'stuA', 'stuB'],
      flows: [
        { from: 'board', to: 'stuA', label: '抄题 ✍️', step: 0 },
        { from: 'board', to: 'stuB', label: '抄题 ✍️', step: 0 },
      ],
    },
    {
      title: '抄错题，会做也白搭',
      text: '结果学生乙**抄错了一个选项**，答案明明会做，却对不上原题，白白丢分。小菜感慨：**题目抄错了，会做也白搭**。大鸟说：所以老师应该**统一印卷子**——题目只出一次，学生只负责填答案。',
      show: ['paperA', 'paperB'],
      set: { paperA: { badge: '✓' }, paperB: { badge: '0 分', strike: true } },
      focus: ['paperB', 'stuB'],
      bubbles: [
        { node: 'stuB', text: '我明明会做啊！😭', side: 'right' },
      ],
    },
    {
      title: '小菜的第一版：各抄一份',
      text: '可小菜写代码时恰恰犯了“抄题”的错：`TestPaperA` 和 `TestPaperB` 两个类，**每个都把三道题完整写了一遍**，唯一不同的只是答案是 b 还是 c。',
      clear: true,
      show: ['dupA', 'dupB'],
      focus: ['dupA', 'dupB'],
    },
    {
      title: '问题：重复就是隐患',
      text: '两份代码**几乎一模一样**。老师改一道题，两个类都得改；以后有 50 个学生就是 50 份副本，漏改一份就等于“抄错题”。大鸟说：**重复的代码，就是将来出错的地方。**',
      show: ['same'],
      set: {
        dupA: { lines: ['testQuestion1() {', '!  print("玄铁可能是[ ] a.球磨铸铁…")', '  print("答案：b")', '}', '!testQuestion2() { 题目 + 答案c }', '!testQuestion3() { 题目 + 答案a }'], badge: '重复' },
        dupB: { lines: ['testQuestion1() {', '!  print("玄铁可能是[ ] a.球磨铸铁…")', '  print("答案：c")', '}', '!testQuestion2() { 题目 + 答案a }', '!testQuestion3() { 题目 + 答案a }'], badge: '重复' },
      },
      focus: ['dupA', 'dupB', 'same'],
      bubbles: [
        { node: 'same', text: '题目改一个字，**两边都得改**', side: 'bottom', dy: 70 },
      ],
    },
    {
      title: '题目搬进父类',
      text: '大鸟让小菜提炼一个父类：试卷 `TestPaper`。三道题的题目和出题流程 `testQuestion1()`～`testQuestion3()` **全写在父类里，只写一次**。这就相当于老师“统一印好的卷子”。',
      clear: true,
      show: ['base'],
      focus: ['base'],
    },
    {
      title: '变化的只有答案',
      text: '每道题里唯一因人而异的，只有**答案**。所以父类在印完题目之后，调用一个**留给子类**的方法 `answer1()`、`answer2()`、`answer3()`。题目和流程固定，**答案留空**。',
      show: ['tplNote'],
      set: { base: { lines: ['+ testQuestion1()', '+ testQuestion2()', '+ testQuestion3()', '# answer1(): String', '# answer2(): String', '# answer3(): String'] } },
      focus: ['base', 'tplNote'],
    },
    {
      title: '子类只填答案',
      text: '现在学生的试卷类变得很“瘦”：`TestPaperA`、`TestPaperB` 继承 `TestPaper`，**只重写三个 answer 方法**，返回自己的选项，**一个字的题目都没有**。',
      show: ['subA', 'subB', 'l_a', 'l_b'],
      focus: ['subA', 'subB', 'l_a', 'l_b'],
    },
    {
      title: '运行：甲答第 1 题',
      text: '客户端拿着学生甲的卷子调用 `testQuestion1()`。这个方法写在**父类**里：先印出题目，走到“答案”这一步时，**回头调用**子类 `TestPaperA` 的 `answer1()`，拿到“b”，填进卷子。',
      show: ['client', 'l_cli'],
      set: {
        base: { lines: ['!+ testQuestion1()', '+ testQuestion2()', '+ testQuestion3()', '# answer1(): String', '# answer2(): String', '# answer3(): String'] },
        subA: { lines: ['!# answer1() → "b"', '# answer2() → "c"', '# answer3() → "a"'] },
      },
      focus: ['client', 'base', 'subA', 'l_cli', 'tplNote'],
      flows: [
        { from: 'client', to: 'base', label: 'testQuestion1()' },
        { from: 'base', to: 'subA', label: 'answer1()' },
        { from: 'subA', to: 'base', label: '"b"', back: true, tone: 'teal' },
      ],
      bubbles: [
        { node: 'tplNote', text: '🖨️ 题1：玄铁可能是[ ]…\n答案：**b**', side: 'bottom', step: 2 },
      ],
    },
    {
      title: '第 2 题：同样的套路',
      text: '第 2 题流程完全一样：父类的 `testQuestion2()` 印出题目，再向子类要 `answer2()`。注意：**流程始终由父类掌控**，子类只在被叫到时交出答案，第 3 题也是如此。',
      set: {
        base: { lines: ['+ testQuestion1()', '!+ testQuestion2()', '+ testQuestion3()', '# answer1(): String', '# answer2(): String', '# answer3(): String'] },
        subA: { lines: ['# answer1() → "b"', '!# answer2() → "c"', '# answer3() → "a"'] },
      },
      focus: ['client', 'base', 'subA', 'l_cli', 'tplNote'],
      flows: [
        { from: 'client', to: 'base', label: 'testQuestion2()' },
        { from: 'base', to: 'subA', label: 'answer2()' },
        { from: 'subA', to: 'base', label: '"c"', back: true, tone: 'teal' },
      ],
      bubbles: [
        { node: 'tplNote', text: '🖨️ 题2：铲除情花，造成[ ]…\n答案：**c**', side: 'bottom', step: 2 },
      ],
    },
    {
      title: '换成学生乙',
      text: '换成学生乙：客户端只改了一处 `new TestPaperB()`。父类的模板**一模一样地执行**，只是回调到了 `TestPaperB` 的 `answer1()`，拿到“c”。**同一套骨架，不同的细节。**',
      set: {
        client: { sub: 'new TestPaperB()' },
        base: { lines: ['!+ testQuestion1()', '+ testQuestion2()', '+ testQuestion3()', '# answer1(): String', '# answer2(): String', '# answer3(): String'] },
        subA: { lines: ['# answer1() → "b"', '# answer2() → "c"', '# answer3() → "a"'] },
        subB: { lines: ['!# answer1() → "c"', '# answer2() → "a"', '# answer3() → "a"'] },
      },
      focus: ['client', 'base', 'subB', 'l_cli', 'tplNote'],
      flows: [
        { from: 'client', to: 'base', label: 'testQuestion1()' },
        { from: 'base', to: 'subB', label: 'answer1()' },
        { from: 'subB', to: 'base', label: '"c"', back: true, tone: 'teal' },
      ],
      bubbles: [
        { node: 'tplNote', text: '🖨️ 题1：玄铁可能是[ ]…\n答案：**c**', side: 'bottom', step: 2 },
      ],
    },
    {
      title: '老师改题：只改一处',
      text: '老师发现第 1 题有个选项写得不好，要改。现在只需要改父类 `TestPaper` **这一处**，所有学生的卷子自动跟着变，子类一行不动——**把不变的行为搬到父类，重复代码就没了**。',
      show: ['tipFix'],
      set: {
        base: { lines: ['!+ testQuestion1()  ← 改题', '+ testQuestion2()', '+ testQuestion3()', '# answer1(): String', '# answer2(): String', '# answer3(): String'], badge: '只改这里' },
        subB: { lines: ['# answer1() → "c"', '# answer2() → "a"', '# answer3() → "a"'] },
      },
      focus: ['base', 'subA', 'subB', 'tipFix'],
    },
    {
      title: '总结：模板方法模式',
      text: '模板方法：在父类里定义一个操作的**算法骨架**，把其中一些步骤**延迟到子类**去实现。子类能改变某些步骤，却**改变不了整体流程**。一句话记住：**流程父类定死，细节子类来填。**',
      hide: ['tipFix', 'client', 'l_cli'],
      set: {
        base: { lines: ['+ testQuestion1()', '+ testQuestion2()', '+ testQuestion3()', '# answer1(): String', '# answer2(): String', '# answer3(): String'], badge: '' },
      },
      focus: ['base', 'tplNote', 'subA', 'subB', 'l_a', 'l_b'],
      bubbles: [
        { node: 'base', text: '**骨架**我来定：先印题、再要答案', side: 'left' },
        { node: 'subB', text: '我只负责**填空**', side: 'right' },
      ],
    },
  ],
});
