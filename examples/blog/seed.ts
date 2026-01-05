#!/usr/bin/env bun
/**
 * Blog Example - Seed Script
 *
 * Generates sample blog content with:
 * - Multiple authors
 * - Posts about tech topics
 * - Various tags
 * - Many-to-many post-tag relationships
 * - Sample comments
 *
 * Usage:
 *   bun run seed.ts
 *
 * Or with the generated CLI:
 *   blog seed
 */

import { parseSchemaYaml, DataStore } from '../../packages/schema/src'
import { readFileSync } from 'fs'
import { join } from 'path'

// =============================================================================
// Type Definitions
// =============================================================================

interface Author {
  id: string
  name: string
  email: string
  bio?: string
  avatar_url?: string
}

interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  status: 'draft' | 'published' | 'archived'
  published_at?: string
  author_id: string
  created_at: string
  updated_at: string
}

interface Tag {
  id: string
  name: string
  slug: string
  color?: string
}

interface PostTag {
  id: string
  post_id: string
  tag_id: string
}

interface Comment {
  id: string
  post_id: string
  author_name: string
  author_email: string
  content: string
  approved: boolean
  created_at: string
}

// =============================================================================
// Helper Functions
// =============================================================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return date.toISOString()
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomElements<T>(arr: T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// =============================================================================
// Sample Data
// =============================================================================

const AUTHORS_DATA: Omit<Author, 'id'>[] = [
  {
    name: 'Alice Chen',
    email: 'alice@techblog.dev',
    bio: 'Full-stack developer passionate about TypeScript and developer experience. Building tools that make developers more productive.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
  },
  {
    name: 'Bob Martinez',
    email: 'bob@techblog.dev',
    bio: 'Cloud architect and DevOps enthusiast. Loves containers, Kubernetes, and infrastructure as code.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
  },
  {
    name: 'Carol Johnson',
    email: 'carol@techblog.dev',
    bio: 'AI/ML engineer exploring the intersection of machine learning and software engineering. Writer and speaker.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol',
  },
  {
    name: 'David Kim',
    email: 'david@techblog.dev',
    bio: 'Frontend specialist with a focus on React, performance optimization, and accessible web design.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
  },
]

const TAGS_DATA: Omit<Tag, 'id'>[] = [
  { name: 'TypeScript', slug: 'typescript', color: '#3178c6' },
  { name: 'JavaScript', slug: 'javascript', color: '#f7df1e' },
  { name: 'React', slug: 'react', color: '#61dafb' },
  { name: 'Node.js', slug: 'nodejs', color: '#339933' },
  { name: 'DevOps', slug: 'devops', color: '#ff6b6b' },
  { name: 'Docker', slug: 'docker', color: '#2496ed' },
  { name: 'Kubernetes', slug: 'kubernetes', color: '#326ce5' },
  { name: 'AI/ML', slug: 'ai-ml', color: '#9c27b0' },
  { name: 'Testing', slug: 'testing', color: '#4caf50' },
  { name: 'Performance', slug: 'performance', color: '#ff9800' },
  { name: 'Security', slug: 'security', color: '#f44336' },
  { name: 'Database', slug: 'database', color: '#795548' },
  { name: 'API Design', slug: 'api-design', color: '#00bcd4' },
  { name: 'Architecture', slug: 'architecture', color: '#607d8b' },
  { name: 'Tutorial', slug: 'tutorial', color: '#8bc34a' },
]

interface PostData {
  title: string
  content: string
  excerpt: string
  authorIndex: number
  tags: string[]
  status: 'draft' | 'published' | 'archived'
}

const POSTS_DATA: PostData[] = [
  {
    title: 'Getting Started with TypeScript in 2024',
    content: `# Getting Started with TypeScript in 2024

TypeScript has become the de facto standard for building scalable JavaScript applications. In this comprehensive guide, we'll explore everything you need to know to get started.

## Why TypeScript?

TypeScript adds optional static typing to JavaScript, which helps catch errors early in development and improves code maintainability. Here's a simple example:

\`\`\`typescript
interface User {
  id: string
  name: string
  email: string
}

function greetUser(user: User): string {
  return \`Hello, \${user.name}!\`
}
\`\`\`

## Setting Up Your Environment

1. Install Node.js (v18 or later recommended)
2. Initialize a new project: \`npm init -y\`
3. Install TypeScript: \`npm install -D typescript\`
4. Create tsconfig.json: \`npx tsc --init\`

## Best Practices

- Enable strict mode in tsconfig.json
- Use interfaces for object shapes
- Leverage type inference where possible
- Document complex types with JSDoc comments

TypeScript is continuously evolving, and the developer experience keeps getting better. Start small, and gradually adopt more advanced features as you become comfortable.`,
    excerpt: 'A comprehensive guide to getting started with TypeScript, covering setup, best practices, and why it matters in modern web development.',
    authorIndex: 0,
    tags: ['typescript', 'javascript', 'tutorial'],
    status: 'published',
  },
  {
    title: 'Building Scalable APIs with Node.js and Express',
    content: `# Building Scalable APIs with Node.js and Express

Creating robust APIs is essential for modern web applications. Let's explore patterns and practices for building scalable Node.js APIs.

## Project Structure

\`\`\`
src/
  controllers/
  middlewares/
  models/
  routes/
  services/
  utils/
  app.ts
  server.ts
\`\`\`

## Middleware Best Practices

Middleware is the backbone of Express applications:

\`\`\`typescript
import express from 'express'
import { rateLimit } from 'express-rate-limit'

const app = express()

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per window
}))

// Request logging
app.use((req, res, next) => {
  console.log(\`\${req.method} \${req.path}\`)
  next()
})
\`\`\`

## Error Handling

Always implement centralized error handling:

\`\`\`typescript
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})
\`\`\`

## Scaling Strategies

- Use clustering to take advantage of multiple CPU cores
- Implement caching with Redis
- Use a load balancer for horizontal scaling
- Monitor with tools like PM2 or Kubernetes`,
    excerpt: 'Learn patterns and best practices for building scalable, production-ready APIs with Node.js and Express.',
    authorIndex: 0,
    tags: ['nodejs', 'api-design', 'architecture', 'typescript'],
    status: 'published',
  },
  {
    title: 'Kubernetes for Developers: A Practical Guide',
    content: `# Kubernetes for Developers: A Practical Guide

Kubernetes has revolutionized how we deploy and manage containerized applications. This guide focuses on what developers need to know.

## Core Concepts

### Pods
The smallest deployable unit in Kubernetes:

\`\`\`yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-app
spec:
  containers:
  - name: app
    image: my-app:latest
    ports:
    - containerPort: 3000
\`\`\`

### Deployments
Manage replicated pods:

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: app
        image: my-app:latest
\`\`\`

### Services
Expose your application:

\`\`\`yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app-service
spec:
  selector:
    app: my-app
  ports:
  - port: 80
    targetPort: 3000
\`\`\`

## Local Development

Use tools like:
- **minikube**: Local Kubernetes cluster
- **kind**: Kubernetes in Docker
- **k3d**: Lightweight k3s in Docker

## Tips for Developers

1. Always use resource limits
2. Implement health checks
3. Use ConfigMaps for configuration
4. Never store secrets in images`,
    excerpt: 'A developer-focused guide to Kubernetes, covering core concepts, local development, and practical tips for deploying applications.',
    authorIndex: 1,
    tags: ['kubernetes', 'devops', 'docker', 'architecture'],
    status: 'published',
  },
  {
    title: 'Introduction to Large Language Models for Developers',
    content: `# Introduction to Large Language Models for Developers

Large Language Models (LLMs) are transforming software development. Here's what you need to know to integrate them into your applications.

## Understanding LLMs

LLMs are neural networks trained on vast amounts of text data. They can:
- Generate human-like text
- Answer questions
- Summarize documents
- Write and explain code
- Translate languages

## Working with APIs

Most LLMs are accessed via APIs. Here's a typical pattern:

\`\`\`typescript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

async function chat(prompt: string): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }]
  })
  return response.content[0].text
}
\`\`\`

## Prompt Engineering

The key to getting good results:

1. **Be specific**: Clear instructions get better outputs
2. **Provide context**: Include relevant background
3. **Use examples**: Show the format you want
4. **Iterate**: Refine prompts based on results

## Best Practices

- Always validate LLM outputs
- Implement rate limiting and error handling
- Cache responses when appropriate
- Monitor costs and usage
- Consider privacy implications`,
    excerpt: 'Learn how to integrate Large Language Models into your applications, covering APIs, prompt engineering, and best practices.',
    authorIndex: 2,
    tags: ['ai-ml', 'api-design', 'tutorial'],
    status: 'published',
  },
  {
    title: 'React Performance Optimization Techniques',
    content: `# React Performance Optimization Techniques

Performance matters. Slow applications frustrate users and hurt business metrics. Let's explore how to make React apps fast.

## Profiling First

Before optimizing, measure:

1. Use React DevTools Profiler
2. Check Lighthouse scores
3. Monitor Core Web Vitals

## Code Splitting

Load only what you need:

\`\`\`typescript
import { lazy, Suspense } from 'react'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  )
}
\`\`\`

## Memoization

Prevent unnecessary re-renders:

\`\`\`typescript
import { memo, useMemo, useCallback } from 'react'

const ExpensiveList = memo(({ items, onSelect }) => {
  const sortedItems = useMemo(
    () => items.sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  )

  return sortedItems.map(item => (
    <Item key={item.id} item={item} onSelect={onSelect} />
  ))
})
\`\`\`

## Virtual Lists

For long lists, virtualize:

\`\`\`typescript
import { FixedSizeList } from 'react-window'

function VirtualList({ items }) {
  return (
    <FixedSizeList
      height={400}
      itemCount={items.length}
      itemSize={50}
    >
      {({ index, style }) => (
        <div style={style}>{items[index].name}</div>
      )}
    </FixedSizeList>
  )
}
\`\`\`

## Key Takeaways

- Measure before optimizing
- Don't over-optimize prematurely
- Focus on user-perceived performance
- Test on real devices`,
    excerpt: 'Practical techniques for optimizing React application performance, including code splitting, memoization, and virtualization.',
    authorIndex: 3,
    tags: ['react', 'performance', 'javascript', 'tutorial'],
    status: 'published',
  },
  {
    title: 'Docker Best Practices for Production',
    content: `# Docker Best Practices for Production

Running Docker in production requires careful attention to security, performance, and reliability.

## Multi-Stage Builds

Keep images small and secure:

\`\`\`dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER node
CMD ["node", "dist/server.js"]
\`\`\`

## Security Considerations

1. **Use non-root users**
2. **Scan images for vulnerabilities**
3. **Keep base images updated**
4. **Don't store secrets in images**
5. **Use read-only file systems when possible**

## Health Checks

\`\`\`dockerfile
HEALTHCHECK --interval=30s --timeout=3s \\
  CMD curl -f http://localhost:3000/health || exit 1
\`\`\`

## Resource Limits

Always set limits in production:

\`\`\`yaml
services:
  app:
    image: my-app:latest
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
\`\`\`

## Logging

Configure proper logging:
- Use JSON format
- Include timestamps
- Add correlation IDs
- Ship logs to a central location`,
    excerpt: 'Essential Docker best practices for production environments, covering multi-stage builds, security, health checks, and resource management.',
    authorIndex: 1,
    tags: ['docker', 'devops', 'security', 'architecture'],
    status: 'published',
  },
  {
    title: 'Writing Effective Unit Tests',
    content: `# Writing Effective Unit Tests

Good tests give confidence to refactor and deploy. Here's how to write tests that actually help.

## Test Structure

Follow the AAA pattern:

\`\`\`typescript
describe('Calculator', () => {
  it('should add two numbers correctly', () => {
    // Arrange
    const calculator = new Calculator()

    // Act
    const result = calculator.add(2, 3)

    // Assert
    expect(result).toBe(5)
  })
})
\`\`\`

## What to Test

Focus on:
- Business logic
- Edge cases
- Error handling
- Integration points

Avoid testing:
- Framework code
- Trivial getters/setters
- Implementation details

## Mocking

Mock external dependencies:

\`\`\`typescript
import { vi } from 'vitest'

const mockFetch = vi.fn()
global.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockReset()
})

it('should handle API errors', async () => {
  mockFetch.mockRejectedValue(new Error('Network error'))

  await expect(fetchUser('123')).rejects.toThrow('Network error')
})
\`\`\`

## Test Driven Development

1. Write a failing test
2. Write minimal code to pass
3. Refactor
4. Repeat

## Best Practices

- Keep tests fast
- One assertion per test (when practical)
- Use descriptive test names
- Test behavior, not implementation
- Maintain test code like production code`,
    excerpt: 'Learn how to write effective unit tests that provide confidence, document behavior, and enable safe refactoring.',
    authorIndex: 0,
    tags: ['testing', 'typescript', 'tutorial'],
    status: 'published',
  },
  {
    title: 'Exploring Bun: The All-in-One JavaScript Runtime',
    content: `# Exploring Bun: The All-in-One JavaScript Runtime

Bun is a fast all-in-one JavaScript runtime that includes a bundler, test runner, and package manager.

## Why Bun?

- **Speed**: Written in Zig, optimized for performance
- **All-in-one**: No need for separate tools
- **Node.js compatible**: Most npm packages work
- **TypeScript native**: No transpilation needed

## Getting Started

\`\`\`bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Create a new project
bun init

# Install dependencies
bun install

# Run a script
bun run index.ts
\`\`\`

## Package Management

Bun is significantly faster than npm:

\`\`\`bash
# Install dependencies (much faster!)
bun install

# Add a package
bun add express

# Remove a package
bun remove express
\`\`\`

## Testing

Built-in test runner:

\`\`\`typescript
import { describe, it, expect } from 'bun:test'

describe('math', () => {
  it('adds numbers', () => {
    expect(2 + 2).toBe(4)
  })
})
\`\`\`

## When to Use Bun

Good for:
- New projects
- Development tooling
- Performance-critical applications

Consider carefully:
- Production deployments (still maturing)
- Complex Node.js applications (some edge cases)`,
    excerpt: 'An introduction to Bun, the fast all-in-one JavaScript runtime that includes bundler, test runner, and package manager.',
    authorIndex: 0,
    tags: ['javascript', 'nodejs', 'performance'],
    status: 'published',
  },
  {
    title: 'Building AI Agents with the Model Context Protocol',
    content: `# Building AI Agents with the Model Context Protocol

The Model Context Protocol (MCP) enables AI assistants to interact with external tools and data sources in a standardized way.

## What is MCP?

MCP defines how AI assistants can:
- Discover available tools
- Execute actions
- Access data sources
- Maintain context across interactions

## Basic MCP Server

\`\`\`typescript
import { McpServer } from '@modelcontextprotocol/sdk/server'

const server = new McpServer({
  name: 'my-tools',
  version: '1.0.0'
})

server.addTool({
  name: 'get_weather',
  description: 'Get current weather for a location',
  inputSchema: {
    type: 'object',
    properties: {
      location: { type: 'string', description: 'City name' }
    },
    required: ['location']
  },
  handler: async ({ location }) => {
    // Fetch weather data
    return { temperature: 72, conditions: 'sunny' }
  }
})

server.start()
\`\`\`

## Integration with Claude

Configure in Claude Desktop:

\`\`\`json
{
  "mcpServers": {
    "my-tools": {
      "command": "node",
      "args": ["server.js"]
    }
  }
}
\`\`\`

## Best Practices

1. Clear tool descriptions
2. Structured input schemas
3. Informative error messages
4. Rate limiting for external APIs
5. Logging for debugging

MCP enables powerful AI workflows while keeping humans in control.`,
    excerpt: 'Learn how to build AI agents using the Model Context Protocol (MCP) for tool integration and external data access.',
    authorIndex: 2,
    tags: ['ai-ml', 'api-design', 'tutorial', 'typescript'],
    status: 'published',
  },
  {
    title: 'Database Design Patterns for Modern Applications',
    content: `# Database Design Patterns for Modern Applications

Good database design is crucial for application performance and maintainability.

## Normalization

Organize data to reduce redundancy:

**First Normal Form (1NF)**: Atomic values, no repeating groups
**Second Normal Form (2NF)**: Remove partial dependencies
**Third Normal Form (3NF)**: Remove transitive dependencies

## When to Denormalize

Sometimes denormalization improves performance:

- Read-heavy workloads
- Complex join queries
- Caching layers
- Reporting tables

## Indexing Strategies

\`\`\`sql
-- Single column index
CREATE INDEX idx_users_email ON users(email);

-- Composite index
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);

-- Partial index
CREATE INDEX idx_active_users ON users(email) WHERE active = true;
\`\`\`

## Common Patterns

### Soft Deletes
\`\`\`sql
ALTER TABLE posts ADD COLUMN deleted_at TIMESTAMP;
\`\`\`

### Audit Trails
\`\`\`sql
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(100),
  record_id INTEGER,
  action VARCHAR(20),
  old_values JSONB,
  new_values JSONB,
  changed_at TIMESTAMP DEFAULT NOW(),
  changed_by INTEGER
);
\`\`\`

### Polymorphic Associations
\`\`\`sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  body TEXT,
  commentable_type VARCHAR(50),
  commentable_id INTEGER
);
\`\`\`

## Key Principles

- Design for queries, not just storage
- Plan for scale from the start
- Use constraints to enforce data integrity
- Monitor slow queries and optimize`,
    excerpt: 'Essential database design patterns including normalization, indexing strategies, and common patterns for modern applications.',
    authorIndex: 0,
    tags: ['database', 'architecture', 'performance'],
    status: 'published',
  },
  {
    title: 'Upcoming: Web Components in 2025',
    content: `# Web Components in 2025

This post is coming soon! We'll explore the state of Web Components and how they've evolved.

## Topics to Cover

- Shadow DOM improvements
- Custom Element best practices
- Styling strategies
- Framework interoperability
- Real-world use cases

Stay tuned!`,
    excerpt: 'An upcoming deep dive into Web Components and their evolution in the modern web development landscape.',
    authorIndex: 3,
    tags: ['javascript', 'architecture'],
    status: 'draft',
  },
  {
    title: 'Legacy: AngularJS Migration Guide',
    content: `# AngularJS to Angular Migration Guide

*Note: This post has been archived as AngularJS reached end of life.*

If you're still running AngularJS applications, here are the key steps for migration...

[Historical content preserved for reference]`,
    excerpt: 'Archived guide for migrating from AngularJS to modern Angular. Preserved for historical reference.',
    authorIndex: 3,
    tags: ['javascript', 'architecture'],
    status: 'archived',
  },
]

const COMMENTS_DATA = [
  {
    author_name: 'Sarah Developer',
    author_email: 'sarah@example.com',
    content: 'Great article! The TypeScript examples were really helpful. Looking forward to more content like this.',
    approved: true,
  },
  {
    author_name: 'Mike Engineer',
    author_email: 'mike@example.com',
    content: 'Thanks for explaining Kubernetes in a developer-friendly way. The YAML examples are exactly what I needed.',
    approved: true,
  },
  {
    author_name: 'Anonymous',
    author_email: 'anon@temp.com',
    content: 'Check out my crypto investment site! Great returns guaranteed!!!',
    approved: false, // Spam
  },
  {
    author_name: 'Lisa Coder',
    author_email: 'lisa@techco.com',
    content: 'The memoization section was eye-opening. I was overusing useMemo and useCallback everywhere!',
    approved: true,
  },
  {
    author_name: 'Tom Backend',
    author_email: 'tom@startup.io',
    content: 'Would love to see a follow-up post on advanced Docker networking.',
    approved: true,
  },
  {
    author_name: 'New Reader',
    author_email: 'reader@gmail.com',
    content: 'Just discovered this blog. The content quality is excellent!',
    approved: false, // Pending moderation
  },
  {
    author_name: 'AI Enthusiast',
    author_email: 'ai.fan@example.com',
    content: 'The MCP article is fantastic. Built my first AI agent after reading this!',
    approved: true,
  },
  {
    author_name: 'Database Admin',
    author_email: 'dba@enterprise.com',
    content: 'Good overview of database patterns. The indexing section could use more on composite index ordering.',
    approved: true,
  },
]

// =============================================================================
// Seed Function
// =============================================================================

async function seed() {
  console.log('Starting blog seed...\n')

  // Load and parse the schema
  const schemaPath = join(import.meta.dir || __dirname, 'schema.yaml')
  const schemaYaml = readFileSync(schemaPath, 'utf-8')
  const schema = parseSchemaYaml(schemaYaml)
  const store = new DataStore(schema)

  // Create authors
  console.log('Creating authors...')
  const authors: Author[] = []
  for (const data of AUTHORS_DATA) {
    const author = store.create('Author', data) as unknown as Author
    authors.push(author)
    console.log(`  Created author: ${author.name}`)
  }

  // Create tags
  console.log('\nCreating tags...')
  const tags: Tag[] = []
  const tagsBySlug = new Map<string, Tag>()
  for (const data of TAGS_DATA) {
    const tag = store.create('Tag', data) as unknown as Tag
    tags.push(tag)
    tagsBySlug.set(tag.slug, tag)
    console.log(`  Created tag: ${tag.name} (${tag.color || 'no color'})`)
  }

  // Create posts
  console.log('\nCreating posts...')
  const posts: Post[] = []
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  const now = new Date()

  for (const data of POSTS_DATA) {
    const author = authors[data.authorIndex]
    const createdAt = randomDate(oneYearAgo, now)
    const updatedAt = randomDate(new Date(createdAt), now)

    const post = store.create('Post', {
      title: data.title,
      slug: slugify(data.title),
      content: data.content,
      excerpt: data.excerpt,
      status: data.status,
      published_at: data.status === 'published' ? updatedAt : undefined,
      author_id: author.id,
      created_at: createdAt,
      updated_at: updatedAt,
    }) as unknown as Post
    posts.push(post)
    console.log(`  Created post: "${post.title}" (${post.status})`)

    // Create post-tag associations
    for (const tagSlug of data.tags) {
      const tag = tagsBySlug.get(tagSlug)
      if (tag) {
        store.create('PostTag', {
          post_id: post.id,
          tag_id: tag.id,
        })
      }
    }
  }

  // Create comments on published posts
  console.log('\nCreating comments...')
  const publishedPosts = posts.filter((p) => p.status === 'published')

  for (const commentData of COMMENTS_DATA) {
    const post = randomElement(publishedPosts)
    const comment = store.create('Comment', {
      post_id: post.id,
      author_name: commentData.author_name,
      author_email: commentData.author_email,
      content: commentData.content,
      approved: commentData.approved,
      created_at: randomDate(new Date(post.created_at), now),
    }) as unknown as Comment
    console.log(
      `  Created comment by ${comment.author_name} on "${post.title.substring(0, 30)}..." (${comment.approved ? 'approved' : 'pending'})`
    )
  }

  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('Seed completed!')
  console.log('='.repeat(60))
  const postTags = store.findAll('PostTag')
  const comments = store.findAll('Comment')

  console.log(`
Summary:
  Authors:   ${authors.length}
  Tags:      ${tags.length}
  Posts:     ${posts.length} (${posts.filter((p) => p.status === 'published').length} published, ${posts.filter((p) => p.status === 'draft').length} draft, ${posts.filter((p) => p.status === 'archived').length} archived)
  Post-Tags: ${postTags.length}
  Comments:  ${comments.length} (${COMMENTS_DATA.filter((c) => c.approved).length} approved, ${COMMENTS_DATA.filter((c) => !c.approved).length} pending)

Sample data has been created. Use the CLI or API to explore:

  blog authors list
  blog posts list --status published
  blog tags list
  blog comments list --approved true
`)

  return {
    authors,
    tags,
    posts,
    postTags,
    comments,
  }
}

// =============================================================================
// Main
// =============================================================================

// Run seed if executed directly
const isMainModule = import.meta.main || process.argv[1]?.endsWith('seed.ts')

if (isMainModule) {
  seed().catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
}

export { seed }
