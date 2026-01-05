import React from 'react';
import { Box, Text } from 'ink';
import { colors, semantic } from '../../theme/colors.js';
import { status as statusIcons, selection } from '../../theme/icons.js';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'pro';

export interface BadgeProps {
  /** Badge text content */
  label: string;
  /** Visual variant */
  variant?: BadgeVariant;
  /** Show status dot before label */
  dot?: boolean;
  /** Use outline style instead of filled */
  outline?: boolean;
  /** Show an icon before the label */
  icon?: string;
  /** Make text bold */
  bold?: boolean;
}

const badgeStyles: Record<BadgeVariant, { bg: string; fg: string; dot: string; border: string }> = {
  success: {
    bg: semantic.badge.success.bg,
    fg: semantic.badge.success.text,
    dot: semantic.badge.success.dot,
    border: colors.success[700],
  },
  warning: {
    bg: semantic.badge.warning.bg,
    fg: semantic.badge.warning.text,
    dot: semantic.badge.warning.dot,
    border: colors.warning[700],
  },
  error: {
    bg: semantic.badge.error.bg,
    fg: semantic.badge.error.text,
    dot: semantic.badge.error.dot,
    border: colors.error[700],
  },
  info: {
    bg: semantic.badge.info.bg,
    fg: semantic.badge.info.text,
    dot: semantic.badge.info.dot,
    border: colors.info[700],
  },
  neutral: {
    bg: semantic.badge.neutral.bg,
    fg: semantic.badge.neutral.text,
    dot: semantic.badge.neutral.dot,
    border: colors.neutral[400],
  },
  pro: {
    bg: semantic.badge.pro.bg,
    fg: semantic.badge.pro.text,
    dot: semantic.badge.pro.dot,
    border: colors.secondary[700],
  },
};

/**
 * Badge component for status indicators and labels
 *
 * @example
 * ```tsx
 * <Badge label="Active" variant="success" dot />
 * <Badge label="PRO" variant="pro" bold />
 * <Badge label="Warning" variant="warning" icon="⚠" />
 * ```
 */
export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  dot = false,
  outline = false,
  icon,
  bold = false,
}) => {
  const style = badgeStyles[variant];

  return (
    <Box
      borderStyle={outline ? 'single' : undefined}
      borderColor={outline ? style.border : undefined}
      paddingX={1}
    >
      {dot && (
        <Text color={style.dot}>
          {statusIcons.bullet}{' '}
        </Text>
      )}
      {icon && (
        <Text color={style.fg}>
          {icon}{' '}
        </Text>
      )}
      <Text color={style.fg} bold={bold}>
        {label}
      </Text>
    </Box>
  );
};

/**
 * Status badge with predefined icon
 */
export const StatusBadge: React.FC<{
  status: 'online' | 'offline' | 'busy' | 'away' | 'dnd';
  showLabel?: boolean;
}> = ({ status, showLabel = true }) => {
  const statusConfig = {
    online: { variant: 'success' as const, label: 'Online', icon: selection.radioOnFilled },
    offline: { variant: 'neutral' as const, label: 'Offline', icon: selection.radioOff },
    busy: { variant: 'error' as const, label: 'Busy', icon: selection.radioOnFilled },
    away: { variant: 'warning' as const, label: 'Away', icon: selection.radioOnFilled },
    dnd: { variant: 'error' as const, label: 'Do Not Disturb', icon: selection.radioOnFilled },
  };

  const config = statusConfig[status];

  return (
    <Badge
      label={showLabel ? config.label : ''}
      variant={config.variant}
      icon={config.icon}
    />
  );
};

/**
 * Plan/tier badge
 */
export const PlanBadge: React.FC<{
  plan: 'free' | 'starter' | 'pro' | 'enterprise' | 'custom';
}> = ({ plan }) => {
  const planConfig = {
    free: { variant: 'neutral' as const, label: 'FREE' },
    starter: { variant: 'info' as const, label: 'STARTER' },
    pro: { variant: 'pro' as const, label: 'PRO' },
    enterprise: { variant: 'success' as const, label: 'ENTERPRISE' },
    custom: { variant: 'warning' as const, label: 'CUSTOM' },
  };

  const config = planConfig[plan];

  return <Badge label={config.label} variant={config.variant} bold />;
};

export default Badge;
