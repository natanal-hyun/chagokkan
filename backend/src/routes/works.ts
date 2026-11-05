import { Router } from 'express'
import { logDatabaseError, pool } from '../db.js'

interface Work {
  id: string
  title: string
  original_title: string | null
  tmdb_id: string | null
  overview: string | null
  poster_path: string | null
  created_at: Date
}

interface WorkEntry {
  id: string
  work_id: string
  season_number: number
  title: string
  overview: string | null
  poster_path: string | null
  created_at: Date
}

export const worksRouter = Router()

worksRouter.get('/', async (_req, res) => {
  try {
    const result = await pool.query<Work>(
      `SELECT id, title, original_title, tmdb_id, overview, poster_path, created_at
       FROM works
       ORDER BY id ASC`,
    )
    res.json(result.rows)
  } catch (error) {
    logDatabaseError(error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

worksRouter.get('/:id', async (req, res) => {
  const { id } = req.params

  // Validate before querying, including PostgreSQL BIGINT's upper bound.
  if (!/^[1-9]\d{0,18}$/.test(id) || BigInt(id) > 9223372036854775807n) {
    res.status(400).json({ message: 'Invalid work ID' })
    return
  }

  try {
    const result = await pool.query<Work>(
      `SELECT id, title, original_title, tmdb_id, overview, poster_path, created_at
       FROM works
       WHERE id = $1`,
      [id],
    )
    const work = result.rows[0]

    if (!work) {
      res.status(404).json({ message: 'Work not found' })
      return
    }

    const entries = await pool.query<WorkEntry>(
      `SELECT id, work_id, season_number, title, overview, poster_path, created_at
       FROM work_entries
       WHERE work_id = $1
       ORDER BY season_number ASC`,
      [id],
    )

    res.json({ ...work, entries: entries.rows })
  } catch (error) {
    logDatabaseError(error)
    res.status(500).json({ message: 'Internal server error' })
  }
})
