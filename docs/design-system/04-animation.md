# Animation & Motion Design

## Motion Principles

Animation in terminal UIs serves specific purposes:
1. **Feedback** - Confirm user actions
2. **Progress** - Show ongoing operations
3. **Attention** - Guide focus to important changes
4. **Continuity** - Connect state transitions

## Animation Timing

```
┌─────────────────────────────────────────────────────────────────────┐
│  DURATION         MS        USE CASE                               │
├─────────────────────────────────────────────────────────────────────┤
│  Instant          0         Keyboard navigation, selection         │
│  Swift            50-100    Micro-interactions, hover states       │
│  Normal           150-250   State changes, reveals                 │
│  Deliberate       300-500   Major transitions, modals              │
│  Slow             500-1000  Celebrations, attention-grabbing       │
└─────────────────────────────────────────────────────────────────────┘
```

## Spinner Patterns

### Basic Spinners
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  dots:        ⠋ ⠙ ⠹ ⠸ ⠼ ⠴ ⠦ ⠧ ⠇ ⠏                                  │
│  line:        - \ | /                                               │
│  arc:         ◜ ◠ ◝ ◞ ◡ ◟                                          │
│  circle:      ◐ ◓ ◑ ◒                                               │
│  box:         ▖ ▘ ▝ ▗                                               │
│  bounce:      ⠁ ⠂ ⠄ ⠂                                               │
│  arrow:       ← ↖ ↑ ↗ → ↘ ↓ ↙                                       │
│  clock:       🕐 🕑 🕒 🕓 🕔 🕕 🕖 🕗 🕘 🕙 🕚 🕛                              │
│  moon:        🌑 🌒 🌓 🌔 🌕 🌖 🌗 🌘                                       │
│                                                                     │
│  RECOMMENDED: dots (most compatible, smooth)                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Contextual Spinners
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Loading data:        ⠋ Loading...                                 │
│  Saving:              ⠋ Saving changes...                          │
│  Deploying:           ⠋ Deploying to production...                 │
│  Processing:          ⠋ Processing 42 items...                     │
│                                                                     │
│  With progress:       ⠋ Uploading... 67%                           │
│  With ETA:            ⠋ Building... ~2m remaining                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Progress Indicators

### Progress Bar Styles
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Standard:       [████████████░░░░░░░░░░░░] 50%                    │
│                                                                     │
│  Blocks:         [██████████████          ] 50%                    │
│                                                                     │
│  Smooth:         [▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░] 50%                    │
│                                                                     │
│  Thin:           ────────────────────────── 50%                    │
│                  ════════════                                       │
│                                                                     │
│  Gradient:       [██████████████          ] 50%                    │
│                   ↑ darker              lighter ↑                   │
│                                                                     │
│  With label:     Downloading   [████████████░░░░] 67% 4.2MB/6.3MB  │
│                                                                     │
│  Minimal:        ▰▰▰▰▰▰▰▱▱▱▱▱▱▱ 50%                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Multi-Step Progress
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   ✓ Initialized ──── ✓ Downloaded ──── ◐ Building ──── ○ Deploy   │
│                                                                     │
│   [1] ✓  [2] ✓  [3] ⠋  [4] ○                                       │
│                                                                     │
│   Step 3 of 4: Building application...                             │
│   [████████████████░░░░░░░░░░░░░░░░░░░░] 40%                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Skeleton Screens

### Text Skeleton
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   Loading state:                                                    │
│   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                                    │
│   ░░░░░░░░░░░░░░░░░░░░░░                                           │
│   ░░░░░░░░░░░░░░░░░░░░░░░░░░░                                      │
│                                                                     │
│   Animated (shimmer effect):                                        │
│   ▒▒▒▒░░░░░░░░░░░░░░░░░░░░░░░░░  → moves right                    │
│   ▒▒▒▒░░░░░░░░░░░░░░░░░░░░░                                        │
│   ▒▒▒▒░░░░░░░░░░░░░░░░░░░░░░░                                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Table Skeleton
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  NAME              STATUS      CREATED        ACTIONS        │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  ░░░░░░░░░░░░░    ░░░░░░░░   ░░░░░░░░░░░   ░░░░░            │  │
│  │  ░░░░░░░░░░░░░░   ░░░░░░░    ░░░░░░░░░░░   ░░░░░            │  │
│  │  ░░░░░░░░░        ░░░░░░░░   ░░░░░░░░░░░   ░░░░░            │  │
│  │  ░░░░░░░░░░░░░░   ░░░░░░░    ░░░░░░░░░░░   ░░░░░            │  │
│  │  ░░░░░░░░░░░      ░░░░░░░░   ░░░░░░░░░░░   ░░░░░            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Card Skeleton
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌────────────────────────┐  ┌────────────────────────┐            │
│  │  ░░░░░░░░░░░░░         │  │  ░░░░░░░░░░░░░         │            │
│  │                        │  │                        │            │
│  │  ░░░░░░░░░░░░░░░░░░░  │  │  ░░░░░░░░░░░░░░░░░░░  │            │
│  │  ░░░░░░░░░░░░░░░░░░░  │  │  ░░░░░░░░░░░░░░░░░░░  │            │
│  │  ░░░░░░░░░░░░░░       │  │  ░░░░░░░░░░░░░░       │            │
│  │                        │  │                        │            │
│  │  ░░░░░░░░░   ░░░░░░░░ │  │  ░░░░░░░░░   ░░░░░░░░ │            │
│  └────────────────────────┘  └────────────────────────┘            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Transition Animations

### List Item Transitions
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ADDING AN ITEM (expand from nothing):                             │
│                                                                     │
│  Frame 1:  Item A                                                   │
│            Item C                                                   │
│                                                                     │
│  Frame 2:  Item A                                                   │
│            ░░░░░░ (height expanding)                               │
│            Item C                                                   │
│                                                                     │
│  Frame 3:  Item A                                                   │
│            Item B ← new (highlighted briefly)                       │
│            Item C                                                   │
│                                                                     │
│  REMOVING AN ITEM (strikethrough then collapse):                   │
│                                                                     │
│  Frame 1:  Item A                                                   │
│            I̶t̶e̶m̶ ̶B̶ (strikethrough, dimming)                         │
│            Item C                                                   │
│                                                                     │
│  Frame 2:  Item A                                                   │
│            Item C                                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### State Change Animation
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  STATUS CHANGE: pending → success                                  │
│                                                                     │
│  Frame 1:  ○ Pending     (yellow, static)                          │
│  Frame 2:  ◐ Processing  (yellow, spinning)                        │
│  Frame 3:  ◉ Completing  (transitioning to green)                  │
│  Frame 4:  ✓ Success     (green, brief flash/scale)               │
│                                                                     │
│  VALUE CHANGE: 1,234 → 1,567                                       │
│                                                                     │
│  Option A - Counter roll:                                           │
│  1,234 → 1,345 → 1,456 → 1,567 (numbers increment rapidly)        │
│                                                                     │
│  Option B - Flash:                                                  │
│  1,234 → [1,567] (inverse/highlight) → 1,567 (normal)             │
│                                                                     │
│  Option C - Color pulse:                                            │
│  1,567 (green flash for increase, red for decrease)                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## React Ink Animation Components

```tsx
import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';

// Spinner component
const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

interface SpinnerProps {
  color?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  color = '#3B82F6',
  label
}) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame(f => (f + 1) % spinnerFrames.length);
    }, 80);
    return () => clearInterval(timer);
  }, []);

  return (
    <Text>
      <Text color={color}>{spinnerFrames[frame]}</Text>
      {label && <Text> {label}</Text>}
    </Text>
  );
};

// Progress bar component
interface ProgressBarProps {
  value: number;  // 0-100
  width?: number;
  showPercentage?: boolean;
  label?: string;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  width = 30,
  showPercentage = true,
  label,
  color = '#3B82F6'
}) => {
  const filled = Math.round((value / 100) * width);
  const empty = width - filled;

  return (
    <Box>
      {label && <Text>{label} </Text>}
      <Text color="#3F3F46">[</Text>
      <Text color={color}>{'█'.repeat(filled)}</Text>
      <Text color="#3F3F46">{'░'.repeat(empty)}</Text>
      <Text color="#3F3F46">]</Text>
      {showPercentage && (
        <Text color="#A1A1AA"> {Math.round(value)}%</Text>
      )}
    </Box>
  );
};

// Skeleton text with shimmer effect
interface SkeletonProps {
  width: number;
  animated?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  animated = true
}) => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!animated) return;
    const timer = setInterval(() => {
      setOffset(o => (o + 1) % width);
    }, 50);
    return () => clearInterval(timer);
  }, [animated, width]);

  const chars = [];
  for (let i = 0; i < width; i++) {
    const isHighlight = animated && (i >= offset && i < offset + 3);
    chars.push(isHighlight ? '▓' : '░');
  }

  return <Text color="#3F3F46">{chars.join('')}</Text>;
};

// Animated counter for value changes
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatValue?: (n: number) => string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 500,
  formatValue = n => n.toLocaleString()
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (displayValue === value) return;

    setIsAnimating(true);
    const startValue = displayValue;
    const diff = value - startValue;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + diff * eased);

      setDisplayValue(current);

      if (progress < 1) {
        setTimeout(animate, 16);
      } else {
        setIsAnimating(false);
      }
    };

    animate();
  }, [value, duration]);

  const isIncrease = value > displayValue;

  return (
    <Text
      color={isAnimating ? (isIncrease ? '#22C55E' : '#EF4444') : undefined}
      bold={isAnimating}
    >
      {formatValue(displayValue)}
    </Text>
  );
};

// Typing animation
interface TypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  speed = 50,
  onComplete
}) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  return (
    <Text>
      {displayText}
      <Text color="#3B82F6">▌</Text>
    </Text>
  );
};

// Pulse/flash highlight
interface PulseProps {
  children: React.ReactNode;
  trigger: any;  // Pulse when this changes
  color?: string;
}

export const Pulse: React.FC<PulseProps> = ({
  children,
  trigger,
  color = '#22C55E'
}) => {
  const [isPulsing, setIsPulsing] = useState(false);
  const [prevTrigger, setPrevTrigger] = useState(trigger);

  useEffect(() => {
    if (trigger !== prevTrigger) {
      setPrevTrigger(trigger);
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [trigger, prevTrigger]);

  return (
    <Text color={isPulsing ? color : undefined} bold={isPulsing}>
      {children}
    </Text>
  );
};

// Multi-step progress indicator
interface Step {
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

interface StepIndicatorProps {
  steps: Step[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps }) => {
  const getIcon = (status: Step['status']) => {
    switch (status) {
      case 'completed': return '✓';
      case 'active': return '◐';
      case 'error': return '✗';
      default: return '○';
    }
  };

  const getColor = (status: Step['status']) => {
    switch (status) {
      case 'completed': return '#22C55E';
      case 'active': return '#3B82F6';
      case 'error': return '#EF4444';
      default: return '#71717A';
    }
  };

  return (
    <Box>
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <Text color={getColor(step.status)}>
            {getIcon(step.status)} {step.label}
          </Text>
          {i < steps.length - 1 && (
            <Text color="#3F3F46"> ──── </Text>
          )}
        </React.Fragment>
      ))}
    </Box>
  );
};
```

## Animation Best Practices

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  DO:                                                                │
│  ✓ Use spinners only for async operations > 300ms                  │
│  ✓ Provide progress feedback when duration is known                 │
│  ✓ Keep animations short (< 500ms for most cases)                  │
│  ✓ Allow users to skip/cancel long animations                       │
│  ✓ Use motion to indicate state changes                            │
│  ✓ Respect reduced motion preferences                               │
│                                                                     │
│  DON'T:                                                             │
│  ✗ Animate everything constantly                                    │
│  ✗ Use blinking for anything except critical alerts                │
│  ✗ Make users wait for animations to complete                       │
│  ✗ Use distracting rainbow/flashy effects for normal UI            │
│  ✗ Animate more than 2-3 things simultaneously                     │
│  ✗ Use slow animations for frequent operations                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Reduced Motion Support

```tsx
// Check for reduced motion preference
const prefersReducedMotion = () => {
  // In terminal context, check environment variable
  return process.env.REDUCE_MOTION === '1' ||
         process.env.ACCESSIBILITY_REDUCE_MOTION === 'true';
};

// Motion-aware component wrapper
const Motion: React.FC<{
  children: React.ReactNode;
  fallback: React.ReactNode;
}> = ({ children, fallback }) => {
  return prefersReducedMotion() ? <>{fallback}</> : <>{children}</>;
};

// Usage
<Motion fallback={<Text>Loading...</Text>}>
  <Spinner label="Loading..." />
</Motion>
```
