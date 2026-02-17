// =====================================================
// 遊戲設定檔 — 所有可自訂的內容集中在這裡
// =====================================================

const CONFIG = {
  herName: "寶貝",

  // ---------- Memory Match: 照片牌 ----------
  matchPhotos: [
    "game1/20250210_153619.jpg",
    "game1/20250227_162623.jpg",
    "game1/LINE_ALBUM_2025120_250410_5.jpg",
    "game1/20250801_151331.jpg",
    "game1/20250810_112100.jpg",
    "game1/20250825_202438.jpg",
    "game1/LINE_ALBUM_2025129_250410_7.jpg",
    "game1/1757308021412.jpg"
  ],

  // ---------- Quiz ----------
  quizQuestions: [
    {
      emoji: "💕",
      question: "寶貝你覺得我最喜歡妳什麼？",
      options: ["個性", "身材", "臉蛋", "味道"],
      correctIndex: -1, // 陷阱題：沒有正確答案
      extraMsg: "當然是都喜歡阿~怎麼可能只有一個呢!!!"
    },
    {
      emoji: "🥺",
      question: "寶貝對我怎麼樣我會比較傷心？",
      options: ["對我兇兇", "不讓我吃零食", "踢我屁股", "嘲笑我"],
      correctIndex: 0,
      extraMsg: "其實寶貝對我兇兇我才會傷心"
    }
  ],

  // ---------- Scratch Card ----------
  scratchPhoto: "picture/20250214_143301.jpg",

  // ---------- NPCs ----------
  npcs: [
    {
      id: "melody", emoji: "🐰", name: "美樂蒂", color: "#FFB6C1",
      x: 350, y: 320,
      msg: "生日快樂呀～🎀\n希望妳的每一天都像花朵一樣\n綻放最美的笑容！\n今天是屬於妳的特別日子喔！"
    },
    {
      id: "sheep", emoji: "🐑", name: "小綿羊", color: "#F5E6D0",
      x: 1050, y: 340,
      msg: "生日快樂～🌿\n願妳永遠被溫柔以待，\n像棉花糖一樣甜甜的度過每一天！\n要一直幸福喔～"
    },
    {
      id: "bear", emoji: "🐻", name: "棕熊", color: "#C4A882",
      x: 230, y: 850,
      msg: "嘿！生日快樂啦！🎉\n聽說今天壽星最大？\n那我請妳吃蜂蜜蛋糕！\n（其實是我自己也想吃啦～嘿嘿）"
    },
    {
      id: "dog", emoji: "🐶", name: "小白狗", color: "#FFFFFF",
      x: 1250, y: 800,
      msg: "汪汪！生日快樂！🐾\n妳知道嗎？\n在這個世界上遇見妳，\n是最幸福的事情！\n要一直保持那個燦爛的笑容喔！"
    },
    {
      id: "squirrel", emoji: "🐿️", name: "小松鼠", color: "#D4A574",
      x: 550, y: 1200,
      msg: "生日快樂！🌟\n把最珍貴的橡果送給妳～\n願妳所有的夢想都能實現，\n勇敢追逐每一個閃亮的星星！"
    },
    {
      id: "mouse", emoji: "🐭", name: "藍色小鼠", color: "#B0D4E8",
      x: 1200, y: 1200,
      msg: "嘻嘻，生日快樂！🧀\n幸福就像起司一樣，\n越品味越香濃～\n希望妳每天都被滿滿的幸福包圍！"
    },
    {
      id: "fairy", emoji: "🧚", name: "花仙子", color: "#E8D5F5",
      x: 800, y: 600,
      msg: "✨ 魔法祝福降臨 ✨\n\n親愛的壽星，\n我用最閃亮的星塵為妳祈願：\n願妳的人生充滿奇蹟與驚喜，\n永遠被愛與幸福環繞！\n\n🌙 生日快樂！🌙"
    }
  ],

  // ---------- Buildings (mini-game entrances) ----------
  buildings: [
    { id: "memory", emoji: "🏠", label: "記憶小屋", x: 500, y: 240, game: "game-memory" },
    { id: "quiz",   emoji: "💕", label: "問答亭",   x: 1150, y: 580, game: "game-quiz" },
    { id: "scratch", emoji: "🎁", label: "驚喜禮盒", x: 400, y: 1050, game: "game-scratch" }
  ],

  // ---------- Unlock data per game ----------
  unlocks: {
    "game-memory": {
      icon: "📸", title: "回憶解鎖 #1",
      text: "還記得我們一起的那些日子嗎？\n每一個瞬間都是最珍貴的回憶。\n謝謝妳陪我走過這些美好的時光。",
      photo: "picture/20250120_171304.jpg"
    },
    "game-quiz": {
      icon: "💝", title: "回憶解鎖 #2",
      text: "謝謝妳總是陪在我身邊，\n不管是開心的時候還是難過的時候。\n有妳在，每一天都值得紀念。",
      photo: "picture/20250121_011405.jpg"
    },
    "game-scratch": {
      icon: "🎁", title: "回憶解鎖 #3",
      text: "妳的笑容是我聽過最美的旋律，\n比任何音樂都動聽。\n我想當妳一輩子最忠實的聽眾。",
      photo: "picture/20250207_223406.jpg"
    }
  },

  // ---------- All photos in picture/ ----------
  allPhotos: [
    "picture/20250120_171304.jpg",
    "picture/20250121_011405.jpg",
    "picture/20250207_223406.jpg",
    "picture/20250214_143301.jpg",
    "picture/20250218_132431.jpg",
    "picture/20250219_115329.jpg",
    "picture/20250403_221023.jpg",
    "picture/20250825_143945.jpg",
    "picture/20250830_193042.jpg",
    "picture/20250912_154153.jpg",
    "picture/LINE_ALBUM_2025120_250410_1.jpg",
    "picture/LINE_ALBUM_2025129_250410_56.jpg",
    "picture/LINE_ALBUM_2025212_250410_4.jpg"
  ],

  // ---------- Treasure chest password ----------
  treasurePassword: "5233",

  // ---------- Love letter content ----------
  letterContent: `寶貝~對不起我最近一直讓妳很沒安全感，很容易生氣，又很冒冒失失，還不會哄寶貝，要寶貝一直提醒我，提醒我還會對寶貝生氣，讓寶貝怕怕

寶貝~對不起，也謝謝妳為我做這麼多，我其實有時候的確會不理解寶貝，因為我覺得像寶貝這麼好的女生，外面一堆人搶著要，為什麼還要怕我會離開

應該說我黏著寶貝都還來不及了吧!!寶貝，謝謝妳包容笨笨的我這麼多，但有些事情希望寶貝能夠再更體諒一點

我不是不愛寶貝，也一直都把寶貝放在最高位，但是寶貝，我真的不太會排行程啊!!也真的很容易忘東忘西!!但這些都不是因為我把寶貝當作是不重要的人啊!!

寶貝，我愛你~謝謝妳在我需要幫忙的時候還對我不離不棄~

我們要一直在一起，直到白頭偕老喔

~LOVE YOU~`,

  // ---------- Valentine video (Google Drive embed) ----------
  videoEmbedUrl: "https://drive.google.com/file/d/1UoTI283sIaizSXOvRDkqQVIas6N1_er7/preview",

  // ---------- Map decorations ----------
  decorations: [
    { emoji: "🌸", x: 180, y: 170 }, { emoji: "🌷", x: 680, y: 120 },
    { emoji: "💐", x: 1150, y: 200 }, { emoji: "🌹", x: 1350, y: 460 },
    { emoji: "🌻", x: 120, y: 560 }, { emoji: "🌺", x: 920, y: 280 },
    { emoji: "🎀", x: 620, y: 700 }, { emoji: "🎁", x: 280, y: 1280 },
    { emoji: "🎈", x: 1020, y: 1020 }, { emoji: "🦋", x: 450, y: 460 },
    { emoji: "🌈", x: 1300, y: 230 }, { emoji: "⭐", x: 800, y: 1280 },
    { emoji: "🍰", x: 780, y: 400 }, { emoji: "🧁", x: 980, y: 920 },
    { emoji: "🍩", x: 180, y: 1050 }, { emoji: "💎", x: 1250, y: 1280 },
    { emoji: "🌳", x: 60, y: 400 }, { emoji: "🌳", x: 1450, y: 680 },
    { emoji: "🌳", x: 730, y: 1380 }, { emoji: "🌲", x: 1400, y: 1050 },
    { emoji: "🌲", x: 120, y: 1200 }, { emoji: "🌲", x: 1450, y: 240 },
    { emoji: "🏰", x: 790, y: 750 }, { emoji: "🌸", x: 600, y: 1100 },
    { emoji: "🌷", x: 1100, y: 400 }, { emoji: "💕", x: 400, y: 700 },
    { emoji: "🎪", x: 900, y: 700 },
  ],

  // ---------- Map paths ----------
  paths: [
    { x: 350, y: 400, w: 900, h: 35 },
    { x: 790, y: 240, w: 35, h: 1000 },
    { x: 350, y: 800, w: 450, h: 35 },
    { x: 850, y: 580, w: 350, h: 35 },
    { x: 400, y: 580, w: 35, h: 260 },
    { x: 400, y: 1000, w: 35, h: 200 },
    { x: 1100, y: 580, w: 35, h: 350 },
    { x: 450, y: 1200, w: 750, h: 35 },
  ]
};
