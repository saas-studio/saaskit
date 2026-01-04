import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';
import { spinners } from '../../theme/icons.js';
import { colors } from '../../theme/colors.js';

export type SpinnerType = 'dots' | 'line' | 'arc' | 'blocks' | 'bounce' | 'growingDots';

export interface SpinnerProps {
  /** Spinner animation type */
  type?: SpinnerType;
  /** Spinner color (hex or ANSI) */
  color?: string;
  /** Optional label text */
  label?: string;
  /** Label color */
  labelColor?: string;
  /** Position of label relative to spinner */
  labelPosition?: 'right' | 'left';
  /** Animation interval in ms */
  interval?: number;
  /** Whether the spinner is active */
  active?: boolean;
}

// Default intervals optimized for each spinner type
const defaultIntervals: Record<SpinnerType, number> = {
  dots: 80,
  line: 100,
  arc: 100,
  blocks: 120,
  bounce: 120,
  growingDots: 150,
};

/**
 * Animated spinner component for loading states
 *
 * @example
 * ```tsx
 * <Spinner type="dots" label="Loading..." />
 * <Spinner type="arc" color="#4CAF50" />
 * <Spinner type="blocks" active={isLoading} />
 * ```
 */
export const Spinner: React.FC<SpinnerProps> = ({
  type = 'dots',
  color = colors.primary[500],
  label,
  labelColor = colors.neutral[600],
  labelPosition = 'right',
  interval,
  active = true,
}) => {
  const [frameIndex, setFrameIndex] = useState(0);
  const frames = spinners[type];
  const animationInterval = interval ?? defaultIntervals[type];

  useEffect(() => {
    if (!active) return;

    const timer = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, animationInterval);

    return () => clearInterval(timer);
  }, [type, animationInterval, active, frames.length]);

  if (!active) {
    // Show empty space when inactive to preserve layout
    return (
      <Box>
        <Text> </Text>
        {label && <Text color={labelColor}> {label}</Text>}
      </Box>
    );
  }

  const spinnerElement = <Text color={color}>{frames[frameIndex]}</Text>;
  const labelElement = label && <Text color={labelColor}>{label}</Text>;

  return (
    <Box>
      {labelPosition === 'left' && labelElement && (
        <>
          {labelElement}
          <Text> </Text>
        </>
      )}
      {spinnerElement}
      {labelPosition === 'right' && labelElement && (
        <>
          <Text> </Text>
          {labelElement}
        </>
      )}
    </Box>
  );
};

/**
 * Inline loading indicator with spinner and text
 */
export const LoadingIndicator: React.FC<{
  message?: string;
  type?: SpinnerType;
}> = ({ message = 'Loading...', type = 'dots' }) => (
  <Box>
    <Spinner type={type} color={colors.primary[500]} />
    <Text color={colors.neutral[600]}> {message}</Text>
  </Box>
);

/**
 * Full-width loading bar with spinner
 */
export const LoadingBar: React.FC<{
  message?: string;
  width?: number;
}> = ({ message = 'Processing', width = 40 }) => {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDots((prev) => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box
      borderStyle="round"
      borderColor={colors.neutral[300]}
      paddingX={2}
      paddingY={0}
      width={width}
    >
      <Spinner type="dots" color={colors.primary[500]} />
      <Text color={colors.neutral[600]}>
        {' '}{message}{'.'.repeat(dots)}
      </Text>
    </Box>
  );
};

/**
 * Spinner with success/error completion states
 */
export const SpinnerWithStatus: React.FC<{
  status: 'loading' | 'success' | 'error';
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
}> = ({
  status,
  loadingMessage = 'Processing...',
  successMessage = 'Complete!',
  errorMessage = 'Failed',
}) => {
  if (status === 'loading') {
    return <Spinner type="dots" label={loadingMessage} />;
  }

  if (status === 'success') {
    return (
      <Box>
        <Text color={colors.success[500]}>✓</Text>
        <Text color={colors.success[400]}> {successMessage}</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Text color={colors.error[500]}>✗</Text>
      <Text color={colors.error[400]}> {errorMessage}</Text>
    </Box>
  );
};

/**
 * Multiple spinners for parallel tasks
 */
export const MultiSpinner: React.FC<{
  tasks: Array<{
    id: string;
    label: string;
    status: 'pending' | 'running' | 'success' | 'error';
  }>;
}> = ({ tasks }) => (
  <Box flexDirection="column">
    {tasks.map((task) => (
      <Box key={task.id}>
        {task.status === 'pending' && (
          <>
            <Text color={colors.neutral[500]}>○</Text>
            <Text color={colors.neutral[500]}> {task.label}</Text>
          </>
        )}
        {task.status === 'running' && (
          <>
            <Spinner type="dots" color={colors.primary[500]} />
            <Text color={colors.neutral[700]}> {task.label}</Text>
          </>
        )}
        {task.status === 'success' && (
          <>
            <Text color={colors.success[500]}>✓</Text>
            <Text color={colors.success[400]}> {task.label}</Text>
          </>
        )}
        {task.status === 'error' && (
          <>
            <Text color={colors.error[500]}>✗</Text>
            <Text color={colors.error[400]}> {task.label}</Text>
          </>
        )}
      </Box>
    ))}
  </Box>
);

export default Spinner;
