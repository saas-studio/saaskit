# Ink (React for CLI) - Complete Documentation

Ink is a React renderer for building interactive command-line interfaces. It provides the same component-based UI building experience that React offers in the browser, but for terminal applications. Ink uses Yoga (Facebook's flexbox implementation) to enable CSS-like styling in terminals.

**Notable Users:** Claude Code (Anthropic), Gemini CLI (Google), Gatsby, Shopify CLI, Prisma, Terraform CDK, Parcel, Yarn, and 50+ other production tools.

## Table of Contents

1. [Architecture](#1-architecture)
2. [Core Components](#2-core-components)
3. [Styling](#3-styling)
4. [Interactivity](#4-interactivity)
5. [Advanced Features](#5-advanced-features)
6. [Ecosystem](#6-ecosystem)
7. [Bun Compatibility](#7-bun-compatibility)
8. [Example Code](#8-example-code)

---

## 1. Architecture

### How Ink Renders React to Terminal

Ink creates a custom React reconciler that bridges React's component model to terminal rendering through the Yoga layout engine.

```
React Component Tree
        |
        v
Custom React Reconciler (react-reconciler)
        |
        v
Ink DOM (ink-box, ink-text nodes)
        |
        v
Yoga Layout Engine (calculates positions/dimensions)
        |
        v
ANSI Output (terminal rendering)
```

#### Key Architectural Components:

1. **Reconciler (`reconciler.ts`)**: Uses `react-reconciler` to define how React components map to terminal DOM elements
   - Creates host instances via `createNode()` and text nodes via `createTextNode()`
   - Each element gets a Yoga layout node for positioning
   - Handles mutations through `commitUpdate()` which diffs props and applies style changes

2. **Renderer (`render.ts`)**: Mounts components and manages the render cycle
   - Configurable FPS (default 30 fps) to throttle updates
   - Supports incremental rendering (only updates changed lines)
   - Singleton pattern - reuses instances for the same output stream

3. **Layout Engine**: Yoga calculates flexbox layouts
   - Converts style props to Yoga node configurations
   - Enables CSS-like flexbox properties (flexDirection, alignItems, justifyContent, etc.)

4. **Output**: Converts layouted nodes to ANSI escape sequences
   - Handles colors, backgrounds, borders
   - Manages cursor positioning and screen updates

### The Component Model

Components in Ink work exactly like React components:

```tsx
import { render, Box, Text } from 'ink';

const App = () => (
  <Box flexDirection="column">
    <Text color="green">Hello, Terminal!</Text>
  </Box>
);

render(<App />);
```

**Key Constraints:**
- Text content MUST be rendered within `<Text>` components
- `<Box>` elements cannot nest directly inside text contexts
- All React features are supported (hooks, context, suspense, etc.)

### Re-renders and Updates

Ink handles re-renders similar to React DOM:

1. State changes trigger reconciliation
2. Reconciler diffs old and new props
3. Changed nodes are marked dirty
4. Yoga recalculates layout
5. Only affected regions are re-rendered to terminal

**Render Throttling:**
```tsx
render(<App />, {
  throttle: 100 // Max 10 fps instead of default 30
});
```

---

## 2. Core Components

### Box

The foundational layout element - like `<div style="display: flex">` in the browser.

```tsx
import { Box, Text } from 'ink';

<Box
  width={50}
  height={10}
  flexDirection="column"
  alignItems="center"
  justifyContent="center"
  borderStyle="round"
  borderColor="cyan"
  padding={1}
>
  <Text>Centered Content</Text>
</Box>
```

**Box Props:**
| Category | Props |
|----------|-------|
| Dimensions | `width`, `height`, `minWidth`, `minHeight` |
| Flex Layout | `flexDirection`, `flexWrap`, `flexGrow`, `flexShrink`, `flexBasis` |
| Alignment | `alignItems`, `alignSelf`, `justifyContent` |
| Spacing | `padding`, `paddingX`, `paddingY`, `margin`, `marginX`, `marginY`, `gap` |
| Position | `position` ('relative' \| 'absolute') |
| Visual | `borderStyle`, `borderColor`, `backgroundColor` |
| Overflow | `overflow`, `overflowX`, `overflowY` |
| Accessibility | `aria-role`, `aria-label`, `aria-hidden`, `aria-state` |

### Text

Displays and styles text content.

```tsx
import { Text } from 'ink';

<Text
  color="green"
  backgroundColor="black"
  bold
  italic
  underline
>
  Styled Text
</Text>
```

**Text Props:**
| Prop | Type | Description |
|------|------|-------------|
| `color` | string | Foreground color (supports chalk color names) |
| `backgroundColor` | string | Background color |
| `dimColor` | boolean | Reduce color brightness |
| `bold` | boolean | Bold text |
| `italic` | boolean | Italic text |
| `underline` | boolean | Underlined text |
| `strikethrough` | boolean | Strikethrough text |
| `inverse` | boolean | Swap foreground/background |
| `wrap` | 'wrap' \| 'truncate' \| 'truncate-end' \| 'truncate-middle' \| 'truncate-start' | Text wrapping behavior |

### Newline

Inserts a blank line.

```tsx
import { Newline, Text } from 'ink';

<Text>
  Line 1
  <Newline />
  Line 2
</Text>
```

### Spacer

Flexible space that expands to fill available space.

```tsx
import { Box, Text, Spacer } from 'ink';

<Box>
  <Text>Left</Text>
  <Spacer />
  <Text>Right</Text>
</Box>
```

### Static

Renders permanent output above dynamic content - perfect for logs and completed items.

```tsx
import { Static, Box, Text } from 'ink';

const App = () => {
  const [logs, setLogs] = useState([]);

  return (
    <>
      <Static items={logs}>
        {(log, index) => (
          <Text key={index} color="gray">{log}</Text>
        )}
      </Static>

      <Box>
        <Text>Dynamic content here</Text>
      </Box>
    </>
  );
};
```

### Transform

Modifies the string output of child components.

```tsx
import { Transform, Text } from 'ink';

<Transform transform={output => output.toUpperCase()}>
  <Text>this will be uppercase</Text>
</Transform>
```

### Building Custom Components

Custom components are standard React functional components:

```tsx
import { FC, ReactNode } from 'react';
import { Box, Text } from 'ink';

interface PanelProps {
  title: string;
  children: ReactNode;
}

const Panel: FC<PanelProps> = ({ title, children }) => (
  <Box flexDirection="column" borderStyle="round" padding={1}>
    <Text bold color="cyan">{title}</Text>
    <Box marginTop={1}>
      {children}
    </Box>
  </Box>
);

// Usage
<Panel title="My Panel">
  <Text>Panel content goes here</Text>
</Panel>
```

---

## 3. Styling

### Layout System (Flexbox)

Ink uses Yoga's flexbox implementation. Key properties:

```tsx
<Box
  // Direction
  flexDirection="row"          // 'row' | 'column' | 'row-reverse' | 'column-reverse'
  flexWrap="wrap"              // 'nowrap' | 'wrap' | 'wrap-reverse'

  // Alignment
  alignItems="center"          // 'flex-start' | 'center' | 'flex-end' | 'stretch'
  justifyContent="space-between" // 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'

  // Item properties
  flexGrow={1}
  flexShrink={0}
  flexBasis="50%"

  // Gap (spacing between items)
  gap={1}
  columnGap={2}
  rowGap={1}
>
```

### Colors

Ink supports chalk color names and custom hex/RGB values:

```tsx
// Named colors
<Text color="red">Red text</Text>
<Text color="green">Green text</Text>
<Text color="cyan">Cyan text</Text>

// Hex colors
<Text color="#FF6B6B">Custom red</Text>

// RGB
<Text color="rgb(255, 107, 107)">RGB red</Text>

// Background colors
<Text backgroundColor="blue" color="white">
  White on blue
</Text>
```

**Available Named Colors:**
- Basic: `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`
- Bright variants: `blackBright`, `redBright`, `greenBright`, etc.
- Gray/Grey: `gray`, `grey`

### Borders

Seven border styles available:

```tsx
<Box borderStyle="single">Single</Box>
<Box borderStyle="double">Double</Box>
<Box borderStyle="round">Round</Box>
<Box borderStyle="bold">Bold</Box>
<Box borderStyle="singleDouble">Single/Double</Box>
<Box borderStyle="doubleSingle">Double/Single</Box>
<Box borderStyle="classic">Classic (+, -, |)</Box>
```

**Border Customization:**
```tsx
<Box
  borderStyle="round"
  borderColor="cyan"
  borderTop={true}
  borderBottom={true}
  borderLeft={false}
  borderRight={false}
  borderDimColor={true}  // Dim the border
>
  Content
</Box>
```

### Padding and Margin

```tsx
<Box
  // All sides
  padding={2}
  margin={1}

  // Horizontal/Vertical
  paddingX={2}
  paddingY={1}
  marginX={2}
  marginY={1}

  // Individual sides
  paddingTop={1}
  paddingBottom={1}
  paddingLeft={2}
  paddingRight={2}
  marginTop={1}
  marginBottom={1}
  marginLeft={2}
  marginRight={2}
>
```

---

## 4. Interactivity

### useInput Hook

Handles keyboard input:

```tsx
import { useInput, Text } from 'ink';

const App = () => {
  const [value, setValue] = useState('');

  useInput((input, key) => {
    // input: the character typed (empty for special keys)
    // key: object with booleans for special keys

    if (key.return) {
      // Enter pressed
      console.log('Submitted:', value);
    } else if (key.escape) {
      // Escape pressed
    } else if (key.upArrow) {
      // Navigate up
    } else if (key.downArrow) {
      // Navigate down
    } else if (key.leftArrow) {
      // Navigate left
    } else if (key.rightArrow) {
      // Navigate right
    } else if (key.backspace || key.delete) {
      setValue(prev => prev.slice(0, -1));
    } else if (key.tab) {
      // Tab pressed (shift: key.shift)
    } else if (key.ctrl && input === 'c') {
      // Ctrl+C
    } else {
      // Regular character
      setValue(prev => prev + input);
    }
  });

  return <Text>Input: {value}</Text>;
};
```

**Key Object Properties:**
- Navigation: `upArrow`, `downArrow`, `leftArrow`, `rightArrow`, `pageUp`, `pageDown`, `home`, `end`
- Modifiers: `ctrl`, `shift`, `meta`
- Special: `return`, `escape`, `tab`, `backspace`, `delete`

**Conditional Activation:**
```tsx
useInput(handler, { isActive: isFocused });
```

### useFocus Hook

Manages focus state for interactive components:

```tsx
import { useFocus, Box, Text } from 'ink';

const FocusableItem = ({ label }) => {
  const { isFocused } = useFocus();

  return (
    <Box>
      <Text color={isFocused ? 'green' : 'white'}>
        {isFocused ? '> ' : '  '}{label}
      </Text>
    </Box>
  );
};
```

**useFocus Options:**
```tsx
const { isFocused, focus } = useFocus({
  autoFocus: true,    // Auto-focus when mounted
  isActive: true,     // Whether component can receive focus
  id: 'my-input'      // Custom ID for programmatic focus
});

// Programmatic focus
focus('other-input-id');
```

### useFocusManager Hook

Programmatic control over focus navigation:

```tsx
import { useFocusManager } from 'ink';

const App = () => {
  const { focusNext, focusPrevious, focus, enableFocus, disableFocus } = useFocusManager();

  useInput((input, key) => {
    if (key.tab) {
      if (key.shift) {
        focusPrevious();
      } else {
        focusNext();
      }
    }
  });

  // Focus specific element
  focus('submit-button');

  // Disable all focus
  disableFocus();

  // Re-enable focus
  enableFocus();
};
```

### Keyboard Navigation Pattern

```tsx
const SelectList = ({ items, onSelect }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex(i => (i > 0 ? i - 1 : items.length - 1));
    } else if (key.downArrow) {
      setSelectedIndex(i => (i < items.length - 1 ? i + 1 : 0));
    } else if (key.return) {
      onSelect(items[selectedIndex]);
    }
  });

  return (
    <Box flexDirection="column">
      {items.map((item, index) => (
        <Text
          key={item.id}
          color={index === selectedIndex ? 'cyan' : 'white'}
          bold={index === selectedIndex}
        >
          {index === selectedIndex ? '> ' : '  '}{item.label}
        </Text>
      ))}
    </Box>
  );
};
```

---

## 5. Advanced Features

### useStdin / useStdout / useStderr

Access standard streams:

```tsx
import { useStdin, useStdout, useStderr } from 'ink';

const App = () => {
  const { stdin, isRawModeSupported, setRawMode } = useStdin();
  const { stdout, write } = useStdout();
  const { stderr } = useStderr();

  // Get terminal dimensions
  const { columns, rows } = stdout;

  // Write directly to stdout
  write('Direct output\n');

  return <Text>Terminal: {columns}x{rows}</Text>;
};
```

### useApp Hook (Exit Handling)

```tsx
import { useApp, useInput, Text } from 'ink';

const App = () => {
  const { exit } = useApp();

  useInput((input, key) => {
    if (input === 'q' || key.escape) {
      exit(); // Clean exit
    }
    if (key.ctrl && input === 'c') {
      exit(new Error('User cancelled')); // Exit with error
    }
  });

  return <Text>Press 'q' or Escape to exit</Text>;
};
```

### Render API

```tsx
import { render } from 'ink';

const instance = render(<App />, {
  stdout: process.stdout,
  stdin: process.stdin,
  stderr: process.stderr,
  debug: false,
  exitOnCtrlC: true,
  patchConsole: true,      // Intercept console.log
  throttle: 30             // Max FPS
});

// Instance methods
instance.rerender(<App updated />);
instance.unmount();
instance.clear();

// Wait for app to exit
await instance.waitUntilExit();
```

### Static Output Pattern

For logs, completed tasks, or any content that shouldn't re-render:

```tsx
import { useState, useEffect } from 'react';
import { render, Static, Box, Text } from 'ink';

const TestRunner = () => {
  const [completedTests, setCompletedTests] = useState([]);
  const [currentTest, setCurrentTest] = useState(null);

  return (
    <>
      {/* Completed tests - never re-render */}
      <Static items={completedTests}>
        {test => (
          <Text key={test.id}>
            <Text color="green">✓</Text> {test.name}
          </Text>
        )}
      </Static>

      {/* Current progress - updates frequently */}
      <Box marginTop={1}>
        <Text color="yellow">Running: {currentTest?.name}</Text>
      </Box>
    </>
  );
};
```

### Full-Screen Apps

Use the `fullscreen-ink` package for alternate screen buffer:

```tsx
import { withFullScreen, useScreenSize } from 'fullscreen-ink';
import { Box, Text, useApp } from 'ink';

const FullScreenApp = () => {
  const { width, height } = useScreenSize();
  const { exit } = useApp();

  useInput((input, key) => {
    if (input === 'q') exit();
  });

  return (
    <Box
      width={width}
      height={height}
      borderStyle="round"
      flexDirection="column"
    >
      <Text>Full screen app ({width}x{height})</Text>
      <Text color="gray">Press 'q' to quit</Text>
    </Box>
  );
};

// Start full-screen app
withFullScreen(<FullScreenApp />).start();
```

**Manual Alternate Screen Buffer:**
```tsx
const enterAltScreen = '\x1b[?1049h';
const leaveAltScreen = '\x1b[?1049l';

// Enter alternate screen
process.stdout.write(enterAltScreen);

// Clean up on exit
process.on('exit', () => {
  process.stdout.write(leaveAltScreen);
});
```

---

## 6. Ecosystem

### Official Components (@inkjs/ui)

Install: `npm install @inkjs/ui`

```tsx
import {
  TextInput,
  PasswordInput,
  Select,
  MultiSelect,
  ConfirmInput,
  Spinner,
  ProgressBar,
  Badge,
  StatusMessage,
  Alert,
  UnorderedList,
  OrderedList
} from '@inkjs/ui';
```

#### Select Component
```tsx
<Select
  options={[
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' }
  ]}
  onChange={value => console.log('Selected:', value)}
/>
```

#### TextInput Component
```tsx
<TextInput
  placeholder="Enter your name..."
  onSubmit={value => console.log('Submitted:', value)}
/>
```

#### ProgressBar Component
```tsx
<ProgressBar value={75} /> // 0-100
```

#### Spinner Component
```tsx
<Spinner label="Loading..." />
```

### Community Components

#### ink-select-input
Selection list component.

```bash
npm install ink-select-input
```

```tsx
import SelectInput from 'ink-select-input';

const items = [
  { label: 'First', value: 'first' },
  { label: 'Second', value: 'second' },
  { label: 'Third', value: 'third' }
];

<SelectInput
  items={items}
  onSelect={item => console.log(item)}
  onHighlight={item => console.log('Highlighted:', item)}
  initialIndex={0}
  limit={5}
/>
```

#### ink-text-input
Text input component.

```bash
npm install ink-text-input
```

```tsx
import TextInput from 'ink-text-input';

const [value, setValue] = useState('');

<TextInput
  value={value}
  onChange={setValue}
  onSubmit={val => console.log('Submitted:', val)}
  placeholder="Type here..."
  mask="*"  // For passwords
/>
```

#### ink-spinner
Animated spinner.

```bash
npm install ink-spinner
```

```tsx
import Spinner from 'ink-spinner';

<Text>
  <Text color="green"><Spinner type="dots" /></Text>
  {' Loading...'}
</Text>
```

**Spinner Types:** dots, line, pipe, simpleDots, simpleDotsScrolling, star, hamburger, growVertical, growHorizontal, balloon, balloon2, noise, bounce, boxBounce, boxBounce2, triangle, arc, circle, squareCorners, circleQuarters, circleHalves, squish, toggle, toggle2, toggle3, toggle4, toggle5, toggle6, toggle7, toggle8, toggle9, toggle10, toggle11, toggle12, toggle13, arrow, arrow2, arrow3, bouncingBar, bouncingBall, smiley, monkey, hearts, clock, earth, moon, runner, pong, shark, dqpb

#### ink-table
Table component.

```bash
npm install ink-table
```

```tsx
import Table from 'ink-table';

const data = [
  { name: 'John', age: 30, city: 'NYC' },
  { name: 'Jane', age: 25, city: 'LA' }
];

<Table
  data={data}
  columns={['name', 'age', 'city']}
  padding={2}
/>
```

---

## 7. Bun Compatibility

### Current Status

Ink has **known compatibility issues with Bun**. The main problems:

1. **Input Handling**: `useInput` doesn't respond to user input in Bun
2. **Yoga Layout**: Some issues with yoga-layout-prebuilt bindings

### Workaround

Add this at the start of your app:

```tsx
// Required for Bun compatibility
process.stdin.resume();
```

### Remaining Issues

Even with the workaround:
- Custom key handling may be unreliable
- Multiple Ctrl+C presses may be needed to exit
- Some keyboard callbacks don't fully process

### Recommendation

For production CLI tools requiring full keyboard interactivity, **Node.js remains the more reliable runtime** for Ink applications. Bun support is being actively worked on.

### References
- [Bun Issue #6862](https://github.com/oven-sh/bun/issues/6862) - Ink not working properly
- [Bun Issue #2034](https://github.com/oven-sh/bun/issues/2034) - Compile error on Ink

---

## 8. Example Code

### List View with Selection

```tsx
import { useState } from 'react';
import { render, Box, Text, useInput } from 'ink';

interface Item {
  id: string;
  label: string;
  description?: string;
}

const ListView = ({ items, onSelect }: { items: Item[]; onSelect: (item: Item) => void }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex(i => (i > 0 ? i - 1 : items.length - 1));
    } else if (key.downArrow) {
      setSelectedIndex(i => (i < items.length - 1 ? i + 1 : 0));
    } else if (key.return) {
      onSelect(items[selectedIndex]);
    }
  });

  return (
    <Box flexDirection="column" borderStyle="round" padding={1}>
      <Text bold color="cyan">Select an option:</Text>
      <Box flexDirection="column" marginTop={1}>
        {items.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <Box key={item.id}>
              <Text color={isSelected ? 'cyan' : 'white'}>
                {isSelected ? '> ' : '  '}
                <Text bold={isSelected}>{item.label}</Text>
              </Text>
              {item.description && isSelected && (
                <Text color="gray" dimColor> - {item.description}</Text>
              )}
            </Box>
          );
        })}
      </Box>
      <Box marginTop={1}>
        <Text color="gray">↑↓ to navigate, Enter to select</Text>
      </Box>
    </Box>
  );
};

// Usage
const App = () => {
  const items: Item[] = [
    { id: '1', label: 'Create Project', description: 'Start a new project' },
    { id: '2', label: 'Open Project', description: 'Open existing project' },
    { id: '3', label: 'Settings', description: 'Configure preferences' },
    { id: '4', label: 'Exit', description: 'Quit the application' }
  ];

  const handleSelect = (item: Item) => {
    console.log('Selected:', item.label);
  };

  return <ListView items={items} onSelect={handleSelect} />;
};

render(<App />);
```

### Form with Multiple Inputs

```tsx
import { useState } from 'react';
import { render, Box, Text, useInput, useFocus, useFocusManager } from 'ink';

interface TextInputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  id: string;
}

const TextInputField = ({ label, value, onChange, id }: TextInputFieldProps) => {
  const { isFocused } = useFocus({ id });

  useInput((input, key) => {
    if (!isFocused) return;

    if (key.backspace || key.delete) {
      onChange(value.slice(0, -1));
    } else if (!key.return && !key.tab && !key.escape && input) {
      onChange(value + input);
    }
  }, { isActive: isFocused });

  return (
    <Box marginBottom={1}>
      <Box width={15}>
        <Text color={isFocused ? 'cyan' : 'white'}>{label}:</Text>
      </Box>
      <Box
        borderStyle={isFocused ? 'round' : 'single'}
        borderColor={isFocused ? 'cyan' : 'gray'}
        paddingX={1}
        width={30}
      >
        <Text>
          {value || <Text color="gray">Enter {label.toLowerCase()}...</Text>}
          {isFocused && <Text color="cyan">|</Text>}
        </Text>
      </Box>
    </Box>
  );
};

const Form = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { focusNext, focusPrevious } = useFocusManager();

  useInput((input, key) => {
    if (key.tab) {
      if (key.shift) {
        focusPrevious();
      } else {
        focusNext();
      }
    } else if (key.return) {
      setSubmitted(true);
    }
  });

  if (submitted) {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor="green" padding={1}>
        <Text bold color="green">Form Submitted!</Text>
        <Box marginTop={1} flexDirection="column">
          <Text>Name: {name}</Text>
          <Text>Email: {email}</Text>
          <Text>Password: {'*'.repeat(password.length)}</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" borderStyle="round" padding={1}>
      <Text bold color="cyan">Registration Form</Text>
      <Box marginTop={1} flexDirection="column">
        <TextInputField id="name" label="Name" value={name} onChange={setName} />
        <TextInputField id="email" label="Email" value={email} onChange={setEmail} />
        <TextInputField id="password" label="Password" value={password} onChange={setPassword} />
      </Box>
      <Box marginTop={1}>
        <Text color="gray">Tab to navigate, Enter to submit</Text>
      </Box>
    </Box>
  );
};

render(<Form />);
```

### Dashboard with Multiple Panels

```tsx
import { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';

// Panel Component
const Panel = ({ title, children, width, height, borderColor = 'white' }) => (
  <Box
    flexDirection="column"
    width={width}
    height={height}
    borderStyle="round"
    borderColor={borderColor}
    padding={1}
  >
    <Text bold color="cyan">{title}</Text>
    <Box marginTop={1} flexDirection="column" flexGrow={1}>
      {children}
    </Box>
  </Box>
);

// Stats Panel
const StatsPanel = () => {
  const [stats, setStats] = useState({
    cpu: 45,
    memory: 62,
    disk: 38
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        disk: Math.floor(Math.random() * 100)
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const renderBar = (value: number, color: string) => {
    const filled = Math.floor(value / 5);
    const empty = 20 - filled;
    return (
      <Text>
        <Text color={color}>{'█'.repeat(filled)}</Text>
        <Text color="gray">{'░'.repeat(empty)}</Text>
        <Text> {value}%</Text>
      </Text>
    );
  };

  return (
    <Panel title="System Stats" width={35}>
      <Box flexDirection="column" gap={1}>
        <Box>
          <Box width={8}><Text>CPU</Text></Box>
          {renderBar(stats.cpu, stats.cpu > 80 ? 'red' : 'green')}
        </Box>
        <Box>
          <Box width={8}><Text>Memory</Text></Box>
          {renderBar(stats.memory, stats.memory > 80 ? 'red' : 'yellow')}
        </Box>
        <Box>
          <Box width={8}><Text>Disk</Text></Box>
          {renderBar(stats.disk, stats.disk > 80 ? 'red' : 'cyan')}
        </Box>
      </Box>
    </Panel>
  );
};

// Tasks Panel
const TasksPanel = () => {
  const tasks = [
    { name: 'Build project', status: 'done' },
    { name: 'Run tests', status: 'running' },
    { name: 'Deploy', status: 'pending' },
    { name: 'Notify team', status: 'pending' }
  ];

  const statusIcon = (status: string) => {
    switch (status) {
      case 'done': return <Text color="green">✓</Text>;
      case 'running': return <Text color="yellow">⟳</Text>;
      case 'pending': return <Text color="gray">○</Text>;
      default: return <Text>-</Text>;
    }
  };

  return (
    <Panel title="Tasks" width={30}>
      <Box flexDirection="column">
        {tasks.map((task, i) => (
          <Box key={i}>
            {statusIcon(task.status)}
            <Text color={task.status === 'done' ? 'gray' : 'white'}>
              {' '}{task.name}
            </Text>
          </Box>
        ))}
      </Box>
    </Panel>
  );
};

// Logs Panel
const LogsPanel = () => {
  const [logs] = useState([
    { time: '12:01:23', level: 'info', msg: 'Server started' },
    { time: '12:01:24', level: 'info', msg: 'Connected to database' },
    { time: '12:01:25', level: 'warn', msg: 'Cache miss rate high' },
    { time: '12:01:26', level: 'error', msg: 'Failed to load config' },
    { time: '12:01:27', level: 'info', msg: 'Retrying...' }
  ]);

  const levelColor = (level: string) => {
    switch (level) {
      case 'info': return 'cyan';
      case 'warn': return 'yellow';
      case 'error': return 'red';
      default: return 'white';
    }
  };

  return (
    <Panel title="Recent Logs" width={65}>
      <Box flexDirection="column">
        {logs.map((log, i) => (
          <Box key={i}>
            <Text color="gray">{log.time} </Text>
            <Box width={7}>
              <Text color={levelColor(log.level)}>[{log.level.toUpperCase()}]</Text>
            </Box>
            <Text> {log.msg}</Text>
          </Box>
        ))}
      </Box>
    </Panel>
  );
};

// Main Dashboard
const Dashboard = () => {
  const { exit } = useApp();

  useInput((input, key) => {
    if (input === 'q' || key.escape) {
      exit();
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="magenta">
          ╔══════════════════════════════════════╗
          ║        SaaSKit Dashboard             ║
          ╚══════════════════════════════════════╝
        </Text>
      </Box>

      <Box flexDirection="row" gap={1}>
        <StatsPanel />
        <TasksPanel />
      </Box>

      <Box marginTop={1}>
        <LogsPanel />
      </Box>

      <Box marginTop={1}>
        <Text color="gray">Press 'q' or Escape to exit</Text>
      </Box>
    </Box>
  );
};

render(<Dashboard />);
```

---

## Quick Reference

### Installation

```bash
npm install ink react
# or
yarn add ink react
# or
pnpm add ink react
```

### Basic App Structure

```tsx
import { render, Box, Text } from 'ink';

const App = () => (
  <Box flexDirection="column">
    <Text>Hello, Ink!</Text>
  </Box>
);

render(<App />);
```

### Key Hooks

| Hook | Purpose |
|------|---------|
| `useInput` | Handle keyboard input |
| `useFocus` | Manage component focus state |
| `useFocusManager` | Programmatic focus control |
| `useApp` | Access app instance (exit) |
| `useStdin` | Access stdin stream |
| `useStdout` | Access stdout stream |

### Key Components

| Component | Purpose |
|-----------|---------|
| `Box` | Flexbox container |
| `Text` | Styled text |
| `Newline` | Line break |
| `Spacer` | Flexible space |
| `Static` | Non-updating output |
| `Transform` | Output transformation |

---

## Sources

- [Ink GitHub Repository](https://github.com/vadimdemedes/ink)
- [Ink UI Components](https://github.com/vadimdemedes/ink-ui)
- [ink-select-input](https://github.com/vadimdemedes/ink-select-input)
- [ink-text-input](https://github.com/vadimdemedes/ink-text-input)
- [ink-spinner](https://github.com/vadimdemedes/ink-spinner)
- [ink-table](https://github.com/maticzav/ink-table)
- [fullscreen-ink](https://github.com/DaniGuardiola/fullscreen-ink)
- [Bun Compatibility Issues](https://github.com/oven-sh/bun/issues/6862)
- [LogRocket - Using Ink UI](https://blog.logrocket.com/using-ink-ui-react-build-interactive-custom-clis/)
- [DEV Community - Building Reactive CLIs](https://dev.to/skirianov/building-reactive-clis-with-ink-react-cli-library-4jpa)
