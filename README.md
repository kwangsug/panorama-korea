# Panorama Korea 🇰🇷

한국형 스마트 디스플레이 웹 애플리케이션

## 소개

Panorama Korea는 날씨, 캘린더, 뉴스, 교통 정보를 한눈에 볼 수 있는 스마트 디스플레이 애플리케이션입니다.

**원본 프로젝트**: [Panorama](https://panorama-2ps.pages.dev/) (일본판)

## 주요 기능

- ☀️ **날씨 정보**: 한국 기상청 API를 활용한 실시간 날씨 및 예보
- 📅 **캘린더**: 한국 공휴일, 음력 정보, 개인 일정 관리
- 📰 **뉴스 피드**: 주요 뉴스 헤드라인 실시간 업데이트
- 🚇 **교통 정보**: 실시간 대중교통 정보 및 교통 상황

## 기술 스택

- **Frontend**: Next.js 14+ (App Router), React 19, TypeScript
- **Backend**: bkend.ai BaaS
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Data Fetching**: TanStack Query
- **Deployment**: Vercel

## 시작하기

### 사전 요구사항

- Node.js 18+
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.local .env.local.example
# .env.local 파일을 열어 필요한 API 키를 입력하세요
```

### 필요한 API 키

1. **bkend.ai**: https://console.bkend.ai 에서 프로젝트 생성
2. **기상청 API**: https://data.go.kr 에서 발급
3. **뉴스 API** (선택): 원하는 뉴스 API 서비스 선택
4. **교통 API** (선택): 서울 열린데이터광장 또는 공공데이터포털

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3501](http://localhost:3501)을 열어 확인하세요.

### 배포된 사이트

**Vercel**: [https://panorama-internal.vercel.app](https://panorama-internal.vercel.app)

## 프로젝트 구조

```
panorama-korea/
├── app/              # Next.js App Router 페이지
├── components/       # React 컴포넌트
│   ├── widgets/     # 위젯 컴포넌트
│   └── ui/          # 기본 UI 컴포넌트
├── hooks/           # Custom React Hooks
├── lib/             # 유틸리티 및 API 클라이언트
├── stores/          # Zustand 상태 관리
├── types/           # TypeScript 타입 정의
└── docs/            # PDCA 문서
```

## 배포

### Vercel에 배포

```bash
npm run build
```

Vercel에 연결하면 자동으로 배포됩니다.

## 개발 가이드

이 프로젝트는 bkit의 Dynamic 레벨로 개발되었습니다.

- [CLAUDE.md](./CLAUDE.md) - 프로젝트 상세 정보
- [docs/](./docs/) - PDCA 문서 및 설계 문서

## 라이선스

MIT

## 기여

이슈와 PR은 언제든지 환영합니다!
