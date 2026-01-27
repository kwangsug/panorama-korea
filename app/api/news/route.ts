import { NextResponse } from 'next/server';
import { getMockNews } from '@/lib/api/news';
import type { NewsItem } from '@/types';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * 네이버 뉴스 검색 API
 */
export async function GET() {
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
    // 네이버 뉴스 검색 API 호출
    const query = encodeURIComponent('뉴스');
    const url = `https://openapi.naver.com/v1/search/news.json?query=${query}&display=10&sort=date`;

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
