# News Improvement - 계획서

## 1. 개선 개요

### 1.1 개선 목표
뉴스 위젯의 데이터 소스를 개선하여 더 빠르고 안정적인 뉴스 제공
- 연합뉴스: 네이버 API → RSS 직접 사용
- 응답 속도 향상
- API 키 의존성 제거

### 1.2 현재 상태 (Before)
```
네이버 버튼: 네이버 검색 API (주요 뉴스)
연합 버튼: 네이버 검색 API (연합뉴스 검색)  ← 비효율
구글 버튼: SerpAPI (Google News)
```

### 1.3 목표 상태 (After)
```
네이버 버튼: 네이버 검색 API (주요 뉴스)
연합 버튼: 연합뉴스 RSS 직접 파싱  ← 개선 완료 ✅
구글 버튼: SerpAPI (Google News)
```

## 2. 개선 사항

### 2.1 연합뉴스 RSS 직접 사용 ✅
- **RSS URL**: `https://www.yonhapnews.co.kr/rss/news.xml`
- **파싱 방식**: 정규식 기반 XML 파싱
- **장점**:
  - 네이버 API 키 불필요
  - 더 빠른 응답 속도
  - 연합뉴스 공식 데이터 직접 수신
  - 실시간 최신 뉴스

**구현 완료**: [app/api/news/route.ts:54-121](app/api/news/route.ts#L54-L121)

### 2.2 추가 개선 예정
- [ ] 네이버 뉴스도 RSS로 전환 고려
- [ ] 뉴스 이미지 섬네일 추가
- [ ] 카테고리별 뉴스 필터링
- [ ] 뉴스 즐겨찾기 기능

## 3. 기술 세부사항

### 3.1 RSS 파싱 로직
```typescript
// XML 파싱
const items = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];

// CDATA 처리
const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || '';

// HTML 엔티티 디코딩
decodeHTMLEntities(title)
```

### 3.2 에러 처리
- RSS 피드 실패 시 목업 데이터 자동 대체
- 타임아웃 처리
- 캐싱 전략: `s-maxage=600, stale-while-revalidate=300`

### 3.3 데이터 구조
```typescript
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: Date;
}
```

## 4. 개발 단계

### Phase 1: 연합뉴스 RSS 구현 ✅
- [x] RSS 피드 URL 확인
- [x] XML 파싱 로직 구현
- [x] CDATA 섹션 처리
- [x] HTML 엔티티 디코딩
- [x] API 라우트 통합
- [x] 에러 처리 추가

### Phase 2: 테스트 및 검증 (진행 중)
- [ ] 로컬 환경 테스트
- [ ] RSS 파싱 정확도 검증
- [ ] 에러 시나리오 테스트
- [ ] 성능 측정

### Phase 3: 추가 개선 (계획)
- [ ] 뉴스 이미지 섬네일 추가
- [ ] 카테고리별 RSS 피드 지원
- [ ] 뉴스 캐싱 최적화

## 5. 성공 기준

1. **기능성**: 연합뉴스 버튼 클릭 시 RSS에서 최신 뉴스 표시
2. **성능**: 응답 시간 < 2초
3. **안정성**: RSS 피드 실패 시 적절한 폴백 처리
4. **정확성**: 제목, 요약, 링크 모두 정상 표시

## 6. 리스크 및 대응

### 6.1 RSS 피드 변경
- **리스크**: 연합뉴스가 RSS 구조를 변경할 수 있음
- **대응**: 에러 발생 시 목업 데이터 표시, 로그 모니터링

### 6.2 XML 파싱 오류
- **리스크**: 정규식 기반 파싱의 한계
- **대응**: 에러 핸들링 강화, 향후 XML 파서 라이브러리 고려

### 6.3 성능
- **리스크**: RSS 피드가 느릴 수 있음
- **대응**: 캐싱 전략, 타임아웃 설정

## 7. 다음 단계

1. **Phase 2 진행**: 로컬 테스트 및 검증
2. **배포**: Vercel에 배포 후 프로덕션 테스트
3. **모니터링**: 에러 로그 확인 및 개선

## 8. 관련 파일

- API 라우트: [app/api/news/route.ts](app/api/news/route.ts)
- 뉴스 위젯: [components/widgets/NewsWidget.tsx](components/widgets/NewsWidget.tsx)
- 메인 페이지: [app/page.tsx](app/page.tsx)

---

**작성일**: 2026-01-28
**버전**: 1.0.0
**상태**: Phase 1 완료, Phase 2 진행 중
**개선 완료**: 연합뉴스 RSS 직접 사용 ✅
