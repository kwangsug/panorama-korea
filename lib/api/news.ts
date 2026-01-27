/**
 * 뉴스 RSS 피드 클라이언트
 *
 * 주요 언론사 RSS 피드를 파싱하여 뉴스 목록을 제공합니다.
 */

import { NewsItem } from '@/types';

// 주요 언론사 RSS 피드 URL
export const NEWS_FEEDS = {
  연합뉴스: 'https://www.yna.co.kr/rss/news.xml',
  KBS: 'https://fs.kbs.co.kr/rss/allnews.xml',
  SBS: 'https://news.sbs.co.kr/news/SectionRssFeed.do?sectionId=01',
  // 네이버 뉴스는 CORS 이슈가 있어 서버 사이드에서 파싱 필요
} as const;

export type NewsFeedName = keyof typeof NEWS_FEEDS;

/**
 * RSS XML을 파싱하여 뉴스 목록 반환
 */
async function parseRSSFeed(xmlText: string): Promise<NewsItem[]> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');

  const items = doc.querySelectorAll('item');
  const news: NewsItem[] = [];

  items.forEach((item, index) => {
    const title = item.querySelector('title')?.textContent || '';
    const link = item.querySelector('link')?.textContent || '';
    const description = item.querySelector('description')?.textContent || '';
    const pubDate = item.querySelector('pubDate')?.textContent || '';

    // 이미지 URL 추출 (일부 RSS는 enclosure 또는 description 내 img 태그에 포함)
    let imageUrl = item.querySelector('enclosure')?.getAttribute('url') || undefined;

    if (!imageUrl && description.includes('<img')) {
      const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
      if (imgMatch) {
        imageUrl = imgMatch[1];
      }
    }

    news.push({
      id: `${Date.now()}-${index}`,
      title: title.replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
      summary: description
        .replace(/<!\[CDATA\[|\]\]>/g, '')
        .replace(/<[^>]*>/g, '')
        .trim()
        .slice(0, 150),
      url: link,
      source: '연합뉴스', // RSS 피드 소스에 따라 변경
      publishedAt: pubDate ? new Date(pubDate) : new Date(),
      imageUrl,
    });
  });

  return news.slice(0, 10); // 최대 10개
}

/**
 * 뉴스 목록 조회
 * 브라우저에서는 CORS 이슈로 직접 호출 불가, API Route 사용 권장
 */
export async function getNews(feed: NewsFeedName = '연합뉴스'): Promise<NewsItem[]> {
  try {
    // Next.js API Route를 통해 뉴스 가져오기
    const response = await fetch(`/api/news?feed=${feed}`, {
      next: { revalidate: 600 }, // 10분마다 캐시 갱신
    });

    if (!response.ok) {
      throw new Error(`뉴스 API 오류: ${response.status}`);
    }

    const data = await response.json();
    return data.news;
  } catch (error) {
    console.error('뉴스 로딩 실패:', error);
    // 에러 시 목업 데이터 반환
    return getMockNews();
  }
}

/**
 * 목업 뉴스 데이터
 */
export function getMockNews(): NewsItem[] {
  return [
    {
      id: '1',
      title: '한국 경제, 2026년 3% 성장 전망',
      summary: '국내 주요 경제 연구소들이 올해 경제 성장률을 3% 안팎으로 전망했습니다...',
      url: '#',
      source: '연합뉴스',
      publishedAt: new Date(),
    },
    {
      id: '2',
      title: 'AI 기술 발전으로 산업 혁신 가속화',
      summary: '인공지능 기술의 급속한 발전으로 다양한 산업 분야에서 혁신이 일어나고 있습니다...',
      url: '#',
      source: 'KBS',
      publishedAt: new Date(Date.now() - 3600000),
    },
    {
      id: '3',
      title: '환경부, 탄소 중립 로드맵 발표',
      summary: '정부가 2050 탄소 중립 달성을 위한 구체적인 실행 계획을 공개했습니다...',
      url: '#',
      source: 'SBS',
      publishedAt: new Date(Date.now() - 7200000),
    },
    {
      id: '4',
      title: '서울 부동산 시장, 안정세 지속',
      summary: '수도권 아파트 가격이 소폭 상승했지만 전반적으로 안정적인 흐름을 보이고 있습니다...',
      url: '#',
      source: '연합뉴스',
      publishedAt: new Date(Date.now() - 10800000),
    },
    {
      id: '5',
      title: 'K-팝 아티스트, 빌보드 차트 1위',
      summary: '한국 아티스트가 빌보드 메인 차트에서 1위를 차지하며 K-팝의 위상을 높였습니다...',
      url: '#',
      source: 'KBS',
      publishedAt: new Date(Date.now() - 14400000),
    },
  ];
}
