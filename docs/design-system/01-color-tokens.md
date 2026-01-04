# Color Tokens

## Semantic Color System

Our color system uses semantic naming to ensure consistent meaning across all components.

## Primary Palette

### Brand Colors
```
┌──────────────────────────────────────────────────────────────┐
│  PRIMARY                                                     │
│  ████████  #3B82F6  rgb(59, 130, 246)   Blue                │
│  Used for: Interactive elements, links, primary actions      │
│                                                              │
│  PRIMARY LIGHT                                               │
│  ████████  #60A5FA  rgb(96, 165, 250)   Light Blue          │
│  Used for: Hover states, focus rings                         │
│                                                              │
│  PRIMARY DARK                                                │
│  ████████  #2563EB  rgb(37, 99, 235)    Dark Blue           │
│  Used for: Active/pressed states                             │
└──────────────────────────────────────────────────────────────┘
```

### Semantic Colors
```
┌──────────────────────────────────────────────────────────────┐
│  SUCCESS                                                     │
│  ████████  #22C55E  rgb(34, 197, 94)    Green               │
│  Symbol: ✓  Meaning: Completed, healthy, positive           │
│                                                              │
│  WARNING                                                     │
│  ████████  #F59E0B  rgb(245, 158, 11)   Amber               │
│  Symbol: ⚠  Meaning: Attention needed, degraded             │
│                                                              │
│  ERROR                                                       │
│  ████████  #EF4444  rgb(239, 68, 68)    Red                 │
│  Symbol: ✗  Meaning: Failed, critical, destructive          │
│                                                              │
│  INFO                                                        │
│  ████████  #06B6D4  rgb(6, 182, 212)    Cyan                │
│  Symbol: ℹ  Meaning: Informational, neutral highlight       │
└──────────────────────────────────────────────────────────────┘
```

### Neutral Scale
```
┌──────────────────────────────────────────────────────────────┐
│  NEUTRAL-50   ████████  #FAFAFA  Brightest (backgrounds)    │
│  NEUTRAL-100  ████████  #F4F4F5  Light backgrounds          │
│  NEUTRAL-200  ████████  #E4E4E7  Borders, dividers          │
│  NEUTRAL-300  ████████  #D4D4D8  Disabled text              │
│  NEUTRAL-400  ████████  #A1A1AA  Placeholder text           │
│  NEUTRAL-500  ████████  #71717A  Secondary text             │
│  NEUTRAL-600  ████████  #52525B  Primary text (dark mode)   │
│  NEUTRAL-700  ████████  #3F3F46  Primary text               │
│  NEUTRAL-800  ████████  #27272A  Headings                   │
│  NEUTRAL-900  ████████  #18181B  Darkest                    │
└──────────────────────────────────────────────────────────────┘
```

## Token Definitions

```typescript
// colors.ts
export const colors = {
  // Brand
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  primaryDark: '#2563EB',

  // Semantic
  success: '#22C55E',
  successLight: '#4ADE80',
  successDark: '#16A34A',

  warning: '#F59E0B',
  warningLight: '#FBBF24',
  warningDark: '#D97706',

  error: '#EF4444',
  errorLight: '#F87171',
  errorDark: '#DC2626',

  info: '#06B6D4',
  infoLight: '#22D3EE',
  infoDark: '#0891B2',

  // Neutral
  text: {
    primary: '#E4E4E7',      // Main text (light on dark)
    secondary: '#A1A1AA',    // Secondary text
    tertiary: '#71717A',     // Subtle text
    disabled: '#52525B',     // Disabled text
    inverse: '#18181B',      // Dark text on light bg
  },

  background: {
    primary: '#18181B',      // Main background
    secondary: '#27272A',    // Elevated surfaces
    tertiary: '#3F3F46',     // Cards, modals
    hover: '#3F3F46',        // Hover state
    selected: '#3B82F6',     // Selected items
  },

  border: {
    default: '#3F3F46',      // Default borders
    focus: '#3B82F6',        // Focus rings
    error: '#EF4444',        // Error borders
    success: '#22C55E',      // Success borders
  },
} as const;
```

## Color Usage Guidelines

### Interactive Elements
```
┌─────────────────────────────────────────────────────────────┐
│  STATE          COLOR           EXAMPLE                     │
├─────────────────────────────────────────────────────────────┤
│  Default        primary         [ Submit ]                  │
│  Hover          primaryLight    [ Submit ] ← cursor         │
│  Active         primaryDark     [ Submit ] (pressed)        │
│  Focus          + focus ring    ┃[ Submit ]┃                │
│  Disabled       neutral-500     [ Submit ] (dimmed)         │
└─────────────────────────────────────────────────────────────┘
```

### Status Indicators
```
┌─────────────────────────────────────────────────────────────┐
│  Always pair color with symbol for accessibility:           │
│                                                             │
│  ● Online      ✓ Success       ✓ Completed                  │
│  ○ Offline     ✗ Error         ✗ Failed                     │
│  ◐ Degraded    ⚠ Warning       ⚠ Attention                  │
│  ◌ Unknown     ℹ Info          → Pending                    │
└─────────────────────────────────────────────────────────────┘
```

### Text Hierarchy
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ██ HEADING (bold, text.primary)                           │
│                                                             │
│  Body text uses text.primary for main content.             │
│  Secondary information uses text.secondary (dimmed).        │
│  Hints and metadata use text.tertiary (more dimmed).        │
│  Disabled content uses text.disabled (very dim).            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## React Ink Implementation

```tsx
import React from 'react';
import { Text, Box } from 'ink';

// Color token hook
const useColors = () => ({
  primary: '#3B82F6',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#06B6D4',
  textPrimary: '#E4E4E7',
  textSecondary: '#A1A1AA',
  textTertiary: '#71717A',
  bgPrimary: '#18181B',
  bgSecondary: '#27272A',
  border: '#3F3F46',
});

// Semantic text component
interface SemanticTextProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error' | 'info';
  bold?: boolean;
  dim?: boolean;
  children: React.ReactNode;
}

export const SemanticText: React.FC<SemanticTextProps> = ({
  variant = 'primary',
  bold,
  dim,
  children
}) => {
  const colors = useColors();

  const colorMap = {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
    tertiary: colors.textTertiary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
  };

  return (
    <Text color={colorMap[variant]} bold={bold} dimColor={dim}>
      {children}
    </Text>
  );
};

// Status badge component
interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  children: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, children }) => {
  const colors = useColors();

  const config = {
    success: { color: colors.success, symbol: '✓' },
    warning: { color: colors.warning, symbol: '⚠' },
    error: { color: colors.error, symbol: '✗' },
    info: { color: colors.info, symbol: 'ℹ' },
    neutral: { color: colors.textSecondary, symbol: '●' },
  };

  const { color, symbol } = config[status];

  return (
    <Text color={color}>
      {symbol} {children}
    </Text>
  );
};
```

## Terminal Capability Detection

```tsx
// Graceful degradation for limited terminals
const getColorSupport = () => {
  const term = process.env.TERM || '';
  const colorTerm = process.env.COLORTERM || '';

  if (colorTerm === 'truecolor' || colorTerm === '24bit') {
    return 'truecolor';  // Full RGB support
  }
  if (term.includes('256color')) {
    return '256';        // 256 color palette
  }
  if (process.env.FORCE_COLOR) {
    return '16';         // Basic 16 colors
  }
  return 'none';         // No color, use symbols only
};

// Fallback color mapping
const getFallbackColor = (semantic: string, support: string) => {
  if (support === 'none') return undefined;

  const fallbacks = {
    success: support === '16' ? 'green' : '#22C55E',
    error: support === '16' ? 'red' : '#EF4444',
    warning: support === '16' ? 'yellow' : '#F59E0B',
    info: support === '16' ? 'cyan' : '#06B6D4',
    primary: support === '16' ? 'blue' : '#3B82F6',
  };

  return fallbacks[semantic];
};
```
