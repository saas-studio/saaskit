import { describe, expect, test } from 'bun:test'

describe('Keyboard Input', () => {
  test('useKeyboard hook exists', async () => {
    const { useKeyboard } = await import('../../src/input/useKeyboard')
    expect(useKeyboard).toBeDefined()
  })

  test('useFocus hook exists', async () => {
    const { useFocus } = await import('../../src/input/useFocus')
    expect(useFocus).toBeDefined()
  })

  test('useKeyboard returns key handlers', async () => {
    const { useKeyboard } = await import('../../src/input/useKeyboard')

    // Hook should return handler registration
    const handlers = useKeyboard({
      onArrowUp: () => {},
      onArrowDown: () => {},
      onEnter: () => {},
      onEscape: () => {},
    })

    expect(handlers).toBeDefined()
  })

  test('useFocus provides focus management', async () => {
    const { useFocus } = await import('../../src/input/useFocus')

    const focus = useFocus({ initialIndex: 0, itemCount: 5 })

    expect(focus.focusedIndex).toBe(0)
    expect(focus.moveNext).toBeDefined()
    expect(focus.movePrev).toBeDefined()
  })

  test('focus wraps around at boundaries', async () => {
    const { useFocus } = await import('../../src/input/useFocus')

    const focus = useFocus({ initialIndex: 0, itemCount: 3, wrap: true })

    focus.movePrev()
    expect(focus.focusedIndex).toBe(2) // Wrapped to end

    focus.moveNext()
    expect(focus.focusedIndex).toBe(0) // Wrapped to start
  })

  test('custom key bindings work', async () => {
    const { useKeyboard } = await import('../../src/input/useKeyboard')

    let called = false
    const handlers = useKeyboard({
      bindings: {
        'ctrl+k': () => { called = true }
      }
    })

    // Simulate keypress
    handlers.handleKey({ key: 'k', ctrl: true })
    expect(called).toBe(true)
  })
})

describe('Focus Management', () => {
  test('Tab moves focus forward', async () => {
    const { useFocus } = await import('../../src/input/useFocus')

    const focus = useFocus({ initialIndex: 0, itemCount: 3 })
    focus.handleTab()

    expect(focus.focusedIndex).toBe(1)
  })

  test('Shift+Tab moves focus backward', async () => {
    const { useFocus } = await import('../../src/input/useFocus')

    const focus = useFocus({ initialIndex: 1, itemCount: 3 })
    focus.handleShiftTab()

    expect(focus.focusedIndex).toBe(0)
  })
})
