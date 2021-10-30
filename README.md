# SaaSkit 

**[SaaSkit](https://saaskit.js.org)** from [SaaS.Dev](https://saas.dev) is a highly-opinionated low-code framework and abstraction layer for rapidly 
creating, launching, and iterating on SaaS products including Apps, APIs, and Marketplaces.

With one simple command:

```bash
npx create-saas-app
```

You can create an app in seconds:

```javascript
export const app = {
  persona: 'Coder',
  problem: {
    villain: 'Jira',
    internal: 'Hates complex project management software',
    external: 'Needs a simple todo list',
    philosophical: 'Build vs Buy',
  },
  solution: 'Todos.Dev',
  brand: 'SaaS.Dev',
  offer: 'Simple Todo App',
  callToAction: {
    build: { users: 5, monthlyPrice: 0 },
    grow: { users: 25, monthlyPrice: 50 },
    scale: { users: 500, monthlyPrice: 500 },
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
    todo: {
      name: 'string',
      assigned: 'user?',
      deadline: 'date?',
      description: 'markdown?',
      attachments: 'attachments?',
      tags: [app.nouns.tag],
      teams: [app.nouns.team],
      onCreate: (todo, {sendEmail}) => todo.assigned && sendEmail({
        to: todo.assigned.email,
        subject: `New Todo: ${todo}`,
        body: todo
      })
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

```

