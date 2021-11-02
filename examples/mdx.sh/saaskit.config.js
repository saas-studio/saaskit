import slugify from 'slugify'

export const app = {
  persona: 'Coder',
  problem: {
    villain: 'Jira',
    internal: 'Hates complex project management software',
    external: 'Needs a simple todo list',
    philosophical: 'Static vs Dynamic',
  },
  solution: 'MDX.sh',
  brand: 'SaaS.Dev',
  offer: 'Headless MDX Platform',
  callToAction: {
    build: { monthlyPrice: 0 },
    grow: { monthlyPrice: 10 },
    scale: { monthlyPrice: 50 },
  },
  failure: 'Endless complexity and lost customer relationships',
  success: {
    goal: 'Living a Productive and Fulfilling Life',
    transformation: { from: 'Endless Slog', to: 'Productive Rock Star' }
  },
  theme: {
    color: 'indigo',
    font: 'teko',
  },
  nouns: {
    page: {
      name: 'string',
      slug: page => slugify(page.name),
      title: 'string?',
      subtitle: 'string?',
      content: 'mdx?',
      importModules: ['url?'],
      layoutModule: 'url?', 
      images: ['image'],
      attachments: ['attachment'],
      categories: [app.nouns.category],
      tags: [app.nouns.tag],
      teams: [app.nouns.team],
    },
    category: {
      name: 'string',
    },
    tag: {
      name: 'string',
    },
    team: {
      name: 'string',
      icon: 'icon',
      header: 'image',
      members: [app.nouns.user],
    },
    user: {
      name: 'string?',
      email: 'email',
      invitedBy: ctx => ctx.createdBy,
    },
  },
  experiments: [],
  integrations: [],
  plugins: [],
}
