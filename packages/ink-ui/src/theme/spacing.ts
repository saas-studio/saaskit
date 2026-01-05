/**
 * Spacing and Layout System for Terminal UI
 *
 * Defines consistent spacing values, layout patterns, and
 * dimension utilities for terminal-based interfaces.
 */

// =============================================================================
// SPACING SCALE
// =============================================================================

/**
 * Base spacing unit (in terminal character cells)
 * Terminal UIs work in fixed-width character grids, so spacing
 * is measured in character cells rather than pixels.
 */
export const spacing = {
  /** No spacing */
  0: 0,
  /** Minimal spacing - tight grouping */
  1: 1,
  /** Default spacing - most common */
  2: 2,
  /** Comfortable spacing */
  3: 3,
  /** Spacious - section gaps */
  4: 4,
  /** Large gap - major sections */
  6: 6,
  /** Extra large - page sections */
  8: 8,
  /** Maximum - full separation */
  12: 12,
} as const;

export type SpacingKey = keyof typeof spacing;

// =============================================================================
// SEMANTIC SPACING
// =============================================================================

export const semanticSpacing = {
  /** Gap between inline elements */
  inline: spacing[1],
  /** Gap between stacked elements */
  stack: spacing[2],
  /** Padding inside containers */
  inset: spacing[2],
  /** Gap between sections */
  section: spacing[4],
  /** Gap between pages/panels */
  page: spacing[6],
} as const;

// =============================================================================
// COMPONENT-SPECIFIC SPACING
// =============================================================================

export const components = {
  /** Button padding */
  button: {
    paddingX: spacing[2],
    paddingY: spacing[0],
    gap: spacing[1],
  },

  /** Input field spacing */
  input: {
    paddingX: spacing[1],
    paddingY: spacing[0],
    labelGap: spacing[1],
    errorGap: spacing[0],
  },

  /** Card spacing */
  card: {
    padding: spacing[2],
    headerGap: spacing[1],
    contentGap: spacing[2],
  },

  /** Modal spacing */
  modal: {
    padding: spacing[2],
    headerGap: spacing[1],
    footerGap: spacing[2],
  },

  /** Table spacing */
  table: {
    cellPaddingX: spacing[1],
    cellPaddingY: spacing[0],
    headerGap: spacing[0],
    rowGap: spacing[0],
  },

  /** List spacing */
  list: {
    itemGap: spacing[0],
    nestedIndent: spacing[2],
    bulletGap: spacing[1],
  },

  /** Form spacing */
  form: {
    fieldGap: spacing[2],
    groupGap: spacing[4],
    labelGap: spacing[1],
  },

  /** Toast/notification spacing */
  toast: {
    padding: spacing[1],
    stackGap: spacing[1],
  },

  /** Progress bar */
  progress: {
    labelGap: spacing[1],
    valueGap: spacing[1],
  },

  /** Badge spacing */
  badge: {
    paddingX: spacing[1],
    paddingY: spacing[0],
    iconGap: spacing[1],
  },

  /** Tabs spacing */
  tabs: {
    tabGap: spacing[1],
    contentGap: spacing[2],
    tabPaddingX: spacing[2],
  },

  /** Accordion spacing */
  accordion: {
    headerPadding: spacing[1],
    contentPadding: spacing[2],
    itemGap: spacing[0],
  },
} as const;

// =============================================================================
// WIDTH PRESETS
// =============================================================================

export const widths = {
  /** Extra small - badges, status indicators */
  xs: 12,
  /** Small - compact buttons, inputs */
  sm: 20,
  /** Medium - default input width */
  md: 30,
  /** Large - wide inputs, cards */
  lg: 45,
  /** Extra large - modals, wide cards */
  xl: 60,
  /** Full width (use '100%' in Ink) */
  full: 80,

  /** Sidebar widths */
  sidebar: {
    collapsed: 4,
    compact: 20,
    default: 30,
    wide: 40,
  },

  /** Modal widths */
  modal: {
    sm: 40,
    md: 60,
    lg: 80,
    full: '100%',
  },

  /** Table column widths */
  column: {
    icon: 3,
    status: 8,
    badge: 12,
    name: 20,
    email: 30,
    date: 12,
    number: 10,
    action: 10,
  },
} as const;

// =============================================================================
// HEIGHT PRESETS
// =============================================================================

export const heights = {
  /** Single line */
  line: 1,
  /** Input field (with border) */
  input: 3,
  /** Button */
  button: 1,
  /** Card minimum */
  cardMin: 5,
  /** Modal content area */
  modalContent: 15,
  /** List item */
  listItem: 1,

  /** Terminal window heights */
  terminal: {
    compact: 20,
    default: 30,
    tall: 40,
    full: '100%',
  },
} as const;

// =============================================================================
// LAYOUT HELPERS
// =============================================================================

/**
 * Center content horizontally using margin
 */
export const centerH = (width: number, containerWidth: number): number => {
  return Math.floor((containerWidth - width) / 2);
};

/**
 * Center content vertically using margin
 */
export const centerV = (height: number, containerHeight: number): number => {
  return Math.floor((containerHeight - height) / 2);
};

/**
 * Create margin object for centering
 */
export const centerMargin = (
  contentWidth: number,
  contentHeight: number,
  containerWidth: number,
  containerHeight: number,
) => ({
  marginLeft: centerH(contentWidth, containerWidth),
  marginTop: centerV(contentHeight, containerHeight),
});

/**
 * Calculate remaining space after content
 */
export const remainingSpace = (usedSpace: number, totalSpace: number): number => {
  return Math.max(0, totalSpace - usedSpace);
};

/**
 * Distribute space evenly among items
 */
export const distributeSpace = (itemCount: number, totalSpace: number, gap: number = 0): number => {
  const totalGap = gap * (itemCount - 1);
  return Math.floor((totalSpace - totalGap) / itemCount);
};

// =============================================================================
// RESPONSIVE BREAKPOINTS (terminal column widths)
// =============================================================================

export const breakpoints = {
  /** Extra small (80 columns) */
  xs: 80,
  /** Small (100 columns) */
  sm: 100,
  /** Medium (120 columns) */
  md: 120,
  /** Large (150 columns) */
  lg: 150,
  /** Extra large (200+ columns) */
  xl: 200,
} as const;

/**
 * Get current terminal width category
 */
export const getBreakpoint = (columns: number): keyof typeof breakpoints => {
  if (columns < breakpoints.xs) return 'xs';
  if (columns < breakpoints.sm) return 'sm';
  if (columns < breakpoints.md) return 'md';
  if (columns < breakpoints.lg) return 'lg';
  return 'xl';
};

/**
 * Check if terminal is at or above a breakpoint
 */
export const isAtLeast = (columns: number, breakpoint: keyof typeof breakpoints): boolean => {
  return columns >= breakpoints[breakpoint];
};

// =============================================================================
// GRID SYSTEM
// =============================================================================

export const grid = {
  /** Standard 12-column grid */
  columns: 12,

  /** Calculate column width */
  getColumnWidth: (totalWidth: number, columns: number, gap: number = 1): number => {
    const totalGap = gap * (grid.columns - 1);
    const availableWidth = totalWidth - totalGap;
    return Math.floor((availableWidth / grid.columns) * columns);
  },

  /** Common column spans */
  spans: {
    full: 12,
    half: 6,
    third: 4,
    quarter: 3,
    twoThirds: 8,
    threeQuarters: 9,
  },
} as const;

// =============================================================================
// Z-INDEX LAYERS (for overlays)
// =============================================================================

export const layers = {
  /** Base content */
  base: 0,
  /** Dropdowns, tooltips */
  dropdown: 10,
  /** Sticky headers */
  sticky: 20,
  /** Fixed elements */
  fixed: 30,
  /** Modals, dialogs */
  modal: 40,
  /** Modal backdrops */
  modalBackdrop: 39,
  /** Toasts, notifications */
  toast: 50,
  /** Tooltips (top-most) */
  tooltip: 60,
} as const;

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  spacing,
  semanticSpacing,
  components,
  widths,
  heights,
  breakpoints,
  grid,
  layers,
  // Utilities
  centerH,
  centerV,
  centerMargin,
  remainingSpace,
  distributeSpace,
  getBreakpoint,
  isAtLeast,
};
