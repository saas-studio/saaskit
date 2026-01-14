/**
 * @saaskit/core - SaaS Types
 *
 * Core type definitions for SaaS business models following schema.org.ai conventions.
 *
 * Business Types:
 * - SaaS (Business model with plans, subscriptions, revenue metrics)
 * - Plan (Pricing tier with features and limits)
 * - Subscription (Customer subscription lifecycle)
 *
 * Metrics:
 * - MRR (Monthly Recurring Revenue)
 * - Churn (Customer/Revenue Churn)
 * - NRR (Net Revenue Retention)
 * - CAC (Customer Acquisition Cost)
 * - LTV (Lifetime Value)
 */

// =============================================================================
// Plan - Pricing Tier
// =============================================================================

/**
 * Plan - Pricing tier/plan for SaaS
 *
 * Plans define the price, billing interval, included features, and usage limits
 * for a subscription tier.
 *
 * @example
 * ```typescript
 * const proPlan: Plan = {
 *   $id: 'https://schema.org.ai/plans/pro',
 *   $type: 'https://schema.org.ai/Plan',
 *   name: 'Pro',
 *   price: 49,
 *   interval: 'month',
 *   features: ['Unlimited projects', 'Priority support'],
 *   limits: { seats: 10, storage: '100GB' },
 *   trialDays: 14
 * }
 * ```
 *
 * @see https://schema.org.ai/Plan
 */
export interface Plan {
  /** Unique identifier for this plan */
  $id: string
  /** JSON-LD type identifier */
  $type: 'https://schema.org.ai/Plan'
  /** Display name for the plan */
  name: string
  /** Optional description of the plan */
  description?: string
  /** Price in the smallest currency unit (e.g., cents for USD) */
  price: number
  /** Billing interval */
  interval: 'month' | 'year'
  /** List of features included in this plan */
  features: string[]
  /** Usage limits for this plan (e.g., { seats: 10, storage: '100GB' }) */
  limits: Record<string, string | number>
  /** Number of trial days offered with this plan */
  trialDays?: number
}

// =============================================================================
// Subscription - Customer Subscription
// =============================================================================

/**
 * Subscription - Customer subscription to a Plan
 *
 * Tracks the subscription lifecycle including status, billing periods,
 * and cancellation state.
 *
 * @example
 * ```typescript
 * const subscription: Subscription = {
 *   $id: 'https://schema.org.ai/subscriptions/sub1',
 *   $type: 'https://schema.org.ai/Subscription',
 *   customerId: 'cust_123',
 *   planId: 'plan_pro',
 *   status: 'active',
 *   currentPeriodStart: new Date('2024-01-01'),
 *   currentPeriodEnd: new Date('2024-02-01'),
 *   cancelAtPeriodEnd: false
 * }
 * ```
 *
 * @see https://schema.org.ai/Subscription
 */
export interface Subscription {
  /** Unique identifier for this subscription */
  $id: string
  /** JSON-LD type identifier */
  $type: 'https://schema.org.ai/Subscription'
  /** Reference to the customer who owns this subscription */
  customerId: string
  /** Reference to the plan this subscription is for */
  planId: string
  /** Current status of the subscription */
  status: 'active' | 'trialing' | 'canceled' | 'past_due'
  /** Start of the current billing period */
  currentPeriodStart: Date
  /** End of the current billing period */
  currentPeriodEnd: Date
  /** Whether the subscription will be canceled at the end of the current period */
  cancelAtPeriodEnd: boolean
  /** Number of units subscribed (for per-seat pricing) */
  quantity?: number
  /** When the trial period ends (if applicable) */
  trialEnd?: Date
  /** When the subscription was canceled (if applicable) */
  canceledAt?: Date
}

// =============================================================================
// SaaS - Business Model
// =============================================================================

/**
 * SaaS - Software-as-a-Service business model
 *
 * Contains the business configuration including available plans,
 * active subscriptions, and revenue metrics.
 *
 * @example
 * ```typescript
 * const mySaaS: SaaS = {
 *   $id: 'https://schema.org.ai/saas/myapp',
 *   $type: 'https://schema.org.ai/SaaS',
 *   name: 'My App',
 *   description: 'A powerful analytics platform',
 *   url: 'https://myapp.com',
 *   plans: [starterPlan, proPlan, enterprisePlan],
 *   subscriptions: [sub1, sub2, sub3],
 *   mrr: 50000,
 *   arr: 600000
 * }
 * ```
 *
 * @see https://schema.org.ai/SaaS
 */
export interface SaaS {
  /** Unique identifier for this SaaS product */
  $id: string
  /** JSON-LD type identifier */
  $type: 'https://schema.org.ai/SaaS'
  /** Name of the SaaS product */
  name: string
  /** Optional description of the SaaS product */
  description?: string
  /** Optional URL for the SaaS product */
  url?: string
  /** Available pricing plans */
  plans: Plan[]
  /** Active and historical subscriptions */
  subscriptions: Subscription[]
  /** Monthly Recurring Revenue in smallest currency unit */
  mrr: number
  /** Annual Recurring Revenue in smallest currency unit */
  arr: number
}

// =============================================================================
// Metrics
// =============================================================================

/**
 * Metric - Base interface for SaaS metrics
 *
 * All SaaS metrics extend this base interface which provides common fields
 * for type identification, value, time period, and data source.
 *
 * @see https://schema.org.ai/metrics/Metric
 */
export interface Metric {
  /** JSON-LD type identifier for the metric */
  $type: string
  /** The computed metric value */
  value: number
  /** Time period for the metric (e.g., '2024-01', 'Q1-2024') */
  period?: string
  /** Data source or system that generated this metric */
  source?: string
}

/**
 * MRRMetric - Monthly Recurring Revenue with breakdown
 *
 * Tracks total MRR along with components: new, expansion, contraction, and churned.
 * Essential for understanding revenue growth drivers.
 *
 * @example
 * ```typescript
 * const mrr: MRRMetric = {
 *   $type: 'https://schema.org.ai/metrics/MRR',
 *   value: 50000, // Total MRR in cents
 *   period: '2024-01',
 *   breakdown: {
 *     newMRR: 5000,
 *     expansionMRR: 2000,
 *     contractionMRR: 500,
 *     churnedMRR: 1500
 *   }
 * }
 * ```
 *
 * @see https://schema.org.ai/metrics/MRR
 */
export interface MRRMetric extends Metric {
  $type: 'https://schema.org.ai/metrics/MRR'
  /** Breakdown of MRR components */
  breakdown: {
    /** Revenue from new customers this period */
    newMRR: number
    /** Revenue increase from existing customers (upgrades, add-ons) */
    expansionMRR: number
    /** Revenue decrease from existing customers (downgrades) */
    contractionMRR: number
    /** Revenue lost from canceled customers */
    churnedMRR: number
  }
}

/**
 * ChurnMetric - Customer and revenue churn tracking
 *
 * Tracks both customer churn (logo churn) and revenue churn rates.
 * Revenue churn can differ from customer churn due to varying customer values.
 *
 * @example
 * ```typescript
 * const churn: ChurnMetric = {
 *   $type: 'https://schema.org.ai/metrics/Churn',
 *   period: '2024-01',
 *   customerChurnRate: 0.05, // 5%
 *   revenueChurnRate: 0.03, // 3%
 *   churned: 10,
 *   total: 200
 * }
 * ```
 *
 * @see https://schema.org.ai/metrics/Churn
 */
export interface ChurnMetric extends Omit<Metric, 'value'> {
  $type: 'https://schema.org.ai/metrics/Churn'
  /** Percentage of customers lost (0-1 scale) */
  customerChurnRate: number
  /** Percentage of revenue lost (0-1 scale) */
  revenueChurnRate: number
  /** Number of customers/subscriptions churned */
  churned: number
  /** Total customers/subscriptions at start of period */
  total: number
}

/**
 * NRRMetric - Net Revenue Retention (expansion vs churn)
 *
 * Measures revenue retained from existing customers including expansion.
 * NRR > 100% means expansion exceeds churn (negative net churn).
 *
 * @example
 * ```typescript
 * const nrr: NRRMetric = {
 *   $type: 'https://schema.org.ai/metrics/NRR',
 *   value: 115, // 115% NRR
 *   period: '2024-Q1',
 *   startingMRR: 100000,
 *   expansionMRR: 20000,
 *   contractionMRR: 2000,
 *   churnedMRR: 3000
 * }
 * ```
 *
 * @see https://schema.org.ai/metrics/NRR
 */
export interface NRRMetric extends Metric {
  $type: 'https://schema.org.ai/metrics/NRR'
  /** MRR at the start of the measurement period */
  startingMRR: number
  /** Revenue gained from upsells/cross-sells */
  expansionMRR: number
  /** Revenue lost from downgrades */
  contractionMRR: number
  /** Revenue lost from cancellations */
  churnedMRR: number
}

/**
 * CACMetric - Customer Acquisition Cost
 *
 * Total cost to acquire a new customer, including marketing and sales expenses.
 * Used with LTV to determine customer profitability.
 *
 * @example
 * ```typescript
 * const cac: CACMetric = {
 *   $type: 'https://schema.org.ai/metrics/CAC',
 *   value: 500, // $500 CAC
 *   period: '2024-Q1',
 *   marketingSpend: 30000,
 *   salesSpend: 20000,
 *   newCustomers: 100
 * }
 * ```
 *
 * @see https://schema.org.ai/metrics/CAC
 */
export interface CACMetric extends Metric {
  $type: 'https://schema.org.ai/metrics/CAC'
  /** Total marketing spend for the period */
  marketingSpend: number
  /** Total sales spend for the period */
  salesSpend: number
  /** Number of new customers acquired */
  newCustomers: number
}

/**
 * LTVMetric - Customer Lifetime Value
 *
 * Predicted total revenue from a customer over their entire relationship.
 * LTV:CAC ratio indicates customer profitability (3:1+ is healthy).
 *
 * @example
 * ```typescript
 * const ltv: LTVMetric = {
 *   $type: 'https://schema.org.ai/metrics/LTV',
 *   value: 2400, // $2,400 LTV
 *   averageRevenuePerUser: 100, // $100/month ARPU
 *   averageLifespanMonths: 24,
 *   ltvToCacRatio: 4.8
 * }
 * ```
 *
 * @see https://schema.org.ai/metrics/LTV
 */
export interface LTVMetric extends Metric {
  $type: 'https://schema.org.ai/metrics/LTV'
  /** Average monthly revenue per customer */
  averageRevenuePerUser: number
  /** Average customer lifespan in months */
  averageLifespanMonths: number
  /** Ratio of LTV to CAC (target: 3+) */
  ltvToCacRatio: number
}
