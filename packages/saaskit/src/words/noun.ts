import { Noun } from "..";

export function noun (init: object): Noun {
    let noun = {
        ...init,
        _type: 'Noun'
    } as Noun
    return noun
} 