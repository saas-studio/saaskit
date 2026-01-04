# Detail View Pattern

## Overview

The detail view displays comprehensive information about a single item with expandable sections, related data, and contextual actions.

## Visual Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ← Back to Projects                                                     │
│                                                                         │
│  █ api-gateway                                              ● Active   │
│  Production API Gateway Service                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  ┌─ Overview ─────────────────────────────────────────────────────────┐ │
│  │                                                                     │ │
│  │  CREATED        UPDATED         OWNER           REGION             │ │
│  │  Jan 15, 2024   2 hours ago     sarah@co.com    us-east-1          │ │
│  │                                                                     │ │
│  │  DESCRIPTION                                                        │ │
│  │  Main API gateway for all production traffic. Handles auth,        │ │
│  │  rate limiting, and request routing.                               │ │
│  │                                                                     │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ▶ Deployments (3)                                                     │
│  ▶ Environment Variables (12)                                          │
│  ▼ Metrics ──────────────────────────────────────────────────────────  │
│  │                                                                     │
│  │  REQUESTS/MIN    LATENCY (p99)    ERROR RATE     UPTIME            │
│  │  ▲ 1,234         45ms             0.02%          99.99%            │
│  │                                                                     │
│  │  Last 24 hours:                                                    │
│  │  ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄▅▆           │
│  │                                                                     │
│  └─────────────────────────────────────────────────────────────────────  │
│  ▶ Logs                                                                │
│  ▶ Settings                                                            │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│  [Edit] [Restart] [Delete]                          Tab/↑↓ Navigate   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Section States

### Collapsed Section
```
▶ Deployments (3)
```

### Expanded Section
```
▼ Deployments (3) ─────────────────────────────────────────────────────
│
│  VERSION    STATUS      DEPLOYED          COMMIT
│  v2.3.1     ● Live      2 hours ago       a1b2c3d Fix rate limiting
│  v2.3.0     ○ Previous  1 day ago         e4f5g6h Add caching
│  v2.2.9     ○ Archived  1 week ago        h7i8j9k Update deps
│
└───────────────────────────────────────────────────────────────────────
```

### Focused Section (keyboard navigation)
```
┃▼ Deployments (3) ────────────────────────────────────────────────────
┃│
┃│  VERSION    STATUS      DEPLOYED          COMMIT
┃│  v2.3.1     ● Live      2 hours ago       a1b2c3d Fix rate limiting
┃│
┃└──────────────────────────────────────────────────────────────────────

Blue left border indicates focused section
Press Enter/Space to collapse, Tab to enter section
```

### Loading Section
```
▼ Metrics ─────────────────────────────────────────────────────────────
│
│  ⠋ Loading metrics...
│
│  ░░░░░░░░░░░░░    ░░░░░░░░░    ░░░░░░░░░    ░░░░░░░░░
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
│
└───────────────────────────────────────────────────────────────────────
```

### Error in Section
```
▼ Logs ────────────────────────────────────────────────────────────────
│
│  ✗ Failed to load logs
│
│  Connection timed out after 30 seconds.
│  The logging service may be temporarily unavailable.
│
│  [↻ Retry]  [View Status Page]
│
└───────────────────────────────────────────────────────────────────────
```

## Header Patterns

### Status Header
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  █ api-gateway                                          ● Active   │
│  Production API Gateway Service                                     │
│                                                                     │
│  Created Jan 15, 2024 by sarah@company.com                         │
│  Last updated 2 hours ago                                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Status indicator with color + icon:
● Active  (green)
◐ Building (blue, animated)
○ Stopped (gray)
✗ Error   (red)
⚠ Warning (amber)
```

### With Tags/Labels
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  █ api-gateway                                          ● Active   │
│  Production API Gateway Service                                     │
│                                                                     │
│  [production] [api] [critical]                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Tags use inverse colors or borders:
[production]  = inverse primary for environment
[api]         = dimmed border for category
[critical]    = inverse red for priority
```

## Metadata Display

### Key-Value Grid
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  CREATED           UPDATED           OWNER            REGION       │
│  Jan 15, 2024      2 hours ago       sarah@co.com     us-east-1    │
│                                                                     │
│  RUNTIME           MEMORY            INSTANCES        TIER         │
│  Node.js 20        512 MB            3                Pro          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Labels: uppercase, dim, small
Values: normal weight, primary text color
```

### Stacked Key-Value
```
┌─────────────────────────────────────────────────────────────────────┐
│  DESCRIPTION                                                        │
│  Main API gateway for all production traffic. Handles               │
│  authentication, rate limiting, and request routing to              │
│  backend services.                                                  │
│                                                                     │
│  REPOSITORY                                                         │
│  github.com/company/api-gateway                                     │
│                                                                     │
│  DOCUMENTATION                                                      │
│  docs.company.com/api-gateway                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Related Items Section

```
▼ Related Services (4) ────────────────────────────────────────────────
│
│  › auth-service        ● Active    Provides authentication
│    user-service        ● Active    User management
│    billing-service     ◐ Building  Payment processing
│    notification-svc    ⚠ Warning   Email/SMS notifications
│
│  [+ Add Dependency]
│
└───────────────────────────────────────────────────────────────────────

Navigation works like a mini-table within the section
```

## Keyboard Navigation

```
┌─────────────────────────────────────────────────────────────────────┐
│  KEY           ACTION                                               │
├─────────────────────────────────────────────────────────────────────┤
│  Escape / q    Go back to list                                     │
│  ↑ / k         Previous section                                    │
│  ↓ / j         Next section                                        │
│  Enter / l     Expand section / Enter section                       │
│  h / Backspace  Collapse section / Exit section                     │
│  Tab           Next focusable element                               │
│  Shift+Tab     Previous focusable element                           │
│  e             Edit item                                            │
│  r             Refresh data                                         │
│  ?             Show keyboard shortcuts                              │
│                                                                     │
│  Within expanded section:                                           │
│  ↑↓            Navigate items in section                           │
│  Enter         Select/open item                                     │
│  Escape        Exit section, focus section header                  │
└─────────────────────────────────────────────────────────────────────┘
```

## Animation Patterns

### Section Expand Animation
```
Frame 0: ▶ Deployments (3)
Frame 1: ▼ Deployments (3)
         │
         │  (content expanding, 1 line visible)
Frame 2: ▼ Deployments (3) ─────────
         │
         │  VERSION    STATUS...
         │  (more lines appearing)
Frame 3: Full content visible

Duration: 150ms, ease-out
```

### Section Collapse Animation
```
Frame 0: Full content visible
Frame 1: Content fading, height reducing
Frame 2: ▶ Deployments (3)

Duration: 100ms, ease-in
```

### Data Refresh Animation
```
Frame 0: Current data visible
Frame 1: ↻ icon spins next to section title
Frame 2: Data pulses (brief highlight)
Frame 3: New data displayed, changes highlighted in green/red

Duration: 200ms for transition
Changed values flash briefly
```

## React Ink Implementation

```tsx
import React, { useState, useCallback } from 'react';
import { Box, Text, useInput, useFocus } from 'ink';

// Collapsible section component
interface SectionProps {
  title: string;
  count?: number;
  defaultExpanded?: boolean;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({
  title,
  count,
  defaultExpanded = false,
  loading,
  error,
  onRetry,
  children,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { isFocused } = useFocus();

  useInput((input, key) => {
    if (!isFocused) return;

    if (key.return || input === ' ') {
      setExpanded(e => !e);
    }
    if (input === 'l' && !expanded) {
      setExpanded(true);
    }
    if (input === 'h' && expanded) {
      setExpanded(false);
    }
  });

  return (
    <Box flexDirection="column">
      {/* Section header */}
      <Box>
        <Text color={isFocused ? '#3B82F6' : '#3F3F46'}>
          {isFocused ? '┃' : ' '}
        </Text>
        <Text color={isFocused ? '#3B82F6' : '#E4E4E7'}>
          {expanded ? '▼' : '▶'} {title}
        </Text>
        {count !== undefined && (
          <Text color="#71717A"> ({count})</Text>
        )}
        {expanded && (
          <Text color="#3F3F46">
            {' '}{'─'.repeat(50)}
          </Text>
        )}
      </Box>

      {/* Section content */}
      {expanded && (
        <Box flexDirection="column" paddingLeft={2}>
          <Text color="#3F3F46">│</Text>

          {loading ? (
            <Box>
              <Text color="#3F3F46">│  </Text>
              <Text color="#3B82F6">⠋</Text>
              <Text> Loading...</Text>
            </Box>
          ) : error ? (
            <Box flexDirection="column">
              <Box>
                <Text color="#3F3F46">│  </Text>
                <Text color="#EF4444">✗ {error}</Text>
              </Box>
              {onRetry && (
                <Box>
                  <Text color="#3F3F46">│  </Text>
                  <Text color="#3B82F6">[↻ Retry]</Text>
                </Box>
              )}
            </Box>
          ) : (
            <Box flexDirection="column">
              {React.Children.map(children, child => (
                <Box>
                  <Text color="#3F3F46">│  </Text>
                  {child}
                </Box>
              ))}
            </Box>
          )}

          <Text color="#3F3F46">└{'─'.repeat(55)}</Text>
        </Box>
      )}
    </Box>
  );
};

// Detail header component
interface DetailHeaderProps {
  title: string;
  subtitle?: string;
  status?: 'active' | 'building' | 'stopped' | 'error' | 'warning';
  tags?: string[];
  metadata?: Array<{ label: string; value: string }>;
  onBack?: () => void;
}

export const DetailHeader: React.FC<DetailHeaderProps> = ({
  title,
  subtitle,
  status,
  tags,
  metadata,
  onBack,
}) => {
  const statusConfig = {
    active: { icon: '●', color: '#22C55E', label: 'Active' },
    building: { icon: '◐', color: '#3B82F6', label: 'Building' },
    stopped: { icon: '○', color: '#71717A', label: 'Stopped' },
    error: { icon: '✗', color: '#EF4444', label: 'Error' },
    warning: { icon: '⚠', color: '#F59E0B', label: 'Warning' },
  };

  const statusInfo = status ? statusConfig[status] : null;

  return (
    <Box flexDirection="column">
      {/* Back navigation */}
      {onBack && (
        <Box marginBottom={1}>
          <Text color="#3B82F6">← Back</Text>
          <Text color="#71717A"> (Esc)</Text>
        </Box>
      )}

      {/* Title row */}
      <Box justifyContent="space-between">
        <Box>
          <Text color="#3B82F6" bold>█ </Text>
          <Text bold>{title}</Text>
        </Box>
        {statusInfo && (
          <Text color={statusInfo.color}>
            {statusInfo.icon} {statusInfo.label}
          </Text>
        )}
      </Box>

      {/* Subtitle */}
      {subtitle && (
        <Text color="#A1A1AA">{subtitle}</Text>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <Box marginTop={1} gap={1}>
          {tags.map((tag, i) => (
            <Text key={i} color="#71717A">[{tag}]</Text>
          ))}
        </Box>
      )}

      {/* Metadata grid */}
      {metadata && metadata.length > 0 && (
        <Box marginTop={1} flexWrap="wrap">
          {metadata.map((item, i) => (
            <Box key={i} width="25%" flexDirection="column">
              <Text color="#71717A" bold>
                {item.label.toUpperCase()}
              </Text>
              <Text>{item.value}</Text>
            </Box>
          ))}
        </Box>
      )}

      {/* Divider */}
      <Box marginTop={1}>
        <Text color="#3F3F46">{'─'.repeat(70)}</Text>
      </Box>
    </Box>
  );
};

// Key-value display component
interface KeyValueProps {
  items: Array<{ key: string; value: React.ReactNode }>;
  columns?: number;
}

export const KeyValue: React.FC<KeyValueProps> = ({ items, columns = 4 }) => {
  const width = Math.floor(100 / columns);

  return (
    <Box flexWrap="wrap">
      {items.map((item, i) => (
        <Box key={i} width={`${width}%`} flexDirection="column" marginBottom={1}>
          <Text color="#71717A" bold>
            {item.key.toUpperCase()}
          </Text>
          <Text>{item.value}</Text>
        </Box>
      ))}
    </Box>
  );
};

// Complete detail view example
const ProjectDetailView = () => {
  const [activeSection, setActiveSection] = useState(0);

  return (
    <Box flexDirection="column" padding={1}>
      <DetailHeader
        title="api-gateway"
        subtitle="Production API Gateway Service"
        status="active"
        tags={['production', 'api', 'critical']}
        metadata={[
          { label: 'Created', value: 'Jan 15, 2024' },
          { label: 'Updated', value: '2 hours ago' },
          { label: 'Owner', value: 'sarah@co.com' },
          { label: 'Region', value: 'us-east-1' },
        ]}
        onBack={() => {}}
      />

      <Box flexDirection="column" marginTop={1} gap={1}>
        <Section title="Overview" defaultExpanded>
          <Text>
            Main API gateway for all production traffic.
            Handles authentication, rate limiting, and request routing.
          </Text>
        </Section>

        <Section title="Deployments" count={3}>
          <Text>v2.3.1  ● Live      2 hours ago</Text>
          <Text>v2.3.0  ○ Previous  1 day ago</Text>
          <Text>v2.2.9  ○ Archived  1 week ago</Text>
        </Section>

        <Section title="Environment Variables" count={12}>
          <Text>DATABASE_URL = ●●●●●●●●</Text>
          <Text>API_KEY = ●●●●●●●●</Text>
          <Text color="#71717A">... 10 more</Text>
        </Section>

        <Section title="Metrics" defaultExpanded>
          <KeyValue
            items={[
              { key: 'Requests/min', value: '▲ 1,234' },
              { key: 'Latency (p99)', value: '45ms' },
              { key: 'Error Rate', value: '0.02%' },
              { key: 'Uptime', value: '99.99%' },
            ]}
          />
          <Text color="#71717A">
            ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄▅▆▇█▇▆▅▄▃▂▁
          </Text>
        </Section>

        <Section title="Logs" loading>
          {null}
        </Section>

        <Section
          title="Settings"
          error="Failed to load settings"
          onRetry={() => {}}
        >
          {null}
        </Section>
      </Box>

      {/* Action bar */}
      <Box marginTop={1} borderStyle="single" borderTop borderColor="#3F3F46">
        <Text color="#3B82F6">[e] Edit</Text>
        <Text color="#3F3F46"> │ </Text>
        <Text color="#3B82F6">[r] Restart</Text>
        <Text color="#3F3F46"> │ </Text>
        <Text color="#EF4444">[d] Delete</Text>
        <Box flexGrow={1} />
        <Text color="#71717A">Tab/↑↓ Navigate</Text>
      </Box>
    </Box>
  );
};
```

## Live-Updating Sections

```tsx
// Section that auto-refreshes
interface LiveSectionProps extends SectionProps {
  refreshInterval?: number;
  onRefresh: () => Promise<void>;
}

const LiveSection: React.FC<LiveSectionProps> = ({
  refreshInterval = 30000,
  onRefresh,
  children,
  ...props
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(async () => {
      setIsRefreshing(true);
      await onRefresh();
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, refreshInterval);

    return () => clearInterval(timer);
  }, [refreshInterval, onRefresh]);

  return (
    <Section {...props}>
      <Box justifyContent="space-between" marginBottom={1}>
        <Text color="#71717A">
          Updated {formatTimeAgo(lastUpdated)}
        </Text>
        {isRefreshing && (
          <Text color="#3B82F6">↻ Refreshing...</Text>
        )}
      </Box>
      {children}
    </Section>
  );
};
```
