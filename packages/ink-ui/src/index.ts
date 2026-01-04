/**
 * React Ink UI Design System
 *
 * A comprehensive design system for building production-quality
 * SaaS terminal interfaces using React Ink.
 */

// =============================================================================
// THEME
// =============================================================================

export * from './theme/colors.js';
export * from './theme/icons.js';
export * from './theme/spacing.js';

// Re-export with namespaces
export { default as colors } from './theme/colors.js';
export { default as icons } from './theme/icons.js';
export { default as spacing } from './theme/spacing.js';

// =============================================================================
// PRIMITIVE COMPONENTS
// =============================================================================

export { Badge, StatusBadge, PlanBadge } from './components/primitives/Badge.js';
export type { BadgeProps, BadgeVariant } from './components/primitives/Badge.js';

export {
  Spinner,
  LoadingIndicator,
  LoadingBar,
  SpinnerWithStatus,
  MultiSpinner,
} from './components/primitives/Spinner.js';
export type { SpinnerProps, SpinnerType } from './components/primitives/Spinner.js';

export {
  ProgressBar,
  SegmentedProgress,
  CircularProgress,
  IndeterminateProgress,
  TransferProgress,
  StackedProgress,
} from './components/primitives/ProgressBar.js';
export type {
  ProgressBarProps,
  ProgressVariant,
  SegmentedProgressProps,
  CircularProgressProps,
  TransferProgressProps,
  StackedProgressProps,
} from './components/primitives/ProgressBar.js';

export {
  Sparkline,
  LabeledSparkline,
  AreaSparkline,
  BarChart,
} from './components/primitives/Sparkline.js';
export type {
  SparklineProps,
  LabeledSparklineProps,
  AreaSparklineProps,
  BarChartProps,
} from './components/primitives/Sparkline.js';

export { Table, SimpleTable, KeyValueTable } from './components/primitives/Table.js';
export type { TableProps, Column, KeyValueTableProps } from './components/primitives/Table.js';

// =============================================================================
// ANIMATION COMPONENTS
// =============================================================================

export { Fade, FadeIn, Crossfade } from './components/animations/Fade.js';
export type { FadeProps } from './components/animations/Fade.js';

export {
  Typewriter,
  MultiLineTypewriter,
  TypeDelete,
  TerminalCommand,
} from './components/animations/Typewriter.js';
export type {
  TypewriterProps,
  MultiLineTypewriterProps,
  TypeDeleteProps,
  TerminalCommandProps,
} from './components/animations/Typewriter.js';

// =============================================================================
// PATTERN COMPONENTS
// =============================================================================

export {
  ToastContainer,
  ToastItem,
  ToastProvider,
  useToast,
  createToastManager,
} from './components/patterns/Toast.js';
export type { Toast, ToastType, ToastItemProps, ToastContainerProps } from './components/patterns/Toast.js';

export { Modal, ConfirmModal, AlertModal, PromptModal } from './components/patterns/Modal.js';
export type {
  ModalProps,
  ModalVariant,
  ConfirmModalProps,
  AlertModalProps,
  PromptModalProps,
} from './components/patterns/Modal.js';

export { Wizard, WizardFormStep, StepGuide } from './components/patterns/Wizard.js';
export type { WizardProps, WizardStep, WizardFormStepProps, StepGuideProps } from './components/patterns/Wizard.js';
