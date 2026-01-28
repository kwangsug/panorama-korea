# Widgets Design Document

> **Summary**: 1920×540 해상도에 최적화된 스마트 디스플레이 위젯 시스템 설계
>
> **Project**: Panorama Korea
> **Version**: 1.0.0
> **Author**: Claude
> **Date**: 2026-01-28
> **Status**: Draft
> **Planning Doc**: [project-overview.md](../01-plan/project-overview.md)

---

## 1. Overview

### 1.1 Design Goals

- **1920×540 해상도 최적화**: 울트라와이드 디스플레이에 맞는 수평 레이아웃
- **한눈에 보는 정보**: 시계, 날씨, 뉴스를 동시에 표시
- **터치 친화적 UI**: 스마트 디스플레이용 인터랙션
- **실시간 데이터**: 자동 업데이트 시스템

### 1.2 Design Principles

- **수평 우선 레이아웃**: 3.56:1 비율에 맞는 가로 배치
- **정보 밀도 최적화**: 적절한 여백과 가독성 균형
- **일관된 시각 언어**: 통일된 카드 스타일과 색상
- **성능 최적화**: 부드러운 애니메이션과 빠른 로딩

---

## 2. Architecture

### 2.1 Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Main Dashboard (1920×540)                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────┐  ┌───────────────────────┐  ┌────────────────────────────────┐│
│  │              │  │                       │  │                                ││
│  │   Clock      │  │    Weather            │  │        News Feed               ││
│  │   Widget     │  │    Widget             │  │        Widget                  ││
│  │              │  │                       │  │                                ││
│  │   320px      │  │      480px            │  │         1080px                 ││
│  │              │  │                       │  │                                ││
│  └──────────────┘  └───────────────────────┘  └────────────────────────────────┘│
│                                                                                  │
│        20%              25%                           55%                        │
└─────────────────────────────────────────────────────────────────────────────────┘
                              Gap: 20px between widgets
```

### 2.2 Data Flow

```
User Interaction → Component State → API Client → External API
                                          ↓
                      UI Update ← Data Transform ← API Response
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| ClockWidget | None | 시간 표시 (독립적) |
| WeatherWidget | weather.ts API | 날씨 데이터 조회 |
| NewsWidget | news.ts API → /api/news route | 뉴스 데이터 조회 |

---

## 3. Screen Layout (1920×540)

### 3.1 Grid System

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  Padding: 24px                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                         Content Area: 1872×492                            │  │
│  │                                                                           │  │
│  │  ┌─────────┐  ┌─────────────────┐  ┌─────────────────────────────────┐   │  │
│  │  │         │  │                 │  │                                 │   │  │
│  │  │  Clock  │  │    Weather      │  │           News                  │   │  │
│  │  │         │  │                 │  │                                 │   │  │
│  │  │  320px  │  │     480px       │  │          1032px                 │   │  │
│  │  │         │  │                 │  │                                 │   │  │
│  │  │  h:492  │  │     h:492       │  │           h:492                 │   │  │
│  │  │         │  │                 │  │                                 │   │  │
│  │  └─────────┘  └─────────────────┘  └─────────────────────────────────┘   │  │
│  │      Gap: 20px       Gap: 20px                                            │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────┘

Total Width: 1920px
Total Height: 540px
Padding: 24px
Content Width: 1872px (1920 - 48)
Content Height: 492px (540 - 48)
Widget Gap: 20px
```

### 3.2 Widget Dimensions

| Widget | Width | Height | Flex Ratio |
|--------|-------|--------|------------|
| Clock | 320px | 492px | 0 0 320px |
| Weather | 480px | 492px | 0 0 480px |
| News | 1032px (remaining) | 492px | 1 1 auto |

### 3.3 Responsive Breakpoints

| Breakpoint | Layout | Description |
|------------|--------|-------------|
| 1920px (target) | 3-column horizontal | 기본 스마트 디스플레이 |
| 1280px | 2-column | Clock+Weather / News |
| 768px | 1-column vertical | 모바일 폴백 |

---

## 4. Widget Specifications

### 4.1 ClockWidget (320×492)

```
┌────────────────────────────────────┐
│         현재 시간                    │
│                                     │
│                                     │
│     ┌──┐ ┌──┐   ┌──┐ ┌──┐         │
│     │1 │ │2 │ : │3 │ │4 │         │
│     └──┘ └──┘   └──┘ └──┘         │
│       HH    :    MM               │
│                                     │
│     ┌──┐ ┌──┐                      │
│     │5 │ │6 │    초                │
│     └──┘ └──┘                      │
│        SS                          │
│                                     │
│   2026년 1월 28일 화요일            │
│                                     │
└────────────────────────────────────┘
```

**Features**:
- 3D Flip Card 애니메이션
- 시:분 대형 표시 (72px)
- 초 중형 표시 (48px)
- 날짜 한글 표시

**Animation**:
- flip-top, flip-bottom keyframes
- Duration: 600ms
- Transform: rotateX with perspective

### 4.2 WeatherWidget (480×492)

```
┌──────────────────────────────────────────────────┐
│  📍 서울                              🔄 새로고침 │
├──────────────────────────────────────────────────┤
│                                                   │
│       ☀️                   현재 날씨              │
│      (80px)                                      │
│                                                   │
│              -3°C                                │
│            맑음                                   │
│                                                   │
│   💧 45%        💨 3.2m/s                        │
│                                                   │
├──────────────────────────────────────────────────┤
│  5일 예보                                         │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐            │
│  │ 월 │ │ 화 │ │ 수 │ │ 목 │ │ 금 │            │
│  │ ☀️ │ │ ☁️ │ │ 🌧️ │ │ ☀️ │ │ ☀️ │            │
│  │2/-5│ │3/-3│ │1/-2│ │4/-1│ │5/0 │            │
│  └────┘ └────┘ └────┘ └────┘ └────┘            │
└──────────────────────────────────────────────────┘
```

**Layout Structure**:
- Header: 도시명 + 새로고침 버튼 (h: 48px)
- Current Weather: 아이콘, 온도, 상태 (h: 280px)
- Forecast: 5일 예보 그리드 (h: 140px)

**Data**:
- 현재 온도, 상태, 습도, 풍속
- 5일 예보: 날짜, 아이콘, 최고/최저 온도

### 4.3 NewsWidget (1032×492)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  📰 주요 뉴스                                              네이버 ▼  🔄 새로고침 │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌────────────────────────────────────────┐  ┌────────────────────────────────┐│
│  │ 🖼️ │ 제목 1: 주요 뉴스 헤드라인...      │  │ 🖼️ │ 제목 4: 경제 뉴스...        ││
│  │    │ 요약 텍스트가 여기에 표시됩니다    │  │    │ 요약 텍스트                 ││
│  │    │ 연합뉴스 · 5분 전                  │  │    │ 한경 · 15분 전              ││
│  ├────────────────────────────────────────┤  ├────────────────────────────────┤│
│  │ 🖼️ │ 제목 2: IT/과학 뉴스...           │  │ 🖼️ │ 제목 5: 사회 뉴스...        ││
│  │    │ 요약 텍스트                        │  │    │ 요약 텍스트                 ││
│  │    │ 조선일보 · 10분 전                 │  │    │ MBC · 20분 전               ││
│  ├────────────────────────────────────────┤  └────────────────────────────────┘│
│  │ 🖼️ │ 제목 3: 정치 뉴스...              │                                    │
│  │    │ 요약 텍스트                        │                                    │
│  │    │ KBS · 12분 전                      │                                    │
│  └────────────────────────────────────────┘                                    │
│                                                                                 │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Layout Structure**:
- Header: 제목 + 소스 선택 + 새로고침 (h: 48px)
- News Grid: 2열 × 3행 (총 5-6개 뉴스) (h: 420px)

**News Item**:
- 썸네일 (80×60px, optional)
- 제목 (1-2줄, max 50자)
- 요약 (1줄, max 80자)
- 출처 + 시간

---

## 5. Data Model

### 5.1 Entity Definition

```typescript
// WeatherData (현재 날씨)
interface WeatherData {
  temperature: number;      // 현재 온도 (°C)
  condition: string;        // 날씨 상태 (한글)
  conditionIcon: string;    // OpenWeatherMap 아이콘 코드
  humidity: number;         // 습도 (%)
  windSpeed: number;        // 풍속 (m/s)
  location: string;         // 도시명
  updatedAt: Date;          // 업데이트 시간
}

// WeatherForecast (예보)
interface WeatherForecast {
  date: string;             // 날짜 (YYYY-MM-DD)
  maxTemp: number;          // 최고 온도
  minTemp: number;          // 최저 온도
  condition: string;        // 날씨 상태
  conditionIcon: string;    // 아이콘 코드
  precipitation: number;    // 강수 확률 (%)
}

// NewsItem (뉴스)
interface NewsItem {
  id: string;               // 고유 ID
  title: string;            // 뉴스 제목
  summary: string;          // 요약
  url: string;              // 원문 링크
  source: string;           // 출처 (언론사)
  publishedAt: Date;        // 발행 시간
  imageUrl?: string;        // 썸네일 URL (optional)
}

// UserSettings (사용자 설정)
interface UserSettings {
  widgets: {
    clock: boolean;         // 시계 표시
    weather: boolean;       // 날씨 표시
    news: boolean;          // 뉴스 표시
  };
  location: CityName;       // 선택된 도시
  newsSource: 'naver' | 'yonhap';  // 뉴스 소스
  autoRefresh: boolean;     // 자동 새로고침
  refreshInterval: number;  // 새로고침 주기 (ms)
}

// CityName (지원 도시)
type CityName = 'Seoul' | 'Busan' | 'Incheon' | 'Daegu' |
               'Daejeon' | 'Gwangju' | 'Ulsan' | 'Sejong';
```

---

## 6. API Specification

### 6.1 External APIs

| API | Purpose | Rate Limit | Cache |
|-----|---------|-----------|-------|
| OpenWeatherMap 3.0 | 날씨 데이터 | 1000/day | 10분 |
| Naver News Search | 뉴스 데이터 | 25000/day | 10분 |

### 6.2 Internal API

#### `GET /api/news`

**Query Parameters**:
- `source`: 'naver' | 'yonhap' (default: 'naver')

**Response (200 OK)**:
```json
[
  {
    "id": "news_1",
    "title": "뉴스 제목",
    "summary": "뉴스 요약",
    "url": "https://...",
    "source": "연합뉴스",
    "publishedAt": "2026-01-28T10:00:00Z",
    "imageUrl": "https://..."
  }
]
```

---

## 7. Component Structure

### 7.1 File Organization

```
components/
├── widgets/
│   ├── ClockWidget.tsx      # 시계 위젯
│   ├── WeatherWidget.tsx    # 날씨 위젯
│   ├── NewsWidget.tsx       # 뉴스 위젯
│   └── index.ts             # 배럴 export
│
├── ui/
│   ├── Card.tsx             # 위젯 카드 컨테이너
│   ├── RefreshButton.tsx    # 새로고침 버튼
│   ├── Skeleton.tsx         # 로딩 스켈레톤
│   └── index.ts
│
└── layout/
    ├── Dashboard.tsx        # 1920×540 대시보드 레이아웃
    └── SettingsSidebar.tsx  # 설정 사이드바
```

### 7.2 Component Hierarchy

```
App (page.tsx)
├── Dashboard
│   ├── ClockWidget
│   │   ├── FlipCard (digit)
│   │   └── Separator
│   │
│   ├── WeatherWidget
│   │   ├── CurrentWeather
│   │   └── ForecastList
│   │       └── ForecastItem (×5)
│   │
│   └── NewsWidget
│       ├── NewsHeader
│       └── NewsGrid
│           └── NewsItem (×5)
│
└── SettingsSidebar (conditional)
    └── SettingsForm
```

---

## 8. Styling Guidelines

### 8.1 Color Palette

```css
/* Background */
--bg-gradient: linear-gradient(135deg, #0f172a, #1e3a5f, #0f172a);
--bg-card: rgba(255, 255, 255, 0.1);
--bg-card-hover: rgba(255, 255, 255, 0.15);

/* Text */
--text-primary: #ffffff;
--text-secondary: #94a3b8;
--text-muted: #64748b;

/* Accent */
--accent-blue: #3b82f6;
--accent-green: #22c55e;
--accent-yellow: #eab308;
--accent-red: #ef4444;

/* Border */
--border-light: rgba(255, 255, 255, 0.1);
--border-medium: rgba(255, 255, 255, 0.2);
```

### 8.2 Typography

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Clock (HH:MM) | 72px | 700 | 1 |
| Clock (SS) | 48px | 600 | 1 |
| Temperature | 48px | 700 | 1.2 |
| Widget Title | 18px | 600 | 1.4 |
| News Title | 16px | 500 | 1.4 |
| Body Text | 14px | 400 | 1.5 |
| Caption | 12px | 400 | 1.4 |

### 8.3 Card Style

```css
.widget-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
}

.widget-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}
```

---

## 9. Implementation Guide

### 9.1 Implementation Order

1. [ ] **Dashboard Layout** - 1920×540 3-column flexbox 레이아웃
2. [ ] **ClockWidget 최적화** - 수평 레이아웃용 크기 조정
3. [ ] **WeatherWidget 최적화** - 수직 스택 레이아웃
4. [ ] **NewsWidget 최적화** - 2열 그리드 뉴스 목록
5. [ ] **Settings 연동** - localStorage 기반 설정 적용
6. [ ] **반응형 처리** - 1280px, 768px 브레이크포인트

### 9.2 Key CSS for 1920×540

```css
/* Dashboard Container */
.dashboard {
  width: 1920px;
  height: 540px;
  padding: 24px;
  display: flex;
  gap: 20px;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
  overflow: hidden;
}

/* Widget Sizing */
.clock-widget {
  flex: 0 0 320px;
  height: 100%;
}

.weather-widget {
  flex: 0 0 480px;
  height: 100%;
}

.news-widget {
  flex: 1;
  height: 100%;
}
```

### 9.3 Responsive Strategy

```css
/* 1280px - 2 columns */
@media (max-width: 1280px) {
  .dashboard {
    flex-wrap: wrap;
  }
  .clock-widget,
  .weather-widget {
    flex: 0 0 calc(50% - 10px);
  }
  .news-widget {
    flex: 0 0 100%;
  }
}

/* 768px - 1 column */
@media (max-width: 768px) {
  .dashboard {
    width: 100%;
    height: auto;
    flex-direction: column;
    padding: 16px;
  }
  .clock-widget,
  .weather-widget,
  .news-widget {
    flex: 0 0 auto;
    width: 100%;
  }
}
```

---

## 10. Auto-Refresh Strategy

| Widget | Interval | Trigger |
|--------|----------|---------|
| Clock | 1초 | setInterval |
| Weather | 10분 | setInterval + 버튼 |
| News | 30분 | setInterval + 버튼 |

```typescript
// Auto-refresh hooks
useEffect(() => {
  const weatherInterval = setInterval(fetchWeather, 600000);  // 10분
  const newsInterval = setInterval(fetchNews, 1800000);       // 30분

  return () => {
    clearInterval(weatherInterval);
    clearInterval(newsInterval);
  };
}, []);
```

---

## 11. Error Handling

### 11.1 Error States

| Error Type | UI Response |
|------------|-------------|
| API 실패 | Mock 데이터로 폴백 + 에러 표시 |
| 네트워크 오류 | 재시도 버튼 표시 |
| 로딩 중 | 스켈레톤 UI |

### 11.2 Fallback Strategy

```typescript
// Weather fallback
if (!weather) {
  return <WeatherSkeleton />;
}

// News fallback
if (newsError) {
  return <MockNewsDisplay />;
}
```

---

## 12. Test Checklist

- [ ] 1920×540 해상도에서 정상 표시
- [ ] 시계 flip 애니메이션 동작
- [ ] 날씨 데이터 로드 및 표시
- [ ] 뉴스 5개 정상 표시
- [ ] 새로고침 버튼 동작
- [ ] 설정 변경 후 반영
- [ ] 1280px, 768px 반응형 레이아웃

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-01-28 | Initial draft - 1920×540 layout design | Claude |
