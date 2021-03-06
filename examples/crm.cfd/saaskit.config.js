module.exports = {
  persona: 'Coder',
  problem: {
    internal: 'Hates unnecessary complexity',
    external: 'Needs a CRM (Customer Relationship Management System)',
    philosophical: 'Struggle with more features than you need vs Build your Own',
  },
  solution: 'CRM.cfd',
  brand: 'CloudFormed.cfd',
  offer: 'Developer-First CRM for Product-Led SaaS',
  callToAction: {
    build: { users: 5, monthlyPrice: 0 },
    grow: { annualUserPrice: 5, monthlyUserPrice: 10 },
    scale: { annualUserPrice: 15, monthlyUserPrice: 25 },
  },
  failure: 'Endless complexity and lost customer relationships',
  success: {
    goal: 'Having amazing and growing customer base',
    transformation: { from: 'Churning', to: 'Exploding' }
  },
  nouns: {
    customer: {
      name: 'string',
      email: ['email'],
      company: 'string?',
      phone: 'phone',
      tags: [tag],
      call: customer => twilio.makeCall(customer.phone),
      text: customer => twilio.sendSMS(customer.phone),
      email: customer => sendGrid.sendEmail(customer.email),
    },
    tag: {
      name: 'string'
    },
    sequence: {
      name: 'string'
    },
    template: {
      name: 'string'
    },
  },
  verbs: {},
  experiments: [],
}