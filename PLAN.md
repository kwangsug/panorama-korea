# PLAN — panorama-korea

> 우선순위 순서. 완료되면 PROGRESS.md로 옮긴다.
> 마지막 갱신: 2026-06-27

## P0 — 즉시 (의장 환경 작업)

- [ ] **dev 서버 재시작** — `npm run dev` 로 `.env.local` 변경 키(`NAVER_CLIENT_SECRET`) 반영. 의장 직접
- [ ] **iPad 실측** — `http://<Mac_IP>:3500` portrait/landscape 회전 시 layout switch 확인
- [ ] **네이버 시크릿 재발급** — 이전 commit에 `NEXT_PUBLIC_NAVER_CLIENT_SECRET` 평문 노출됐을 가능성. 네이버 개발자센터 → Client Secret 재발급 → 새 키로 `.env.local` 업데이트

## P1 — Phase 3: 디자인 시스템 통일

- [ ] 색 토큰: `--accent-news` `--accent-weather` ... (현재 하드코딩 `bg-blue-400` 등)
- [ ] 간격·radius·shadow 토큰
- [ ] 페이지 인디케이터 컴포넌트 분리 (현재 page.tsx에 5개 div 중복)
- [ ] Pretendard 가중치 일관: 본문 400 / 강조 600 / 헤드라인 700 정리
- [ ] 공통 위젯 골격 컴포넌트(헤더+컨테이너) 분리 → 위젯 6개 일관 톤
- [ ] 빈 상태 / 에러 상태 공통 컴포넌트

## P2 — Phase 4: 전환 모션/인터랙션

- [ ] 자동 전환 진행률 ring 또는 bar (사용자가 곧 바뀌는지 인지)
- [ ] swipe spring easing (현재 ease-out)
- [ ] 설정 사이드바 섹션 접기/펴기 (지금 한 화면에 길게 나열)
- [ ] 위젯 전환 시 미세 햅틱 또는 사운드 (옵션)

## P3 — Phase 5: 콘텐츠 풍부함

- [ ] **CalendarWidget**: 음력 표시(`date-fns` 보조), 24절기, 명절 D-day
- [ ] **WeatherWidget**: 주/달 예보, 오늘 미세먼지, 일출/일몰
- [ ] **FinanceWidget**: 사용자 정의 종목 추가 (Yahoo `^/code` 자유 입력)
- [ ] **JobWidget**: 실데이터 출처 확정 (현재 진단 미실시) — 워크넷/사람인/잡코리아 후보
- [ ] **WeatherWidget**: 도시별 배경 분위기 자동 변화

## P4 — 정리/품질

- [ ] `CLAUDE.md.bak.20260627` 파일 정리 — `.gitignore`에 `*.bak.*` 추가 또는 wiki/raw로 이관
- [ ] npm audit 9건(low 1, moderate 4, high 4) 검토
- [ ] `next.config.ts` workspace root 경고 fix (`turbopack.root` 설정 또는 상위 lockfile 제거)
- [ ] `lib/bkend.ts` mock 상태 — bkend.ai 정식 연동 또는 코드 제거 결정

## 의장 결정 대기

- bkend.ai 정식 연동 vs 제거 (현재 mock client만)
- Zustand/TanStack Query 사용 여부 (선언만 됐고 실사용 X)
- 와이드 디스플레이(32:9) 1920x540 실제 사용 환경 확인
