import React, { useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from '../../theme/colors.js';
import { arrows, status as statusIcons, box } from '../../theme/icons.js';

export interface WizardStep {
  /** Unique step identifier */
  id: string;
  /** Step title (shown in progress) */
  title: string;
  /** Step content */
  content: React.ReactNode;
  /** Validation function (return true if valid) */
  validate?: () => boolean | Promise<boolean>;
  /** Whether step can be skipped */
  optional?: boolean;
  /** Custom icon for the step */
  icon?: string;
}

export interface WizardProps {
  /** Array of wizard steps */
  steps: WizardStep[];
  /** Callback when wizard completes */
  onComplete: () => void;
  /** Callback when wizard is cancelled */
  onCancel?: () => void;
  /** Callback when step changes */
  onStepChange?: (stepIndex: number, direction: 'forward' | 'backward') => void;
  /** Initial step index */
  initialStep?: number;
  /** Show step numbers */
  showNumbers?: boolean;
  /** Allow navigation to previous steps */
  allowBack?: boolean;
  /** Progress indicator style */
  progressStyle?: 'dots' | 'line' | 'steps';
  /** Width of the wizard */
  width?: number;
}

/**
 * Multi-step wizard component
 *
 * @example
 * ```tsx
 * <Wizard
 *   steps={[
 *     { id: 'account', title: 'Account', content: <AccountForm /> },
 *     { id: 'workspace', title: 'Workspace', content: <WorkspaceForm /> },
 *     { id: 'billing', title: 'Billing', content: <BillingForm /> },
 *     { id: 'review', title: 'Review', content: <ReviewStep /> },
 *   ]}
 *   onComplete={() => console.log('Done!')}
 *   onCancel={() => console.log('Cancelled')}
 * />
 * ```
 */
export const Wizard: React.FC<WizardProps> = ({
  steps,
  onComplete,
  onCancel,
  onStepChange,
  initialStep = 0,
  showNumbers = true,
  allowBack = true,
  progressStyle = 'dots',
  width = 60,
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isValidating, setIsValidating] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const goToNextStep = useCallback(async () => {
    if (isLastStep) {
      onComplete();
      return;
    }

    // Validate current step
    if (step.validate) {
      setIsValidating(true);
      const isValid = await step.validate();
      setIsValidating(false);

      if (!isValid) return;
    }

    setDirection('forward');
    setCurrentStep((prev) => prev + 1);
    onStepChange?.(currentStep + 1, 'forward');
  }, [currentStep, isLastStep, step, onComplete, onStepChange]);

  const goToPrevStep = useCallback(() => {
    if (!allowBack || isFirstStep) return;

    setDirection('backward');
    setCurrentStep((prev) => prev - 1);
    onStepChange?.(currentStep - 1, 'backward');
  }, [allowBack, isFirstStep, currentStep, onStepChange]);

  // Keyboard navigation
  useInput((input, key) => {
    if (key.leftArrow && allowBack && !isFirstStep) {
      goToPrevStep();
    } else if (key.rightArrow && !isValidating) {
      goToNextStep();
    } else if (key.return && !isValidating) {
      goToNextStep();
    } else if (key.escape && onCancel) {
      onCancel();
    }
  });

  // Render progress indicator
  const renderProgress = () => {
    switch (progressStyle) {
      case 'line':
        return renderLineProgress();
      case 'steps':
        return renderStepsProgress();
      default:
        return renderDotsProgress();
    }
  };

  // Dots style: ● ◉ ○
  const renderDotsProgress = () => (
    <Box marginBottom={1}>
      {steps.map((s, i) => {
        const isComplete = i < currentStep;
        const isCurrent = i === currentStep;

        let icon: string;
        let color: string;

        if (isComplete) {
          icon = statusIcons.success;
          color = colors.success[500];
        } else if (isCurrent) {
          icon = statusIcons.radioOn;
          color = colors.primary[500];
        } else {
          icon = statusIcons.radioOff;
          color = colors.neutral[500];
        }

        return (
          <Box key={s.id} marginRight={1}>
            <Text color={color}>{icon}</Text>
            <Text
              color={isCurrent ? colors.neutral[700] : colors.neutral[500]}
              bold={isCurrent}
            >
              {' '}{showNumbers ? `${i + 1}. ` : ''}{s.title}
            </Text>
            {i < steps.length - 1 && (
              <Text color={colors.neutral[400]}>{' ─── '}</Text>
            )}
          </Box>
        );
      })}
    </Box>
  );

  // Line style: [=========>          ]
  const renderLineProgress = () => {
    const progressWidth = width - 10;
    const filledWidth = Math.floor(((currentStep + 1) / steps.length) * progressWidth);
    const emptyWidth = progressWidth - filledWidth;

    return (
      <Box flexDirection="column" marginBottom={1}>
        <Box marginBottom={0}>
          <Text color={colors.neutral[500]}>
            Step {currentStep + 1} of {steps.length}: {step.title}
          </Text>
        </Box>
        <Box>
          <Text color={colors.neutral[400]}>[</Text>
          <Text color={colors.primary[500]}>
            {'='.repeat(Math.max(0, filledWidth - 1))}{filledWidth > 0 ? '>' : ''}
          </Text>
          <Text color={colors.neutral[300]}>{' '.repeat(emptyWidth)}</Text>
          <Text color={colors.neutral[400]}>]</Text>
        </Box>
      </Box>
    );
  };

  // Steps style: vertical list
  const renderStepsProgress = () => (
    <Box flexDirection="column" marginBottom={1} marginRight={2}>
      {steps.map((s, i) => {
        const isComplete = i < currentStep;
        const isCurrent = i === currentStep;

        let icon: string;
        let color: string;

        if (isComplete) {
          icon = statusIcons.success;
          color = colors.success[500];
        } else if (isCurrent) {
          icon = arrows.triangleRightSmall;
          color = colors.primary[500];
        } else {
          icon = ' ';
          color = colors.neutral[500];
        }

        return (
          <Box key={s.id}>
            <Text color={color}>{icon} </Text>
            <Text
              color={isCurrent ? colors.neutral[700] : isComplete ? colors.success[500] : colors.neutral[500]}
              bold={isCurrent}
              dimColor={!isCurrent && !isComplete}
            >
              {showNumbers ? `${i + 1}. ` : ''}{s.title}
            </Text>
          </Box>
        );
      })}
    </Box>
  );

  return (
    <Box flexDirection="column" width={width}>
      {/* Progress */}
      {renderProgress()}

      {/* Step content */}
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={colors.neutral[300]}
        padding={2}
        marginY={1}
      >
        <Text bold color={colors.neutral[800]} marginBottom={1}>
          {step.icon && `${step.icon} `}{step.title}
          {step.optional && (
            <Text color={colors.neutral[500]} dimColor> (Optional)</Text>
          )}
        </Text>
        {step.content}
      </Box>

      {/* Navigation */}
      <Box justifyContent="space-between">
        <Box>
          {allowBack && !isFirstStep ? (
            <Text color={colors.neutral[600]}>
              {arrows.left} Previous
            </Text>
          ) : onCancel ? (
            <Text color={colors.neutral[500]}>
              [ESC] Cancel
            </Text>
          ) : (
            <Text> </Text>
          )}
        </Box>

        <Text color={colors.neutral[500]}>
          Step {currentStep + 1} of {steps.length}
        </Text>

        <Box>
          {isValidating ? (
            <Text color={colors.primary[500]}>Validating...</Text>
          ) : isLastStep ? (
            <Text color={colors.success[500]} bold>
              Complete {arrows.right}
            </Text>
          ) : (
            <Text color={colors.neutral[600]}>
              Next {arrows.right}
            </Text>
          )}
        </Box>
      </Box>

      {/* Keyboard hints */}
      <Box marginTop={1}>
        <Text color={colors.neutral[400]} dimColor>
          {allowBack && !isFirstStep ? `${arrows.left}/${arrows.right} navigate` : `${arrows.right} next`}
          {' • '}
          Enter to continue
          {onCancel && ' • ESC to cancel'}
        </Text>
      </Box>
    </Box>
  );
};

/**
 * Wizard step wrapper for form validation
 */
export interface WizardFormStepProps {
  children: React.ReactNode;
  onValidate?: () => boolean | Promise<boolean>;
}

export const WizardFormStep: React.FC<WizardFormStepProps> = ({
  children,
  onValidate,
}) => {
  return <Box flexDirection="column">{children}</Box>;
};

/**
 * Simple step-by-step guide (read-only)
 */
export interface StepGuideProps {
  steps: Array<{
    title: string;
    description?: string;
    status?: 'pending' | 'current' | 'complete';
  }>;
  currentStep?: number;
}

export const StepGuide: React.FC<StepGuideProps> = ({ steps, currentStep = 0 }) => (
  <Box flexDirection="column">
    {steps.map((step, i) => {
      const status = step.status ?? (i < currentStep ? 'complete' : i === currentStep ? 'current' : 'pending');

      const iconColor = status === 'complete'
        ? colors.success[500]
        : status === 'current'
          ? colors.primary[500]
          : colors.neutral[500];

      const icon = status === 'complete'
        ? statusIcons.success
        : status === 'current'
          ? statusIcons.radioOn
          : statusIcons.radioOff;

      return (
        <Box key={i} flexDirection="column" marginBottom={1}>
          <Box>
            <Text color={iconColor}>{icon} </Text>
            <Text
              color={status === 'current' ? colors.neutral[700] : colors.neutral[600]}
              bold={status === 'current'}
            >
              {step.title}
            </Text>
          </Box>
          {step.description && (
            <Box marginLeft={3}>
              <Text color={colors.neutral[500]} dimColor>
                {step.description}
              </Text>
            </Box>
          )}
          {i < steps.length - 1 && (
            <Box marginLeft={1}>
              <Text color={status === 'complete' ? colors.success[500] : colors.neutral[300]}>
                {box.single.vertical}
              </Text>
            </Box>
          )}
        </Box>
      );
    })}
  </Box>
);

export default Wizard;
