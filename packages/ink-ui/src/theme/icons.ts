/**
 * Unicode Icons and Symbols for Terminal UI
 *
 * A comprehensive collection of Unicode characters optimized for
 * terminal interfaces, including box drawing, status indicators,
 * and decorative symbols.
 */

// =============================================================================
// BOX DRAWING CHARACTERS
// =============================================================================

export const box = {
  // Single line box drawing
  single: {
    topLeft: '\u250c', // ┌
    topRight: '\u2510', // ┐
    bottomLeft: '\u2514', // └
    bottomRight: '\u2518', // ┘
    horizontal: '\u2500', // ─
    vertical: '\u2502', // │
    cross: '\u253c', // ┼
    teeDown: '\u252c', // ┬
    teeUp: '\u2534', // ┴
    teeRight: '\u251c', // ├
    teeLeft: '\u2524', // ┤
  },

  // Double line box drawing
  double: {
    topLeft: '\u2554', // ╔
    topRight: '\u2557', // ╗
    bottomLeft: '\u255a', // ╚
    bottomRight: '\u255d', // ╝
    horizontal: '\u2550', // ═
    vertical: '\u2551', // ║
    cross: '\u256c', // ╬
    teeDown: '\u2566', // ╦
    teeUp: '\u2569', // ╩
    teeRight: '\u2560', // ╠
    teeLeft: '\u2563', // ╣
  },

  // Rounded corners
  rounded: {
    topLeft: '\u256d', // ╭
    topRight: '\u256e', // ╮
    bottomLeft: '\u2570', // ╰
    bottomRight: '\u256f', // ╯
    horizontal: '\u2500', // ─
    vertical: '\u2502', // │
  },

  // Heavy/bold box drawing
  heavy: {
    topLeft: '\u250f', // ┏
    topRight: '\u2513', // ┓
    bottomLeft: '\u2517', // ┗
    bottomRight: '\u251b', // ┛
    horizontal: '\u2501', // ━
    vertical: '\u2503', // ┃
    cross: '\u254b', // ╋
    teeDown: '\u2533', // ┳
    teeUp: '\u253b', // ┻
    teeRight: '\u2523', // ┣
    teeLeft: '\u252b', // ┫
  },

  // Mixed (single/double, single/heavy)
  mixed: {
    singleDoubleTopLeft: '\u2552', // ╒
    singleDoubleTopRight: '\u2555', // ╕
    singleDoubleBottomLeft: '\u2558', // ╘
    singleDoubleBottomRight: '\u255b', // ╛
  },
} as const;

// =============================================================================
// BLOCK ELEMENTS
// =============================================================================

export const blocks = {
  // Full blocks
  full: '\u2588', // █
  upperHalf: '\u2580', // ▀
  lowerHalf: '\u2584', // ▄
  leftHalf: '\u258c', // ▌
  rightHalf: '\u2590', // ▐

  // Vertical progress (bottom to top)
  vertical: [
    '\u2581', // ▁ 1/8
    '\u2582', // ▂ 2/8
    '\u2583', // ▃ 3/8
    '\u2584', // ▄ 4/8
    '\u2585', // ▅ 5/8
    '\u2586', // ▆ 6/8
    '\u2587', // ▇ 7/8
    '\u2588', // █ 8/8
  ],

  // Horizontal progress (left to right)
  horizontal: [
    '\u258f', // ▏ 1/8
    '\u258e', // ▎ 2/8
    '\u258d', // ▍ 3/8
    '\u258c', // ▌ 4/8
    '\u258b', // ▋ 5/8
    '\u258a', // ▊ 6/8
    '\u2589', // ▉ 7/8
    '\u2588', // █ 8/8
  ],

  // Shades (sparse to dense)
  shades: [
    '\u2591', // ░ Light
    '\u2592', // ▒ Medium
    '\u2593', // ▓ Dark
    '\u2588', // █ Full
  ],

  // Quadrants
  quadrants: {
    upperLeft: '\u2598', // ▘
    upperRight: '\u259d', // ▝
    lowerLeft: '\u2596', // ▖
    lowerRight: '\u2597', // ▗
    upperLeftLowerRight: '\u259a', // ▚
    upperRightLowerLeft: '\u259e', // ▞
  },
} as const;

// =============================================================================
// BRAILLE PATTERNS (for sparklines and micro-charts)
// =============================================================================

export const braille = {
  // Empty and full
  empty: '\u2800', // ⠀
  full: '\u28ff', // ⣿

  // Dot positions for building custom patterns
  // Braille dots: 1 4
  //              2 5
  //              3 6
  //              7 8
  dots: {
    1: 0x01,
    2: 0x02,
    3: 0x04,
    4: 0x08,
    5: 0x10,
    6: 0x20,
    7: 0x40,
    8: 0x80,
  },

  /**
   * Build a braille character from dot positions
   * @param dots - Array of dot positions (1-8)
   */
  fromDots: (dots: number[]): string => {
    let code = 0x2800;
    for (const dot of dots) {
      switch (dot) {
        case 1:
          code |= 0x01;
          break;
        case 2:
          code |= 0x02;
          break;
        case 3:
          code |= 0x04;
          break;
        case 4:
          code |= 0x08;
          break;
        case 5:
          code |= 0x10;
          break;
        case 6:
          code |= 0x20;
          break;
        case 7:
          code |= 0x40;
          break;
        case 8:
          code |= 0x80;
          break;
      }
    }
    return String.fromCharCode(code);
  },

  // Pre-computed sparkline characters (single column, 0-8 height)
  sparkline: [
    '\u2800', // ⠀ 0
    '\u2880', // ⢀ 1
    '\u28a0', // ⢠ 2
    '\u28b0', // ⢰ 3
    '\u28b8', // ⢸ 4
    '\u28bc', // ⢼ 5
    '\u28be', // ⢾ 6
    '\u28bf', // ⢿ 7
    '\u28ff', // ⣿ 8
  ],
} as const;

// =============================================================================
// STATUS ICONS
// =============================================================================

export const status = {
  // Check marks and crosses
  success: '\u2713', // ✓
  successFilled: '\u2714', // ✔
  error: '\u2717', // ✗
  errorFilled: '\u2718', // ✘
  warning: '\u26a0', // ⚠
  info: '\u2139', // ℹ
  question: '\u003f', // ?
  questionCircle: '\u2753', // ❓

  // Dots/bullets
  bullet: '\u2022', // •
  bulletHollow: '\u25e6', // ◦
  dot: '\u00b7', // ·
  dotLarge: '\u2219', // ∙

  // Stars
  star: '\u2605', // ★
  starHollow: '\u2606', // ☆
  starHalf: '\u2bea', // ⯪

  // Other symbols
  heart: '\u2665', // ♥
  heartHollow: '\u2661', // ♡
  lightning: '\u26a1', // ⚡
  fire: '\u{1f525}', // 🔥
  sparkles: '\u2728', // ✨
} as const;

// =============================================================================
// ARROWS AND CHEVRONS
// =============================================================================

export const arrows = {
  // Simple arrows
  right: '\u2192', // →
  left: '\u2190', // ←
  up: '\u2191', // ↑
  down: '\u2193', // ↓
  upDown: '\u2195', // ↕
  leftRight: '\u2194', // ↔

  // Double arrows
  doubleRight: '\u21d2', // ⇒
  doubleLeft: '\u21d0', // ⇐
  doubleUp: '\u21d1', // ⇑
  doubleDown: '\u21d3', // ⇓

  // Chevrons
  chevronRight: '\u203a', // ›
  chevronLeft: '\u2039', // ‹
  chevronUp: '\u02c4', // ˄
  chevronDown: '\u02c5', // ˅

  // Heavy chevrons
  heavyChevronRight: '\u276f', // ❯
  heavyChevronLeft: '\u276e', // ❮

  // Triangles
  triangleRight: '\u25b6', // ▶
  triangleLeft: '\u25c0', // ◀
  triangleUp: '\u25b2', // ▲
  triangleDown: '\u25bc', // ▼
  triangleRightSmall: '\u25b8', // ▸
  triangleLeftSmall: '\u25c2', // ◂
  triangleUpSmall: '\u25b4', // ▴
  triangleDownSmall: '\u25be', // ▾

  // Outlined triangles
  triangleRightOutline: '\u25b7', // ▷
  triangleLeftOutline: '\u25c1', // ◁
  triangleUpOutline: '\u25b3', // △
  triangleDownOutline: '\u25bd', // ▽
} as const;

// =============================================================================
// SELECTION AND INPUT
// =============================================================================

export const selection = {
  // Radio buttons
  radioOn: '\u25c9', // ◉
  radioOff: '\u25cb', // ○
  radioOnFilled: '\u25cf', // ●
  radioOffFilled: '\u25cb', // ○

  // Checkboxes
  checkboxOn: '\u2611', // ☑
  checkboxOff: '\u2610', // ☐
  checkboxOnFilled: '\u25a0', // ■
  checkboxOffFilled: '\u25a1', // □

  // Cursor
  cursor: '\u258b', // ▋
  cursorBlink: '\u2588', // █
  cursorThin: '\u2502', // │
  insertionPoint: '\u2336', // ⌶
} as const;

// =============================================================================
// SPINNERS
// =============================================================================

export const spinners = {
  // Braille dots spinner (smooth)
  dots: ['\u280b', '\u2819', '\u2839', '\u2838', '\u283c', '\u2834', '\u2826', '\u2827', '\u2807', '\u280f'],
  // ⠋ ⠙ ⠹ ⠸ ⠼ ⠴ ⠦ ⠧ ⠇ ⠏

  // Simple line spinner
  line: ['-', '\\', '|', '/'],

  // Arc spinner
  arc: ['\u25dc', '\u25e0', '\u25dd', '\u25de', '\u25e1', '\u25df'],
  // ◜ ◠ ◝ ◞ ◡ ◟

  // Block spinner
  blocks: ['\u2588', '\u2593', '\u2592', '\u2591', '\u2592', '\u2593'],
  // █ ▓ ▒ ░ ▒ ▓

  // Growing dots
  growingDots: ['.  ', '.. ', '...', ' ..', '  .', '   '],

  // Bouncing bar
  bounce: ['\u2801', '\u2802', '\u2804', '\u2802'],
  // ⠁ ⠂ ⠄ ⠂

  // Clock spinner
  clock: [
    '\u{1f55b}', // 🕛
    '\u{1f550}', // 🕐
    '\u{1f551}', // 🕑
    '\u{1f552}', // 🕒
    '\u{1f553}', // 🕓
    '\u{1f554}', // 🕔
    '\u{1f555}', // 🕕
    '\u{1f556}', // 🕖
    '\u{1f557}', // 🕗
    '\u{1f558}', // 🕘
    '\u{1f559}', // 🕙
    '\u{1f55a}', // 🕚
  ],

  // Dots growing
  dotsGrowing: ['\u2800', '\u2801', '\u2803', '\u2807', '\u280f', '\u281f', '\u283f', '\u287f', '\u28ff'],
} as const;

// =============================================================================
// FILE AND FOLDER ICONS
// =============================================================================

export const files = {
  // Basic
  file: '\u{1f4c4}', // 📄
  fileEmpty: '\u{1f5cb}', // 🗋
  folder: '\u{1f4c1}', // 📁
  folderOpen: '\u{1f4c2}', // 📂

  // Special files
  config: '\u2699', // ⚙
  lock: '\u{1f512}', // 🔒
  unlock: '\u{1f513}', // 🔓
  key: '\u{1f511}', // 🔑
  cloud: '\u2601', // ☁
  database: '\u{1f5c4}', // 🗄

  // Code files
  code: '\u{1f4dc}', // 📜
  binary: '\u{1f4be}', // 💾

  // Media
  image: '\u{1f5bc}', // 🖼
  video: '\u{1f3ac}', // 🎬
  audio: '\u{1f3b5}', // 🎵

  // Documents
  document: '\u{1f4c3}', // 📃
  clipboard: '\u{1f4cb}', // 📋
  link: '\u{1f517}', // 🔗
} as const;

// =============================================================================
// USER AND PEOPLE ICONS
// =============================================================================

export const people = {
  user: '\u{1f464}', // 👤
  users: '\u{1f465}', // 👥
  team: '\u{1f46a}', // 👪
  admin: '\u{1f451}', // 👑
  developer: '\u{1f468}\u200d\u{1f4bb}', // 👨‍💻
} as const;

// =============================================================================
// MISCELLANEOUS
// =============================================================================

export const misc = {
  // Punctuation
  ellipsis: '\u2026', // …
  middleDot: '\u00b7', // ·
  pipe: '\u2502', // │
  doublePipe: '\u2551', // ║

  // Math
  times: '\u00d7', // ×
  divide: '\u00f7', // ÷
  plusMinus: '\u00b1', // ±
  infinity: '\u221e', // ∞
  approx: '\u2248', // ≈

  // Currency
  dollar: '\u0024', // $
  euro: '\u20ac', // €
  pound: '\u00a3', // £
  yen: '\u00a5', // ¥

  // Weather
  sun: '\u2600', // ☀
  moon: '\u263d', // ☽
  cloud: '\u2601', // ☁
  rain: '\u{1f327}', // 🌧
  snow: '\u2744', // ❄

  // Time
  clock: '\u{1f550}', // 🕐
  hourglass: '\u231b', // ⌛
  stopwatch: '\u23f1', // ⏱

  // Alerts
  bell: '\u{1f514}', // 🔔
  bellOff: '\u{1f515}', // 🔕
  megaphone: '\u{1f4e2}', // 📢

  // Communication
  mail: '\u2709', // ✉
  phone: '\u{1f4de}', // 📞
  chat: '\u{1f4ac}', // 💬

  // Actions
  search: '\u{1f50d}', // 🔍
  gear: '\u2699', // ⚙
  trash: '\u{1f5d1}', // 🗑
  edit: '\u{270f}', // ✏
  save: '\u{1f4be}', // 💾
  download: '\u{2b07}', // ⬇
  upload: '\u{2b06}', // ⬆
  refresh: '\u{1f504}', // 🔄
  play: '\u25b6', // ▶
  pause: '\u23f8', // ⏸
  stop: '\u23f9', // ⏹
} as const;

// =============================================================================
// ICON SETS BY CATEGORY
// =============================================================================

export const icons = {
  box,
  blocks,
  braille,
  status,
  arrows,
  selection,
  spinners,
  files,
  people,
  misc,
} as const;

export default icons;
