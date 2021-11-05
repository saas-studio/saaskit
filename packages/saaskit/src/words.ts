import { Noun, Verb, Adjective, ProperNoun, Word } from './types/word'
// import { Story } from './story'




export interface Vocabulary {
    [key: string]: Noun | Verb | Adjective | ProperNoun
}

export const words = {
    product: {
        plural: 'products',
        is: 'noun',
        has: {
            
        }
    }
}

export function noun(word: string | Word) {
    return {
        word: word
    }
}


export type Permutations<T extends string, U extends string = T> =
    T extends any ? (T | `${T} ${Permutations<Exclude<U, T>>}`) : never;

// type MetaKey = 'meta';
// type CtrlKey = 'ctrl';
// type ShiftKey = 'shift';
// type AltKey = 'alt';

// export type ModiferKeyCombinations = Permutations<MetaKey | CtrlKey | ShiftKey | AltKey>;