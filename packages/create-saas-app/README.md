# Create SaaS App

The easiest way to get started with Next.js is by using `create-next-app`. This CLI tool enables you to quickly start building a new Next.js application, with everything set up for you. You can create a new app using the default Next.js template, or by using one of the [official Next.js examples](https://github.com/vercel/next.js/tree/canary/examples). To get started, use the following command:

```bash
npx create-saas-app
```

Or, for a [TypeScript project](https://github.com/vercel/next.js/blob/canary/docs/basic-features/typescript.md):

```bash
npx create-saas-app --typescript
```

To create a new app in a specific folder, you can send a name as an argument. For example, the following command will create a new Next.js app called `blog-app` in a folder with the same name:

```bash
npx create-saas-app blog-app
```

## Options

`create-saas-app` comes with the following options:

- **--ts, --typescript** - Initialize as a TypeScript project.
- **-e, --example [name]|[github-url]** - An example to bootstrap the app with. You can use an example name from the [Next.js repo](https://github.com/vercel/next.js/tree/master/examples) or a GitHub URL. The URL can use any branch and/or subdirectory.
- **--example-path &lt;path-to-example&gt;** - In a rare case, your GitHub URL might contain a branch name with a slash (e.g. bug/fix-1) and the path to the example (e.g. foo/bar). In this case, you must specify the path to the example separately: `--example-path foo/bar`
- **--use-npm** - Explicitly tell the CLI to bootstrap the app using npm. To bootstrap using yarn we recommend to run `yarn create saas-app`

## Why use Create SaaS App?

`create-saas-app` allows you to create a new Next.js app within seconds. It is officially maintained by the creators of Next.js, and includes a number of benefits:

- **Interactive Experience**: Running `npx create-saas-app` (with no arguments) launches an interactive experience that guides you through setting up a project.
- **Zero Dependencies**: Initializing a project is as quick as one second. Create Next App has zero dependencies.
- **Offline Support**: Create Next App will automatically detect if you're offline and bootstrap your project using your local package cache.
- **Support for Examples**: Create Next App can bootstrap your application using an example from the Next.js examples collection (e.g. `npx create-saas-app --example api-routes`).
- **Tested**: The package is part of the Next.js monorepo and tested using the same integration test suite as Next.js itself, ensuring it works as expected with every release.

# **SaaS**kit.js

**SaaS**kit.js from [SaaS.Dev](https://saas.dev) is a highly opinionated framework and abstraction layer for rapidly 
creating, launching, and iterating on SaaS products like Apps, APIs, and Marketplaces.

With one simple command:

```bash
npx create-saaskit-app
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