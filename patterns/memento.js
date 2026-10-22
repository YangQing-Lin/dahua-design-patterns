DP.register({
  id: 'memento',
  order: 18,
  type: 'behavioral',
  name: '备忘录模式',
  en: 'Memento',
  emoji: '💾',
  chapter: '第 18 章 · 如果再回到从前',
  mnemonic: '自己拍快照，别人来保管，读档回从前',
  summary: '对象自己把状态拍成快照交给别人保管，需要时再恢复，内部细节不外露。',
  intent: '在不破坏封装性的前提下，捕获一个对象的内部状态，并在该对象之外保存这个状态。这样以后就可将该对象恢复到原先保存的状态。',
  story: '小菜打游戏，**打 Boss 前先存档**，打输了就读档重来。可他第一版代码让客户端自己 new 一个备份角色，把生命力、攻击力、防御力一项项抄过去——角色的内部细节全暴露了。大鸟让角色自己生成**备忘录**，交给**管理者**保管，要恢复时再把备忘录还给角色。',
  analogy: '手机刷机前先“备份”：手机自己把通讯录、照片打包成一个备份文件（备忘录），云盘只负责存这个文件、不关心里面是什么（管理者）；刷机失败了，把备份还给手机，一键恢复原样。',
  when: [
    '需要**撤销 / 回滚 / 存档读档**的功能',
    '要保存对象某一时刻的状态，又**不想暴露**它的内部字段',
    '命令模式做撤销时，用备忘录记住“操作之前”的状态',
  ],
  pros: [
    '保存哪些状态、怎么恢复，都封装在发起人内部，客户端**看不到也不用管**',
    '状态字段变了（比如加“魔法力”），只改发起人和备忘录，客户端不动',
    '管理者只负责保管，职责单一',
  ],
  cons: [
    '状态很大或存档很频繁时，**非常占内存**',
    '每次存档都要完整复制一份状态，有性能开销',
  ],
  keyPoints: [
    '三个角色：**Originator** 发起人（GameRole，创建备忘录、用备忘录恢复自己）、**Memento** 备忘录（RoleStateMemento，只装状态）、**Caretaker** 管理者（RoleStateCaretaker，只保管不查看）',
    '备忘录的内容最好**只让发起人看得到**；Java 里可以用包访问权限或内部类来做到',
    '存的不一定是全部字段，只存“将来需要恢复”的那部分就够了',
  ],
  code: `
// 发起人：游戏角色，自己决定存什么、怎么恢复
class GameRole {
    private int vitality, attack, defense;          // 生命力、攻击力、防御力
    public void stateInit() { vitality = attack = defense = 100; }
    public void fight()     { vitality = attack = defense = 0; }   // 大战 Boss，惨败
    public void displayState() {
        System.out.println(vitality + " / " + attack + " / " + defense);
    }
    public RoleStateMemento saveState() {            // 存档：拍一张快照
        return new RoleStateMemento(vitality, attack, defense);
    }
    public void recoveryState(RoleStateMemento m) {  // 读档：按快照恢复自己
        vitality = m.getVitality();
        attack   = m.getAttack();
        defense  = m.getDefense();
    }
}
// 备忘录：只装状态，别的什么也不干
class RoleStateMemento {
    private final int vitality, attack, defense;
    RoleStateMemento(int v, int a, int d) { vitality = v; attack = a; defense = d; }
    int getVitality() { return vitality; }
    int getAttack()   { return attack; }
    int getDefense()  { return defense; }
}
// 管理者：只负责保管，从不看里面
class RoleStateCaretaker {
    private RoleStateMemento memento;
    public RoleStateMemento getMemento()        { return memento; }
    public void setMemento(RoleStateMemento m)  { memento = m; }
}
// 客户端
GameRole lixiaoyao = new GameRole();
lixiaoyao.stateInit();
RoleStateCaretaker admin = new RoleStateCaretaker();
admin.setMemento(lixiaoyao.saveState());       // 打 Boss 前存档
lixiaoyao.fight();                             // 挂了……
lixiaoyao.recoveryState(admin.getMemento());   // 读档，满血复活
lixiaoyao.displayState();                      // 100 / 100 / 100`,
  codePython: `
from dataclasses import dataclass


# 备忘录：只装状态，别的什么也不干（frozen=True：存档不可篡改）
@dataclass(frozen=True)
class RoleStateMemento:
    vitality: int
    attack: int
    defense: int


# 发起人：游戏角色，自己决定存什么、怎么恢复
class GameRole:
    def __init__(self):
        self.vitality = self.attack = self.defense = 0   # 生命力、攻击力、防御力

    def state_init(self):
        self.vitality = self.attack = self.defense = 100

    def fight(self):                                     # 大战 Boss，惨败
        self.vitality = self.attack = self.defense = 0

    def display_state(self):
        print(f"{self.vitality} / {self.attack} / {self.defense}")

    def save_state(self) -> RoleStateMemento:            # 存档：拍一张快照
        return RoleStateMemento(self.vitality, self.attack, self.defense)

    def recovery_state(self, m: RoleStateMemento):       # 读档：按快照恢复自己
        self.vitality, self.attack, self.defense = m.vitality, m.attack, m.defense


# 管理者：只负责保管，从不看里面
class RoleStateCaretaker:
    def __init__(self):
        self.memento = None


# 客户端
if __name__ == "__main__":
    lixiaoyao = GameRole()
    lixiaoyao.state_init()
    lixiaoyao.display_state()                  # 100 / 100 / 100
    admin = RoleStateCaretaker()
    admin.memento = lixiaoyao.save_state()     # 打 Boss 前存档
    lixiaoyao.fight()                          # 挂了……
    lixiaoyao.display_state()                  # 0 / 0 / 0
    lixiaoyao.recovery_state(admin.memento)    # 读档，满血复活
    lixiaoyao.display_state()                  # 100 / 100 / 100
    # Python 没有真正的私有成员，"只有发起人能看"靠约定；
    # 想要更严，可以让备忘录用下划线字段，只有 GameRole 去读`,
  codeGo: `
package main

import "fmt"

// 备忘录：只装状态。字段小写 = 包外不可见，Go 用首字母大小写控制访问
type RoleStateMemento struct{ vitality, attack, defense int }

// 发起人：游戏角色，自己决定存什么、怎么恢复
type GameRole struct{ vitality, attack, defense int } // 生命力、攻击力、防御力

func (g *GameRole) StateInit() { g.vitality, g.attack, g.defense = 100, 100, 100 }

func (g *GameRole) Fight() { g.vitality, g.attack, g.defense = 0, 0, 0 } // 大战 Boss，惨败

func (g *GameRole) DisplayState() {
	fmt.Printf("%d / %d / %d\\n", g.vitality, g.attack, g.defense)
}

// 存档：拍一张快照（返回值是拷贝，之后角色再变也不影响存档）
func (g *GameRole) SaveState() RoleStateMemento {
	return RoleStateMemento{g.vitality, g.attack, g.defense}
}

// 读档：按快照恢复自己
func (g *GameRole) RecoveryState(m RoleStateMemento) {
	g.vitality, g.attack, g.defense = m.vitality, m.attack, m.defense
}

// 管理者：只负责保管，从不看里面
type RoleStateCaretaker struct{ memento RoleStateMemento }

func (c *RoleStateCaretaker) Memento() RoleStateMemento     { return c.memento }
func (c *RoleStateCaretaker) SetMemento(m RoleStateMemento) { c.memento = m }

// 客户端
func main() {
	lixiaoyao := &GameRole{}
	lixiaoyao.StateInit()
	lixiaoyao.DisplayState() // 100 / 100 / 100
	admin := &RoleStateCaretaker{}
	admin.SetMemento(lixiaoyao.SaveState())  // 打 Boss 前存档
	lixiaoyao.Fight()                        // 挂了……
	lixiaoyao.DisplayState()                 // 0 / 0 / 0
	lixiaoyao.RecoveryState(admin.Memento()) // 读档，满血复活
	lixiaoyao.DisplayState()                 // 100 / 100 / 100
}`,
  compare: [
    { id: 'prototype', text: '原型是“复制出一个**新对象**来用”；备忘录是给**同一个对象**拍快照，交给别人保管，以后让它**恢复**成原样。' },
    { id: 'command', text: '命令记录“**做了什么操作**”，备忘录记录“**操作前是什么状态**”。两者常搭配：命令撤销时，用备忘录把状态恢复回去。' },
  ],
  quiz: [
    { q: '在线画图软件要支持“撤销到上一步”：画布每次修改前，把自己的内部数据打包成一个快照交出去，由历史记录列表统一存放；历史列表只能保存和归还快照，不能读取里面的像素和图层。', why: '发起人（画布）自己生成快照、管理者（历史列表）只保管不查看——备忘录模式。' },
    { q: '单机游戏有“存档 / 读档”：角色把自己的等级、血量、背包打包成一份存档交给存档管理器；读档时把那份存档还给角色，由角色自己恢复，存档管理器完全不知道里面有哪些字段。' },
  ],

  nodes: {
    /* ---- 场景一：打游戏 ---- */
    dabird: { kind: 'actor', icon: '👨‍🏫', label: '大鸟', x: 130, y: 140, tone: 'purple' },
    xiaocai: { kind: 'actor', icon: '👨‍💻', label: '小菜', sub: '正在打游戏', x: 130, y: 330, tone: 'blue' },
    role: {
      kind: 'class', title: 'GameRole', sub: '游戏角色', x: 460, y: 300, tone: 'blue',
      lines: ['- 生命力 = 100', '- 攻击力 = 100', '- 防御力 = 100'],
    },
    boss: { kind: 'actor', icon: '👹', label: 'Boss', sub: '最终关卡', x: 810, y: 300, tone: 'red', size: 'lg' },
    save: { kind: 'box', icon: '💾', label: '存档 1', shape: 'chip', x: 460, y: 455, tone: 'yellow' },

    /* ---- 场景二：小菜的第一版 ---- */
    client1: { kind: 'actor', icon: '👨‍💻', label: '客户端', sub: '小菜写的', x: 500, y: 290, tone: 'gray' },
    backup: {
      kind: 'class', title: 'GameRole', sub: 'backup：备份用的角色', x: 830, y: 290, tone: 'gray',
      lines: ['!- 生命力 = 100  ← 抄', '!- 攻击力 = 100  ← 抄', '!- 防御力 = 100  ← 抄'],
    },
    bad: {
      kind: 'class', title: 'Client', sub: '小菜的第一版：客户端自己备份', x: 400, y: 290, tone: 'red',
      lines: [
        'GameRole backup = new GameRole();',
        'backup.setVitality(role.getVitality());',
        'backup.setAttack(role.getAttack());',
        'backup.setDefense(role.getDefense());',
        '// …… 大战 Boss，挂了 ……',
        'role.setVitality(backup.getVitality());',
        'role.setAttack(backup.getAttack());',
        'role.setDefense(backup.getDefense());',
      ],
    },
    dabird2: { kind: 'actor', icon: '👨‍🏫', label: '大鸟', x: 820, y: 330, tone: 'purple' },

    /* ---- 场景三：备忘录模式 ---- */
    client: { kind: 'actor', icon: '👨‍💻', label: '客户端', x: 90, y: 300, tone: 'gray' },
    memento: {
      kind: 'class', title: 'RoleStateMemento', sub: '角色状态存储箱（备忘录）', x: 620, y: 118, tone: 'yellow',
      lines: ['- vitality / attack / defense', '+ getXxx()'],
    },
    caretaker: {
      kind: 'class', title: 'RoleStateCaretaker', sub: '角色状态管理者', x: 830, y: 300, tone: 'teal',
      lines: ['- memento', '+ getMemento()', '+ setMemento(m)'],
    },
    snap: { kind: 'box', icon: '📦', label: '存档快照', sub: '100 / 100 / 100', x: 320, y: 300, tone: 'yellow', size: 'sm' },
  },
  links: {
    l_r1: { from: 'role', to: 'client1', kind: 'line', tone: 'gray' },
    l_r2: { from: 'client1', to: 'backup', kind: 'line', tone: 'gray' },
    l_rm: { from: 'role', to: 'memento', kind: 'depend', label: '创建', labelAt: 0.45 },
    l_cm: { from: 'caretaker', to: 'memento', kind: 'aggregate', label: '只保管' },
    l_cr: { from: 'client', to: 'role', kind: 'assoc' },
  },

  frames: [
    {
      title: '打 Boss 前先存档',
      text: '这一章从**打游戏**说起。小菜的角色生命力、攻击力、防御力都是 100，前面就是大 Boss。大鸟问：打 Boss 前要干嘛？小菜秒答：**先存档**！万一打输了，还能回到现在这个样子。',
      show: ['dabird', 'xiaocai', 'role', 'boss', 'save'],
      flows: [{ from: 'role', to: 'save', label: '💾 存档', step: 1 }],
      bubbles: [
        { node: 'dabird', text: '打 Boss 之前，你先干嘛？', side: 'right' },
        { node: 'xiaocai', text: '当然是先**存档**！', side: 'right', delay: 0.8 },
      ],
    },
    {
      title: '打输了？读档重来',
      text: 'Boss 太强，一套连招下来，角色三项属性**全部掉到 0**——GAME OVER。没关系，**读档**！角色立刻回到存档那一刻满血的样子，换个打法再来。这种“回到从前”的能力，就是本章要学的。',
      set: { role: { lines: ['- 生命力 = 0', '- 攻击力 = 0', '- 防御力 = 0'], badge: 'GAME OVER' } },
      focus: ['role', 'boss', 'save', 'xiaocai'],
      flows: [
        { from: 'boss', to: 'role', label: '💥 连招', tone: 'red' },
        { from: 'save', to: 'role', label: '💾 读档', tone: 'teal', step: 2 },
      ],
      bubbles: [
        { node: 'xiaocai', text: '没事，**读档**重来！', side: 'right', step: 1 },
      ],
    },
    {
      title: '小菜第一版：手动抄一份',
      text: '大鸟让小菜用代码实现存档。小菜的写法：客户端自己 `new` 一个备份角色 `backup`，再把生命力、攻击力、防御力**一项一项抄过去**；读档时，再一项一项抄回来。',
      hide: ['dabird', 'xiaocai', 'boss', 'save'],
      show: ['client1', 'backup', 'l_r1', 'l_r2'],
      set: { role: { x: 170, y: 290, lines: ['- 生命力 = 100', '- 攻击力 = 100', '- 防御力 = 100'], badge: '' } },
      trans: 1.2,
      flows: [
        { from: 'role', to: 'client1', label: 'getVitality() → 100' },
        { from: 'client1', to: 'backup', label: 'setVitality(100)' },
        { from: 'role', to: 'client1', label: 'getAttack() → 100' },
        { from: 'client1', to: 'backup', label: 'setAttack(100)' },
      ],
      bubbles: [
        { node: 'client1', text: '还有防御力……全得我记着', side: 'top', step: 3 },
      ],
    },
    {
      title: '问题：细节全暴露了',
      text: '大鸟摇头：客户端**知道得太多了**！它得清楚角色有哪几项属性、该存哪些。哪天角色加个“魔法力”，所有存档、读档的客户端代码都得跟着改。而且拿一整个 GameRole 当备份，也太重了。',
      clear: true,
      show: ['bad', 'dabird2'],
      set: { bad: { strike: true, badge: '细节全暴露' } },
      focus: ['bad', 'dabird2'],
      bubbles: [
        { node: 'dabird2', text: '客户端**知道得太多了**！', side: 'top' },
      ],
    },
    {
      title: '发起人 + 备忘录',
      text: '大鸟的思路：**谁的状态，谁自己负责**。游戏角色 `GameRole` 当**发起人**，自己提供 `saveState()`：把三项属性装进一个**备忘录** `RoleStateMemento` 交出去。备忘录就是个装状态的小盒子，别的什么也不干。',
      clear: true,
      show: ['role', 'memento', 'l_rm'],
      set: {
        role: {
          x: 320, y: 300, sub: '游戏角色（发起人）',
          lines: ['- 生命力 = 100', '- 攻击力 = 100', '- 防御力 = 100', '!+ saveState()', '!+ recoveryState(m)'],
        },
      },
      focus: ['role', 'memento', 'l_rm'],
    },
    {
      title: '管理者：只保管不偷看',
      text: '备忘录交给谁拿着？交给**管理者** `RoleStateCaretaker`。它只有一个格子放备忘录，提供 get 和 set，**从不打开看里面是什么**。角色存了哪些属性，它不知道，也不需要知道。',
      show: ['caretaker', 'l_cm'],
      set: {
        role: { lines: ['- 生命力 = 100', '- 攻击力 = 100', '- 防御力 = 100', '+ saveState()', '+ recoveryState(m)'] },
        caretaker: { badge: '不看内容' },
      },
      focus: ['caretaker', 'memento', 'l_cm'],
    },
    {
      title: '存档：saveState()',
      text: '跑一遍。打 Boss 前，客户端只说一句 `role.saveState()`。角色把**自己当前的状态**拍成一份快照——三项都是 100——装进备忘录交出来。客户端全程**没碰任何属性**。',
      show: ['client', 'l_cr', 'snap'],
      set: {
        snap: { x: 520, y: 300 },
        caretaker: { badge: '' },
        role: { lines: ['- 生命力 = 100', '- 攻击力 = 100', '- 防御力 = 100', '!+ saveState()', '+ recoveryState(m)'] },
      },
      trans: 1.8,
      focus: ['client', 'role', 'snap'],
      flows: [{ from: 'client', to: 'role', label: 'saveState()', delay: -0.9 }],
      bubbles: [{ node: 'snap', text: '咔嚓！拍下 100 / 100 / 100', side: 'top', delay: 0.8 }],
    },
    {
      title: '交给管理者保管',
      text: '然后客户端把备忘录交给管理者：`caretaker.setMemento(...)`。你看，存档这只**盒子**飞到了管理者手里。管理者把它收好，但**不拆开看**——里面是什么，只有角色自己知道。',
      set: {
        snap: { x: 830, y: 425 },
        role: { lines: ['- 生命力 = 100', '- 攻击力 = 100', '- 防御力 = 100', '+ saveState()', '+ recoveryState(m)'] },
      },
      trans: 1.6,
      focus: ['client', 'caretaker', 'snap'],
      flows: [{ from: 'client', to: 'caretaker', label: 'setMemento(📦)', curve: 200, delay: -0.6 }],
      bubbles: [{ node: 'caretaker', text: '收好了，我**不拆开**', side: 'top', step: 0 }],
    },
    {
      title: '大战 Boss：全军覆没',
      text: '开打！Boss 一套连招，角色的生命力、攻击力、防御力**全部掉到 0**。但别慌：管理者手里那份存档还是**满血的 100**——打 Boss 这件事，根本碰不到它。',
      show: ['boss'],
      set: {
        boss: { x: 330, y: 478, size: '', sub: '' },
        role: { lines: ['- 生命力 = 0', '- 攻击力 = 0', '- 防御力 = 0', '+ saveState()', '+ recoveryState(m)'], badge: 'GAME OVER' },
      },
      focus: ['boss', 'role', 'snap'],
      flows: [
        { from: 'boss', to: 'role', label: '💥 重击', tone: 'red' },
        { from: 'boss', to: 'role', label: '💥 暴击', tone: 'red', curve: 40 },
      ],
      bubbles: [{ node: 'snap', text: '我这还是 **100 / 100 / 100**', side: 'bottom', step: 1 }],
    },
    {
      title: '读档：备忘录飞回来',
      text: '读档：客户端从管理者那里取回备忘录 `getMemento()`，原封不动地交给角色：`role.recoveryState(备忘录)`。**怎么恢复，角色自己知道**，客户端还是不用碰任何属性。',
      set: {
        snap: { x: 520, y: 300 },
        role: { lines: ['- 生命力 = 0', '- 攻击力 = 0', '- 防御力 = 0', '+ saveState()', '!+ recoveryState(m)'], badge: '' },
      },
      trans: 1.6,
      focus: ['client', 'caretaker', 'role', 'snap'],
      flows: [
        { from: 'client', to: 'caretaker', label: 'getMemento()', curve: 200, delay: -0.6 },
        { from: 'client', to: 'role', label: 'recoveryState(📦)', delay: -0.6 },
      ],
    },
    {
      title: '满血复活',
      text: '角色按备忘录把三项属性**一一还原**，又是满血 100！整个过程，客户端只调用了 `saveState()` 和 `recoveryState()`，**一个属性名都没碰过**。以后加个“魔法力”，也只改角色和备忘录两处。',
      hide: ['boss'],
      set: {
        role: { lines: ['!- 生命力 = 100', '!- 攻击力 = 100', '!- 防御力 = 100', '+ saveState()', '+ recoveryState(m)'], badge: '满血复活' },
      },
      focus: ['role', 'snap', 'client'],
      flows: [{ from: 'snap', to: 'role', label: '❤ 100 ⚔ 100 🛡 100', tone: 'green' }],
      bubbles: [{ node: 'client', text: '再战 Boss！', side: 'top', step: 0 }],
    },
    {
      title: '代价：存档很占内存',
      text: '备忘录也有代价：每份存档都是一份**完整的状态拷贝**。角色状态很大、存档又很频繁时（比如每走一步存一次），管理者手里的盒子越堆越多，**很吃内存**。所以只存真正需要恢复的那部分状态。',
      set: {
        snap: { x: 830, y: 425, badge: '×50' },
        role: { lines: ['- 生命力 = 100', '- 攻击力 = 100', '- 防御力 = 100', '+ saveState()', '+ recoveryState(m)'], badge: '' },
        caretaker: { lines: ['- mementos: 50 份', '+ getMemento()', '+ setMemento(m)'] },
      },
      trans: 1.2,
      focus: ['caretaker', 'snap'],
      bubbles: [{ node: 'snap', text: '存档越多，**内存越吃紧**', side: 'bottom', delay: 0.6 }],
    },
    {
      title: '总结：备忘录模式',
      text: '备忘录三件套：**Originator** 发起人（自己存、自己恢复）、**Memento** 备忘录（只装状态）、**Caretaker** 管理者（只保管，不偷看）。一句话记住：**自己拍快照，别人来保管，读档回从前。**',
      set: {
        snap: { badge: '' },
        caretaker: { lines: ['- memento', '+ getMemento()', '+ setMemento(m)'] },
      },
      focus: ['role', 'memento', 'caretaker', 'l_rm', 'l_cm'],
      bubbles: [
        { node: 'role', text: '我自己**拍快照**、自己恢复', side: 'top' },
        { node: 'caretaker', text: '我只**保管**，从不偷看', side: 'top', delay: 0.5 },
      ],
    },
  ],
});
