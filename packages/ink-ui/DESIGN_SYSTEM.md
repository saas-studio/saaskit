# React Ink Design System for SaaS Terminal UIs

A comprehensive design system for building production-quality SaaS application interfaces in the terminal using React Ink.

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography & Spacing](#typography--spacing)
4. [Design Primitives](#design-primitives)
5. [Animation Patterns](#animation-patterns)
6. [Screen Patterns](#screen-patterns)
7. [Example Mockups](#example-mockups)

---

## Design Philosophy

Terminal UIs have unique constraints and advantages:

- **Constraint**: Limited to character grid, no anti-aliasing
- **Advantage**: Instant rendering, zero network latency for local apps
- **Constraint**: Color palette depends on terminal capabilities
- **Advantage**: Keyboard-first interaction is faster for power users

### Core Principles

1. **Information Density** - Terminals excel at dense data display
2. **Keyboard Navigation** - Every action should be keyboard-accessible
3. **Progressive Enhancement** - Gracefully degrade from truecolor → 256 → 16 colors
4. **Consistent Feedback** - Every interaction needs visual confirmation
5. **Respectful Animation** - Animate to inform, not to decorate

---

## Color System

### Primary Palette (Truecolor RGB)

```typescript
export const colors = {
  // Brand Colors
  primary: {
    50:  '#E8F4FD',
    100: '#C5E4FA',
    200: '#9ED2F6',
    300: '#77C0F2',
    400: '#50AEEE',
    500: '#2196F3',  // Primary action color
    600: '#1A78C2',
    700: '#145A91',
    800: '#0D3C61',
    900: '#071E30',
  },

  // Secondary - Purple for premium/pro features
  secondary: {
    50:  '#F3E5F5',
    100: '#E1BEE7',
    200: '#CE93D8',
    300: '#BA68C8',
    400: '#AB47BC',
    500: '#9C27B0',  // Secondary actions
    600: '#7B1FA2',
    700: '#6A1B9A',
    800: '#4A148C',
    900: '#2C0A52',
  },

  // Accent - Cyan for highlights and links
  accent: {
    50:  '#E0F7FA',
    100: '#B2EBF2',
    200: '#80DEEA',
    300: '#4DD0E1',
    400: '#26C6DA',
    500: '#00BCD4',  // Links, highlights
    600: '#00ACC1',
    700: '#0097A7',
    800: '#00838F',
    900: '#006064',
  },

  // Semantic Colors
  success: {
    light: '#81C784',
    main:  '#4CAF50',
    dark:  '#388E3C',
  },

  warning: {
    light: '#FFD54F',
    main:  '#FFC107',
    dark:  '#FFA000',
  },

  error: {
    light: '#E57373',
    main:  '#F44336',
    dark:  '#D32F2F',
  },

  info: {
    light: '#64B5F6',
    main:  '#2196F3',
    dark:  '#1976D2',
  },

  // Neutrals (for dark terminal backgrounds)
  neutral: {
    0:   '#000000',
    50:  '#0D1117',  // Deep background
    100: '#161B22',  // Card background
    200: '#21262D',  // Elevated surface
    300: '#30363D',  // Borders
    400: '#484F58',  // Disabled text
    500: '#6E7681',  // Placeholder text
    600: '#8B949E',  // Secondary text
    700: '#C9D1D9',  // Primary text
    800: '#E6EDF3',  // Emphasized text
    900: '#FFFFFF',
  },
} as const;
```

### 256-Color Fallback Mapping

```typescript
export const colors256 = {
  primary:   33,   // Blue
  secondary: 128,  // Purple
  accent:    37,   // Cyan
  success:   34,   // Green
  warning:   220,  // Yellow
  error:     196,  // Red
  info:      39,   // Light blue

  bg: {
    base:     234,  // #1c1c1c
    card:     235,  // #262626
    elevated: 236,  // #303030
  },

  text: {
    primary:   252,  // #d0d0d0
    secondary: 245,  // #8a8a8a
    muted:     240,  // #585858
  },

  border: 238,  // #444444
};
```

### 16-Color Fallback

```typescript
export const colors16 = {
  primary:   'blue',
  secondary: 'magenta',
  accent:    'cyan',
  success:   'green',
  warning:   'yellow',
  error:     'red',
  info:      'blueBright',

  text: {
    primary:   'white',
    secondary: 'gray',
    muted:     'blackBright',
  },
};
```

### Interactive State Colors

```typescript
export const interactiveStates = {
  // Buttons
  button: {
    default:  colors.primary[500],
    hover:    colors.primary[400],
    active:   colors.primary[600],
    disabled: colors.neutral[400],
  },

  // Input fields
  input: {
    default:  colors.neutral[300],
    focus:    colors.primary[500],
    error:    colors.error.main,
    success:  colors.success.main,
  },

  // Table rows
  table: {
    default:    'transparent',
    hover:      colors.neutral[200],
    selected:   colors.primary[900],
    alternate:  colors.neutral[100],
  },

  // Links
  link: {
    default:  colors.accent[500],
    hover:    colors.accent[300],
    visited:  colors.secondary[400],
  },
};
```

---

## Typography & Spacing

### Box Drawing Characters

```typescript
export const box = {
  // Single line
  single: {
    topLeft:     '┌',
    topRight:    '┐',
    bottomLeft:  '└',
    bottomRight: '┘',
    horizontal:  '─',
    vertical:    '│',
    cross:       '┼',
    teeDown:     '┬',
    teeUp:       '┴',
    teeRight:    '├',
    teeLeft:     '┤',
  },

  // Double line
  double: {
    topLeft:     '╔',
    topRight:    '╗',
    bottomLeft:  '╚',
    bottomRight: '╝',
    horizontal:  '═',
    vertical:    '║',
  },

  // Rounded
  rounded: {
    topLeft:     '╭',
    topRight:    '╮',
    bottomLeft:  '╰',
    bottomRight: '╯',
    horizontal:  '─',
    vertical:    '│',
  },

  // Heavy
  heavy: {
    topLeft:     '┏',
    topRight:    '┓',
    bottomLeft:  '┗',
    bottomRight: '┛',
    horizontal:  '━',
    vertical:    '┃',
  },
};
```

### Block Elements & Progress

```typescript
export const blocks = {
  // Vertical fill (for progress bars)
  vertical: ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'],

  // Horizontal fill
  horizontal: ['▏', '▎', '▍', '▌', '▋', '▊', '▉', '█'],

  // Shades
  shades: ['░', '▒', '▓', '█'],

  // Braille for sparklines
  braille: {
    dots: ['⠀', '⠁', '⠂', '⠃', '⠄', '⠅', '⠆', '⠇', '⡀', '⡁', '⡂', '⡃', '⡄', '⡅', '⡆', '⡇',
           '⠈', '⠉', '⠊', '⠋', '⠌', '⠍', '⠎', '⠏', '⡈', '⡉', '⡊', '⡋', '⡌', '⡍', '⡎', '⡏',
           '⠐', '⠑', '⠒', '⠓', '⠔', '⠕', '⠖', '⠗', '⡐', '⡑', '⡒', '⡓', '⡔', '⡕', '⡖', '⡗',
           '⠘', '⠙', '⠚', '⠛', '⠜', '⠝', '⠞', '⠟', '⡘', '⡙', '⡚', '⡛', '⡜', '⡝', '⡞', '⡟',
           '⠠', '⠡', '⠢', '⠣', '⠤', '⠥', '⠦', '⠧', '⡠', '⡡', '⡢', '⡣', '⡤', '⡥', '⡦', '⡧',
           '⠨', '⠩', '⠪', '⠫', '⠬', '⠭', '⠮', '⠯', '⡨', '⡩', '⡪', '⡫', '⡬', '⡭', '⡮', '⡯',
           '⠰', '⠱', '⠲', '⠳', '⠴', '⠵', '⠶', '⠷', '⡰', '⡱', '⡲', '⡳', '⡴', '⡵', '⡶', '⡷',
           '⠸', '⠹', '⠺', '⠻', '⠼', '⠽', '⠾', '⠿', '⡸', '⡹', '⡺', '⡻', '⡼', '⡽', '⡾', '⡿'],
  },
};
```

### Icons & Symbols

```typescript
export const icons = {
  // Status
  success:    '✓',
  error:      '✗',
  warning:    '⚠',
  info:       'ℹ',
  question:   '?',

  // Arrows
  arrowRight: '→',
  arrowLeft:  '←',
  arrowUp:    '↑',
  arrowDown:  '↓',
  chevronRight: '›',
  chevronLeft:  '‹',
  chevronUp:    '˄',
  chevronDown:  '˅',

  // UI
  bullet:     '•',
  star:       '★',
  starEmpty:  '☆',
  heart:      '♥',
  folder:     '📁',
  file:       '📄',
  gear:       '⚙',
  lock:       '🔒',
  unlock:     '🔓',
  user:       '👤',

  // Selection
  radioOn:    '◉',
  radioOff:   '○',
  checkboxOn: '☑',
  checkboxOff:'☐',

  // Progress
  spinner: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],

  // Misc
  ellipsis:   '…',
  middleDot:  '·',
  pipe:       '│',
};
```

### Spacing Scale

```typescript
export const spacing = {
  0: 0,
  1: 1,   // Tight
  2: 2,   // Default
  3: 3,   // Comfortable
  4: 4,   // Spacious
  6: 6,   // Section gap
  8: 8,   // Large gap
};
```

---

## Design Primitives

### Box Component

```tsx
import React from 'react';
import { Box, Text } from 'ink';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  width?: number | string;
  padding?: number;
}

const borderColors = {
  default: '#30363D',
  primary: '#2196F3',
  success: '#4CAF50',
  warning: '#FFC107',
  error:   '#F44336',
};

export const Card: React.FC<CardProps> = ({
  title,
  children,
  variant = 'default',
  width = 40,
  padding = 1,
}) => (
  <Box
    flexDirection="column"
    borderStyle="round"
    borderColor={borderColors[variant]}
    width={width}
    paddingX={padding}
    paddingY={padding > 0 ? Math.ceil(padding / 2) : 0}
  >
    {title && (
      <Box marginBottom={1}>
        <Text bold color={borderColors[variant]}>{title}</Text>
      </Box>
    )}
    {children}
  </Box>
);

// Usage:
// <Card title="System Status" variant="success">
//   <Text>All systems operational</Text>
// </Card>
```

**Visual Output:**
```
╭─ System Status ─────────────────────╮
│                                     │
│  All systems operational            │
│                                     │
╰─────────────────────────────────────╯
```

### Button Component

```tsx
import React, { useState } from 'react';
import { Box, Text, useFocus } from 'ink';

interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  onPress?: () => void;
}

const buttonStyles = {
  primary: {
    bg: '#2196F3',
    bgHover: '#42A5F5',
    bgActive: '#1976D2',
    fg: '#FFFFFF',
  },
  secondary: {
    bg: '#21262D',
    bgHover: '#30363D',
    bgActive: '#161B22',
    fg: '#C9D1D9',
  },
  danger: {
    bg: '#D32F2F',
    bgHover: '#E57373',
    bgActive: '#B71C1C',
    fg: '#FFFFFF',
  },
  ghost: {
    bg: 'transparent',
    bgHover: '#21262D',
    bgActive: '#30363D',
    fg: '#C9D1D9',
  },
};

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  disabled = false,
  onPress,
}) => {
  const { isFocused } = useFocus();
  const style = buttonStyles[variant];

  const bgColor = disabled
    ? '#484F58'
    : isFocused
      ? style.bgHover
      : style.bg;

  return (
    <Box
      paddingX={2}
      paddingY={0}
      backgroundColor={bgColor}
    >
      <Text
        color={disabled ? '#6E7681' : style.fg}
        bold={isFocused}
      >
        {isFocused ? `› ${label} ‹` : `  ${label}  `}
      </Text>
    </Box>
  );
};

// Usage with keyboard handling:
// <Button label="Submit" variant="primary" onPress={handleSubmit} />
```

**Visual Output:**
```
Normal:     ┌────────────┐
            │  Submit    │  (Blue background)
            └────────────┘

Focused:    ┌────────────┐
            │ › Submit ‹ │  (Lighter blue, bold)
            └────────────┘
```

### Input Field Component

```tsx
import React from 'react';
import { Box, Text, useFocus, useInput } from 'ink';

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  success?: boolean;
  width?: number;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  placeholder = '',
  error,
  success,
  width = 30,
}) => {
  const { isFocused } = useFocus();

  // Determine border color based on state
  const borderColor = error
    ? '#F44336'
    : success
      ? '#4CAF50'
      : isFocused
        ? '#2196F3'
        : '#30363D';

  const displayValue = value || (isFocused ? '' : placeholder);
  const textColor = value ? '#C9D1D9' : '#6E7681';

  useInput((input, key) => {
    if (!isFocused) return;

    if (key.backspace || key.delete) {
      onChange(value.slice(0, -1));
    } else if (!key.ctrl && !key.meta && input) {
      onChange(value + input);
    }
  });

  return (
    <Box flexDirection="column">
      <Text color="#8B949E" dimColor={!isFocused}>
        {label}
      </Text>
      <Box
        borderStyle="single"
        borderColor={borderColor}
        width={width}
        paddingX={1}
      >
        <Text color={textColor}>
          {displayValue}
          {isFocused && <Text color="#2196F3">▋</Text>}
        </Text>
      </Box>
      {error && (
        <Text color="#F44336">
          {icons.error} {error}
        </Text>
      )}
    </Box>
  );
};
```

**Visual Output:**
```
Default:
  Email
  ┌────────────────────────────┐
  │ placeholder@example.com   │
  └────────────────────────────┘

Focused:
  Email
  ┌────────────────────────────┐  (Blue border)
  │ user@exam▋                 │
  └────────────────────────────┘

Error:
  Email
  ┌────────────────────────────┐  (Red border)
  │ invalid-email              │
  └────────────────────────────┘
  ✗ Please enter a valid email
```

### Status Badge Component

```tsx
import React from 'react';
import { Box, Text } from 'ink';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'pro';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  dot?: boolean;
}

const badgeStyles: Record<BadgeVariant, { bg: string; fg: string; dot: string }> = {
  success: { bg: '#1B4332', fg: '#81C784', dot: '#4CAF50' },
  warning: { bg: '#3D2E0A', fg: '#FFD54F', dot: '#FFC107' },
  error:   { bg: '#3D1212', fg: '#E57373', dot: '#F44336' },
  info:    { bg: '#0D2744', fg: '#64B5F6', dot: '#2196F3' },
  neutral: { bg: '#21262D', fg: '#8B949E', dot: '#6E7681' },
  pro:     { bg: '#2A1B3D', fg: '#BA68C8', dot: '#9C27B0' },
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  dot = false,
}) => {
  const style = badgeStyles[variant];

  return (
    <Box backgroundColor={style.bg} paddingX={1}>
      {dot && <Text color={style.dot}>● </Text>}
      <Text color={style.fg} bold>
        {label}
      </Text>
    </Box>
  );
};

// Usage:
// <Badge label="Active" variant="success" dot />
// <Badge label="PRO" variant="pro" />
```

**Visual Output:**
```
● Active    (Green dot, green text, dark green bg)
● Warning   (Yellow dot, yellow text, dark yellow bg)
● Error     (Red dot, red text, dark red bg)
  PRO       (Purple text, dark purple bg)
```

### Table Component

```tsx
import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface Column<T> {
  key: keyof T;
  header: string;
  width: number;
  align?: 'left' | 'center' | 'right';
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  selectable?: boolean;
  onSelect?: (row: T, index: number) => void;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  selectable = false,
  onSelect,
}: TableProps<T>) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(-1);

  useInput((input, key) => {
    if (!selectable) return;

    if (key.upArrow) {
      setSelectedIndex(Math.max(0, selectedIndex - 1));
    } else if (key.downArrow) {
      setSelectedIndex(Math.min(data.length - 1, selectedIndex + 1));
    } else if (key.return) {
      onSelect?.(data[selectedIndex], selectedIndex);
    }
  });

  const totalWidth = columns.reduce((sum, col) => sum + col.width + 3, 0);

  // Render header
  const renderHeader = () => (
    <Box borderStyle="single" borderBottom={false} borderLeft={false} borderRight={false}>
      {columns.map((col, i) => (
        <Box key={String(col.key)} width={col.width + 3} paddingX={1}>
          <Text bold color="#8B949E">
            {col.header.padEnd(col.width)}
          </Text>
        </Box>
      ))}
    </Box>
  );

  // Render row
  const renderRow = (row: T, index: number) => {
    const isSelected = selectable && index === selectedIndex;
    const isAlternate = index % 2 === 1;

    const bgColor = isSelected
      ? '#0D3C61'
      : isAlternate
        ? '#161B22'
        : undefined;

    return (
      <Box
        key={index}
        backgroundColor={bgColor}
      >
        {selectable && (
          <Text color={isSelected ? '#2196F3' : '#30363D'}>
            {isSelected ? '▸ ' : '  '}
          </Text>
        )}
        {columns.map((col) => (
          <Box key={String(col.key)} width={col.width + 1} paddingX={1}>
            <Text color={isSelected ? '#E6EDF3' : '#C9D1D9'}>
              {col.render
                ? col.render(row[col.key], row)
                : String(row[col.key]).slice(0, col.width).padEnd(col.width)}
            </Text>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box flexDirection="column">
      {renderHeader()}
      <Box flexDirection="column" borderStyle="single" borderTop={false}>
        {data.map(renderRow)}
      </Box>
    </Box>
  );
}
```

**Visual Output:**
```
  NAME              STATUS      PLAN        MRR
─────────────────────────────────────────────────────
▸ Acme Corp        ● Active    Enterprise  $2,400
  TechStart Inc    ● Active    Pro         $99
  DataFlow LLC     ● Trial     Pro         $0
  CloudNine        ○ Churned   Starter     $0
  Quantum Labs     ● Active    Enterprise  $4,800
```

### Progress Bar Component

```tsx
import React from 'react';
import { Box, Text } from 'ink';

interface ProgressBarProps {
  value: number;      // 0-100
  width?: number;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
  animated?: boolean;
}

const progressColors = {
  default: '#2196F3',
  success: '#4CAF50',
  warning: '#FFC107',
  error:   '#F44336',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  width = 30,
  showPercentage = true,
  variant = 'default',
  animated = false,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const filledWidth = Math.round((clampedValue / 100) * width);
  const emptyWidth = width - filledWidth;

  const filled = '█'.repeat(filledWidth);
  const empty = '░'.repeat(emptyWidth);

  return (
    <Box>
      <Text color={progressColors[variant]}>{filled}</Text>
      <Text color="#30363D">{empty}</Text>
      {showPercentage && (
        <Text color="#8B949E"> {clampedValue.toString().padStart(3)}%</Text>
      )}
    </Box>
  );
};

// Animated version using hooks:
export const AnimatedProgressBar: React.FC<{ targetValue: number }> = ({
  targetValue,
}) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentValue((prev) => {
        if (prev >= targetValue) {
          clearInterval(interval);
          return targetValue;
        }
        return prev + 1;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [targetValue]);

  return <ProgressBar value={currentValue} />;
};
```

**Visual Output:**
```
Progress states:
  0%:   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0%
 25%:   ████████░░░░░░░░░░░░░░░░░░░░░░  25%
 50%:   ███████████████░░░░░░░░░░░░░░░  50%
 75%:   ██████████████████████░░░░░░░░  75%
100%:   ██████████████████████████████ 100%

Variants:
  Success: ██████████████░░░░░░░░░░░░░░░░  47% (Green)
  Warning: ██████████████████████░░░░░░░░  73% (Yellow)
  Error:   ████████████████████████████░░  93% (Red)
```

### Spinner Component

```tsx
import React, { useState, useEffect } from 'react';
import { Text } from 'ink';

type SpinnerType = 'dots' | 'line' | 'arc' | 'pulse' | 'bounce';

interface SpinnerProps {
  type?: SpinnerType;
  color?: string;
  label?: string;
}

const spinnerFrames: Record<SpinnerType, { frames: string[]; interval: number }> = {
  dots: {
    frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
    interval: 80,
  },
  line: {
    frames: ['-', '\\', '|', '/'],
    interval: 100,
  },
  arc: {
    frames: ['◜', '◠', '◝', '◞', '◡', '◟'],
    interval: 100,
  },
  pulse: {
    frames: ['█', '▓', '▒', '░', '▒', '▓'],
    interval: 120,
  },
  bounce: {
    frames: ['⠁', '⠂', '⠄', '⠂'],
    interval: 120,
  },
};

export const Spinner: React.FC<SpinnerProps> = ({
  type = 'dots',
  color = '#2196F3',
  label,
}) => {
  const [frameIndex, setFrameIndex] = useState(0);
  const spinner = spinnerFrames[type];

  useEffect(() => {
    const timer = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % spinner.frames.length);
    }, spinner.interval);

    return () => clearInterval(timer);
  }, [type]);

  return (
    <Text>
      <Text color={color}>{spinner.frames[frameIndex]}</Text>
      {label && <Text color="#8B949E"> {label}</Text>}
    </Text>
  );
};
```

### Sparkline Component

```tsx
import React from 'react';
import { Text } from 'ink';

interface SparklineProps {
  data: number[];
  width?: number;
  color?: string;
  min?: number;
  max?: number;
}

const sparkChars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width,
  color = '#4CAF50',
  min: propMin,
  max: propMax,
}) => {
  if (data.length === 0) return null;

  const displayData = width && width < data.length
    ? data.slice(-width)
    : data;

  const min = propMin ?? Math.min(...displayData);
  const max = propMax ?? Math.max(...displayData);
  const range = max - min || 1;

  const spark = displayData.map((value) => {
    const normalized = (value - min) / range;
    const index = Math.min(
      Math.floor(normalized * sparkChars.length),
      sparkChars.length - 1
    );
    return sparkChars[index];
  }).join('');

  return <Text color={color}>{spark}</Text>;
};

// Usage:
// <Sparkline data={[1, 5, 3, 9, 2, 7, 4, 8, 6]} color="#4CAF50" />
```

**Visual Output:**
```
Revenue trend:  ▂▅▃█▁▆▄▇▅  $24.5K (+12%)
Users trend:    ▁▂▃▄▅▆▇█▇  1,234 (+8%)
Errors trend:   ▅▃▁▁▂▁▁▁▁  23 (-45%)
```

---

## Animation Patterns

### Fade Transition

```tsx
import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';

interface FadeProps {
  visible: boolean;
  children: React.ReactNode;
  duration?: number;
}

export const Fade: React.FC<FadeProps> = ({
  visible,
  children,
  duration = 300,
}) => {
  const [opacity, setOpacity] = useState(visible ? 1 : 0);
  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      // Fade in with steps
      const steps = 5;
      const stepTime = duration / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        setOpacity(currentStep / steps);
        if (currentStep >= steps) clearInterval(timer);
      }, stepTime);

      return () => clearInterval(timer);
    } else {
      // Fade out
      const steps = 5;
      const stepTime = duration / steps;
      let currentStep = steps;

      const timer = setInterval(() => {
        currentStep--;
        setOpacity(currentStep / steps);
        if (currentStep <= 0) {
          clearInterval(timer);
          setShouldRender(false);
        }
      }, stepTime);

      return () => clearInterval(timer);
    }
  }, [visible, duration]);

  if (!shouldRender) return null;

  // Simulate opacity with dim
  return (
    <Text dimColor={opacity < 0.5}>
      {children}
    </Text>
  );
};
```

### Slide Transition

```tsx
import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';

interface SlideProps {
  direction: 'left' | 'right';
  visible: boolean;
  width: number;
  children: React.ReactNode;
}

export const Slide: React.FC<SlideProps> = ({
  direction,
  visible,
  width,
  children,
}) => {
  const [offset, setOffset] = useState(visible ? 0 : width);

  useEffect(() => {
    const targetOffset = visible ? 0 : width;
    const step = direction === 'right' ? 3 : -3;

    const timer = setInterval(() => {
      setOffset((prev) => {
        const next = visible
          ? Math.max(0, prev + step * (direction === 'right' ? -1 : 1))
          : Math.min(width, prev + step * (direction === 'right' ? 1 : -1));

        if (next === targetOffset) clearInterval(timer);
        return next;
      });
    }, 16);

    return () => clearInterval(timer);
  }, [visible, direction, width]);

  return (
    <Box marginLeft={direction === 'right' ? offset : 0}>
      {children}
    </Box>
  );
};
```

### Typewriter Effect

```tsx
import React, { useState, useEffect } from 'react';
import { Text } from 'ink';

interface TypewriterProps {
  text: string;
  speed?: number;
  cursor?: boolean;
  onComplete?: () => void;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  speed = 50,
  cursor = true,
  onComplete,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let currentIndex = 0;

    const typeTimer = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typeTimer);
        onComplete?.();
      }
    }, speed);

    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    return () => {
      clearInterval(typeTimer);
      clearInterval(cursorTimer);
    };
  }, [text, speed]);

  return (
    <Text>
      {displayedText}
      {cursor && <Text color="#2196F3">{showCursor ? '▋' : ' '}</Text>}
    </Text>
  );
};
```

### Pulse Animation

```tsx
import React, { useState, useEffect } from 'react';
import { Text } from 'ink';

interface PulseProps {
  children: React.ReactNode;
  color: string;
  interval?: number;
}

export const Pulse: React.FC<PulseProps> = ({
  children,
  color,
  interval = 1000,
}) => {
  const [intensity, setIntensity] = useState(0);

  useEffect(() => {
    let step = 0;
    const timer = setInterval(() => {
      step = (step + 1) % 10;
      // Create sine wave effect
      setIntensity(Math.sin((step / 10) * Math.PI));
    }, interval / 10);

    return () => clearInterval(timer);
  }, [interval]);

  // Interpolate between dim and bright
  const dimmed = intensity < 0.5;

  return (
    <Text color={color} bold={intensity > 0.7} dimColor={dimmed}>
      {children}
    </Text>
  );
};
```

### Loading Skeleton

```tsx
import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';

interface SkeletonProps {
  width: number;
  height?: number;
  animated?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height = 1,
  animated = true,
}) => {
  const [shimmerPos, setShimmerPos] = useState(0);

  useEffect(() => {
    if (!animated) return;

    const timer = setInterval(() => {
      setShimmerPos((prev) => (prev + 1) % (width + 10));
    }, 50);

    return () => clearInterval(timer);
  }, [animated, width]);

  const renderLine = () => {
    return Array.from({ length: width }, (_, i) => {
      const distanceFromShimmer = Math.abs(i - shimmerPos);
      const char = distanceFromShimmer < 3 ? '▓' : distanceFromShimmer < 6 ? '▒' : '░';
      return char;
    }).join('');
  };

  return (
    <Box flexDirection="column">
      {Array.from({ length: height }, (_, i) => (
        <Text key={i} color="#30363D">
          {renderLine()}
        </Text>
      ))}
    </Box>
  );
};

// Usage in a loading card:
export const SkeletonCard: React.FC = () => (
  <Box flexDirection="column" borderStyle="round" borderColor="#30363D" padding={1}>
    <Skeleton width={20} />
    <Box marginTop={1}>
      <Skeleton width={35} height={2} />
    </Box>
    <Box marginTop={1}>
      <Skeleton width={15} />
    </Box>
  </Box>
);
```

**Visual Output:**
```
╭────────────────────────────────────────╮
│  ░░░░▒▒▓▓▓▒▒░░░░░░░░░░                 │
│                                        │
│  ░░░░░░░░░░░▒▒▓▓▓▒▒░░░░░░░░░░░░░░░░░░ │
│  ░░░░░░░░░░░░░░░░░░▒▒▓▓▓▒▒░░░░░░░░░░░ │
│                                        │
│  ░░░░░░░░░▒▒▓▓▓▒▒                      │
╰────────────────────────────────────────╯
```

---

## Screen Patterns

### Dashboard Layout

```tsx
import React from 'react';
import { Box, Text } from 'ink';

interface DashboardProps {
  header: React.ReactNode;
  sidebar?: React.ReactNode;
  main: React.ReactNode;
  footer?: React.ReactNode;
}

export const Dashboard: React.FC<DashboardProps> = ({
  header,
  sidebar,
  main,
  footer,
}) => (
  <Box flexDirection="column" width="100%">
    {/* Header */}
    <Box
      borderStyle="single"
      borderBottom
      borderLeft={false}
      borderRight={false}
      borderTop={false}
      paddingX={2}
      paddingY={1}
    >
      {header}
    </Box>

    {/* Main content area */}
    <Box flexGrow={1}>
      {sidebar && (
        <Box
          width={30}
          flexDirection="column"
          borderStyle="single"
          borderLeft={false}
          borderTop={false}
          borderBottom={false}
          paddingX={1}
        >
          {sidebar}
        </Box>
      )}
      <Box flexGrow={1} flexDirection="column" paddingX={2} paddingY={1}>
        {main}
      </Box>
    </Box>

    {/* Footer */}
    {footer && (
      <Box
        borderStyle="single"
        borderTop
        borderLeft={false}
        borderRight={false}
        borderBottom={false}
        paddingX={2}
      >
        {footer}
      </Box>
    )}
  </Box>
);
```

### Modal Overlay

```tsx
import React from 'react';
import { Box, Text, useInput } from 'ink';

interface ModalProps {
  visible: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  width?: number;
  variant?: 'default' | 'danger';
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  title,
  children,
  onClose,
  width = 50,
  variant = 'default',
}) => {
  useInput((input, key) => {
    if (key.escape) onClose();
  });

  if (!visible) return null;

  const borderColor = variant === 'danger' ? '#F44336' : '#2196F3';
  const titleColor = variant === 'danger' ? '#E57373' : '#64B5F6';

  return (
    <Box
      flexDirection="column"
      position="absolute"
      marginLeft={10}
      marginTop={3}
    >
      {/* Backdrop effect (dimmed area indicator) */}
      <Box>
        <Text dimColor>{'░'.repeat(60)}</Text>
      </Box>

      {/* Modal content */}
      <Box
        flexDirection="column"
        borderStyle="double"
        borderColor={borderColor}
        width={width}
        backgroundColor="#161B22"
        paddingX={2}
        paddingY={1}
      >
        {/* Header */}
        <Box justifyContent="space-between" marginBottom={1}>
          <Text bold color={titleColor}>{title}</Text>
          <Text color="#6E7681">[ESC to close]</Text>
        </Box>

        {/* Content */}
        <Box flexDirection="column">
          {children}
        </Box>
      </Box>
    </Box>
  );
};
```

**Visual Output:**
```
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
          ╔══════════════════════════════════════════╗
          ║  Confirm Delete                [ESC to close]  ║
          ║                                          ║
          ║  Are you sure you want to delete this    ║
          ║  workspace? This action cannot be        ║
          ║  undone.                                 ║
          ║                                          ║
          ║  Workspace: "Production"                 ║
          ║  Resources: 24 items                     ║
          ║                                          ║
          ║    [ Cancel ]    [ Delete ]              ║
          ╚══════════════════════════════════════════╝
```

### Toast Notification System

```tsx
import React, { useState, useEffect } from 'react';
import { Box, Text, useApp } from 'ink';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

const toastStyles: Record<ToastType, { icon: string; color: string; bg: string }> = {
  success: { icon: '✓', color: '#81C784', bg: '#1B4332' },
  error:   { icon: '✗', color: '#E57373', bg: '#3D1212' },
  warning: { icon: '⚠', color: '#FFD54F', bg: '#3D2E0A' },
  info:    { icon: 'ℹ', color: '#64B5F6', bg: '#0D2744' },
};

export const ToastContainer: React.FC<{ toasts: Toast[]; onDismiss: (id: string) => void }> = ({
  toasts,
  onDismiss,
}) => {
  return (
    <Box
      flexDirection="column"
      position="absolute"
      marginLeft={40}
      marginTop={1}
    >
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </Box>
  );
};

const ToastItem: React.FC<{ toast: Toast; onDismiss: () => void }> = ({
  toast,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(false);
  const style = toastStyles[toast.type];

  useEffect(() => {
    // Animate in
    setVisible(true);

    // Auto dismiss
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 200);
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      marginBottom={1}
      backgroundColor={style.bg}
      paddingX={2}
      paddingY={0}
      borderStyle="round"
      borderColor={style.color}
    >
      <Text color={style.color}>
        {style.icon} {toast.message}
      </Text>
    </Box>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: ToastType, message: string, duration?: number) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    toasts,
    dismissToast,
    success: (msg: string) => addToast('success', msg),
    error: (msg: string) => addToast('error', msg),
    warning: (msg: string) => addToast('warning', msg),
    info: (msg: string) => addToast('info', msg),
  };
};
```

**Visual Output:**
```
                                        ╭─────────────────────────────────╮
                                        │ ✓ Changes saved successfully   │
                                        ╰─────────────────────────────────╯
                                        ╭─────────────────────────────────╮
                                        │ ⚠ API rate limit approaching   │
                                        ╰─────────────────────────────────╯
```

### Multi-Step Wizard

```tsx
import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface WizardStep {
  id: string;
  title: string;
  content: React.ReactNode;
  validate?: () => boolean;
}

interface WizardProps {
  steps: WizardStep[];
  onComplete: () => void;
}

export const Wizard: React.FC<WizardProps> = ({ steps, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  useInput((input, key) => {
    if (key.leftArrow && currentStep > 0) {
      setDirection('backward');
      setCurrentStep((prev) => prev - 1);
    } else if (key.rightArrow && currentStep < steps.length - 1) {
      const step = steps[currentStep];
      if (!step.validate || step.validate()) {
        setDirection('forward');
        setCurrentStep((prev) => prev + 1);
      }
    } else if (key.return && currentStep === steps.length - 1) {
      onComplete();
    }
  });

  const step = steps[currentStep];

  return (
    <Box flexDirection="column">
      {/* Progress indicator */}
      <Box marginBottom={1}>
        {steps.map((s, i) => (
          <Box key={s.id} marginRight={1}>
            <Text
              color={i === currentStep ? '#2196F3' : i < currentStep ? '#4CAF50' : '#484F58'}
              bold={i === currentStep}
            >
              {i < currentStep ? '●' : i === currentStep ? '◉' : '○'}
            </Text>
            <Text
              color={i === currentStep ? '#C9D1D9' : '#6E7681'}
              dimColor={i > currentStep}
            >
              {' '}{s.title}
            </Text>
            {i < steps.length - 1 && (
              <Text color="#30363D">{' ─── '}</Text>
            )}
          </Box>
        ))}
      </Box>

      {/* Step content */}
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="#30363D"
        padding={2}
        marginY={1}
      >
        <Text bold color="#E6EDF3" marginBottom={1}>
          {step.title}
        </Text>
        {step.content}
      </Box>

      {/* Navigation */}
      <Box justifyContent="space-between">
        <Text color={currentStep > 0 ? '#8B949E' : '#484F58'}>
          ← Previous
        </Text>
        <Text color="#8B949E">
          Step {currentStep + 1} of {steps.length}
        </Text>
        <Text color={currentStep < steps.length - 1 ? '#8B949E' : '#4CAF50'}>
          {currentStep === steps.length - 1 ? 'Complete ↵' : 'Next →'}
        </Text>
      </Box>
    </Box>
  );
};
```

**Visual Output:**
```
● Account ─── ◉ Workspace ─── ○ Billing ─── ○ Review

╭────────────────────────────────────────────────────────────╮
│  Workspace Setup                                           │
│                                                            │
│  Workspace Name                                            │
│  ┌──────────────────────────────────────┐                  │
│  │ My Production Workspace▋             │                  │
│  └──────────────────────────────────────┘                  │
│                                                            │
│  Region                                                    │
│  ◉ US East (Virginia)                                      │
│  ○ US West (Oregon)                                        │
│  ○ EU (Frankfurt)                                          │
│  ○ Asia Pacific (Singapore)                                │
│                                                            │
╰────────────────────────────────────────────────────────────╯

← Previous                    Step 2 of 4                    Next →
```

---

## Example Mockups

### 1. Analytics Dashboard

```tsx
import React, { useState, useEffect } from 'react';
import { Box, Text, render } from 'ink';

const AnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    mrr: 24567,
    users: 1234,
    conversion: 3.2,
    churn: 1.8,
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        mrr: prev.mrr + Math.floor(Math.random() * 100 - 50),
        users: prev.users + Math.floor(Math.random() * 10 - 5),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box justifyContent="space-between" marginBottom={1}>
        <Text bold color="#E6EDF3">
          📊 Analytics Dashboard
        </Text>
        <Text color="#6E7681">
          Last updated: {new Date().toLocaleTimeString()}
        </Text>
      </Box>

      {/* Metric Cards */}
      <Box marginBottom={1}>
        <MetricCard
          title="Monthly Revenue"
          value={`$${metrics.mrr.toLocaleString()}`}
          change={+12.5}
          sparkData={[18, 22, 19, 25, 21, 28, 24, 30, 26, 32]}
          color="#4CAF50"
        />
        <MetricCard
          title="Active Users"
          value={metrics.users.toLocaleString()}
          change={+8.2}
          sparkData={[100, 120, 115, 140, 135, 150, 145, 160, 155, 170]}
          color="#2196F3"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${metrics.conversion}%`}
          change={+0.3}
          sparkData={[2.8, 2.9, 3.0, 2.9, 3.1, 3.0, 3.2, 3.1, 3.2, 3.2]}
          color="#9C27B0"
        />
        <MetricCard
          title="Churn Rate"
          value={`${metrics.churn}%`}
          change={-0.2}
          sparkData={[2.2, 2.1, 2.0, 2.1, 1.9, 2.0, 1.9, 1.8, 1.9, 1.8]}
          color="#F44336"
          invertColor
        />
      </Box>

      {/* Chart Area */}
      <Box flexDirection="column" borderStyle="round" borderColor="#30363D" padding={1}>
        <Text bold color="#8B949E" marginBottom={1}>Revenue Trend (Last 30 Days)</Text>
        <BarChart
          data={[45, 52, 49, 58, 55, 62, 59, 68, 65, 72, 69, 75, 72, 78, 76]}
          height={6}
          color="#4CAF50"
        />
      </Box>

      {/* Footer */}
      <Box marginTop={1}>
        <Text color="#484F58">
          Press 'r' to refresh • 'q' to quit • '?' for help
        </Text>
      </Box>
    </Box>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  sparkData: number[];
  color: string;
  invertColor?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  sparkData,
  color,
  invertColor = false,
}) => {
  const changeColor = invertColor
    ? change < 0 ? '#4CAF50' : '#F44336'
    : change > 0 ? '#4CAF50' : '#F44336';
  const changeIcon = change > 0 ? '↑' : '↓';

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={color}
      width={22}
      padding={1}
      marginRight={1}
    >
      <Text color="#8B949E" dimColor>{title}</Text>
      <Text bold color="#E6EDF3">{value}</Text>
      <Box>
        <Sparkline data={sparkData} color={color} width={12} />
        <Text color={changeColor}>
          {' '}{changeIcon}{Math.abs(change)}%
        </Text>
      </Box>
    </Box>
  );
};

const BarChart: React.FC<{ data: number[]; height: number; color: string }> = ({
  data,
  height,
  color,
}) => {
  const max = Math.max(...data);
  const chars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

  return (
    <Box>
      {data.map((value, i) => {
        const normalized = value / max;
        const barHeight = Math.ceil(normalized * height);
        const charIndex = Math.min(Math.floor(normalized * 8), 7);

        return (
          <Box key={i} flexDirection="column" marginRight={1}>
            {Array.from({ length: height }, (_, row) => {
              const rowFromBottom = height - row;
              const filled = rowFromBottom <= barHeight;
              return (
                <Text key={row} color={filled ? color : '#21262D'}>
                  {filled ? '█' : '░'}
                </Text>
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
};
```

**Visual Output:**
```
📊 Analytics Dashboard                           Last updated: 2:34:56 PM

╭─ Monthly Revenue ────╮ ╭─ Active Users ───────╮ ╭─ Conversion Rate ────╮ ╭─ Churn Rate ─────────╮
│  Monthly Revenue     │ │  Active Users        │ │  Conversion Rate     │ │  Churn Rate          │
│  $24,567             │ │  1,234               │ │  3.2%                │ │  1.8%                │
│  ▂▃▂▄▃▅▄▆▅▇ ↑12.5%   │ │  ▁▂▂▃▃▄▄▅▅▆ ↑8.2%    │ │  ▄▅▅▅▆▅▇▆▇▇ ↑0.3%    │ │  ▆▅▄▅▃▄▃▂▃▂ ↓0.2%    │
╰──────────────────────╯ ╰──────────────────────╯ ╰──────────────────────╯ ╰──────────────────────╯

╭─ Revenue Trend (Last 30 Days) ─────────────────────────────────────────────────────────────────╮
│                                                                                                │
│  █                       █                                                                     │
│  █ █   █           █ █   █ █       █                                                           │
│  █ █ █ █ █     █ █ █ █ █ █ █ █ █   █ █                                                         │
│  █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █                                                       │
│  █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █                                   │
│  ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░                                   │
│                                                                                                │
╰────────────────────────────────────────────────────────────────────────────────────────────────╯

Press 'r' to refresh • 'q' to quit • '?' for help
```

### 2. Interactive Data Table with Filtering

```tsx
import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';

interface Customer {
  id: string;
  name: string;
  email: string;
  plan: 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'trial' | 'churned';
  mrr: number;
}

const customers: Customer[] = [
  { id: '1', name: 'Acme Corp', email: 'admin@acme.com', plan: 'enterprise', status: 'active', mrr: 2400 },
  { id: '2', name: 'TechStart Inc', email: 'hello@techstart.io', plan: 'pro', status: 'active', mrr: 99 },
  { id: '3', name: 'DataFlow LLC', email: 'ops@dataflow.dev', plan: 'pro', status: 'trial', mrr: 0 },
  { id: '4', name: 'CloudNine', email: 'support@cloudnine.co', plan: 'starter', status: 'churned', mrr: 0 },
  { id: '5', name: 'Quantum Labs', email: 'info@quantum.tech', plan: 'enterprise', status: 'active', mrr: 4800 },
  { id: '6', name: 'InnovateTech', email: 'team@innovate.io', plan: 'pro', status: 'active', mrr: 99 },
  { id: '7', name: 'StartupXYZ', email: 'founders@xyz.com', plan: 'starter', status: 'trial', mrr: 0 },
];

const CustomerTable: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filter, setFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<keyof Customer>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<Customer['status'] | 'all'>('all');

  const filteredData = useMemo(() => {
    let result = [...customers];

    // Text filter
    if (filter) {
      result = result.filter(c =>
        c.name.toLowerCase().includes(filter.toLowerCase()) ||
        c.email.toLowerCase().includes(filter.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [filter, statusFilter, sortBy, sortDir]);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex(Math.max(0, selectedIndex - 1));
    } else if (key.downArrow) {
      setSelectedIndex(Math.min(filteredData.length - 1, selectedIndex + 1));
    } else if (input === '1') setStatusFilter('all');
    else if (input === '2') setStatusFilter('active');
    else if (input === '3') setStatusFilter('trial');
    else if (input === '4') setStatusFilter('churned');
    else if (input === 's') {
      setSortBy('name');
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    }
  });

  const planBadge = (plan: Customer['plan']) => {
    const colors = {
      starter: { bg: '#21262D', fg: '#8B949E' },
      pro: { bg: '#2A1B3D', fg: '#BA68C8' },
      enterprise: { bg: '#0D2744', fg: '#64B5F6' },
    };
    return (
      <Box backgroundColor={colors[plan].bg} paddingX={1}>
        <Text color={colors[plan].fg}>{plan.toUpperCase()}</Text>
      </Box>
    );
  };

  const statusBadge = (status: Customer['status']) => {
    const styles = {
      active: { dot: '#4CAF50', text: 'Active' },
      trial: { dot: '#FFC107', text: 'Trial' },
      churned: { dot: '#F44336', text: 'Churned' },
    };
    return (
      <Text>
        <Text color={styles[status].dot}>● </Text>
        <Text color="#C9D1D9">{styles[status].text}</Text>
      </Text>
    );
  };

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box justifyContent="space-between" marginBottom={1}>
        <Text bold color="#E6EDF3">👥 Customers</Text>
        <Text color="#6E7681">
          {filteredData.length} of {customers.length} customers
        </Text>
      </Box>

      {/* Filter bar */}
      <Box marginBottom={1}>
        <Box marginRight={2}>
          <Text color="#8B949E">Filter: </Text>
          <Text
            color={statusFilter === 'all' ? '#2196F3' : '#6E7681'}
            bold={statusFilter === 'all'}
          >
            [1] All
          </Text>
          <Text> </Text>
          <Text
            color={statusFilter === 'active' ? '#4CAF50' : '#6E7681'}
            bold={statusFilter === 'active'}
          >
            [2] Active
          </Text>
          <Text> </Text>
          <Text
            color={statusFilter === 'trial' ? '#FFC107' : '#6E7681'}
            bold={statusFilter === 'trial'}
          >
            [3] Trial
          </Text>
          <Text> </Text>
          <Text
            color={statusFilter === 'churned' ? '#F44336' : '#6E7681'}
            bold={statusFilter === 'churned'}
          >
            [4] Churned
          </Text>
        </Box>
      </Box>

      {/* Table Header */}
      <Box borderStyle="single" borderBottom borderLeft={false} borderRight={false} borderTop={false}>
        <Box width={3}><Text color="#6E7681">  </Text></Box>
        <Box width={18}><Text bold color="#8B949E">NAME</Text></Box>
        <Box width={26}><Text bold color="#8B949E">EMAIL</Text></Box>
        <Box width={12}><Text bold color="#8B949E">PLAN</Text></Box>
        <Box width={12}><Text bold color="#8B949E">STATUS</Text></Box>
        <Box width={10}><Text bold color="#8B949E">MRR</Text></Box>
      </Box>

      {/* Table Rows */}
      {filteredData.map((customer, index) => {
        const isSelected = index === selectedIndex;
        const bgColor = isSelected ? '#0D3C61' : index % 2 === 1 ? '#161B22' : undefined;

        return (
          <Box
            key={customer.id}
            backgroundColor={bgColor}
          >
            <Box width={3}>
              <Text color={isSelected ? '#2196F3' : '#30363D'}>
                {isSelected ? '▸ ' : '  '}
              </Text>
            </Box>
            <Box width={18}>
              <Text color={isSelected ? '#E6EDF3' : '#C9D1D9'}>
                {customer.name.slice(0, 16)}
              </Text>
            </Box>
            <Box width={26}>
              <Text color={isSelected ? '#8B949E' : '#6E7681'}>
                {customer.email.slice(0, 24)}
              </Text>
            </Box>
            <Box width={12}>{planBadge(customer.plan)}</Box>
            <Box width={12}>{statusBadge(customer.status)}</Box>
            <Box width={10}>
              <Text color={customer.mrr > 0 ? '#4CAF50' : '#484F58'}>
                ${customer.mrr.toLocaleString()}
              </Text>
            </Box>
          </Box>
        );
      })}

      {/* Footer */}
      <Box marginTop={1} borderStyle="single" borderTop borderLeft={false} borderRight={false} borderBottom={false} paddingTop={1}>
        <Text color="#484F58">
          ↑↓ Navigate • Enter to select • 's' to sort • '/' to search
        </Text>
      </Box>
    </Box>
  );
};
```

**Visual Output:**
```
👥 Customers                                                    5 of 7 customers

Filter: [1] All  [2] Active  [3] Trial  [4] Churned

   NAME              EMAIL                     PLAN        STATUS      MRR
─────────────────────────────────────────────────────────────────────────────────
▸  Acme Corp         admin@acme.com            ENTERPRISE  ● Active    $2,400
   TechStart Inc     hello@techstart.io        PRO         ● Active    $99
   DataFlow LLC      ops@dataflow.dev          PRO         ● Trial     $0
   CloudNine         support@cloudnine.co      STARTER     ● Churned   $0
   Quantum Labs      info@quantum.tech         ENTERPRISE  ● Active    $4,800

─────────────────────────────────────────────────────────────────────────────────
↑↓ Navigate • Enter to select • 's' to sort • '/' to search
```

### 3. Form with Real-Time Validation

```tsx
import React, { useState } from 'react';
import { Box, Text, useInput, useFocus } from 'ink';

interface FormField {
  name: string;
  label: string;
  value: string;
  type: 'text' | 'email' | 'password' | 'select';
  options?: string[];
  required?: boolean;
  validate?: (value: string) => string | null;
}

const CreateWorkspaceForm: React.FC = () => {
  const [fields, setFields] = useState<FormField[]>([
    {
      name: 'name',
      label: 'Workspace Name',
      value: '',
      type: 'text',
      required: true,
      validate: (v) => v.length < 3 ? 'Name must be at least 3 characters' : null,
    },
    {
      name: 'slug',
      label: 'URL Slug',
      value: '',
      type: 'text',
      required: true,
      validate: (v) => /^[a-z0-9-]+$/.test(v) ? null : 'Only lowercase letters, numbers, and dashes',
    },
    {
      name: 'email',
      label: 'Admin Email',
      value: '',
      type: 'email',
      required: true,
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Invalid email address',
    },
    {
      name: 'region',
      label: 'Region',
      value: 'us-east',
      type: 'select',
      options: ['us-east', 'us-west', 'eu-west', 'ap-southeast'],
    },
    {
      name: 'plan',
      label: 'Plan',
      value: 'pro',
      type: 'select',
      options: ['starter', 'pro', 'enterprise'],
    },
  ]);

  const [focusedIndex, setFocusedIndex] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: FormField): string | null => {
    if (field.required && !field.value) {
      return `${field.label} is required`;
    }
    return field.validate?.(field.value) || null;
  };

  const updateField = (index: number, value: string) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], value };
    setFields(newFields);

    // Validate
    const error = validateField(newFields[index]);
    setErrors((prev) => ({
      ...prev,
      [newFields[index].name]: error || '',
    }));
  };

  useInput((input, key) => {
    const field = fields[focusedIndex];

    if (key.upArrow) {
      setFocusedIndex(Math.max(0, focusedIndex - 1));
    } else if (key.downArrow || key.tab) {
      setTouched((prev) => ({ ...prev, [field.name]: true }));
      setFocusedIndex(Math.min(fields.length - 1, focusedIndex + 1));
    } else if (field.type === 'select' && (key.leftArrow || key.rightArrow)) {
      const options = field.options || [];
      const currentIndex = options.indexOf(field.value);
      const newIndex = key.rightArrow
        ? (currentIndex + 1) % options.length
        : (currentIndex - 1 + options.length) % options.length;
      updateField(focusedIndex, options[newIndex]);
    } else if (field.type !== 'select') {
      if (key.backspace || key.delete) {
        updateField(focusedIndex, field.value.slice(0, -1));
      } else if (input && !key.ctrl && !key.meta) {
        updateField(focusedIndex, field.value + input);
      }
    }
  });

  const renderField = (field: FormField, index: number) => {
    const isFocused = index === focusedIndex;
    const error = touched[field.name] ? errors[field.name] : null;
    const isValid = touched[field.name] && !error && field.value;

    const borderColor = error
      ? '#F44336'
      : isValid
        ? '#4CAF50'
        : isFocused
          ? '#2196F3'
          : '#30363D';

    const statusIcon = error ? '✗' : isValid ? '✓' : ' ';
    const statusColor = error ? '#F44336' : '#4CAF50';

    if (field.type === 'select') {
      return (
        <Box key={field.name} flexDirection="column" marginBottom={1}>
          <Text color={isFocused ? '#C9D1D9' : '#8B949E'}>
            {field.label}
          </Text>
          <Box>
            {field.options?.map((option, i) => {
              const isSelected = option === field.value;
              return (
                <Box key={option} marginRight={2}>
                  <Text
                    color={isSelected ? '#2196F3' : '#6E7681'}
                    bold={isSelected}
                  >
                    {isSelected ? '◉' : '○'} {option}
                  </Text>
                </Box>
              );
            })}
            {isFocused && <Text color="#484F58"> (←→ to change)</Text>}
          </Box>
        </Box>
      );
    }

    return (
      <Box key={field.name} flexDirection="column" marginBottom={1}>
        <Box>
          <Text color={isFocused ? '#C9D1D9' : '#8B949E'}>
            {field.label}
          </Text>
          {field.required && <Text color="#F44336"> *</Text>}
        </Box>
        <Box>
          <Box
            borderStyle="single"
            borderColor={borderColor}
            width={40}
            paddingX={1}
          >
            <Text color={field.value ? '#C9D1D9' : '#484F58'}>
              {field.type === 'password'
                ? '•'.repeat(field.value.length)
                : field.value || (isFocused ? '' : 'Enter ' + field.label.toLowerCase())}
              {isFocused && <Text color="#2196F3">▋</Text>}
            </Text>
          </Box>
          <Text color={statusColor}> {statusIcon}</Text>
        </Box>
        {error && (
          <Text color="#F44336">
            └ {error}
          </Text>
        )}
      </Box>
    );
  };

  const isFormValid = fields.every((f) => !validateField(f));

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#E6EDF3" marginBottom={1}>
        Create New Workspace
      </Text>

      <Box flexDirection="column" marginBottom={1}>
        {fields.map(renderField)}
      </Box>

      <Box marginTop={1}>
        <Box
          backgroundColor={isFormValid ? '#2196F3' : '#484F58'}
          paddingX={3}
          paddingY={0}
          marginRight={2}
        >
          <Text color={isFormValid ? '#FFFFFF' : '#6E7681'} bold>
            Create Workspace
          </Text>
        </Box>
        <Box
          borderStyle="single"
          borderColor="#30363D"
          paddingX={3}
          paddingY={0}
        >
          <Text color="#8B949E">Cancel</Text>
        </Box>
      </Box>

      <Box marginTop={1}>
        <Text color="#484F58">
          Tab/↓ next field • ↑ previous • Enter to submit
        </Text>
      </Box>
    </Box>
  );
};
```

**Visual Output:**
```
Create New Workspace

Workspace Name *
┌──────────────────────────────────────┐
│ My Production App▋                   │  ✓
└──────────────────────────────────────┘

URL Slug *
┌──────────────────────────────────────┐
│ my-production-app                    │  ✓
└──────────────────────────────────────┘

Admin Email *
┌──────────────────────────────────────┐
│ admin@example                        │  ✗
└──────────────────────────────────────┘
└ Invalid email address

Region
◉ us-east  ○ us-west  ○ eu-west  ○ ap-southeast

Plan
○ starter  ◉ pro  ○ enterprise (←→ to change)

┌─────────────────┐  ┌────────┐
│ Create Workspace│  │ Cancel │
└─────────────────┘  └────────┘

Tab/↓ next field • ↑ previous • Enter to submit
```

### 4. Settings Panel with Toggles

```tsx
import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface SettingItem {
  id: string;
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'action';
  value?: boolean | string;
  options?: string[];
  danger?: boolean;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

const SettingsPanel: React.FC = () => {
  const [sections, setSections] = useState<SettingSection[]>([
    {
      title: 'Notifications',
      items: [
        { id: 'email', label: 'Email notifications', description: 'Receive updates via email', type: 'toggle', value: true },
        { id: 'slack', label: 'Slack integration', description: 'Send alerts to Slack channel', type: 'toggle', value: false },
        { id: 'digest', label: 'Daily digest', description: 'Summary of daily activity', type: 'select', value: 'daily', options: ['off', 'daily', 'weekly'] },
      ],
    },
    {
      title: 'Security',
      items: [
        { id: '2fa', label: 'Two-factor auth', description: 'Add extra security to your account', type: 'toggle', value: true },
        { id: 'sessions', label: 'Active sessions', description: 'View and manage logged-in devices', type: 'action' },
        { id: 'api', label: 'API keys', description: 'Manage API access tokens', type: 'action' },
      ],
    },
    {
      title: 'Danger Zone',
      items: [
        { id: 'export', label: 'Export data', description: 'Download all your data', type: 'action' },
        { id: 'delete', label: 'Delete account', description: 'Permanently delete your account', type: 'action', danger: true },
      ],
    },
  ]);

  const [focusedSection, setFocusedSection] = useState(0);
  const [focusedItem, setFocusedItem] = useState(0);

  const allItems = sections.flatMap((s, si) =>
    s.items.map((item, ii) => ({ sectionIndex: si, itemIndex: ii, item }))
  );

  const flatIndex = allItems.findIndex(
    (a) => a.sectionIndex === focusedSection && a.itemIndex === focusedItem
  );

  useInput((input, key) => {
    if (key.upArrow && flatIndex > 0) {
      const prev = allItems[flatIndex - 1];
      setFocusedSection(prev.sectionIndex);
      setFocusedItem(prev.itemIndex);
    } else if (key.downArrow && flatIndex < allItems.length - 1) {
      const next = allItems[flatIndex + 1];
      setFocusedSection(next.sectionIndex);
      setFocusedItem(next.itemIndex);
    } else if (input === ' ' || key.return) {
      const { sectionIndex, itemIndex, item } = allItems[flatIndex];

      if (item.type === 'toggle') {
        const newSections = [...sections];
        newSections[sectionIndex].items[itemIndex].value = !item.value;
        setSections(newSections);
      } else if (item.type === 'select') {
        const options = item.options || [];
        const currentIndex = options.indexOf(item.value as string);
        const newSections = [...sections];
        newSections[sectionIndex].items[itemIndex].value =
          options[(currentIndex + 1) % options.length];
        setSections(newSections);
      }
    }
  });

  const renderToggle = (value: boolean, focused: boolean) => {
    const bg = value ? '#4CAF50' : '#484F58';
    const knobPos = value ? '  ' : '';

    return (
      <Box>
        <Box backgroundColor={bg} paddingX={0}>
          <Text color={value ? '#1B4332' : '#21262D'}>
            {value ? ' ●  ' : '  ● '}
          </Text>
        </Box>
        <Text color={value ? '#4CAF50' : '#6E7681'}>
          {' '}{value ? 'On' : 'Off'}
        </Text>
      </Box>
    );
  };

  const renderSelect = (value: string, options: string[], focused: boolean) => {
    return (
      <Box>
        {options.map((opt, i) => (
          <Box key={opt} marginRight={1}>
            <Text
              color={opt === value ? '#2196F3' : '#484F58'}
              bold={opt === value}
            >
              {opt === value ? '●' : '○'} {opt}
            </Text>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#E6EDF3" marginBottom={1}>
        ⚙ Settings
      </Text>

      {sections.map((section, sectionIndex) => (
        <Box key={section.title} flexDirection="column" marginBottom={1}>
          <Text bold color="#8B949E" marginBottom={1}>
            {section.title}
          </Text>

          <Box
            flexDirection="column"
            borderStyle="round"
            borderColor="#30363D"
          >
            {section.items.map((item, itemIndex) => {
              const isFocused = sectionIndex === focusedSection && itemIndex === focusedItem;

              return (
                <Box
                  key={item.id}
                  backgroundColor={isFocused ? '#21262D' : undefined}
                  paddingX={2}
                  paddingY={0}
                  justifyContent="space-between"
                >
                  <Box flexDirection="column" width={50}>
                    <Text
                      color={item.danger ? '#F44336' : isFocused ? '#E6EDF3' : '#C9D1D9'}
                      bold={isFocused}
                    >
                      {isFocused ? '▸ ' : '  '}{item.label}
                    </Text>
                    <Text color="#6E7681" dimColor>
                      {'   '}{item.description}
                    </Text>
                  </Box>

                  <Box width={30} justifyContent="flex-end">
                    {item.type === 'toggle' && renderToggle(item.value as boolean, isFocused)}
                    {item.type === 'select' && renderSelect(item.value as string, item.options || [], isFocused)}
                    {item.type === 'action' && (
                      <Text color={item.danger ? '#F44336' : '#2196F3'}>
                        {item.danger ? 'Delete →' : 'Manage →'}
                      </Text>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}

      <Box marginTop={1}>
        <Text color="#484F58">
          ↑↓ Navigate • Space to toggle • Enter to select
        </Text>
      </Box>
    </Box>
  );
};
```

**Visual Output:**
```
⚙ Settings

Notifications
╭──────────────────────────────────────────────────────────────────────────────╮
│ ▸ Email notifications                                         ●   On        │
│    Receive updates via email                                                 │
│   Slack integration                                            ●  Off       │
│    Send alerts to Slack channel                                              │
│   Daily digest                                        ○ off ● daily ○ weekly │
│    Summary of daily activity                                                 │
╰──────────────────────────────────────────────────────────────────────────────╯

Security
╭──────────────────────────────────────────────────────────────────────────────╮
│   Two-factor auth                                              ●   On        │
│    Add extra security to your account                                        │
│   Active sessions                                            Manage →        │
│    View and manage logged-in devices                                         │
│   API keys                                                   Manage →        │
│    Manage API access tokens                                                  │
╰──────────────────────────────────────────────────────────────────────────────╯

Danger Zone
╭──────────────────────────────────────────────────────────────────────────────╮
│   Export data                                                Manage →        │
│    Download all your data                                                    │
│   Delete account                                             Delete →        │
│    Permanently delete your account                                           │
╰──────────────────────────────────────────────────────────────────────────────╯

↑↓ Navigate • Space to toggle • Enter to select
```

### 5. Deployment Pipeline Monitor

```tsx
import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';

type StageStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped';

interface PipelineStage {
  name: string;
  status: StageStatus;
  duration?: number;
  logs?: string[];
}

interface Deployment {
  id: string;
  branch: string;
  commit: string;
  author: string;
  stages: PipelineStage[];
  startedAt: Date;
}

const DeploymentMonitor: React.FC = () => {
  const [deployment, setDeployment] = useState<Deployment>({
    id: 'deploy-2847',
    branch: 'main',
    commit: 'a1b2c3d',
    author: 'nathan',
    startedAt: new Date(),
    stages: [
      { name: 'Install', status: 'success', duration: 12 },
      { name: 'Lint', status: 'success', duration: 8 },
      { name: 'Test', status: 'success', duration: 45 },
      { name: 'Build', status: 'running', duration: 23 },
      { name: 'Deploy', status: 'pending' },
      { name: 'Health Check', status: 'pending' },
    ],
  });

  const [spinnerFrame, setSpinnerFrame] = useState(0);
  const spinnerChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  useEffect(() => {
    const timer = setInterval(() => {
      setSpinnerFrame((prev) => (prev + 1) % spinnerChars.length);
    }, 80);
    return () => clearInterval(timer);
  }, []);

  // Simulate progress
  useEffect(() => {
    const timer = setInterval(() => {
      setDeployment((prev) => {
        const stages = [...prev.stages];
        const runningIndex = stages.findIndex((s) => s.status === 'running');

        if (runningIndex >= 0) {
          stages[runningIndex] = {
            ...stages[runningIndex],
            duration: (stages[runningIndex].duration || 0) + 1,
          };

          // Randomly complete
          if (Math.random() > 0.95) {
            stages[runningIndex].status = 'success';
            if (runningIndex + 1 < stages.length) {
              stages[runningIndex + 1].status = 'running';
              stages[runningIndex + 1].duration = 0;
            }
          }
        }

        return { ...prev, stages };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const statusIcon = (status: StageStatus) => {
    switch (status) {
      case 'success': return { icon: '✓', color: '#4CAF50' };
      case 'failed': return { icon: '✗', color: '#F44336' };
      case 'running': return { icon: spinnerChars[spinnerFrame], color: '#2196F3' };
      case 'skipped': return { icon: '○', color: '#484F58' };
      default: return { icon: '○', color: '#6E7681' };
    }
  };

  const renderStage = (stage: PipelineStage, index: number) => {
    const status = statusIcon(stage.status);
    const isLast = index === deployment.stages.length - 1;

    return (
      <Box key={stage.name} flexDirection="column">
        <Box>
          {/* Connector line */}
          {index > 0 && (
            <Box width={3} justifyContent="center">
              <Text color={stage.status === 'pending' ? '#30363D' : '#4CAF50'}>
                │
              </Text>
            </Box>
          )}
        </Box>

        <Box>
          {/* Status indicator */}
          <Box width={3} justifyContent="center">
            <Text color={status.color}>{status.icon}</Text>
          </Box>

          {/* Stage info */}
          <Box flexDirection="column" marginLeft={1}>
            <Text
              color={stage.status === 'running' ? '#E6EDF3' : stage.status === 'pending' ? '#6E7681' : '#C9D1D9'}
              bold={stage.status === 'running'}
            >
              {stage.name}
            </Text>
            {stage.duration !== undefined && (
              <Text color="#6E7681" dimColor>
                {stage.status === 'running' ? 'Running' : 'Completed'} in {stage.duration}s
              </Text>
            )}
          </Box>

          {/* Progress bar for running stage */}
          {stage.status === 'running' && (
            <Box marginLeft={2}>
              <Text color="#2196F3">
                {'█'.repeat(Math.min(10, Math.floor((stage.duration || 0) / 3)))}
                {'░'.repeat(Math.max(0, 10 - Math.floor((stage.duration || 0) / 3)))}
              </Text>
            </Box>
          )}
        </Box>

        {/* Connector to next */}
        {!isLast && (
          <Box width={3} justifyContent="center" height={1}>
            <Text color={
              stage.status === 'success' ? '#4CAF50' :
              stage.status === 'running' ? '#2196F3' : '#30363D'
            }>
              │
            </Text>
          </Box>
        )}
      </Box>
    );
  };

  const completedStages = deployment.stages.filter((s) => s.status === 'success').length;
  const totalStages = deployment.stages.length;
  const overallProgress = Math.round((completedStages / totalStages) * 100);

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box marginBottom={1} justifyContent="space-between">
        <Box>
          <Text bold color="#E6EDF3">🚀 Deployment </Text>
          <Text color="#6E7681">#{deployment.id}</Text>
        </Box>
        <Box backgroundColor="#0D2744" paddingX={1}>
          <Text color="#64B5F6">{deployment.branch}</Text>
        </Box>
      </Box>

      {/* Meta info */}
      <Box marginBottom={1}>
        <Text color="#6E7681">
          Commit: <Text color="#00BCD4">{deployment.commit}</Text>
          {' • '}
          Author: <Text color="#C9D1D9">{deployment.author}</Text>
          {' • '}
          Started: <Text color="#C9D1D9">{deployment.startedAt.toLocaleTimeString()}</Text>
        </Text>
      </Box>

      {/* Overall progress */}
      <Box marginBottom={1}>
        <Text color="#8B949E">Progress: </Text>
        <Text color="#4CAF50">
          {'█'.repeat(Math.floor(overallProgress / 5))}
        </Text>
        <Text color="#30363D">
          {'░'.repeat(20 - Math.floor(overallProgress / 5))}
        </Text>
        <Text color="#8B949E"> {overallProgress}%</Text>
      </Box>

      {/* Pipeline stages */}
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="#30363D"
        padding={1}
      >
        <Text bold color="#8B949E" marginBottom={1}>
          Pipeline Stages
        </Text>
        {deployment.stages.map(renderStage)}
      </Box>

      {/* Logs preview */}
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="#30363D"
        padding={1}
        marginTop={1}
      >
        <Text bold color="#8B949E" marginBottom={1}>
          Live Output
        </Text>
        <Text color="#484F58">[12:34:56]</Text>
        <Text color="#6E7681"> Building production bundle...</Text>
        <Text color="#484F58">[12:34:57]</Text>
        <Text color="#6E7681"> Compiling TypeScript...</Text>
        <Text color="#484F58">[12:34:58]</Text>
        <Text color="#4CAF50"> ✓ Compiled successfully</Text>
        <Text color="#484F58">[12:34:59]</Text>
        <Text color="#6E7681"> Optimizing assets...</Text>
      </Box>

      <Box marginTop={1}>
        <Text color="#484F58">
          Press 'c' to cancel • 'r' to restart • 'l' for full logs
        </Text>
      </Box>
    </Box>
  );
};
```

**Visual Output:**
```
🚀 Deployment #deploy-2847                                              main

Commit: a1b2c3d • Author: nathan • Started: 2:34:56 PM

Progress: ████████████░░░░░░░░ 60%

╭─ Pipeline Stages ──────────────────────────────────────────────────────────╮
│                                                                            │
│  ✓ Install                                                                 │
│    Completed in 12s                                                        │
│  │                                                                         │
│  ✓ Lint                                                                    │
│    Completed in 8s                                                         │
│  │                                                                         │
│  ✓ Test                                                                    │
│    Completed in 45s                                                        │
│  │                                                                         │
│  ⠹ Build                               ████████░░                          │
│    Running in 23s                                                          │
│  │                                                                         │
│  ○ Deploy                                                                  │
│  │                                                                         │
│  ○ Health Check                                                            │
│                                                                            │
╰────────────────────────────────────────────────────────────────────────────╯

╭─ Live Output ──────────────────────────────────────────────────────────────╮
│  [12:34:56] Building production bundle...                                  │
│  [12:34:57] Compiling TypeScript...                                        │
│  [12:34:58] ✓ Compiled successfully                                        │
│  [12:34:59] Optimizing assets...                                           │
╰────────────────────────────────────────────────────────────────────────────╯

Press 'c' to cancel • 'r' to restart • 'l' for full logs
```

### 6. Command Palette / Search

```tsx
import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';

interface Command {
  id: string;
  title: string;
  description: string;
  shortcut?: string;
  category: string;
  icon: string;
}

const commands: Command[] = [
  { id: 'new-project', title: 'New Project', description: 'Create a new project', shortcut: '⌘N', category: 'Project', icon: '📁' },
  { id: 'new-file', title: 'New File', description: 'Create a new file', shortcut: '⌘⇧N', category: 'Project', icon: '📄' },
  { id: 'open-settings', title: 'Open Settings', description: 'Configure preferences', shortcut: '⌘,', category: 'Settings', icon: '⚙' },
  { id: 'toggle-theme', title: 'Toggle Theme', description: 'Switch dark/light mode', shortcut: '⌘⇧T', category: 'Settings', icon: '🎨' },
  { id: 'view-logs', title: 'View Logs', description: 'Open application logs', shortcut: '⌘L', category: 'Debug', icon: '📋' },
  { id: 'deploy', title: 'Deploy', description: 'Deploy to production', shortcut: '⌘⇧D', category: 'Actions', icon: '🚀' },
  { id: 'git-commit', title: 'Git Commit', description: 'Commit staged changes', shortcut: '⌘⇧G', category: 'Git', icon: '📝' },
  { id: 'git-push', title: 'Git Push', description: 'Push to remote', category: 'Git', icon: '⬆' },
  { id: 'search-files', title: 'Search Files', description: 'Find files by name', shortcut: '⌘P', category: 'Search', icon: '🔍' },
  { id: 'search-text', title: 'Search in Files', description: 'Find text in project', shortcut: '⌘⇧F', category: 'Search', icon: '🔎' },
];

const CommandPalette: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = useMemo(() => {
    if (!query) return commands;

    const lowerQuery = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(lowerQuery) ||
        cmd.description.toLowerCase().includes(lowerQuery) ||
        cmd.category.toLowerCase().includes(lowerQuery)
    );
  }, [query]);

  // Group by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex(Math.max(0, selectedIndex - 1));
    } else if (key.downArrow) {
      setSelectedIndex(Math.min(filteredCommands.length - 1, selectedIndex + 1));
    } else if (key.backspace || key.delete) {
      setQuery(query.slice(0, -1));
      setSelectedIndex(0);
    } else if (input && !key.ctrl && !key.meta) {
      setQuery(query + input);
      setSelectedIndex(0);
    }
  });

  // Calculate flat index for selection
  let flatIndex = 0;

  const highlightMatch = (text: string, query: string) => {
    if (!query) return <Text>{text}</Text>;

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) return <Text>{text}</Text>;

    return (
      <Text>
        {text.slice(0, index)}
        <Text color="#FFC107" bold>{text.slice(index, index + query.length)}</Text>
        {text.slice(index + query.length)}
      </Text>
    );
  };

  return (
    <Box flexDirection="column">
      {/* Backdrop */}
      <Box flexDirection="column" marginBottom={1}>
        {Array.from({ length: 2 }, (_, i) => (
          <Text key={i} color="#21262D">{'░'.repeat(70)}</Text>
        ))}
      </Box>

      {/* Command palette */}
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="#2196F3"
        width={60}
        marginLeft={5}
        backgroundColor="#0D1117"
      >
        {/* Search input */}
        <Box
          paddingX={2}
          paddingY={1}
          borderStyle="single"
          borderTop={false}
          borderLeft={false}
          borderRight={false}
          borderColor="#30363D"
        >
          <Text color="#6E7681">🔍 </Text>
          <Text color="#C9D1D9">
            {query}
            <Text color="#2196F3">▋</Text>
          </Text>
          {!query && <Text color="#484F58">Type to search commands...</Text>}
        </Box>

        {/* Results */}
        <Box flexDirection="column" paddingX={1} paddingY={1} height={15}>
          {Object.entries(groupedCommands).map(([category, cmds]) => (
            <Box key={category} flexDirection="column" marginBottom={1}>
              <Text color="#6E7681" dimColor>
                {category.toUpperCase()}
              </Text>
              {cmds.map((cmd) => {
                const isSelected = flatIndex === selectedIndex;
                flatIndex++;

                return (
                  <Box
                    key={cmd.id}
                    backgroundColor={isSelected ? '#21262D' : undefined}
                    paddingX={1}
                    justifyContent="space-between"
                  >
                    <Box>
                      <Text>{cmd.icon} </Text>
                      <Text color={isSelected ? '#E6EDF3' : '#C9D1D9'} bold={isSelected}>
                        {highlightMatch(cmd.title, query)}
                      </Text>
                      <Text color="#6E7681">
                        {' '}{highlightMatch(cmd.description, query)}
                      </Text>
                    </Box>
                    {cmd.shortcut && (
                      <Box backgroundColor="#21262D" paddingX={1}>
                        <Text color="#8B949E">{cmd.shortcut}</Text>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          ))}

          {filteredCommands.length === 0 && (
            <Box justifyContent="center" paddingY={2}>
              <Text color="#6E7681">No commands found for "{query}"</Text>
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box
          paddingX={2}
          borderStyle="single"
          borderBottom={false}
          borderLeft={false}
          borderRight={false}
          borderColor="#30363D"
        >
          <Text color="#484F58">
            ↑↓ Navigate • Enter to run • Esc to close
          </Text>
        </Box>
      </Box>
    </Box>
  );
};
```

**Visual Output:**
```
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

     ╭────────────────────────────────────────────────────────────╮
     │  🔍 git▋Type to search commands...                        │
     ├────────────────────────────────────────────────────────────┤
     │                                                            │
     │  GIT                                                       │
     │  ▸ 📝 Git Commit - Commit staged changes           ⌘⇧G    │
     │    ⬆  Git Push - Push to remote                           │
     │                                                            │
     │  ACTIONS                                                   │
     │    🚀 Deploy - Deploy to production                ⌘⇧D    │
     │                                                            │
     │                                                            │
     │                                                            │
     │                                                            │
     │                                                            │
     │                                                            │
     ├────────────────────────────────────────────────────────────┤
     │  ↑↓ Navigate • Enter to run • Esc to close                │
     ╰────────────────────────────────────────────────────────────╯
```

---

## Animation Timing Guidelines

### Recommended Durations

| Animation Type | Duration | Use Case |
|---------------|----------|----------|
| Spinner frame | 80ms | Loading indicators |
| Toast appear | 150ms | Notification entry |
| Toast dismiss | 200ms | Notification exit |
| Progress step | 16ms | Smooth progress bars |
| Typewriter char | 50ms | Text reveal effects |
| Pulse cycle | 1000ms | Attention indicators |
| Skeleton shimmer | 50ms/char | Loading placeholders |
| Slide transition | 200ms | Panel/wizard navigation |
| Cursor blink | 530ms | Input cursor |
| Data refresh | 2000ms | Live dashboard updates |

### Animation Easing

Since terminals don't support true easing, simulate with stepped animations:

```typescript
// Linear steps (most common for terminal)
const linearSteps = (progress: number, steps: number) =>
  Math.floor(progress * steps) / steps;

// Ease-out simulation (faster start, slower end)
const easeOutSteps = (progress: number, steps: number) => {
  const eased = 1 - Math.pow(1 - progress, 2);
  return Math.floor(eased * steps) / steps;
};

// Ease-in simulation (slower start, faster end)
const easeInSteps = (progress: number, steps: number) => {
  const eased = Math.pow(progress, 2);
  return Math.floor(eased * steps) / steps;
};
```

---

## Accessibility Considerations

1. **Color contrast**: Always maintain 4.5:1 contrast ratio for text
2. **Motion sensitivity**: Provide option to reduce animations
3. **Keyboard navigation**: Every interactive element must be keyboard accessible
4. **Screen reader support**: Provide text alternatives for visual indicators
5. **Focus indicators**: Clear visual focus rings on all interactive elements

```typescript
// Reduced motion preference
const useReducedMotion = () => {
  // In terminal context, check environment variable
  return process.env.REDUCE_MOTION === 'true';
};

// Accessible status announcement
const announceStatus = (message: string) => {
  // Output to stderr for screen reader compatibility
  process.stderr.write(`\x1b]0;${message}\x07`);
};
```

---

## File Structure Recommendation

```
packages/ink-ui/
├── src/
│   ├── components/
│   │   ├── primitives/
│   │   │   ├── Badge.tsx
│   │   │   ├── Box.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Sparkline.tsx
│   │   │   └── Table.tsx
│   │   ├── patterns/
│   │   │   ├── CommandPalette.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Settings.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── Wizard.tsx
│   │   └── animations/
│   │       ├── Fade.tsx
│   │       ├── Pulse.tsx
│   │       ├── Slide.tsx
│   │       └── Typewriter.tsx
│   ├── hooks/
│   │   ├── useAnimation.ts
│   │   ├── useKeyboard.ts
│   │   └── useToast.ts
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── icons.ts
│   │   ├── spacing.ts
│   │   └── typography.ts
│   └── index.ts
├── examples/
│   ├── analytics-dashboard.tsx
│   ├── customer-table.tsx
│   ├── deployment-monitor.tsx
│   ├── form-validation.tsx
│   ├── settings-panel.tsx
│   └── command-palette.tsx
└── package.json
```

This design system provides a comprehensive foundation for building production-quality terminal UIs with React Ink, leveraging Unicode, ANSI colors, and thoughtful animation patterns.
