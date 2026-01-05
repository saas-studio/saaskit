import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Box, Text } from 'ink';
import { colors, semantic } from '../../theme/colors.js';
import { status as statusIcons } from '../../theme/icons.js';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  /** Unique identifier */
  id: string;
  /** Toast type/variant */
  type: ToastType;
  /** Message content */
  message: string;
  /** Optional title */
  title?: string;
  /** Duration in ms (0 for persistent) */
  duration?: number;
  /** Whether the toast can be dismissed */
  dismissible?: boolean;
  /** Action button */
  action?: {
    label: string;
    onPress: () => void;
  };
}

const toastStyles: Record<ToastType, { icon: string; color: string; bg: string; border: string }> = {
  success: {
    icon: statusIcons.success,
    color: semantic.badge.success.text,
    bg: semantic.badge.success.bg,
    border: colors.success[700],
  },
  error: {
    icon: statusIcons.error,
    color: semantic.badge.error.text,
    bg: semantic.badge.error.bg,
    border: colors.error[700],
  },
  warning: {
    icon: statusIcons.warning,
    color: semantic.badge.warning.text,
    bg: semantic.badge.warning.bg,
    border: colors.warning[700],
  },
  info: {
    icon: statusIcons.info,
    color: semantic.badge.info.text,
    bg: semantic.badge.info.bg,
    border: colors.info[700],
  },
};

export interface ToastItemProps {
  toast: Toast;
  onDismiss: () => void;
}

/**
 * Individual toast notification
 */
export const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const [_visible, setVisible] = useState(false);
  const style = toastStyles[toast.type];

  // Animate in
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Auto dismiss
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 150);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [toast.duration, onDismiss]);

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={style.border}
      paddingX={2}
      paddingY={0}
      marginBottom={1}
      width={50}
    >
      <Box justifyContent="space-between">
        <Box>
          <Text color={style.color}>{style.icon} </Text>
          {toast.title && (
            <Text color={style.color} bold>
              {toast.title}
              {toast.message && ': '}
            </Text>
          )}
          <Text color={style.color}>{toast.message}</Text>
        </Box>
        {toast.dismissible !== false && (
          <Text color={colors.neutral[500]} dimColor>
            [x]
          </Text>
        )}
      </Box>
      {toast.action && (
        <Box marginTop={0}>
          <Text color={colors.primary[400]} underline>
            [{toast.action.label}]
          </Text>
        </Box>
      )}
    </Box>
  );
};

export interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxVisible?: number;
}

/**
 * Container for displaying multiple toasts
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  position = 'top-right',
  maxVisible = 5,
}) => {
  const visibleToasts = toasts.slice(0, maxVisible);
  const hiddenCount = toasts.length - maxVisible;

  // Position styles
  const positionStyles = {
    'top-right': { marginLeft: 30, marginTop: 1 },
    'top-left': { marginLeft: 1, marginTop: 1 },
    'bottom-right': { marginLeft: 30, marginTop: 20 },
    'bottom-left': { marginLeft: 1, marginTop: 20 },
  };

  return (
    <Box
      flexDirection="column"
      {...positionStyles[position]}
    >
      {visibleToasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
      {hiddenCount > 0 && (
        <Text color={colors.neutral[500]} dimColor>
          +{hiddenCount} more notification{hiddenCount > 1 ? 's' : ''}
        </Text>
      )}
    </Box>
  );
};

// ============================================================================
// Toast Context & Hook
// ============================================================================

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
  success: (message: string, options?: Partial<Toast>) => string;
  error: (message: string, options?: Partial<Toast>) => string;
  warning: (message: string, options?: Partial<Toast>) => string;
  info: (message: string, options?: Partial<Toast>) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Toast provider for managing toast state
 */
export const ToastProvider: React.FC<{
  children: React.ReactNode;
  defaultDuration?: number;
}> = ({ children, defaultDuration = 3000 }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>): string => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { ...toast, id, duration: toast.duration ?? defaultDuration }]);
    return id;
  }, [defaultDuration]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback((message: string, options?: Partial<Toast>) => {
    return addToast({ type: 'success', message, ...options });
  }, [addToast]);

  const error = useCallback((message: string, options?: Partial<Toast>) => {
    return addToast({ type: 'error', message, ...options });
  }, [addToast]);

  const warning = useCallback((message: string, options?: Partial<Toast>) => {
    return addToast({ type: 'warning', message, ...options });
  }, [addToast]);

  const info = useCallback((message: string, options?: Partial<Toast>) => {
    return addToast({ type: 'info', message, ...options });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

/**
 * Hook for using toast notifications
 *
 * @example
 * ```tsx
 * const toast = useToast();
 *
 * toast.success('Changes saved!');
 * toast.error('Failed to save', { duration: 5000 });
 * toast.info('Tip: Use keyboard shortcuts', { title: 'Tip' });
 * ```
 */
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// ============================================================================
// Standalone Toast Functions (for use without context)
// ============================================================================

/**
 * Create a standalone toast manager
 */
export const createToastManager = (defaultDuration = 3000) => {
  let toasts: Toast[] = [];
  const listeners = new Set<(toasts: Toast[]) => void>();

  const notify = () => {
    listeners.forEach((listener) => listener([...toasts]));
  };

  const addToast = (toast: Omit<Toast, 'id'>): string => {
    const id = Math.random().toString(36).slice(2, 9);
    const newToast: Toast = { ...toast, id, duration: toast.duration ?? defaultDuration };
    toasts = [...toasts, newToast];
    notify();

    // Auto remove
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  };

  const removeToast = (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  };

  const clearAll = () => {
    toasts = [];
    notify();
  };

  const subscribe = (listener: (toasts: Toast[]) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return {
    addToast,
    removeToast,
    clearAll,
    subscribe,
    success: (message: string, options?: Partial<Toast>) =>
      addToast({ type: 'success', message, ...options }),
    error: (message: string, options?: Partial<Toast>) =>
      addToast({ type: 'error', message, ...options }),
    warning: (message: string, options?: Partial<Toast>) =>
      addToast({ type: 'warning', message, ...options }),
    info: (message: string, options?: Partial<Toast>) =>
      addToast({ type: 'info', message, ...options }),
  };
};

export default ToastContainer;
