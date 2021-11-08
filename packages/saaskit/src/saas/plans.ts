
export type Plans = 'Plans' | PlansObject
export type PlansObject = {
    type: 'Plans'
    [key: string]: 'Plans' | Plan
}

export type Plan = 'Plan' | PlanObject
export type PlanObject = {
    type: 'Plan'
    price: number | Price
    description?: string
}

export type Price = 'Price' | PriceObject
export type PriceObject = {
    type: 'Price'
    price?: number
    monthlyPrice?: number
    annualPrice?: number
    monthlyPricePerUser?: number
    annualPricePerUser?: number
    pricePerUnit?: number
    currency?: string
}

export function buildGrowScale ({type = 'Plans', build = 0, grow = 20, scale = 100}) { return { type, build, grow, scale } }
export function buildLaunchGrow ({type = 'Plans', build = 0, launch = 20, grow = 100}) { return { type, build, launch, grow } }
export function buildLaunchScale ({type = 'Plans', build = 0, launch = 20, scale = 100}) { return { type, build, launch, scale } }

export function withEnterprise(plans: PlansObject) { return { ...plans, enterprise: { description: `Let's Talk` } }}

// export function
