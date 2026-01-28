---
template: plan
version: 1.2
description: PDCA Plan phase document for Incruit recruitment display digital signage
variables:
  - feature: incruit-recruitment-display
  - date: 2026-01-28
  - author: Claude AI
  - project: panorama-korea (Incruit)
  - version: 0.1.0
---

# incruit-recruitment-display Planning Document

> **Summary**: Digital signage screen displaying Incruit recruitment information with multiple widgets
>
> **Project**: panorama-korea (Incruit)
> **Version**: 0.1.0
> **Author**: Claude AI
> **Date**: 2026-01-28
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

인크루트(Incruit) 채용정보를 디지털 사이니지(Digital Signage)용 화면으로 표시하는 통합 대시보드를 개발합니다. 기존 Panorama Korea 프로젝트를 기반으로 채용정보 중심의 디스플레이 시스템을 구축하여, 공공장소나 사무실에서 실시간 채용정보를 효과적으로 전달합니다.

### 1.2 Background

- 기존 Panorama Korea는 날씨, 캘린더, 뉴스, 금융 정보를 제공하는 스마트 디스플레이
- 인크루트 채용정보를 추가하여 구직자에게 실시간 채용 기회를 제공
- 이미 JobWidget이 구현되어 있으며, 이를 중심으로 통합 디지털 사이니지 화면 구축 필요
- 디지털 사이니지 환경(터치/비터치, 대화면)에 최적화된 UX 구현

### 1.3 Related Documents

- Requirements: 기존 Panorama Korea 프로젝트 (CLAUDE.md)
- References:
  - 일본판 Panorama: https://panorama-2ps.pages.dev/
  - 기존 구현: [components/widgets/JobWidget.tsx](components/widgets/JobWidget.tsx)

---

## 2. Scope

### 2.1 In Scope

- [x] **채용정보 위젯 (JobWidget)** - 이미 구현됨
  - 인크루트 RSS 피드 연동
  - 가로 스와이프로 채용정보 전환
  - QR 코드 생성으로 즉시 지원 가능
  - 지역별 필터링 (서울, 부산, 대구 등)
  - 자동 로테이션 (10초 간격)

- [ ] **메인 대시보드 레이아웃 최적화**
  - 디지털 사이니지용 전체화면 레이아웃
  - 그리드 기반 위젯 배치 (JobWidget 중심)
  - 반응형 디자인 (다양한 화면 크기 지원)

- [ ] **통합 위젯 시스템**
  - WeatherWidget: 날씨 정보
  - CalendarWidget: 캘린더 및 일정
  - NewsWidget: 뉴스 헤드라인
  - FinanceWidget: 금융/주식 정보
  - ClockWidget: 시계 및 날짜

- [ ] **설정 페이지**
  - 위젯 표시/숨김 토글
  - 지역 선택 (채용정보 필터링용)
  - 로테이션 속도 조절
  - 테마/색상 설정

- [ ] **API 통합**
  - 인크루트 RSS API (`/api/jobs`)
  - 날씨 API 연동
  - 뉴스 RSS 연동
  - 금융 데이터 연동

- [ ] **디지털 사이니지 최적화**
  - 터치 인터랙션 지원 (스와이프, 탭)
  - 비활성 시 자동 슬라이드쇼
  - 절전 모드/화면 보호기
  - 원격 설정 업데이트

### 2.2 Out of Scope

- 사용자 인증/로그인 기능 (공용 디스플레이)
- 개인 맞춤형 추천 알고리즘
- 채용 지원 프로세스 내장 (QR 코드로 외부 링크)
- 관리자 백오피스 (현재는 로컬 설정만)
- 다국어 지원 (한국어 전용)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 인크루트 채용정보를 RSS로 실시간 수집 및 표시 | High | Implemented |
| FR-02 | 가로 스와이프로 채용정보 순환 (터치 스크린) | High | Implemented |
| FR-03 | QR 코드 생성하여 모바일에서 즉시 지원 가능 | High | Implemented |
| FR-04 | 지역별 채용정보 필터링 (서울, 부산 등) | High | Implemented |
| FR-05 | 디지털 사이니지용 전체화면 대시보드 레이아웃 | High | Pending |
| FR-06 | 날씨, 캘린더, 뉴스, 금융 위젯 통합 표시 | Medium | Implemented |
| FR-07 | 설정 페이지에서 위젯 표시/숨김 제어 | Medium | Pending |
| FR-08 | 자동 로테이션 (설정 가능한 간격) | Medium | Implemented |
| FR-09 | 터치 인터랙션 방향 잠금 (가로/세로 구분) | Low | Implemented |
| FR-10 | 반응형 디자인 (다양한 화면 크기 지원) | Low | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 위젯 로딩 시간 < 1초 | Browser DevTools |
| Performance | API 폴링 간격 5분 (jobs), 1분 (news) | Network 탭 확인 |
| Usability | 터치 인터랙션 반응 시간 < 100ms | 터치 테스트 |
| Accessibility | 대화면 가독성 (2m 거리에서 읽기 가능) | 실제 디스플레이 테스트 |
| Reliability | 24/7 무중단 운영 가능 | 장시간 테스트 |
| Maintainability | API 장애 시 기존 데이터 표시 (캐싱) | 네트워크 단절 테스트 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [x] JobWidget 구현 완료 및 정상 작동
- [ ] 디지털 사이니지 메인 대시보드 레이아웃 완성
- [ ] 모든 위젯 (날씨, 캘린더, 뉴스, 금융) 통합 및 작동
- [ ] 설정 페이지 구현 (위젯 제어, 지역 선택)
- [ ] 터치 인터랙션 정상 작동 (스와이프, 탭)
- [ ] 반응형 디자인 적용 (모바일 ~ 대화면)
- [ ] 실제 디지털 사이니지 환경에서 테스트 완료
- [ ] 문서화 완료 (README, API 문서)

### 4.2 Quality Criteria

- [ ] ESLint 에러 0개
- [ ] 빌드 성공 (`npm run build`)
- [ ] 24시간 연속 운영 안정성 테스트 통과
- [ ] 모든 API 엔드포인트 응답 시간 < 500ms

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 인크루트 RSS 피드 구조 변경 | High | Medium | RSS 파싱 로직 유연하게 구현, fallback 처리 |
| API 장애로 인한 데이터 없음 | High | Low | 로컬 캐싱 구현, 마지막 성공 데이터 표시 |
| 터치 스크린 오동작 (오인식) | Medium | Medium | 방향 잠금 로직 구현 (가로/세로 구분) |
| 대화면에서 가독성 저하 | Medium | Low | 폰트 크기 및 간격 조절, 테스트 |
| 장시간 운영 시 메모리 누수 | Medium | Low | React Query 캐싱 관리, 주기적 새로고침 |
| QR 코드 생성 API 장애 | Low | Low | 외부 QR API 사용 (qrserver.com), 백업 서비스 준비 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure (`components/`, `lib/`, `types/`) | Static sites, portfolios, landing pages | ☐ |
| **Dynamic** | Feature-based modules, services layer | Web apps with backend, SaaS MVPs | ☑ |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic systems, complex architectures | ☐ |

**선택 근거**: 기존 Panorama Korea는 Dynamic 레벨로 구축되어 있으며, API 통합과 상태 관리가 필요하므로 Dynamic 레벨 유지

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Framework | Next.js / React / Vue | **Next.js 16** | 기존 프로젝트가 Next.js App Router 사용 |
| State Management | Context / Zustand / Redux / Jotai | **Zustand** | 기존 프로젝트가 Zustand 사용 (경량, 간단) |
| API Client | fetch / axios / react-query | **TanStack Query** | 기존 프로젝트가 react-query 사용 (캐싱, 폴링) |
| Styling | Tailwind / CSS Modules / styled-components | **Tailwind CSS v4** | 기존 프로젝트가 Tailwind 사용 |
| RSS Parsing | xml2js / fast-xml-parser / native | **Server-side fetch + parsing** | 서버 사이드에서 RSS 파싱 후 JSON 응답 |
| QR Generation | qrcode / qr-image / external API | **External API (qrserver.com)** | 간단하고 빠른 구현, 서버 부하 없음 |

### 6.3 Clean Architecture Approach

```
Selected Level: Dynamic

Folder Structure:
panorama-korea/
├── app/                          # Next.js App Router
│   ├── (main)/                   # Main display routes
│   │   ├── dashboard/            # Digital signage dashboard
│   │   ├── jobs/                 # Jobs detail page (future)
│   │   └── layout.tsx
│   ├── (settings)/               # Settings routes
│   │   └── settings/
│   ├── api/                      # API routes
│   │   ├── jobs/                 # Incruit RSS API
│   │   ├── news/                 # News API
│   │   └── weather/              # Weather API
│   ├── layout.tsx
│   └── page.tsx
│
├── components/                   # UI components
│   ├── widgets/                  # Widget components
│   │   ├── JobWidget.tsx         # ✅ Implemented
│   │   ├── WeatherWidget.tsx     # ✅ Implemented
│   │   ├── CalendarWidget.tsx    # ✅ Implemented
│   │   ├── NewsWidget.tsx        # ✅ Implemented
│   │   ├── FinanceWidget.tsx     # ✅ Implemented
│   │   └── ClockWidget.tsx       # ✅ Implemented
│   ├── layout/                   # Layout components
│   │   └── DashboardGrid.tsx     # To be created
│   └── ui/                       # Base UI components
│
├── hooks/                        # Custom hooks
│   ├── useJobs.ts                # Jobs data fetching
│   └── useSettings.ts            # Settings management
│
├── lib/                          # Utilities
│   ├── api/                      # API clients
│   │   └── incruit.ts            # Incruit RSS parser
│   └── utils.ts
│
├── stores/                       # State management
│   └── settings-store.ts         # User settings (Zustand)
│
├── types/                        # TypeScript types
│   └── index.ts
│
└── docs/                         # PDCA documents
    ├── 01-plan/
    ├── 02-design/
    ├── 03-analysis/
    └── 04-report/
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` 존재 (프로젝트 개요 및 구조 정의)
- [ ] `docs/01-plan/conventions.md` 없음
- [ ] `CONVENTIONS.md` 없음
- [x] ESLint 설정 (`eslint.config.js` 사용)
- [ ] Prettier 설정 없음
- [x] TypeScript 설정 (`tsconfig.json`)

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Naming** | Implicit (PascalCase for components) | Widget 네이밍 규칙, Hook 네이밍 | Medium |
| **Folder structure** | Defined in CLAUDE.md | Layout/Widget 구분 명확화 | High |
| **Import order** | No explicit rule | Import 순서 정의 (React → Next → lib → components) | Low |
| **Environment variables** | `.env.local` 사용 | 필요한 환경변수 목록 정리 | Medium |
| **Error handling** | Inconsistent | 에러 처리 패턴 통일 (try-catch, fallback UI) | Medium |

### 7.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| `NEXT_PUBLIC_SITE_URL` | Site URL for QR generation | Client | ☐ |
| `INCRUIT_RSS_URL` | Incruit RSS feed URL | Server | ☐ |
| `NEWS_RSS_URL` | News RSS feed URL | Server | ☐ |
| `WEATHER_API_KEY` | Weather API key (optional) | Server | ☐ |

**참고**: 현재 하드코딩된 RSS URL을 환경변수로 이동 권장

### 7.4 Pipeline Integration

현재 프로젝트는 9-phase Pipeline을 사용하지 않으며, PDCA 사이클만 활용합니다.

| Phase | Status | Document Location | Command |
|-------|:------:|-------------------|---------|
| PDCA Plan | ✅ | `docs/01-plan/features/incruit-recruitment-display.plan.md` | This document |
| PDCA Design | ☐ | To be created | `/pdca design incruit-recruitment-display` |
| PDCA Do | ☐ | - | Implementation |
| PDCA Check | ☐ | `docs/03-analysis/` | `/pdca analyze incruit-recruitment-display` |

---

## 8. Next Steps

1. [ ] 이 계획서 검토 및 승인
2. [ ] Design 문서 작성 (`/pdca design incruit-recruitment-display`)
   - 데이터 모델 정의
   - API 엔드포인트 상세 설계
   - 컴포넌트 구조 및 props 정의
   - 상태 관리 흐름 설계
3. [ ] 구현 시작 (Do 단계)
   - DashboardGrid 레이아웃 컴포넌트 구현
   - 설정 페이지 구현
   - API 엔드포인트 최적화
   - 반응형 디자인 적용
4. [ ] Gap 분석 (`/pdca analyze incruit-recruitment-display`)
5. [ ] 실제 디지털 사이니지 환경 테스트

---

## 9. Technical Notes

### 9.1 기존 구현 분석 (JobWidget)

**강점**:
- ✅ 터치 인터랙션 구현 (스와이프 방향 잠금)
- ✅ QR 코드 생성으로 모바일 지원 연결
- ✅ 지역별 필터링 구현
- ✅ 자동 로테이션 및 진행 표시
- ✅ 반응형 레이아웃 (Tailwind)

**개선 필요 사항**:
- 에러 핸들링 강화 (API 실패 시 fallback)
- 로컬 스토리지 외에 서버 사이드 설정 관리
- RSS 파싱 로직 개선 (다양한 RSS 형식 대응)
- 접근성 개선 (키보드 네비게이션)

### 9.2 디지털 사이니지 특화 요구사항

- **대화면 최적화**: 2m 거리에서도 읽기 쉬운 폰트 크기
- **터치 인터랙션**: 반응 속도 최적화, 오동작 방지
- **무인 운영**: 자동 복구, 에러 자가 치유
- **절전 모드**: 일정 시간 비활성 시 화면 보호기
- **원격 관리**: 설정 변경을 위한 관리자 모드 (future)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-01-28 | Initial draft | Claude AI |
