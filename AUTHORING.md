# 编写一个模式动画（patterns/*.js）

每个模式 / 原则是一个独立文件，调用 `DP.register({...})` 注册自己。
**参考范例：`patterns/strategy.js`**（用到了几乎全部特性，先读它）。

纯静态网站，无构建步骤：新增文件后在 `index.html` 里加一行 `<script src="patterns/xxx.js">`。

---

## 1. 元信息字段

| 字段 | 说明 |
|---|---|
| `id` | kebab-case，唯一，也是文件名 |
| `order` | 书中章节号（同章多个条目用小数，如 `5.5`） |
| `type` | `creational` / `structural` / `behavioral` / `principle` |
| `name` / `en` | 中文名 / 英文名 |
| `emoji` | 卡片图标，一个 emoji |
| `chapter` | 形如 `'第 2 章 · 商场促销'` |
| `mnemonic` | **一句话口诀**，≤ 18 字，押韵或有画面感最好，这是用户最终要记住的东西 |
| `summary` | 一句大白话总结，≤ 40 字 |
| `intent` | 定义（GoF / 书中定义） |
| `story` | 书中故事，2～4 句，可用 `**粗体**` |
| `analogy` | 一个生活中的类比（不要和书中故事重复） |
| `when` | 适用场景，数组，2～4 条 |
| `pros` / `cons` | 优点 / 代价，数组，各 2～3 条 |
| `keyPoints` | 可选，关键要点（角色说明、易错点），数组 |
| `code` | Java 代码骨架，≤ 45 行，中文注释，突出结构即可 |
| `codePython` | 同一个骨架的 **Python 3** 版本（见第 7 节） |
| `codeGo` | 同一个骨架的 **Go** 版本（见第 7 节） |
| `compare` | 易混淆对比 `[{ id: '另一个模式id', text: '区别…' }]`，1～2 条 |
| `quiz` | 场景测验 `[{ q: '场景描述（不要出现模式名）', why: '可选，解析' }]`，2 条 |

文本字段都支持迷你标记：`**粗体**`、`==高亮==`、`` `代码` ``。

## 2. 舞台与角色（nodes）

舞台是固定的 **1000 × 560** 逻辑坐标，`x, y` 是元素**中心点**。
**左上角 (0,0)～(330,50) 被帧标题胶囊占用**，节点不要放进去。建议节点都在 `x: 70～930, y: 70～510`。

所有角色在 `nodes` 里一次性声明（初始都隐藏），在帧里用 `show` 让它出场。

```js
nodes: {
  ctx:  { kind: 'class', title: 'CashContext', sub: '上下文', stereo: 'abstract', lines: ['- cs: CashSuper', '!+ getResult()'], x: 290, y: 280, tone: 'indigo' },
  boss: { kind: 'actor', icon: '👔', label: '商场经理', sub: '可选副标题', x: 720, y: 290, tone: 'orange', size: 'sm' },
  db:   { kind: 'box', icon: '🗄️', label: 'SQL Server', sub: '可选', x: 500, y: 300, tone: 'blue', shape: 'pill' },
  t1:   { kind: 'text', text: '说明文字', x: 500, y: 500, tone: 'gray', size: 'sm', w: 260 },
  z1:   { kind: 'zone', label: '子系统', x: 600, y: 300, w: 420, h: 300, tone: 'gray' },
}
```

| kind | 用途 | 关键属性 |
|---|---|---|
| `class` | UML 类框 | `title`（类名，英文）、`sub`（中文说明）、`stereo`（`'interface'` 虚线框 / `'abstract'` 斜体）、`lines`（成员，等宽字体；以 `!` 开头的行会被**高亮**，适合表示“正在执行这一行”） |
| `actor` | 人 / 角色 | `icon`（emoji）、`label`、`sub`、`size: 'sm'/'lg'` |
| `box` | 通用卡片：对象、数据、物品 | `icon`、`label`、`sub`、`shape: 'pill' / 'note' / 'chip' / 'ghost'`、`size: 'sm'/'lg'`、`w`/`h` |
| `text` | 纯文字注释 | `text`、`size: 'sm'/'lg'/'xl'`、`w`（给了宽度才会换行） |
| `zone` | 虚线分组框（在最底层） | `label`、`w`、`h`（必填） |

通用属性：`tone`（`blue green orange purple red gray teal pink indigo yellow`）、`badge`（右上角小标签，如 `'NEW'`、`'×3'`；默认红色，以 ✓ 开头自动变绿，也可用 `badgeTone: 'green'/'blue'/'orange'/'purple'/'gray'`）、`strike: true`（画个大红叉 + 变灰）、`opacity`（0～1，做“虚影”）、`scale`、`mono: true`（等宽字体）。

**尺寸估算**（排版时防止重叠）：
- 等宽成员行每个字符约 7.6px，`class` 宽度 ≈ max(类名字符数 × 9.5, 最长成员行字符数 × 7.6) + 30，每行成员高 19px，标题区高 ~34px（有 stereo / sub 各 +15px）
- 中文 14px 一个字约 14px 宽；`actor` 约 64px 圆 + 下方名字，总高 ~95px
- 气泡最宽 240px，一行约 16 个汉字

## 3. 连线（links）

```js
links: {
  l1: { from: 'normal', to: 'sup', kind: 'inherit' },
  l2: { from: 'ctx', to: 'sup', kind: 'aggregate', label: '持有', curve: 30, labelAt: 0.4 },
}
```

| kind | 画法 | 方向约定 |
|---|---|---|
| `inherit` | 实线 + 空心三角 | 子类 → 父类 |
| `implement` | 虚线 + 空心三角 | 实现类 → 接口 |
| `assoc` | 实线 + 箭头 | 使用者 → 被使用者 |
| `depend` | 虚线 + 箭头 | 依赖方 → 被依赖方 |
| `aggregate` / `compose` | 空心 / 实心菱形在 `from` 端 | 整体 → 部分 |
| `arrow` / `dashed` | 实线 / 虚线 + 实心箭头 | 通用“指向” |
| `line` / `dotted` | 无箭头 | 通用连接 |

可选：`label`、`labelAt`（0～1）、`labelDx/labelDy`、`curve`（弯曲程度，正负决定弯向哪边）、`tone`。
连线和节点一样用 `show` 出场；**任一端点隐藏时连线自动隐藏**。

## 4. 帧（frames）——动画的核心

```js
frames: [
  {
    title: '运行：选择“打8折”',          // 短标题（≤ 14 字），显示在舞台左上角和步骤列表
    text: '讲解词……',                    // 讲解词，见第 5 节
    clear: true,                         // 可选：先隐藏全部（换场景）
    show: ['client', 'l_cli'],           // 本帧出场（之后一直在，直到 hide）
    hide: ['bad'],                       // 本帧退场
    set: { bad: { strike: true, badge: '改这里' }, ctx: { x: 400, lines: [...] } },  // 修改属性（持续生效；x/y 改变会平滑移动）
    focus: ['client', 'ctx'],            // 仅本帧：高亮这些节点/连线，其他元素自动变淡（dim:false 可关闭变淡）
    flows: [                             // 仅本帧：消息/数据沿路径飞过去（默认按顺序一个接一个）
      { from: 'client', to: 'ctx', label: '"打8折", ¥1000' },
      { from: 'rebate', to: 'ctx', label: '¥800', back: true, tone: 'teal' },  // back:true = 返回值（虚线，自动走弧线）
      // 其他：icon:'📩'、step:0（同 step 的同时出发）、delay、dur、curve、stay:true（到达后停留）
    ],
    bubbles: [                           // 仅本帧：对话气泡
      { node: 'boss', text: '打**八折**！', side: 'top' },   // side: top/bottom/left/right；delay；step（等第 n 步消息到达后再出现）；dx/dy 微调
    ],
    trans: 0.8,                          // 可选：过渡时长（秒）
    dur: 12,                             // 可选：本帧总时长（默认按讲解词长度自动计算）
  },
]
```

**状态是累积的**：`show / hide / set` 的效果一直保留到后续帧；`focus / flows / bubbles` 只在本帧有效。
因此任意一帧都可以被直接跳转、倒退。

## 5. 讲解词与分镜（最重要）

目标读者：**看过书但什么都没记住**的人。每帧只讲**一件事**。

推荐分镜（10～13 帧）：
1. **故事引入**：书里的场景（小菜、大鸟、具体人物和情节）
2. **痛点**：小菜的第一版写法 / 不用模式会怎样（可以把坏代码画成一个 class 框，再 `strike`）
3. **大鸟的点拨**：要解决的核心问题是什么
4～7. **角色逐个登场**：每帧出场 1～2 个角色，说清楚它是谁、负责什么
8～9. **跑一遍**：用 `flows` 演示一次完整调用（谁调用谁、传了什么、返回什么）
10. **需求变化**：新增一个类/换一个实现，展示“只加不改”的好处
11. **总结**：点名模式的角色，并且讲解词最后一句给出口诀

讲解词要求：
- 每帧 50～110 字，口语化、短句，像老师在旁边讲；用 `**粗体**` 标出关键词（每帧 1～3 处）
- 讲“为什么”，不只是“是什么”；多用书中原有人物与台词
- 角色名称第一次出现时：中文 + `代码名`，例如“上下文 `CashContext`”
- 不要大段代码；代码放到 `code` 字段

画面要求：
- **每帧画面要有变化**（出场、移动、高亮、消息、气泡中至少一种）
- 布局清晰：继承树父类在上、子类在下；调用方在左、被调用方在右
- 同一时刻画面上的节点不超过 ~10 个；需要换场景就用 `clear: true`
- 不要让节点、气泡互相重叠，也不要超出舞台

## 6. 自检

本地起服务：`python3 -m http.server 8765`，然后：

- `http://localhost:8765/#/p/<id>` —— 正常播放
- `http://localhost:8765/#/sheet/<id>` —— 联系表：一次看到全部帧（静态）
- 浏览器控制台会打印引用错误（未知 id 等）

命令行工具（在项目根目录运行，详见 README“参与修改”）：

- `node tools/lint.js` —— 内容检查（必填字段、引用、index.html 是否引入了新文件）
- `node tools/shot.js <id>` —— 截下全部帧并检查节点 / 气泡是否重叠、越界、遮挡左上角标题（需要 Playwright）
- `node tools/e2e.js` —— 端到端测试（需要 Playwright）

## 7. 多语言代码骨架（code / codePython / codeGo）

模式页的“代码骨架”卡片有 Java / Python 3 / Go 三个标签页，读者的选择会被记住。参考范例：`patterns/strategy.js`。

共同要求：
- **和 Java 版讲的是同一件事**：同样的角色、同样的类名（方法名按各语言习惯：Python 用 `snake_case`，Go 用导出的 `CamelCase`），同样的故事数据（比如 1000 元打八折得 800）
- 中文注释，和 Java 版的注释一一对应；在语言差异处加一句注释说明（比如“Go 没有继承，用接口 + 组合”）
- **必须能直接运行**，客户端代码要 `print` 出能体现模式效果的结果，并在行尾注释写出预期输出
- 写地道的代码而不是逐行翻译；如果该语言有更自然的写法（Python 的函数/生成器/`copy` 模块，Go 的 `sync.Once`/闭包/`iter.Seq`），用它，或在注释里点一句

Python 3：
- 完整脚本：`abc.ABC` + `@abstractmethod` 表达抽象类 / 接口；客户端代码放在 `if __name__ == "__main__":` 下
- ≤ 60 行；类与类之间可以用两个空行（PEP 8），也可以为了紧凑用一个
- 只用标准库

Go：
- 完整程序：`package main` + `func main()`（客户端代码放在 main 里），必须是 **gofmt** 后的格式（缩进用 Tab）
- ≤ 80 行；只用标准库
- **不要使用反引号字符串**（文件本身在 JS 模板字符串里），也不要出现 `${`

转义注意：代码放在 JS 的反引号模板字符串里，代码中的反斜杠要写成 `\\`（例如 `\\n`），否则会被 JS 提前转义。

自检：`node tools/check-code.js <id>` —— 取出 Python / Go 代码真实运行，并做 gofmt / go vet 检查（需要本机装有 python3 和 Go）。
