/**
 * Type declarations for @saaskit/core
 *
 * These are stub types until @saaskit/core is properly packaged.
 */

declare module '@saaskit/core' {
  export interface AppDefinition {
    name: string
    description?: string
    version?: string
    theme?: Record<string, unknown>
    resources?: ResourceDefinition[]
    routes?: RouteDefinition[]
  }

  export interface ResourceDefinition {
    name: string
    fields?: FieldDefinition[]
    actions?: ActionDefinition[]
  }

  export interface FieldDefinition {
    name: string
    type: string
    required?: boolean
    unique?: boolean
    relation?: RelationDefinition
  }

  export interface RelationDefinition {
    target: string
    type: 'one' | 'many'
  }

  export interface ActionDefinition {
    name: string
    handler: (context: unknown) => Promise<unknown>
  }

  export interface RouteDefinition {
    path: string
    view: string
  }

  // View types
  export type ViewType =
    | 'list'
    | 'detail'
    | 'form'
    | 'shell'
    | 'split'
    | 'panel'
    | 'tab'
    | 'empty'
    | 'loading'
    | 'error'
    | 'command'
    | 'dialog'

  export type ViewState = 'idle' | 'loading' | 'error' | 'success'

  export interface View {
    type: ViewType
    state?: ViewState
  }

  export interface RenderOutput {
    content: string
  }

  export interface ListView extends View {
    type: 'list'
    items?: unknown[]
  }

  export interface DetailView extends View {
    type: 'detail'
    data?: Record<string, unknown>
  }

  export interface FormView extends View {
    type: 'form'
    fields?: FieldDefinition[]
    values?: Record<string, unknown>
  }

  export interface ShellView extends View {
    type: 'shell'
    children?: View[]
  }

  export interface SplitView extends View {
    type: 'split'
    left?: View
    right?: View
    ratio?: number
  }

  export interface PanelView extends View {
    type: 'panel'
    title?: string
    content?: View
  }

  export interface TabView extends View {
    type: 'tab'
    tabs?: Array<{ label: string; content: View }>
    activeTab?: number
  }

  export interface EmptyView extends View {
    type: 'empty'
    message?: string
    icon?: string
  }

  export interface LoadingView extends View {
    type: 'loading'
    message?: string
  }

  export interface ErrorView extends View {
    type: 'error'
    message?: string
    error?: Error
  }

  export interface CommandView extends View {
    type: 'command'
    commands?: Array<{ name: string; action: () => void }>
  }

  export interface DialogView extends View {
    type: 'dialog'
    title?: string
    content?: View
    actions?: Array<{ label: string; action: () => void }>
  }
}
