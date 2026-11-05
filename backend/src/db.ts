import 'dotenv/config'
import pg from 'pg'

const port = Number(process.env.DB_PORT ?? 5432)

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('DB_PORT must be an integer between 1 and 65535')
}

export const pool = new pg.Pool({
  host: process.env.DB_HOST ?? 'localhost',
  port,
  database: process.env.DB_NAME ?? 'chagokkan_dev',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ?? '',
  connectionTimeoutMillis: 5000,
})

export function logDatabaseError(error: unknown): void {
  // Log only an error code, since error messages can contain connection details.
  const code = error instanceof Error && 'code' in error ? error.code : 'UNKNOWN'
  console.error('PostgreSQL connection/query failed', { code })
}

pool.on('error', logDatabaseError)
