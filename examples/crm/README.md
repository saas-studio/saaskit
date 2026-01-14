# CRM Example - SaaSkit

A complete Customer Relationship Management (CRM) application demonstrating SaaSkit's support for complex entity relationships, state workflows, and multiple view types.

## What This Example Demonstrates

- **Complex Relationships**: One-to-many and many-to-one relationships between entities
- **Enum Fields**: Status and stage fields with predefined values
- **State Workflows**: Deal pipeline and contact lifecycle state machines
- **Multiple View Types**: Tables, Kanban boards, calendars, and timelines
- **Cascading Deletes**: Proper handling of related records on deletion

## Entity Relationship Diagram

```
+------------------+         +------------------+
|     COMPANY      |         |     CONTACT      |
+------------------+         +------------------+
| id (PK)          |<-----+  | id (PK)          |
| name             |      |  | name             |
| website          |      |  | email (unique)   |
| industry         |      |  | phone            |
| size (enum)      |      |  | title            |
| address          |      +--| companyId (FK)   |
| phone            |         | status (enum)    |
| notes            |         | notes            |
| createdAt        |         | createdAt        |
| updatedAt        |         | updatedAt        |
+------------------+         +------------------+
        ^                           ^  ^
        |                           |  |
        |   +------------------+    |  |
        |   |       DEAL       |    |  |
        |   +------------------+    |  |
        +---| companyId (FK)   |    |  |
            | contactId (FK)   |----+  |
            | id (PK)          |       |
            | title            |       |
            | value            |       |
            | currency         |       |
            | stage (enum)     |       |
            | probability      |       |
            | expectedClose    |       |
            | closedAt         |       |
            | lostReason       |       |
            | notes            |       |
            | createdAt        |       |
            | updatedAt        |       |
            +------------------+       |
                    ^                  |
                    |                  |
            +------------------+       |
            |    ACTIVITY      |       |
            +------------------+       |
            | id (PK)          |       |
            | type (enum)      |       |
            | subject          |       |
            | notes            |       |
            | date             |       |
            | duration         |       |
            | outcome          |       |
            | contactId (FK)   |-------+
            | dealId (FK)      |
            | createdAt        |
            | updatedAt        |
            +------------------+
```

## Relationships Summary

| From       | To       | Cardinality | Description                          |
|------------|----------|-------------|--------------------------------------|
| Contact    | Company  | Many-to-One | Contacts belong to companies         |
| Deal       | Contact  | Many-to-One | Deals are associated with contacts   |
| Deal       | Company  | Many-to-One | Deals can be linked to companies     |
| Activity   | Contact  | Many-to-One | Activities are logged for contacts   |
| Activity   | Deal     | Many-to-One | Activities can be tied to deals      |

## Enum Values

### Contact Status
- `lead` - New lead, not yet qualified
- `prospect` - Qualified, actively being pursued
- `customer` - Has purchased/signed
- `churned` - Former customer

### Company Size
- `small` - 1-50 employees
- `medium` - 51-200 employees
- `enterprise` - 200+ employees

### Deal Stage
- `discovery` - Initial discovery phase
- `proposal` - Proposal sent
- `negotiation` - In negotiation
- `won` - Deal closed successfully
- `lost` - Deal lost

### Activity Type
- `call` - Phone call
- `email` - Email sent/received
- `meeting` - In-person or virtual meeting
- `note` - General note or update

## Quick Start

### Generate the Application

```bash
# From the saaskit root directory
npx saaskit generate examples/crm/schema.yaml

# Or using the CLI directly
saaskit generate examples/crm/schema.yaml --output ./dist/crm
```

### Seed Sample Data

```bash
# Run the seed script to populate with sample data
npx tsx examples/crm/seed.ts
```

### Start the Application

```bash
# Start the CLI interface
crm

# Or start the API server
crm serve
```

## CLI Commands

### Companies

```bash
# List all companies
crm company list

# Create a company
crm company create --name "Acme Corp" --industry "Technology" --size enterprise

# View a company
crm company view <id>

# Update a company
crm company update <id> --website "https://acme.com"

# Delete a company
crm company delete <id>
```

### Contacts

```bash
# List all contacts
crm contact list

# Filter by status
crm contact list --status customer

# Create a contact
crm contact create --name "Jane Smith" --email "jane@acme.com" --companyId <company-id>

# Kanban view (by status)
crm contact board
```

### Deals

```bash
# List all deals
crm deal list

# Pipeline view (Kanban by stage)
crm deal pipeline

# Create a deal
crm deal create --title "Enterprise License" --value 50000 --contactId <contact-id>

# Move deal to next stage
crm deal update <id> --stage proposal

# Close a deal
crm deal update <id> --stage won

# Calendar view (by expected close)
crm deal calendar
```

### Activities

```bash
# List all activities
crm activity list

# Log a call
crm activity create --type call --contactId <id> --subject "Discovery Call" --duration 30

# Log an email
crm activity create --type email --contactId <id> --dealId <deal-id> --subject "Follow-up"

# Timeline view
crm activity timeline --contactId <id>
```

## API Endpoints

The generated REST API follows standard conventions:

### Companies
```
GET    /api/companies           # List companies
POST   /api/companies           # Create company
GET    /api/companies/:id       # Get company
PUT    /api/companies/:id       # Update company
DELETE /api/companies/:id       # Delete company
GET    /api/companies/:id/contacts  # List company contacts
GET    /api/companies/:id/deals     # List company deals
```

### Contacts
```
GET    /api/contacts            # List contacts
POST   /api/contacts            # Create contact
GET    /api/contacts/:id        # Get contact
PUT    /api/contacts/:id        # Update contact
DELETE /api/contacts/:id        # Delete contact
GET    /api/contacts/:id/deals      # List contact deals
GET    /api/contacts/:id/activities # List contact activities
```

### Deals
```
GET    /api/deals               # List deals
POST   /api/deals               # Create deal
GET    /api/deals/:id           # Get deal
PUT    /api/deals/:id           # Update deal
DELETE /api/deals/:id           # Delete deal
GET    /api/deals/:id/activities    # List deal activities
POST   /api/deals/:id/transition    # Trigger workflow transition
```

### Activities
```
GET    /api/activities          # List activities
POST   /api/activities          # Create activity
GET    /api/activities/:id      # Get activity
PUT    /api/activities/:id      # Update activity
DELETE /api/activities/:id      # Delete activity
```

## TypeScript SDK

```typescript
import { CRMClient } from './sdk'

const crm = new CRMClient({ baseUrl: 'http://localhost:3000' })

// Create a company
const company = await crm.companies.create({
  name: 'Acme Corp',
  industry: 'Technology',
  size: 'enterprise'
})

// Create a contact
const contact = await crm.contacts.create({
  name: 'Jane Smith',
  email: 'jane@acme.com',
  companyId: company.id,
  status: 'lead'
})

// Create a deal
const deal = await crm.deals.create({
  title: 'Enterprise License',
  value: 50000,
  contactId: contact.id,
  companyId: company.id,
  stage: 'discovery'
})

// Log an activity
await crm.activities.create({
  type: 'call',
  subject: 'Discovery Call',
  notes: 'Discussed requirements and timeline',
  contactId: contact.id,
  dealId: deal.id,
  date: new Date(),
  duration: 30
})

// Progress the deal
await crm.deals.update(deal.id, { stage: 'proposal' })

// Convert contact to customer
await crm.contacts.update(contact.id, { status: 'customer' })
```

## MCP Integration

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "crm": {
      "command": "crm",
      "args": ["mcp"]
    }
  }
}
```

Now you can use natural language:
- "Create a new contact named John Doe at Acme Corp"
- "Show me all deals in the negotiation stage"
- "Log a call with Jane Smith about the enterprise deal"
- "What's the total value of deals expected to close this month?"

## Workflow States

### Deal Pipeline

```
     +-------------+
     |  discovery  |<---------+
     +------+------+          |
            |                 |
            | sendProposal    | reopen
            v                 |
     +------+------+          |
     |  proposal   |          |
     +------+------+          |
            |                 |
            | startNegotiation|
            v                 |
     +------+------+          |
     | negotiation |----------+
     +------+------+
         |       |
 winDeal |       | loseDeal
         v       v
     +---+---+ +-+----+
     |  won  | | lost |
     +-------+ +------+
```

### Contact Lifecycle

```
     +--------+
     |  lead  |
     +---+----+
         |
         | qualify
         v
     +---+-----+
     | prospect |
     +---+------+
         |
         | convert
         v
     +---+-----+     reactivate
     | customer |<--------------+
     +---+------+               |
         |                      |
         | churn                |
         v                      |
     +---+----+-----------------+
     | churned |
     +---------+
```

## File Structure

```
examples/crm/
  schema.yaml    # CRM schema definition
  README.md      # This documentation
  seed.ts        # Sample data generator
```

## License

MIT - Part of the SaaSkit project.
