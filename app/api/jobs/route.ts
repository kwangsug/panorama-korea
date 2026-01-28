import { NextResponse } from 'next/server';

interface JobItem {
  title: string;
  company: string;
  link: string;
  location: string;
  deadline: string;
  experience: string;
}

// 도시별 인크루트 지역 코드 매핑
const CITY_TO_REGION_CODE: Record<string, string> = {
  Seoul: '11',     // 서울
  Busan: '12',     // 부산
  Daegu: '13',     // 대구
  Incheon: '14',   // 인천
  Gwangju: '15',   // 광주
  Daejeon: '16',   // 대전
  Ulsan: '17',     // 울산
  Gyeonggi: '18',  // 경기
  Gangwon: '19',   // 강원
  Chungbuk: '20',  // 충북
  Chungnam: '21',  // 충남
  Sejong: '21',    // 충남 (세종 포함)
  Jeonbuk: '22',   // 전북
  Jeonnam: '23',   // 전남
  Gyeongbuk: '24', // 경북
  Gyeongnam: '25', // 경남
  Jeju: '26',      // 제주
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || '';

    // 도시에 해당하는 지역 코드가 있으면 지역 RSS, 없으면 전체 RSS
    const regionCode = CITY_TO_REGION_CODE[city];
    const rssUrl = regionCode
      ? `https://www.incruit.com/rss/job.asp?ct=3&ty=2&cd=${regionCode}`
      : 'https://www.incruit.com/rss/job.asp?jobtycd=1&today=y';

    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PanoramaKorea/1.0)',
      },
      cache: 'no-store', // 캐시 비활성화 (실시간 데이터 로드)
    });

    if (!response.ok) {
      throw new Error('RSS fetch failed');
    }

    // UTF-8로 직접 읽기 시도
    const xml = await response.text();
    const { jobs, feedTitle } = parseRSS(xml);

    return NextResponse.json({ jobs, feedTitle });
  } catch (error) {
    console.error('Jobs API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs', jobs: [] },
      { status: 500 }
    );
  }
}

function parseRSS(xml: string): { jobs: JobItem[]; feedTitle: string } {
  const items: JobItem[] = [];

  // RSS 피드 제목 추출 (channel > title)
  const channelMatch = xml.match(/<channel>([\s\S]*?)<item>/);
  let feedTitle = '인크루트 채용정보';
  if (channelMatch) {
    const channelTitle = extractTag(channelMatch[1], 'title');
    if (channelTitle) {
      feedTitle = cleanText(channelTitle);
    }
  }

  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null && items.length < 10) {
    const itemXml = match[1];

    const title = extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link');
    const description = extractTag(itemXml, 'description');
    const author = extractTag(itemXml, 'author');

    // Parse description for details
    const company = author || extractFromDesc(description, '회사명');
    const location = extractFromDesc(description, '지역');
    const deadline = extractFromDesc(description, '마감일');
    const experience = extractFromDesc(description, '경력');

    if (title && link) {
      items.push({
        title: cleanText(title),
        company: cleanText(company),
        link: link.trim(),
        location: cleanText(location) || '전국',
        deadline: cleanText(deadline) || '상시',
        experience: cleanText(experience) || '신입',
      });
    }
  }

  return { jobs: items, feedTitle };
}

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
  const match = xml.match(regex);
  return match ? (match[1] || match[2] || '').trim() : '';
}

function extractFromDesc(desc: string, field: string): string {
  const regex = new RegExp(`${field}\\s*:\\s*([^▨<]+)`);
  const match = desc.match(regex);
  return match ? match[1].trim() : '';
}

function cleanText(text: string): string {
  // 먼저 HTML 태그 제거
  let cleaned = text.replace(/<[^>]*>/g, '');

  // HTML 엔티티 디코딩
  cleaned = cleaned
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&ldquo;/g, '\u201C')
    .replace(/&rdquo;/g, '\u201D');

  // 추가적인 공백 정리
  return cleaned.replace(/\s+/g, ' ').trim();
}
