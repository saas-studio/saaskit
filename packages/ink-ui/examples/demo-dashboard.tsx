#!/usr/bin/env npx tsx

/**
 * Demo Dashboard - Showcases all ink-ui components
 *
 * Run with: npx tsx examples/demo-dashboard.tsx
 */

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import {
  // Theme
  colors,

  // Primitives
  Badge,
  PlanBadge,
  Spinner,
  ProgressBar,
  Sparkline,
  BarChart,
  Table,

  // Animations
  Typewriter,

  // Patterns
  ToastProvider,
  useToast,
  Modal,
  ConfirmModal,
  Wizard,
  StepGuide,
} from '../src/index.js';

// =============================================================================
// DEMO DATA
// =============================================================================

/** Plan type matching PlanBadge component */
type PlanType = 'free' | 'starter' | 'pro' | 'enterprise' | 'custom';

/** Customer record type */
interface Customer {
  id: string;
  name: string;
  email: string;
  plan: PlanType;
  status: 'active' | 'trial' | 'churned';
  mrr: number;
}

const customers: Customer[] = [
  { id: '1', name: 'Acme Corp', email: 'admin@acme.com', plan: 'enterprise', status: 'active', mrr: 2400 },
  { id: '2', name: 'TechStart Inc', email: 'hello@techstart.io', plan: 'pro', status: 'active', mrr: 99 },
  { id: '3', name: 'DataFlow LLC', email: 'ops@dataflow.dev', plan: 'pro', status: 'trial', mrr: 0 },
  { id: '4', name: 'CloudNine', email: 'support@cloudnine.co', plan: 'starter', status: 'churned', mrr: 0 },
  { id: '5', name: 'Quantum Labs', email: 'info@quantum.tech', plan: 'enterprise', status: 'active', mrr: 4800 },
];

const revenueData = [45, 52, 49, 58, 55, 62, 59, 68, 65, 72, 69, 75, 72, 78, 76, 82, 79, 85, 83, 88];
const usersData = [100, 120, 115, 140, 135, 150, 145, 160, 155, 170, 168, 175, 180, 190, 195];

// =============================================================================
// METRIC CARD
// =============================================================================

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  sparkData: number[];
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  sparkData,
  color,
}) => {
  const changeColor = change >= 0 ? colors.success[500] : colors.error[500];
  const changeIcon = change >= 0 ? '\u2191' : '\u2193';

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={color}
      width={22}
      paddingX={1}
      paddingY={0}
      marginRight={1}
    >
      <Text color={colors.neutral[600]} dimColor>{title}</Text>
      <Text bold color={colors.neutral[800]}>{value}</Text>
      <Box>
        <Sparkline data={sparkData} color={color} width={12} />
        <Text color={changeColor}>
          {' '}{changeIcon}{Math.abs(change)}%
        </Text>
      </Box>
    </Box>
  );
};

// =============================================================================
// DASHBOARD VIEW
// =============================================================================

const DashboardView: React.FC = () => {
  const [deployProgress, setDeployProgress] = useState(0);
  const toast = useToast();

  // Simulate deployment progress
  useEffect(() => {
    const timer = setInterval(() => {
      setDeployProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          toast.success('Deployment complete!');
          return 100;
        }
        return prev + Math.random() * 5;
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box marginBottom={1} justifyContent="space-between">
        <Text bold color={colors.neutral[800]}>
          Dashboard
        </Text>
        <Box>
          <Badge label="Live" variant="success" dot />
          <Text color={colors.neutral[500]}> {new Date().toLocaleTimeString()}</Text>
        </Box>
      </Box>

      {/* Metric Cards */}
      <Box marginBottom={1}>
        <MetricCard
          title="Revenue"
          value="$24.5K"
          change={12.5}
          sparkData={revenueData.slice(-10)}
          color={colors.success[500]}
        />
        <MetricCard
          title="Users"
          value="1,234"
          change={8.2}
          sparkData={usersData.slice(-10)}
          color={colors.primary[500]}
        />
        <MetricCard
          title="Conversion"
          value="3.2%"
          change={0.3}
          sparkData={[2.8, 2.9, 3.0, 2.9, 3.1, 3.0, 3.2, 3.1, 3.2, 3.2]}
          color={colors.secondary[500]}
        />
      </Box>

      {/* Deployment Progress */}
      <Box flexDirection="column" marginBottom={1}>
        <Box marginBottom={0}>
          <Spinner type="dots" color={colors.primary[500]} />
          <Text color={colors.neutral[600]}> Deploying to production...</Text>
        </Box>
        <ProgressBar
          value={deployProgress}
          width={40}
          variant={deployProgress >= 100 ? 'success' : 'default'}
          animated
        />
      </Box>

      {/* Customer Table */}
      <Box flexDirection="column" marginBottom={1}>
        <Text bold color={colors.neutral[700]} marginBottom={0}>
          Recent Customers
        </Text>
        <Table
          data={customers.slice(0, 4)}
          columns={[
            { key: 'name', header: 'Name', width: 15 },
            { key: 'email', header: 'Email', width: 22 },
            {
              key: 'plan',
              header: 'Plan',
              width: 10,
              render: (v) => <PlanBadge plan={v as PlanType} />,
            },
            {
              key: 'status',
              header: 'Status',
              width: 8,
              render: (v) => (
                <Badge
                  label={String(v)}
                  variant={v === 'active' ? 'success' : v === 'trial' ? 'warning' : 'error'}
                  dot
                />
              ),
            },
            {
              key: 'mrr',
              header: 'MRR',
              width: 8,
              align: 'right',
              render: (v) => (
                <Text color={Number(v) > 0 ? colors.success[500] : colors.neutral[500]}>
                  ${Number(v).toLocaleString()}
                </Text>
              ),
            },
          ]}
          selectable
          striped
        />
      </Box>

      {/* Bar Chart */}
      <Box flexDirection="column">
        <Text bold color={colors.neutral[700]} marginBottom={0}>
          Weekly Revenue
        </Text>
        <BarChart
          data={[45, 62, 58, 72, 68, 85, 78]}
          height={4}
          barWidth={4}
          color={colors.primary[500]}
          labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
        />
      </Box>
    </Box>
  );
};

// =============================================================================
// WIZARD VIEW
// =============================================================================

const WizardView: React.FC = () => {
  const toast = useToast();

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome',
      content: (
        <Box flexDirection="column">
          <Typewriter
            text="Welcome to SaaSKit! Let's get you set up."
            speed={30}
          />
          <Box marginTop={1}>
            <Text color={colors.neutral[600]}>
              This wizard will guide you through the initial configuration.
            </Text>
          </Box>
        </Box>
      ),
    },
    {
      id: 'account',
      title: 'Account Setup',
      content: (
        <Box flexDirection="column">
          <Text color={colors.neutral[600]}>Configure your account details:</Text>
          <Box marginTop={1}>
            <StepGuide
              steps={[
                { title: 'Enter organization name', status: 'complete' },
                { title: 'Set admin email', status: 'current' },
                { title: 'Choose password', status: 'pending' },
              ]}
            />
          </Box>
        </Box>
      ),
    },
    {
      id: 'billing',
      title: 'Billing',
      optional: true,
      content: (
        <Box flexDirection="column">
          <Text color={colors.neutral[600]}>Choose your plan:</Text>
          <Box marginTop={1} flexDirection="column">
            <Box marginBottom={0}>
              <Text color={colors.neutral[500]}>[1] </Text>
              <PlanBadge plan="starter" />
              <Text color={colors.neutral[600]}> - Free forever</Text>
            </Box>
            <Box marginBottom={0}>
              <Text color={colors.primary[500]}>[2] </Text>
              <PlanBadge plan="pro" />
              <Text color={colors.neutral[600]}> - $29/month</Text>
            </Box>
            <Box>
              <Text color={colors.neutral[500]}>[3] </Text>
              <PlanBadge plan="enterprise" />
              <Text color={colors.neutral[600]}> - Custom pricing</Text>
            </Box>
          </Box>
        </Box>
      ),
    },
    {
      id: 'complete',
      title: 'Complete',
      content: (
        <Box flexDirection="column">
          <Text color={colors.success[500]} bold>
            All done! Your account is ready.
          </Text>
          <Box marginTop={1}>
            <ProgressBar value={100} variant="success" width={30} />
          </Box>
        </Box>
      ),
    },
  ];

  return (
    <Box padding={1}>
      <Wizard
        steps={steps}
        onComplete={() => toast.success('Setup complete!')}
        onCancel={() => toast.info('Setup cancelled')}
        progressStyle="dots"
        width={55}
      />
    </Box>
  );
};

// =============================================================================
// MAIN APP
// =============================================================================

type View = 'dashboard' | 'wizard' | 'components';

const App: React.FC = () => {
  const { exit } = useApp();
  const [view, setView] = useState<View>('dashboard');
  const [showModal, setShowModal] = useState(false);

  useInput((input, key) => {
    if (input === 'q') {
      exit();
    } else if (input === '1') {
      setView('dashboard');
    } else if (input === '2') {
      setView('wizard');
    } else if (input === 'm') {
      setShowModal(true);
    }
  });

  return (
    <ToastProvider>
      <Box flexDirection="column">
        {/* Navigation */}
        <Box
          paddingX={1}
          borderStyle="single"
          borderBottom
          borderTop={false}
          borderLeft={false}
          borderRight={false}
          borderColor={colors.neutral[300]}
        >
          <Text color={view === 'dashboard' ? colors.primary[500] : colors.neutral[600]}>
            [1] Dashboard
          </Text>
          <Text> | </Text>
          <Text color={view === 'wizard' ? colors.primary[500] : colors.neutral[600]}>
            [2] Wizard
          </Text>
          <Text> | </Text>
          <Text color={colors.neutral[600]}>
            [m] Modal
          </Text>
          <Text> | </Text>
          <Text color={colors.neutral[500]}>
            [q] Quit
          </Text>
        </Box>

        {/* Content */}
        {view === 'dashboard' && <DashboardView />}
        {view === 'wizard' && <WizardView />}

        {/* Modal */}
        <ConfirmModal
          visible={showModal}
          title="Confirm Action"
          message="Are you sure you want to proceed with this action?"
          onConfirm={() => setShowModal(false)}
          onCancel={() => setShowModal(false)}
        />
      </Box>
    </ToastProvider>
  );
};

// =============================================================================
// RENDER
// =============================================================================

render(<App />);
