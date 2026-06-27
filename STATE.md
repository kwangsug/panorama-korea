# STATE — panorama-korea

> 항상 덮어쓰기. 지금 상태 한눈에.
> 마지막 갱신: 2026-06-27

## 현재 버전
- **v0.1.1** (방금 빌드업 + push 완료, hash `599f0b8`)
- Remote: `origin = github.com/kwangsug/panorama-korea`
- Branch: `main` (origin/main 동기)

## 환경
- Next.js **16.1.5** + Turbopack
- React **19.2.3** + TypeScript strict
- Tailwind CSS **v4**
- 폰트: Pretendard (variable, local) + Geist Sans/Mono + Bebas Neue
- 패키지 매니저: npm
- dev 포트: **3500**

## 인증/외부 데이터 상태
| 항목 | 상태 |
|---|---|
| 네이버 뉴스 API | ✅ 키 유효 (`zoRpDcOb21DGTFSITHM7`, 2026-06-27 curl 검증). 키 이름 `NAVER_CLIENT_ID/SECRET`로 server-only 변경 완료 |
| Yahoo Finance (코스피·코스닥·환율·S&P·NASDAQ) | ✅ 키 불요, 비공식 API 사용. KOSPI=8,411 등 실데이터 확인 |
| SerpAPI | ✅ 키 유효하나 더 이상 Finance 안 씀. 구글 뉴스(`source=google`)에서만 사용 중 |
| 연합뉴스 RSS | 키 불요, 실시간 |
| iCal (Google 한국 공휴일) | 기본 1개 설정 |
| 기상청 (Open-Meteo) | 키 불요 |
| bkend.ai | ❌ 미연동 (mock client만 정의, `lib/bkend.ts`) |
| 채용정보 (JobWidget) | ⚠️ 진단 미실시 |

## UI 현황
- **레이아웃**: 반응형 적용됨
  - portrait/mobile: 시계 위 35% + 콘텐츠 아래 65%
  - landscape: 시계 좌 45% + 콘텐츠 우 55%
  - 32:9 super-wide (`aspect-ratio ≥ 32/9`): 1920x540 letterbox 유지
- **위젯 5뷰 자동 순환**: weather → news → jobs → calendar → finance (autoSwitchSeconds 간격)
- **mock 표시 배지**: NewsWidget·FinanceWidget 헤더에 `📡 샘플` 노란 배지. 다른 위젯은 아직 미적용
- **설정 사이드바**: 왼쪽 가장자리 스와이프 또는 클릭

## 알려진 미해결 / 우선순위
1. **Phase 3 — 디자인 시스템 통일**: 6개 위젯 색·간격·radius·shadow 토큰화 + 페이지 인디케이터 통일 + Pretendard 가중치 일관
2. **Phase 4 — 전환 모션**: spring swipe + 자동전환 progress ring + 설정 사이드바 섹션 접기
3. **Phase 5 — 콘텐츠 풍부함**: 음력·24절기·기념일 D-day, 주/달 날씨 예보, 주식 종목 사용자 설정, 교통(JobWidget?) 실데이터
4. **dev 환경**: `.env.local` 키 이름 변경(`NAVER_CLIENT_SECRET`) 반영 위해 의장 dev 서버 재시작 필요
5. **보안 후속**: 이전 commit에 NEXT_PUBLIC_NAVER_CLIENT_SECRET 노출 — 네이버 콘솔 시크릿 재발급 권장
6. **ESLint 환경**: `eslint-scope` 누락 이슈는 npm install로 일단 복구됨. 추가 audit(9건 취약점) 미처리

## 산출물
- 빌드업: v0.1.1 (`599f0b8`)
- Vercel: origin/main push 시 자동 배포 (대시보드 확인 권장)
- CLAUDE.md 백업: `CLAUDE.md.bak.20260627` (gitignore 권장)

## 관련 파일
- `PLAN.md` — 다음 할 일 우선순위
- `PROGRESS.md` — 완료 누적
- `CLAUDE.md` — 코드베이스 가이드 (전면 재생성됨)
