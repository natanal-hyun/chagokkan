import { useEffect, useState } from 'react'

export interface Work {
  id: string
  title: string
  original_title: string | null
  tmdb_id: string | null
  overview: string | null
  poster_path: string | null
  created_at: string
}

export interface WorkEntry {
  id: string
  work_id: string
  season_number: number
  title: string
  overview: string | null
  poster_path: string | null
  created_at: string
}

export interface WorkDetail extends Work {
  entries: WorkEntry[]
}

export function useApi<T>(url: string) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<{ url: string; attempt: number; data: T | null; error: string | null; loading: boolean }>({ url, attempt, data: null, error: null, loading: true })
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) throw new Error(response.status === 404 ? '작품을 찾을 수 없어요.' : response.status === 400 ? '올바른 작품 주소가 아니에요.' : '작품을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')
        const data: T = await response.json()
        if (!controller.signal.aborted) setState({ url, attempt, data, loading: false, error: null })
      } catch (error) {
        if (!controller.signal.aborted) setState({ url, attempt, data: null, loading: false, error: error instanceof TypeError ? '서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.' : error instanceof Error ? error.message : '작품을 불러오지 못했어요.' })
      }
    }
    void load()
    return () => controller.abort()
  }, [url, attempt])
  const current = state.url === url && state.attempt === attempt
  return { data: current ? state.data : null, error: current ? state.error : null, loading: !current || state.loading, retry: () => setAttempt(value => value + 1) }
}
