import { NextRequest, NextResponse } from 'next/server';
import { getMockNews, NEWS_FEEDS, type NewsFeedName } from '@/lib/api/news';
import type { NewsItem } from '@/types';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * RSS 피드를 서버에서 가져와서 파싱
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const feed = (searchParams.get('feed') || '연합뉴스') as NewsFeedName;

  try {
    const rssUrl = NEWS_FEEDS[feed];

    if (!rssUrl) {
      return NextResponse.json({ error: '잘못된 피드 이름' }, { status: 400 });
    }

    // RSS XML 가져오기
    const response = await fetch(rssUrl, {
      next: { revalidate: 600 }, // 10분 캐시
    });

    if (!response.ok) {
      throw new Error(`RSS 피드 오류: ${response.status}`);
    }

    const xmlText = await response.text();

    // RSS XML 파싱
    const news = parseRSSFeed(xmlText, feed);

    return NextResponse.json(
      { news, feed },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('뉴스 RSS 파싱 오류:', error);

    // 에러 시 목업 데이터 반환
    return NextResponse.json(
      { news: getMockNews(), feed, error: '목업 데이터' },
      { status: 200 }
    );
  }
}

/**
 * RSS XML을 파싱하여 뉴스 목록 반환
 */
function parseRSSFeed(xmlText: string, source: string): NewsItem[] {
  const news: NewsItem[] = [];

  // 정규표현식으로 item 태그 추출
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const items = xmlText.match(itemRegex) || [];

  items.slice(0, 10).forEach((item, index) => {
    // title 추출
    const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/);
    const title = titleMatch
      ? titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim()
      : '';

    // link 추출
    const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);
    const link = linkMatch ? linkMatch[1].trim() : '#';

    // description 추출
    const descMatch = item.match(/<description>([\s\S]*?)<\/description>/);
    let description = descMatch
      ? descMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim()
      : '';

    // HTML 태그 제거
    description = description.replace(/<[^>]*>/g, '').slice(0, 150);

    // pubDate 추출
    const pubDateMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const pubDate = pubDateMatch ? new Date(pubDateMatch[1]) : new Date();

    // 이미지 URL 추출 (enclosure)
    const enclosureMatch = item.match(/<enclosure[^>]+url="([^"]+)"/);
    const imageUrl = enclosureMatch ? enclosureMatch[1] : undefined;

    if (title && link) {
      news.push({
        id: `${Date.now()}-${index}`,
        title,
        summary: description || '내용 없음',
        url: link,
        source,
        publishedAt: pubDate,
        imageUrl,
      });
    }
  });

  return news;
}
