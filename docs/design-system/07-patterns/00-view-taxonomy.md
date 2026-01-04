# View Taxonomy: A Comprehensive Conceptual Model

## Overview

This document defines the complete taxonomy of Views in the SaaSkit UI framework. Views are the fundamental building blocks for presenting and interacting with data. The taxonomy is designed to be **headless-first** - pure logic and structure that can render to any visual format (terminal, web, markdown, ASCII, JSON).

```
                              VIEW SYSTEM ARCHITECTURE

  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                              VIEW PRIMITIVES                                 │
  │  The atomic building blocks that compose into higher-order views            │
  ├─────────────────────────────────────────────────────────────────────────────┤
  │                                                                              │
  │   DataView          LayoutView         InteractionView      MetaView        │
  │   ─────────         ──────────         ───────────────      ────────        │
  │   • List            • Shell            • Form               • Empty         │
  │   • Detail          • Panel            • Dialog             • Loading       │
  │   • Summary         • Split            • Command            • Error         │
  │   • Aggregate       • Stack            • Confirm            • Onboarding    │
  │                     • Tab                                                    │
  │                                                                              │
  └─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                           COMPOSED VIEWS                                     │
  │  Higher-order combinations of primitives for common patterns                │
  ├─────────────────────────────────────────────────────────────────────────────┤
  │                                                                              │
  │   ResourceView           DashboardView          NavigationView              │
  │   ────────────           ─────────────          ──────────────              │
  │   • CRUD operations      • Metrics              • Breadcrumbs               │
  │   • List + Detail        • Charts               • Sidebar                   │
  │   • Search + Filter      • Activity             • Tabs                      │
  │   • Bulk actions         • Summary              • Command Palette           │
  │                                                                              │
  └─────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Core View Abstractions

### 1.1 The View Interface

Every view implements a common interface that enables headless rendering:

```typescript
interface View<TData = unknown, TConfig = unknown> {
  // Identity
  readonly id: string;
  readonly type: ViewType;

  // Data binding
  data: TData;
  loading: boolean;
  error: Error | null;

  // Configuration
  config: TConfig;

  // State
  state: ViewState;

  // Behaviors
  behaviors: ViewBehavior[];

  // Composition
  parent?: View;
  children: View[];

  // Rendering (headless - returns structured data, not UI)
  render(): RenderOutput;

  // Lifecycle
  onMount?(): void;
  onUnmount?(): void;
  onUpdate?(prevData: TData): void;
}

type ViewType =
  | 'list' | 'detail' | 'form' | 'dashboard'
  | 'shell' | 'panel' | 'dialog' | 'split'
  | 'empty' | 'loading' | 'error';

interface ViewState {
  focused: boolean;
  selected: boolean;
  expanded: boolean;
  dirty: boolean;
  valid: boolean;
}

interface RenderOutput {
  // Structured representation for any renderer
  type: string;
  props: Record<string, unknown>;
  children: RenderOutput[];

  // Text-based fallbacks
  text: string;           // Plain text
  markdown: string;       // Markdown format
  ascii: string;          // ASCII art (terminal)
  json: unknown;          // Raw data
}
```

---

## Part 2: Data Views (Resource-Level)

### 2.1 ListView

**Purpose**: Display a collection of records with support for navigation, selection, filtering, sorting, and bulk operations.

```typescript
interface ListView<T extends { id: string }> extends View<T[]> {
  type: 'list';

  // Display configuration
  config: {
    // Variant determines the visual layout
    variant: ListVariant;

    // Column/field configuration
    columns?: ColumnConfig<T>[];
    fields?: FieldConfig<T>[];

    // Grouping
    groupBy?: keyof T | ((item: T) => string);
    groupOrder?: 'asc' | 'desc' | string[];

    // Display limits
    pageSize?: number;
    maxHeight?: number | 'auto';

    // Visual options
    showHeader?: boolean;
    showFooter?: boolean;
    showRowNumbers?: boolean;
    density?: 'compact' | 'normal' | 'comfortable';

    // Empty state
    emptyMessage?: string;
    emptyAction?: { label: string; action: () => void };
  };

  // Behaviors
  behaviors: {
    // Selection
    selectable?: boolean;
    multiSelect?: boolean;
    selectAll?: boolean;

    // Navigation
    focusable?: boolean;
    keyboard?: boolean;

    // Data operations
    sortable?: boolean;
    filterable?: boolean;
    searchable?: boolean;
    paginated?: boolean;

    // Actions
    rowActions?: RowAction<T>[];
    bulkActions?: BulkAction<T>[];

    // Drag and drop
    draggable?: boolean;
    droppable?: boolean;
    reorderable?: boolean;
  };

  // State
  state: ListState<T>;

  // Events
  onSelect?(item: T): void;
  onMultiSelect?(items: T[]): void;
  onSort?(column: keyof T, direction: 'asc' | 'desc'): void;
  onFilter?(filters: Filter<T>[]): void;
  onSearch?(query: string): void;
  onPageChange?(page: number): void;
  onAction?(action: string, item: T): void;
  onBulkAction?(action: string, items: T[]): void;
  onReorder?(item: T, fromIndex: number, toIndex: number): void;
}

type ListVariant =
  | 'table'      // Rows and columns, spreadsheet-like
  | 'grid'       // Cards in a grid layout
  | 'cards'      // Larger, richer card layout
  | 'kanban'     // Grouped columns, draggable cards
  | 'timeline'   // Chronological sequence
  | 'calendar'   // Date-based grid
  | 'tree'       // Hierarchical nested structure
  | 'map'        // Geographic/spatial
  | 'gallery'    // Media-focused thumbnails
  | 'feed'       // Activity/social feed
  | 'compact'    // Minimal, dense listing

interface ListState<T> {
  // Focus
  focusedIndex: number;
  focusedItem: T | null;

  // Selection
  selectedIds: Set<string>;
  selectedItems: T[];
  selectMode: 'none' | 'single' | 'multi' | 'range';

  // Sorting
  sortColumn: keyof T | null;
  sortDirection: 'asc' | 'desc';

  // Filtering
  filters: Filter<T>[];
  searchQuery: string;

  // Pagination
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;

  // View state
  expandedIds: Set<string>;  // For tree/accordion
  dragState: DragState | null;
}
```

#### List Variant Specifications

```typescript
// TABLE VARIANT
// Best for: Data-dense displays, comparisons, bulk operations
interface TableVariantConfig<T> {
  variant: 'table';
  columns: Array<{
    key: keyof T;
    header: string;
    width?: number | 'auto' | `${number}%`;
    minWidth?: number;
    maxWidth?: number;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
    filterable?: boolean;
    resizable?: boolean;
    hidden?: boolean;
    pinned?: 'left' | 'right';
    render?: (value: T[keyof T], item: T) => RenderOutput;
  }>;
  stickyHeader?: boolean;
  stickyFirstColumn?: boolean;
  rowHeight?: number;
  alternateRows?: boolean;
  borderStyle?: 'none' | 'horizontal' | 'vertical' | 'all';
}

// KANBAN VARIANT
// Best for: Workflow stages, status-based grouping
interface KanbanVariantConfig<T> {
  variant: 'kanban';
  groupBy: keyof T;
  groups: Array<{
    value: string;
    label: string;
    color?: string;
    maxItems?: number;
    collapsible?: boolean;
    acceptsDrop?: (item: T) => boolean;
  }>;
  cardFields: Array<keyof T>;
  cardTemplate?: (item: T) => RenderOutput;
  columnWidth?: number;
  wipLimits?: Record<string, number>;
}

// TIMELINE VARIANT
// Best for: Events, history, logs, activity
interface TimelineVariantConfig<T> {
  variant: 'timeline';
  dateField: keyof T;
  direction?: 'vertical' | 'horizontal';
  groupByDate?: 'day' | 'week' | 'month' | 'year' | 'none';
  showConnectors?: boolean;
  showTimestamps?: boolean;
  relativeTime?: boolean;
}

// CALENDAR VARIANT
// Best for: Scheduling, date-based planning
interface CalendarVariantConfig<T> {
  variant: 'calendar';
  startDateField: keyof T;
  endDateField?: keyof T;
  view?: 'day' | 'week' | 'month' | 'year' | 'agenda';
  firstDayOfWeek?: 0 | 1;  // Sunday or Monday
  showWeekNumbers?: boolean;
  allowMultiDay?: boolean;
}

// TREE VARIANT
// Best for: Hierarchical data, file systems, org charts
interface TreeVariantConfig<T> {
  variant: 'tree';
  parentField?: keyof T;  // For flat data with parent references
  childrenField?: keyof T; // For nested data
  expandedByDefault?: boolean;
  indentSize?: number;
  showLines?: boolean;
  selectionMode?: 'single' | 'multi' | 'checkbox';
  checkboxPropagation?: 'none' | 'down' | 'up' | 'both';
}

// GRID/CARDS VARIANTS
// Best for: Visual content, media, products
interface GridVariantConfig<T> {
  variant: 'grid' | 'cards' | 'gallery';
  columns?: number | 'auto';
  minColumnWidth?: number;
  gap?: number;
  aspectRatio?: number;
  cardTemplate?: (item: T) => RenderOutput;
  imageField?: keyof T;
  titleField?: keyof T;
  subtitleField?: keyof T;
}
```

### 2.2 DetailView

**Purpose**: Display comprehensive information about a single record with sections, related data, and contextual actions.

```typescript
interface DetailView<T extends { id: string }> extends View<T> {
  type: 'detail';

  config: {
    // Display layout
    layout: DetailLayout;

    // Sections
    sections: SectionConfig<T>[];

    // Header
    header?: {
      title: keyof T | ((item: T) => string);
      subtitle?: keyof T | ((item: T) => string);
      status?: keyof T | ((item: T) => StatusInfo);
      tags?: keyof T | ((item: T) => string[]);
      avatar?: keyof T | ((item: T) => string);
    };

    // Navigation
    showBackButton?: boolean;
    backLabel?: string;

    // Actions
    actions?: ActionConfig[];
    quickActions?: ActionConfig[];
  };

  behaviors: {
    // Sections
    collapsibleSections?: boolean;
    defaultExpandedSections?: string[];

    // Navigation
    sectionNavigation?: boolean;  // Jump to section
    keyboardShortcuts?: boolean;

    // Related data
    loadRelatedOnDemand?: boolean;

    // Edit mode
    inlineEditable?: boolean;
    editableFields?: (keyof T)[];
  };

  state: DetailState;

  // Events
  onBack?(): void;
  onAction?(action: string): void;
  onEdit?(field: keyof T, value: unknown): void;
  onSectionToggle?(sectionId: string, expanded: boolean): void;
  onRelatedClick?(relation: string, id: string): void;
}

type DetailLayout =
  | 'page'        // Full page detail view
  | 'panel'       // Side panel / drawer
  | 'modal'       // Modal dialog
  | 'inline'      // Expandable row
  | 'split'       // List + detail side by side
  | 'floating';   // Popover/tooltip

interface SectionConfig<T> {
  id: string;
  title: string;
  icon?: string;

  // Content type
  type:
    | 'fields'       // Key-value pairs
    | 'table'        // Related items as table
    | 'list'         // Related items as list
    | 'text'         // Long-form text
    | 'code'         // Code block
    | 'chart'        // Visualization
    | 'timeline'     // Activity history
    | 'custom';      // Custom render function

  // Field configuration for 'fields' type
  fields?: Array<{
    key: keyof T;
    label: string;
    format?: 'text' | 'date' | 'number' | 'currency' | 'boolean' | 'link' | 'email' | 'code';
    copyable?: boolean;
    editable?: boolean;
    render?: (value: T[keyof T], item: T) => RenderOutput;
  }>;

  // For related data sections
  relation?: {
    resource: string;
    field: string;
    display: 'table' | 'list' | 'cards' | 'count';
    limit?: number;
    showMore?: boolean;
  };

  // Loading behavior
  loadOnExpand?: boolean;
  refreshInterval?: number;

  // Visibility
  collapsible?: boolean;
  defaultExpanded?: boolean;
  hidden?: boolean | ((item: T) => boolean);

  // Custom content
  content?: (item: T) => RenderOutput;
}

interface DetailState {
  expandedSections: Set<string>;
  loadingSections: Set<string>;
  sectionErrors: Map<string, Error>;
  editingField: keyof T | null;
  focusedSection: string | null;
}
```

### 2.3 FormView

**Purpose**: Collect and validate user input for creating or editing records.

```typescript
interface FormView<T> extends View<Partial<T>> {
  type: 'form';

  config: {
    // Form mode
    mode: 'create' | 'edit' | 'wizard' | 'inline' | 'filter';

    // Layout
    layout: FormLayout;

    // Fields
    fields: FormFieldConfig<T>[];

    // Sections (for complex forms)
    sections?: FormSectionConfig<T>[];

    // Wizard steps (for mode: 'wizard')
    steps?: WizardStepConfig<T>[];

    // Actions
    submitLabel?: string;
    cancelLabel?: string;
    showReset?: boolean;

    // Behavior
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    autoSave?: boolean;
    autoSaveDebounce?: number;
    confirmCancel?: boolean;
  };

  behaviors: {
    // Validation
    clientValidation?: boolean;
    serverValidation?: boolean;
    realtimeValidation?: boolean;

    // Navigation
    keyboardNavigation?: boolean;
    tabOrder?: (keyof T)[];

    // Submission
    submitOnEnter?: boolean;
    preventDoubleSubmit?: boolean;

    // Dirty tracking
    trackChanges?: boolean;
    warnOnLeave?: boolean;
  };

  state: FormState<T>;

  // Methods
  validate(): Promise<ValidationResult<T>>;
  submit(): Promise<SubmitResult<T>>;
  reset(): void;
  setFieldValue(field: keyof T, value: unknown): void;
  setFieldError(field: keyof T, error: string): void;
  setFieldTouched(field: keyof T, touched: boolean): void;

  // Events
  onChange?(field: keyof T, value: unknown): void;
  onBlur?(field: keyof T): void;
  onSubmit?(values: T): Promise<void>;
  onCancel?(): void;
  onReset?(): void;
  onValidationError?(errors: ValidationErrors<T>): void;
  onStepChange?(step: number): void;  // For wizard
}

type FormLayout =
  | 'vertical'     // Stacked fields
  | 'horizontal'   // Side-by-side label + input
  | 'inline'       // All fields on one line
  | 'grid'         // Grid layout
  | 'compact';     // Minimal spacing

interface FormFieldConfig<T> {
  name: keyof T;
  label: string;
  type: FieldType;

  // Layout
  width?: 'full' | 'half' | 'third' | 'quarter' | number;
  colspan?: number;
  hidden?: boolean | ((values: Partial<T>) => boolean);

  // Behavior
  required?: boolean;
  disabled?: boolean | ((values: Partial<T>) => boolean);
  readOnly?: boolean;
  autoFocus?: boolean;

  // Validation
  validation?: ValidationRule[];
  validateAsync?: (value: unknown, values: Partial<T>) => Promise<string | null>;

  // UI
  placeholder?: string;
  helpText?: string;
  prefix?: string;
  suffix?: string;

  // Type-specific options
  options?: FieldOptions;

  // Dependencies
  dependsOn?: (keyof T)[];
  computeValue?: (values: Partial<T>) => unknown;

  // Custom rendering
  render?: (props: FieldRenderProps<T>) => RenderOutput;
}

type FieldType =
  // Text
  | 'text' | 'textarea' | 'password' | 'email' | 'url' | 'phone'
  // Numeric
  | 'number' | 'currency' | 'percentage' | 'slider' | 'rating'
  // Selection
  | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'toggle'
  // Date/Time
  | 'date' | 'time' | 'datetime' | 'daterange' | 'duration'
  // Rich content
  | 'richtext' | 'markdown' | 'code'
  // Files
  | 'file' | 'image' | 'files'
  // Special
  | 'color' | 'tags' | 'relation' | 'json' | 'signature'
  // Composite
  | 'address' | 'phone' | 'name' | 'creditcard';

interface FormState<T> {
  values: Partial<T>;
  initialValues: Partial<T>;

  // Field states
  touched: Set<keyof T>;
  dirty: Set<keyof T>;
  errors: Map<keyof T, string>;
  warnings: Map<keyof T, string>;

  // Form states
  isSubmitting: boolean;
  isValidating: boolean;
  isValid: boolean;
  isDirty: boolean;

  // Wizard state
  currentStep?: number;
  completedSteps?: Set<number>;

  // Focus
  focusedField: keyof T | null;
}

// Wizard-specific configuration
interface WizardStepConfig<T> {
  id: string;
  title: string;
  description?: string;
  icon?: string;

  // Fields in this step
  fields: (keyof T)[];

  // Validation
  validate?: (values: Partial<T>) => Promise<ValidationResult>;
  canProceed?: (values: Partial<T>) => boolean;

  // Behavior
  skippable?: boolean;
  optional?: boolean;

  // Custom content
  beforeContent?: RenderOutput;
  afterContent?: RenderOutput;
}
```

---

## Part 3: Layout Views

### 3.1 ShellView

**Purpose**: Top-level application container providing consistent layout structure.

```typescript
interface ShellView extends View {
  type: 'shell';

  config: {
    // Layout regions
    header?: ShellRegion;
    sidebar?: ShellRegion;
    footer?: ShellRegion;
    main: ShellRegion;

    // Navigation
    navigation?: NavigationConfig;

    // Branding
    branding?: {
      logo?: string;
      title: string;
      subtitle?: string;
    };

    // Layout mode
    mode?: 'fixed' | 'fluid' | 'responsive';

    // Theme
    colorScheme?: 'light' | 'dark' | 'auto';
  };

  behaviors: {
    sidebarCollapsible?: boolean;
    sidebarDefaultCollapsed?: boolean;
    headerSticky?: boolean;
    keyboardShortcuts?: boolean;
    commandPalette?: boolean;
  };

  state: {
    sidebarCollapsed: boolean;
    activePath: string;
    commandPaletteOpen: boolean;
    notifications: Notification[];
  };
}

interface ShellRegion {
  content: View | View[];
  width?: number | string;
  height?: number | string;
  minWidth?: number;
  maxWidth?: number;
  collapsible?: boolean;
  resizable?: boolean;
  border?: boolean;
}

interface NavigationConfig {
  items: NavigationItem[];
  type?: 'sidebar' | 'topbar' | 'tabs' | 'breadcrumbs';
  showIcons?: boolean;
  showLabels?: boolean;
  grouping?: 'none' | 'sections' | 'accordion';
}

interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  action?: () => void;
  badge?: string | number;
  children?: NavigationItem[];
  section?: string;
  hidden?: boolean;
  disabled?: boolean;
}
```

### 3.2 SplitView

**Purpose**: Display two views side by side with adjustable division.

```typescript
interface SplitView extends View {
  type: 'split';

  config: {
    direction: 'horizontal' | 'vertical';

    primary: View;
    secondary: View;

    // Sizing
    primarySize?: number | string;  // px or %
    minPrimarySize?: number;
    maxPrimarySize?: number;

    // Behavior
    collapsible?: 'primary' | 'secondary' | 'both' | 'none';
    resizable?: boolean;

    // Responsiveness
    collapseAt?: number;  // Screen width to stack
    stackDirection?: 'vertical' | 'horizontal';
  };

  state: {
    size: number;
    collapsed: 'none' | 'primary' | 'secondary';
    resizing: boolean;
  };
}
```

### 3.3 PanelView

**Purpose**: Overlay panel (side drawer, modal, popover) for focused interactions.

```typescript
interface PanelView extends View {
  type: 'panel';

  config: {
    variant: 'drawer' | 'modal' | 'dialog' | 'popover' | 'sheet';

    // Position (for drawer/popover)
    position?: 'left' | 'right' | 'top' | 'bottom';

    // Sizing
    size?: 'small' | 'medium' | 'large' | 'full' | number;

    // Header
    title?: string;
    subtitle?: string;
    icon?: string;

    // Content
    content: View;

    // Footer
    footer?: View;
    actions?: ActionConfig[];

    // Backdrop
    backdrop?: boolean;
    backdropClose?: boolean;
  };

  behaviors: {
    closeOnEscape?: boolean;
    closeOnOutsideClick?: boolean;
    trapFocus?: boolean;
    preventScroll?: boolean;
    animated?: boolean;
  };

  state: {
    open: boolean;
    minimized: boolean;
    animating: boolean;
  };

  // Methods
  open(): void;
  close(): void;
  toggle(): void;

  // Events
  onOpen?(): void;
  onClose?(): void;
  onBeforeClose?(): boolean | Promise<boolean>;
}
```

### 3.4 TabView

**Purpose**: Organize content into switchable tab panels.

```typescript
interface TabView extends View {
  type: 'tabs';

  config: {
    tabs: TabConfig[];

    // Layout
    orientation?: 'horizontal' | 'vertical';
    alignment?: 'start' | 'center' | 'end' | 'stretch';
    position?: 'top' | 'bottom' | 'left' | 'right';

    // Behavior
    lazy?: boolean;  // Only render active tab
    keepMounted?: boolean;  // Keep inactive tabs in DOM

    // Visual
    variant?: 'default' | 'pills' | 'underline' | 'enclosed';
  };

  state: {
    activeTab: string;
    visitedTabs: Set<string>;
    loadingTabs: Set<string>;
  };

  // Events
  onTabChange?(tabId: string): void;
  onTabClose?(tabId: string): void;
}

interface TabConfig {
  id: string;
  label: string;
  icon?: string;
  content: View | (() => View);

  disabled?: boolean;
  closable?: boolean;
  badge?: string | number;

  // Loading
  loader?: () => Promise<View>;
  loadingContent?: View;
}
```

---

## Part 4: Dashboard Views

### 4.1 DashboardView

**Purpose**: Aggregate visualizations and metrics across resources.

```typescript
interface DashboardView extends View {
  type: 'dashboard';

  config: {
    title?: string;
    description?: string;

    // Layout
    layout: DashboardLayout;

    // Widgets
    widgets: WidgetConfig[];

    // Time range
    timeRange?: TimeRangeConfig;

    // Refresh
    refreshInterval?: number;
    autoRefresh?: boolean;
  };

  behaviors: {
    editable?: boolean;  // Can rearrange widgets
    addable?: boolean;   // Can add new widgets
    customizable?: boolean;  // Can configure widgets
    exportable?: boolean;
    shareable?: boolean;
  };

  state: {
    layout: WidgetPosition[];
    timeRange: TimeRange;
    refreshing: boolean;
    editMode: boolean;
  };
}

type DashboardLayout =
  | 'grid'      // CSS Grid layout
  | 'masonry'   // Pinterest-style
  | 'flow'      // Horizontal flow
  | 'fixed';    // Fixed positions

interface WidgetConfig {
  id: string;
  type: WidgetType;
  title?: string;

  // Position in grid
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  // Data
  dataSource: DataSourceConfig;

  // Refresh
  refreshInterval?: number;

  // Type-specific config
  config: WidgetTypeConfig;
}

type WidgetType =
  | 'metric'      // Single value with trend
  | 'chart'       // Various chart types
  | 'table'       // Data table
  | 'list'        // Simple list
  | 'feed'        // Activity feed
  | 'map'         // Geographic
  | 'gauge'       // Progress/percentage
  | 'sparkline'   // Mini trend
  | 'funnel'      // Conversion funnel
  | 'heatmap'     // Calendar/matrix heatmap
  | 'custom';     // Custom component

interface MetricWidgetConfig {
  type: 'metric';
  value: string | number;
  label: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    comparison: string;  // "vs last week"
  };
  format?: 'number' | 'currency' | 'percentage' | 'duration';
  icon?: string;
  color?: string;
  sparkline?: number[];
}

interface ChartWidgetConfig {
  type: 'chart';
  chartType: 'line' | 'bar' | 'area' | 'pie' | 'donut' | 'scatter' | 'radar';
  data: ChartData;
  options?: ChartOptions;
}
```

---

## Part 5: Meta Views (State Views)

### 5.1 EmptyView

**Purpose**: Communicate absence of data with actionable guidance.

```typescript
interface EmptyView extends View {
  type: 'empty';

  config: {
    variant: EmptyVariant;

    // Content
    icon?: string;
    title: string;
    description?: string;

    // Actions
    primaryAction?: ActionConfig;
    secondaryActions?: ActionConfig[];

    // Visual
    illustration?: string;
    compact?: boolean;
  };
}

type EmptyVariant =
  | 'no-data'           // No records exist
  | 'no-results'        // Search/filter returned nothing
  | 'no-access'         // Permission denied
  | 'not-found'         // Resource doesn't exist
  | 'coming-soon'       // Feature not yet available
  | 'maintenance';      // Temporarily unavailable
```

### 5.2 LoadingView

**Purpose**: Indicate data loading with appropriate feedback.

```typescript
interface LoadingView extends View {
  type: 'loading';

  config: {
    variant: LoadingVariant;

    // Progress
    progress?: number;  // 0-100 for determinate

    // Content
    message?: string;
    details?: string;

    // Visual
    size?: 'small' | 'medium' | 'large';

    // Skeleton
    skeletonConfig?: SkeletonConfig;
  };
}

type LoadingVariant =
  | 'spinner'           // Simple spinner
  | 'progress'          // Progress bar
  | 'skeleton'          // Content skeleton
  | 'shimmer'           // Shimmer animation
  | 'dots'              // Loading dots
  | 'overlay';          // Overlay on content

interface SkeletonConfig {
  type: 'list' | 'detail' | 'form' | 'card' | 'custom';
  rows?: number;
  columns?: number;
  animated?: boolean;
}
```

### 5.3 ErrorView

**Purpose**: Communicate errors with recovery options.

```typescript
interface ErrorView extends View {
  type: 'error';

  config: {
    variant: ErrorVariant;

    // Error info
    title: string;
    message: string;
    code?: string;
    details?: string;
    stack?: string;

    // Actions
    retryAction?: ActionConfig;
    fallbackAction?: ActionConfig;
    supportAction?: ActionConfig;

    // Visual
    icon?: string;
    showDetails?: boolean;
  };
}

type ErrorVariant =
  | 'network'           // Connection failed
  | 'server'            // 5xx errors
  | 'client'            // 4xx errors
  | 'validation'        // Form/input errors
  | 'permission'        // 403 forbidden
  | 'not-found'         // 404
  | 'timeout'           // Request timeout
  | 'unknown';          // Catch-all
```

### 5.4 OnboardingView

**Purpose**: Guide new users through initial setup or feature discovery.

```typescript
interface OnboardingView extends View {
  type: 'onboarding';

  config: {
    variant: OnboardingVariant;

    // Content
    steps: OnboardingStep[];

    // Progress
    showProgress?: boolean;
    showSkip?: boolean;

    // Completion
    completionAction?: ActionConfig;
  };

  state: {
    currentStep: number;
    completedSteps: Set<number>;
    skipped: boolean;
  };
}

type OnboardingVariant =
  | 'wizard'            // Step-by-step modal
  | 'tour'              // Guided tour of UI
  | 'checklist'         // Task checklist
  | 'spotlight'         // Highlight features
  | 'coachmarks';       // Inline tips

interface OnboardingStep {
  id: string;
  title: string;
  description: string;

  // For tour/spotlight
  target?: string;  // Selector or element ID
  placement?: 'top' | 'bottom' | 'left' | 'right';

  // Actions
  action?: {
    type: 'click' | 'input' | 'select' | 'custom';
    target?: string;
    validation?: () => boolean;
  };

  // Visual
  image?: string;
  video?: string;
}
```

---

## Part 6: Interaction Views

### 6.1 DialogView

**Purpose**: Request user confirmation or input for specific actions.

```typescript
interface DialogView extends View {
  type: 'dialog';

  config: {
    variant: DialogVariant;

    // Content
    title: string;
    message?: string;
    content?: View;

    // Actions
    confirmLabel?: string;
    cancelLabel?: string;
    actions?: ActionConfig[];

    // Appearance
    icon?: string;
    intent?: 'info' | 'warning' | 'danger' | 'success';

    // Behavior
    destructive?: boolean;
    requireConfirmation?: boolean;
    confirmationText?: string;  // Text user must type
  };

  // Events
  onConfirm?(): void | Promise<void>;
  onCancel?(): void;
}

type DialogVariant =
  | 'alert'             // Information only
  | 'confirm'           // Yes/No choice
  | 'prompt'            // Text input
  | 'form'              // Form inputs
  | 'custom';           // Custom content
```

### 6.2 CommandView

**Purpose**: Quick actions and navigation via command palette.

```typescript
interface CommandView extends View {
  type: 'command';

  config: {
    // Commands
    commands: CommandConfig[];
    groups?: CommandGroup[];

    // Search
    placeholder?: string;
    emptyMessage?: string;

    // Behavior
    fuzzySearch?: boolean;
    recentCommands?: boolean;
    maxRecent?: number;
  };

  state: {
    open: boolean;
    query: string;
    selectedIndex: number;
    filteredCommands: CommandConfig[];
  };
}

interface CommandConfig {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  shortcut?: string[];  // ['Cmd', 'K']
  group?: string;

  // Action
  action: () => void | Promise<void>;

  // Visibility
  hidden?: boolean | (() => boolean);
  disabled?: boolean | (() => boolean);

  // Nested commands
  children?: CommandConfig[];
}
```

---

## Part 7: View Behaviors

Behaviors are reusable interaction patterns that can be attached to any view.

```typescript
interface ViewBehavior {
  id: string;
  type: BehaviorType;
  config: BehaviorConfig;
}

type BehaviorType =
  // Selection
  | 'selectable'
  | 'multi-selectable'
  | 'range-selectable'

  // Navigation
  | 'focusable'
  | 'keyboard-navigable'
  | 'scrollable'

  // Data
  | 'sortable'
  | 'filterable'
  | 'searchable'
  | 'paginated'
  | 'infinite-scroll'

  // Editing
  | 'editable'
  | 'inline-editable'
  | 'draggable'
  | 'droppable'
  | 'reorderable'
  | 'resizable'

  // State
  | 'collapsible'
  | 'expandable'
  | 'refreshable'
  | 'auto-refresh'

  // Persistence
  | 'stateful'
  | 'bookmarkable'
  | 'shareable';

// Selection behavior
interface SelectableBehavior extends ViewBehavior {
  type: 'selectable' | 'multi-selectable' | 'range-selectable';
  config: {
    mode: 'click' | 'checkbox' | 'toggle';
    selectAll?: boolean;
    clearOnOutsideClick?: boolean;
    preserveOnReload?: boolean;
  };
  state: {
    selectedIds: Set<string>;
    lastSelected: string | null;
  };
  onSelect?(ids: string[]): void;
}

// Sortable behavior
interface SortableBehavior extends ViewBehavior {
  type: 'sortable';
  config: {
    columns: string[];
    defaultSort?: { column: string; direction: 'asc' | 'desc' };
    multiSort?: boolean;
    clientSide?: boolean;
  };
  state: {
    sorts: Array<{ column: string; direction: 'asc' | 'desc' }>;
  };
  onSort?(sorts: this['state']['sorts']): void;
}

// Filterable behavior
interface FilterableBehavior extends ViewBehavior {
  type: 'filterable';
  config: {
    filters: FilterConfig[];
    defaultFilters?: Filter[];
    saveFilters?: boolean;
    presets?: FilterPreset[];
  };
  state: {
    activeFilters: Filter[];
    filterPanelOpen: boolean;
  };
  onFilter?(filters: Filter[]): void;
}

interface FilterConfig {
  field: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'boolean';
  operators?: FilterOperator[];
  options?: SelectOption[];  // For select types
}

type FilterOperator =
  | 'equals' | 'not_equals'
  | 'contains' | 'not_contains' | 'starts_with' | 'ends_with'
  | 'gt' | 'gte' | 'lt' | 'lte' | 'between'
  | 'is_empty' | 'is_not_empty'
  | 'in' | 'not_in';

// Paginated behavior
interface PaginatedBehavior extends ViewBehavior {
  type: 'paginated';
  config: {
    pageSize: number;
    pageSizeOptions?: number[];
    showPageSize?: boolean;
    showTotal?: boolean;
    showPageNumbers?: boolean;
    maxPageNumbers?: number;
    clientSide?: boolean;
  };
  state: {
    page: number;
    pageSize: number;
    totalItems: number;
  };
  onPageChange?(page: number, pageSize: number): void;
}
```

---

## Part 8: View Composition

### 8.1 ResourceView (Composite)

**Purpose**: Complete CRUD interface for a resource type.

```typescript
interface ResourceView<T extends { id: string }> extends View<T[]> {
  type: 'resource';

  config: {
    // Resource definition
    resource: {
      name: string;
      singular: string;
      plural: string;
      icon?: string;
    };

    // Views
    listView: ListView<T>;
    detailView?: DetailView<T>;
    createView?: FormView<T>;
    editView?: FormView<T>;

    // Layout
    layout: 'page' | 'split' | 'modal' | 'inline';

    // Actions
    actions?: {
      create?: boolean | ActionConfig;
      edit?: boolean | ActionConfig;
      delete?: boolean | ActionConfig;
      duplicate?: boolean | ActionConfig;
      export?: boolean | ActionConfig;
      import?: boolean | ActionConfig;
      bulkActions?: BulkAction<T>[];
    };
  };

  state: {
    mode: 'list' | 'detail' | 'create' | 'edit';
    selectedItem: T | null;
    listState: ListState<T>;
    formState: FormState<T> | null;
  };
}
```

### 8.2 Composition Patterns

```typescript
// Declarative composition
const ProjectsPage = (
  <ShellView>
    <TabView tabs={[
      {
        id: 'overview',
        label: 'Overview',
        content: <DashboardView widgets={overviewWidgets} />
      },
      {
        id: 'projects',
        label: 'Projects',
        content: (
          <ResourceView
            resource={{ name: 'project', singular: 'Project', plural: 'Projects' }}
            listView={
              <ListView
                variant="table"
                columns={projectColumns}
                behaviors={['selectable', 'sortable', 'filterable']}
              />
            }
            detailView={
              <DetailView
                layout="split"
                sections={projectSections}
              />
            }
          />
        )
      }
    ]} />
  </ShellView>
);

// Programmatic composition
function createProjectsView(): View {
  return compose(
    shell({ sidebar: true }),
    tabs([
      { id: 'overview', content: dashboard(overviewWidgets) },
      { id: 'projects', content: resourceView({
        resource: 'project',
        list: table({ columns: projectColumns }),
        detail: split({ sections: projectSections }),
      })}
    ])
  );
}
```

---

## Part 9: Rendering Targets

The view system is designed to render to multiple targets:

```typescript
interface Renderer {
  render(view: View): RendererOutput;
}

// Terminal (React Ink)
class TerminalRenderer implements Renderer {
  render(view: View): InkElement;
}

// Plain text (for piping, logs)
class TextRenderer implements Renderer {
  render(view: View): string;
}

// Markdown (for documentation, sharing)
class MarkdownRenderer implements Renderer {
  render(view: View): string;
}

// ASCII (for terminals without unicode)
class AsciiRenderer implements Renderer {
  render(view: View): string;
}

// JSON (for programmatic access)
class JsonRenderer implements Renderer {
  render(view: View): object;
}

// HTML (for web)
class HtmlRenderer implements Renderer {
  render(view: View): HTMLElement;
}
```

---

## Part 10: Example Usage

### Complete Resource Definition

```tsx
// Define a Task resource with all views
const TaskResource = (
  <ResourceView
    resource={{
      name: 'task',
      singular: 'Task',
      plural: 'Tasks',
      icon: 'check-circle'
    }}

    listView={
      <ListView
        variant="kanban"
        groupBy="status"
        config={{
          groups: [
            { value: 'todo', label: 'To Do', color: 'gray' },
            { value: 'in-progress', label: 'In Progress', color: 'blue' },
            { value: 'done', label: 'Done', color: 'green' }
          ],
          cardFields: ['title', 'priority', 'assignee']
        }}
        behaviors={{
          draggable: true,
          filterable: true,
          searchable: true
        }}
      />
    }

    detailView={
      <DetailView
        layout="panel"
        header={{
          title: 'title',
          status: (task) => ({
            label: task.status,
            color: statusColors[task.status]
          }),
          tags: 'labels'
        }}
        sections={[
          {
            id: 'details',
            title: 'Details',
            type: 'fields',
            fields: [
              { key: 'description', label: 'Description' },
              { key: 'priority', label: 'Priority' },
              { key: 'dueDate', label: 'Due Date', format: 'date' },
              { key: 'assignee', label: 'Assignee' }
            ]
          },
          {
            id: 'subtasks',
            title: 'Subtasks',
            type: 'list',
            relation: { resource: 'subtask', field: 'taskId' }
          },
          {
            id: 'activity',
            title: 'Activity',
            type: 'timeline',
            relation: { resource: 'activity', field: 'taskId' }
          }
        ]}
        actions={[
          { id: 'edit', label: 'Edit', icon: 'edit' },
          { id: 'delete', label: 'Delete', icon: 'trash', intent: 'danger' }
        ]}
      />
    }

    createView={
      <FormView
        mode="create"
        layout="vertical"
        fields={[
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'status', label: 'Status', type: 'select', options: statusOptions },
          { name: 'priority', label: 'Priority', type: 'select', options: priorityOptions },
          { name: 'dueDate', label: 'Due Date', type: 'date' },
          { name: 'assignee', label: 'Assignee', type: 'relation', resource: 'user' }
        ]}
      />
    }
  />
);
```

### Terminal Output

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Tasks                                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  TO DO (3)            IN PROGRESS (2)       DONE (5)                        │
│  ───────────────────  ───────────────────   ───────────────────             │
│  ┌─────────────────┐  ┌─────────────────┐   ┌─────────────────┐             │
│  │ ● Design API    │  │ ◐ Build UI     │   │ ✓ Setup project │             │
│  │   High · @john  │  │   Med · @jane  │   │   Low · @john   │             │
│  └─────────────────┘  └─────────────────┘   └─────────────────┘             │
│  ┌─────────────────┐  ┌─────────────────┐   ┌─────────────────┐             │
│  │ Write tests     │  │ Code review    │   │ ✓ Init repo     │             │
│  │   Med · @jane   │  │   High · @john │   │   Low · @jane   │             │
│  └─────────────────┘  └─────────────────┘   └─────────────────┘             │
│                                                                              │
│  ↑↓ Navigate  Enter View  n New  / Search  ? Help                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Markdown Output

```markdown
# Tasks

## To Do (3)
- **Design API** — High priority — @john
- **Write tests** — Medium priority — @jane
- **Write docs** — Low priority — Unassigned

## In Progress (2)
- **Build UI** — Medium priority — @jane
- **Code review** — High priority — @john

## Done (5)
- ~~Setup project~~ — Low priority — @john
- ~~Init repo~~ — Low priority — @jane
...
```

### JSON Output

```json
{
  "type": "list",
  "variant": "kanban",
  "groupBy": "status",
  "groups": [
    {
      "key": "todo",
      "label": "To Do",
      "count": 3,
      "items": [
        { "id": "1", "title": "Design API", "priority": "high", "assignee": "john" },
        { "id": "2", "title": "Write tests", "priority": "medium", "assignee": "jane" }
      ]
    }
  ],
  "totalItems": 10,
  "actions": ["create", "search", "filter"]
}
```

---

## Part 11: Type Definitions Summary

```typescript
// Core types for the headless view system
export type {
  // Base
  View,
  ViewType,
  ViewState,
  ViewBehavior,
  RenderOutput,

  // Data Views
  ListView,
  ListVariant,
  ListState,
  DetailView,
  DetailLayout,
  DetailState,
  FormView,
  FormLayout,
  FormState,

  // Layout Views
  ShellView,
  SplitView,
  PanelView,
  TabView,

  // Dashboard
  DashboardView,
  WidgetConfig,
  WidgetType,

  // Meta Views
  EmptyView,
  LoadingView,
  ErrorView,
  OnboardingView,

  // Interaction Views
  DialogView,
  CommandView,

  // Composite Views
  ResourceView,

  // Behaviors
  SelectableBehavior,
  SortableBehavior,
  FilterableBehavior,
  PaginatedBehavior,

  // Configuration
  ColumnConfig,
  FieldConfig,
  SectionConfig,
  ActionConfig,
  NavigationConfig,

  // Rendering
  Renderer,
  TerminalRenderer,
  TextRenderer,
  MarkdownRenderer,
  JsonRenderer,
};
```

---

## Appendix A: Decision Matrix

| View Need | Recommended View | Variant/Layout |
|-----------|------------------|----------------|
| List of records | ListView | table, grid, kanban |
| Single record details | DetailView | page, panel, split |
| Create/edit record | FormView | vertical, wizard |
| Delete confirmation | DialogView | confirm |
| Dashboard metrics | DashboardView | grid |
| Empty collection | EmptyView | no-data |
| Loading data | LoadingView | skeleton |
| Error occurred | ErrorView | network, server |
| New user setup | OnboardingView | wizard, checklist |
| Quick actions | CommandView | - |
| Side-by-side comparison | SplitView | horizontal |
| Grouped content | TabView | horizontal |

## Appendix B: Keyboard Shortcuts Standard

| Context | Key | Action |
|---------|-----|--------|
| Global | `Cmd+K` | Open command palette |
| Global | `Esc` | Close panel/dialog, go back |
| Global | `?` | Show help |
| List | `j/↓` | Move down |
| List | `k/↑` | Move up |
| List | `Enter` | Open/select |
| List | `Space` | Toggle selection |
| List | `/` | Search |
| List | `n` | New item |
| List | `e` | Edit focused |
| List | `d` | Delete focused |
| Form | `Tab` | Next field |
| Form | `Shift+Tab` | Previous field |
| Form | `Ctrl+Enter` | Submit |
| Detail | `e` | Edit |
| Detail | `h/←` | Collapse section |
| Detail | `l/→` | Expand section |
