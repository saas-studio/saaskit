import { describe, it, expect } from 'vitest'
import { parseSchemaYaml } from '../yaml-parser'
import type { SaaSSchema } from '../types'

describe('YAML Schema Parser', () => {
  // ============================================================================
  // 1. App Metadata Parsing
  // ============================================================================

  describe('App metadata parsing', () => {
    it('should parse basic app metadata (name, description, version)', () => {
      const yaml = `
app:
  name: todos
  description: A simple todo list application
  version: 1.0.0
`
      const result = parseSchemaYaml(yaml)

      expect(result.metadata.name).toBe('todos')
      expect(result.metadata.description).toBe('A simple todo list application')
      expect(result.metadata.version).toBe('1.0.0')
    })

    it('should parse metadata key instead of app key', () => {
      const yaml = `
metadata:
  name: crm
  version: "1.0.0"
  description: "Customer Relationship Management"
`
      const result = parseSchemaYaml(yaml)

      expect(result.metadata.name).toBe('crm')
      expect(result.metadata.version).toBe('1.0.0')
      expect(result.metadata.description).toBe('Customer Relationship Management')
    })

    it('should parse optional metadata fields', () => {
      const yaml = `
app:
  name: blog
  displayName: Blog
  version: "1.0.0"
  description: A full-featured blog platform
  baseUrl: http://localhost:3000
  targets:
    cli: true
    api: true
    sdk: true
    mcp: true
`
      const result = parseSchemaYaml(yaml)

      expect(result.metadata.name).toBe('blog')
      expect(result.metadata.version).toBe('1.0.0')
      expect(result.metadata.description).toBe('A full-featured blog platform')
    })
  })

  // ============================================================================
  // 2. Resource Parsing
  // ============================================================================

  describe('Resource parsing', () => {
    it('should extract resource names from shorthand syntax', () => {
      const yaml = `
app:
  name: todos
  version: 1.0.0

resources:
  List:
    id: auto
    name: text

  Todo:
    id: auto
    title: text
`
      const result = parseSchemaYaml(yaml)

      expect(result.resources).toHaveLength(2)
      expect(result.resources[0].name).toBe('List')
      expect(result.resources[1].name).toBe('Todo')
    })

    it('should extract resource names from array syntax', () => {
      const yaml = `
metadata:
  name: crm
  version: "1.0.0"

resources:
  - name: Company
    pluralName: Companies
    description: "Organizations and business accounts"
    fields:
      - name: id
        type: uuid

  - name: Contact
    pluralName: Contacts
    description: "Individual contacts"
    fields:
      - name: id
        type: uuid
`
      const result = parseSchemaYaml(yaml)

      expect(result.resources).toHaveLength(2)
      expect(result.resources[0].name).toBe('Company')
      expect(result.resources[0].pluralName).toBe('Companies')
      expect(result.resources[0].description).toBe('Organizations and business accounts')
      expect(result.resources[1].name).toBe('Contact')
      expect(result.resources[1].pluralName).toBe('Contacts')
    })

    it('should extract resource names from lowercase key syntax', () => {
      const yaml = `
app:
  name: project-tracker
  version: 1.0.0

resources:
  users:
    fields:
      id:
        type: id
        auto: true
      name:
        type: string
        required: true

  projects:
    fields:
      id:
        type: id
        auto: true
      name:
        type: string
        required: true
`
      const result = parseSchemaYaml(yaml)

      expect(result.resources).toHaveLength(2)
      expect(result.resources[0].name).toBe('users')
      expect(result.resources[1].name).toBe('projects')
    })
  })

  // ============================================================================
  // 3. Field Type Parsing
  // ============================================================================

  describe('Field type parsing - basic types', () => {
    it('should parse text/string fields', () => {
      const yaml = `
app:
  name: test
  version: 1.0.0

resources:
  List:
    name: text
    description: string
`
      const result = parseSchemaYaml(yaml)
      const list = result.resources.find(r => r.name === 'List')!

      expect(list.fields).toHaveLength(2)
      expect(list.fields[0].name).toBe('name')
      expect(list.fields[0].type).toBe('string')
      expect(list.fields[1].name).toBe('description')
      expect(list.fields[1].type).toBe('string')
    })

    it('should parse boolean fields', () => {
      const yaml = `
app:
  name: test
  version: 1.0.0

resources:
  Todo:
    completed: boolean
    approved: boolean
`
      const result = parseSchemaYaml(yaml)
      const todo = result.resources.find(r => r.name === 'Todo')!

      expect(todo.fields[0].name).toBe('completed')
      expect(todo.fields[0].type).toBe('boolean')
      expect(todo.fields[1].name).toBe('approved')
      expect(todo.fields[1].type).toBe('boolean')
    })

    it('should parse date and datetime fields', () => {
      const yaml = `
app:
  name: test
  version: 1.0.0

resources:
  Event:
    dueDate: date
    startTime: datetime
    publishedAt: date
    closedAt: datetime
`
      const result = parseSchemaYaml(yaml)
      const event = result.resources.find(r => r.name === 'Event')!

      expect(event.fields[0].name).toBe('dueDate')
      expect(event.fields[0].type).toBe('date')
      expect(event.fields[1].name).toBe('startTime')
      expect(event.fields[1].type).toBe('datetime')
      expect(event.fields[2].name).toBe('publishedAt')
      expect(event.fields[2].type).toBe('date')
      expect(event.fields[3].name).toBe('closedAt')
      expect(event.fields[3].type).toBe('datetime')
    })

    it('should parse number fields', () => {
      const yaml = `
app:
  name: test
  version: 1.0.0

resources:
  Product:
    price: number
    quantity: number
`
      const result = parseSchemaYaml(yaml)
      const product = result.resources.find(r => r.name === 'Product')!

      expect(product.fields[0].name).toBe('price')
      expect(product.fields[0].type).toBe('number')
      expect(product.fields[1].name).toBe('quantity')
      expect(product.fields[1].type).toBe('number')
    })

    it('should parse email and url fields', () => {
      const yaml = `
app:
  name: test
  version: 1.0.0

resources:
  Author:
    email: email
    website: url
    avatar_url: url
`
      const result = parseSchemaYaml(yaml)
      const author = result.resources.find(r => r.name === 'Author')!

      expect(author.fields[0].name).toBe('email')
      expect(author.fields[0].type).toBe('email')
      expect(author.fields[1].name).toBe('website')
      expect(author.fields[1].type).toBe('url')
      expect(author.fields[2].name).toBe('avatar_url')
      expect(author.fields[2].type).toBe('url')
    })
  })

  describe('Field type parsing - auto fields', () => {
    it('should parse id: auto as uuid primary key', () => {
      const yaml = `
app:
  name: test
  version: 1.0.0

resources:
  List:
    id: auto
    name: text
`
      const result = parseSchemaYaml(yaml)
      const list = result.resources.find(r => r.name === 'List')!
      const idField = list.fields.find(f => f.name === 'id')!

      expect(idField.type).toBe('uuid')
      expect(idField.required).toBe(true)
      expect(idField.annotations?.primaryKey).toBe(true)
    })

    it('should parse createdAt: auto as datetime with auto timestamp', () => {
      const yaml = `
app:
  name: test
  version: 1.0.0

resources:
  Todo:
    id: auto
    title: text
    createdAt: auto
`
      const result = parseSchemaYaml(yaml)
      const todo = result.resources.find(r => r.name === 'Todo')!
      const createdField = todo.fields.find(f => f.name === 'createdAt')!

      expect(createdField.type).toBe('datetime')
      expect(createdField.required).toBe(true)
      expect(createdField.annotations?.readonly).toBe(true)
    })

    it('should parse updatedAt: auto as datetime with auto timestamp', () => {
      const yaml = `
app:
  name: test
  version: 1.0.0

resources:
  Project:
    id: auto
    name: text
    updatedAt: auto
`
      const result = parseSchemaYaml(yaml)
      const project = result.resources.find(r => r.name === 'Project')!
      const updatedField = project.fields.find(f => f.name === 'updatedAt')!

      expect(updatedField.type).toBe('datetime')
      expect(updatedField.required).toBe(true)
      expect(updatedField.annotations?.readonly).toBe(true)
    })

    it('should parse timestamp configuration in array syntax', () => {
      const yaml = `
metadata:
  name: test
  version: "1.0.0"

resources:
  - name: Company
    timestamps:
      createdAt: true
      updatedAt: true
    fields:
      - name: id
        type: uuid
`
      const result = parseSchemaYaml(yaml)
      const company = result.resources.find(r => r.name === 'Company')!

      expect(company.timestamps?.createdAt).toBe(true)
      expect(company.timestamps?.updatedAt).toBe(true)
    })
  })

  describe('Field type parsing - optional fields', () => {
    it('should parse optional fields with ? suffix', () => {
      const yaml = `
app:
  name: test
  version: 1.0.0

resources:
  List:
    id: auto
    name: text
    color?: text
    description?: text
`
      const result = parseSchemaYaml(yaml)
      const list = result.resources.find(r => r.name === 'List')!

      const nameField = list.fields.find(f => f.name === 'name')!
      const colorField = list.fields.find(f => f.name === 'color')!
      const descField = list.fields.find(f => f.name === 'description')!

      expect(nameField.required).toBe(true)
      expect(colorField.required).toBe(false)
      expect(descField.required).toBe(false)
    })

    it('should parse required field in array syntax', () => {
      const yaml = `
metadata:
  name: test
  version: "1.0.0"

resources:
  - name: Contact
    fields:
      - name: name
        type: string
        required: true
      - name: phone
        type: string
        required: false
`
      const result = parseSchemaYaml(yaml)
      const contact = result.resources.find(r => r.name === 'Contact')!

      const nameField = contact.fields.find(f => f.name === 'name')!
      const phoneField = contact.fields.find(f => f.name === 'phone')!

      expect(nameField.required).toBe(true)
      expect(phoneField.required).toBe(false)
    })
  })

  describe('Field type parsing - enum fields', () => {
    it('should parse enum with pipe separator in shorthand syntax', () => {
      const yaml = `
app:
  name: test
  version: 1.0.0

resources:
  Todo:
    id: auto
    priority: low | medium | high
    status: draft | published | archived
`
      const result = parseSchemaYaml(yaml)
      const todo = result.resources.find(r => r.name === 'Todo')!

      const priorityField = todo.fields.find(f => f.name === 'priority')!
      expect(priorityField.type).toBe('enum')
      expect(priorityField.annotations?.enumValues).toEqual(['low', 'medium', 'high'])

      const statusField = todo.fields.find(f => f.name === 'status')!
      expect(statusField.type).toBe('enum')
      expect(statusField.annotations?.enumValues).toEqual(['draft', 'published', 'archived'])
    })

    it('should parse enum with select type and values in object syntax', () => {
      const yaml = `
app:
  name: test
  version: 1.0.0

resources:
  Post:
    status:
      type: select
      values:
        - draft
        - published
        - archived
      default: draft
`
      const result = parseSchemaYaml(yaml)
      const post = result.resources.find(r => r.name === 'Post')!

      const statusField = post.fields.find(f => f.name === 'status')!
      expect(statusField.type).toBe('enum')
      expect(statusField.annotations?.enumValues).toEqual(['draft', 'published', 'archived'])
      expect(statusField.default).toBe('draft')
    })

    it('should parse enum with options in object syntax', () => {
      const yaml = `
app:
  name: test
  version: 1.0.0

resources:
  Task:
    priority:
      type: select
      options:
        - P0
        - P1
        - P2
        - P3
      default: P2
`
      const result = parseSchemaYaml(yaml)
      const task = result.resources.find(r => r.name === 'Task')!

      const priorityField = task.fields.find(f => f.name === 'priority')!
      expect(priorityField.type).toBe('enum')
      expect(priorityField.annotations?.enumValues).toEqual(['P0', 'P1', 'P2', 'P3'])
      expect(priorityField.default).toBe('P2')
    })

    it('should parse enum in array syntax with enumValues annotation', () => {
      const yaml = `
metadata:
  name: test
  version: "1.0.0"

resources:
  - name: Company
    fields:
      - name: size
        type: enum
        required: false
        annotations:
          enumValues:
            - small
            - medium
            - enterprise
`
      const result = parseSchemaYaml(yaml)
      const company = result.resources.find(r => r.name === 'Company')!

      const sizeField = company.fields.find(f => f.name === 'size')!
      expect(sizeField.type).toBe('enum')
      expect(sizeField.annotations?.enumValues).toEqual(['small', 'medium', 'enterprise'])
    })
  })

  // ============================================================================
  // 4. Relation Parsing
  // ============================================================================

  describe('Relation parsing - belongsTo', () => {
    it('should parse belongsTo relation with -> syntax', () => {
      const yaml = `
app:
  name: test
  version: 1.0.0

resources:
  List:
    id: auto
    name: text

  Todo:
    id: auto
    title: text
    list: ->List
`
      const result = parseSchemaYaml(yaml)
      const todo = result.resources.find(r => r.name === 'Todo')!

      expect(todo.relations).toHaveLength(1)
      expect(todo.relations[0].name).toBe('list')
      expect(todo.relations[0].to).toBe('List')
      expect(todo.relations[0].cardinality).toBe('one')
      expect(todo.relations[0].required).toBe(true)
    })

    it('should parse optional belongsTo relation', () => {
      const yaml = `
app:
  name: test
  version: 1.0.0

resources:
  Company:
    id: auto
    name: text

  Contact:
    id: auto
    name: text
    company?: ->Company
`
      const result = parseSchemaYaml(yaml)
      const contact = result.resources.find(r => r.name === 'Contact')!

      expect(contact.relations).toHaveLength(1)
      expect(contact.relations[0].name).toBe('company')
      expect(contact.relations[0].to).toBe('Company')
      expect(contact.relations[0].cardinality).toBe('one')
      expect(contact.relations[0].required).toBe(false)
    })

    it('should parse relation in array syntax', () => {
      const yaml = `
metadata:
  name: test
  version: "1.0.0"

resources:
  - name: Contact
    fields:
      - name: id
        type: uuid
    relations:
      - name: company
        to: Company
        cardinality: one
        foreignKey: companyId
        required: false
        inverse: contacts
        onDelete: setNull
`
      const result = parseSchemaYaml(yaml)
      const contact = result.resources.find(r => r.name === 'Contact')!

      expect(contact.relations).toHaveLength(1)
      expect(contact.relations[0].name).toBe('company')
      expect(contact.relations[0].to).toBe('Company')
      expect(contact.relations[0].cardinality).toBe('one')
      expect(contact.relations[0].foreignKey).toBe('companyId')
      expect(contact.relations[0].required).toBe(false)
      expect(contact.relations[0].inverse).toBe('contacts')
      expect(contact.relations[0].onDelete).toBe('setNull')
    })

    it('should parse relation field in object syntax with type: relation', () => {
      const yaml = `
app:
  name: test
  version: 1.0.0

resources:
  Post:
    author_id:
      type: relation
      target: Author
      required: true
`
      const result = parseSchemaYaml(yaml)
      const post = result.resources.find(r => r.name === 'Post')!

      expect(post.relations).toHaveLength(1)
      expect(post.relations[0].name).toBe('author_id')
      expect(post.relations[0].to).toBe('Author')
      expect(post.relations[0].cardinality).toBe('one')
      expect(post.relations[0].required).toBe(true)
    })

    it('should parse relation in nested fields object syntax', () => {
      const yaml = `
app:
  name: test
  version: 1.0.0

resources:
  tasks:
    fields:
      id:
        type: id
        auto: true
      project_id:
        type: relation
        to: projects
        required: true
`
      const result = parseSchemaYaml(yaml)
      const tasks = result.resources.find(r => r.name === 'tasks')!

      expect(tasks.relations).toHaveLength(1)
      expect(tasks.relations[0].name).toBe('project_id')
      expect(tasks.relations[0].to).toBe('projects')
      expect(tasks.relations[0].required).toBe(true)
    })
  })

  describe('Relation parsing - hasMany (implicit)', () => {
    it('should infer hasMany relation from belongsTo with inverse', () => {
      const yaml = `
metadata:
  name: test
  version: "1.0.0"

resources:
  - name: List
    fields:
      - name: id
        type: uuid
    relations: []

  - name: Todo
    fields:
      - name: id
        type: uuid
    relations:
      - name: list
        to: List
        cardinality: one
        inverse: todos
`
      const result = parseSchemaYaml(yaml)
      const list = result.resources.find(r => r.name === 'List')!

      // The inverse relation should be added automatically
      // This is inferred from the inverse property
      expect(list.relations).toHaveLength(1)
      expect(list.relations[0].name).toBe('todos')
      expect(list.relations[0].to).toBe('Todo')
      expect(list.relations[0].cardinality).toBe('many')
    })
  })

  describe('Relation parsing - manyToMany with junction tables', () => {
    it('should parse many-to-many junction table pattern', () => {
      const yaml = `
app:
  name: test
  version: 1.0.0

resources:
  Post:
    id: auto
    title: text

  Tag:
    id: auto
    name: text

  PostTag:
    id: auto
    post_id: ->Post
    tag_id: ->Tag
`
      const result = parseSchemaYaml(yaml)
      const postTag = result.resources.find(r => r.name === 'PostTag')!

      expect(postTag.relations).toHaveLength(2)

      const postRel = postTag.relations.find(r => r.name === 'post_id')!
      expect(postRel.to).toBe('Post')
      expect(postRel.cardinality).toBe('one')

      const tagRel = postTag.relations.find(r => r.name === 'tag_id')!
      expect(tagRel.to).toBe('Tag')
      expect(tagRel.cardinality).toBe('one')
    })

    it('should recognize junction table with relation type fields', () => {
      const yaml = `
app:
  name: test
  version: 1.0.0

resources:
  task_labels:
    id: auto
    task_id:
      type: relation
      target: tasks
      required: true
    label_id:
      type: relation
      target: labels
      required: true
`
      const result = parseSchemaYaml(yaml)
      const taskLabels = result.resources.find(r => r.name === 'task_labels')!

      expect(taskLabels.relations).toHaveLength(2)
      expect(taskLabels.relations[0].to).toBe('tasks')
      expect(taskLabels.relations[1].to).toBe('labels')
    })
  })

  // ============================================================================
  // 5. Complex Patterns
  // ============================================================================

  describe('Complex patterns - multiple relations', () => {
    it('should parse resource with multiple belongsTo relations', () => {
      const yaml = `
metadata:
  name: test
  version: "1.0.0"

resources:
  - name: Deal
    fields:
      - name: id
        type: uuid
    relations:
      - name: contact
        to: Contact
        cardinality: one
        required: true
        inverse: deals
      - name: company
        to: Company
        cardinality: one
        required: false
        inverse: deals
`
      const result = parseSchemaYaml(yaml)
      const deal = result.resources.find(r => r.name === 'Deal')!

      expect(deal.relations).toHaveLength(2)

      const contactRel = deal.relations.find(r => r.name === 'contact')!
      expect(contactRel.to).toBe('Contact')
      expect(contactRel.required).toBe(true)

      const companyRel = deal.relations.find(r => r.name === 'company')!
      expect(companyRel.to).toBe('Company')
      expect(companyRel.required).toBe(false)
    })

    it('should parse complex resource from real CRM example', () => {
      const yaml = `
metadata:
  name: crm
  version: "1.0.0"

resources:
  - name: Activity
    description: "Logged interactions"
    fields:
      - name: id
        type: uuid
        required: true
      - name: type
        type: enum
        required: true
        annotations:
          enumValues:
            - call
            - email
            - meeting
            - note
      - name: subject
        type: string
        required: false
      - name: date
        type: datetime
        required: true
    relations:
      - name: contact
        to: Contact
        cardinality: one
        required: true
        inverse: activities
        onDelete: cascade
      - name: deal
        to: Deal
        cardinality: one
        required: false
        inverse: activities
        onDelete: setNull
`
      const result = parseSchemaYaml(yaml)
      const activity = result.resources.find(r => r.name === 'Activity')!

      expect(activity.fields).toHaveLength(4)
      expect(activity.relations).toHaveLength(2)

      const typeField = activity.fields.find(f => f.name === 'type')!
      expect(typeField.type).toBe('enum')
      expect(typeField.annotations?.enumValues).toEqual(['call', 'email', 'meeting', 'note'])

      const contactRel = activity.relations.find(r => r.name === 'contact')!
      expect(contactRel.onDelete).toBe('cascade')

      const dealRel = activity.relations.find(r => r.name === 'deal')!
      expect(dealRel.onDelete).toBe('setNull')
    })
  })

  describe('Complex patterns - workflows', () => {
    it('should parse workflow with states and transitions', () => {
      const yaml = `
metadata:
  name: test
  version: "1.0.0"

resources:
  - name: Deal
    fields:
      - name: id
        type: uuid

workflows:
  - name: dealPipeline
    resource: Deal
    stateField: stage
    description: "Sales deal progression"
    states:
      - name: discovery
        description: "Initial discovery"
        initial: true
      - name: won
        description: "Deal closed"
        final: true
    transitions:
      - name: winDeal
        from: discovery
        to: won
        trigger: manual
        actions:
          - setClosedDate
`
      const result = parseSchemaYaml(yaml)

      expect(result.workflows).toBeDefined()
      expect(result.workflows).toHaveLength(1)

      const workflow = result.workflows![0]
      expect(workflow.name).toBe('dealPipeline')
      expect(workflow.resource).toBe('Deal')
      expect(workflow.stateField).toBe('stage')
      expect(workflow.states).toHaveLength(2)
      expect(workflow.transitions).toHaveLength(1)

      const initialState = workflow.states.find(s => s.initial)!
      expect(initialState.name).toBe('discovery')

      const finalState = workflow.states.find(s => s.final)!
      expect(finalState.name).toBe('won')

      const transition = workflow.transitions[0]
      expect(transition.from).toBe('discovery')
      expect(transition.to).toBe('won')
      expect(transition.trigger).toBe('manual')
    })

    it('should parse workflow with onEnter actions', () => {
      const yaml = `
metadata:
  name: test
  version: "1.0.0"

workflows:
  - name: contactLifecycle
    resource: Contact
    stateField: status
    states:
      - name: lead
        initial: true
      - name: customer
        onEnter:
          - sendWelcomeEmail
          - createAccount
    transitions:
      - name: convert
        from: lead
        to: customer
        trigger: manual
`
      const result = parseSchemaYaml(yaml)
      const workflow = result.workflows![0]

      const customerState = workflow.states.find(s => s.name === 'customer')!
      expect(customerState.onEnter).toEqual(['sendWelcomeEmail', 'createAccount'])
    })
  })

  describe('Complex patterns - validation constraints', () => {
    it('should parse field validation constraints', () => {
      const yaml = `
metadata:
  name: test
  version: "1.0.0"

resources:
  - name: Deal
    fields:
      - name: value
        type: number
        required: false
        annotations:
          min: 0
      - name: probability
        type: number
        required: false
        annotations:
          min: 0
          max: 100
`
      const result = parseSchemaYaml(yaml)
      const deal = result.resources.find(r => r.name === 'Deal')!

      const valueField = deal.fields.find(f => f.name === 'value')!
      expect(valueField.annotations?.min).toBe(0)

      const probField = deal.fields.find(f => f.name === 'probability')!
      expect(probField.annotations?.min).toBe(0)
      expect(probField.annotations?.max).toBe(100)
    })

    it('should parse string pattern validation', () => {
      const yaml = `
app:
  name: test
  version: 1.0.0

resources:
  Post:
    slug:
      type: text
      pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$"
    title:
      type: text
      min: 1
      max: 200
`
      const result = parseSchemaYaml(yaml)
      const post = result.resources.find(r => r.name === 'Post')!

      const slugField = post.fields.find(f => f.name === 'slug')!
      expect(slugField.annotations?.pattern).toBe('^[a-z0-9]+(?:-[a-z0-9]+)*$')

      const titleField = post.fields.find(f => f.name === 'title')!
      expect(titleField.annotations?.min).toBe(1)
      expect(titleField.annotations?.max).toBe(200)
    })

    it('should parse unique and indexed annotations in array syntax', () => {
      const yaml = `
metadata:
  name: test
  version: "1.0.0"

resources:
  - name: Contact
    fields:
      - name: email
        type: email
        required: true
        annotations:
          unique: true
          indexed: true
      - name: name
        type: string
        annotations:
          searchable: true
          indexed: true
`
      const result = parseSchemaYaml(yaml)
      const contact = result.resources.find(r => r.name === 'Contact')!

      const emailField = contact.fields.find(f => f.name === 'email')!
      expect(emailField.annotations?.unique).toBe(true)
      expect(emailField.annotations?.indexed).toBe(true)

      const nameField = contact.fields.find(f => f.name === 'name')!
      expect(nameField.annotations?.searchable).toBe(true)
      expect(nameField.annotations?.indexed).toBe(true)
    })

    it('should parse unique constraint in object syntax', () => {
      const yaml = `
app:
  name: test
  version: 1.0.0

resources:
  Author:
    email:
      type: email
      required: true
      unique: true
`
      const result = parseSchemaYaml(yaml)
      const author = result.resources.find(r => r.name === 'Author')!

      const emailField = author.fields.find(f => f.name === 'email')!
      expect(emailField.annotations?.unique).toBe(true)
    })
  })

  // ============================================================================
  // 6. Error Handling
  // ============================================================================

  describe('Error handling', () => {
    it('should throw error on invalid YAML syntax', () => {
      // Truly invalid YAML with unclosed braces
      const yaml = `
app: {
  name: test
  version: 1.0.0
`
      expect(() => parseSchemaYaml(yaml)).toThrow()
    })

    it('should throw error when app metadata is missing', () => {
      const yaml = `
resources:
  List:
    id: auto
    name: text
`
      expect(() => parseSchemaYaml(yaml)).toThrow(/metadata|app/)
    })

    it('should throw error when app name is missing', () => {
      const yaml = `
app:
  version: 1.0.0
  description: Missing name

resources:
  List:
    id: auto
`
      expect(() => parseSchemaYaml(yaml)).toThrow(/name/)
    })

    it('should throw error when app version is missing', () => {
      const yaml = `
app:
  name: test
  description: Missing version

resources:
  List:
    id: auto
`
      expect(() => parseSchemaYaml(yaml)).toThrow(/version/)
    })

    it('should throw error on invalid field type', () => {
      const yaml = `
app:
  name: test
  version: 1.0.0

resources:
  List:
    id: invalidType
`
      expect(() => parseSchemaYaml(yaml)).toThrow(/type/)
    })

    it('should allow relations to resources defined later (lazy validation)', () => {
      // The parser is lenient and allows forward references
      // Validation of relation targets is done at runtime, not parse time
      const yaml = `
app:
  name: test
  version: 1.0.0

resources:
  Todo:
    id: auto
    list: ->List
  List:
    id: auto
    name: text
`
      const result = parseSchemaYaml(yaml)
      expect(result.resources).toHaveLength(2)
      expect(result.resources[0].relations[0].to).toBe('List')
    })

    it('should throw error on duplicate resource names (YAML level)', () => {
      // Note: YAML itself catches duplicate keys before our parser
      const yaml = `
app:
  name: test
  version: 1.0.0

resources:
  List:
    id: auto

  List:
    id: auto
    name: text
`
      // YAML parser throws for duplicate keys
      expect(() => parseSchemaYaml(yaml)).toThrow(/unique|duplicate/i)
    })

    it('should allow empty resources section', () => {
      // Parser is lenient and allows schemas with no resources
      const yaml = `
app:
  name: test
  version: 1.0.0

resources: []
`
      const result = parseSchemaYaml(yaml)
      expect(result.resources).toHaveLength(0)
    })
  })

  // ============================================================================
  // 7. Real-world Integration Tests
  // ============================================================================

  describe('Integration - Todo app schema', () => {
    it('should parse complete todo schema correctly', () => {
      const yaml = `
app:
  name: todos
  description: A simple todo list application
  version: 1.0.0

resources:
  List:
    id: auto
    name: text
    color?: text
    description?: text
    createdAt: auto

  Todo:
    id: auto
    title: text
    completed: boolean
    priority: low | medium | high
    dueDate?: date
    createdAt: auto
    list: ->List
`
      const result = parseSchemaYaml(yaml)

      expect(result.metadata.name).toBe('todos')
      expect(result.resources).toHaveLength(2)

      const list = result.resources.find(r => r.name === 'List')!
      expect(list.fields).toHaveLength(5)

      const todo = result.resources.find(r => r.name === 'Todo')!
      // 6 fields: id, title, completed, priority, dueDate, createdAt
      // list is a relation, not a field
      expect(todo.fields).toHaveLength(6)
      expect(todo.relations).toHaveLength(1)

      const priorityField = todo.fields.find(f => f.name === 'priority')!
      expect(priorityField.type).toBe('enum')
      expect(priorityField.annotations?.enumValues).toEqual(['low', 'medium', 'high'])
    })
  })

  describe('Integration - Blog schema', () => {
    it('should parse blog schema with many-to-many relations', () => {
      const yaml = `
app:
  name: blog
  version: "1.0.0"
  description: Blog platform

resources:
  - name: Author
    fields:
      - name: id
        type: text
        modifiers:
          auto: true
          primary: true
      - name: name
        type: text
        modifiers:
          required: true
      - name: email
        type: email
        modifiers:
          required: true
          unique: true

  - name: Post
    fields:
      - name: id
        type: text
        modifiers:
          auto: true
          primary: true
      - name: title
        type: text
        modifiers:
          required: true
      - name: status
        type: select
        modifiers:
          required: true
        values:
          - draft
          - published
          - archived
        default: draft
      - name: author_id
        type: relation
        modifiers:
          required: true
        target: Author

  - name: Tag
    fields:
      - name: id
        type: text
        modifiers:
          auto: true
          primary: true
      - name: name
        type: text
        modifiers:
          required: true

  - name: PostTag
    fields:
      - name: id
        type: text
        modifiers:
          auto: true
          primary: true
      - name: post_id
        type: relation
        modifiers:
          required: true
        target: Post
      - name: tag_id
        type: relation
        modifiers:
          required: true
        target: Tag
`
      const result = parseSchemaYaml(yaml)

      expect(result.resources).toHaveLength(4)

      const post = result.resources.find(r => r.name === 'Post')!
      expect(post.relations).toHaveLength(1)
      expect(post.relations[0].to).toBe('Author')

      const statusField = post.fields.find(f => f.name === 'status')!
      expect(statusField.type).toBe('enum')
      expect(statusField.default).toBe('draft')

      const postTag = result.resources.find(r => r.name === 'PostTag')!
      expect(postTag.relations).toHaveLength(2)
    })
  })

  describe('Integration - Project Tracker schema', () => {
    it('should parse project tracker with nested fields syntax', () => {
      const yaml = `
app:
  name: project-tracker
  description: Kanban project management
  version: 1.0.0

resources:
  projects:
    fields:
      id:
        type: id
        auto: true
      name:
        type: string
        required: true
      status:
        type: select
        options:
          - active
          - completed
          - on_hold
        default: active

  tasks:
    fields:
      id:
        type: id
        auto: true
      title:
        type: string
        required: true
      status:
        type: select
        options:
          - backlog
          - todo
          - in_progress
          - review
          - done
        default: backlog
      priority:
        type: select
        options:
          - P0
          - P1
          - P2
          - P3
        default: P2
      project_id:
        type: relation
        to: projects
        required: true
`
      const result = parseSchemaYaml(yaml)

      expect(result.resources).toHaveLength(2)

      const projects = result.resources.find(r => r.name === 'projects')!
      const statusField = projects.fields.find(f => f.name === 'status')!
      expect(statusField.type).toBe('enum')
      expect(statusField.annotations?.enumValues).toEqual(['active', 'completed', 'on_hold'])

      const tasks = result.resources.find(r => r.name === 'tasks')!
      expect(tasks.relations).toHaveLength(1)
      expect(tasks.relations[0].to).toBe('projects')

      const priorityField = tasks.fields.find(f => f.name === 'priority')!
      expect(priorityField.annotations?.enumValues).toEqual(['P0', 'P1', 'P2', 'P3'])
    })
  })

  describe('Integration - CRM with workflows', () => {
    it('should parse CRM schema with full workflow definitions', () => {
      const yaml = `
metadata:
  name: crm
  version: "1.0.0"

resources:
  - name: Deal
    fields:
      - name: id
        type: uuid
        required: true
      - name: stage
        type: enum
        required: true
        default: "discovery"
        annotations:
          enumValues:
            - discovery
            - proposal
            - negotiation
            - won
            - lost

workflows:
  - name: dealPipeline
    resource: Deal
    stateField: stage
    description: "Sales deal progression workflow"
    states:
      - name: discovery
        description: "Initial discovery"
        initial: true
      - name: proposal
        description: "Proposal sent"
      - name: negotiation
        description: "Negotiating terms"
      - name: won
        description: "Deal won"
        final: true
        onEnter:
          - updateContactToCustomer
      - name: lost
        description: "Deal lost"
        final: true
    transitions:
      - name: sendProposal
        from: discovery
        to: proposal
        trigger: manual
      - name: startNegotiation
        from: proposal
        to: negotiation
        trigger: manual
      - name: winDeal
        from: negotiation
        to: won
        trigger: manual
        actions:
          - setClosedDate
      - name: loseDeal
        from: negotiation
        to: lost
        trigger: manual
        actions:
          - setClosedDate
      - name: reopen
        from: lost
        to: discovery
        trigger: manual
`
      const result = parseSchemaYaml(yaml)

      expect(result.workflows).toHaveLength(1)

      const workflow = result.workflows![0]
      expect(workflow.name).toBe('dealPipeline')
      expect(workflow.states).toHaveLength(5)
      expect(workflow.transitions).toHaveLength(5)

      const wonState = workflow.states.find(s => s.name === 'won')!
      expect(wonState.final).toBe(true)
      expect(wonState.onEnter).toEqual(['updateContactToCustomer'])

      const winTransition = workflow.transitions.find(t => t.name === 'winDeal')!
      expect(winTransition.from).toBe('negotiation')
      expect(winTransition.to).toBe('won')
      expect(winTransition.actions).toEqual(['setClosedDate'])
    })
  })
})
