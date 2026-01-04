/**
 * SaaS Terminal UI Color System
 *
 * A comprehensive color palette designed for terminal UIs with
 * support for truecolor (RGB), 256-color, and 16-color fallbacks.
 */

// =============================================================================
// TRUECOLOR PALETTE (24-bit RGB)
// =============================================================================

export const colors = {
  // Brand Colors - Primary Blue
  primary: {
    50: '#E8F4FD',
    100: '#C5E4FA',
    200: '#9ED2F6',
    300: '#77C0F2',
    400: '#50AEEE',
    500: '#2196F3', // Primary action color
    600: '#1A78C2',
    700: '#145A91',
    800: '#0D3C61',
    900: '#071E30',
  },

  // Secondary - Purple for premium/pro features
  secondary: {
    50: '#F3E5F5',
    100: '#E1BEE7',
    200: '#CE93D8',
    300: '#BA68C8',
    400: '#AB47BC',
    500: '#9C27B0', // Secondary actions
    600: '#7B1FA2',
    700: '#6A1B9A',
    800: '#4A148C',
    900: '#2C0A52',
  },

  // Accent - Cyan for highlights and links
  accent: {
    50: '#E0F7FA',
    100: '#B2EBF2',
    200: '#80DEEA',
    300: '#4DD0E1',
    400: '#26C6DA',
    500: '#00BCD4', // Links, highlights
    600: '#00ACC1',
    700: '#0097A7',
    800: '#00838F',
    900: '#006064',
  },

  // Semantic Colors
  success: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Success main
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },

  warning: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFC107', // Warning main
    600: '#FFB300',
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00',
  },

  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336', // Error main
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },

  info: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Info main
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  // Neutrals (optimized for dark terminal backgrounds)
  neutral: {
    0: '#000000',
    50: '#0D1117', // Deep background
    100: '#161B22', // Card background
    200: '#21262D', // Elevated surface
    300: '#30363D', // Borders
    400: '#484F58', // Disabled text
    500: '#6E7681', // Placeholder text
    600: '#8B949E', // Secondary text
    700: '#C9D1D9', // Primary text
    800: '#E6EDF3', // Emphasized text
    900: '#FFFFFF',
  },
} as const;

// =============================================================================
// 256-COLOR FALLBACK
// =============================================================================

export const colors256 = {
  // Brand
  primary: 33, // Blue
  primaryLight: 39,
  primaryDark: 26,

  secondary: 128, // Purple
  secondaryLight: 135,
  secondaryDark: 91,

  accent: 37, // Cyan
  accentLight: 44,
  accentDark: 30,

  // Semantic
  success: 34, // Green
  successLight: 40,
  successDark: 28,

  warning: 220, // Yellow
  warningLight: 227,
  warningDark: 214,

  error: 196, // Red
  errorLight: 203,
  errorDark: 160,

  info: 39, // Light blue
  infoLight: 45,
  infoDark: 33,

  // Backgrounds
  bg: {
    base: 234, // #1c1c1c
    card: 235, // #262626
    elevated: 236, // #303030
    selected: 24, // Dark blue
  },

  // Text
  text: {
    primary: 252, // #d0d0d0
    secondary: 245, // #8a8a8a
    muted: 240, // #585858
    disabled: 238, // #444444
  },

  // Borders
  border: {
    default: 238, // #444444
    focused: 33, // Blue
    error: 196, // Red
    success: 34, // Green
  },
} as const;

// =============================================================================
// 16-COLOR FALLBACK (ANSI)
// =============================================================================

export const colors16 = {
  // Brand
  primary: 'blue',
  primaryBright: 'blueBright',
  secondary: 'magenta',
  secondaryBright: 'magentaBright',
  accent: 'cyan',
  accentBright: 'cyanBright',

  // Semantic
  success: 'green',
  successBright: 'greenBright',
  warning: 'yellow',
  warningBright: 'yellowBright',
  error: 'red',
  errorBright: 'redBright',
  info: 'blueBright',

  // Text
  text: {
    primary: 'white',
    secondary: 'gray',
    muted: 'blackBright',
  },

  // Background
  bg: {
    base: 'black',
    card: 'blackBright',
  },
} as const;

// =============================================================================
// INTERACTIVE STATE COLORS
// =============================================================================

export const interactive = {
  // Buttons
  button: {
    primary: {
      default: colors.primary[500],
      hover: colors.primary[400],
      active: colors.primary[600],
      disabled: colors.neutral[400],
      text: colors.neutral[900],
      textDisabled: colors.neutral[500],
    },
    secondary: {
      default: colors.neutral[200],
      hover: colors.neutral[300],
      active: colors.neutral[100],
      disabled: colors.neutral[200],
      text: colors.neutral[700],
      textDisabled: colors.neutral[500],
    },
    danger: {
      default: colors.error[700],
      hover: colors.error[500],
      active: colors.error[800],
      disabled: colors.neutral[400],
      text: colors.neutral[900],
      textDisabled: colors.neutral[500],
    },
    ghost: {
      default: 'transparent',
      hover: colors.neutral[200],
      active: colors.neutral[300],
      disabled: 'transparent',
      text: colors.neutral[700],
      textDisabled: colors.neutral[500],
    },
  },

  // Input fields
  input: {
    default: {
      border: colors.neutral[300],
      bg: colors.neutral[100],
      text: colors.neutral[700],
      placeholder: colors.neutral[500],
    },
    focused: {
      border: colors.primary[500],
      bg: colors.neutral[100],
      text: colors.neutral[700],
      placeholder: colors.neutral[500],
    },
    error: {
      border: colors.error[500],
      bg: colors.error[900],
      text: colors.neutral[700],
      placeholder: colors.neutral[500],
    },
    success: {
      border: colors.success[500],
      bg: colors.success[900],
      text: colors.neutral[700],
      placeholder: colors.neutral[500],
    },
    disabled: {
      border: colors.neutral[300],
      bg: colors.neutral[200],
      text: colors.neutral[500],
      placeholder: colors.neutral[400],
    },
  },

  // Table rows
  table: {
    default: 'transparent',
    hover: colors.neutral[200],
    selected: colors.primary[900],
    alternate: colors.neutral[100],
    headerBg: colors.neutral[200],
    headerText: colors.neutral[600],
    borderColor: colors.neutral[300],
  },

  // Links
  link: {
    default: colors.accent[500],
    hover: colors.accent[300],
    active: colors.accent[600],
    visited: colors.secondary[400],
  },

  // Focus ring
  focus: {
    ring: colors.primary[500],
    ringOffset: colors.neutral[50],
  },
} as const;

// =============================================================================
// SEMANTIC COLOR ALIASES
// =============================================================================

export const semantic = {
  // Status indicators
  status: {
    online: colors.success[500],
    offline: colors.neutral[500],
    busy: colors.warning[500],
    error: colors.error[500],
    maintenance: colors.info[500],
  },

  // Badges
  badge: {
    success: {
      bg: colors.success[900],
      text: colors.success[300],
      dot: colors.success[500],
    },
    warning: {
      bg: colors.warning[900],
      text: colors.warning[300],
      dot: colors.warning[500],
    },
    error: {
      bg: colors.error[900],
      text: colors.error[300],
      dot: colors.error[500],
    },
    info: {
      bg: colors.info[900],
      text: colors.info[300],
      dot: colors.info[500],
    },
    neutral: {
      bg: colors.neutral[200],
      text: colors.neutral[600],
      dot: colors.neutral[500],
    },
    pro: {
      bg: colors.secondary[900],
      text: colors.secondary[300],
      dot: colors.secondary[500],
    },
  },

  // Diff/code colors
  diff: {
    added: colors.success[800],
    addedText: colors.success[300],
    removed: colors.error[800],
    removedText: colors.error[300],
    modified: colors.warning[800],
    modifiedText: colors.warning[300],
  },

  // Syntax highlighting
  syntax: {
    keyword: colors.secondary[400],
    string: colors.success[400],
    number: colors.accent[400],
    comment: colors.neutral[500],
    function: colors.primary[400],
    variable: colors.error[400],
    type: colors.warning[400],
    operator: colors.neutral[600],
  },
} as const;

// =============================================================================
// THEME VARIANTS
// =============================================================================

export type ThemeMode = 'dark' | 'light';

export const getThemeColors = (mode: ThemeMode) => {
  if (mode === 'light') {
    // Invert for light mode (less common in terminals)
    return {
      bg: {
        base: colors.neutral[900],
        card: colors.neutral[800],
        elevated: colors.neutral[700],
      },
      text: {
        primary: colors.neutral[100],
        secondary: colors.neutral[300],
        muted: colors.neutral[400],
      },
      border: colors.neutral[600],
    };
  }

  // Dark mode (default for terminal)
  return {
    bg: {
      base: colors.neutral[50],
      card: colors.neutral[100],
      elevated: colors.neutral[200],
    },
    text: {
      primary: colors.neutral[700],
      secondary: colors.neutral[600],
      muted: colors.neutral[500],
    },
    border: colors.neutral[300],
  };
};

// =============================================================================
// COLOR UTILITIES
// =============================================================================

/**
 * Convert hex to RGB for terminal use
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Get ANSI escape code for truecolor
 */
export const toAnsiRgb = (hex: string, isBg = false): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return '';
  const prefix = isBg ? '48' : '38';
  return `\x1b[${prefix};2;${rgb.r};${rgb.g};${rgb.b}m`;
};

/**
 * Get ANSI escape code for 256-color
 */
export const toAnsi256 = (colorCode: number, isBg = false): string => {
  const prefix = isBg ? '48' : '38';
  return `\x1b[${prefix};5;${colorCode}m`;
};

/**
 * Reset all color attributes
 */
export const resetColor = '\x1b[0m';

/**
 * Detect terminal color support
 */
export const detectColorSupport = (): 'truecolor' | '256' | '16' | 'none' => {
  const env = process.env;

  // Check for NO_COLOR standard
  if (env.NO_COLOR !== undefined) return 'none';

  // Check for COLORTERM (truecolor support)
  if (env.COLORTERM === 'truecolor' || env.COLORTERM === '24bit') return 'truecolor';

  // Check for 256 color support
  if (env.TERM?.includes('256color')) return '256';

  // Check for basic color support
  if (env.TERM && !env.TERM.includes('dumb')) return '16';

  return 'none';
};

export default colors;
