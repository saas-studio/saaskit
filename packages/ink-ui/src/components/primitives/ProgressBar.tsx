import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { colors } from '../../theme/colors.js';
import { blocks } from '../../theme/icons.js';

export type ProgressVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

export interface ProgressBarProps {
  /** Current value (0-100) */
  value: number;
  /** Width in characters */
  width?: number;
  /** Show percentage label */
  showPercentage?: boolean;
  /** Visual variant */
  variant?: ProgressVariant;
  /** Custom fill character */
  fillChar?: string;
  /** Custom empty character */
  emptyChar?: string;
  /** Show label text */
  label?: string;
  /** Animate progress changes */
  animated?: boolean;
  /** Animation speed (ms per step) */
  animationSpeed?: number;
}

const progressColors: Record<ProgressVariant, string> = {
  default: colors.primary[500],
  success: colors.success[500],
  warning: colors.warning[500],
  error: colors.error[500],
  info: colors.info[500],
};

/**
 * Progress bar component with optional animation
 *
 * @example
 * ```tsx
 * <ProgressBar value={75} variant="success" />
 * <ProgressBar value={50} showPercentage width={40} />
 * <ProgressBar value={25} animated label="Uploading..." />
 * ```
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  width = 30,
  showPercentage = true,
  variant = 'default',
  fillChar = blocks.full,
  emptyChar = blocks.shades[0],
  label,
  animated = false,
  animationSpeed = 20,
}) => {
  const [displayValue, setDisplayValue] = useState(animated ? 0 : value);

  useEffect(() => {
    if (!animated) {
      setDisplayValue(value);
      return;
    }

    const step = value > displayValue ? 1 : -1;
    if (displayValue === value) return;

    const timer = setInterval(() => {
      setDisplayValue((prev) => {
        const next = prev + step;
        if ((step > 0 && next >= value) || (step < 0 && next <= value)) {
          clearInterval(timer);
          return value;
        }
        return next;
      });
    }, animationSpeed);

    return () => clearInterval(timer);
  }, [value, animated, animationSpeed]);

  const clampedValue = Math.min(100, Math.max(0, displayValue));
  const filledWidth = Math.round((clampedValue / 100) * width);
  const emptyWidth = width - filledWidth;

  const filled = fillChar.repeat(filledWidth);
  const empty = emptyChar.repeat(emptyWidth);

  const progressColor = progressColors[variant];

  return (
    <Box flexDirection="column">
      {label && (
        <Box marginBottom={0}>
          <Text color={colors.neutral[600]}>{label}</Text>
        </Box>
      )}
      <Box>
        <Text color={progressColor}>{filled}</Text>
        <Text color={colors.neutral[300]}>{empty}</Text>
        {showPercentage && (
          <Text color={colors.neutral[600]}>
            {' '}{clampedValue.toString().padStart(3)}%
          </Text>
        )}
      </Box>
    </Box>
  );
};

/**
 * Segmented progress bar with discrete steps
 */
export interface SegmentedProgressProps {
  /** Current step (0-based) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Width per segment */
  segmentWidth?: number;
  /** Gap between segments */
  gap?: string;
  /** Show step numbers */
  showNumbers?: boolean;
  /** Variant */
  variant?: ProgressVariant;
}

export const SegmentedProgress: React.FC<SegmentedProgressProps> = ({
  currentStep,
  totalSteps,
  segmentWidth = 6,
  gap = ' ',
  showNumbers = false,
  variant = 'default',
}) => {
  const progressColor = progressColors[variant];

  return (
    <Box>
      {Array.from({ length: totalSteps }, (_, i) => {
        const isComplete = i < currentStep;
        const isCurrent = i === currentStep;
        const segmentColor = isComplete
          ? progressColor
          : isCurrent
            ? colors.primary[300]
            : colors.neutral[300];

        return (
          <Box key={i}>
            <Box>
              <Text color={segmentColor}>
                {isComplete || isCurrent
                  ? blocks.full.repeat(segmentWidth)
                  : blocks.shades[0].repeat(segmentWidth)}
              </Text>
            </Box>
            {showNumbers && (
              <Text color={isComplete ? progressColor : colors.neutral[500]}>
                {' '}{i + 1}
              </Text>
            )}
            {i < totalSteps - 1 && <Text>{gap}</Text>}
          </Box>
        );
      })}
    </Box>
  );
};

/**
 * Circular/radial progress indicator using braille patterns
 */
export interface CircularProgressProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: ProgressVariant;
  showValue?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 'md',
  variant = 'default',
  showValue = true,
}) => {
  const progressColor = progressColors[variant];
  const clampedValue = Math.min(100, Math.max(0, value));

  // Simplified circular representation using Unicode
  const quarters = Math.round((clampedValue / 100) * 4);
  const circleStates = ['○', '◔', '◑', '◕', '●'];

  const sizeChars = { sm: 1, md: 1, lg: 1 };

  return (
    <Box>
      <Text color={progressColor}>{circleStates[quarters]}</Text>
      {showValue && (
        <Text color={colors.neutral[600]}> {clampedValue}%</Text>
      )}
    </Box>
  );
};

/**
 * Indeterminate progress bar with animation
 */
export const IndeterminateProgress: React.FC<{
  width?: number;
  variant?: ProgressVariant;
}> = ({ width = 30, variant = 'default' }) => {
  const [position, setPosition] = useState(0);
  const progressColor = progressColors[variant];
  const barWidth = 8;

  useEffect(() => {
    const timer = setInterval(() => {
      setPosition((prev) => (prev + 1) % (width + barWidth));
    }, 50);
    return () => clearInterval(timer);
  }, [width]);

  const renderBar = () => {
    const chars: string[] = [];
    for (let i = 0; i < width; i++) {
      const distFromCenter = Math.abs(i - position + barWidth / 2);
      if (distFromCenter < barWidth / 2) {
        chars.push(blocks.full);
      } else if (distFromCenter < barWidth) {
        chars.push(blocks.shades[2]);
      } else {
        chars.push(blocks.shades[0]);
      }
    }
    return chars.join('');
  };

  return (
    <Box>
      <Text color={progressColor}>{renderBar()}</Text>
    </Box>
  );
};

/**
 * Download/upload progress with speed indicator
 */
export interface TransferProgressProps {
  current: number;
  total: number;
  unit?: 'bytes' | 'KB' | 'MB' | 'GB';
  speed?: number;
  width?: number;
  variant?: ProgressVariant;
}

export const TransferProgress: React.FC<TransferProgressProps> = ({
  current,
  total,
  unit = 'MB',
  speed,
  width = 30,
  variant = 'default',
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  const formatSize = (value: number): string => {
    return `${value.toFixed(1)} ${unit}`;
  };

  return (
    <Box flexDirection="column">
      <ProgressBar value={percentage} width={width} variant={variant} showPercentage={false} />
      <Box justifyContent="space-between" width={width}>
        <Text color={colors.neutral[600]}>
          {formatSize(current)} / {formatSize(total)}
        </Text>
        <Text color={colors.neutral[500]}>
          {percentage}%
          {speed !== undefined && ` (${formatSize(speed)}/s)`}
        </Text>
      </Box>
    </Box>
  );
};

/**
 * Multi-value stacked progress bar
 */
export interface StackedProgressProps {
  segments: Array<{
    value: number;
    color: string;
    label?: string;
  }>;
  width?: number;
  showLegend?: boolean;
}

export const StackedProgress: React.FC<StackedProgressProps> = ({
  segments,
  width = 40,
  showLegend = false,
}) => {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
  if (total === 0) return null;

  const bar = segments.map((segment, i) => {
    const segmentWidth = Math.round((segment.value / total) * width);
    return (
      <Text key={i} color={segment.color}>
        {blocks.full.repeat(segmentWidth)}
      </Text>
    );
  });

  return (
    <Box flexDirection="column">
      <Box>{bar}</Box>
      {showLegend && (
        <Box marginTop={1} flexWrap="wrap">
          {segments.map((segment, i) => (
            <Box key={i} marginRight={2}>
              <Text color={segment.color}>●</Text>
              <Text color={colors.neutral[600]}>
                {' '}{segment.label || `Segment ${i + 1}`}: {segment.value}
              </Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ProgressBar;
