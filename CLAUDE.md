# Panorama Korea - 스마트 디스플레이 애플리케이션

## 프로젝트 개요

한국형 스마트 디스플레이 웹 애플리케이션으로, 날씨, 캘린더/일정, 뉴스, 교통 정보를 통합하여 제공합니다.

**원본**: https://panorama-2ps.pages.dev/ (일본판 참고)

## 프로젝트 레벨

**Level**: Dynamic (Intermediate)

- Frontend: Next.js 14+ with App Router
- Backend: bkend.ai BaaS
- State Management: Zustand
- Data Fetching: TanStack Query
- Styling: Tailwind CSS

## 핵심 기능

1. **날씨 정보**: 한국 기상청 API 연동, 실시간 날씨 표시
2. **캘린더/일정**: 한국 공휴일, 음력 정보, 개인 일정 관리
3. **뉴스 피드**: 한국 주요 뉴스 헤드라인 표시
4. **교통 정보**: 실시간 교통 상황, 대중교통 정보

## 프로젝트 구조

```
panorama-korea/
├── app/                    # Next.js App Router
│   ├── (main)/            # 메인 디스플레이
│   │   ├── dashboard/     # 대시보드 (모든 위젯)
│   │   ├── weather/       # 날씨 상세
│   │   ├── calendar/      # 캘린더 상세
│   │   └── news/          # 뉴스 상세
│   ├── (settings)/        # 설정 페이지
│   │   └── settings/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/             # UI 컴포넌트
│   ├── widgets/           # 위젯 컴포넌트
│   │   ├── WeatherWidget.tsx
│   │   ├── CalendarWidget.tsx
│   │   ├── NewsWidget.tsx
│   │   └── TrafficWidget.tsx
│   └── ui/                # 기본 UI 컴포넌트
│
├── hooks/                  # Custom hooks
│   ├── useWeather.ts
│   ├── useCalendar.ts
│   └── useNews.ts
│
├── lib/                    # 유틸리티
│   ├── bkend.ts           # bkend.ai 클라이언트
│   ├── api/               # API 클라이언트
│   │   ├── weather.ts
│   │   ├── news.ts
│   │   └── traffic.ts
│   └── utils.ts
│
├── stores/                 # 상태 관리
│   └── settings-store.ts  # 사용자 설정
│
├── types/                  # TypeScript 타입
│   └── index.ts
│
└── docs/                   # PDCA 문서
    ├── 01-plan/
    ├── 02-design/
    ├── 03-analysis/
    └── 04-report/
```

## 개발 가이드

### 환경 설정

1. `.env.local` 파일에 필요한 API 키 설정
2. bkend.ai 프로젝트 생성 및 API 키 발급
3. 한국 기상청 API 키 발급 (https://data.go.kr)

### 로컬 실행

```bash
npm install
npm run dev
```

### PDCA 사이클

- Plan: 기능 계획 수립
- Design: 데이터 모델 및 API 설계
- Do: 구현
- Check: Gap 분석 및 검증
- Act: 개선 반복

## API 통합

### 날씨 API (기상청)

- 단기예보 조회
- 초단기실황 조회
- 중기예보 조회

### 뉴스 API

- RSS 피드 또는 뉴스 API 활용
- 주요 언론사 헤드라인 수집

### 교통 API

- 서울 열린데이터광장
- 공공데이터포털 대중교통 API

## 배포

- Frontend: Vercel
- Backend: bkend.ai (자동 배포)

## 라이선스

MIT

## 기여

이슈와 PR은 언제든지 환영합니다.
