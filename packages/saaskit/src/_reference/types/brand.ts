import { TailwindValuesColor } from "tailwindcss/tailwind-config"
import { Icon } from ".."
import { FontFamily } from "./font-families"


export type Brand = {
    icon?: Icon
    logo?: Logo
    font?: FontFamily
    color?: TailwindValuesColor
}

export type Logo = {
    name?: string
    icon?: Icon
    iconPosition?: 'above' | 'left' | 'right'
    wordmark?: Wordmark
    color?: TailwindValuesColor
    background?: 'square' | 'rounded' | 'circle' | 'triangle' | 'diamond'
    backgroundColor?: TailwindValuesColor
}


export type Wordmark = {
    name: string | {
        left: string
        right: string
    }
    font: FontFamily | {
        left: FontFamily
        right: FontFamily
    }
    fontWeight: FontWeight | {
        left: FontWeight
        right: FontWeight
    }
    fontColor: TailwindValuesColor | {
        left: TailwindValuesColor
        right: TailwindValuesColor
    }
}

export type FontWeight = 'hairline' | 'thin' | 'light' | 'normal' | 'medium' | 'bold' | 'extraBold' | 'black'
export type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
