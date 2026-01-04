# Typography System

## Text Styles

Terminal typography uses a monospace font with styling applied through ANSI escape codes. React Ink abstracts these into readable props.

## Style Matrix

```
┌────────────────────────────────────────────────────────────────────┐
│  STYLE              EFFECT                 USE CASE               │
├────────────────────────────────────────────────────────────────────┤
│  bold               ████ Heavier           Headings, emphasis     │
│  dim                ░░░░ Lighter           Secondary, disabled    │
│  italic             Slanted text           Hints, quotes          │
│  underline          Text̲ w̲i̲t̲h̲ l̲i̲n̲e̲          Links, actionable      │
│  strikethrough      T̶e̶x̶t̶ ̶c̶r̶o̶s̶s̶e̶d̶          Deleted, unavailable   │
│  inverse            ████████               Selection, highlight   │
└────────────────────────────────────────────────────────────────────┘
```

## Typography Scale

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ██████████████████████████████████████                            │
│  DISPLAY                                                            │
│  Large ASCII art or banner text for hero sections                   │
│                                                                     │
│  ──────────────────────────────────────                            │
│                                                                     │
│  ████ HEADING 1 (bold)                                             │
│  Primary page/section titles                                        │
│                                                                     │
│  ███ Heading 2 (bold)                                              │
│  Subsection titles                                                  │
│                                                                     │
│  Heading 3 (bold, dimmed slightly)                                 │
│  Card titles, group labels                                          │
│                                                                     │
│  Body (normal)                                                      │
│  Main content text, descriptions                                    │
│                                                                     │
│  Caption (dim)                                                      │
│  Timestamps, metadata, hints                                        │
│                                                                     │
│  Label (bold, uppercase, small)                                     │
│  FORM LABELS, SECTION HEADERS                                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Text Style Tokens

```typescript
// typography.ts
export const typography = {
  display: {
    bold: true,
    // Usually combined with figlet/ASCII art
  },

  h1: {
    bold: true,
    // Full brightness, primary color
  },

  h2: {
    bold: true,
    // Slightly smaller visual weight
  },

  h3: {
    bold: true,
    dimColor: false,
  },

  body: {
    bold: false,
    dimColor: false,
  },

  caption: {
    bold: false,
    dimColor: true,
  },

  label: {
    bold: true,
    // Rendered uppercase
  },

  code: {
    // Wrapped in backticks or special background
    inverse: false,
  },

  link: {
    underline: true,
    // Primary color
  },
} as const;
```

## Combining Styles

### Emphasis Hierarchy
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  This is normal text with some **bold emphasis** and               │
│  some _italic_ for softer emphasis. You can combine                │
│  **_bold italic_** for strong emphasis.                            │
│                                                                     │
│  Secondary text uses dim styling for de-emphasis.                  │
│  Disabled text uses dim + lighter color.                           │
│                                                                     │
│  Links are underlined and blue for discoverability.                │
│  ─────────────────────────────────────────                         │
│                                                                     │
│  Deleted items use strikethrough: ̶R̶e̶m̶o̶v̶e̶d̶ ̶i̶t̶e̶m̶                      │
│  Highlighted text uses inverse: ████████                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## React Ink Typography Components

```tsx
import React from 'react';
import { Text, Box } from 'ink';

// Typography component with preset styles
type TypographyVariant = 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label' | 'code' | 'link';

interface TypographyProps {
  variant?: TypographyVariant;
  color?: string;
  children: React.ReactNode;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color,
  children
}) => {
  const styles: Record<TypographyVariant, object> = {
    h1: { bold: true },
    h2: { bold: true },
    h3: { bold: true, dimColor: false },
    body: {},
    caption: { dimColor: true },
    label: { bold: true },
    code: {},
    link: { underline: true, color: '#3B82F6' },
  };

  const style = styles[variant];

  if (variant === 'label') {
    return (
      <Text {...style} color={color}>
        {String(children).toUpperCase()}
      </Text>
    );
  }

  return (
    <Text {...style} color={color}>
      {children}
    </Text>
  );
};

// Heading component with border
interface HeadingProps {
  level?: 1 | 2 | 3;
  children: React.ReactNode;
}

export const Heading: React.FC<HeadingProps> = ({ level = 1, children }) => {
  const prefixes = {
    1: '█ ',
    2: '▓ ',
    3: '░ ',
  };

  return (
    <Box flexDirection="column">
      <Text bold>
        <Text color="#3B82F6">{prefixes[level]}</Text>
        {children}
      </Text>
      {level === 1 && (
        <Text color="#3F3F46">{'─'.repeat(40)}</Text>
      )}
    </Box>
  );
};

// Code/monospace block
interface CodeBlockProps {
  children: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ children, language }) => {
  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor="#3F3F46"
      paddingX={1}
    >
      {language && (
        <Text dimColor italic>{language}</Text>
      )}
      <Text color="#22D3EE">{children}</Text>
    </Box>
  );
};

// Inline code
export const Code: React.FC<{ children: string }> = ({ children }) => (
  <Text backgroundColor="#27272A" color="#22D3EE"> {children} </Text>
);

// Link text
interface LinkProps {
  url?: string;
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({ url, children }) => (
  <Text underline color="#3B82F6">
    {children}
    {url && <Text dimColor> ({url})</Text>}
  </Text>
);
```

## ASCII Art Headers

For impactful section headers, use ASCII art generated with figlet-style fonts:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ╔═╗┌─┐┌─┐┌─┐╦╔═┬┌┬┐                                               │
│  ╚═╗├─┤├─┤└─┐╠╩╗│ │                                                │
│  ╚═╝┴ ┴┴ ┴└─┘╩ ╩┴ ┴                                                │
│                                                                     │
│  ┏━┓┏━┓┏━┓┏━┓╻┏ ╻╺┳╸                                               │
│  ┗━┓┣━┫┣━┫┗━┓┣┻┓┃ ┃                                                │
│  ┗━┛╹ ╹╹ ╹┗━┛╹ ╹╹ ╹                                                │
│                                                                     │
│   ___  ___   ___  ___   _   ___  _                                 │
│  / __|/ _ \ / _ \/ __| | | / / || |_                               │
│  \__ \ (_) | (_) \__ \ |_  _| || _|                                │
│  |___/\___/ \___/|___/   |_|___|_|                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Text Truncation

```tsx
// Truncate text with ellipsis
interface TruncateProps {
  width: number;
  children: string;
  position?: 'end' | 'middle' | 'start';
}

export const Truncate: React.FC<TruncateProps> = ({
  width,
  children,
  position = 'end'
}) => {
  const text = String(children);

  if (text.length <= width) {
    return <Text>{text}</Text>;
  }

  let truncated: string;

  switch (position) {
    case 'start':
      truncated = '…' + text.slice(-(width - 1));
      break;
    case 'middle':
      const half = Math.floor((width - 1) / 2);
      truncated = text.slice(0, half) + '…' + text.slice(-half);
      break;
    case 'end':
    default:
      truncated = text.slice(0, width - 1) + '…';
  }

  return <Text>{truncated}</Text>;
};

// Example outputs:
// position="end":    "This is a very long tex…"
// position="middle": "This is a…ong text here"
// position="start":  "…very long text here"
```

## Special Text Effects

```tsx
// Blinking text (use sparingly!)
export const Blink: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setInterval(() => setVisible(v => !v), 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <Text color={visible ? '#EF4444' : undefined}>
      {children}
    </Text>
  );
};

// Rainbow text (for celebrations)
export const Rainbow: React.FC<{ children: string }> = ({ children }) => {
  const colors = ['#EF4444', '#F59E0B', '#22C55E', '#06B6D4', '#3B82F6', '#8B5CF6'];

  return (
    <Text>
      {children.split('').map((char, i) => (
        <Text key={i} color={colors[i % colors.length]}>
          {char}
        </Text>
      ))}
    </Text>
  );
};

// Gradient text
export const Gradient: React.FC<{
  children: string;
  from: string;
  to: string;
}> = ({ children, from, to }) => {
  const interpolateColor = (start: string, end: string, factor: number) => {
    // Parse hex colors and interpolate
    const s = parseInt(start.slice(1), 16);
    const e = parseInt(end.slice(1), 16);

    const r = Math.round(((s >> 16) & 255) + factor * (((e >> 16) & 255) - ((s >> 16) & 255)));
    const g = Math.round(((s >> 8) & 255) + factor * (((e >> 8) & 255) - ((s >> 8) & 255)));
    const b = Math.round((s & 255) + factor * ((e & 255) - (s & 255)));

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  const chars = children.split('');
  const len = chars.length;

  return (
    <Text>
      {chars.map((char, i) => (
        <Text key={i} color={interpolateColor(from, to, i / (len - 1))}>
          {char}
        </Text>
      ))}
    </Text>
  );
};
```

## Usage Examples

```tsx
// Complete typography example
const TypographyDemo = () => (
  <Box flexDirection="column" gap={1}>
    <Heading level={1}>Dashboard Overview</Heading>

    <Typography variant="body">
      Welcome to your SaaS dashboard. Here you can manage all your resources.
    </Typography>

    <Typography variant="caption">
      Last updated: 2 minutes ago
    </Typography>

    <Box marginTop={1}>
      <Typography variant="label">Quick Actions</Typography>
    </Box>

    <Text>
      Press <Code>?</Code> for help or <Link>view documentation</Link>
    </Text>

    <Box marginTop={1}>
      <StatusBadge status="success">All systems operational</StatusBadge>
    </Box>
  </Box>
);
```
