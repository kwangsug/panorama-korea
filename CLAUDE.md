# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Panorama Korea — 32:9 와이드 스마트 디스플레이 웹앱(1920x540, 황금비 45:55 분할). 왼쪽은 시계, 오른쪽은 5개 위젯(weather → news → jobs → calendar → finance)이 세로 스와이프 또는 자동 순환으로 전환된다. 원본은 일본판 Panorama(https://panorama-2ps.pages.dev/).

## 명령어

```bash
npm run dev      # 개발 서버 — 포트 3500 (next.config.ts 기본값 아님, package.json scripts에 -p 3500 명시)
npm run build    # 프로덕션 빌드
npm run start    # 빌드 산출물 실행
npm run lint     # ESLint (eslint-config-next 기반)
```

테스트 스크립트는 정의되어 있지 않다. 추가할 경우 package.json `scripts`에 등록 후 사용.

타입체크는 `npx tsc --noEmit` (tsconfig는 `noEmit: true`, strict 모드).

## 아키텍처 — 큰 그림

### 1. 단일 페이지 + 5뷰 순환 구조

전체 UX가 `app/page.tsx` 한 파일(674줄)에 집중되어 있다. 라우팅은 없다 — `currentView` 상태가 5개 위젯 중 어떤 것을 활성화할지 결정한다:

```
VIEWS = ['weather', 'news', 'jobs', 'calendar', 'finance']
```

전환 방식:
- **자동**: `autoSwitchSeconds` 간격(설정 가능, 0이면 비활성)으로 다음 뷰
- **세로 스와이프**: 30px 이상 위/아래 드래그로 다음/이전 뷰
- **왼쪽 가장자리 스와이프**: x<100에서 오른쪽으로 드래그 → 설정 사이드바 열기

스와이프는 `pointerdown/move/up` 통합 이벤트로 touch + mouse를 한 번에 처리. 8px 이상 이동 시 가로/세로 방향을 잠그고(`swipeAxis`), 세로일 때만 위젯 드래그 적용. **세로 우선** 규칙 — `|diffY| >= |diffX|` 면 세로로 판정.

### 2. 위젯 (6개)

`components/widgets/`:
- `ClockWidget` (442줄) — 좌측 패널, 항상 표시
- `WeatherWidget` (168줄) — 기상청 API
- `NewsWidget` (341줄) — 네이버/연합/구글 뉴스 (rotation 주기 설정 가능)
- `JobWidget` (303줄) — 채용정보 (rotation 주기 설정 가능)
- `CalendarWidget` (257줄) — iCal URL 다중 소스, 사용자가 색상·소스 5개까지 추가
- `FinanceWidget` (205줄) — SerpAPI 기반 금융 정보

위젯은 모두 absolute 포지셔닝으로 우측 컨테이너 안에서 transform/opacity로 전환. 드래그 중에는 transition 비활성화하고 픽셀 단위로 실시간 반영.

### 3. API 라우트 (Edge Runtime)

`app/api/`:
- `calendar/route.ts` — iCal 프록시 (CORS 우회)
- `news/route.ts` (371줄) — 네이버/연합 RSS/구글 뉴스 3종 분기, 8초 타임아웃, SerpAPI fallback
- `finance/route.ts` — 금융 시세
- `jobs/route.ts` — 채용정보

**모든 라우트는 `export const runtime = 'edge'` + `dynamic = 'force-dynamic'`** — Vercel Edge에 배포되며 캐시 안 함.

도시 매핑은 `app/page.tsx`와 `app/api/news/route.ts` 양쪽에 중복 정의된 `CITY_NAME_MAP` (17개 시도). 한 곳 수정 시 다른 곳도 같이 수정 필요 — DRY 위반이지만 의도된 분리.

### 4. 상태 관리 — 실제로는 localStorage

package.json에 zustand와 @tanstack/react-query가 들어있지만 `stores/` 디렉토리는 비어있고 page.tsx는 **순수 useState + localStorage('panorama-settings')** 만 사용한다. 의존성은 깔려있으나 실사용은 안 된 상태 — 신규 설정 추가 시 두 가지 옵션:
- 기존 패턴 유지(useState + saveSettings 헬퍼) — 일관성
- Zustand로 마이그레이션 — 위젯 간 공유 가능

기본 결정 없이 임의로 바꾸지 말 것.

### 5. bkend.ai BaaS — 미연동 상태

`lib/bkend.ts`는 **mock client만 정의**되어 있다(35줄). 실제 `@bkend/client` 패키지는 설치되지 않았고 모든 메서드가 `[]` / `null`만 반환. `.mcp.json`에 `@bkend/mcp-server`가 정의되어 있어 MCP 도구로는 접근 가능하지만 런타임 코드에서는 사용되지 않는다.

bkend 의존 작업이 필요하면 (1) `@bkend/client` npm 설치 (2) `lib/bkend.ts`의 주석 부분 활성화 (3) 환경변수 `NEXT_PUBLIC_BKEND_API_KEY`, `NEXT_PUBLIC_BKEND_PROJECT_ID` 설정 — 이 3단계가 먼저.

### 6. 폰트 / 스타일

- **Pretendard** (한국어, local font, `node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2`)
- **Geist Sans/Mono** (Google Font)
- **Bebas Neue** (Google Font, 시계용)
- Tailwind CSS v4 + `@tailwindcss/postcss`
- 다크 톤(`from-slate-900 via-blue-900`) 고정 + `backdrop-blur-xl` 글래스모피즘

`html lang="ko"`. 모든 UI 텍스트 한국어.

### 7. 외부 데이터 의존성

- **기상청 API** (https://data.go.kr) — 단기/초단기/중기 예보
- **SerpAPI** (https://serpapi.com) — 구글 뉴스 + 금융 (사용자가 자기 키 입력, localStorage 저장)
- **네이버 뉴스 / 연합뉴스 RSS** — 키 불필요
- **iCal** — 기본값 한국 공휴일(`calendar.google.com/.../ko.south_korea#holiday`)

API 키 부재 시 위젯은 mock 데이터(`lib/api/news.ts`의 `getMockNews()` 등)로 폴백.

### 8. 경로 별칭

`tsconfig.json` paths: `@/*` → `./*`. 모든 import는 `@/components/...`, `@/lib/...` 형식 사용.

## 디렉토리 노트

- `docs/` — PDCA 사이클(01-plan / 02-design / 03-analysis / 04-report) + `DEPLOYMENT.md`(Vercel/Cloudflare Pages/Firebase 비교)
- `stores/` — 비어있음 (Zustand 미사용)
- `hooks/` — 비어있음
- `types/` — 비어있음 (각 위젯이 자기 타입 직접 정의)

## 배포

- **Vercel** — 메인 (https://panorama-korea.vercel.app, Edge runtime 활용)
- `.vercel/` 디렉토리 커밋되어 있음 — 프로젝트 연결 상태
- `npm run build` 후 자동 배포

## 유의 사항

- `localStorage` 키는 `panorama-settings` 단 하나(JSON 객체로 모든 설정 묶음). 키 충돌·이름 변경 시 사용자 설정 전부 손실되므로 신규 설정 추가는 항상 spread merge로.
- 위젯 추가 시 (1) `VIEWS` 배열 (2) `app/page.tsx`의 transform/opacity/indicator 블록 5세트 (3) 자동 순환 로직 — 세 군데 동기 필요.
- 1920x540 32:9 디스플레이 가정. 다른 종횡비에서는 `aspect-[32/9]` + `max-w-[1920px]` 제약으로 letterbox 처리.
