# Blog Example

A full-featured blog platform demonstrating many-to-many relationships and content management workflows with SaaSkit.

## What This Example Demonstrates

- **Many-to-Many Relationships**: Posts and Tags connected through a junction table (PostTags)
- **One-to-Many Relationships**: Authors have many Posts, Posts have many Comments
- **Content Management Workflows**: Draft/Published/Archived status states
- **Common Field Patterns**: Slugs, timestamps, moderation flags
- **Text/Textarea Fields**: Short titles, long-form content
- **Select Fields**: Status enumeration with workflow states
- **Boolean Fields**: Comment approval flags
- **Relation Fields**: Foreign keys between resources

## Schema Overview

```
Authors (1) -----> (*) Posts (*) <-----> (*) Tags
                        |
                        v
                   (*) Comments
```

### Resources

| Resource | Description |
|----------|-------------|
| `authors` | Blog content creators with profile info |
| `posts` | Blog posts with content, status, and author |
| `tags` | Categorization labels for posts |
| `post_tags` | Junction table for post-tag relationships |
| `comments` | User-submitted comments on posts |

## Running the Example

### Prerequisites

- [Bun](https://bun.sh) v1.2.0 or higher
- SaaSkit installed in the parent project

### Quick Start

```bash
# From the saaskit root directory
cd examples/blog

# Generate the app from schema
npx saaskit generate schema.yaml

# Start the development server
npx saaskit dev

# Or run the CLI directly
npx blog --help
```

### Seed Sample Data

```bash
# Run the seed script to populate sample data
bun run seed.ts
```

## CLI Commands

### Authors

```bash
# List all authors
blog authors list

# Create a new author
blog authors create \
  --name "Alice Writer" \
  --email "alice@blog.com" \
  --bio "Tech enthusiast and software engineer"

# View author details
blog authors show <author-id>

# Update author
blog authors update <author-id> --bio "Updated biography"

# Delete author
blog authors delete <author-id>
```

### Posts

```bash
# List all posts
blog posts list

# List only published posts
blog posts list --status published

# Create a new draft post
blog posts create \
  --title "Getting Started with SaaSkit" \
  --slug "getting-started-with-saaskit" \
  --content "Full markdown content here..." \
  --excerpt "A quick intro to building with SaaSkit" \
  --author-id <author-id> \
  --status draft

# Publish a post
blog posts update <post-id> \
  --status published \
  --published-at "2024-01-15"

# Archive a post
blog posts update <post-id> --status archived

# Search posts
blog posts search "SaaSkit"
```

### Tags

```bash
# List all tags
blog tags list

# Create a new tag
blog tags create \
  --name "TypeScript" \
  --slug "typescript" \
  --color "#3178c6"

# View tag details
blog tags show <tag-id>
```

### Post Tags (Many-to-Many)

```bash
# Add a tag to a post
blog post-tags create \
  --post-id <post-id> \
  --tag-id <tag-id>

# List tags for a post
blog post-tags list --post-id <post-id>

# List posts with a tag
blog post-tags list --tag-id <tag-id>

# Remove a tag from a post
blog post-tags delete <post-tag-id>
```

### Comments

```bash
# List all comments
blog comments list

# List comments for a post
blog comments list --post-id <post-id>

# List pending comments (not yet approved)
blog comments list --approved false

# Create a comment
blog comments create \
  --post-id <post-id> \
  --author-name "Jane Reader" \
  --author-email "jane@example.com" \
  --content "Great article! Very helpful."

# Approve a comment
blog comments update <comment-id> --approved true

# Delete spam comment
blog comments delete <comment-id>
```

## API Endpoints

All resources are available via REST API:

### Authors API

```bash
# List authors
curl http://localhost:3000/api/authors

# Get single author
curl http://localhost:3000/api/authors/<id>

# Create author
curl -X POST http://localhost:3000/api/authors \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Writer", "email": "alice@blog.com"}'

# Update author
curl -X PUT http://localhost:3000/api/authors/<id> \
  -H "Content-Type: application/json" \
  -d '{"bio": "Updated bio"}'

# Delete author
curl -X DELETE http://localhost:3000/api/authors/<id>
```

### Posts API

```bash
# List posts (with filtering)
curl "http://localhost:3000/api/posts?status=published"

# Get post by ID
curl http://localhost:3000/api/posts/<id>

# Get post by slug
curl http://localhost:3000/api/posts/slug/getting-started-with-saaskit

# Create post
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Post",
    "slug": "new-post",
    "content": "Post content...",
    "author_id": "<author-id>",
    "status": "draft"
  }'

# Update post status
curl -X PUT http://localhost:3000/api/posts/<id> \
  -H "Content-Type: application/json" \
  -d '{"status": "published", "published_at": "2024-01-15T10:00:00Z"}'
```

### Tags API

```bash
# List tags
curl http://localhost:3000/api/tags

# Create tag
curl -X POST http://localhost:3000/api/tags \
  -H "Content-Type: application/json" \
  -d '{"name": "JavaScript", "slug": "javascript", "color": "#f7df1e"}'
```

### Post Tags API (Junction)

```bash
# Link tag to post
curl -X POST http://localhost:3000/api/post-tags \
  -H "Content-Type: application/json" \
  -d '{"post_id": "<post-id>", "tag_id": "<tag-id>"}'

# Get tags for a post
curl "http://localhost:3000/api/post-tags?post_id=<post-id>"

# Get posts for a tag
curl "http://localhost:3000/api/post-tags?tag_id=<tag-id>"
```

### Comments API

```bash
# List comments for a post
curl "http://localhost:3000/api/comments?post_id=<post-id>&approved=true"

# Create comment
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": "<post-id>",
    "author_name": "Reader",
    "author_email": "reader@example.com",
    "content": "Great post!"
  }'

# Approve comment
curl -X PUT http://localhost:3000/api/comments/<id> \
  -H "Content-Type: application/json" \
  -d '{"approved": true}'
```

## Common Workflows

### Publishing a New Blog Post

```bash
# 1. Create the post as draft
POST_ID=$(blog posts create \
  --title "My New Post" \
  --slug "my-new-post" \
  --content "..." \
  --author-id <author-id> \
  --status draft \
  --format json | jq -r '.id')

# 2. Add tags
blog post-tags create --post-id $POST_ID --tag-id <tag-1-id>
blog post-tags create --post-id $POST_ID --tag-id <tag-2-id>

# 3. Review and publish
blog posts update $POST_ID --status published --published-at "$(date -I)"

# 4. Verify
blog posts show $POST_ID
```

### Moderating Comments

```bash
# List pending comments
blog comments list --approved false

# Review and approve good comments
blog comments update <comment-id> --approved true

# Delete spam
blog comments delete <spam-comment-id>
```

### Managing Tags on Posts

```bash
# View current tags on a post
blog post-tags list --post-id <post-id>

# Add new tag
blog post-tags create --post-id <post-id> --tag-id <new-tag-id>

# Remove tag (find the junction record ID first)
JUNCTION_ID=$(blog post-tags list --post-id <post-id> --tag-id <tag-id> --format json | jq -r '.[0].id')
blog post-tags delete $JUNCTION_ID
```

### Archiving Old Content

```bash
# Find old published posts
blog posts list --status published --format json | \
  jq -r '.[] | select(.published_at < "2023-01-01") | .id'

# Archive each one
blog posts update <old-post-id> --status archived
```

## MCP Server Integration

The blog app exposes an MCP server for AI agent integration:

```bash
# Start MCP server
blog mcp
```

Configure in Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "blog": {
      "command": "blog",
      "args": ["mcp"]
    }
  }
}
```

Now Claude can:
- "Create a new blog post about TypeScript best practices"
- "Show me all posts tagged with 'javascript'"
- "Approve all pending comments on the latest post"
- "Archive posts that haven't been updated in 6 months"

## TypeScript SDK

```typescript
import { BlogClient } from 'blog-sdk'

const client = new BlogClient({
  baseUrl: 'http://localhost:3000',
  apiKey: process.env.BLOG_API_KEY
})

// Create an author
const author = await client.authors.create({
  name: 'Alice Writer',
  email: 'alice@blog.com',
  bio: 'Tech writer'
})

// Create a post
const post = await client.posts.create({
  title: 'Hello World',
  slug: 'hello-world',
  content: 'My first post...',
  author_id: author.id,
  status: 'draft'
})

// Add tags
const tag = await client.tags.create({
  name: 'Getting Started',
  slug: 'getting-started',
  color: '#22c55e'
})

await client.postTags.create({
  post_id: post.id,
  tag_id: tag.id
})

// Publish
await client.posts.update(post.id, {
  status: 'published',
  published_at: new Date().toISOString()
})

// List published posts with their tags
const posts = await client.posts.list({ status: 'published' })
for (const post of posts) {
  const postTags = await client.postTags.list({ post_id: post.id })
  console.log(`${post.title} - ${postTags.length} tags`)
}
```

## Output Formats

All commands support multiple output formats:

```bash
blog posts list                    # Terminal UI (default)
blog posts list --format table     # ASCII table
blog posts list --format json      # JSON
blog posts list --format yaml      # YAML
blog posts list --format csv       # CSV
blog posts list --format markdown  # Markdown table
```

## File Structure

```
examples/blog/
  schema.yaml   # Schema definition
  README.md     # This documentation
  seed.ts       # Sample data generator
```
