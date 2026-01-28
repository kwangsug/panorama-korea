---
template: design
version: 1.2
description: PDCA Design phase document for Incruit recruitment display digital signage
variables:
  - feature: incruit-recruitment-display
  - date: 2026-01-28
  - author: Claude AI
  - project: panorama-korea (Incruit)
  - version: 0.1.0
---

# incruit-recruitment-display Design Document

> **Summary**: Digital signage system with Incruit recruitment data from RSS feeds and multiple information widgets
>
> **Project**: panorama-korea (Incruit)
> **Version**: 0.1.0
> **Author**: Claude AI
> **Date**: 2026-01-28
> **Status**: Draft
> **Planning Doc**: [incruit-recruitment-display.plan.md](../../01-plan/features/incruit-recruitment-display.plan.md)

### Pipeline References (if applicable)

| Phase | Document | Status |
|-------|----------|--------|
| Phase 1 | [Schema Definition](../../01-plan/schema.md) | N/A |
| Phase 2 | [Coding Conventions](../../01-plan/conventions.md) | N/A |
| Phase 3 | [Mockup](../mockup/incruit-recruitment-display.md) | N/A |
| Phase 4 | [API Spec](../api/incruit-recruitment-display.md) | N/A |

> **Note**: This project uses PDCA cycle only (not 9-phase Pipeline).

---

## 1. Overview

### 1.1 Design Goals

1. **RSS 기반 실시간 데이터 통합**: 인크루트 RSS, 뉴스 RSS 등 외부 피드를 실시간으로 수집하여 표시
2. **위젯 기반 모듈식 아키텍처**: 각 정보 유형을 독립적인 위젯으로 구현하여 유지보수 용이
3. **디지털 사이니지 최적화**: 대화면, 터치 인터랙션, 무인 운영에 최적화된 UX
4. **확장 가능한 설정 시스템**: 위젯 표시/숨김, 지역 필터링 등 유연한 설정 관리
5. **성능 및 안정성**: 24/7 운영 가능한 캐싱 및 에러 핸들링

### 1.2 Design Principles

- **Single Responsibility**: 각 위젯은 하나의 정보 유형만 담당 (채용, 날씨, 뉴스 등)
- **Data-Driven**: RSS/API 데이터를 중심으로 설계, 서버 사이드에서 파싱 후 JSON 제공
- **Responsive & Touch-First**: 다양한 화면 크기 지원, 터치 인터랙션 우선 설계
- **Fail-Safe**: API 장애 시에도 기존 데이터 표시 (로컬 캐싱)

---

## 2. Architecture

### 2.1 Component Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    Browser (Client)                          │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ JobWidget  │  │NewsWidget  │  │WeatherWidget│  ...      │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘           │
│        │               │               │                    │
│        └───────────────┼───────────────┘                    │
│                        │                                    │
│                  ┌─────▼────────┐                          │
│                  │ React Query  │ (캐싱, 폴링, 상태관리)      │
│                  │ (TanStack)   │                          │
│                  └─────┬────────┘                          │
└────────────────────────┼─────────────────────────────────────┘
                         │ HTTP Requests
┌────────────────────────▼─────────────────────────────────────┐
│                  Next.js Server (App Router)                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │             API Routes (/api/*)                      │  │
│  │                                                      │  │
│  │  /api/jobs      → Incruit RSS Parser                │  │
│  │  /api/news      → News RSS Parser                   │  │
│  │  /api/calendar  → Calendar Data Provider            │  │
│  │  /api/finance   → Finance Data Provider             │  │
│  │  /api/weather   → Weather API Client (future)       │  │
│  └──────────────────────┬───────────────────────────────┘  │
│                         │                                  │
│                         ▼                                  │
│                ┌────────────────┐                         │
│                │  RSS Parsers   │                         │
│                │  API Clients   │                         │
│                └────────┬───────┘                         │
└─────────────────────────┼─────────────────────────────────┘
                          │
                          ▼
          ┌───────────────────────────────┐
          │   External Data Sources       │
          │                               │
          │  • Incruit RSS Feed           │
          │  • News RSS Feeds             │
          │  • Weather API (future)       │
          │  • Calendar API (future)      │
          └───────────────────────────────┘
```

### 2.2 Data Flow

```
1. Widget Mount
   Widget (useQuery) → React Query → /api/[resource] → RSS Parser → External RSS

2. Data Update (Polling)
   React Query (5분마다) → /api/[resource] → Cache Hit/Miss → External RSS

3. User Interaction (Touch/Swipe)
   User Touch → Widget State Update → UI Re-render

4. Settings Update
   Settings Page → localStorage → Widget Re-fetch with new params
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| JobWidget | /api/jobs, React Query | 채용정보 데이터 페칭 및 표시 |
| NewsWidget | /api/news, React Query | 뉴스 데이터 페칭 및 표시 |
| WeatherWidget | /api/weather (future), React Query | 날씨 데이터 페칭 및 표시 |
| CalendarWidget | /api/calendar, React Query | 캘린더 데이터 페칭 및 표시 |
| FinanceWidget | /api/finance, React Query | 금융 데이터 페칭 및 표시 |
| DashboardGrid | All Widgets, settings-store | 레이아웃 및 위젯 표시 제어 |
| SettingsPage | settings-store | 사용자 설정 관리 |

---

## 3. Data Model

### 3.1 Entity Definition

#### JobItem (채용정보)

```typescript
// 인크루트 RSS에서 추출된 채용정보 항목
interface JobItem {
  title: string;       // 채용 공고 제목
  company: string;     // 회사명
  link: string;        // 채용 공고 URL
  location: string;    // 지역 (예: "서울, 경기", "전국")
  deadline: string;    // 마감일 (예: "2024-12-31", "상시")
  experience: string;  // 경력 요구사항 (예: "신입", "경력 3년 이상")
}

// API 응답 형식
interface JobsResponse {
  jobs: JobItem[];     // 채용정보 목록 (최대 10개)
  feedTitle: string;   // RSS 피드 제목 (예: "인크루트 신입공채")
}
```

#### NewsItem (뉴스)

```typescript
// 뉴스 RSS에서 추출된 뉴스 항목
interface NewsItem {
  id: string;          // 고유 ID (link 기반 생성)
  title: string;       // 뉴스 제목
  summary: string;     // 뉴스 요약
  url: string;         // 뉴스 URL
  source: string;      // 출처 (예: "조선일보", "YTN")
  publishedAt: Date;   // 발행 시각
  imageUrl?: string;   // 썸네일 이미지 (선택)
}
```

#### CalendarEvent (캘린더/일정)

```typescript
// 캘린더 이벤트
interface CalendarEvent {
  id: string;          // 고유 ID
  title: string;       // 이벤트 제목
  date: Date;          // 날짜
  isHoliday: boolean;  // 공휴일 여부
  isLunar?: boolean;   // 음력 여부
  description?: string; // 설명
}

// 공휴일 정의
interface Holiday {
  date: string;        // YYYY-MM-DD 형식
  name: string;        // 공휴일 이름
  isLunar: boolean;    // 음력 여부
}
```

#### WeatherData (날씨)

```typescript
// 현재 날씨 정보
interface WeatherData {
  temperature: number;  // 온도 (°C)
  condition: string;    // 날씨 상태 (예: "맑음", "비", "눈")
  humidity: number;     // 습도 (%)
  windSpeed: number;    // 풍속 (m/s)
  location: string;     // 위치
  updatedAt: Date;      // 업데이트 시각
}

// 날씨 예보
interface WeatherForecast {
  date: string;         // YYYY-MM-DD
  maxTemp: number;      // 최고 온도
  minTemp: number;      // 최저 온도
  condition: string;    // 날씨 상태
  precipitation: number; // 강수 확률 (%)
}
```

#### FinanceData (금융/주식)

```typescript
// 주식/환율 티커 정보
interface FinanceTicker {
  id: string;           // 티커 ID (예: "KOSPI", "USD_KRW")
  name: string;         // 이름 (예: "코스피", "달러")
  value: number;        // 현재 값
  change: number;       // 변동값
  changePercent: number; // 변동률 (%)
  updatedAt: Date;      // 업데이트 시각
}
```

#### Settings (사용자 설정)

```typescript
// 사용자 설정 (localStorage에 저장)
interface PanoramaSettings {
  // 위젯 표시 여부
  widgets: {
    jobs: boolean;
    weather: boolean;
    calendar: boolean;
    news: boolean;
    finance: boolean;
    clock: boolean;
  };

  // 지역 설정 (채용정보 필터링용)
  selectedCity: string; // 'Seoul' | 'Busan' | 'Daegu' | ...

  // 로테이션 설정
  jobRotationSeconds: number; // 채용정보 자동 전환 간격 (초)

  // 테마 (향후 확장)
  theme: 'light' | 'dark' | 'auto';
}
```

### 3.2 Entity Relationships

```
┌─────────────────┐
│   Settings      │
│ (localStorage)  │
└────────┬────────┘
         │ 1
         │
         │ affects
         │
         ▼ N
┌─────────────────────────────────────────────┐
│             Widgets                         │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │JobWidget │  │NewsWidget│  │WeatherW. │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │             │             │        │
└───────┼─────────────┼─────────────┼────────┘
        │             │             │
        │ fetches     │ fetches     │ fetches
        ▼             ▼             ▼
┌──────────────────────────────────────────────┐
│           API Routes (/api/*)                │
│                                              │
│  /api/jobs  →  JobItem[]                    │
│  /api/news  →  NewsItem[]                   │
│  /api/weather → WeatherData                 │
│  /api/calendar → CalendarEvent[]            │
│  /api/finance → FinanceTicker[]             │
└──────────────────────────────────────────────┘
```

### 3.3 Database Schema (if applicable)

**이 프로젝트는 데이터베이스를 사용하지 않습니다.**

- 모든 데이터는 외부 RSS/API에서 실시간으로 가져옴
- 설정은 브라우저 localStorage에 저장
- 캐싱은 React Query가 메모리에서 처리
- 향후 bkend.ai를 사용한 사용자 인증 및 개인 설정 저장 가능 (Out of Scope)

---

## 4. API Specification

### 4.1 Endpoint List

| Method | Path | Description | Cache | Polling |
|--------|------|-------------|-------|---------|
| GET | `/api/jobs` | 인크루트 채용정보 목록 | 5분 | 5분 |
| GET | `/api/news` | 뉴스 헤드라인 목록 | 1분 | 1분 |
| GET | `/api/calendar` | 캘린더 이벤트 목록 | 1시간 | - |
| GET | `/api/finance` | 금융/주식 티커 정보 | 5분 | 5분 |
| GET | `/api/weather` | 날씨 정보 (향후 구현) | 10분 | 10분 |

### 4.2 Detailed Specification

#### `GET /api/jobs`

**Description**: 인크루트 RSS에서 채용정보를 가져옵니다.

**Query Parameters**:
```typescript
{
  city?: string; // 선택적. 도시 코드 (예: 'Seoul', 'Busan')
                 // 제공 시 해당 지역 RSS, 미제공 시 전체 RSS
}
```

**Request Example**:
```http
GET /api/jobs?city=Seoul
```

**Response (200 OK)**:
```json
{
  "jobs": [
    {
      "title": "신입 프론트엔드 개발자 채용",
      "company": "테크컴퍼니",
      "link": "https://www.incruit.com/job/...",
      "location": "서울 강남구",
      "deadline": "2024-12-31",
      "experience": "신입"
    },
    {
      "title": "백엔드 개발자 (경력 3년 이상)",
      "company": "스타트업",
      "link": "https://www.incruit.com/job/...",
      "location": "서울 판교, 경기",
      "deadline": "상시",
      "experience": "경력 3년 이상"
    }
  ],
  "feedTitle": "인크루트 서울 신입공채"
}
```

**Error Responses**:
- `500 Internal Server Error`: RSS 파싱 실패
  ```json
  {
    "error": "Failed to fetch jobs",
    "jobs": []
  }
  ```

**Implementation Notes**:
- 인크루트 RSS URL: `https://www.incruit.com/rss/job.asp`
  - 지역별: `?ct=3&ty=2&cd={regionCode}` (예: cd=11 → 서울)
  - 전체: `?jobtycd=1&today=y`
- 최대 10개 항목만 파싱
- CDATA 및 HTML 엔티티 처리 필요
- `User-Agent` 헤더 필수

---

#### `GET /api/news`

**Description**: 뉴스 RSS에서 헤드라인을 가져옵니다.

**Query Parameters**: 없음

**Response (200 OK)**:
```json
{
  "news": [
    {
      "id": "news-1",
      "title": "뉴스 제목",
      "summary": "뉴스 요약...",
      "url": "https://...",
      "source": "조선일보",
      "publishedAt": "2024-01-28T12:00:00Z",
      "imageUrl": "https://..."
    }
  ]
}
```

**Error Responses**:
- `500 Internal Server Error`: RSS 파싱 실패

---

#### `GET /api/calendar`

**Description**: 캘린더 이벤트 및 공휴일 정보를 가져옵니다.

**Query Parameters**:
```typescript
{
  year?: number;  // 연도 (기본: 현재 연도)
  month?: number; // 월 (기본: 현재 월)
}
```

**Response (200 OK)**:
```json
{
  "events": [
    {
      "id": "cal-1",
      "title": "신정",
      "date": "2024-01-01T00:00:00Z",
      "isHoliday": true,
      "isLunar": false
    },
    {
      "id": "cal-2",
      "title": "설날",
      "date": "2024-02-10T00:00:00Z",
      "isHoliday": true,
      "isLunar": true,
      "description": "음력 1월 1일"
    }
  ]
}
```

---

#### `GET /api/finance`

**Description**: 금융/주식 티커 정보를 가져옵니다.

**Query Parameters**: 없음

**Response (200 OK)**:
```json
{
  "tickers": [
    {
      "id": "KOSPI",
      "name": "코스피",
      "value": 2580.5,
      "change": 15.3,
      "changePercent": 0.6,
      "updatedAt": "2024-01-28T15:30:00Z"
    },
    {
      "id": "USD_KRW",
      "name": "달러",
      "value": 1320.5,
      "change": -5.2,
      "changePercent": -0.39,
      "updatedAt": "2024-01-28T15:30:00Z"
    }
  ]
}
```

---

## 5. UI/UX Design

### 5.1 Screen Layout (Digital Signage Dashboard)

#### Desktop/Large Screen (1920x1080 기준)

```
┌────────────────────────────────────────────────────────────────┐
│  Clock Widget (시계 + 날짜)                                    │
│  2024년 1월 28일 월요일  오후 3:45                             │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐│
│  │   Weather Widget    │  │      Job Widget (Large)         ││
│  │                     │  │                                 ││
│  │   ☀️ 맑음           │  │  💼 테크컴퍼니                   ││
│  │   15°C              │  │  신입 프론트엔드 개발자 채용      ││
│  │   습도 60%          │  │                                 ││
│  │                     │  │  🔵 신입  🟢 서울  🔴 ~12/31  ││
│  │   예보:             │  │                                 ││
│  │   29일: 17°C        │  │              [QR Code]          ││
│  │   30일: 14°C        │  │                                 ││
│  └─────────────────────┘  │  ● ○ ○ ○ ○ (Progress dots)    ││
│                            └─────────────────────────────────┘│
│  ┌─────────────────────┐  ┌─────────────────────────────────┐│
│  │   Calendar Widget   │  │      Finance Widget             ││
│  │                     │  │                                 ││
│  │   📅 1월 28일       │  │  📈 코스피  2580.5  ▲ 0.6%    ││
│  │                     │  │  💵 달러   1320.5  ▼ 0.39%    ││
│  │   오늘의 일정:       │  │  💴 엔화    900.2  ▲ 0.12%    ││
│  │   • 점심 회의       │  │  ₿ 비트코인 52M    ▼ 1.2%     ││
│  │   • 프로젝트 마감    │  │                                 ││
│  │                     │  │                                 ││
│  └─────────────────────┘  └─────────────────────────────────┘│
│                                                                │
│  ┌────────────────────────────────────────────────────────────┤
│  │              News Widget (Horizontal Ticker)              ││
│  │  [조선] AI 시대 인재 채용 트렌드 변화 | [YTN] 청년 취업률... ││
│  └────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────┘
```

#### Mobile/Tablet (Portrait)

```
┌──────────────────────────┐
│    Clock Widget (시계)    │
│    2024.01.28 월 15:45   │
├──────────────────────────┤
│                          │
│   Job Widget (Full)      │
│                          │
│   💼 테크컴퍼니           │
│   신입 프론트엔드 개발자   │
│   채용                   │
│                          │
│   🔵 신입  🟢 서울        │
│   🔴 마감: 12/31         │
│                          │
│       [QR Code]          │
│                          │
│   ● ○ ○ ○ ○             │
├──────────────────────────┤
│  Weather Widget (Compact)│
│  ☀️ 15°C  습도 60%       │
├──────────────────────────┤
│  Calendar Widget (Today) │
│  📅 오늘 일정 2건         │
├──────────────────────────┤
│  Finance Widget (2 items)│
│  📈 코스피 2580 ▲0.6%   │
│  💵 달러 1320 ▼0.39%    │
├──────────────────────────┤
│  News Ticker (Scroll)    │
│  뉴스 제목이 흐릅니다...  │
└──────────────────────────┘
```

### 5.2 User Flow

```
Main Dashboard (Auto-play)
      │
      ├─→ [Touch: Swipe Left/Right on JobWidget]
      │   → Next/Previous Job
      │
      ├─→ [Touch: Tap on any Widget]
      │   → Widget Detail View (future)
      │
      └─→ [Touch: Long Press or Settings Icon]
          → Settings Page
              │
              ├─→ Toggle Widget Visibility
              ├─→ Select City (for Jobs)
              ├─→ Adjust Rotation Speed
              └─→ [Save] → Back to Dashboard
```

### 5.3 Component List

| Component | Location | Responsibility | Props |
|-----------|----------|----------------|-------|
| **DashboardGrid** | `components/layout/` | 전체 대시보드 레이아웃 관리 | `settings: PanoramaSettings` |
| **JobWidget** | `components/widgets/` | 채용정보 표시 (이미 구현됨) | `rotationSeconds: number` |
| **WeatherWidget** | `components/widgets/` | 날씨 정보 표시 (이미 구현됨) | - |
| **CalendarWidget** | `components/widgets/` | 캘린더 이벤트 표시 (이미 구현됨) | - |
| **NewsWidget** | `components/widgets/` | 뉴스 티커 표시 (이미 구현됨) | `scrollSpeed?: number` |
| **FinanceWidget** | `components/widgets/` | 금융 티커 표시 (이미 구현됨) | - |
| **ClockWidget** | `components/widgets/` | 시계 및 날짜 표시 (이미 구현됨) | `format?: string` |
| **SettingsPage** | `app/(settings)/settings/` | 설정 관리 페이지 | - |
| **WidgetContainer** | `components/ui/` | 위젯 공통 컨테이너 (향후) | `title: string, icon: ReactNode` |

---

## 6. Error Handling

### 6.1 Error Code Definition

| Code | Message | Cause | Handling |
|------|---------|-------|----------|
| `RSS_PARSE_ERROR` | RSS 파싱 실패 | RSS 구조 변경, 네트워크 오류 | 빈 배열 반환, 로그 기록 |
| `API_TIMEOUT` | API 응답 시간 초과 | 외부 서비스 지연 | 이전 캐시 데이터 사용 |
| `NETWORK_ERROR` | 네트워크 연결 실패 | 인터넷 단절 | 에러 메시지 표시, 재시도 |
| `INVALID_PARAMS` | 잘못된 요청 파라미터 | 클라이언트 요청 오류 | 기본값으로 대체 |

### 6.2 Error Response Format

```json
{
  "error": "RSS_PARSE_ERROR",
  "message": "Failed to fetch jobs",
  "jobs": [],  // fallback to empty array
  "timestamp": "2024-01-28T15:30:00Z"
}
```

### 6.3 Widget Error States

각 위젯은 다음 상태를 처리합니다:

1. **Loading**: 데이터 로딩 중 (스켈레톤 UI)
2. **Error**: API 실패 시 (에러 메시지 + 재시도 버튼)
3. **Empty**: 데이터 없음 (빈 상태 안내)
4. **Success**: 정상 데이터 표시

```typescript
// 위젯 공통 에러 처리 패턴
function Widget() {
  const { data, isLoading, error } = useQuery(...)

  if (isLoading) return <WidgetSkeleton />
  if (error) return <WidgetError message={error.message} onRetry={refetch} />
  if (!data || data.length === 0) return <WidgetEmpty />

  return <WidgetContent data={data} />
}
```

---

## 7. Security Considerations

- [x] **Input validation**: RSS 파싱 시 XSS 방지 (HTML 태그 제거, 엔티티 디코딩)
- [x] **Server-side parsing**: RSS 파싱을 서버 사이드에서 수행 (클라이언트 보안)
- [ ] **Rate Limiting**: API 호출 제한 (향후 구현 필요)
- [ ] **CORS**: 외부 도메인 요청 제한 (현재는 서버 사이드에서 프록시)
- [ ] **HTTPS enforcement**: 프로덕션 배포 시 HTTPS 필수
- [x] **No sensitive data**: 사용자 인증 없음, 공개 데이터만 사용
- [x] **QR Code safety**: 외부 QR 생성 API 사용, 유효한 URL만 인코딩

---

## 8. Test Plan

### 8.1 Test Scope

| Type | Target | Tool | Priority |
|------|--------|------|----------|
| Unit Test | RSS Parser functions | Jest/Vitest | High |
| Integration Test | API Routes | Supertest | High |
| Component Test | Widget rendering | React Testing Library | Medium |
| E2E Test | User flow (swipe, tap) | Playwright | Medium |
| Visual Test | Responsive design | Manual / Storybook | Low |

### 8.2 Test Cases (Key)

#### API Tests

- [ ] `/api/jobs`: 정상 RSS 파싱
- [ ] `/api/jobs`: RSS 파싱 실패 시 빈 배열 반환
- [ ] `/api/jobs?city=Seoul`: 지역 필터링 정상 동작
- [ ] `/api/jobs`: CDATA 및 HTML 엔티티 처리
- [ ] `/api/news`: 뉴스 RSS 파싱 정상 동작

#### Widget Tests

- [ ] JobWidget: 데이터 로딩 및 표시
- [ ] JobWidget: 가로 스와이프로 이전/다음 채용정보 전환
- [ ] JobWidget: QR 코드 생성 및 표시
- [ ] JobWidget: 자동 로테이션 (10초 간격)
- [ ] WeatherWidget: 날씨 데이터 표시
- [ ] CalendarWidget: 캘린더 이벤트 표시

#### Settings Tests

- [ ] Settings: 위젯 표시/숨김 토글
- [ ] Settings: 지역 선택 후 채용정보 업데이트
- [ ] Settings: localStorage 저장 및 복원

#### Edge Cases

- [ ] API 응답 지연 시 타임아웃 처리
- [ ] 네트워크 단절 시 캐시 데이터 사용
- [ ] RSS 구조 변경 시 파싱 실패 처리
- [ ] 빈 데이터 응답 시 UI 표시

---

## 9. Clean Architecture

> Reference: `docs/01-plan/conventions.md` (N/A)

### 9.1 Layer Structure

| Layer | Responsibility | Location |
|-------|---------------|----------|
| **Presentation** | UI 컴포넌트, 위젯, 페이지 | `components/`, `app/` |
| **Application** | 데이터 페칭 훅, 비즈니스 로직 | `hooks/`, `app/api/` |
| **Domain** | 타입 정의, 인터페이스 | `types/` |
| **Infrastructure** | API 클라이언트, RSS 파서 | `lib/api/`, `app/api/*/route.ts` |

### 9.2 Dependency Rules

```
Presentation (components/) → Application (hooks/) → Domain (types/)
                ↓                      ↓
                └→ Infrastructure (lib/api/)
```

**규칙**:
- Presentation은 Application과 Domain에만 의존
- Application은 Domain과 Infrastructure에 의존
- Domain은 외부 의존성 없음 (순수 타입)
- Infrastructure는 Domain에만 의존

### 9.3 File Import Rules

| From | Can Import | Cannot Import |
|------|-----------|---------------|
| `components/` | `hooks/`, `types/`, `lib/utils` | `app/api/` 직접 호출 |
| `hooks/` | `types/`, `lib/api/` | `components/` |
| `types/` | 없음 (순수 타입) | 모든 외부 의존성 |
| `lib/api/` | `types/` | `components/`, `hooks/` |
| `app/api/` | `types/`, 외부 라이브러리 | `components/`, `hooks/` |

### 9.4 This Feature's Layer Assignment

| Component | Layer | Location |
|-----------|-------|----------|
| JobWidget | Presentation | `components/widgets/JobWidget.tsx` |
| WeatherWidget | Presentation | `components/widgets/WeatherWidget.tsx` |
| DashboardGrid | Presentation | `components/layout/DashboardGrid.tsx` (미구현) |
| useJobs hook | Application | `hooks/useJobs.ts` (향후) |
| useSettings hook | Application | `hooks/useSettings.ts` (향후) |
| JobItem type | Domain | `types/index.ts` |
| PanoramaSettings type | Domain | `types/index.ts` |
| /api/jobs | Infrastructure | `app/api/jobs/route.ts` |
| /api/news | Infrastructure | `app/api/news/route.ts` |
| RSS Parser | Infrastructure | `lib/api/rss-parser.ts` (향후 리팩토링) |

---

## 10. Coding Convention Reference

> Reference: `docs/01-plan/conventions.md` (N/A - 프로젝트에 정의된 컨벤션 없음)

### 10.1 Naming Conventions

| Target | Rule | Example |
|--------|------|---------|
| React Components | PascalCase | `JobWidget`, `DashboardGrid` |
| Functions/Hooks | camelCase | `useJobs()`, `parseRSS()` |
| Constants | UPPER_SNAKE_CASE | `CITY_TO_REGION_CODE`, `MAX_JOBS` |
| Types/Interfaces | PascalCase | `JobItem`, `PanoramaSettings` |
| Component Files | PascalCase.tsx | `JobWidget.tsx` |
| Utility Files | camelCase.ts | `formatDate.ts`, `cn.ts` |
| Folders | kebab-case | `components/widgets/`, `app/api/jobs/` |
| API Routes | route.ts | `app/api/jobs/route.ts` |

### 10.2 Import Order

```typescript
// 1. React 및 Next.js
import { useState, useEffect } from 'react'
import { NextResponse } from 'next/server'

// 2. 외부 라이브러리
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'

// 3. 내부 컴포넌트/훅 (절대 경로는 사용하지 않음)
import { Button } from '@/components/ui/button'
import { useSettings } from '@/hooks/useSettings'

// 4. 상대 경로 import
import { formatDate } from './utils'

// 5. 타입 import
import type { JobItem } from '@/types'

// 6. 스타일 (Tailwind CSS 사용, CSS import 없음)
```

### 10.3 Environment Variables

| Variable | Purpose | Scope | Example | Status |
|----------|---------|-------|---------|--------|
| `NEXT_PUBLIC_SITE_URL` | QR 코드용 사이트 URL | Client | `https://panorama.example.com` | 향후 추가 |
| `INCRUIT_RSS_URL` | 인크루트 RSS URL | Server | `https://www.incruit.com/rss/job.asp` | 하드코딩됨 |
| `NEWS_RSS_URL` | 뉴스 RSS URL | Server | `https://news.example.com/rss` | 하드코딩됨 |

**참고**: 현재는 RSS URL이 코드에 하드코딩되어 있으나, 향후 환경변수로 이동 권장.

### 10.4 This Feature's Conventions

| Item | Convention Applied |
|------|-------------------|
| Component naming | PascalCase (예: `JobWidget.tsx`) |
| File organization | `components/widgets/`, `app/api/` |
| State management | Zustand (`stores/settings-store.ts`) |
| Data fetching | TanStack Query (hooks에서 `useQuery` 사용) |
| Error handling | try-catch + fallback UI (빈 배열, 에러 메시지) |
| Styling | Tailwind CSS (유틸리티 클래스) |

---

## 11. Implementation Guide

### 11.1 File Structure

```
panorama-korea/
├── app/
│   ├── api/
│   │   ├── jobs/route.ts              # ✅ 구현됨
│   │   ├── news/route.ts              # ✅ 구현됨
│   │   ├── calendar/route.ts          # ✅ 구현됨
│   │   ├── finance/route.ts           # ✅ 구현됨
│   │   └── weather/route.ts           # ⏳ 향후 구현
│   ├── (main)/
│   │   ├── dashboard/page.tsx         # ⏳ 구현 필요
│   │   └── layout.tsx                 # ⏳ 구현 필요
│   └── (settings)/
│       └── settings/page.tsx          # ⏳ 구현 필요
│
├── components/
│   ├── widgets/
│   │   ├── JobWidget.tsx              # ✅ 구현됨
│   │   ├── WeatherWidget.tsx          # ✅ 구현됨
│   │   ├── CalendarWidget.tsx         # ✅ 구현됨
│   │   ├── NewsWidget.tsx             # ✅ 구현됨
│   │   ├── FinanceWidget.tsx          # ✅ 구현됨
│   │   └── ClockWidget.tsx            # ✅ 구현됨
│   ├── layout/
│   │   └── DashboardGrid.tsx          # ⏳ 구현 필요
│   └── ui/
│       └── WidgetContainer.tsx        # ⏳ 향후 구현
│
├── hooks/
│   ├── useJobs.ts                     # ⏳ 향후 구현 (현재 컴포넌트에서 직접 fetch)
│   └── useSettings.ts                 # ⏳ 향후 구현
│
├── stores/
│   └── settings-store.ts              # ⏳ 구현 필요 (현재 localStorage 직접 사용)
│
├── types/
│   └── index.ts                       # ✅ 부분 구현됨 (JobItem은 컴포넌트에 정의)
│
└── lib/
    └── utils.ts                       # ✅ 구현됨 (cn, formatDate 등)
```

### 11.2 Implementation Order

#### Phase 1: 데이터 모델 통합 (1일)

1. [ ] `types/index.ts`에 모든 타입 정의 이동
   - JobItem, JobsResponse
   - PanoramaSettings
   - 기타 위젯 타입 정리

2. [ ] `app/api/jobs/route.ts` 리팩토링
   - 타입 import를 `types/index.ts`로 변경
   - RSS 파서 로직을 `lib/api/incruit-parser.ts`로 분리

#### Phase 2: 설정 시스템 구현 (1일)

3. [ ] `stores/settings-store.ts` 생성 (Zustand)
   - PanoramaSettings 타입 사용
   - localStorage 동기화
   - 초기값 설정

4. [ ] `app/(settings)/settings/page.tsx` 구현
   - 위젯 표시/숨김 토글
   - 지역 선택 드롭다운
   - 로테이션 속도 슬라이더

#### Phase 3: 대시보드 레이아웃 구현 (2일)

5. [ ] `components/layout/DashboardGrid.tsx` 생성
   - CSS Grid 레이아웃
   - 반응형 디자인 (Desktop, Tablet, Mobile)
   - settings-store에서 위젯 표시 여부 가져오기

6. [ ] `app/(main)/dashboard/page.tsx` 생성
   - DashboardGrid 통합
   - 모든 위젯 배치

#### Phase 4: 통합 및 테스트 (1일)

7. [ ] 모든 위젯이 settings-store와 연동되도록 수정
8. [ ] 터치 인터랙션 테스트 (실제 터치스크린)
9. [ ] 반응형 디자인 테스트 (다양한 화면 크기)
10. [ ] 24시간 안정성 테스트

#### Phase 5: 최적화 및 배포 (1일)

11. [ ] React Query 캐싱 최적화
12. [ ] 번들 사이즈 최적화
13. [ ] Vercel 배포
14. [ ] 실제 디지털 사이니지 환경 테스트

---

## 12. Performance Optimization

### 12.1 Data Fetching Strategy

| Widget | Polling Interval | Cache Time | Stale Time |
|--------|------------------|------------|-----------|
| JobWidget | 5분 | 10분 | 5분 |
| NewsWidget | 1분 | 5분 | 1분 |
| WeatherWidget | 10분 | 30분 | 10분 |
| CalendarWidget | 없음 (1회만) | 24시간 | 24시간 |
| FinanceWidget | 5분 | 10분 | 5분 |

**React Query 설정 예시**:
```typescript
const { data: jobs } = useQuery({
  queryKey: ['jobs', selectedCity],
  queryFn: () => fetch(`/api/jobs?city=${selectedCity}`).then(r => r.json()),
  refetchInterval: 5 * 60 * 1000, // 5분
  staleTime: 5 * 60 * 1000,       // 5분
  cacheTime: 10 * 60 * 1000,      // 10분
})
```

### 12.2 Rendering Optimization

- [ ] React.memo() 사용: 위젯 컴포넌트에 적용
- [ ] useMemo/useCallback: 비용이 큰 계산에 적용
- [ ] CSS transform 애니메이션: GPU 가속 사용
- [ ] 이미지 최적화: Next.js Image 컴포넌트 사용

### 12.3 Bundle Size Optimization

- [ ] Dynamic import: 설정 페이지는 lazy load
- [ ] Tree-shaking: 사용하지 않는 라이브러리 제거
- [ ] Code splitting: 위젯별로 chunk 분리 (필요시)

---

## 13. Deployment

### 13.1 Deployment Target

- **Frontend**: Vercel (자동 배포)
- **API**: Next.js API Routes (Vercel Serverless Functions)

### 13.2 Environment Variables (Production)

```env
NEXT_PUBLIC_SITE_URL=https://panorama-incruit.vercel.app
NODE_ENV=production
```

### 13.3 Monitoring

- [ ] Vercel Analytics 활성화
- [ ] Error tracking (Sentry 등, 향후 고려)
- [ ] API 응답 시간 모니터링

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-01-28 | Initial draft | Claude AI |
