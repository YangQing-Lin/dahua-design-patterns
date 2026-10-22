DP.register({
  id: 'srp',
  order: 3,
  type: 'principle',
  name: '单一职责原则',
  en: 'Single Responsibility Principle',
  emoji: '📷',
  chapter: '第 3 章 · 拍摄UFO',
  mnemonic: '一个类只干一件事，变化原因只一个',
  summary: '一个类只承担一种职责；如果能想到两个以上修改它的理由，就该拆开。',
  intent: '就一个类而言，应该仅有一个引起它变化的原因。',
  story: '小菜在路上看到了 **UFO**，掏出手机一拍，照片糊成一团。大鸟说：手机能打电话、听音乐、拍照、上网，样样都会却样样不精，专业拍照还得靠相机。写程序也一样：做**俄罗斯方块**时，如果把方块的计算逻辑和窗体界面代码搅在一起，改界面会误伤逻辑，换个平台还得全部重写。',
  analogy: '餐厅里厨师只管做菜、服务员只管点单上菜、收银员只管结账。要是一个人全包，菜单一改、结账规则一改都得找他，他一出错整个店就停摆。',
  when: [
    '一个类里既有**业务逻辑**，又有**界面 / 存储 / 网络**等代码',
    '你能想出**两个以上**修改这个类的理由',
    '想把某部分逻辑**复用**到别的平台或别的项目，却发现拆不下来',
  ],
  pros: ['每个类更小，更好懂、更好测', '改一种职责不会误伤另一种职责', '逻辑可以跨平台复用（同一套方块逻辑给桌面、手机、网页用）'],
  cons: ['拆得过细，类的数量会变多', '“职责”怎么划分没有标准答案，要靠经验判断'],
  keyPoints: [
    '判断方法：如果你能想到**多于一个的动机**去改变一个类，那么这个类就具有多于一个的职责',
    '职责耦合的危害：一个职责的变化，可能削弱或抑制这个类完成其他职责的能力',
    '软件设计真正要做的许多内容，就是**发现职责并把那些职责相互分离**',
    '最常见的分离：**界面**和**业务逻辑**分开（第 1 章计算器也是这么做的）',
  ],
  code: `
// ✘ 坏味道：界面和游戏逻辑搅在同一个窗体类里
class TetrisForm extends JFrame {
    int[][] grid = new int[20][10];
    void onKeyPressed(KeyEvent e) {
        if (e.getKeyCode() == KeyEvent.VK_UP) {
            /* 直接在这里计算旋转后的矩阵…… */
            repaint();
        }
    }
    public void paint(Graphics g) { /* 画方块 */ }
}

// ✔ 拆开①：游戏逻辑，只管二维数组的运算，和界面无关
class TetrisGame {
    private int[][] grid = new int[20][10];   // 0 = 空，1 = 有方块
    public void moveDown()   { /* 下落 */ }
    public void rotate()     { /* 旋转 */ }
    public int  clearLines() { /* 消行，返回消掉几行 */ return 0; }
    public int[][] getGrid() { return grid; }
}
// ✔ 拆开②：界面，只管“接收输入”和“画出来”
class TetrisForm extends JFrame {
    private TetrisGame game = new TetrisGame();
    void onKeyPressed(KeyEvent e) {
        if (e.getKeyCode() == KeyEvent.VK_UP) game.rotate();
        repaint();
    }
    public void paint(Graphics g) { /* 按 game.getGrid() 画格子 */ }
}
// 换到手机或网页：TetrisGame 原样复用，只重写界面类`,
  codePython: `
# ✘ 坏味道：界面和游戏逻辑搅在同一个窗体类里（示意，保留为注释）
# class TetrisForm(Frame):
#     def on_key_pressed(self, key):
#         if key == "UP": ...      # 直接在这里计算旋转后的矩阵
#         self.repaint()


# ✔ 拆开①：游戏逻辑，只管二维数组的运算，和界面无关（不 import 任何界面库）
class TetrisGame:
    def __init__(self):
        self._grid = [[0] * 10 for _ in range(20)]   # 0 = 空，1 = 有方块
        self.angle = 0

    def move_down(self): ...                          # 下落

    def rotate(self):                                 # 旋转
        self.angle = (self.angle + 90) % 360

    def clear_lines(self) -> int:                     # 消行，返回消掉几行
        kept = [row for row in self._grid if not all(row)]
        cleared = 20 - len(kept)
        self._grid = [[0] * 10 for _ in range(cleared)] + kept
        return cleared

    @property                                         # 下划线开头 = 约定私有，只读暴露
    def grid(self):
        return self._grid


# ✔ 拆开②：界面，只管“接收输入”和“画出来”
class TetrisForm:
    def __init__(self, game: TetrisGame):
        self._game = game

    def on_key_pressed(self, key: str):
        if key == "UP":
            self._game.rotate()
        self.repaint()

    def repaint(self):                                # 按 game.grid 画格子
        filled = sum(map(sum, self._game.grid))
        print(f"{type(self).__name__}: 画出 {filled} 个方块，角度 {self._game.angle}")


class TetrisMobile(TetrisForm):                       # 换到手机：只重写界面类
    pass


if __name__ == "__main__":
    game = TetrisGame()
    game.grid[19][:] = [1] * 10                       # 摆满最底下一行
    TetrisForm(game).on_key_pressed("UP")             # TetrisForm: 画出 10 个方块，角度 90
    print(game.clear_lines())                         # 1
    TetrisMobile(game).on_key_pressed("UP")           # TetrisMobile: 画出 0 个方块，角度 180`,
  codeGo: `
package main

import "fmt"

// ✘ 坏味道：界面和游戏逻辑搅在同一个窗体类里（示意，保留为注释）
// type TetrisForm struct{ grid [20][10]int } // 按键、计算、绘制全挤在一起

// ✔ 拆开①：游戏逻辑，只管二维数组的运算，和界面无关
type TetrisGame struct {
	grid  [20][10]int // 0 = 空，1 = 有方块；小写 = 包外不可见
	angle int
}

func (g *TetrisGame) MoveDown() {}                                 // 下落
func (g *TetrisGame) Rotate()   { g.angle = (g.angle + 90) % 360 } // 旋转

// 消行，返回消掉几行
func (g *TetrisGame) ClearLines() int {
	var next [20][10]int
	row, cleared := 19, 0
	for r := 19; r >= 0; r-- {
		full := true
		for _, c := range g.grid[r] {
			full = full && c == 1
		}
		if full {
			cleared++
		} else {
			next[row] = g.grid[r]
			row--
		}
	}
	g.grid = next
	return cleared
}

func (g *TetrisGame) Grid() [20][10]int { return g.grid } // 数组按值返回 = 只读副本

// ✔ 拆开②：界面，只管“接收输入”和“画出来”
// Go 没有继承：界面通过字段“持有”逻辑，换界面就换一个结构体
type TetrisForm struct {
	Name string
	game *TetrisGame
}

func (f TetrisForm) OnKeyPressed(key string) {
	if key == "UP" {
		f.game.Rotate()
	}
	f.Repaint()
}

func (f TetrisForm) Repaint() { // 按 game.Grid() 画格子
	filled := 0
	for _, row := range f.game.Grid() {
		for _, c := range row {
			filled += c
		}
	}
	fmt.Println(f.Name+": 画出", filled, "个方块，角度", f.game.angle)
}

func main() {
	game := &TetrisGame{}
	for c := range game.grid[19] {
		game.grid[19][c] = 1 // 摆满最底下一行
	}
	TetrisForm{"TetrisForm", game}.OnKeyPressed("UP") // TetrisForm: 画出 10 个方块，角度 90
	fmt.Println(game.ClearLines())                    // 1
	// 换到手机：TetrisGame 原样复用，只换界面
	TetrisForm{"TetrisMobile", game}.OnKeyPressed("UP") // TetrisMobile: 画出 0 个方块，角度 180
}`,
  compare: [
    { id: 'lod', text: '迪米特法则管“**类和类之间**少打交道”；单一职责管“**一个类内部**只做一件事”。' },
    { id: 'ocp', text: '单一职责解决“类怎么拆”；开放-封闭解决“需求变了怎么不改旧代码”。职责拆清楚了，才容易做到对修改关闭。' },
  ],
  quiz: [
    { q: '一个 `Report` 类既负责从数据库查询销售数据并汇总，又负责把结果排版成 PDF。财务要改统计口径时要动它，设计师要改 PDF 字体时也要动它，每次改完都担心把另一部分弄坏。', why: '两个变化原因（统计规则、展示格式）挤在一个类里，应拆成“统计”和“导出”两个类。' },
    { q: '小程序的“计算器”页面里，按钮点击事件中直接写着四则运算和括号优先级的解析代码。现在要做一个网页版，发现计算部分没法直接拿过去用，只能复制粘贴再改。', why: '计算逻辑和界面代码耦合在一起；把计算逻辑抽成独立的类，界面只负责输入输出。' },
  ],

  nodes: {
    // —— 场景一：拍 UFO ——
    xc: { kind: 'actor', icon: '👦', label: '小菜', x: 120, y: 330, tone: 'blue' },
    ufo: { kind: 'box', icon: '🛸', label: '不明飞行物？！', x: 540, y: 110, tone: 'purple' },
    phone: { kind: 'box', icon: '📱', label: '手机', sub: '小菜随手一拍', x: 360, y: 330, tone: 'blue', size: 'lg' },
    blur: { kind: 'box', icon: '🌫️', label: '照片：糊成一团', sub: '啥也看不清', x: 730, y: 330, tone: 'gray', size: 'lg' },
    db: { kind: 'actor', icon: '🧔', label: '大鸟', x: 120, y: 450, tone: 'orange', size: 'sm' },

    // —— 场景二：手机样样都会 ——
    f1: { kind: 'box', icon: '📞', label: '打电话', x: 500, y: 110, tone: 'teal', shape: 'chip' },
    f2: { kind: 'box', icon: '🎵', label: '听音乐', x: 270, y: 190, tone: 'teal', shape: 'chip' },
    f3: { kind: 'box', icon: '📷', label: '拍照', x: 730, y: 190, tone: 'orange', shape: 'chip' },
    f4: { kind: 'box', icon: '🎮', label: '玩游戏', x: 270, y: 390, tone: 'teal', shape: 'chip' },
    f5: { kind: 'box', icon: '🌐', label: '上网', x: 730, y: 390, tone: 'teal', shape: 'chip' },
    f6: { kind: 'box', icon: '⏰', label: '闹钟', x: 500, y: 470, tone: 'teal', shape: 'chip' },
    cam: { kind: 'box', icon: '📸', label: '数码相机', sub: '只做一件事：拍照', x: 330, y: 400, tone: 'green', size: 'lg' },
    sharp: { kind: 'box', icon: '🖼️', label: '照片：清清楚楚', sub: '细节都在', x: 730, y: 400, tone: 'green', size: 'lg' },

    // —— 场景三：原则 ——
    pr: { kind: 'text', text: '就一个类而言，应该仅有一个引起它变化的原因', x: 500, y: 150, tone: 'indigo', size: 'lg' },
    db2: { kind: 'actor', icon: '🧔', label: '大鸟', x: 500, y: 430, tone: 'orange' },
    pPh: { kind: 'box', icon: '📱', label: '手机', sub: '通话、音乐、游戏、拍照……', x: 240, y: 290, tone: 'red', badge: '变化原因：一大堆' },
    pCam: { kind: 'box', icon: '📸', label: '相机', sub: '只负责拍照', x: 760, y: 290, tone: 'green', badge: '变化原因：1 个' },

    // —— 场景四：俄罗斯方块 ——
    bad: {
      kind: 'class', title: 'TetrisForm', sub: '小菜的写法：全在窗体里', x: 500, y: 300, tone: 'red',
      lines: ['// —— 界面 ——', 'paint()        画方块', 'onKeyDown()    响应按键', '// —— 游戏逻辑 ——', 'int[][] grid   方块矩阵', 'moveDown()     下落', 'rotate()       旋转', 'clearLines()   消行'],
    },
    rRule: { kind: 'box', icon: '📐', label: '规则要改', sub: '加速、计分、新方块', x: 150, y: 190, tone: 'purple' },
    rUI: { kind: 'box', icon: '🎨', label: '界面要改', sub: '换皮肤、换平台', x: 850, y: 190, tone: 'pink' },
    logic: { kind: 'class', title: 'TetrisGame', sub: '游戏逻辑：只管数组运算', lines: ['- grid: int[20][10]', '+ moveDown()', '+ rotate()', '+ clearLines()'], x: 500, y: 320, tone: 'purple' },
    form: { kind: 'class', title: 'TetrisForm', sub: '界面：只管输入和显示', lines: ['- game: TetrisGame', '+ paint()', '+ onKeyDown()'], x: 500, y: 320, tone: 'pink' },
    mob: { kind: 'class', title: 'TetrisMobileView', sub: '手机版界面', x: 740, y: 330, tone: 'pink', badge: 'NEW' },
    web: { kind: 'class', title: 'TetrisWebPage', sub: '网页版界面', x: 740, y: 470, tone: 'pink', badge: 'NEW' },
    mn: { kind: 'text', text: '一个类只干一件事，变化原因只一个', x: 270, y: 490, tone: 'indigo', size: 'lg' },
  },
  links: {
    l_f1: { from: 'phone', to: 'f1', kind: 'dotted' },
    l_f2: { from: 'phone', to: 'f2', kind: 'dotted' },
    l_f3: { from: 'phone', to: 'f3', kind: 'dotted' },
    l_f4: { from: 'phone', to: 'f4', kind: 'dotted' },
    l_f5: { from: 'phone', to: 'f5', kind: 'dotted' },
    l_f6: { from: 'phone', to: 'f6', kind: 'dotted' },
    l_rr: { from: 'rRule', to: 'logic', kind: 'dashed', tone: 'purple', label: '只有这一个变化原因', labelDx: 78 },
    l_ru: { from: 'rUI', to: 'form', kind: 'dashed', tone: 'pink', label: '只有这一个变化原因', labelDx: -78 },
    l_form: { from: 'form', to: 'logic', kind: 'assoc', label: '调用' },
    l_mob: { from: 'mob', to: 'logic', kind: 'assoc' },
    l_web: { from: 'web', to: 'logic', kind: 'assoc' },
  },

  frames: [
    {
      title: '小菜拍到了 UFO？',
      text: '小菜下班路上，突然看见天上有个**不明飞行物**！他赶紧掏出手机一拍——照片糊成一团，什么也看不清。大鸟笑他：手机拍照，本来就比不上**专业相机**。',
      show: ['xc', 'ufo', 'phone', 'blur'],
      flows: [
        { from: 'ufo', to: 'phone', icon: '✨', step: 0 },
        { from: 'phone', to: 'blur', icon: '📸', label: '咔嚓', step: 1 },
      ],
      bubbles: [
        { node: 'xc', text: '**UFO**！快拍下来！', side: 'top' },
        { node: 'blur', text: '……这拍的是啥？', side: 'bottom', step: 1 },
      ],
    },
    {
      title: '手机：样样都会，样样不精',
      text: '大鸟说：手机能打电话、听音乐、玩游戏、上网，还能拍照……什么都会，可每一样都**不够专业**。拍照只是它众多职责里的一个，自然做不到最好。',
      hide: ['ufo', 'blur', 'xc'],
      show: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'l_f1', 'l_f2', 'l_f3', 'l_f4', 'l_f5', 'l_f6', 'db'],
      set: { phone: { x: 500, y: 290, sub: '什么都干' } },
      focus: ['phone', 'f3', 'l_f3', 'db'],
      bubbles: [{ node: 'db', text: '样样都会，**样样不精**', side: 'top', dx: 30 }],
    },
    {
      title: '专业的事交给专业的',
      text: '相机只做**一件事**：拍照。它的镜头、对焦、快门全为拍照服务，拍出来清清楚楚。职责越单一，越能把这件事做到最好，**改进它也不会牵连别的功能**。',
      hide: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'db'],
      show: ['blur', 'cam', 'sharp'],
      set: { phone: { x: 330, y: 190 }, blur: { y: 190 } },
      focus: ['cam', 'sharp'],
      dim: false,
      flows: [
        { from: 'phone', to: 'blur', icon: '📸', label: '手机拍', step: 0, tone: 'gray' },
        { from: 'cam', to: 'sharp', icon: '📸', label: '相机拍', step: 0, tone: 'green' },
      ],
    },
    {
      title: '原则：只有一个变化原因',
      text: '这就是**单一职责原则**：就一个类而言，应该**仅有一个引起它变化的原因**。怎么判断？如果你能想出两个以上的理由去修改一个类，它就承担了不止一个职责，该拆了。',
      clear: true,
      show: ['pr', 'db2', 'pPh', 'pCam'],
      focus: ['pr', 'pCam'],
      dim: false,
      bubbles: [{ node: 'db2', text: '能想到**两个**修改它的理由？那就是两个职责。', side: 'top' }],
    },
    {
      title: '俄罗斯方块：全写一起',
      text: '写代码也一样。比如做**俄罗斯方块**，小菜很可能把画方块、响应键盘，和方块下落、旋转、消行的计算，**全写在一个窗体类里**。能跑，但两种职责搅成了一团。',
      clear: true,
      show: ['bad'],
      focus: ['bad'],
    },
    {
      title: '两个变化原因',
      text: '这个类有了**两个变化原因**：要换界面得改它，要改规则也得改它。改界面时可能碰坏消行逻辑；想做个手机版，方块逻辑和窗体粘在一起，**没法单独拿走**。',
      show: ['rRule', 'rUI'],
      set: { bad: { badge: '2 个变化原因', strike: true } },
      flows: [
        { from: 'rRule', to: 'bad', label: '改它', tone: 'purple', step: 0 },
        { from: 'rUI', to: 'bad', label: '也改它', tone: 'pink', step: 0 },
      ],
    },
    {
      title: '拆开：逻辑和界面分家',
      text: '把职责拆开：**游戏逻辑** `TetrisGame` 只管一个二维数组，下落、旋转、消行全是数组运算；**界面** `TetrisForm` 只管接收按键、把数组画出来。每个类**只剩一个变化原因**。',
      hide: ['bad'],
      show: ['logic', 'form', 'l_form', 'l_rr', 'l_ru'],
      set: {
        logic: { x: 280 }, form: { x: 720 },
        rRule: { x: 280, y: 100 }, rUI: { x: 720, y: 100 },
      },
      flows: [
        { from: 'form', to: 'logic', label: 'rotate()', step: 0 },
        { from: 'logic', to: 'form', label: 'getGrid()', back: true, tone: 'purple', step: 1 },
      ],
    },
    {
      title: '换平台：逻辑原样复用',
      text: '现在要做**手机版**、**网页版**？只需新写界面类，`TetrisGame` **一行都不用动**，直接复用。反过来，改规则也只动逻辑类，界面毫无感觉。这就是职责分离的好处。',
      hide: ['rRule', 'rUI'],
      show: ['mob', 'web', 'l_mob', 'l_web'],
      set: { logic: { x: 260, y: 300, badge: '一行没改' }, form: { x: 740, y: 160 } },
      focus: ['logic', 'mob', 'web', 'l_mob', 'l_web'],
      flows: [
        { from: 'mob', to: 'logic', label: 'rotate()', step: 0 },
        { from: 'web', to: 'logic', label: 'clearLines()', step: 1 },
      ],
    },
    {
      title: '总结：单一职责原则',
      text: '单一职责原则的关键功夫，是**发现职责，并把它们分离**：手机和相机，界面和逻辑。写完一个类，问问自己它有几个变化的理由。一句话记住：**一个类只干一件事，变化原因只一个。**',
      show: ['mn'],
      set: { logic: { badge: '' }, mob: { badge: '' }, web: { badge: '' } },
      focus: ['logic', 'form', 'mob', 'web', 'mn'],
      bubbles: [
        { node: 'logic', text: '我只管**规则**', side: 'top' },
        { node: 'mob', text: '我们只管**显示**', side: 'right', dx: -2 },
      ],
    },
  ],
});
