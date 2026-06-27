# PROGRESS — panorama-korea

> 완료 내역 append-only. 최신이 위.

## 2026-06-27 — v0.1.1 빌드업 (`599f0b8`)

### Phase 2: 반응형 layout 적용
- `app/page.tsx` Dashboard Container 반응형 변경
  - portrait/mobile: 시계 위 35% + 콘텐츠 아래 65%, full-height
  - landscape (iPad/desktop): 시계 좌 45% + 콘텐츠 우 55%, full-height
  - 32:9 super-wide (`aspect-ratio ≥ 32/9`): 기존 1920x540 letterbox 유지
- gap·padding 점진 증가 (`gap-3 p-3 sm:gap-4 sm:p-4 md:gap-5 md:p-6`)
- 스와이프 로직 유지 — 콘텐츠 영역 내부에서만 감지

### Phase 1: 데이터 신뢰성 + 보안
- **Finance API 전면 교체** (`app/api/finance/route.ts`)
  - SerpAPI google_finance는 KOSPI/KOSDAQ 미반환 (`finance_results_state: "Fully empty"` 검증)
  - Yahoo Finance 비공식 API(`query1.finance.yahoo.com/v8/finance/chart`) 도입 — 키 불요
  - 5개 항목 병렬 fetch + 6초 타임아웃 + 천 단위 콤마 포맷
  - 실측 확인: KOSPI=8,411 / KOSDAQ=851 / USD/KRW=1,535 / S&P=7,354 / NASDAQ=25,298
- **보안 fix**: `NEXT_PUBLIC_NAVER_CLIENT_SECRET` → `NAVER_CLIENT_SECRET`
  - 브라우저 번들 노출 차단
  - 코드는 새 변수 우선 + 구 변수 fallback (하위 호환)
  - `.env.local` 키 이름도 변경
- **mock 표시 배지**
  - NewsWidget·FinanceWidget 헤더에 `📡 샘플` 노란 배지
  - 조건: API 응답 `source === 'mock'` 또는 클라이언트 fetch 실패
  - tooltip으로 원인 안내
- **dead code 정리**
  - page.tsx: `MAJOR_CITIES`/`CityName` import, `financeDataSources`, `screenWidth` 제거
  - NewsWidget.tsx: `getNews` 미사용 import 제거
  - FinanceWidget.tsx: `getTypeLabel` 미사용 함수 제거
  - news/route.ts: `handleNaverNews`의 `source` 미사용 파라미터 제거

### 기타
- CLAUDE.md 전면 재생성 (1/27판 → 6/27판). Next.js 16.1.5/React 19.2/Tailwind v4 현실 반영, bkend mock 상태, CITY_NAME_MAP 중복, 위젯 추가 시 3곳 동기 등 함정 명시. 기존본 `CLAUDE.md.bak.20260627` 백업
- `npm install` — `eslint-scope`, `source-map-js` 누락 등 node_modules 손상 복구
- 빌드: Next.js 16.1.5 Turbopack, 5 routes (1 static + 4 edge), tsc clean
- Push: origin/main `1f15b15..599f0b8` (자동 push, ff + 빌드 green + 1커밋)

### 검증 (curl 직접 호출)
- 네이버 뉴스 API: HTTP 200, 실데이터 수신 — 키 유효
- SerpAPI Google Finance KOSPI: HTTP 200, `"Fully empty"` — 쿼리 형식 무효
- SerpAPI Google Finance QQQ:NASDAQ: HTTP 200, $706.52 — 일부 US 종목만 작동
- Yahoo Finance ^KS11/^KQ11/KRW=X/^GSPC/^IXIC: 모두 실데이터

### 미해결
- iPad 실측 — 의장 직접
- 네이버 시크릿 재발급 (이전 commit 노출)
- Phase 3/4/5 (디자인 시스템, 모션, 콘텐츠 풍부함) — PLAN.md 참조
