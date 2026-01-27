# 무료 배포 가이드

## 1. pages.dev는 무엇인가요?

**pages.dev**는 **Cloudflare Pages**의 기본 도메인입니다.

- 원본 Panorama (https://panorama-2ps.pages.dev/)가 사용 중
- Cloudflare의 글로벌 CDN으로 매우 빠른 속도
- 무료 플랜으로도 충분히 사용 가능

## 2. 무료 호스팅 비교

### 🥇 Vercel (추천)

**장점:**
- ✅ Next.js를 만든 회사 (최고의 호환성)
- ✅ 자동 배포, 프리뷰 URL
- ✅ 환경 변수 관리 편리
- ✅ 서버리스 함수 지원
- ✅ 도메인: `your-app.vercel.app`

**무료 플랜:**
- 무제한 배포
- 100GB 대역폭/월
- Hobby 프로젝트에 충분

**추천 이유:** Next.js 프로젝트에 가장 최적화됨

---

### 🥈 Cloudflare Pages (pages.dev)

**장점:**
- ✅ 빠른 글로벌 CDN
- ✅ 무제한 대역폭 (무료!)
- ✅ 자동 HTTPS
- ✅ 도메인: `your-app.pages.dev`

**무료 플랜:**
- 무제한 사이트
- 무제한 대역폭
- 500 빌드/월

**추천 이유:** 원본 Panorama와 동일한 플랫폼 사용 가능

---

### 🥉 Firebase Hosting

**장점:**
- ✅ Google 서비스와 통합 (Firestore, Auth 등)
- ✅ 빠른 CDN
- ✅ 도메인: `your-app.web.app` 또는 `your-app.firebaseapp.com`

**무료 플랜:**
- 10GB 저장공간
- 360MB/일 전송량
- 소규모 프로젝트에 적합

**추천 이유:** 나중에 Firebase 서비스 추가 시 편리

---

## 3. 배포 방법

### 방법 1: Vercel (가장 쉬움) ⭐

#### 단계 1: GitHub에 코드 푸시

```bash
cd /Users/starkid/panorama-korea/panorama-korea
git init
git add .
git commit -m "Initial commit"
git branch -M main
# GitHub에 새 저장소 생성 후
git remote add origin https://github.com/your-username/panorama-korea.git
git push -u origin main
```

#### 단계 2: Vercel 배포

1. https://vercel.com 접속 및 GitHub 로그인
2. "New Project" 클릭
3. GitHub 저장소 선택 (panorama-korea)
4. "Deploy" 클릭 (설정 변경 없이)
5. 완료! `your-app.vercel.app`에서 확인

#### 환경 변수 설정 (선택)

나중에 API 키 추가 시:
1. Vercel Dashboard → Settings → Environment Variables
2. `.env.local`의 변수들을 추가

---

### 방법 2: Cloudflare Pages (pages.dev)

#### 단계 1: GitHub에 코드 푸시 (위와 동일)

#### 단계 2: Cloudflare Pages 설정

1. https://pages.cloudflare.com/ 접속
2. "Create a project" 클릭
3. GitHub 저장소 연결
4. 빌드 설정:
   - Framework preset: **Next.js**
   - Build command: `npm run build`
   - Build output directory: `.next`
5. "Save and Deploy"
6. 완료! `your-app.pages.dev`에서 확인

---

### 방법 3: Firebase Hosting

#### 단계 1: Firebase CLI 설치

```bash
npm install -g firebase-tools
```

#### 단계 2: Firebase 프로젝트 생성

1. https://console.firebase.google.com/ 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름: panorama-korea

#### 단계 3: Firebase 초기화

```bash
cd /Users/starkid/panorama-korea/panorama-korea
firebase login
firebase init hosting
```

설정:
- Use existing project → panorama-korea 선택
- Public directory: `out`
- Single-page app: **Yes**
- GitHub 자동 배포: **Yes** (선택)

#### 단계 4: Next.js 정적 내보내기 설정

`next.config.ts` 수정:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Firebase용 정적 내보내기
};

export default nextConfig;
```

#### 단계 5: 빌드 및 배포

```bash
npm run build
firebase deploy
```

완료! `your-app.web.app`에서 확인

---

## 4. 추천 순서

### 초보자 / 빠른 배포
→ **Vercel** (클릭 몇 번으로 완료)

### 원본과 동일한 환경
→ **Cloudflare Pages** (pages.dev 도메인)

### Firebase 서비스 사용 예정
→ **Firebase Hosting**

---

## 5. 무료 플랜 제한 비교

| 항목 | Vercel | Cloudflare Pages | Firebase |
|------|--------|------------------|----------|
| 대역폭 | 100GB/월 | **무제한** | 360MB/일 (~10GB/월) |
| 빌드 수 | 무제한 | 500/월 | 무제한 |
| 함수 실행 | 100시간/월 | 100,000 요청/일 | - |
| 도메인 | vercel.app | pages.dev | web.app |

---

## 6. 다음 단계

1. **위 방법 중 하나 선택**
2. **배포 완료 후 URL 확인**
3. **API 연동 시작** (날씨, 뉴스 등)

어떤 플랫폼으로 배포하시겠어요?
