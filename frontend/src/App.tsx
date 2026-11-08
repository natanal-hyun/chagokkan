import { useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useApi } from './api'
import type { Work, WorkDetail } from './api'
import './App.css'

function Poster({ path, title }: { path: string | null; title: string }) {
  const [failed, setFailed] = useState<string | null>(null)
  const source = path && (/^https?:\/\//.test(path) || path.startsWith('/')) ? path : null
  return <div className="poster">{source && failed !== source
    ? <img src={source} alt={`${title} 포스터`} onError={() => setFailed(source)} />
    : <div className="poster-placeholder" role="img" aria-label={`${title} 포스터 없음`}><span aria-hidden="true">冊</span><small>아직 표지가 없어요</small></div>}</div>
}

function RequestState({ loading, error, retry }: { loading: boolean; error: string | null; retry: () => void }) {
  if (loading) return <div className="notice" role="status">작품을 불러오고 있어요…</div>
  if (error) return <div className="notice" role="alert"><p>{error}</p><button onClick={retry}>다시 시도</button></div>
  return null
}

function Explore() {
  const { data: works, loading, error, retry } = useApi<Work[]>('/api/works')
  const [search, setSearch] = useState('')
  const query = search.trim().toLocaleLowerCase()
  const filtered = works?.filter(work => work.title.toLocaleLowerCase().includes(query)) ?? []
  return <>
    <div className="page-heading"><p className="eyebrow">EXPLORE THE STORIES</p><h1>다음 이야기를 찾아보세요.</h1><p>마음에 드는 작품을 만나고, 차곡차곡 알아가는 공간.</p></div>
    <section aria-label="작품 탐색">
      <div className="search-row"><div className="search-field"><label htmlFor="work-search">작품 제목 검색</label><input id="work-search" type="search" placeholder="어떤 이야기를 찾고 있나요?" value={search} onChange={event => setSearch(event.target.value)} /></div><span className="result-count" aria-live="polite">{!loading && !error && `${filtered.length}개의 작품`}</span></div>
      <RequestState loading={loading} error={error} retry={retry} />
      {!loading && !error && (filtered.length ? <ul className="work-grid">{filtered.map(work => <li key={work.id}>
        <Link className="work-card" to={`/works/${work.id}`}><Poster path={work.poster_path} title={work.title} /><div className="card-copy"><span className="eyebrow">애니메이션 시리즈</span><h2>{work.title}</h2><p>{work.overview?.trim() || '작품 소개가 아직 등록되지 않았어요.'}</p><span className="card-link">작품 살펴보기 ↗</span></div></Link>
      </li>)}</ul> : <div className="notice"><h2>{query ? '검색 결과가 없어요.' : '아직 등록된 작품이 없어요.'}</h2><p>{query ? '다른 제목으로 검색해 보세요.' : '새로운 이야기가 곧 이곳에 채워질 거예요.'}</p>{query && <button onClick={() => setSearch('')}>검색 초기화</button>}</div>)}
    </section>
  </>
}

function Detail() {
  const { id } = useParams()
  const { data: work, loading, error, retry } = useApi<WorkDetail>(`/api/works/${encodeURIComponent(id ?? '')}`)
  return <>
    <Link className="back-link" to="/explore">← 작품 탐색으로</Link>
    <RequestState loading={loading} error={error} retry={retry} />
    {!loading && !error && work && <>
      <article className="work-detail"><Poster path={work.poster_path} title={work.title} /><div className="detail-copy"><p className="eyebrow">애니메이션 시리즈</p><h1>{work.title}</h1>{work.original_title && <p className="original-title">{work.original_title}</p>}<h2>작품 소개</h2><p className="overview">{work.overview?.trim() || '작품 소개가 아직 등록되지 않았어요.'}</p><div className="library-action"><button disabled aria-describedby="library-note">내 서재에 추가 · 준비 중</button><p id="library-note">나만의 서재에 담는 기능을 준비하고 있어요.</p></div></div></article>
      <section className="season-section" aria-labelledby="season-heading"><div className="section-heading"><h2 id="season-heading">시즌 목록</h2><span>{work.entries.length}개 시즌</span></div>{work.entries.length ? <ol className="season-list">{work.entries.map(entry => <li key={entry.id}><span className="season-number">{entry.season_number === 0 ? 'SP' : String(entry.season_number).padStart(2, '0')}</span><div><h3>{entry.title}</h3><p>{entry.overview?.trim() || '시즌 소개가 아직 등록되지 않았어요.'}</p></div></li>)}</ol> : <p className="notice">등록된 시즌이 없어요.</p>}</section>
    </>}
  </>
}

function App() {
  return <BrowserRouter><div className="app-shell">
    <header className="site-header"><Link className="brand" to="/explore">차곡칸<span>CHAGOKKAN</span></Link><nav aria-label="주 메뉴"><Link to="/explore">작품 탐색</Link><span className="coming-soon">내 서재 <small>준비 중</small></span></nav></header>
    <main><Routes><Route path="/" element={<Navigate to="/explore" replace />} /><Route path="/explore" element={<Explore />} /><Route path="/works/:id" element={<Detail />} /><Route path="*" element={<div className="notice"><h1>페이지를 찾을 수 없어요.</h1><Link to="/explore">작품 탐색으로 이동</Link></div>} /></Routes></main>
    <footer>좋아하는 이야기가 쌓이는 곳, 차곡칸.</footer>
  </div></BrowserRouter>
}

export default App
