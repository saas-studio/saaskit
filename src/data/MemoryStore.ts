export interface DataRecord {
  id: string
  createdAt: Date
  updatedAt?: Date
  [key: string]: unknown
}

export class MemoryStore {
  private collections: Map<string, Map<string, DataRecord>>

  constructor() {
    this.collections = new Map()
  }

  private getCollection(collection: string): Map<string, DataRecord> {
    if (!this.collections.has(collection)) {
      this.collections.set(collection, new Map())
    }
    return this.collections.get(collection)!
  }

  async create(collection: string, data: object): Promise<DataRecord> {
    const col = this.getCollection(collection)
    const id = crypto.randomUUID()
    const record: DataRecord = {
      ...data,
      id,
      createdAt: new Date(),
    }
    col.set(id, record)
    return record
  }

  async list(collection: string): Promise<DataRecord[]> {
    const col = this.getCollection(collection)
    return Array.from(col.values())
  }

  async get(collection: string, id: string): Promise<DataRecord | null> {
    const col = this.getCollection(collection)
    return col.get(id) ?? null
  }

  async update(collection: string, id: string, data: object): Promise<DataRecord> {
    const col = this.getCollection(collection)
    const existing = col.get(id)
    if (!existing) {
      throw new Error(`Record with id ${id} not found in collection ${collection}`)
    }
    const updated: DataRecord = {
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
