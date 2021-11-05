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
    wordmark: Wordmark
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
}