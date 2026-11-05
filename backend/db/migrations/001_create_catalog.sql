-- 현재 카탈로그의 작품 단위는 애니메이션 시리즈, 하위 항목은 시즌이다.
-- works.tmdb_id는 TMDB TV 시리즈 ID이며, 시즌 ID나 영화 ID가 아니다.
-- 다른 매체를 도입할 때 매체 구분과 외부 ID의 고유성 범위를 확장한다.
BEGIN;

CREATE TABLE works (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    title TEXT NOT NULL,
    original_title TEXT,
    tmdb_id BIGINT,
    overview TEXT,
    poster_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT works_pkey PRIMARY KEY (id),
    CONSTRAINT works_title_not_blank CHECK (btrim(title) <> ''),
    CONSTRAINT works_tmdb_id_positive CHECK (tmdb_id > 0),
    CONSTRAINT works_tmdb_id_key UNIQUE (tmdb_id)
);

CREATE TABLE work_entries (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    work_id BIGINT NOT NULL,
    season_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    overview TEXT,
    poster_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT work_entries_pkey PRIMARY KEY (id),
    CONSTRAINT work_entries_work_id_fkey FOREIGN KEY (work_id)
        REFERENCES works (id) ON DELETE RESTRICT,
    -- TMDB의 시즌 0(스페셜)을 허용한다.
    CONSTRAINT work_entries_season_number_nonnegative CHECK (season_number >= 0),
    CONSTRAINT work_entries_title_not_blank CHECK (btrim(title) <> ''),
    CONSTRAINT work_entries_work_season_key UNIQUE (work_id, season_number)
);

-- UNIQUE (work_id, season_number)의 인덱스로 작품별 시즌 조회도 지원한다.
-- poster_path에는 이미지 파일 자체가 아니라 TMDB 이미지 경로 등을 저장한다.
-- 소개, 원제, 포스터, TMDB ID를 모를 때는 빈 문자열 대신 NULL을 사용한다.
COMMIT;
