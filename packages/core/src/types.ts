/**
 * @saaskit/core - SaaS Metric Types
 *
 * Core type definitions for SaaS metrics following schema.org.ai conventions.
 *
 * Metrics:
 * - MRR (Monthly Recurring Revenue)
 * - Churn (Customer/Revenue Churn)
 * - NRR (Net Revenue Retention)
 * - CAC (Customer Acquisition Cost)
 * - LTV (Lifetime Value)
 */

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
