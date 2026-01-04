# Form View Pattern

## Overview

Forms are critical for data entry in SaaS applications. This pattern covers input fields, validation feedback, and form navigation for terminal UIs.

## Visual Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  █ Create New Project                                                   │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  PROJECT DETAILS                                                        │
│                                                                         │
│  Name *                                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ my-awesome-project█                                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  ✓ Valid project name                                                  │
│                                                                         │
│  Description                                                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ A brief description of your project...                          │   │
│  │                                                                   │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Region *                                                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ › US East (N. Virginia)                                    ▼    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Environment                                                            │
│  ○ Development   ● Production   ○ Staging                              │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  [Cancel]                                              [Create Project] │
│                                                                         │
│  Tab/↑↓ Navigate fields   Enter Submit   Esc Cancel                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Input Field States

### Text Input

```
┌─────────────────────────────────────────────────────────────────────┐
│  DEFAULT (unfocused, empty)                                         │
│                                                                     │
│  Email                                                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Enter your email...                                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  Placeholder text in dim color                                     │
├─────────────────────────────────────────────────────────────────────┤
│  FOCUSED (active input)                                             │
│                                                                     │
│  Email                                                              │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │
│  ┃ user@example█                                                ┃   │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │
│  Blue border, cursor visible (█ blinking)                          │
├─────────────────────────────────────────────────────────────────────┤
│  FILLED (unfocused, has value)                                     │
│                                                                     │
│  Email                                                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ user@example.com                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  Normal text color, default border                                 │
├─────────────────────────────────────────────────────────────────────┤
│  VALID (with success indicator)                                     │
│                                                                     │
│  Email                                                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ user@example.com                                         ✓   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ✓ Valid email address                                             │
│  Green checkmark and helper text                                   │
├─────────────────────────────────────────────────────────────────────┤
│  ERROR (validation failed)                                         │
│                                                                     │
│  Email *                                                            │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │
│  ┃ not-an-email                                             ✗   ┃   │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │
│  ✗ Please enter a valid email address                              │
│  Red border, error icon, error message                             │
├─────────────────────────────────────────────────────────────────────┤
│  DISABLED                                                           │
│                                                                     │
│  Email                                                              │
│  ┌┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┐   │
│  │ user@example.com                                             │   │
│  └┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘   │
│  Dashed border, dim text, not focusable                            │
└─────────────────────────────────────────────────────────────────────┘
```

### Select/Dropdown

```
┌─────────────────────────────────────────────────────────────────────┐
│  CLOSED (default)                                                   │
│                                                                     │
│  Region *                                                           │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ US East (N. Virginia)                                   ▼    │   │
│  └─────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│  FOCUSED (ready to open)                                           │
│                                                                     │
│  Region *                                                           │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │
│  ┃ US East (N. Virginia)                                   ▼    ┃   │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │
│  Press Enter or Space to open                                      │
├─────────────────────────────────────────────────────────────────────┤
│  OPEN (dropdown expanded)                                          │
│                                                                     │
│  Region *                                                           │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │
│  ┃ US East (N. Virginia)                                   ▲    ┃   │
│  ┠─────────────────────────────────────────────────────────────┨   │
│  ┃ › US East (N. Virginia)        ✓                             ┃   │
│  ┃   US West (Oregon)                                           ┃   │
│  ┃   EU (Ireland)                                               ┃   │
│  ┃   EU (Frankfurt)                                             ┃   │
│  ┃   Asia Pacific (Tokyo)                                       ┃   │
│  ┃   Asia Pacific (Sydney)                                      ┃   │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │
│  ↑↓ Navigate  Enter Select  Esc Close                             │
└─────────────────────────────────────────────────────────────────────┘
```

### Radio Group

```
┌─────────────────────────────────────────────────────────────────────┐
│  HORIZONTAL LAYOUT                                                  │
│                                                                     │
│  Environment                                                        │
│  ○ Development   ● Production   ○ Staging                          │
│                                                                     │
│  Selected option shown with filled circle (●)                      │
│  Unselected options with empty circle (○)                          │
├─────────────────────────────────────────────────────────────────────┤
│  VERTICAL LAYOUT (with descriptions)                               │
│                                                                     │
│  Plan                                                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ ○ Starter - $0/mo                                            │   │
│  │   For individuals and small projects                         │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ ● Pro - $29/mo                                    SELECTED   │   │
│  │   For growing teams and businesses                           │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ ○ Enterprise - Custom                                        │   │
│  │   For large organizations with custom needs                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│  WITH FOCUS INDICATOR                                              │
│                                                                     │
│  Environment                                                        │
│  ○ Development  ┃● Production┃  ○ Staging                          │
│                  └── focused ──┘                                   │
│  Blue border around focused option                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Checkbox Group

```
┌─────────────────────────────────────────────────────────────────────┐
│  STANDARD CHECKBOXES                                               │
│                                                                     │
│  Notifications                                                      │
│  ☑ Email notifications                                             │
│  ☑ Push notifications                                              │
│  ☐ SMS notifications                                               │
│  ☐ Weekly digest                                                   │
│                                                                     │
│  ☑ = checked, ☐ = unchecked                                       │
├─────────────────────────────────────────────────────────────────────┤
│  WITH FOCUS                                                         │
│                                                                     │
│  Notifications                                                      │
│  ☑ Email notifications                                             │
│  ┃☑ Push notifications┃  ← focused                                 │
│  ☐ SMS notifications                                               │
├─────────────────────────────────────────────────────────────────────┤
│  INDETERMINATE (parent with mixed children)                        │
│                                                                     │
│  Permissions                                                        │
│  ⊟ All permissions                                                 │
│    ☑ Read                                                          │
│    ☑ Write                                                         │
│    ☐ Delete                                                        │
│    ☐ Admin                                                         │
└─────────────────────────────────────────────────────────────────────┘
```

### Toggle Switch

```
┌─────────────────────────────────────────────────────────────────────┐
│  TOGGLE STATES                                                     │
│                                                                     │
│  OFF:      ○────●  Enable feature                                  │
│  ON:       ●────○  Enable feature                                  │
│                                                                     │
│  ALTERNATIVE STYLE:                                                │
│  OFF:      [   OFF]  Dark mode                                     │
│  ON:       [ON    ]  Dark mode                                     │
│                                                                     │
│  WITH LABELS:                                                       │
│  OFF  ○────●  ON   Auto-deploy                                     │
│       └─ track ─┘                                                  │
│                                                                     │
│  FOCUSED:                                                           │
│  ┃●────○┃  Enable feature                                          │
│  Blue border when focused                                          │
└─────────────────────────────────────────────────────────────────────┘
```

### Multiline Text Area

```
┌─────────────────────────────────────────────────────────────────────┐
│  DEFAULT                                                            │
│                                                                     │
│  Description                                                        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Enter a description...                                       │   │
│  │                                                               │   │
│  │                                                               │   │
│  │                                                          3/500│   │
│  └─────────────────────────────────────────────────────────────┘   │
│  Character count in bottom right                                   │
├─────────────────────────────────────────────────────────────────────┤
│  FOCUSED WITH CONTENT                                              │
│                                                                     │
│  Description                                                        │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │
│  ┃ This is a detailed description of the project.              ┃   │
│  ┃ It can span multiple lines and provides context█             ┃   │
│  ┃                                                               ┃   │
│  ┃                                                         89/500┃   │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │
│  Ctrl+Enter to submit, Shift+Enter for new line                    │
└─────────────────────────────────────────────────────────────────────┘
```

## Validation Patterns

### Inline Validation
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  REAL-TIME (as you type)                                           │
│                                                                     │
│  Password *                                                         │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │
│  ┃ ••••••••█                                                    ┃   │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │
│  ✓ At least 8 characters                                           │
│  ✓ Contains uppercase letter                                       │
│  ✓ Contains number                                                 │
│  ✗ Contains special character                                      │
│                                                                     │
│  Requirements update as user types                                 │
├─────────────────────────────────────────────────────────────────────┤
│  ON BLUR (when leaving field)                                      │
│                                                                     │
│  Email *                                                            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ invalid-email                                            ✗   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ✗ Please enter a valid email address                              │
│                                                                     │
│  Error appears only after user leaves the field                    │
└─────────────────────────────────────────────────────────────────────┘
```

### Form-Level Validation
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ ✗ Please fix the following errors:                            │ │
│  │                                                                │ │
│  │   • Name is required                                          │ │
│  │   • Email must be a valid email address                       │ │
│  │   • Password must be at least 8 characters                    │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  Name *                                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                          ✗   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ✗ Name is required                                                │
│                                                                     │
│  Error summary at top, individual errors at fields                 │
└─────────────────────────────────────────────────────────────────────┘
```

## Form Actions

### Action Bar
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ────────────────────────────────────────────────────────────────   │
│                                                                     │
│  [Cancel]                                        [Save as Draft]    │
│                                                  [Create Project]   │
│                                                                     │
│  Secondary actions on left, primary on right                       │
│  Primary action highlighted (inverse or bold)                      │
│                                                                     │
│  ────────────────────────────────────────────────────────────────   │
│  Tab Navigate  Enter Submit  Esc Cancel                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Submitting State
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  [Cancel]                                       ⠋ Creating...       │
│                                                                     │
│  Form disabled during submission                                   │
│  Spinner replaces submit button text                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Success State
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                                                                │ │
│  │  ✓ Project created successfully!                              │ │
│  │                                                                │ │
│  │  Your project "my-awesome-project" is now ready.             │ │
│  │                                                                │ │
│  │  [View Project]  [Create Another]                             │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Keyboard Navigation

```
┌─────────────────────────────────────────────────────────────────────┐
│  KEY              ACTION                                            │
├─────────────────────────────────────────────────────────────────────┤
│  Tab              Next field                                        │
│  Shift+Tab        Previous field                                    │
│  Enter            Submit form (from last field)                     │
│                   Open dropdown (in select)                         │
│                   Toggle (in checkbox/radio)                        │
│  Space            Toggle checkbox                                   │
│                   Select radio option                               │
│                   Open dropdown                                     │
│  Escape           Cancel / Close dropdown                           │
│  ↑ / ↓            Navigate dropdown options                        │
│                   Navigate radio group (vertical)                   │
│  ← / →            Navigate radio group (horizontal)                 │
│  Home / End       Jump to first/last option                        │
│  Ctrl+Enter       Submit form (from multiline textarea)            │
│                                                                     │
│  In text fields:                                                   │
│  ← / →            Move cursor                                       │
│  Ctrl+← / →       Move by word                                      │
│  Home / End       Jump to start/end of line                        │
│  Backspace        Delete character before cursor                   │
│  Delete           Delete character after cursor                     │
│  Ctrl+A           Select all                                        │
│  Ctrl+C/V         Copy/Paste (if terminal supports)                │
└─────────────────────────────────────────────────────────────────────┘
```

## React Ink Implementation

```tsx
import React, { useState, useCallback } from 'react';
import { Box, Text, useInput, useFocus } from 'ink';

// Text input component
interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  success?: string;
  disabled?: boolean;
  type?: 'text' | 'password' | 'email';
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  success,
  disabled,
  type = 'text',
}) => {
  const { isFocused } = useFocus({ isActive: !disabled });
  const [cursorPos, setCursorPos] = useState(value.length);

  useInput((input, key) => {
    if (!isFocused || disabled) return;

    if (key.backspace || key.delete) {
      if (cursorPos > 0) {
        const newValue = value.slice(0, cursorPos - 1) + value.slice(cursorPos);
        onChange(newValue);
        setCursorPos(c => c - 1);
      }
    } else if (key.leftArrow) {
      setCursorPos(c => Math.max(0, c - 1));
    } else if (key.rightArrow) {
      setCursorPos(c => Math.min(value.length, c + 1));
    } else if (!key.ctrl && !key.meta && input) {
      const newValue = value.slice(0, cursorPos) + input + value.slice(cursorPos);
      onChange(newValue);
      setCursorPos(c => c + input.length);
    }
  }, { isActive: isFocused && !disabled });

  // Determine border style and color
  const getBorderStyle = () => {
    if (disabled) return 'single';
    if (isFocused) return 'bold';
    return 'single';
  };

  const getBorderColor = () => {
    if (disabled) return '#52525B';
    if (error) return '#EF4444';
    if (success) return '#22C55E';
    if (isFocused) return '#3B82F6';
    return '#3F3F46';
  };

  // Display value (mask password)
  const displayValue = type === 'password' ? '•'.repeat(value.length) : value;

  // Insert cursor
  const renderValue = () => {
    if (!isFocused) {
      if (!value && placeholder) {
        return <Text color="#71717A">{placeholder}</Text>;
      }
      return <Text color={disabled ? '#52525B' : undefined}>{displayValue}</Text>;
    }

    const before = displayValue.slice(0, cursorPos);
    const after = displayValue.slice(cursorPos);

    return (
      <Text>
        {before}
        <Text color="#3B82F6" bold>█</Text>
        {after}
      </Text>
    );
  };

  return (
    <Box flexDirection="column" marginBottom={1}>
      {/* Label */}
      <Text color={disabled ? '#52525B' : '#A1A1AA'}>
        {label}
        {required && <Text color="#EF4444"> *</Text>}
      </Text>

      {/* Input box */}
      <Box
        borderStyle={getBorderStyle()}
        borderColor={getBorderColor()}
        paddingX={1}
      >
        <Box flexGrow={1}>
          {renderValue()}
        </Box>
        {/* Status icon */}
        {error && <Text color="#EF4444">✗</Text>}
        {success && !error && <Text color="#22C55E">✓</Text>}
      </Box>

      {/* Helper text */}
      {error && (
        <Text color="#EF4444">✗ {error}</Text>
      )}
      {success && !error && (
        <Text color="#22C55E">✓ {success}</Text>
      )}
    </Box>
  );
};

// Select dropdown component
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  options,
  onChange,
  required,
  error,
  placeholder = 'Select an option...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const { isFocused } = useFocus();

  const selectedOption = options.find(o => o.value === value);

  useInput((input, key) => {
    if (!isFocused) return;

    if (key.return || input === ' ') {
      if (isOpen) {
        onChange(options[highlightedIndex].value);
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    }

    if (key.escape && isOpen) {
      setIsOpen(false);
    }

    if (isOpen) {
      if (key.upArrow) {
        setHighlightedIndex(i => Math.max(0, i - 1));
      }
      if (key.downArrow) {
        setHighlightedIndex(i => Math.min(options.length - 1, i + 1));
      }
    }
  });

  return (
    <Box flexDirection="column" marginBottom={1}>
      {/* Label */}
      <Text color="#A1A1AA">
        {label}
        {required && <Text color="#EF4444"> *</Text>}
      </Text>

      {/* Select box */}
      <Box
        flexDirection="column"
        borderStyle={isFocused ? 'bold' : 'single'}
        borderColor={error ? '#EF4444' : isFocused ? '#3B82F6' : '#3F3F46'}
      >
        {/* Current value */}
        <Box paddingX={1} justifyContent="space-between">
          <Text color={selectedOption ? undefined : '#71717A'}>
            {selectedOption?.label || placeholder}
          </Text>
          <Text>{isOpen ? '▲' : '▼'}</Text>
        </Box>

        {/* Dropdown options */}
        {isOpen && (
          <>
            <Box borderStyle="single" borderTop borderColor="#3F3F46" />
            {options.map((option, index) => (
              <Box
                key={option.value}
                paddingX={1}
                backgroundColor={index === highlightedIndex ? '#27272A' : undefined}
              >
                <Text color={index === highlightedIndex ? '#3B82F6' : undefined}>
                  {index === highlightedIndex ? '›' : ' '} {option.label}
                </Text>
                {option.value === value && (
                  <Text color="#22C55E"> ✓</Text>
                )}
              </Box>
            ))}
          </>
        )}
      </Box>

      {/* Error */}
      {error && <Text color="#EF4444">✗ {error}</Text>}
    </Box>
  );
};

// Radio group component
interface RadioGroupProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  direction?: 'horizontal' | 'vertical';
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  value,
  options,
  onChange,
  direction = 'horizontal',
}) => {
  const [focusedIndex, setFocusedIndex] = useState(
    Math.max(0, options.findIndex(o => o.value === value))
  );
  const { isFocused } = useFocus();

  useInput((input, key) => {
    if (!isFocused) return;

    const isHorizontal = direction === 'horizontal';
    const prevKey = isHorizontal ? key.leftArrow : key.upArrow;
    const nextKey = isHorizontal ? key.rightArrow : key.downArrow;

    if (prevKey) {
      setFocusedIndex(i => Math.max(0, i - 1));
    }
    if (nextKey) {
      setFocusedIndex(i => Math.min(options.length - 1, i + 1));
    }
    if (key.return || input === ' ') {
      onChange(options[focusedIndex].value);
    }
  });

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text color="#A1A1AA">{label}</Text>
      <Box flexDirection={direction === 'horizontal' ? 'row' : 'column'} gap={2}>
        {options.map((option, index) => {
          const isSelected = option.value === value;
          const isFocusedOption = isFocused && index === focusedIndex;

          return (
            <Box key={option.value}>
              {isFocusedOption && <Text color="#3B82F6">┃</Text>}
              <Text color={isSelected ? '#3B82F6' : '#71717A'}>
                {isSelected ? '●' : '○'}
              </Text>
              <Text
                color={isFocusedOption ? '#E4E4E7' : isSelected ? undefined : '#A1A1AA'}
              >
                {' '}{option.label}
              </Text>
              {isFocusedOption && <Text color="#3B82F6">┃</Text>}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// Form submit button
interface SubmitButtonProps {
  label: string;
  loading?: boolean;
  disabled?: boolean;
  onSubmit: () => void;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  label,
  loading,
  disabled,
  onSubmit,
}) => {
  const { isFocused } = useFocus({ isActive: !disabled && !loading });

  useInput((input, key) => {
    if (!isFocused || disabled || loading) return;
    if (key.return || input === ' ') {
      onSubmit();
    }
  });

  return (
    <Box>
      <Text
        color={disabled ? '#52525B' : isFocused ? '#18181B' : '#3B82F6'}
        backgroundColor={isFocused && !disabled ? '#3B82F6' : undefined}
        bold={isFocused}
      >
        {loading ? (
          <><Text>⠋</Text> Submitting...</>
        ) : (
          `[${label}]`
        )}
      </Text>
    </Box>
  );
};

// Complete form example
const CreateProjectForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState('');
  const [environment, setEnvironment] = useState('production');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name) newErrors.name = 'Name is required';
    if (!region) newErrors.region = 'Region is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#3B82F6">█ Create New Project</Text>
      <Text color="#3F3F46">{'─'.repeat(60)}</Text>

      <Box marginTop={1} flexDirection="column">
        <TextInput
          label="Name"
          value={name}
          onChange={setName}
          placeholder="my-awesome-project"
          required
          error={errors.name}
        />

        <TextInput
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="A brief description..."
        />

        <Select
          label="Region"
          value={region}
          onChange={setRegion}
          required
          error={errors.region}
          options={[
            { value: 'us-east-1', label: 'US East (N. Virginia)' },
            { value: 'us-west-2', label: 'US West (Oregon)' },
            { value: 'eu-west-1', label: 'EU (Ireland)' },
          ]}
        />

        <RadioGroup
          label="Environment"
          value={environment}
          onChange={setEnvironment}
          options={[
            { value: 'development', label: 'Development' },
            { value: 'production', label: 'Production' },
            { value: 'staging', label: 'Staging' },
          ]}
        />
      </Box>

      <Text color="#3F3F46">{'─'.repeat(60)}</Text>

      <Box justifyContent="space-between" marginTop={1}>
        <Text color="#71717A">[Cancel]</Text>
        <SubmitButton
          label="Create Project"
          loading={isSubmitting}
          onSubmit={handleSubmit}
        />
      </Box>

      <Box marginTop={1}>
        <Text color="#71717A">Tab Navigate  Enter Submit  Esc Cancel</Text>
      </Box>
    </Box>
  );
};
```
