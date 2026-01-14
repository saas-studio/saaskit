/**
 * Pluralize/Singularize Utility Tests
 */

import { describe, it, expect } from 'bun:test'
import { pluralize, singularize, isPlural } from '../../src/utils/pluralize'

describe('pluralize', () => {
  describe('regular nouns', () => {
    it('adds s to regular nouns', () => {
      expect(pluralize('Task')).toBe('Tasks')
      expect(pluralize('User')).toBe('Users')
      expect(pluralize('Product')).toBe('Products')
      expect(pluralize('Order')).toBe('Orders')
    })

    it('preserves lowercase', () => {
      expect(pluralize('task')).toBe('tasks')
      expect(pluralize('user')).toBe('users')
    })
  })

  describe('words ending in s, x, z, ch, sh', () => {
    it('adds es to words ending in s', () => {
      expect(pluralize('Class')).toBe('Classes')
      expect(pluralize('bus')).toBe('buses')
    })

    it('adds es to words ending in x', () => {
      expect(pluralize('Box')).toBe('Boxes')
      expect(pluralize('tax')).toBe('taxes')
    })

    it('adds es to words ending in z', () => {
      expect(pluralize('quiz')).toBe('quizes')
      expect(pluralize('buzz')).toBe('buzzes')
    })

    it('adds es to words ending in ch', () => {
      expect(pluralize('Match')).toBe('Matches')
      expect(pluralize('watch')).toBe('watches')
    })

    it('adds es to words ending in sh', () => {
      expect(pluralize('Wish')).toBe('Wishes')
      expect(pluralize('bush')).toBe('bushes')
    })
  })

  describe('words ending in consonant+y', () => {
    it('changes y to ies', () => {
      expect(pluralize('Category')).toBe('Categories')
      expect(pluralize('Country')).toBe('Countries')
      expect(pluralize('City')).toBe('Cities')
      expect(pluralize('company')).toBe('companies')
    })
  })

  describe('words ending in vowel+y', () => {
    it('preserves y and adds s', () => {
      expect(pluralize('Key')).toBe('Keys')
      expect(pluralize('Day')).toBe('Days')
      expect(pluralize('toy')).toBe('toys')
      expect(pluralize('boy')).toBe('boys')
    })
  })

  describe('irregular plurals', () => {
    it('handles person -> people', () => {
      expect(pluralize('Person')).toBe('People')
      expect(pluralize('person')).toBe('people')
    })

    it('handles child -> children', () => {
      expect(pluralize('Child')).toBe('Children')
      expect(pluralize('child')).toBe('children')
    })

    it('handles man -> men', () => {
      expect(pluralize('Man')).toBe('Men')
      expect(pluralize('man')).toBe('men')
    })

    it('handles woman -> women', () => {
      expect(pluralize('Woman')).toBe('Women')
      expect(pluralize('woman')).toBe('women')
    })

    it('handles tooth -> teeth', () => {
      expect(pluralize('Tooth')).toBe('Teeth')
    })

    it('handles foot -> feet', () => {
      expect(pluralize('Foot')).toBe('Feet')
    })

    it('handles mouse -> mice', () => {
      expect(pluralize('Mouse')).toBe('Mice')
    })

    it('handles goose -> geese', () => {
      expect(pluralize('Goose')).toBe('Geese')
    })

    it('handles leaf -> leaves', () => {
      expect(pluralize('Leaf')).toBe('Leaves')
    })

    it('handles life -> lives', () => {
      expect(pluralize('Life')).toBe('Lives')
    })

    it('handles analysis -> analyses', () => {
      expect(pluralize('Analysis')).toBe('Analyses')
    })

    it('handles criterion -> criteria', () => {
      expect(pluralize('Criterion')).toBe('Criteria')
    })
  })

  describe('uncountable nouns', () => {
    it('keeps sheep unchanged', () => {
      expect(pluralize('sheep')).toBe('sheep')
      expect(pluralize('Sheep')).toBe('Sheep')
    })

    it('keeps fish unchanged', () => {
      expect(pluralize('fish')).toBe('fish')
    })

    it('keeps deer unchanged', () => {
      expect(pluralize('deer')).toBe('deer')
    })

    it('keeps series unchanged', () => {
      expect(pluralize('series')).toBe('series')
    })

    it('keeps species unchanged', () => {
      expect(pluralize('species')).toBe('species')
    })
  })

  describe('edge cases', () => {
    it('handles empty string', () => {
      expect(pluralize('')).toBe('')
    })

    it('handles single character', () => {
      expect(pluralize('a')).toBe('as')
    })
  })
})

describe('singularize', () => {
  describe('regular nouns', () => {
    it('removes s from regular nouns', () => {
      expect(singularize('Tasks')).toBe('Task')
      expect(singularize('Users')).toBe('User')
      expect(singularize('Products')).toBe('Product')
      expect(singularize('tasks')).toBe('task')
    })
  })

  describe('words ending in es', () => {
    it('removes es from words ending in sses', () => {
      expect(singularize('Classes')).toBe('Class')
      expect(singularize('buses')).toBe('bus')
    })

    it('removes es from words ending in xes', () => {
      expect(singularize('Boxes')).toBe('Box')
      expect(singularize('taxes')).toBe('tax')
    })

    it('removes es from words ending in ches', () => {
      expect(singularize('Matches')).toBe('Match')
      expect(singularize('watches')).toBe('watch')
    })

    it('removes es from words ending in shes', () => {
      expect(singularize('Wishes')).toBe('Wish')
      expect(singularize('bushes')).toBe('bush')
    })
  })

  describe('words ending in ies', () => {
    it('changes ies to y', () => {
      expect(singularize('Categories')).toBe('Category')
      expect(singularize('Countries')).toBe('Country')
      expect(singularize('Cities')).toBe('City')
      expect(singularize('companies')).toBe('company')
    })
  })

  describe('irregular singulars', () => {
    it('handles people -> person', () => {
      expect(singularize('People')).toBe('Person')
      expect(singularize('people')).toBe('person')
    })

    it('handles children -> child', () => {
      expect(singularize('Children')).toBe('Child')
      expect(singularize('children')).toBe('child')
    })

    it('handles men -> man', () => {
      expect(singularize('Men')).toBe('Man')
      expect(singularize('men')).toBe('man')
    })

    it('handles women -> woman', () => {
      expect(singularize('Women')).toBe('Woman')
    })

    it('handles teeth -> tooth', () => {
      expect(singularize('Teeth')).toBe('Tooth')
    })

    it('handles feet -> foot', () => {
      expect(singularize('Feet')).toBe('Foot')
    })

    it('handles mice -> mouse', () => {
      expect(singularize('Mice')).toBe('Mouse')
    })

    it('handles geese -> goose', () => {
      expect(singularize('Geese')).toBe('Goose')
    })

    it('handles leaves -> leaf', () => {
      expect(singularize('Leaves')).toBe('Leaf')
    })

    it('handles lives -> life', () => {
      expect(singularize('Lives')).toBe('Life')
    })

    it('handles analyses -> analysis', () => {
      expect(singularize('Analyses')).toBe('Analysis')
    })

    it('handles criteria -> criterion', () => {
      expect(singularize('Criteria')).toBe('Criterion')
    })
  })

  describe('uncountable nouns', () => {
    it('keeps sheep unchanged', () => {
      expect(singularize('sheep')).toBe('sheep')
    })

    it('keeps fish unchanged', () => {
      expect(singularize('fish')).toBe('fish')
    })

    it('keeps deer unchanged', () => {
      expect(singularize('deer')).toBe('deer')
    })
  })

  describe('edge cases', () => {
    it('handles empty string', () => {
      expect(singularize('')).toBe('')
    })

    it('handles already singular words', () => {
      expect(singularize('Task')).toBe('Task')
      expect(singularize('User')).toBe('User')
    })
  })
})

describe('isPlural', () => {
  it('returns true for plural words', () => {
    expect(isPlural('tasks')).toBe(true)
    expect(isPlural('users')).toBe(true)
    expect(isPlural('categories')).toBe(true)
    expect(isPlural('boxes')).toBe(true)
    expect(isPlural('people')).toBe(true)
    expect(isPlural('children')).toBe(true)
  })

  it('returns false for singular words', () => {
    expect(isPlural('task')).toBe(false)
    expect(isPlural('user')).toBe(false)
    expect(isPlural('category')).toBe(false)
    expect(isPlural('box')).toBe(false)
    expect(isPlural('person')).toBe(false)
    expect(isPlural('child')).toBe(false)
  })

  it('returns false for uncountable nouns', () => {
    expect(isPlural('sheep')).toBe(false)
    expect(isPlural('fish')).toBe(false)
  })
})

describe('roundtrip', () => {
  it('pluralize then singularize returns original', () => {
    const words = ['Task', 'User', 'Category', 'Box', 'Person', 'Child', 'Class', 'Key']
    for (const word of words) {
      expect(singularize(pluralize(word))).toBe(word)
    }
  })

  it('singularize then pluralize returns original plural', () => {
    const words = ['Tasks', 'Users', 'Categories', 'Boxes', 'People', 'Children', 'Classes', 'Keys']
    for (const word of words) {
      expect(pluralize(singularize(word))).toBe(word)
    }
  })
})
