/**
 * Seed Script for Todo App Example
 *
 * Generates sample data for demonstrating the todo app.
 * Run with: bun run seed.ts
 */

import { parseSchemaYaml, DataStore } from '../../packages/schema/src'
import { readFileSync } from 'fs'
import { join } from 'path'

// Types based on our schema
interface List {
  id: string
  name: string
  color?: string
  description?: string
  createdAt: Date
}

interface Todo {
  id: string
  title: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  createdAt: Date
  listId: string
}

// Sample data
const sampleLists: Omit<List, 'id' | 'createdAt'>[] = [
  {
    name: 'Work',
    color: '#3b82f6',
    description: 'Work-related tasks and projects',
  },
  {
    name: 'Personal',
    color: '#22c55e',
    description: 'Personal errands and goals',
  },
  {
    name: 'Shopping',
    color: '#f59e0b',
    description: 'Items to buy',
  },
]

const sampleTodos: { listIndex: number; data: Omit<Todo, 'id' | 'createdAt' | 'listId'> }[] = [
  // Work todos
  {
    listIndex: 0,
    data: {
      title: 'Review pull request #123',
      completed: false,
      priority: 'high',
      dueDate: addDays(new Date(), 1),
    },
  },
  {
    listIndex: 0,
    data: {
      title: 'Update API documentation',
      completed: false,
      priority: 'medium',
      dueDate: addDays(new Date(), 3),
    },
  },
  {
    listIndex: 0,
    data: {
      title: 'Deploy to staging environment',
      completed: true,
      priority: 'high',
      dueDate: addDays(new Date(), -1),
    },
  },
  {
    listIndex: 0,
    data: {
      title: 'Write unit tests for auth module',
      completed: false,
      priority: 'low',
    },
  },
  {
    listIndex: 0,
    data: {
      title: 'Address code review feedback',
      completed: true,
      priority: 'medium',
      dueDate: addDays(new Date(), -2),
    },
  },
  // Personal todos
  {
    listIndex: 1,
    data: {
      title: 'Schedule dentist appointment',
      completed: false,
      priority: 'medium',
      dueDate: addDays(new Date(), 7),
    },
  },
  {
    listIndex: 1,
    data: {
      title: 'Go for a 5K run',
      completed: false,
      priority: 'low',
    },
  },
  {
    listIndex: 1,
    data: {
      title: 'Read "The Pragmatic Programmer"',
      completed: false,
      priority: 'low',
    },
  },
  // Shopping todos
  {
    listIndex: 2,
    data: {
      title: 'Buy groceries',
      completed: false,
      priority: 'high',
      dueDate: addDays(new Date(), 0),
    },
  },
  {
    listIndex: 2,
    data: {
      title: 'Order new headphones',
      completed: true,
      priority: 'low',
    },
  },
  {
    listIndex: 2,
    data: {
      title: 'Pick up dry cleaning',
      completed: false,
      priority: 'medium',
      dueDate: addDays(new Date(), 2),
    },
  },
]

// Helper function to add days to a date
function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// Generate a simple ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 10)
}

// Main seed function
async function seed(): Promise<void> {
  console.log('Seeding todo app database...\n')

  // Load and parse the schema
  const schemaPath = join(import.meta.dir || __dirname, 'schema.yaml')
  const schemaYaml = readFileSync(schemaPath, 'utf-8')
  const schema = parseSchemaYaml(schemaYaml)
  const store = new DataStore(schema)

  // Create lists
  const createdLists: List[] = []
  for (const listData of sampleLists) {
    const list = store.create('List', listData) as unknown as List
    createdLists.push(list)
    console.log(`Created list: ${list.name} (${list.id})`)
  }

  console.log('')

  // Create todos
  for (const todoData of sampleTodos) {
    const list = createdLists[todoData.listIndex]
    const todo = store.create('Todo', {
      ...todoData.data,
      listId: list.id,
    }) as unknown as Todo
    const status = todo.completed ? '[x]' : '[ ]'
    console.log(`Created todo: ${status} ${todo.title} (${list.name})`)
  }

  console.log('\n--- Summary ---')
  console.log(`Lists: ${createdLists.length}`)
  console.log(`Todos: ${sampleTodos.length}`)
  console.log(`  - Completed: ${sampleTodos.filter((t) => t.data.completed).length}`)
  console.log(`  - Pending: ${sampleTodos.filter((t) => !t.data.completed).length}`)
  console.log(`  - High priority: ${sampleTodos.filter((t) => t.data.priority === 'high').length}`)
  console.log(`  - Medium priority: ${sampleTodos.filter((t) => t.data.priority === 'medium').length}`)
  console.log(`  - Low priority: ${sampleTodos.filter((t) => t.data.priority === 'low').length}`)

  // Output JSON for reference
  console.log('\n--- JSON Output ---')
  console.log(JSON.stringify({ lists: createdLists, todos: store.findAll('Todo') }, null, 2))
}

// Run seed
seed().catch(console.error)
