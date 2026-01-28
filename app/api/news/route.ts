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
 * 뉴스 검색 API (네이버 + 구글)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source') || 'naver'; // naver, yonhap, google
  const city = searchParams.get('city') || '';

  // 구글 뉴스 요청 처리
  if (source === 'google') {
    return handleGoogleNews(city);
  }

  // 네이버 뉴스 요청 처리
  return handleNaverNews(source, city);
}

/**
 * 네이버 뉴스 검색 API
 */
async function handleNaverNews(source: string, city: string) {
  const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_NAVER_CLIENT_SECRET;

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
    // 소스별 검색 쿼리 설정
    let query = '주요 뉴스'; // 기본값
    if (source === 'yonhap') {
      query = '연합뉴스';
    }

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

    // 네이버 API 응답을 NewsItem 형식으로 변환
    const news: NewsItem[] = data.items.map((item: any, index: number) => ({
      id: `${Date.now()}-${index}`,
      title: item.title.replace(/<\/?b>/g, ''), // HTML 태그 제거
      summary: item.description.replace(/<\/?b>/g, '').slice(0, 150),
      url: item.link,
      source: extractSource(item.title),
      publishedAt: new Date(item.pubDate),
    }));

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

    // SerpAPI 응답을 NewsItem 형식으로 변환
    const news: NewsItem[] = (data.news_results || []).slice(0, 20).map((item: any, index: number) => ({
      id: `google-${Date.now()}-${index}`,
      title: item.title || '',
      summary: item.snippet || item.highlight?.snippet || '',
      url: item.link || '',
      source: item.source?.name || 'Google News',
      publishedAt: item.date ? new Date(item.date) : new Date(),
    }));

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
