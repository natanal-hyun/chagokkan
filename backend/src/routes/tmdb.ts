import { Router } from 'express'

interface TmdbTvResult {
  id: number
  name: string
  original_name: string
  overview: string
  poster_path: string | null
  first_air_date: string
  genre_ids: number[]
  origin_country: string[]
}

interface TmdbTvSearchResponse {
  results?: TmdbTvResult[]
}

const TMDB_TV_SEARCH_URL = 'https://api.themoviedb.org/3/search/tv'

export const tmdbRouter = Router()

tmdbRouter.get('/search', async (req, res) => {
  const query = typeof req.query.query === 'string' ? req.query.query.trim() : ''

  if (!query) {
    res.status(400).json({ message: 'A non-empty query is required' })
    return
  }

  const token = process.env.TMDB_READ_ACCESS_TOKEN?.trim()
  if (!token) {
    console.error('TMDB search is unavailable: TMDB_READ_ACCESS_TOKEN is not configured')
    res.status(503).json({ message: 'TMDB search is unavailable' })
    return
  }

  const searchUrl = new URL(TMDB_TV_SEARCH_URL)
  searchUrl.searchParams.set('query', query)
  searchUrl.searchParams.set('language', 'ko-KR')
  searchUrl.searchParams.set('include_adult', 'false')
  searchUrl.searchParams.set('page', '1')

  try {
    const response = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(10_000),
    })

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('TMDB search rate limit exceeded')
        res.status(429).json({ message: 'TMDB rate limit exceeded' })
        return
      }

      if (response.status === 401) {
        console.error('TMDB search authentication failed')
        res.status(502).json({ message: 'TMDB authentication failed' })
        return
      }

      if (response.status >= 500) {
        console.error(`TMDB search upstream error: HTTP ${response.status}`)
        res.status(502).json({ message: 'TMDB service unavailable' })
        return
      }

      console.error(`TMDB search request failed: HTTP ${response.status}`)
      res.status(502).json({ message: 'TMDB search failed' })
      return
    }

    const data = (await response.json()) as TmdbTvSearchResponse
    const results = Array.isArray(data.results) ? data.results : []

    res.json(
      results.map(({ id, name, original_name, overview, poster_path, first_air_date, genre_ids, origin_country }) => ({
        id,
        name,
        original_name,
        overview,
        poster_path,
        first_air_date,
        genre_ids,
        origin_country,
      })),
    )
  } catch (error) {
    const errorType = error instanceof Error ? error.name : 'UnknownError'
    console.error(`TMDB search request error: ${errorType}`)
    res.status(503).json({ message: 'TMDB service unavailable' })
  }
})
