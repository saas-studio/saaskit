import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';

export interface FadeProps {
  /** Whether the content is visible */
  visible: boolean;
  /** Content to show/hide */
  children: React.ReactNode;
  /** Animation duration in ms */
  duration?: number;
  /** Callback when fade completes */
  onComplete?: () => void;
  /** Number of opacity steps */
  steps?: number;
}

/**
 * Fade transition component
 *
 * Simulates opacity changes using dim/bold text styling since
 * terminals don't support true opacity.
 *
 * @example
 * ```tsx
 * <Fade visible={isOpen} duration={200}>
 *   <Modal>Content</Modal>
 * </Fade>
 * ```
 */
export const Fade: React.FC<FadeProps> = ({
  visible,
  children,
  duration = 200,
  onComplete,
  steps = 4,
}) => {
  const [opacity, setOpacity] = useState(visible ? 1 : 0);
  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
    }

    const stepTime = duration / steps;
    let currentStep = visible ? 0 : steps;

    const timer = setInterval(() => {
      if (visible) {
        currentStep++;
        setOpacity(currentStep / steps);
        if (currentStep >= steps) {
          clearInterval(timer);
          onComplete?.();
        }
      } else {
        currentStep--;
        setOpacity(currentStep / steps);
        if (currentStep <= 0) {
          clearInterval(timer);
          setShouldRender(false);
          onComplete?.();
        }
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [visible, duration, steps, onComplete]);

  if (!shouldRender) return null;

  // Simulate opacity with dim/bold
  const getDimState = () => {
    if (opacity >= 0.75) return { dim: false, bold: false };
    if (opacity >= 0.5) return { dim: true, bold: false };
    if (opacity >= 0.25) return { dim: true, bold: false };
    return { dim: true, bold: false };
  };

  const { dim } = getDimState();

  return (
    <Box>
      <Text dimColor={dim}>
        {children}
      </Text>
    </Box>
  );
};

/**
 * Fade in only (no fade out)
 */
export const FadeIn: React.FC<{
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  onComplete?: () => void;
}> = ({ children, duration = 200, delay = 0, onComplete }) => {
  const [started, setStarted] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setStarted(true), delay);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [delay]);

  if (!started) return null;

  return (
    <Fade visible={true} duration={duration} onComplete={onComplete}>
      {children}
    </Fade>
  );
};

/**
 * Crossfade between two elements
 */
export const Crossfade: React.FC<{
  showFirst: boolean;
  first: React.ReactNode;
  second: React.ReactNode;
  duration?: number;
}> = ({ showFirst, first, second, duration = 200 }) => {
  return (
    <Box>
      <Fade visible={showFirst} duration={duration}>
        {first}
      </Fade>
      <Fade visible={!showFirst} duration={duration}>
        {second}
      </Fade>
    </Box>
  );
};

export default Fade;
