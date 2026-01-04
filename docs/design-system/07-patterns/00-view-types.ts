/**
 * SaaSkit View System - Type Definitions
 *
 * This file contains the complete type definitions for the headless view system.
 * These types define the structure and behavior of views that can render to any target
 * (terminal, web, markdown, JSON, etc.)
 */

// =============================================================================
// CORE TYPES
// =============================================================================

/**
 * All possible view types in the system
 */
export type ViewType =
  // Data views
  | 'list'
  | 'detail'
  | 'form'
  // Layout views
  | 'shell'
  | 'split'
  | 'panel'
  | 'tabs'
  // Dashboard views
  | 'dashboard'
  // Meta views
  | 'empty'
  | 'loading'
  | 'error'
  | 'onboarding'
  // Interaction views
  | 'dialog'
  | 'command'
  // Composite views
  | 'resource';

/**
 * Render output that can be consumed by any renderer
 */
export interface RenderOutput {
  type: string;
  props: Record<string, unknown>;
  children: RenderOutput[];

  // Multi-format representations
  text: string;
  markdown: string;
  ascii: string;
  json: unknown;
}

/**
 * Common state shared by all views
 */
export interface ViewState {
  focused: boolean;
  selected: boolean;
  expanded: boolean;
  dirty: boolean;
  valid: boolean;
}

/**
 * Base interface for all views
 */
export interface View<TData = unknown, TConfig = unknown> {
  readonly id: string;
  readonly type: ViewType;

  data: TData;
  loading: boolean;
  error: Error | null;

  config: TConfig;
  state: ViewState;
  behaviors: ViewBehavior[];

  parent?: View;
  children: View[];

  render(): RenderOutput;

  onMount?(): void;
  onUnmount?(): void;
  onUpdate?(prevData: TData): void;
}

// =============================================================================
// LIST VIEW
// =============================================================================

export type ListVariant =
  | 'table'
  | 'grid'
  | 'cards'
  | 'kanban'
  | 'timeline'
  | 'calendar'
  | 'tree'
  | 'map'
  | 'gallery'
  | 'feed'
  | 'compact';

export interface ColumnConfig<T> {
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
}

export interface RowAction<T> {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  intent?: 'default' | 'primary' | 'danger' | 'warning';
  hidden?: boolean | ((item: T) => boolean);
  disabled?: boolean | ((item: T) => boolean);
  action: (item: T) => void | Promise<void>;
}

export interface BulkAction<T> {
  id: string;
  label: string;
  icon?: string;
  intent?: 'default' | 'primary' | 'danger' | 'warning';
  minSelection?: number;
  maxSelection?: number;
  confirm?: boolean | string;
  action: (items: T[]) => void | Promise<void>;
}

export interface Filter<T = unknown> {
  field: keyof T;
  operator: FilterOperator;
  value: unknown;
}

export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'is_empty'
  | 'is_not_empty'
  | 'in'
  | 'not_in';

export interface DragState {
  dragging: boolean;
  draggedId: string | null;
  draggedIndex: number | null;
  dropTargetId: string | null;
  dropTargetIndex: number | null;
}

export interface ListState<T> {
  focusedIndex: number;
  focusedItem: T | null;

  selectedIds: Set<string>;
  selectedItems: T[];
  selectMode: 'none' | 'single' | 'multi' | 'range';

  sortColumn: keyof T | null;
  sortDirection: 'asc' | 'desc';

  filters: Filter<T>[];
  searchQuery: string;

  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;

  expandedIds: Set<string>;
  dragState: DragState | null;
}

export interface ListViewConfig<T> {
  variant: ListVariant;

  columns?: ColumnConfig<T>[];
  fields?: FieldConfig<T>[];

  groupBy?: keyof T | ((item: T) => string);
  groupOrder?: 'asc' | 'desc' | string[];

  pageSize?: number;
  maxHeight?: number | 'auto';

  showHeader?: boolean;
  showFooter?: boolean;
  showRowNumbers?: boolean;
  density?: 'compact' | 'normal' | 'comfortable';

  emptyMessage?: string;
  emptyAction?: { label: string; action: () => void };
}

export interface ListViewBehaviors<T> {
  selectable?: boolean;
  multiSelect?: boolean;
  selectAll?: boolean;

  focusable?: boolean;
  keyboard?: boolean;

  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  paginated?: boolean;

  rowActions?: RowAction<T>[];
  bulkActions?: BulkAction<T>[];

  draggable?: boolean;
  droppable?: boolean;
  reorderable?: boolean;
}

export interface ListView<T extends { id: string }>
  extends View<T[], ListViewConfig<T>> {
  type: 'list';
  config: ListViewConfig<T>;
  behaviors: ListViewBehaviors<T>;
  state: ListState<T>;

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

// Variant-specific configurations
export interface TableVariantConfig<T> {
  variant: 'table';
  columns: ColumnConfig<T>[];
  stickyHeader?: boolean;
  stickyFirstColumn?: boolean;
  rowHeight?: number;
  alternateRows?: boolean;
  borderStyle?: 'none' | 'horizontal' | 'vertical' | 'all';
}

export interface KanbanVariantConfig<T> {
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
  cardFields: (keyof T)[];
  cardTemplate?: (item: T) => RenderOutput;
  columnWidth?: number;
  wipLimits?: Record<string, number>;
}

export interface TimelineVariantConfig<T> {
  variant: 'timeline';
  dateField: keyof T;
  direction?: 'vertical' | 'horizontal';
  groupByDate?: 'day' | 'week' | 'month' | 'year' | 'none';
  showConnectors?: boolean;
  showTimestamps?: boolean;
  relativeTime?: boolean;
}

export interface CalendarVariantConfig<T> {
  variant: 'calendar';
  startDateField: keyof T;
  endDateField?: keyof T;
  view?: 'day' | 'week' | 'month' | 'year' | 'agenda';
  firstDayOfWeek?: 0 | 1;
  showWeekNumbers?: boolean;
  allowMultiDay?: boolean;
}

export interface TreeVariantConfig<T> {
  variant: 'tree';
  parentField?: keyof T;
  childrenField?: keyof T;
  expandedByDefault?: boolean;
  indentSize?: number;
  showLines?: boolean;
  selectionMode?: 'single' | 'multi' | 'checkbox';
  checkboxPropagation?: 'none' | 'down' | 'up' | 'both';
}

export interface GridVariantConfig<T> {
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

// =============================================================================
// DETAIL VIEW
// =============================================================================

export type DetailLayout =
  | 'page'
  | 'panel'
  | 'modal'
  | 'inline'
  | 'split'
  | 'floating';

export interface StatusInfo {
  label: string;
  color: string;
  icon?: string;
}

export interface SectionConfig<T> {
  id: string;
  title: string;
  icon?: string;

  type:
    | 'fields'
    | 'table'
    | 'list'
    | 'text'
    | 'code'
    | 'chart'
    | 'timeline'
    | 'custom';

  fields?: Array<{
    key: keyof T;
    label: string;
    format?:
      | 'text'
      | 'date'
      | 'number'
      | 'currency'
      | 'boolean'
      | 'link'
      | 'email'
      | 'code';
    copyable?: boolean;
    editable?: boolean;
    render?: (value: T[keyof T], item: T) => RenderOutput;
  }>;

  relation?: {
    resource: string;
    field: string;
    display: 'table' | 'list' | 'cards' | 'count';
    limit?: number;
    showMore?: boolean;
  };

  loadOnExpand?: boolean;
  refreshInterval?: number;

  collapsible?: boolean;
  defaultExpanded?: boolean;
  hidden?: boolean | ((item: T) => boolean);

  content?: (item: T) => RenderOutput;
}

export interface ActionConfig {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  intent?: 'default' | 'primary' | 'danger' | 'warning' | 'success';
  disabled?: boolean | (() => boolean);
  hidden?: boolean | (() => boolean);
  loading?: boolean;
  action: () => void | Promise<void>;
}

export interface DetailState {
  expandedSections: Set<string>;
  loadingSections: Set<string>;
  sectionErrors: Map<string, Error>;
  editingField: string | null;
  focusedSection: string | null;
}

export interface DetailViewConfig<T> {
  layout: DetailLayout;
  sections: SectionConfig<T>[];

  header?: {
    title: keyof T | ((item: T) => string);
    subtitle?: keyof T | ((item: T) => string);
    status?: keyof T | ((item: T) => StatusInfo);
    tags?: keyof T | ((item: T) => string[]);
    avatar?: keyof T | ((item: T) => string);
  };

  showBackButton?: boolean;
  backLabel?: string;

  actions?: ActionConfig[];
  quickActions?: ActionConfig[];
}

export interface DetailViewBehaviors<T> {
  collapsibleSections?: boolean;
  defaultExpandedSections?: string[];
  sectionNavigation?: boolean;
  keyboardShortcuts?: boolean;
  loadRelatedOnDemand?: boolean;
  inlineEditable?: boolean;
  editableFields?: (keyof T)[];
}

export interface DetailView<T extends { id: string }>
  extends View<T, DetailViewConfig<T>> {
  type: 'detail';
  config: DetailViewConfig<T>;
  behaviors: DetailViewBehaviors<T>;
  state: DetailState;

  onBack?(): void;
  onAction?(action: string): void;
  onEdit?(field: keyof T, value: unknown): void;
  onSectionToggle?(sectionId: string, expanded: boolean): void;
  onRelatedClick?(relation: string, id: string): void;
}

// =============================================================================
// FORM VIEW
// =============================================================================

export type FormLayout =
  | 'vertical'
  | 'horizontal'
  | 'inline'
  | 'grid'
  | 'compact';

export type FieldType =
  // Text
  | 'text'
  | 'textarea'
  | 'password'
  | 'email'
  | 'url'
  | 'phone'
  // Numeric
  | 'number'
  | 'currency'
  | 'percentage'
  | 'slider'
  | 'rating'
  // Selection
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'toggle'
  // Date/Time
  | 'date'
  | 'time'
  | 'datetime'
  | 'daterange'
  | 'duration'
  // Rich content
  | 'richtext'
  | 'markdown'
  | 'code'
  // Files
  | 'file'
  | 'image'
  | 'files'
  // Special
  | 'color'
  | 'tags'
  | 'relation'
  | 'json'
  | 'signature'
  // Composite
  | 'address'
  | 'name'
  | 'creditcard';

export interface ValidationRule {
  type:
    | 'required'
    | 'min'
    | 'max'
    | 'minLength'
    | 'maxLength'
    | 'pattern'
    | 'email'
    | 'url'
    | 'custom';
  value?: unknown;
  message: string;
  validator?: (value: unknown, values: Record<string, unknown>) => boolean;
}

export interface FieldOptions {
  // For select/multiselect/radio
  options?: Array<{ value: string; label: string; disabled?: boolean }>;

  // For number/slider
  min?: number;
  max?: number;
  step?: number;

  // For text/textarea
  minLength?: number;
  maxLength?: number;
  pattern?: string;

  // For date
  minDate?: Date;
  maxDate?: Date;
  dateFormat?: string;

  // For file
  accept?: string;
  maxSize?: number;
  multiple?: boolean;

  // For relation
  resource?: string;
  searchable?: boolean;
  createable?: boolean;

  // For code
  language?: string;
  lineNumbers?: boolean;
}

export interface FieldRenderProps<T> {
  field: FormFieldConfig<T>;
  value: unknown;
  error?: string;
  warning?: string;
  touched: boolean;
  focused: boolean;
  disabled: boolean;
  onChange: (value: unknown) => void;
  onBlur: () => void;
  onFocus: () => void;
}

export interface FormFieldConfig<T> {
  name: keyof T;
  label: string;
  type: FieldType;

  width?: 'full' | 'half' | 'third' | 'quarter' | number;
  colspan?: number;
  hidden?: boolean | ((values: Partial<T>) => boolean);

  required?: boolean;
  disabled?: boolean | ((values: Partial<T>) => boolean);
  readOnly?: boolean;
  autoFocus?: boolean;

  validation?: ValidationRule[];
  validateAsync?: (
    value: unknown,
    values: Partial<T>
  ) => Promise<string | null>;

  placeholder?: string;
  helpText?: string;
  prefix?: string;
  suffix?: string;

  options?: FieldOptions;

  dependsOn?: (keyof T)[];
  computeValue?: (values: Partial<T>) => unknown;

  render?: (props: FieldRenderProps<T>) => RenderOutput;
}

export interface FormSectionConfig<T> {
  id: string;
  title: string;
  description?: string;
  fields: (keyof T)[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface WizardStepConfig<T> {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  fields: (keyof T)[];
  validate?: (values: Partial<T>) => Promise<ValidationResult>;
  canProceed?: (values: Partial<T>) => boolean;
  skippable?: boolean;
  optional?: boolean;
  beforeContent?: RenderOutput;
  afterContent?: RenderOutput;
}

export interface ValidationResult<T = unknown> {
  valid: boolean;
  errors: ValidationErrors<T>;
  warnings: ValidationErrors<T>;
}

export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export interface SubmitResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationErrors<T>;
  message?: string;
}

export interface FormState<T> {
  values: Partial<T>;
  initialValues: Partial<T>;

  touched: Set<keyof T>;
  dirty: Set<keyof T>;
  errors: Map<keyof T, string>;
  warnings: Map<keyof T, string>;

  isSubmitting: boolean;
  isValidating: boolean;
  isValid: boolean;
  isDirty: boolean;

  currentStep?: number;
  completedSteps?: Set<number>;

  focusedField: keyof T | null;
}

export interface FormViewConfig<T> {
  mode: 'create' | 'edit' | 'wizard' | 'inline' | 'filter';
  layout: FormLayout;
  fields: FormFieldConfig<T>[];
  sections?: FormSectionConfig<T>[];
  steps?: WizardStepConfig<T>[];

  submitLabel?: string;
  cancelLabel?: string;
  showReset?: boolean;

  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  autoSave?: boolean;
  autoSaveDebounce?: number;
  confirmCancel?: boolean;
}

export interface FormViewBehaviors {
  clientValidation?: boolean;
  serverValidation?: boolean;
  realtimeValidation?: boolean;
  keyboardNavigation?: boolean;
  submitOnEnter?: boolean;
  preventDoubleSubmit?: boolean;
  trackChanges?: boolean;
  warnOnLeave?: boolean;
}

export interface FormView<T> extends View<Partial<T>, FormViewConfig<T>> {
  type: 'form';
  config: FormViewConfig<T>;
  behaviors: FormViewBehaviors;
  state: FormState<T>;

  validate(): Promise<ValidationResult<T>>;
  submit(): Promise<SubmitResult<T>>;
  reset(): void;
  setFieldValue(field: keyof T, value: unknown): void;
  setFieldError(field: keyof T, error: string): void;
  setFieldTouched(field: keyof T, touched: boolean): void;

  onChange?(field: keyof T, value: unknown): void;
  onBlur?(field: keyof T): void;
  onSubmit?(values: T): Promise<void>;
  onCancel?(): void;
  onReset?(): void;
  onValidationError?(errors: ValidationErrors<T>): void;
  onStepChange?(step: number): void;
}

// =============================================================================
// SHELL VIEW
// =============================================================================

export interface ShellRegion {
  content: View | View[];
  width?: number | string;
  height?: number | string;
  minWidth?: number;
  maxWidth?: number;
  collapsible?: boolean;
  resizable?: boolean;
  border?: boolean;
}

export interface NavigationItem {
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

export interface NavigationConfig {
  items: NavigationItem[];
  type?: 'sidebar' | 'topbar' | 'tabs' | 'breadcrumbs';
  showIcons?: boolean;
  showLabels?: boolean;
  grouping?: 'none' | 'sections' | 'accordion';
}

export interface ShellViewConfig {
  header?: ShellRegion;
  sidebar?: ShellRegion;
  footer?: ShellRegion;
  main: ShellRegion;

  navigation?: NavigationConfig;

  branding?: {
    logo?: string;
    title: string;
    subtitle?: string;
  };

  mode?: 'fixed' | 'fluid' | 'responsive';
  colorScheme?: 'light' | 'dark' | 'auto';
}

export interface ShellViewBehaviors {
  sidebarCollapsible?: boolean;
  sidebarDefaultCollapsed?: boolean;
  headerSticky?: boolean;
  keyboardShortcuts?: boolean;
  commandPalette?: boolean;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
  action?: ActionConfig;
}

export interface ShellState {
  sidebarCollapsed: boolean;
  activePath: string;
  commandPaletteOpen: boolean;
  notifications: Notification[];
}

export interface ShellView extends View<void, ShellViewConfig> {
  type: 'shell';
  config: ShellViewConfig;
  behaviors: ShellViewBehaviors;
  state: ShellState;
}

// =============================================================================
// SPLIT VIEW
// =============================================================================

export interface SplitViewConfig {
  direction: 'horizontal' | 'vertical';
  primary: View;
  secondary: View;
  primarySize?: number | string;
  minPrimarySize?: number;
  maxPrimarySize?: number;
  collapsible?: 'primary' | 'secondary' | 'both' | 'none';
  resizable?: boolean;
  collapseAt?: number;
  stackDirection?: 'vertical' | 'horizontal';
}

export interface SplitState {
  size: number;
  collapsed: 'none' | 'primary' | 'secondary';
  resizing: boolean;
}

export interface SplitView extends View<void, SplitViewConfig> {
  type: 'split';
  config: SplitViewConfig;
  state: SplitState;
}

// =============================================================================
// PANEL VIEW
// =============================================================================

export type PanelVariant =
  | 'drawer'
  | 'modal'
  | 'dialog'
  | 'popover'
  | 'sheet';

export interface PanelViewConfig {
  variant: PanelVariant;
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'small' | 'medium' | 'large' | 'full' | number;

  title?: string;
  subtitle?: string;
  icon?: string;

  content: View;
  footer?: View;
  actions?: ActionConfig[];

  backdrop?: boolean;
  backdropClose?: boolean;
}

export interface PanelViewBehaviors {
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  trapFocus?: boolean;
  preventScroll?: boolean;
  animated?: boolean;
}

export interface PanelState {
  open: boolean;
  minimized: boolean;
  animating: boolean;
}

export interface PanelView extends View<void, PanelViewConfig> {
  type: 'panel';
  config: PanelViewConfig;
  behaviors: PanelViewBehaviors;
  state: PanelState;

  open(): void;
  close(): void;
  toggle(): void;

  onOpen?(): void;
  onClose?(): void;
  onBeforeClose?(): boolean | Promise<boolean>;
}

// =============================================================================
// TAB VIEW
// =============================================================================

export interface TabConfig {
  id: string;
  label: string;
  icon?: string;
  content: View | (() => View);
  disabled?: boolean;
  closable?: boolean;
  badge?: string | number;
  loader?: () => Promise<View>;
  loadingContent?: View;
}

export interface TabViewConfig {
  tabs: TabConfig[];
  orientation?: 'horizontal' | 'vertical';
  alignment?: 'start' | 'center' | 'end' | 'stretch';
  position?: 'top' | 'bottom' | 'left' | 'right';
  lazy?: boolean;
  keepMounted?: boolean;
  variant?: 'default' | 'pills' | 'underline' | 'enclosed';
}

export interface TabState {
  activeTab: string;
  visitedTabs: Set<string>;
  loadingTabs: Set<string>;
}

export interface TabView extends View<void, TabViewConfig> {
  type: 'tabs';
  config: TabViewConfig;
  state: TabState;

  onTabChange?(tabId: string): void;
  onTabClose?(tabId: string): void;
}

// =============================================================================
// DASHBOARD VIEW
// =============================================================================

export type DashboardLayout = 'grid' | 'masonry' | 'flow' | 'fixed';

export type WidgetType =
  | 'metric'
  | 'chart'
  | 'table'
  | 'list'
  | 'feed'
  | 'map'
  | 'gauge'
  | 'sparkline'
  | 'funnel'
  | 'heatmap'
  | 'custom';

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DataSourceConfig {
  type: 'query' | 'api' | 'static' | 'realtime';
  endpoint?: string;
  query?: string;
  data?: unknown;
  params?: Record<string, unknown>;
  transform?: (data: unknown) => unknown;
}

export interface ChartData {
  labels?: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color?: string;
  }>;
}

export interface ChartOptions {
  legend?: boolean;
  grid?: boolean;
  axis?: {
    x?: { label?: string; format?: string };
    y?: { label?: string; format?: string };
  };
}

export interface MetricWidgetConfig {
  type: 'metric';
  value: string | number;
  label: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    comparison: string;
  };
  format?: 'number' | 'currency' | 'percentage' | 'duration';
  icon?: string;
  color?: string;
  sparkline?: number[];
}

export interface ChartWidgetConfig {
  type: 'chart';
  chartType: 'line' | 'bar' | 'area' | 'pie' | 'donut' | 'scatter' | 'radar';
  data: ChartData;
  options?: ChartOptions;
}

export type WidgetTypeConfig = MetricWidgetConfig | ChartWidgetConfig;

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title?: string;
  position?: WidgetPosition;
  dataSource: DataSourceConfig;
  refreshInterval?: number;
  config: WidgetTypeConfig;
}

export interface TimeRange {
  start: Date;
  end: Date;
  preset?: string;
}

export interface TimeRangeConfig {
  presets?: Array<{
    label: string;
    value: string;
    range: () => TimeRange;
  }>;
  custom?: boolean;
  defaultPreset?: string;
}

export interface DashboardViewConfig {
  title?: string;
  description?: string;
  layout: DashboardLayout;
  widgets: WidgetConfig[];
  timeRange?: TimeRangeConfig;
  refreshInterval?: number;
  autoRefresh?: boolean;
}

export interface DashboardViewBehaviors {
  editable?: boolean;
  addable?: boolean;
  customizable?: boolean;
  exportable?: boolean;
  shareable?: boolean;
}

export interface DashboardState {
  layout: WidgetPosition[];
  timeRange: TimeRange;
  refreshing: boolean;
  editMode: boolean;
}

export interface DashboardView extends View<void, DashboardViewConfig> {
  type: 'dashboard';
  config: DashboardViewConfig;
  behaviors: DashboardViewBehaviors;
  state: DashboardState;
}

// =============================================================================
// META VIEWS
// =============================================================================

export type EmptyVariant =
  | 'no-data'
  | 'no-results'
  | 'no-access'
  | 'not-found'
  | 'coming-soon'
  | 'maintenance';

export interface EmptyViewConfig {
  variant: EmptyVariant;
  icon?: string;
  title: string;
  description?: string;
  primaryAction?: ActionConfig;
  secondaryActions?: ActionConfig[];
  illustration?: string;
  compact?: boolean;
}

export interface EmptyView extends View<void, EmptyViewConfig> {
  type: 'empty';
  config: EmptyViewConfig;
}

export type LoadingVariant =
  | 'spinner'
  | 'progress'
  | 'skeleton'
  | 'shimmer'
  | 'dots'
  | 'overlay';

export interface SkeletonConfig {
  type: 'list' | 'detail' | 'form' | 'card' | 'custom';
  rows?: number;
  columns?: number;
  animated?: boolean;
}

export interface LoadingViewConfig {
  variant: LoadingVariant;
  progress?: number;
  message?: string;
  details?: string;
  size?: 'small' | 'medium' | 'large';
  skeletonConfig?: SkeletonConfig;
}

export interface LoadingView extends View<void, LoadingViewConfig> {
  type: 'loading';
  config: LoadingViewConfig;
}

export type ErrorVariant =
  | 'network'
  | 'server'
  | 'client'
  | 'validation'
  | 'permission'
  | 'not-found'
  | 'timeout'
  | 'unknown';

export interface ErrorViewConfig {
  variant: ErrorVariant;
  title: string;
  message: string;
  code?: string;
  details?: string;
  stack?: string;
  retryAction?: ActionConfig;
  fallbackAction?: ActionConfig;
  supportAction?: ActionConfig;
  icon?: string;
  showDetails?: boolean;
}

export interface ErrorView extends View<void, ErrorViewConfig> {
  type: 'error';
  config: ErrorViewConfig;
}

export type OnboardingVariant =
  | 'wizard'
  | 'tour'
  | 'checklist'
  | 'spotlight'
  | 'coachmarks';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    type: 'click' | 'input' | 'select' | 'custom';
    target?: string;
    validation?: () => boolean;
  };
  image?: string;
  video?: string;
}

export interface OnboardingViewConfig {
  variant: OnboardingVariant;
  steps: OnboardingStep[];
  showProgress?: boolean;
  showSkip?: boolean;
  completionAction?: ActionConfig;
}

export interface OnboardingState {
  currentStep: number;
  completedSteps: Set<number>;
  skipped: boolean;
}

export interface OnboardingView extends View<void, OnboardingViewConfig> {
  type: 'onboarding';
  config: OnboardingViewConfig;
  state: OnboardingState;
}

// =============================================================================
// INTERACTION VIEWS
// =============================================================================

export type DialogVariant = 'alert' | 'confirm' | 'prompt' | 'form' | 'custom';

export interface DialogViewConfig {
  variant: DialogVariant;
  title: string;
  message?: string;
  content?: View;
  confirmLabel?: string;
  cancelLabel?: string;
  actions?: ActionConfig[];
  icon?: string;
  intent?: 'info' | 'warning' | 'danger' | 'success';
  destructive?: boolean;
  requireConfirmation?: boolean;
  confirmationText?: string;
}

export interface DialogView extends View<void, DialogViewConfig> {
  type: 'dialog';
  config: DialogViewConfig;

  onConfirm?(): void | Promise<void>;
  onCancel?(): void;
}

export interface CommandConfig {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  shortcut?: string[];
  group?: string;
  action: () => void | Promise<void>;
  hidden?: boolean | (() => boolean);
  disabled?: boolean | (() => boolean);
  children?: CommandConfig[];
}

export interface CommandGroup {
  id: string;
  label: string;
  priority?: number;
}

export interface CommandViewConfig {
  commands: CommandConfig[];
  groups?: CommandGroup[];
  placeholder?: string;
  emptyMessage?: string;
  fuzzySearch?: boolean;
  recentCommands?: boolean;
  maxRecent?: number;
}

export interface CommandState {
  open: boolean;
  query: string;
  selectedIndex: number;
  filteredCommands: CommandConfig[];
}

export interface CommandView extends View<void, CommandViewConfig> {
  type: 'command';
  config: CommandViewConfig;
  state: CommandState;
}

// =============================================================================
// COMPOSITE VIEWS
// =============================================================================

export interface ResourceConfig {
  name: string;
  singular: string;
  plural: string;
  icon?: string;
}

export interface ResourceActions<T> {
  create?: boolean | ActionConfig;
  edit?: boolean | ActionConfig;
  delete?: boolean | ActionConfig;
  duplicate?: boolean | ActionConfig;
  export?: boolean | ActionConfig;
  import?: boolean | ActionConfig;
  bulkActions?: BulkAction<T>[];
}

export interface ResourceViewConfig<T extends { id: string }> {
  resource: ResourceConfig;
  listView: ListView<T>;
  detailView?: DetailView<T>;
  createView?: FormView<T>;
  editView?: FormView<T>;
  layout: 'page' | 'split' | 'modal' | 'inline';
  actions?: ResourceActions<T>;
}

export interface ResourceState<T> {
  mode: 'list' | 'detail' | 'create' | 'edit';
  selectedItem: T | null;
  listState: ListState<T>;
  formState: FormState<T> | null;
}

export interface ResourceView<T extends { id: string }>
  extends View<T[], ResourceViewConfig<T>> {
  type: 'resource';
  config: ResourceViewConfig<T>;
  state: ResourceState<T>;
}

// =============================================================================
// BEHAVIORS
// =============================================================================

export type BehaviorType =
  | 'selectable'
  | 'multi-selectable'
  | 'range-selectable'
  | 'focusable'
  | 'keyboard-navigable'
  | 'scrollable'
  | 'sortable'
  | 'filterable'
  | 'searchable'
  | 'paginated'
  | 'infinite-scroll'
  | 'editable'
  | 'inline-editable'
  | 'draggable'
  | 'droppable'
  | 'reorderable'
  | 'resizable'
  | 'collapsible'
  | 'expandable'
  | 'refreshable'
  | 'auto-refresh'
  | 'stateful'
  | 'bookmarkable'
  | 'shareable';

export interface ViewBehavior {
  id: string;
  type: BehaviorType;
  config: Record<string, unknown>;
}

export interface SelectableBehavior extends ViewBehavior {
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

export interface SortableBehavior extends ViewBehavior {
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

export interface FilterConfig {
  field: string;
  label: string;
  type:
    | 'text'
    | 'select'
    | 'multiselect'
    | 'date'
    | 'daterange'
    | 'number'
    | 'boolean';
  operators?: FilterOperator[];
  options?: Array<{ value: string; label: string }>;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: Filter[];
}

export interface FilterableBehavior extends ViewBehavior {
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

export interface PaginatedBehavior extends ViewBehavior {
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

// =============================================================================
// RENDERERS
// =============================================================================

export interface Renderer {
  render(view: View): unknown;
}

export interface TerminalRenderer extends Renderer {
  render(view: View): unknown; // InkElement
}

export interface TextRenderer extends Renderer {
  render(view: View): string;
}

export interface MarkdownRenderer extends Renderer {
  render(view: View): string;
}

export interface AsciiRenderer extends Renderer {
  render(view: View): string;
}

export interface JsonRenderer extends Renderer {
  render(view: View): object;
}

export interface HtmlRenderer extends Renderer {
  render(view: View): unknown; // HTMLElement
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export interface FieldConfig<T> {
  key: keyof T;
  label: string;
  format?: string;
  render?: (value: T[keyof T], item: T) => RenderOutput;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
