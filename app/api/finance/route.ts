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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // stock, crypto, currency, all

    const markets: FinanceItem[] = [];

    // 주요 한국 주식
    if (type === 'stock' || type === 'all') {
      const stockSymbols = ['005930.KS', 'TSLA', 'AAPL', 'GOOGL']; // 삼성전자, 테슬라, 애플, 구글

      for (const symbol of stockSymbols) {
        try {
          const url = `https://serpapi.com/search.json?engine=google_finance&q=${symbol}&api_key=${apiKey}`;
          const response = await fetch(url);

          if (response.ok) {
            const data = await response.json();
            const summary = data.summary;

            if (summary) {
              markets.push({
                symbol: symbol,
                name: summary.title || symbol,
                price: summary.price || '0',
                change: summary.price_movement?.movement || '0',
                changePercent: summary.price_movement?.percentage || '0',
                type: 'stock',
              });
            }
          }
        } catch (error) {
          console.error(`Stock ${symbol} fetch error:`, error);
        }
      }
    }

    // 주요 암호화폐
    if (type === 'crypto' || type === 'all') {
      const cryptoSymbols = ['BTC', 'ETH'];

      for (const symbol of cryptoSymbols) {
        try {
          const url = `https://serpapi.com/search.json?engine=google_finance&q=${symbol}-USD&api_key=${apiKey}`;
          const response = await fetch(url);

          if (response.ok) {
            const data = await response.json();
            const summary = data.summary;

            if (summary) {
              markets.push({
                symbol: symbol,
                name: summary.title || symbol,
                price: summary.price || '0',
                change: summary.price_movement?.movement || '0',
                changePercent: summary.price_movement?.percentage || '0',
                type: 'crypto',
              });
            }
          }
        } catch (error) {
          console.error(`Crypto ${symbol} fetch error:`, error);
        }
      }
    }

    // 환율
    if (type === 'currency' || type === 'all') {
      try {
        const url = `https://serpapi.com/search.json?engine=google_finance&q=USD-KRW&api_key=${apiKey}`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          const summary = data.summary;

          if (summary) {
            markets.push({
              symbol: 'USD/KRW',
              name: '달러/원',
              price: summary.price || '0',
              change: summary.price_movement?.movement || '0',
              changePercent: summary.price_movement?.percentage || '0',
              type: 'currency',
            });
          }
        }
      } catch (error) {
        console.error('Currency fetch error:', error);
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
      symbol: '005930.KS',
      name: '삼성전자',
      price: '71,500',
      change: '+500',
      changePercent: '+0.70%',
      type: 'stock',
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc',
      price: '$245.32',
      change: '+5.12',
      changePercent: '+2.13%',
      type: 'stock',
    },
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: '$43,250',
      change: '+1,250',
      changePercent: '+2.98%',
      type: 'crypto',
    },
    {
      symbol: 'USD/KRW',
      name: '달러/원',
      price: '1,325.50',
      change: '+5.50',
      changePercent: '+0.42%',
      type: 'currency',
    },
  ];
}
