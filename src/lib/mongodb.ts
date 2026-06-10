import { MongoClient, Db } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local')
}

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'snaplink'

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectDB(): Promise<Db> {
  if (cachedClient && cachedDb) {
    return cachedDb
  }

  const client = new MongoClient(uri)
  await client.connect()
  
  const db = client.db(dbName)
  
  cachedClient = client
  cachedDb = db
  
  return db
}