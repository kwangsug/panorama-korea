import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

interface FinanceItem {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  type: 'stock' | 'crypto' | 'currency';
}

export async function GET(request: Request) {
  const apiKey = process.env.SERPAPI_API_KEY;

  // API 키가 없으면 목업 데이터 반환
  if (!apiKey) {
    return NextResponse.json(
      {
        markets: getMockMarkets(),
        source: 'mock'
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=150',
        },
      }
    );
  }

  try {
    const markets: FinanceItem[] = [];

    // 필요한 5개 항목만 정의 (API 호출 최소화)
    const symbols = [
      { query: 'KOSPI', name: '코스피', type: 'stock' as const },
      { query: 'KOSDAQ', name: '코스닥', type: 'stock' as const },
      { query: 'USD-KRW', name: '원/달러', type: 'currency' as const },
      { query: '.INX', name: 'S&P 500', type: 'stock' as const },
      { query: '.IXIC', name: '나스닥', type: 'stock' as const },
    ];

    // 5개 항목을 순차적으로 가져오기
    for (const { query, name, type } of symbols) {
      try {
        const url = `https://serpapi.com/search.json?engine=google_finance&q=${query}&api_key=${apiKey}`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          const summary = data.summary;

          if (summary) {
            markets.push({
              symbol: query === 'USD-KRW' ? 'USD/KRW' : query,
              name: name,
              price: summary.price || '0',
              change: summary.price_movement?.movement || '0',
              changePercent: summary.price_movement?.percentage || '0',
              type: type,
            });
          }
        }
      } catch (error) {
        console.error(`${name} fetch error:`, error);
      }
    }

    return NextResponse.json(
      {
        markets: markets.length > 0 ? markets : getMockMarkets(),
        source: markets.length > 0 ? 'live' : 'mock'
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=150',
        },
      }
    );
  } catch (error) {
    console.error('Finance API error:', error);

    return NextResponse.json(
      {
        markets: getMockMarkets(),
        source: 'mock',
        error: String(error)
      },
      { status: 200 }
    );
  }
}

function getMockMarkets(): FinanceItem[] {
  return [
    {
      symbol: 'KOSPI',
      name: '코스피',
      price: '2,580.50',
      change: '+15.30',
      changePercent: '+0.60%',
      type: 'stock',
    },
    {
      symbol: 'KOSDAQ',
      name: '코스닥',
      price: '850.20',
      change: '+8.50',
      changePercent: '+1.01%',
      type: 'stock',
    },
    {
      symbol: 'USD/KRW',
      name: '원/달러',
      price: '1,325.50',
      change: '+5.50',
      changePercent: '+0.42%',
      type: 'currency',
    },
    {
      symbol: '.INX',
      name: 'S&P 500',
      price: '4,850.20',
      change: '+25.30',
      changePercent: '+0.52%',
      type: 'stock',
    },
    {
      symbol: '.IXIC',
      name: '나스닥',
      price: '15,250.80',
      change: '+95.60',
      changePercent: '+0.63%',
      type: 'stock',
    },
  ];
}
