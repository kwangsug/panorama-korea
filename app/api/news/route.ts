import { NextResponse } from 'next/server';
import { getMockNews } from '@/lib/api/news';
import type { NewsItem } from '@/types';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// 도시명 매핑 (영어 -> 한글)
const CITY_NAME_MAP: Record<string, string> = {
  Seoul: '서울',
  Busan: '부산',
  Daegu: '대구',
  Incheon: '인천',
  Gwangju: '광주',
  Daejeon: '대전',
  Ulsan: '울산',
  Gyeonggi: '경기',
  Gangwon: '강원',
  Chungbuk: '충북',
  Chungnam: '충남',
  Sejong: '세종',
  Jeonbuk: '전북',
  Jeonnam: '전남',
  Gyeongbuk: '경북',
  Gyeongnam: '경남',
  Jeju: '제주',
};

/**
 * 뉴스 검색 API (네이버 + 연합 + 구글)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source') || 'naver'; // naver, yonhap, google
  const city = searchParams.get('city') || '';

  // 구글 뉴스 요청 처리
  if (source === 'google') {
    return handleGoogleNews(city);
  }

  // 연합뉴스 RSS 요청 처리
  if (source === 'yonhap') {
    return handleYonhapRSS();
  }

  // 네이버 뉴스 요청 처리
  return handleNaverNews(city);
}

/**
 * 연합뉴스 RSS 피드
 */
async function handleYonhapRSS() {
  try {
    // 연합뉴스 종합 RSS 피드
    const rssUrl = 'https://www.yonhapnews.co.kr/rss/news.xml';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8초 타임아웃

    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PanoramaKorea/1.0)',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`연합뉴스 RSS HTTP 오류: ${response.status}`);
      throw new Error(`연합뉴스 RSS 오류: ${response.status}`);
    }

    const xmlText = await response.text();

    if (!xmlText || xmlText.length === 0) {
      console.error('연합뉴스 RSS 응답이 비어있음');
      throw new Error('RSS 응답이 비어있음');
    }

    // XML 파싱 (간단한 정규식 사용)
    const items = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];

    if (items.length === 0) {
      console.error('연합뉴스 RSS에서 <item> 태그를 찾을 수 없음');
      throw new Error('RSS에서 뉴스 항목을 찾을 수 없음');
    }

    console.log(`연합뉴스 RSS: ${items.length}개 항목 발견`);

    const news: NewsItem[] = items.slice(0, 20).map((item, index) => {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
                    item.match(/<title>(.*?)<\/title>/)?.[1] || '';
      const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ||
                         item.match(/<description>(.*?)<\/description>/)?.[1] || '';
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || '';
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';

      // 요약문에서 HTML 태그 제거 및 길이 제한
      const cleanSummary = description
        .replace(/<[^>]*>/g, '')
        .replace(/&[^;]+;/g, (entity) => {
          const entities: Record<string, string> = {
            '&quot;': '"', '&apos;': "'", '&amp;': '&',
            '&lt;': '<', '&gt;': '>', '&#39;': "'",
          };
          return entities[entity] || entity;
        })
        .slice(0, 150);

      return {
        id: `yonhap-${Date.now()}-${index}`,
        title: decodeHTMLEntities(title),
        summary: cleanSummary,
        url: link,
        source: '연합뉴스',
        publishedAt: pubDate ? new Date(pubDate) : new Date(),
      };
    }).filter((item: NewsItem) => item.title && !isMeaninglessTitle(item.title));

    console.log(`연합뉴스 RSS: 필터링 후 ${news.length}개 뉴스 반환`);

    if (news.length === 0) {
      console.warn('연합뉴스 RSS: 유효한 뉴스 없음, 목업 데이터 반환');
      return NextResponse.json(
        { news: getMockNews(), source: 'mock' },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
          },
        }
      );
    }

    return NextResponse.json(
      { news, source: 'yonhap' },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('연합뉴스 RSS 오류:', errorMessage);

    // 에러 시 목업 데이터 반환
    return NextResponse.json(
      { news: getMockNews(), source: 'mock', error: errorMessage },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    );
  }
}

/**
 * 네이버 뉴스 검색 API
 */
async function handleNaverNews(city: string) {
  // 네이버 키는 server-only로 변경 (NEXT_PUBLIC_ 접두사는 브라우저 번들에 시크릿 노출됨)
  // 하위 호환을 위해 NEXT_PUBLIC_*도 fallback으로 한 번 더 본다.
  const clientId = process.env.NAVER_CLIENT_ID || process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET || process.env.NEXT_PUBLIC_NAVER_CLIENT_SECRET;

  // API 키가 없으면 목업 데이터 반환
  if (!clientId || !clientSecret) {
    console.log('네이버 API 키 없음 - 목업 데이터 사용');
    return NextResponse.json(
      { news: getMockNews(), source: 'mock' },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300',
        },
      }
    );
  }

  try {
    // 검색 쿼리 설정
    let query = '주요 뉴스'; // 기본값

    // 지역이 선택된 경우 지역 뉴스 검색
    if (city && CITY_NAME_MAP[city]) {
      query = `${CITY_NAME_MAP[city]} 뉴스`;
    }

    // 네이버 뉴스 검색 API 호출
    const encodedQuery = encodeURIComponent(query);
    const url = `https://openapi.naver.com/v1/search/news.json?query=${encodedQuery}&display=20&sort=date`;

    const response = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!response.ok) {
      throw new Error(`네이버 API 오류: ${response.status}`);
    }

    const data = await response.json();

    // 네이버 API 응답을 NewsItem 형식으로 변환 및 의미 없는 제목 필터링
    const news: NewsItem[] = data.items
      .map((item: any, index: number) => {
        const cleanTitle = decodeHTMLEntities(item.title.replace(/<\/?b>/g, ''));
        const cleanSummary = decodeHTMLEntities(item.description.replace(/<\/?b>/g, '')).slice(0, 150);
        return {
          id: `${Date.now()}-${index}`,
          title: cleanTitle,
          summary: cleanSummary,
          url: item.link,
          source: extractSource(cleanTitle),
          publishedAt: new Date(item.pubDate),
        };
      })
      .filter((item: NewsItem) => !isMeaninglessTitle(item.title));

    return NextResponse.json(
      { news, source: 'naver' },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('네이버 뉴스 API 오류:', error);

    // 에러 시 목업 데이터 반환
    return NextResponse.json(
      { news: getMockNews(), source: 'mock', error: String(error) },
      { status: 200 }
    );
  }
}

/**
 * 구글 뉴스 API (SerpAPI)
 */
async function handleGoogleNews(city: string) {
  const apiKey = process.env.SERPAPI_API_KEY;

  // API 키가 없으면 목업 데이터 반환
  if (!apiKey) {
    console.log('SerpAPI 키 없음 - 목업 데이터 사용');
    return NextResponse.json(
      { news: getMockNews(), source: 'mock' },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300',
        },
      }
    );
  }

  try {
    // 검색 쿼리 설정 (지역 포함)
    let query = '한국 뉴스';
    if (city && CITY_NAME_MAP[city]) {
      query = `${CITY_NAME_MAP[city]} 뉴스`;
    }

    // SerpAPI Google News 호출
    const url = `https://serpapi.com/search.json?engine=google_news&q=${encodeURIComponent(query)}&gl=kr&hl=ko&api_key=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`SerpAPI 오류: ${response.status}`);
    }

    const data = await response.json();

    // SerpAPI 응답을 NewsItem 형식으로 변환 및 의미 없는 제목 필터링
    const news: NewsItem[] = (data.news_results || [])
      .slice(0, 20)
      .map((item: any, index: number) => {
        const cleanTitle = decodeHTMLEntities(item.title || '');
        const cleanSummary = decodeHTMLEntities(item.snippet || item.highlight?.snippet || '');
        return {
          id: `google-${Date.now()}-${index}`,
          title: cleanTitle,
          summary: cleanSummary,
          url: item.link || '',
          source: item.source?.name || 'Google News',
          publishedAt: item.date ? new Date(item.date) : new Date(),
        };
      })
      .filter((item: NewsItem) => !isMeaninglessTitle(item.title));

    return NextResponse.json(
      { news, source: 'google' },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('구글 뉴스 API 오류:', error);

    // 에러 시 목업 데이터 반환
    return NextResponse.json(
      { news: getMockNews(), source: 'mock', error: String(error) },
      { status: 200 }
    );
  }
}

/**
 * HTML 엔티티 디코딩
 */
function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    '&quot;': '"',
    '&apos;': "'",
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&#39;': "'",
    '&#x27;': "'",
    '&#x2F;': '/',
  };

  return text.replace(/&[^;]+;/g, (entity) => entities[entity] || entity);
}

/**
 * 의미 없는 제목인지 확인
 */
function isMeaninglessTitle(title: string): boolean {
  const meaninglessPatterns = [
    '이 시각 주요 뉴스',
    '이시각 주요뉴스',
    '주요 뉴스',
    '주요뉴스',
    '이 시각 뉴스',
    '이시각 뉴스',
    '속보 모음',
    '뉴스 모음',
  ];

  // 정확히 일치하거나 너무 짧은 제목 필터링
  const trimmedTitle = title.trim();
  if (trimmedTitle.length < 10) return true;

  return meaninglessPatterns.some(pattern =>
    trimmedTitle === pattern || trimmedTitle.startsWith(pattern)
  );
}

/**
 * 뉴스 제목에서 언론사 추출 (간단한 휴리스틱)
 */
function extractSource(title: string): string {
  const sources = ['연합뉴스', 'KBS', 'MBC', 'SBS', 'JTBC', '조선일보', '중앙일보', '동아일보', '한겨레'];

  for (const source of sources) {
    if (title.includes(source)) {
      return source;
    }
  }

  return '뉴스';
}
