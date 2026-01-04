// Stub - to be implemented in GREEN phase

export interface FocusOptions {
  initialIndex?: number
  itemCount: number
  wrap?: boolean
}

export interface FocusState {
  focusedIndex: number
  moveNext: () => void
  movePrev: () => void
  handleTab: () => void
  handleShiftTab: () => void
  setFocus: (index: number) => void
}

export function useFocus(options: FocusOptions): FocusState {
  const { initialIndex = 0, itemCount, wrap = false } = options

  // Internal state object that holds the current focus index
  const state = { focusedIndex: initialIndex }

  const moveNext = (): void => {
    if (state.focusedIndex < itemCount - 1) {
      state.focusedIndex++
    } else if (wrap) {
      state.focusedIndex = 0
    }
  }

  const movePrev = (): void => {
    if (state.focusedIndex > 0) {
      state.focusedIndex--
    } else if (wrap) {
      state.focusedIndex = itemCount - 1
    }
  }

  const handleTab = (): void => {
    moveNext()
  }

  const handleShiftTab = (): void => {
    movePrev()
  }

  const setFocus = (index: number): void => {
    if (index >= 0 && index < itemCount) {
      state.focusedIndex = index
    }
  }

  // Return an object with a getter for focusedIndex so it's always current
  return {
    get focusedIndex() {
      return state.focusedIndex
    },
    moveNext,
    movePrev,
    handleTab,
    handleShiftTab,
    setFocus,
  }
}
