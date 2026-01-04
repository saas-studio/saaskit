// Stub - to be implemented in GREEN phase

export interface KeyboardOptions {
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onEnter?: () => void
  onEscape?: () => void
  onTab?: () => void
  onShiftTab?: () => void
  bindings?: Record<string, () => void>
}

export interface KeyEvent {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  meta?: boolean
}

export interface KeyboardHandlers {
  handleKey: (event: KeyEvent) => void
}

export function useKeyboard(options: KeyboardOptions): KeyboardHandlers {
  const handleKey = (event: KeyEvent): void => {
    const { key, ctrl, alt, shift, meta } = event

    // Check custom bindings first
    if (options.bindings) {
      const modifiers: string[] = []
      if (ctrl) modifiers.push('ctrl')
      if (alt) modifiers.push('alt')
      if (shift) modifiers.push('shift')
      if (meta) modifiers.push('meta')

      const bindingKey = modifiers.length > 0
        ? `${modifiers.join('+')}+${key.toLowerCase()}`
        : key.toLowerCase()

      const binding = options.bindings[bindingKey]
      if (binding) {
        binding()
        return
      }
    }

    // Handle standard key callbacks
    switch (key) {
      case 'ArrowUp':
        options.onArrowUp?.()
        break
      case 'ArrowDown':
        options.onArrowDown?.()
        break
      case 'ArrowLeft':
        options.onArrowLeft?.()
        break
      case 'ArrowRight':
        options.onArrowRight?.()
        break
      case 'Enter':
        options.onEnter?.()
        break
      case 'Escape':
        options.onEscape?.()
        break
      case 'Tab':
        if (shift) {
          options.onShiftTab?.()
        } else {
          options.onTab?.()
        }
        break
    }
  }

  return { handleKey }
}
