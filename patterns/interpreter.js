DP.register({
  id: 'interpreter',
  order: 27,
  type: 'behavioral',
  name: '解释器模式',
  en: 'Interpreter',
  emoji: '🎼',
  chapter: '第 27 章 · 其实你不懂老板的心',
  mnemonic: '一条文法一个类，句子拆开挨个解',
  summary: '把一种简单语言的每条文法规则写成一个类，用它们把句子一段一段解释执行。',
  intent: '给定一个语言，定义它的文法的一种表示，并定义一个解释器，这个解释器使用该表示来解释语言中的句子。',
  story: '小菜总听不懂老板的“话外音”，大鸟说：老板的话也是一种语言，得按规则去**解释**。接着出题：写一个**音乐解释器**，把“O 2 E 0.5 G 0.5 A 3 ……”这样的文本乐谱演奏出来（正是《上海滩》的“浪奔、浪流”）。O 是**音阶**，C~B 是**音符**，后面的数字是拍数；后来又加了 T 表示**速度**——每条规则一个类，扩展时加类即可。',
  analogy: '计算器 App：你输入“3 + 5 × 2”，它按“先乘除后加减”的文法把这句话拆开，数字交给“数字规则”、加号交给“加法规则”、乘号交给“乘法规则”，一步步算出 13。每条规则就是一个解释器类。',
  when: [
    '有一种**简单的语言 / 格式**需要反复解释执行（简单脚本、规则表达式、指令串）',
    '文法**比较简单**，且以后可能要扩展新规则',
    '效率不是首要问题，更看重清晰和易扩展',
  ],
  pros: [
    '每条文法规则一个类，**容易理解、修改和扩展**',
    '新增规则只需**新增一个表达式类**（再在创建处加个分支）',
    '文法规则的实现彼此独立，结构清楚',
  ],
  cons: [
    '文法一复杂，**类的数量爆炸**，难以维护',
    '复杂文法应改用**语法分析器生成器**（如 ANTLR、yacc）或编译器技术',
    '逐条解释，执行效率不高',
  ],
  keyPoints: [
    '角色：**Context**（上下文 PlayContext，装待解释的文本）、**AbstractExpression**（Expression，统一的 interpret）、**TerminalExpression**（Note、Scale、Speed，各管一条规则）、**NonterminalExpression**（组合其他表达式的规则，本例未用到）',
    '书中的 `interpret()` 是个**模板方法**：固定“读一段 → 截掉 → execute”，`execute()` 交给子类',
    '“选哪个表达式”由客户端看首字母决定；更复杂时会先把句子解析成一棵**抽象语法树**再解释',
  ],
  code: `
// 演奏内容（上下文）：装着还没解释完的乐谱文本
class PlayContext {
    private String playText;
    public String getPlayText()       { return playText; }
    public void setPlayText(String t) { playText = t; }
}
// 抽象表达式：读出“一个字母 + 一个数字”，截掉这一段，再交给子类执行
abstract class Expression {
    public void interpret(PlayContext ctx) {
        String text = ctx.getPlayText().trim();
        if (text.isEmpty()) return;
        String[] p = text.split(" ", 3);                  // 如 "E", "0.5", 剩余文本
        ctx.setPlayText(p.length > 2 ? p[2] : "");
        execute(p[0], Double.parseDouble(p[1]));
    }
    public abstract void execute(String key, double value);
}
class Note extends Expression {                           // 音符：C D E F G A B
    public void execute(String key, double value) {
        String[] names = {"do", "re", "mi", "fa", "sol", "la", "si"};
        System.out.print(names["CDEFGAB".indexOf(key)] + "(" + value + "拍) ");
    }
}
class Scale extends Expression {                          // 音阶：O 1 / 2 / 3
    public void execute(String key, double value) {
        String[] s = {"", "低音", "中音", "高音"};
        System.out.print(s[(int) value] + " ");
    }
}
class Speed extends Expression {                          // 新增：音速 T
    public void execute(String key, double value) {
        System.out.print(value < 500 ? "快速 " : value >= 1000 ? "慢速 " : "中速 ");
    }
}
// 客户端：看首字母，决定用哪个表达式来解释
PlayContext ctx = new PlayContext();
ctx.setPlayText("T 500 O 2 E 0.5 G 0.5 A 3 E 0.5 G 0.5 D 3");
while (!ctx.getPlayText().isEmpty()) {
    Expression exp;
    switch (ctx.getPlayText().substring(0, 1)) {
        case "O": exp = new Scale(); break;
        case "T": exp = new Speed(); break;               // 扩展：只加这一行
        default:  exp = new Note();  break;               // C D E F G A B
    }
    exp.interpret(ctx);
}`,
  codePython: `
from abc import ABC, abstractmethod


# 演奏内容（上下文）：装着还没解释完的乐谱文本
class PlayContext:
    def __init__(self, text):
        self.play_text = text


# 抽象表达式：读出“一个字母 + 一个数字”，截掉这一段，再交给子类执行
class Expression(ABC):
    def interpret(self, ctx: PlayContext):        # 模板方法
        text = ctx.play_text.strip()
        if not text:
            return
        key, value, *rest = text.split(" ", 2)    # 如 "E", "0.5", 剩余文本
        ctx.play_text = rest[0] if rest else ""
        self.execute(key, float(value))

    @abstractmethod
    def execute(self, key: str, value: float): ...


class Note(Expression):                           # 音符：C D E F G A B
    def execute(self, key, value):
        name = ["do", "re", "mi", "fa", "sol", "la", "si"]["CDEFGAB".index(key)]
        print(f"{name}({value}拍)", end=" ")


class Scale(Expression):                          # 音阶：O 1 / 2 / 3
    def execute(self, key, value):
        print(["", "低音", "中音", "高音"][int(value)], end=" ")


class Speed(Expression):                          # 新增：音速 T
    def execute(self, key, value):
        print("快速" if value < 500 else "慢速" if value >= 1000 else "中速", end=" ")


# 客户端：看首字母，决定用哪个表达式来解释
if __name__ == "__main__":
    ctx = PlayContext("T 500 O 2 E 0.5 G 0.5 A 3 E 0.5 G 0.5 D 3")
    while ctx.play_text:
        match ctx.play_text[0]:                   # Python 3.10+ 的 match，对应 Java 的 switch
            case "O": exp = Scale()
            case "T": exp = Speed()               # 扩展：只加这一行
            case _: exp = Note()                  # C D E F G A B
        exp.interpret(ctx)
    print()
    # 中速 中音 mi(0.5拍) sol(0.5拍) la(3.0拍) mi(0.5拍) sol(0.5拍) re(3.0拍)`,
  codeGo: `
package main

import (
	"fmt"
	"strconv"
	"strings"
)

// 演奏内容（上下文）：装着还没解释完的乐谱文本
type PlayContext struct{ PlayText string }

// 抽象表达式：每条文法规则只需实现 Execute
type Expression interface {
	Execute(key string, value float64)
}

// Go 没有继承，Java 里的模板方法 interpret 改成普通函数：
// 读出“一个字母 + 一个数字”，截掉这一段，再交给表达式执行
func Interpret(e Expression, ctx *PlayContext) {
	p := strings.Fields(ctx.PlayText) // 如 "E", "0.5", 剩余文本
	if len(p) < 2 {
		ctx.PlayText = ""
		return
	}
	ctx.PlayText = strings.Join(p[2:], " ")
	value, _ := strconv.ParseFloat(p[1], 64)
	e.Execute(p[0], value)
}

type Note struct{} // 音符：C D E F G A B

func (Note) Execute(key string, value float64) {
	names := []string{"do", "re", "mi", "fa", "sol", "la", "si"}
	fmt.Printf("%s(%.1f拍) ", names[strings.Index("CDEFGAB", key)], value)
}

type Scale struct{} // 音阶：O 1 / 2 / 3

func (Scale) Execute(key string, value float64) {
	fmt.Print([]string{"", "低音", "中音", "高音"}[int(value)], " ")
}

type Speed struct{} // 新增：音速 T

func (Speed) Execute(key string, value float64) {
	switch {
	case value < 500:
		fmt.Print("快速 ")
	case value >= 1000:
		fmt.Print("慢速 ")
	default:
		fmt.Print("中速 ")
	}
}

// 客户端：看首字母，决定用哪个表达式来解释
func main() {
	ctx := &PlayContext{"T 500 O 2 E 0.5 G 0.5 A 3 E 0.5 G 0.5 D 3"}
	for ctx.PlayText != "" {
		var exp Expression
		switch ctx.PlayText[:1] {
		case "O":
			exp = Scale{}
		case "T":
			exp = Speed{} // 扩展：只加这一段
		default:
			exp = Note{} // C D E F G A B
		}
		Interpret(exp, ctx)
	}
	fmt.Println() // 中速 中音 mi(0.5拍) sol(0.5拍) la(3.0拍) mi(0.5拍) sol(0.5拍) re(3.0拍)
}`,
  compare: [
    { id: 'composite', text: '组合模式是“把对象组织成树”；解释器解析复杂句子时，得到的**抽象语法树**正是一棵组合树，解释器在树上逐个节点地 `interpret()`。' },
    { id: 'template-method', text: '书中 `Expression.interpret()` 本身就是个**模板方法**（读一段 → 截掉 → execute）；但解释器模式的重点是“**一条文法规则一个类**”，用来解释一种语言。' },
  ],
  quiz: [
    { q: '你要给计算器做输入框：用户输入“3 + 5 * (2 - 1)”这样的字符串，程序按加减乘除和括号的规则算出结果。规则不多，但以后要能方便地加入“取模”“乘方”运算。', why: '为一种简单语言（算术表达式）定义文法，并按规则逐个解释——解释器模式。' },
    { q: '游戏给策划提供一种小脚本：“MOVE 3 JUMP 1 ATTACK 2”。程序每次读一个指令词和后面的数字，交给对应的规则类去执行；以后新增一种指令，只要新增一个规则类。' },
  ],

  nodes: {
    /* ---- 场景一：老板的话 ---- */
    boss: { kind: 'actor', icon: '👔', label: '老板', x: 140, y: 290, tone: 'orange' },
    interp: { kind: 'box', icon: '🧠', label: '解释器', sub: '按规则翻译', x: 500, y: 290, tone: 'purple', size: 'lg' },
    xc: { kind: 'actor', icon: '👨‍💻', label: '小菜', x: 860, y: 290, tone: 'blue' },

    /* ---- 场景二：乐谱 ---- */
    score: {
      kind: 'box', icon: '🎼', shape: 'note', mono: true, w: 700, x: 520, y: 140, tone: 'yellow',
      label: 'O 2 E 0.5 G 0.5 A 3 E 0.5 G 0.5 D 3 E 0.5 G 0.5 A 0.5 O 3 C 1 O 2 A 0.5 G 1 C 0.5 E 0.5 D 3',
    },
    dabird: { kind: 'actor', icon: '👨‍🏫', label: '大鸟', x: 140, y: 440, tone: 'purple' },
    xc2: { kind: 'actor', icon: '👨‍💻', label: '小菜', x: 860, y: 440, tone: 'blue' },
    rO: { kind: 'box', icon: '🎚️', label: 'O = 音阶', sub: '1 低音 · 2 中音 · 3 高音', x: 330, y: 310, tone: 'teal' },
    rN: { kind: 'box', icon: '🎵', label: 'C D E F G A B = 音符', sub: 'do re mi fa sol la si，数字 = 拍数', x: 670, y: 310, tone: 'pink' },

    /* ---- 场景三：代码结构 ---- */
    ctx: {
      kind: 'class', title: 'PlayContext', sub: '演奏内容（上下文）', x: 210, y: 112, tone: 'yellow',
      lines: ['- playText =', '"O 2 E 0.5 G 0.5 A 3 …"'],
    },
    exp: {
      kind: 'class', title: 'Expression', stereo: 'abstract', sub: '表达式（抽象）', x: 660, y: 118, tone: 'purple',
      lines: ['+ interpret(ctx):', '\u00a0\u00a0\u00a0① 读出 字母 + 数字', '\u00a0\u00a0\u00a0② 从文本里截掉', '\u00a0\u00a0\u00a0③ execute(key, value)'],
    },
    note: { kind: 'class', title: 'Note', sub: '音符 C D E F G A B', x: 470, y: 330, tone: 'pink', lines: ['E 0.5 → mi ½拍'] },
    scale: { kind: 'class', title: 'Scale', sub: '音阶 O：1低 2中 3高', x: 660, y: 330, tone: 'teal', lines: ['O 2 → 中音'] },
    speed: { kind: 'class', title: 'Speed', sub: '音速 T：快 / 中 / 慢', x: 850, y: 330, tone: 'orange', badge: 'NEW', lines: ['T 500 → 中速'] },
    client: {
      kind: 'class', title: 'Client', sub: '客户端：看首字母派活', x: 190, y: 345, tone: 'gray',
      lines: ['while (还有文本) {', '\u00a0\u00a0switch (首字母) {', '\u00a0\u00a0\u00a0\u00a0"O" → new Scale()', '\u00a0\u00a0\u00a0\u00a0其他 → new Note()', '\u00a0\u00a0}', '\u00a0\u00a0exp.interpret(ctx);', '}'],
    },
    out: { kind: 'box', icon: '🔊', label: '演奏：', x: 660, y: 482, tone: 'green' },

    /* ---- 场景四：现实世界 ---- */
    w_re: { kind: 'box', icon: '🔍', label: '正则表达式', sub: '\\d{3}-\\d{8} 匹配电话号码', x: 210, y: 170, tone: 'blue' },
    w_sql: { kind: 'box', icon: '🗄️', label: 'SQL', sub: 'SELECT * FROM 乘客', x: 500, y: 170, tone: 'teal' },
    w_web: { kind: 'box', icon: '🌐', label: '浏览器', sub: '解释 HTML / JavaScript', x: 790, y: 170, tone: 'orange' },
    w_bad: { kind: 'box', icon: '🌳', label: '文法很复杂时', sub: '几百条规则 → 几百个类', x: 330, y: 380, tone: 'red', badge: '类爆炸' },
    w_tool: { kind: 'box', icon: '⚙️', label: '改用语法分析器生成器', sub: '如 ANTLR、yacc', x: 700, y: 380, tone: 'green' },
  },
  links: {
    l_bi: { from: 'boss', to: 'interp', kind: 'line', tone: 'gray' },
    l_ix: { from: 'interp', to: 'xc', kind: 'line', tone: 'gray' },
    l_note: { from: 'note', to: 'exp', kind: 'inherit' },
    l_scale: { from: 'scale', to: 'exp', kind: 'inherit' },
    l_speed: { from: 'speed', to: 'exp', kind: 'inherit' },
    l_ec: { from: 'exp', to: 'ctx', kind: 'depend', label: '读一段、截一段' },
    l_cc: { from: 'client', to: 'ctx', kind: 'assoc', label: '看首字母' },
    l_bt: { from: 'w_bad', to: 'w_tool', kind: 'arrow', label: '更好的办法' },
  },

  frames: [
    {
      title: '老板的话，要“解释”',
      text: '小菜抱怨：老板一句“这事你**看着办**吧”，到底是随便办，还是必须办好？大鸟笑：老板的话也是一种“**语言**”，有它自己的**规则**；按规则去解释，才能听懂真正意思。干这活的，就叫**解释器**。',
      show: ['boss', 'interp', 'xc', 'l_bi', 'l_ix'],
      flows: [
        { from: 'boss', to: 'interp', label: '“你看着办”' },
        { from: 'interp', to: 'xc', label: '= 今天必须办好！', tone: 'green' },
      ],
      bubbles: [
        { node: 'boss', text: '小菜，这事**你看着办**吧。', side: 'top' },
        { node: 'xc', text: '原来是这个意思……', side: 'top', step: 1 },
      ],
    },
    {
      title: '音乐解释器：出题',
      text: '大鸟出了道正经题：给你一段**文本乐谱**，让程序把它“演奏”出来。小菜一看就乐了：这不是《上海滩》吗——“浪奔，浪流……”。可程序看不懂旋律，它需要一套**规则**来解释这串文字。',
      clear: true,
      show: ['score', 'dabird', 'xc2'],
      focus: ['score'],
      dim: false,
      bubbles: [
        { node: 'dabird', text: '把这段文字**演奏**出来！', side: 'top' },
        { node: 'xc2', text: '这不是《上海滩》吗？浪奔、浪流……', side: 'top', delay: 0.7 },
      ],
    },
    {
      title: '文法：字母 + 数字',
      text: '仔细看，这串文字有**固定的文法**：每一段都是“**一个字母 + 一个数字**”。`O` 表示**音阶**（1 低音、2 中音、3 高音）；`C D E F G A B` 是**音符** do re mi……，数字是**拍数**。比如 `E 0.5`，就是 mi 唱半拍。',
      show: ['rO', 'rN'],
      set: { score: { label: 'O 2 │ E 0.5 │ G 0.5 │ A 3 │ E 0.5 │ G 0.5 │ D 3 │ E 0.5 │ G 0.5 │ A 0.5 │ O 3 │ C 1 │ …' } },
      focus: ['score', 'rO', 'rN'],
    },
    {
      title: '大鸟：一条规则一个类',
      text: '大鸟点拨：别写一个巨大的 if/else 去硬读整串文本。**每一种文法规则，写成一个类**：音阶一个类、音符一个类。再准备一个“演奏内容”装着文本，大家**一段一段**地读、一段一段地解释。',
      set: { rO: { badge: '→ Scale 类' }, rN: { badge: '→ Note 类' } },
      focus: ['rO', 'rN', 'dabird'],
      bubbles: [{ node: 'dabird', text: '**一条规则 = 一个类**', side: 'top' }],
    },
    {
      title: '演奏内容 PlayContext',
      text: '先来一个**演奏内容** `PlayContext`，也就是解释器里的“**上下文**”：它只装着一串**还没解释完**的乐谱文本。每解释掉一段，就从文本开头**截掉**一段，直到文本为空。',
      clear: true,
      show: ['ctx'],
      focus: ['ctx'],
    },
    {
      title: '抽象表达式 Expression',
      text: '再定义**抽象表达式** `Expression`。它的 `interpret(context)` 是固定套路：① 从文本开头读出一个**字母**和一个**数字**；② 把这段截掉；③ 调用 `execute(key, value)`。第 ③ 步具体做什么，**留给子类**。',
      show: ['exp', 'l_ec'],
      focus: ['exp', 'ctx', 'l_ec'],
      flows: [{ from: 'ctx', to: 'exp', label: '读出 "O"、2' }],
    },
    {
      title: '音符 Note、音阶 Scale',
      text: '每条文法规则对应一个子类：**音符** `Note` 把 C~B 翻译成 do re mi，再带上拍数；**音阶** `Scale` 把 O 后面的 1、2、3 翻译成**低音、中音、高音**。规则各管各的，互不干扰。',
      show: ['note', 'scale', 'l_note', 'l_scale'],
      focus: ['note', 'scale', 'l_note', 'l_scale'],
    },
    {
      title: '客户端：看首字母派活',
      text: '谁决定用哪个表达式？**客户端**。它在循环里看文本的**第一个字母**：是 `O` 就 new 一个 `Scale`，是 C~B 就 new 一个 `Note`，然后调用它的 `interpret()`。一圈一圈，直到文本读完。',
      show: ['client', 'l_cc'],
      focus: ['client', 'ctx', 'l_cc'],
      flows: [{ from: 'ctx', to: 'client', label: '首字母 "O"' }],
    },
    {
      title: '解释 “O 2” → 中音',
      text: '开始演奏！文本开头是 `O 2`：客户端看到 **O**，派给 `Scale`；它读出 2，截掉这一段，输出“**中音**”。演奏内容里的文本**短了一截**，接下来轮到 `E 0.5`。',
      show: ['out'],
      set: {
        ctx: { lines: ['- playText =', '"E 0.5 G 0.5 A 3 E 0.5 …"'] },
        client: { lines: ['while (还有文本) {', '\u00a0\u00a0switch (首字母) {', '!\u00a0\u00a0\u00a0\u00a0"O" → new Scale()', '\u00a0\u00a0\u00a0\u00a0其他 → new Note()', '\u00a0\u00a0}', '\u00a0\u00a0exp.interpret(ctx);', '}'] },
        scale: { lines: ['!O 2 → 中音'] },
        out: { label: '演奏：中音' },
      },
      focus: ['ctx', 'client', 'scale', 'out'],
      flows: [
        { from: 'ctx', to: 'client', label: '"O 2"' },
        { from: 'client', to: 'scale', label: 'interpret(ctx)', curve: -30 },
        { from: 'scale', to: 'out', label: '中音', tone: 'green' },
      ],
    },
    {
      title: '解释 “E 0.5” “G 0.5”',
      text: '接着是 `E 0.5`：首字母 E 是音符，派给 `Note`，输出 **mi，半拍**；再来 `G 0.5`，输出 **sol，半拍**……“浪奔、浪流”就这样被一段一段**解释**出来。每段文本，都交给对应规则的类负责。',
      set: {
        ctx: { lines: ['- playText =', '"A 3 E 0.5 G 0.5 D 3 …"'] },
        client: { lines: ['while (还有文本) {', '\u00a0\u00a0switch (首字母) {', '\u00a0\u00a0\u00a0\u00a0"O" → new Scale()', '!\u00a0\u00a0\u00a0\u00a0其他 → new Note()', '\u00a0\u00a0}', '\u00a0\u00a0exp.interpret(ctx);', '}'] },
        scale: { lines: ['O 2 → 中音'] },
        note: { lines: ['!E 0.5 → mi ½拍', '!G 0.5 → sol ½拍'] },
        out: { label: '演奏：中音 · mi ½ · sol ½' },
      },
      focus: ['ctx', 'client', 'note', 'out'],
      flows: [
        { from: 'ctx', to: 'client', label: '"E 0.5"' },
        { from: 'client', to: 'note', label: 'interpret(ctx)' },
        { from: 'note', to: 'out', label: 'mi ½拍', tone: 'green' },
        { from: 'ctx', to: 'client', label: '"G 0.5"' },
        { from: 'client', to: 'note', label: 'interpret(ctx)' },
        { from: 'note', to: 'out', label: 'sol ½拍', tone: 'green' },
      ],
    },
    {
      title: '加个速度 T：只加一个类',
      text: '大鸟又加需求：乐谱开头加上**速度** `T 500`。小菜只**新增一个类** `Speed`，再在客户端的 switch 里**加一个分支**，`Note`、`Scale` 一行都不用动。文法要扩展，**加类就行**。',
      show: ['speed', 'l_speed'],
      set: {
        ctx: { lines: ['- playText =', '"T 500 O 2 E 0.5 G 0.5 …"'] },
        client: { lines: ['while (还有文本) {', '\u00a0\u00a0switch (首字母) {', '\u00a0\u00a0\u00a0\u00a0"O" → new Scale()', '!\u00a0\u00a0\u00a0\u00a0"T" → new Speed()', '\u00a0\u00a0\u00a0\u00a0其他 → new Note()', '\u00a0\u00a0}', '\u00a0\u00a0exp.interpret(ctx);', '}'] },
        note: { lines: ['E 0.5 → mi ½拍'] },
        speed: { lines: ['!T 500 → 中速'] },
        out: { label: '演奏：中速 · 中音 · mi ½ · sol ½ …' },
      },
      focus: ['speed', 'l_speed', 'client', 'out'],
      flows: [
        { from: 'ctx', to: 'client', label: '"T 500"' },
        { from: 'client', to: 'speed', label: 'interpret(ctx)', curve: -60 },
        { from: 'speed', to: 'out', label: '中速', tone: 'green' },
      ],
    },
    {
      title: '现实中的解释器',
      text: '解释器其实**天天见**：正则表达式、SQL、浏览器解释 HTML 和 JavaScript，都是“按文法解释一句话”。但要注意：文法一复杂，“一条规则一个类”就会**类爆炸**，这时应该改用 ANTLR 这类**语法分析器生成器**。',
      clear: true,
      show: ['w_re', 'w_sql', 'w_web', 'w_bad', 'w_tool', 'l_bt'],
      focus: ['w_bad', 'w_tool', 'l_bt'],
      dim: false,
    },
    {
      title: '总结：解释器模式',
      text: '解释器模式：**Context**（演奏内容，装待解释的文本）、**AbstractExpression**（统一的 `interpret()`）、**TerminalExpression**（音符、音阶、音速，各管一条规则），客户端负责把句子拆开派活。一句话记住：**一条文法一个类，句子拆开挨个解。**',
      clear: true,
      show: ['ctx', 'exp', 'note', 'scale', 'speed', 'client', 'out', 'l_note', 'l_scale', 'l_speed', 'l_ec', 'l_cc'],
      set: {
        speed: { badge: '', lines: ['T 500 → 中速'] },
        client: { lines: ['while (还有文本) {', '\u00a0\u00a0switch (首字母) {', '\u00a0\u00a0\u00a0\u00a0"O" → new Scale()', '\u00a0\u00a0\u00a0\u00a0"T" → new Speed()', '\u00a0\u00a0\u00a0\u00a0其他 → new Note()', '\u00a0\u00a0}', '\u00a0\u00a0exp.interpret(ctx);', '}'] },
      },
      focus: ['exp', 'note', 'scale', 'speed', 'l_note', 'l_scale', 'l_speed'],
      bubbles: [
        { node: 'exp', text: '套路固定：**读一段 → 执行**', side: 'right' },
        { node: 'scale', text: '**一条规则 = 一个类**', side: 'bottom', delay: 0.5 },
      ],
    },
  ],
});
