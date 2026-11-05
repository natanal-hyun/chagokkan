import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { logDatabaseError, pool } from './db.js'

const app = express()
const port = Number(process.env.PORT ?? 3000)

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535')
}

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/db-health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok' })
  } catch (error) {
    logDatabaseError(error)
    res.status(503).json({ status: 'error', message: 'Database unavailable' })
  }
})

app.listen(port, () => {
  console.log(`Chagokkan API listening on http://localhost:${port}`)
})
