const LANGUAGE_KEY = "classic-snake-language";

const TRANSLATIONS = {
  "zh-TW": {
    language: "語言",
    title: "經典貪吃蛇",
    startMessage: "按下開始即可遊玩。",
    start: "開始",
    score: "分數",
    high: "最高分",
    ready: "準備中",
    running: "進行中",
    paused: "已暫停",
    gameOver: "遊戲結束",
    pause: "暫停",
    resume: "繼續",
    restart: "重新開始",
    demoOn: "Demo：開啟",
    demoOff: "Demo：關閉",
    wrapWalls: "穿牆模式",
    specialFood: "特殊食物",
    obstacles: "障礙物",
    up: "上",
    left: "左",
    down: "下",
    right: "右",
    hint: "使用方向鍵或 WASD。Restart 會重置方向與速度。",
  },
  "zh-CN": {
    language: "语言",
    title: "经典贪吃蛇",
    startMessage: "按下开始即可游玩。",
    start: "开始",
    score: "分数",
    high: "最高分",
    ready: "准备中",
    running: "进行中",
    paused: "已暂停",
    gameOver: "游戏结束",
    pause: "暂停",
    resume: "继续",
    restart: "重新开始",
    demoOn: "Demo：开启",
    demoOff: "Demo：关闭",
    wrapWalls: "穿墙模式",
    specialFood: "特殊食物",
    obstacles: "障碍物",
    up: "上",
    left: "左",
    down: "下",
    right: "右",
    hint: "使用方向键或 WASD。Restart 会重置方向与速度。",
  },
  en: {
    language: "Language",
    title: "Classic Snake",
    startMessage: "Press Start to play.",
    start: "Start",
    score: "Score",
    high: "High",
    ready: "Ready",
    running: "Running",
    paused: "Paused",
    gameOver: "Game Over",
    pause: "Pause",
    resume: "Resume",
    restart: "Restart",
    demoOn: "Demo: ON",
    demoOff: "Demo: OFF",
    wrapWalls: "Wrap Walls",
    specialFood: "Special Food",
    obstacles: "Obstacles",
    up: "Up",
    left: "Left",
    down: "Down",
    right: "Right",
    hint: "Use Arrow keys or WASD. Restart resets direction and speed.",
  },
  ja: {
    language: "言語",
    title: "クラシックスネーク",
    startMessage: "スタートを押して開始します。",
    start: "開始",
    score: "スコア",
    high: "最高",
    ready: "準備完了",
    running: "プレイ中",
    paused: "一時停止",
    gameOver: "ゲームオーバー",
    pause: "一時停止",
    resume: "再開",
    restart: "リスタート",
    demoOn: "デモ：ON",
    demoOff: "デモ：OFF",
    wrapWalls: "壁すり抜け",
    specialFood: "特殊フード",
    obstacles: "障害物",
    up: "上",
    left: "左",
    down: "下",
    right: "右",
    hint: "矢印キーまたは WASD を使用。Restart で方向と速度をリセット。",
  },
  ko: {
    language: "언어",
    title: "클래식 스네이크",
    startMessage: "시작 버튼을 눌러 게임을 시작하세요.",
    start: "시작",
    score: "점수",
    high: "최고점",
    ready: "준비",
    running: "진행 중",
    paused: "일시정지",
    gameOver: "게임 오버",
    pause: "일시정지",
    resume: "계속",
    restart: "다시 시작",
    demoOn: "데모: 켜짐",
    demoOff: "데모: 꺼짐",
    wrapWalls: "벽 통과",
    specialFood: "특수 먹이",
    obstacles: "장애물",
    up: "위",
    left: "왼쪽",
    down: "아래",
    right: "오른쪽",
    hint: "방향키 또는 WASD를 사용하세요. Restart는 방향과 속도를 초기화합니다.",
  },
  th: {
    language: "ภาษา",
    title: "งูคลาสสิก",
    startMessage: "กดเริ่มเพื่อเล่นเกม",
    start: "เริ่ม",
    score: "คะแนน",
    high: "สูงสุด",
    ready: "พร้อม",
    running: "กำลังเล่น",
    paused: "หยุดชั่วคราว",
    gameOver: "เกมจบ",
    pause: "หยุด",
    resume: "เล่นต่อ",
    restart: "เริ่มใหม่",
    demoOn: "เดโม: เปิด",
    demoOff: "เดโม: ปิด",
    wrapWalls: "ทะลุกำแพง",
    specialFood: "อาหารพิเศษ",
    obstacles: "สิ่งกีดขวาง",
    up: "ขึ้น",
    left: "ซ้าย",
    down: "ลง",
    right: "ขวา",
    hint: "ใช้ปุ่มลูกศรหรือ WASD ปุ่ม Restart จะรีเซ็ตทิศทางและความเร็ว",
  },
  es: {
    language: "Idioma",
    title: "Snake Clásico",
    startMessage: "Pulsa Iniciar para jugar.",
    start: "Iniciar",
    score: "Puntuación",
    high: "Récord",
    ready: "Listo",
    running: "En juego",
    paused: "En pausa",
    gameOver: "Fin del juego",
    pause: "Pausa",
    resume: "Continuar",
    restart: "Reiniciar",
    demoOn: "Demo: ON",
    demoOff: "Demo: OFF",
    wrapWalls: "Atravesar muros",
    specialFood: "Comida especial",
    obstacles: "Obstáculos",
    up: "Arriba",
    left: "Izquierda",
    down: "Abajo",
    right: "Derecha",
    hint: "Usa las flechas o WASD. Restart reinicia dirección y velocidad.",
  },
};

function normalizeLanguage(lang) {
  if (!lang) {
    return "en";
  }
  const lower = lang.toLowerCase();
  if (lower.startsWith("zh-tw") || lower.startsWith("zh-hk")) {
    return "zh-TW";
  }
  if (lower.startsWith("zh")) {
    return "zh-CN";
  }
  if (lower.startsWith("ja")) {
    return "ja";
  }
  if (lower.startsWith("ko")) {
    return "ko";
  }
  if (lower.startsWith("th")) {
    return "th";
  }
  if (lower.startsWith("es")) {
    return "es";
  }
  return "en";
}

export function pickSupportedLanguage(lang) {
  const normalized = normalizeLanguage(lang);
  return TRANSLATIONS[normalized] ? normalized : "en";
}

export function getInitialLanguage(preferredLanguage = "") {
  const preferred = pickSupportedLanguage(preferredLanguage);
  if (preferredLanguage && TRANSLATIONS[preferred]) {
    return preferred;
  }

  try {
    const stored = window.localStorage.getItem(LANGUAGE_KEY);
    if (stored && TRANSLATIONS[stored]) {
      return stored;
    }
  } catch {
    // Ignore storage failures and use fallback language.
  }
  return normalizeLanguage(window.navigator.language);
}

export function setLanguagePreference(language) {
  try {
    window.localStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // Ignore storage failures and keep game playable.
  }
}

export function getText(language, key) {
  const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
  return dict[key] || TRANSLATIONS.en[key] || key;
}

export function getSupportedLanguages() {
  return Object.keys(TRANSLATIONS);
}
