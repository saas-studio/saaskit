import { KeyValue, Markdown } from "./core"

export type Attachment = string | string[]

export type Prop<T = string> = string | {
    name?: string
    type?: string
    description?: string
    example?: T | T[]
}

export type TextProp<T = string> = string | Prop<T> & {
    type?: 'text'
}

export type LongTextProp<T = string> = string | Prop<T> & {
    type?: 'longText'
}

export type MarkdownProp<T = Markdown> = string | Markdown | Prop<T> & {
    type?: 'markdown'
}

export type AttachmentProp<T = Attachment> = Attachment | Prop<T> & {
    type?: 'string'
}

export type CheckboxProp<T = boolean> = Prop<T> & {
    type?: 'string'
}

export type SingleSelectProp<T = KeyValue<string>[]> = string[] | KeyValue<string>[] | Prop<T> & {
    options?: string[] | KeyValue<string>[]
    selections?: string | KeyValue<string>
}

export type MultiSelectProp<T = KeyValue<string>[]> = string[] | KeyValue<string>[] | Prop<T> & {
    options?: string[] | KeyValue[]
    selections?: string[] | KeyValue[]
}