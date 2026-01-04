# @saaskit/ink-ui

A comprehensive design system for building production-quality SaaS terminal interfaces using React Ink.

## Features

- **Full Unicode Support** - Box drawing, braille patterns, emoji, and extended characters
- **Rich Color System** - Truecolor RGB, 256-color, and 16-color fallbacks
- **Interactive Components** - Keyboard navigation, focus management, real-time updates
- **Animation Primitives** - Spinners, typewriter effects, transitions, progress indicators
- **SaaS-Ready Patterns** - Dashboards, tables, modals, wizards, toasts

## Installation

```bash
npm install @saaskit/ink-ui ink react
```

## Quick Start

```tsx
import React from 'react';
import { render, Box, Text } from 'ink';
import {
  Badge,
  ProgressBar,
  Spinner,
  Sparkline,
  Table,
  ToastProvider,
  useToast,
} from '@saaskit/ink-ui';

const App = () => {
  const toast = useToast();

  return (
    <ToastProvider>
      <Box flexDirection="column" padding={1}>
        {/* Status badges */}
        <Box marginBottom={1}>
          <Badge label="Active" variant="success" dot />
          <Badge label="PRO" variant="pro" bold />
        </Box>

        {/* Loading indicator */}
        <Box marginBottom={1}>
          <Spinner type="dots" label="Loading data..." />
        </Box>

        {/* Progress bar */}
        <ProgressBar value={75} variant="success" width={40} />

        {/* Sparkline chart */}
        <Box marginTop={1}>
          <Text>Revenue: </Text>
          <Sparkline
            data={[10, 20, 15, 30, 25, 40, 35, 50]}
            color="#4CAF50"
            width={20}
          />
        </Box>
      </Box>
    </ToastProvider>
  );
};

render(<App />);
```

## Color System

The design system includes a comprehensive color palette optimized for terminal UIs:

```tsx
import { colors, semantic, interactive } from '@saaskit/ink-ui';

// Brand colors
colors.primary[500]   // #2196F3 - Primary blue
colors.secondary[500] // #9C27B0 - Purple for premium
colors.accent[500]    // #00BCD4 - Cyan for highlights

// Semantic colors
colors.success[500]   // #4CAF50 - Green
colors.warning[500]   // #FFC107 - Yellow
colors.error[500]     // #F44336 - Red
colors.info[500]      // #2196F3 - Blue

// Neutral grays (dark theme optimized)
colors.neutral[50]    // #0D1117 - Deep background
colors.neutral[100]   // #161B22 - Card background
colors.neutral[700]   // #C9D1D9 - Primary text
```

## Components

### Primitives

#### Badge

Status indicators and labels with semantic colors.

```tsx
<Badge label="Active" variant="success" dot />
<Badge label="PRO" variant="pro" bold />
<StatusBadge status="online" />
<PlanBadge plan="enterprise" />
```

#### Spinner

Animated loading indicators with multiple styles.

```tsx
<Spinner type="dots" label="Loading..." />
<Spinner type="arc" color="#4CAF50" />
<Spinner type="blocks" interval={100} />

// Types: 'dots' | 'line' | 'arc' | 'blocks' | 'bounce'
```

#### ProgressBar

Progress indicators with animation support.

```tsx
<ProgressBar value={75} variant="success" showPercentage />
<ProgressBar value={50} animated width={40} />
<IndeterminateProgress width={30} />
<SegmentedProgress currentStep={2} totalSteps={5} />
```

#### Sparkline

Micro-charts for inline data visualization.

```tsx
<Sparkline data={[1, 5, 3, 9, 2, 7]} color="#4CAF50" />
<LabeledSparkline data={values} value="$24.5K" trendPercent={12.5} />
<BarChart data={[45, 62, 58, 72]} height={4} />
```

#### Table

Interactive data tables with sorting and selection.

```tsx
<Table
  data={customers}
  columns={[
    { key: 'name', header: 'Name', width: 20 },
    { key: 'email', header: 'Email', width: 30 },
    { key: 'status', header: 'Status', width: 10, render: (v) => <Badge label={v} /> },
  ]}
  selectable
  striped
  onSelect={(row) => console.log(row)}
/>
```

### Animations

#### Typewriter

Text reveal animation for onboarding and CLI experiences.

```tsx
<Typewriter text="Welcome to the CLI!" speed={50} cursor />
<MultiLineTypewriter
  lines={['Installing dependencies...', 'Building project...', 'Done!']}
  prefix="$ "
/>
<TypeDelete words={['developers', 'designers', 'teams']} />
```

#### Fade

Opacity transitions for modals and overlays.

```tsx
<Fade visible={isOpen} duration={200}>
  <Modal>Content</Modal>
</Fade>
```

### Patterns

#### Toast

Notification system with automatic dismissal.

```tsx
const toast = useToast();

toast.success('Changes saved!');
toast.error('Failed to save');
toast.warning('Rate limit approaching');
toast.info('New version available');

// With options
toast.success('Deployed!', {
  title: 'Production',
  duration: 5000,
  action: { label: 'View', onPress: () => {} }
});
```

#### Modal

Dialog windows with keyboard navigation.

```tsx
<Modal
  visible={isOpen}
  title="Confirm Delete"
  variant="danger"
  onClose={() => setIsOpen(false)}
  footer={<ModalFooter />}
>
  <Text>Are you sure?</Text>
</Modal>

<ConfirmModal
  visible={isOpen}
  title="Delete Item"
  message="This action cannot be undone."
  onConfirm={handleDelete}
  onCancel={() => setIsOpen(false)}
/>

<PromptModal
  visible={isOpen}
  title="Rename"
  message="Enter new name:"
  onSubmit={(value) => rename(value)}
  onCancel={() => setIsOpen(false)}
/>
```

#### Wizard

Multi-step flows with validation and navigation.

```tsx
<Wizard
  steps={[
    {
      id: 'account',
      title: 'Account',
      content: <AccountForm />,
      validate: () => formIsValid,
    },
    {
      id: 'billing',
      title: 'Billing',
      content: <BillingForm />,
      optional: true,
    },
    {
      id: 'review',
      title: 'Review',
      content: <ReviewStep />,
    },
  ]}
  onComplete={() => console.log('Done!')}
  onCancel={() => console.log('Cancelled')}
  progressStyle="dots"
/>
```

## Icons & Symbols

Unicode characters for UI elements:

```tsx
import { icons } from '@saaskit/ink-ui';

// Status icons
icons.status.success    // ✓
icons.status.error      // ✗
icons.status.warning    // ⚠
icons.status.info       // ℹ

// Arrows
icons.arrows.right      // →
icons.arrows.chevronRight // ›

// Selection
icons.selection.radioOn  // ◉
icons.selection.radioOff // ○
icons.selection.checkboxOn  // ☑
icons.selection.checkboxOff // ☐

// Spinners
icons.spinners.dots     // ['⠋', '⠙', '⠹', ...]
icons.spinners.arc      // ['◜', '◠', '◝', ...]

// Box drawing
icons.box.rounded       // { topLeft: '╭', horizontal: '─', ... }
icons.box.double        // { topLeft: '╔', horizontal: '═', ... }

// Block elements
icons.blocks.full       // █
icons.blocks.shades     // ['░', '▒', '▓', '█']
icons.blocks.vertical   // ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█']
```

## Spacing & Layout

Consistent spacing values:

```tsx
import { spacing, widths } from '@saaskit/ink-ui';

spacing.1  // 1 character
spacing.2  // 2 characters (default)
spacing.4  // 4 characters (section gap)

widths.sm  // 20 characters
widths.md  // 30 characters
widths.lg  // 45 characters
widths.modal.md // 60 characters
```

## Color Detection

Automatically detect terminal color support:

```tsx
import { detectColorSupport } from '@saaskit/ink-ui';

const support = detectColorSupport();
// Returns: 'truecolor' | '256' | '16' | 'none'
```

## Keyboard Shortcuts

All interactive components support keyboard navigation:

| Key | Action |
|-----|--------|
| `↑` `↓` | Navigate items |
| `←` `→` | Navigate tabs/steps |
| `Enter` | Select/confirm |
| `Space` | Toggle/check |
| `Tab` | Next focusable |
| `Escape` | Close/cancel |

## Examples

See the `examples/` directory for complete demos:

```bash
npx tsx examples/demo-dashboard.tsx
```

## TypeScript

Full TypeScript support with exported types:

```tsx
import type {
  BadgeProps,
  SpinnerType,
  TableProps,
  Column,
  Toast,
  WizardStep,
} from '@saaskit/ink-ui';
```

## License

MIT
