import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useFocus, useFocusManager } from 'ink';
import { colors } from '../../theme/colors.js';
import { box } from '../../theme/icons.js';

export type ModalVariant = 'default' | 'danger' | 'success' | 'warning';

export interface ModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Modal title */
  title: string;
  /** Modal content */
  children: React.ReactNode;
  /** Close callback */
  onClose: () => void;
  /** Modal width */
  width?: number;
  /** Visual variant */
  variant?: ModalVariant;
  /** Show close hint */
  showCloseHint?: boolean;
  /** Footer content (buttons) */
  footer?: React.ReactNode;
  /** Whether clicking backdrop closes modal */
  closeOnBackdrop?: boolean;
  /** Whether ESC key closes modal */
  closeOnEsc?: boolean;
}

const variantStyles: Record<ModalVariant, { border: string; title: string }> = {
  default: {
    border: colors.primary[500],
    title: colors.primary[400],
  },
  danger: {
    border: colors.error[500],
    title: colors.error[400],
  },
  success: {
    border: colors.success[500],
    title: colors.success[400],
  },
  warning: {
    border: colors.warning[500],
    title: colors.warning[400],
  },
};

/**
 * Modal dialog component
 *
 * @example
 * ```tsx
 * <Modal
 *   visible={isOpen}
 *   title="Confirm Delete"
 *   onClose={() => setIsOpen(false)}
 *   variant="danger"
 *   footer={
 *     <Box justifyContent="flex-end">
 *       <Button label="Cancel" onPress={() => setIsOpen(false)} />
 *       <Button label="Delete" variant="danger" onPress={handleDelete} />
 *     </Box>
 *   }
 * >
 *   <Text>Are you sure you want to delete this item?</Text>
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> = ({
  visible,
  title,
  children,
  onClose,
  width = 50,
  variant = 'default',
  showCloseHint = true,
  footer,
  closeOnEsc = true,
}) => {
  const style = variantStyles[variant];
  const [fadeIn, setFadeIn] = useState(false);

  // Handle ESC key
  useInput((input, key) => {
    if (closeOnEsc && key.escape && visible) {
      onClose();
    }
  });

  // Fade in animation
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setFadeIn(true), 50);
      return () => clearTimeout(timer);
    } else {
      setFadeIn(false);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Box flexDirection="column">
      {/* Backdrop */}
      <Backdrop visible={fadeIn} />

      {/* Modal */}
      <Box
        flexDirection="column"
        marginLeft={Math.floor((80 - width) / 2)}
        marginTop={3}
      >
        <Box
          flexDirection="column"
          borderStyle="double"
          borderColor={style.border}
          width={width}
          backgroundColor={colors.neutral[100]}
          paddingX={2}
          paddingY={1}
        >
          {/* Header */}
          <Box justifyContent="space-between" marginBottom={1}>
            <Text bold color={style.title}>
              {title}
            </Text>
            {showCloseHint && (
              <Text color={colors.neutral[500]} dimColor>
                [ESC]
              </Text>
            )}
          </Box>

          {/* Content */}
          <Box flexDirection="column" marginBottom={footer ? 1 : 0}>
            {children}
          </Box>

          {/* Footer */}
          {footer && (
            <Box
              marginTop={1}
              paddingTop={1}
              borderStyle="single"
              borderTop
              borderBottom={false}
              borderLeft={false}
              borderRight={false}
              borderColor={colors.neutral[300]}
            >
              {footer}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

/**
 * Semi-transparent backdrop
 */
const Backdrop: React.FC<{ visible: boolean }> = ({ visible }) => {
  const backdropWidth = 80;
  const backdropHeight = 24;

  if (!visible) return null;

  return (
    <Box
      flexDirection="column"
      position="absolute"
      marginTop={0}
      marginLeft={0}
    >
      {Array.from({ length: backdropHeight }, (_, i) => (
        <Text key={i} color={colors.neutral[200]} dimColor>
          {box.single.horizontal.repeat(backdropWidth)}
        </Text>
      ))}
    </Box>
  );
};

/**
 * Confirmation dialog modal
 */
export interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ModalVariant;
  width?: number;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  width = 50,
}) => {
  const [focusedButton, setFocusedButton] = useState<'cancel' | 'confirm'>('cancel');

  useInput((input, key) => {
    if (!visible) return;

    if (key.leftArrow || key.rightArrow || key.tab) {
      setFocusedButton((prev) => (prev === 'cancel' ? 'confirm' : 'cancel'));
    } else if (key.return) {
      if (focusedButton === 'confirm') {
        onConfirm();
      } else {
        onCancel();
      }
    }
  });

  const style = variantStyles[variant];
  const confirmColor = variant === 'danger' ? colors.error[500] : colors.primary[500];

  return (
    <Modal
      visible={visible}
      title={title}
      onClose={onCancel}
      variant={variant}
      width={width}
      footer={
        <Box justifyContent="flex-end">
          <Box
            paddingX={2}
            borderStyle="single"
            borderColor={focusedButton === 'cancel' ? colors.primary[500] : colors.neutral[400]}
            marginRight={2}
          >
            <Text
              color={focusedButton === 'cancel' ? colors.neutral[800] : colors.neutral[600]}
              bold={focusedButton === 'cancel'}
            >
              {cancelLabel}
            </Text>
          </Box>
          <Box
            paddingX={2}
            backgroundColor={focusedButton === 'confirm' ? confirmColor : undefined}
            borderStyle="single"
            borderColor={focusedButton === 'confirm' ? confirmColor : colors.neutral[400]}
          >
            <Text
              color={focusedButton === 'confirm' ? colors.neutral[900] : colors.neutral[600]}
              bold={focusedButton === 'confirm'}
            >
              {confirmLabel}
            </Text>
          </Box>
        </Box>
      }
    >
      <Text color={colors.neutral[700]}>{message}</Text>
    </Modal>
  );
};

/**
 * Alert modal (single button)
 */
export interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  buttonLabel?: string;
  variant?: ModalVariant;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message,
  onClose,
  buttonLabel = 'OK',
  variant = 'default',
}) => {
  useInput((input, key) => {
    if (visible && key.return) {
      onClose();
    }
  });

  return (
    <Modal
      visible={visible}
      title={title}
      onClose={onClose}
      variant={variant}
      width={45}
      footer={
        <Box justifyContent="center">
          <Box
            paddingX={3}
            backgroundColor={colors.primary[500]}
          >
            <Text color={colors.neutral[900]} bold>
              {buttonLabel}
            </Text>
          </Box>
        </Box>
      }
    >
      <Text color={colors.neutral[700]}>{message}</Text>
    </Modal>
  );
};

/**
 * Prompt modal (with input)
 */
export interface PromptModalProps {
  visible: boolean;
  title: string;
  message: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
  placeholder?: string;
  defaultValue?: string;
  submitLabel?: string;
  cancelLabel?: string;
}

export const PromptModal: React.FC<PromptModalProps> = ({
  visible,
  title,
  message,
  onSubmit,
  onCancel,
  placeholder = '',
  defaultValue = '',
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
}) => {
  const [value, setValue] = useState(defaultValue);
  const [focusedButton, setFocusedButton] = useState<'input' | 'cancel' | 'submit'>('input');

  useInput((input, key) => {
    if (!visible) return;

    if (key.tab) {
      setFocusedButton((prev) =>
        prev === 'input' ? 'cancel' : prev === 'cancel' ? 'submit' : 'input'
      );
    } else if (focusedButton === 'input') {
      if (key.backspace || key.delete) {
        setValue((prev) => prev.slice(0, -1));
      } else if (input && !key.ctrl && !key.meta) {
        setValue((prev) => prev + input);
      }
    } else if (key.return) {
      if (focusedButton === 'submit') {
        onSubmit(value);
      } else if (focusedButton === 'cancel') {
        onCancel();
      }
    }
  });

  // Reset value when modal opens
  useEffect(() => {
    if (visible) {
      setValue(defaultValue);
      setFocusedButton('input');
    }
  }, [visible, defaultValue]);

  return (
    <Modal
      visible={visible}
      title={title}
      onClose={onCancel}
      width={50}
      footer={
        <Box justifyContent="flex-end">
          <Box
            paddingX={2}
            borderStyle="single"
            borderColor={focusedButton === 'cancel' ? colors.primary[500] : colors.neutral[400]}
            marginRight={2}
          >
            <Text color={focusedButton === 'cancel' ? colors.neutral[800] : colors.neutral[600]}>
              {cancelLabel}
            </Text>
          </Box>
          <Box
            paddingX={2}
            backgroundColor={focusedButton === 'submit' ? colors.primary[500] : undefined}
            borderStyle="single"
            borderColor={focusedButton === 'submit' ? colors.primary[500] : colors.neutral[400]}
          >
            <Text color={focusedButton === 'submit' ? colors.neutral[900] : colors.neutral[600]}>
              {submitLabel}
            </Text>
          </Box>
        </Box>
      }
    >
      <Box flexDirection="column">
        <Text color={colors.neutral[700]} marginBottom={1}>
          {message}
        </Text>
        <Box
          borderStyle="single"
          borderColor={focusedButton === 'input' ? colors.primary[500] : colors.neutral[300]}
          paddingX={1}
        >
          <Text color={value ? colors.neutral[700] : colors.neutral[500]}>
            {value || placeholder}
            {focusedButton === 'input' && (
              <Text color={colors.primary[500]}>|</Text>
            )}
          </Text>
        </Box>
      </Box>
    </Modal>
  );
};

export default Modal;
