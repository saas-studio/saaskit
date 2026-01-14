/**
 * CRM Seed Data Generator
 *
 * Generates realistic sample data for the CRM example application.
 * Run with: npx tsx examples/crm/seed.ts
 */

import { randomUUID } from 'crypto'

// =============================================================================
// Types
// =============================================================================

interface Company {
  id: string
  name: string
  website: string | null
  industry: string | null
  size: 'small' | 'medium' | 'enterprise' | null
  address: string | null
  phone: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

interface Contact {
  id: string
  name: string
  email: string
  phone: string | null
  title: string | null
  status: 'lead' | 'prospect' | 'customer' | 'churned'
  companyId: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

interface Deal {
  id: string
  title: string
  value: number | null
  currency: string
  stage: 'discovery' | 'proposal' | 'negotiation' | 'won' | 'lost'
  probability: number | null
  expectedClose: Date | null
  closedAt: Date | null
  lostReason: string | null
  contactId: string
  companyId: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

interface Activity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'note'
  subject: string | null
  notes: string | null
  date: Date
  duration: number | null
  outcome: string | null
  contactId: string
  dealId: string | null
  createdAt: Date
  updatedAt: Date
}

interface SeedData {
  companies: Company[]
  contacts: Contact[]
  deals: Deal[]
  activities: Activity[]
}

// =============================================================================
// Sample Data
// =============================================================================

const COMPANY_NAMES = [
  { name: 'Acme Corporation', industry: 'Manufacturing', size: 'enterprise' as const },
  { name: 'TechVentures Inc', industry: 'Technology', size: 'medium' as const },
  { name: 'Global Finance Partners', industry: 'Finance', size: 'enterprise' as const },
  { name: 'HealthFirst Medical', industry: 'Healthcare', size: 'medium' as const },
  { name: 'EcoSolutions Ltd', industry: 'Environmental', size: 'small' as const },
  { name: 'Retail Dynamics', industry: 'Retail', size: 'medium' as const },
  { name: 'CloudScale Systems', industry: 'Technology', size: 'small' as const },
  { name: 'Premier Consulting Group', industry: 'Consulting', size: 'medium' as const },
  { name: 'Apex Manufacturing', industry: 'Manufacturing', size: 'enterprise' as const },
  { name: 'DataDriven Analytics', industry: 'Technology', size: 'small' as const },
  { name: 'Metropolitan Bank', industry: 'Finance', size: 'enterprise' as const },
  { name: 'Innovate Labs', industry: 'Technology', size: 'small' as const },
]

const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Steven', 'Ashley',
]

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
]

const JOB_TITLES = [
  'CEO', 'CTO', 'CFO', 'VP of Engineering', 'VP of Sales', 'VP of Marketing',
  'Director of Operations', 'Director of IT', 'Senior Manager', 'Product Manager',
  'Engineering Manager', 'Sales Manager', 'Marketing Manager', 'Account Executive',
  'Business Development Manager', 'Technical Lead', 'Solutions Architect',
  'Head of Procurement', 'Chief Information Officer', 'Operations Manager',
]

const DEAL_TITLES = [
  'Enterprise License Agreement',
  'Annual Subscription Renewal',
  'Platform Migration Project',
  'Consulting Engagement',
  'Training and Onboarding',
  'Custom Integration',
  'Data Analytics Package',
  'Security Audit Services',
  'Cloud Infrastructure Setup',
  'Support and Maintenance Contract',
  'Digital Transformation Initiative',
  'Process Automation Suite',
]

const ACTIVITY_SUBJECTS = {
  call: [
    'Discovery Call', 'Follow-up Call', 'Product Demo', 'Pricing Discussion',
    'Technical Review', 'Quarterly Check-in', 'Contract Negotiation', 'Support Call',
  ],
  email: [
    'Introduction Email', 'Proposal Follow-up', 'Meeting Recap', 'Contract Sent',
    'Thank You Note', 'Product Update', 'Pricing Information', 'Next Steps',
  ],
  meeting: [
    'Initial Meeting', 'Requirements Gathering', 'Executive Presentation',
    'Contract Review', 'Kickoff Meeting', 'Progress Review', 'Strategy Session',
  ],
  note: [
    'Internal Note', 'Competitive Intelligence', 'Budget Update', 'Timeline Change',
    'Stakeholder Feedback', 'Risk Assessment', 'Opportunity Analysis',
  ],
}

const LOST_REASONS = [
  'Lost to competitor',
  'Budget constraints',
  'Project cancelled',
  'Timing not right',
  'No decision made',
  'Requirements changed',
  'Internal solution chosen',
]

const CITIES = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
  'San Francisco, CA', 'Seattle, WA', 'Denver, CO', 'Boston, MA', 'Austin, TX',
  'Atlanta, GA', 'Miami, FL', 'Dallas, TX', 'San Diego, CA', 'Portland, OR',
]

// =============================================================================
// Utility Functions
// =============================================================================

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDate(daysAgo: number, daysAhead: number = 0): Date {
  const now = new Date()
  const range = daysAgo + daysAhead
  const offset = randomInt(-daysAgo, daysAhead)
  return new Date(now.getTime() + offset * 24 * 60 * 60 * 1000)
}

function generateEmail(firstName: string, lastName: string, company: string): string {
  const domain = company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com'
  const formats = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()[0]}${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}@${domain}`,
  ]
  return randomElement(formats)
}

function generatePhone(): string {
  const area = randomInt(200, 999)
  const prefix = randomInt(200, 999)
  const line = randomInt(1000, 9999)
  return `(${area}) ${prefix}-${line}`
}

function generateWebsite(name: string): string {
  const domain = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  return `https://www.${domain}.com`
}

// =============================================================================
// Data Generation
// =============================================================================

function generateCompanies(): Company[] {
  const now = new Date()
  return COMPANY_NAMES.map((c, index) => ({
    id: randomUUID(),
    name: c.name,
    website: generateWebsite(c.name),
    industry: c.industry,
    size: c.size,
    address: `${randomInt(100, 9999)} ${randomElement(['Main St', 'Oak Ave', 'Park Blvd', 'Tech Drive', 'Innovation Way'])}, ${randomElement(CITIES)}`,
    phone: generatePhone(),
    notes: index % 3 === 0 ? 'Key account - strategic partnership potential' : null,
    createdAt: randomDate(365, 0),
    updatedAt: now,
  }))
}

function generateContacts(companies: Company[]): Contact[] {
  const contacts: Contact[] = []
  const now = new Date()

  // Generate 2-5 contacts per company
  for (const company of companies) {
    const contactCount = randomInt(2, 5)
    for (let i = 0; i < contactCount; i++) {
      const firstName = randomElement(FIRST_NAMES)
      const lastName = randomElement(LAST_NAMES)
      const status = randomElement(['lead', 'prospect', 'customer', 'customer', 'prospect'] as const) // More customers and prospects

      contacts.push({
        id: randomUUID(),
        name: `${firstName} ${lastName}`,
        email: generateEmail(firstName, lastName, company.name),
        phone: generatePhone(),
        title: randomElement(JOB_TITLES),
        status,
        companyId: company.id,
        notes: null,
        createdAt: randomDate(180, 0),
        updatedAt: now,
      })
    }
  }

  // Add some contacts without companies (independent leads)
  for (let i = 0; i < 8; i++) {
    const firstName = randomElement(FIRST_NAMES)
    const lastName = randomElement(LAST_NAMES)

    contacts.push({
      id: randomUUID(),
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomElement(['gmail.com', 'outlook.com', 'yahoo.com'])}`,
      phone: generatePhone(),
      title: randomElement(JOB_TITLES),
      status: 'lead',
      companyId: null,
      notes: 'Inbound lead - no company associated yet',
      createdAt: randomDate(30, 0),
      updatedAt: now,
    })
  }

  return contacts
}

function generateDeals(contacts: Contact[], companies: Company[]): Deal[] {
  const deals: Deal[] = []
  const now = new Date()

  // Filter contacts that should have deals (prospects and customers mostly)
  const eligibleContacts = contacts.filter(c => c.status !== 'churned')

  // Generate deals for about 60% of eligible contacts
  for (const contact of eligibleContacts) {
    if (Math.random() < 0.6) {
      const stage = randomElement(['discovery', 'proposal', 'negotiation', 'won', 'lost'] as const)
      const isWon = stage === 'won'
      const isLost = stage === 'lost'
      const isClosed = isWon || isLost

      const value = randomElement([5000, 10000, 25000, 50000, 75000, 100000, 150000, 250000, 500000])
      const probability = stage === 'discovery' ? 20 :
                          stage === 'proposal' ? 50 :
                          stage === 'negotiation' ? 75 :
                          stage === 'won' ? 100 : 0

      deals.push({
        id: randomUUID(),
        title: `${contact.name.split(' ')[1]} - ${randomElement(DEAL_TITLES)}`,
        value,
        currency: 'USD',
        stage,
        probability,
        expectedClose: isClosed ? null : randomDate(0, 90),
        closedAt: isClosed ? randomDate(60, 0) : null,
        lostReason: isLost ? randomElement(LOST_REASONS) : null,
        contactId: contact.id,
        companyId: contact.companyId,
        notes: null,
        createdAt: randomDate(120, 0),
        updatedAt: now,
      })
    }
  }

  return deals
}

function generateActivities(contacts: Contact[], deals: Deal[]): Activity[] {
  const activities: Activity[] = []
  const now = new Date()

  // Generate activities for each contact
  for (const contact of contacts) {
    const activityCount = randomInt(2, 8)
    const contactDeals = deals.filter(d => d.contactId === contact.id)

    for (let i = 0; i < activityCount; i++) {
      const type = randomElement(['call', 'email', 'meeting', 'note'] as const)
      const subjects = ACTIVITY_SUBJECTS[type]
      const relatedDeal = contactDeals.length > 0 && Math.random() < 0.7
        ? randomElement(contactDeals)
        : null

      activities.push({
        id: randomUUID(),
        type,
        subject: randomElement(subjects),
        notes: Math.random() < 0.5 ? 'Discussed next steps and timeline. Contact was engaged and interested.' : null,
        date: randomDate(90, 0),
        duration: type === 'call' ? randomInt(10, 60) :
                  type === 'meeting' ? randomInt(30, 120) : null,
        outcome: Math.random() < 0.4 ? 'Positive - moving forward' : null,
        contactId: contact.id,
        dealId: relatedDeal?.id ?? null,
        createdAt: randomDate(90, 0),
        updatedAt: now,
      })
    }
  }

  // Sort activities by date
  activities.sort((a, b) => b.date.getTime() - a.date.getTime())

  return activities
}

// =============================================================================
// Main Seed Function
// =============================================================================

export function generateSeedData(): SeedData {
  console.log('Generating CRM seed data...\n')

  const companies = generateCompanies()
  console.log(`Generated ${companies.length} companies`)

  const contacts = generateContacts(companies)
  console.log(`Generated ${contacts.length} contacts`)

  const deals = generateDeals(contacts, companies)
  console.log(`Generated ${deals.length} deals`)

  const activities = generateActivities(contacts, deals)
  console.log(`Generated ${activities.length} activities`)

  // Calculate some stats
  const totalDealValue = deals.reduce((sum, d) => sum + (d.value ?? 0), 0)
  const wonDeals = deals.filter(d => d.stage === 'won')
  const wonValue = wonDeals.reduce((sum, d) => sum + (d.value ?? 0), 0)

  console.log('\n--- Summary ---')
  console.log(`Total deal pipeline: $${totalDealValue.toLocaleString()}`)
  console.log(`Won deals: ${wonDeals.length} ($${wonValue.toLocaleString()})`)
  console.log(`Active deals: ${deals.filter(d => !['won', 'lost'].includes(d.stage)).length}`)
  console.log(`Customers: ${contacts.filter(c => c.status === 'customer').length}`)
  console.log(`Prospects: ${contacts.filter(c => c.status === 'prospect').length}`)
  console.log(`Leads: ${contacts.filter(c => c.status === 'lead').length}`)

  return { companies, contacts, deals, activities }
}

// =============================================================================
// Output Formats
// =============================================================================

export function toJSON(data: SeedData): string {
  return JSON.stringify(data, null, 2)
}

export function toSQL(data: SeedData): string {
  const lines: string[] = []

  lines.push('-- CRM Seed Data')
  lines.push('-- Generated by examples/crm/seed.ts')
  lines.push('')

  // Companies
  lines.push('-- Companies')
  for (const c of data.companies) {
    lines.push(`INSERT INTO companies (id, name, website, industry, size, address, phone, notes, created_at, updated_at)`)
    lines.push(`VALUES ('${c.id}', '${c.name.replace(/'/g, "''")}', ${c.website ? `'${c.website}'` : 'NULL'}, ${c.industry ? `'${c.industry}'` : 'NULL'}, ${c.size ? `'${c.size}'` : 'NULL'}, ${c.address ? `'${c.address.replace(/'/g, "''")}'` : 'NULL'}, ${c.phone ? `'${c.phone}'` : 'NULL'}, ${c.notes ? `'${c.notes.replace(/'/g, "''")}'` : 'NULL'}, '${c.createdAt.toISOString()}', '${c.updatedAt.toISOString()}');`)
  }

  lines.push('')
  lines.push('-- Contacts')
  for (const c of data.contacts) {
    lines.push(`INSERT INTO contacts (id, name, email, phone, title, status, company_id, notes, created_at, updated_at)`)
    lines.push(`VALUES ('${c.id}', '${c.name.replace(/'/g, "''")}', '${c.email}', ${c.phone ? `'${c.phone}'` : 'NULL'}, ${c.title ? `'${c.title.replace(/'/g, "''")}'` : 'NULL'}, '${c.status}', ${c.companyId ? `'${c.companyId}'` : 'NULL'}, ${c.notes ? `'${c.notes.replace(/'/g, "''")}'` : 'NULL'}, '${c.createdAt.toISOString()}', '${c.updatedAt.toISOString()}');`)
  }

  lines.push('')
  lines.push('-- Deals')
  for (const d of data.deals) {
    lines.push(`INSERT INTO deals (id, title, value, currency, stage, probability, expected_close, closed_at, lost_reason, contact_id, company_id, notes, created_at, updated_at)`)
    lines.push(`VALUES ('${d.id}', '${d.title.replace(/'/g, "''")}', ${d.value ?? 'NULL'}, '${d.currency}', '${d.stage}', ${d.probability ?? 'NULL'}, ${d.expectedClose ? `'${d.expectedClose.toISOString()}'` : 'NULL'}, ${d.closedAt ? `'${d.closedAt.toISOString()}'` : 'NULL'}, ${d.lostReason ? `'${d.lostReason.replace(/'/g, "''")}'` : 'NULL'}, '${d.contactId}', ${d.companyId ? `'${d.companyId}'` : 'NULL'}, ${d.notes ? `'${d.notes.replace(/'/g, "''")}'` : 'NULL'}, '${d.createdAt.toISOString()}', '${d.updatedAt.toISOString()}');`)
  }

  lines.push('')
  lines.push('-- Activities')
  for (const a of data.activities) {
    lines.push(`INSERT INTO activities (id, type, subject, notes, date, duration, outcome, contact_id, deal_id, created_at, updated_at)`)
    lines.push(`VALUES ('${a.id}', '${a.type}', ${a.subject ? `'${a.subject.replace(/'/g, "''")}'` : 'NULL'}, ${a.notes ? `'${a.notes.replace(/'/g, "''")}'` : 'NULL'}, '${a.date.toISOString()}', ${a.duration ?? 'NULL'}, ${a.outcome ? `'${a.outcome.replace(/'/g, "''")}'` : 'NULL'}, '${a.contactId}', ${a.dealId ? `'${a.dealId}'` : 'NULL'}, '${a.createdAt.toISOString()}', '${a.updatedAt.toISOString()}');`)
  }

  return lines.join('\n')
}

// =============================================================================
// CLI Execution
// =============================================================================

// Run if executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`

if (isMainModule) {
  const format = process.argv[2] || 'json'
  const data = generateSeedData()

  console.log('\n')

  if (format === 'sql') {
    console.log(toSQL(data))
  } else {
    console.log(toJSON(data))
  }
}
