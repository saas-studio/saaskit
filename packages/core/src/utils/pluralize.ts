/**
 * Pluralize/Singularize Utilities
 *
 * Simple English pluralization rules for resource names.
 * Handles common patterns including irregular plurals.
 *
 * @module utils/pluralize
 */

// ============================================================================
// Irregular Plurals
// ============================================================================

/**
 * Map of irregular singular -> plural forms
 */
const IRREGULAR_PLURALS: Record<string, string> = {
  person: 'people',
  child: 'children',
  man: 'men',
  woman: 'women',
  tooth: 'teeth',
  foot: 'feet',
  mouse: 'mice',
  goose: 'geese',
  ox: 'oxen',
  leaf: 'leaves',
  life: 'lives',
  knife: 'knives',
  wife: 'wives',
  self: 'selves',
  elf: 'elves',
  loaf: 'loaves',
  potato: 'potatoes',
  tomato: 'tomatoes',
  cactus: 'cacti',
  focus: 'foci',
  fungus: 'fungi',
  nucleus: 'nuclei',
  syllabus: 'syllabi',
  analysis: 'analyses',
  diagnosis: 'diagnoses',
  oasis: 'oases',
  thesis: 'theses',
  crisis: 'crises',
  phenomenon: 'phenomena',
  criterion: 'criteria',
  datum: 'data',
}

/**
 * Map of irregular plural -> singular forms (reverse of above)
 */
const IRREGULAR_SINGULARS: Record<string, string> = Object.fromEntries(
  Object.entries(IRREGULAR_PLURALS).map(([singular, plural]) => [plural, singular])
)

/**
 * Words that are the same in singular and plural form
 */
const UNCOUNTABLE: Set<string> = new Set([
  'sheep',
  'fish',
  'deer',
  'species',
  'series',
  'news',
  'money',
  'information',
  'equipment',
  'rice',
  'knowledge',
  'advice',
  'aircraft',
  'salmon',
  'trout',
  'moose',
  'bison',
])

// ============================================================================
// Pluralize
// ============================================================================

/**
 * Pluralizes a word using English rules.
 *
 * Handles:
 * - Irregular plurals (person -> people, child -> children)
 * - Uncountable nouns (sheep, fish, deer)
 * - Words ending in consonant+y (category -> categories)
 * - Words ending in s, x, z, ch, sh (box -> boxes)
 * - Words ending in f/fe (leaf -> leaves)
 * - Regular nouns (task -> tasks)
 *
 * @param word - The singular word to pluralize
 * @returns The pluralized word (preserves original case pattern)
 *
 * @example
 * pluralize('Task')      // 'Tasks'
 * pluralize('Person')    // 'People'
 * pluralize('Category')  // 'Categories'
 * pluralize('Box')       // 'Boxes'
 * pluralize('Child')     // 'Children'
 * pluralize('sheep')     // 'sheep'
 */
export function pluralize(word: string): string {
  if (!word || word.length === 0) {
    return word
  }

  const lower = word.toLowerCase()

  // Check uncountable
  if (UNCOUNTABLE.has(lower)) {
    return word
  }

  // Check irregular plurals
  if (IRREGULAR_PLURALS[lower]) {
    return preserveCase(word, IRREGULAR_PLURALS[lower])
  }

  // Words ending in consonant + 'y' -> 'ies'
  if (/[^aeiou]y$/i.test(word)) {
    return word.slice(0, -1) + preserveCase(word.slice(-1), 'ies')
  }

  // Words ending in 's', 'x', 'z', 'ch', 'sh' -> add 'es'
  if (/(?:s|x|z|ch|sh)$/i.test(word)) {
    return word + preserveCase(word.slice(-1), 'es')
  }

  // Words ending in 'f' or 'fe' -> 'ves' (common cases)
  // Note: We only handle the most common cases here; others use regular 's'
  if (/(?:f|fe)$/i.test(word)) {
    const lowerWord = word.toLowerCase()
    // Check if this is a word that changes f->ves
    const fToVesWords = ['leaf', 'life', 'knife', 'wife', 'self', 'elf', 'loaf', 'half', 'calf', 'shelf', 'wolf', 'thief']
    for (const w of fToVesWords) {
      if (lowerWord === w) {
        if (word.endsWith('fe')) {
          return word.slice(0, -2) + preserveCase(word.slice(-2), 'ves')
        }
        return word.slice(0, -1) + preserveCase(word.slice(-1), 'ves')
      }
    }
  }

  // Words ending in 'o' preceded by consonant -> add 'es' for common words
  if (/[^aeiou]o$/i.test(word)) {
    const lowerWord = word.toLowerCase()
    const oToEsWords = ['potato', 'tomato', 'hero', 'echo', 'torpedo', 'veto']
    if (oToEsWords.includes(lowerWord)) {
      return word + preserveCase(word.slice(-1), 'es')
    }
  }

  // Default: add 's'
  return word + preserveCase(word.slice(-1), 's')
}

// ============================================================================
// Singularize
// ============================================================================

/**
 * Singularizes a word using English rules.
 *
 * Handles:
 * - Irregular singulars (people -> person, children -> child)
 * - Uncountable nouns (sheep, fish, deer)
 * - Words ending in 'ies' (categories -> category)
 * - Words ending in 'es' after s, x, z, ch, sh (boxes -> box)
 * - Words ending in 'ves' (leaves -> leaf)
 * - Regular nouns ending in 's' (tasks -> task)
 *
 * @param word - The plural word to singularize
 * @returns The singularized word (preserves original case pattern)
 *
 * @example
 * singularize('Tasks')      // 'Task'
 * singularize('People')     // 'Person'
 * singularize('Categories') // 'Category'
 * singularize('Boxes')      // 'Box'
 * singularize('Children')   // 'Child'
 * singularize('sheep')      // 'sheep'
 */
export function singularize(word: string): string {
  if (!word || word.length === 0) {
    return word
  }

  const lower = word.toLowerCase()

  // Check uncountable
  if (UNCOUNTABLE.has(lower)) {
    return word
  }

  // Check irregular singulars
  if (IRREGULAR_SINGULARS[lower]) {
    return preserveCase(word, IRREGULAR_SINGULARS[lower])
  }

  // Words ending in 'ies' -> 'y' (if preceded by consonant in singular form)
  if (/ies$/i.test(word)) {
    return word.slice(0, -3) + preserveCase(word.slice(-3), 'y')
  }

  // Words ending in 'ves' -> 'f' or 'fe'
  if (/ves$/i.test(word)) {
    // Try to match known f->ves words
    const base = word.slice(0, -3).toLowerCase()
    const feWords = ['li', 'wi', 'kni'] // life, wife, knife
    if (feWords.some((w) => base.endsWith(w))) {
      return word.slice(0, -3) + preserveCase(word.slice(-3), 'fe')
    }
    return word.slice(0, -3) + preserveCase(word.slice(-3), 'f')
  }

  // Words ending in 'es' after s, x, z, ch, sh
  // Note: For 'ses' (like "buses"), we remove 'es' to get "bus"
  if (/(?:s|x|z|ch|sh)es$/i.test(word)) {
    return word.slice(0, -2)
  }

  // Words ending in 'oes' for specific words
  if (/oes$/i.test(word)) {
    const base = word.slice(0, -2).toLowerCase()
    const oEsWords = ['potat', 'tomat', 'her', 'ech', 'torped', 'vet']
    if (oEsWords.some((w) => base.endsWith(w))) {
      return word.slice(0, -2)
    }
  }

  // Words ending in 'es' (but not 'ss')
  if (/[^s]es$/i.test(word)) {
    // Could be regular 'es' plural - check if removing 'es' gives a consonant
    const withoutEs = word.slice(0, -2)
    const lastChar = withoutEs.slice(-1).toLowerCase()
    if (['s', 'x', 'z'].includes(lastChar) || withoutEs.toLowerCase().endsWith('ch') || withoutEs.toLowerCase().endsWith('sh')) {
      return withoutEs
    }
    // For other cases, just remove 's'
    return word.slice(0, -1)
  }

  // Words ending in 's' (not 'ss') -> remove 's'
  if (/[^s]s$/i.test(word)) {
    return word.slice(0, -1)
  }

  // Already singular or unrecognized pattern
  return word
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Preserves the case pattern of the original word when applying a suffix.
 *
 * @param original - The original word/character to match case from
 * @param replacement - The replacement text
 * @returns The replacement text with case preserved
 */
function preserveCase(original: string, replacement: string): string {
  if (!original || original.length === 0) {
    return replacement
  }

  // If original is all uppercase, make replacement uppercase
  if (original === original.toUpperCase()) {
    return replacement.toUpperCase()
  }

  // If original starts with uppercase (Title Case), capitalize first letter
  if (original[0] === original[0].toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1).toLowerCase()
  }

  // Default to lowercase
  return replacement.toLowerCase()
}

/**
 * Checks if a word is likely plural based on common English patterns.
 *
 * @param word - The word to check
 * @returns true if the word appears to be plural
 *
 * @example
 * isPlural('tasks')      // true
 * isPlural('task')       // false
 * isPlural('people')     // true
 * isPlural('person')     // false
 */
export function isPlural(word: string): boolean {
  const lower = word.toLowerCase()

  // Check uncountable (could be either)
  if (UNCOUNTABLE.has(lower)) {
    return false // Default to singular interpretation
  }

  // Check irregular plurals
  if (IRREGULAR_SINGULARS[lower]) {
    return true
  }

  // Check common plural patterns
  if (/(?:ies|es|s)$/i.test(word) && !IRREGULAR_PLURALS[lower]) {
    return true
  }

  return false
}
