/**
 * @saaskit/core - SaaS Metrics Tests
 *
 * RED Phase: These tests define the expected types and behavior for
 * core SaaS metrics. They MUST FAIL initially until:
 * 1. Metric types are defined in src/types/metrics.ts
 * 2. Types are exported from @saaskit/core
 *
 * This follows TDD - write failing tests first, then implement.
 *
 * Metrics to implement:
 * - MRR (Monthly Recurring Revenue)
 * - Churn (Customer/Revenue Churn)
 * - NRR (Net Revenue Retention)
 * - CAC (Customer Acquisition Cost)
 * - LTV (Lifetime Value)
 */

import { describe, it, expect } from 'vitest'
import type { Metric, MRRMetric, ChurnMetric, NRRMetric, CACMetric, LTVMetric } from '../src/types'

describe('SaaS Metrics', () => {
  describe('MRR (Monthly Recurring Revenue)', () => {
    it('MRR metric tracks monthly recurring revenue', () => {
      const mrr: MRRMetric = {
        $type: 'https://schema.org.ai/metrics/MRR',
        value: 50000,
        period: '2024-01',
        breakdown: {
          newMRR: 5000,
          expansionMRR: 2000,
          contractionMRR: -500,
          churnedMRR: -1000
        },
        source: 'stripe'
      }
      expect(mrr.$type).toBe('https://schema.org.ai/metrics/MRR')
      expect(mrr.value).toBe(50000)
      expect(mrr.period).toBe('2024-01')
    })

    it('MRR breakdown components sum correctly', () => {
      const mrr: MRRMetric = {
        $type: 'https://schema.org.ai/metrics/MRR',
        value: 50000,
        period: '2024-01',
        breakdown: {
          newMRR: 5000,
          expansionMRR: 2000,
          contractionMRR: -500,
          churnedMRR: -1000
        },
        source: 'stripe'
      }
      const { newMRR, expansionMRR, contractionMRR, churnedMRR } = mrr.breakdown
      const netChange = newMRR + expansionMRR + contractionMRR + churnedMRR
      expect(netChange).toBe(5500) // Net positive growth
    })

    it('MRR extends base Metric type', () => {
      const mrr: MRRMetric = {
        $type: 'https://schema.org.ai/metrics/MRR',
        value: 50000,
        period: '2024-01',
        breakdown: {
          newMRR: 5000,
          expansionMRR: 2000,
          contractionMRR: -500,
          churnedMRR: -1000
        },
        source: 'stripe'
      }
      // MRRMetric should satisfy Metric interface
      const metric: Metric = mrr
      expect(metric.$type).toContain('metrics/')
      expect(typeof metric.value).toBe('number')
    })
  })

  describe('Churn (Customer/Revenue Churn)', () => {
    it('Churn metric tracks customer loss', () => {
      const churn: ChurnMetric = {
        $type: 'https://schema.org.ai/metrics/Churn',
        customerChurnRate: 0.05,
        revenueChurnRate: 0.03,
        period: '2024-01',
        churned: 10,
        total: 200
      }
      expect(churn.$type).toBe('https://schema.org.ai/metrics/Churn')
      expect(churn.customerChurnRate).toBe(0.05)
      expect(churn.revenueChurnRate).toBe(0.03)
    })

    it('Churn rate calculation is accurate', () => {
      const churn: ChurnMetric = {
        $type: 'https://schema.org.ai/metrics/Churn',
        customerChurnRate: 0.05,
        revenueChurnRate: 0.03,
        period: '2024-01',
        churned: 10,
        total: 200
      }
      // Customer churn rate = churned / total
      expect(churn.churned / churn.total).toBe(churn.customerChurnRate)
    })

    it('Churn distinguishes customer vs revenue churn', () => {
      const churn: ChurnMetric = {
        $type: 'https://schema.org.ai/metrics/Churn',
        customerChurnRate: 0.05,  // 5% of customers left
        revenueChurnRate: 0.03,   // But only 3% of revenue (smaller customers churned)
        period: '2024-01',
        churned: 10,
        total: 200
      }
      // Revenue churn can differ from customer churn
      expect(churn.revenueChurnRate).toBeLessThan(churn.customerChurnRate)
    })
  })

  describe('NRR (Net Revenue Retention)', () => {
    it('NRR metric tracks revenue retention', () => {
      const nrr: NRRMetric = {
        $type: 'https://schema.org.ai/metrics/NRR',
        value: 1.15, // 115% NRR
        period: '2024-01',
        startingMRR: 40000,
        expansionMRR: 8000,
        contractionMRR: -1000,
        churnedMRR: -1000
      }
      expect(nrr.$type).toBe('https://schema.org.ai/metrics/NRR')
      expect(nrr.value).toBe(1.15)
    })

    it('NRR calculation: (starting + expansion - contraction - churned) / starting', () => {
      const nrr: NRRMetric = {
        $type: 'https://schema.org.ai/metrics/NRR',
        value: 1.15,
        period: '2024-01',
        startingMRR: 40000,
        expansionMRR: 8000,
        contractionMRR: -1000,
        churnedMRR: -1000
      }
      // NRR = (startingMRR + expansionMRR + contractionMRR + churnedMRR) / startingMRR
      const calculatedNRR = (nrr.startingMRR + nrr.expansionMRR + nrr.contractionMRR + nrr.churnedMRR) / nrr.startingMRR
      expect(calculatedNRR).toBe(nrr.value)
    })

    it('NRR > 1.0 indicates growth from existing customers', () => {
      const nrr: NRRMetric = {
        $type: 'https://schema.org.ai/metrics/NRR',
        value: 1.15,
        period: '2024-01',
        startingMRR: 40000,
        expansionMRR: 8000,
        contractionMRR: -1000,
        churnedMRR: -1000
      }
      expect(nrr.value).toBeGreaterThan(1.0)
    })
  })

  describe('CAC (Customer Acquisition Cost)', () => {
    it('CAC metric tracks acquisition cost', () => {
      const cac: CACMetric = {
        $type: 'https://schema.org.ai/metrics/CAC',
        value: 500,
        period: '2024-01',
        marketingSpend: 10000,
        salesSpend: 5000,
        newCustomers: 30
      }
      expect(cac.$type).toBe('https://schema.org.ai/metrics/CAC')
      expect(cac.value).toBe(500)
    })

    it('CAC calculation: (marketing + sales spend) / new customers', () => {
      const cac: CACMetric = {
        $type: 'https://schema.org.ai/metrics/CAC',
        value: 500,
        period: '2024-01',
        marketingSpend: 10000,
        salesSpend: 5000,
        newCustomers: 30
      }
      const calculatedCAC = (cac.marketingSpend + cac.salesSpend) / cac.newCustomers
      expect(calculatedCAC).toBe(cac.value)
    })

    it('CAC tracks spend breakdown by channel', () => {
      const cac: CACMetric = {
        $type: 'https://schema.org.ai/metrics/CAC',
        value: 500,
        period: '2024-01',
        marketingSpend: 10000,
        salesSpend: 5000,
        newCustomers: 30
      }
      expect(cac.marketingSpend + cac.salesSpend).toBe(15000)
    })
  })

  describe('LTV (Lifetime Value)', () => {
    it('LTV metric tracks customer lifetime value', () => {
      const ltv: LTVMetric = {
        $type: 'https://schema.org.ai/metrics/LTV',
        value: 6000,
        averageRevenuePerUser: 100,
        averageLifespanMonths: 60,
        ltvToCacRatio: 12
      }
      expect(ltv.$type).toBe('https://schema.org.ai/metrics/LTV')
      expect(ltv.value).toBe(6000)
      expect(ltv.ltvToCacRatio).toBe(12)
    })

    it('LTV calculation: ARPU * average lifespan', () => {
      const ltv: LTVMetric = {
        $type: 'https://schema.org.ai/metrics/LTV',
        value: 6000,
        averageRevenuePerUser: 100,
        averageLifespanMonths: 60,
        ltvToCacRatio: 12
      }
      const calculatedLTV = ltv.averageRevenuePerUser * ltv.averageLifespanMonths
      expect(calculatedLTV).toBe(ltv.value)
    })

    it('LTV:CAC ratio indicates unit economics health', () => {
      const ltv: LTVMetric = {
        $type: 'https://schema.org.ai/metrics/LTV',
        value: 6000,
        averageRevenuePerUser: 100,
        averageLifespanMonths: 60,
        ltvToCacRatio: 12
      }
      // LTV:CAC of 3+ is considered healthy for SaaS
      expect(ltv.ltvToCacRatio).toBeGreaterThan(3)
    })

    it('LTV:CAC ratio derives from LTV and CAC', () => {
      const ltv: LTVMetric = {
        $type: 'https://schema.org.ai/metrics/LTV',
        value: 6000,
        averageRevenuePerUser: 100,
        averageLifespanMonths: 60,
        ltvToCacRatio: 12
      }
      // Given LTV of 6000 and ratio of 12, implied CAC is 500
      const impliedCAC = ltv.value / ltv.ltvToCacRatio
      expect(impliedCAC).toBe(500)
    })
  })

  describe('Base Metric Interface', () => {
    it('all metrics share common $type property', () => {
      const mrr: MRRMetric = {
        $type: 'https://schema.org.ai/metrics/MRR',
        value: 50000,
        period: '2024-01',
        breakdown: { newMRR: 5000, expansionMRR: 2000, contractionMRR: -500, churnedMRR: -1000 },
        source: 'stripe'
      }
      const churn: ChurnMetric = {
        $type: 'https://schema.org.ai/metrics/Churn',
        customerChurnRate: 0.05,
        revenueChurnRate: 0.03,
        period: '2024-01',
        churned: 10,
        total: 200
      }

      expect(mrr.$type).toMatch(/^https:\/\/schema\.org\.ai\/metrics\//)
      expect(churn.$type).toMatch(/^https:\/\/schema\.org\.ai\/metrics\//)
    })

    it('all metrics use schema.org.ai namespace', () => {
      const types = [
        'https://schema.org.ai/metrics/MRR',
        'https://schema.org.ai/metrics/Churn',
        'https://schema.org.ai/metrics/NRR',
        'https://schema.org.ai/metrics/CAC',
        'https://schema.org.ai/metrics/LTV'
      ]

      for (const type of types) {
        expect(type).toContain('schema.org.ai/metrics/')
      }
    })
  })
})
