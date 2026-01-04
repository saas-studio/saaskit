export interface Record {
  id: string
  createdAt: Date
  updatedAt?: Date
  [key: string]: unknown
}

export class MemoryStore {
  private collections: Map<string, Map<string, Record>>

  constructor() {
    this.collections = new Map()
  }

  private getCollection(collection: string): Map<string, Record> {
    if (!this.collections.has(collection)) {
      this.collections.set(collection, new Map())
    }
    return this.collections.get(collection)!
  }

  async create(collection: string, data: object): Promise<Record> {
    const col = this.getCollection(collection)
    const id = crypto.randomUUID()
    const record: Record = {
      ...data,
      id,
      createdAt: new Date(),
    }
    col.set(id, record)
    return record
  }

  async list(collection: string): Promise<Record[]> {
    const col = this.getCollection(collection)
    return Array.from(col.values())
  }

  async get(collection: string, id: string): Promise<Record | null> {
    const col = this.getCollection(collection)
    return col.get(id) ?? null
  }

  async update(collection: string, id: string, data: object): Promise<Record> {
    const col = this.getCollection(collection)
    const existing = col.get(id)
    if (!existing) {
      throw new Error(`Record with id ${id} not found in collection ${collection}`)
    }
    const updated: Record = {
      ...existing,
      ...data,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    }
    col.set(id, updated)
    return updated
  }

  async delete(collection: string, id: string): Promise<void> {
    const col = this.getCollection(collection)
    col.delete(id)
  }
}
