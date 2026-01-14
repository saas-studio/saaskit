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
 * Represents a pricing plan/tier for a SaaS product.
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
 * Represents a customer's subscription to a plan.
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
 * Represents a SaaS business/product.
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

// Base Metric
export interface Metric {
  $type: string
  value: number
  period?: string
  source?: string
}

// MRR - Monthly Recurring Revenue
export interface MRRMetric extends Metric {
  $type: 'https://schema.org.ai/metrics/MRR'
  breakdown: {
    newMRR: number
    expansionMRR: number
    contractionMRR: number
    churnedMRR: number
  }
}

// Churn - Customer/Revenue Churn
export interface ChurnMetric extends Omit<Metric, 'value'> {
  $type: 'https://schema.org.ai/metrics/Churn'
  customerChurnRate: number
  revenueChurnRate: number
  churned: number
  total: number
}

// NRR - Net Revenue Retention
export interface NRRMetric extends Metric {
  $type: 'https://schema.org.ai/metrics/NRR'
  startingMRR: number
  expansionMRR: number
  contractionMRR: number
  churnedMRR: number
}

// CAC - Customer Acquisition Cost
export interface CACMetric extends Metric {
  $type: 'https://schema.org.ai/metrics/CAC'
  marketingSpend: number
  salesSpend: number
  newCustomers: number
}

// LTV - Lifetime Value
export interface LTVMetric extends Metric {
  $type: 'https://schema.org.ai/metrics/LTV'
  averageRevenuePerUser: number
  averageLifespanMonths: number
  ltvToCacRatio: number
}
