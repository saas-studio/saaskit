import { KeyValue, Markdown } from "./core"

export type Attachment = string | string[]

export type Prop<T = string> = {
    name: string
    type: string
    description?: string
    example?: T | T[]
}

export type TextProp<T = string> = Prop<T> & {
    type: 'text' | 'string'
}

export type LongTextProp<T = string> = Prop<T> & {
    type: 'longText'
}

export type MarkdownProp<T = Markdown> = Prop<T> & {
    type: 'markdown'
}

export type AttachmentProp<T = Attachment> = Prop<T> & {
    type: 'attachment' 
}

export type CheckboxProp<T = boolean> = Prop<T> & {
    type: 'checkbox' | 'bool'
}


export type NumberProp<T = number> = Prop<T> & {
    type: 'number'
}

export type SingleSelectProp<T = KeyValue<string>[]> = string[] | KeyValue<string>[] | Prop<T> & {
    options?: string[] | KeyValue<string>[]
    selections?: string | KeyValue<string>
}

export type MultiSelectProp<T = KeyValue<string>[]> = string[] | KeyValue<string>[] | Prop<T> & {
    options?: string[] | KeyValue[]
    selections?: string[] | KeyValue[]
}

export type TextOrNumberProp = TextProp | NumberProp
export type NumberOrNumberProp = number | NumberProp

// const join =

export const Formula = {
    average: (...props: NumberProp[]) => `AVERAGE(${props.map(prop => `[${prop.name}]`).join(', ')})`,
    count: (...props: NumberProp[]) => `COUNT(${props.map(prop => `[${prop.name}]`).join(', ')})`,
    countNonEmpty: (...props: TextOrNumberProp[]) => `COUNTA(${props.map(prop => `[${prop.name}]`).join(', ')})`,
    countAll: (...props: TextOrNumberProp[]) => `COUNTALL(${props.map(prop => `[${prop.name}]`).join(', ')})`,
    sum: (...props: NumberProp[]) => `AVERAGE(${props.map(prop => `[${prop.name}]`).join(', ')})`,
}