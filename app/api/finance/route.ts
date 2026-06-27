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

// Yahoo Finance 비공식 API — 키 불요.
// SerpAPI google_finance는 KOSPI/KOSDAQ을 못 반환하므로 Yahoo로 통일.
const SYMBOLS = [
  { sym: '^KS11', name: '코스피', display: 'KOSPI', type: 'stock' as const },
  { sym: '^KQ11', name: '코스닥', display: 'KOSDAQ', type: 'stock' as const },
  { sym: 'KRW=X', name: '원/달러', display: 'USD/KRW', type: 'currency' as const },
  { sym: '^GSPC', name: 'S&P 500', display: 'S&P 500', type: 'stock' as const },
  { sym: '^IXIC', name: '나스닥', display: 'NASDAQ', type: 'stock' as const },
];

interface YahooQuote {
  price: number;
  prevClose: number;
  currency: string;
}

async function fetchYahoo(sym: string): Promise<YahooQuote | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=1d`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PanoramaKorea/2.0)',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta || typeof meta.regularMarketPrice !== 'number') return null;

    return {
      price: meta.regularMarketPrice,
      prevClose: meta.chartPreviousClose ?? meta.previousClose ?? meta.regularMarketPrice,
      currency: meta.currency || '',
    };
  } catch (error) {
    console.error(`Yahoo Finance ${sym} 오류:`, error);
    return null;
  }
}

function formatPrice(price: number, currency: string): string {
  // 큰 숫자(KOSPI 등)는 천 단위 콤마. USD는 소수점 2자리.
  if (currency === 'USD' && price < 10000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (price >= 1000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return price.toFixed(2);
}

function buildItem(
  meta: { sym: string; name: string; display: string; type: 'stock' | 'crypto' | 'currency' },
  quote: YahooQuote
): FinanceItem {
  const diff = quote.price - quote.prevClose;
  const pct = quote.prevClose !== 0 ? (diff / quote.prevClose) * 100 : 0;
  const sign = diff >= 0 ? '+' : '';
  return {
    symbol: meta.display,
    name: meta.name,
    price: formatPrice(quote.price, quote.currency),
    change: `${sign}${formatPrice(diff, quote.currency)}`,
    changePercent: `${sign}${pct.toFixed(2)}%`,
    type: meta.type,
  };
}

export async function GET() {
  try {
    // 5개 병렬 fetch (Yahoo는 동시 호출 OK)
    const quotes = await Promise.all(SYMBOLS.map((s) => fetchYahoo(s.sym)));

    const markets: FinanceItem[] = [];
    SYMBOLS.forEach((meta, idx) => {
      const q = quotes[idx];
      if (q) markets.push(buildItem(meta, q));
    });

    if (markets.length === 0) {
      return NextResponse.json(
        { markets: getMockMarkets(), source: 'mock', error: 'Yahoo Finance에서 데이터를 받지 못함' },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
          },
        }
      );
    }

    return NextResponse.json(
      {
        markets,
        source: 'yahoo',
        partial: markets.length < SYMBOLS.length ? { missing: SYMBOLS.length - markets.length } : undefined,
      },
      {
        headers: {
          // Yahoo 응답은 자주 갱신되지만 캐시 60초로 부담 줄임
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('Finance API 오류:', error);
    return NextResponse.json(
      { markets: getMockMarkets(), source: 'mock', error: String(error) },
      { status: 200 }
    );
  }
}

function getMockMarkets(): FinanceItem[] {
  return [
    { symbol: 'KOSPI', name: '코스피', price: '2,580.50', change: '+15.30', changePercent: '+0.60%', type: 'stock' },
    { symbol: 'KOSDAQ', name: '코스닥', price: '850.20', change: '+8.50', changePercent: '+1.01%', type: 'stock' },
    { symbol: 'USD/KRW', name: '원/달러', price: '1,325.50', change: '+5.50', changePercent: '+0.42%', type: 'currency' },
    { symbol: 'S&P 500', name: 'S&P 500', price: '4,850.20', change: '+25.30', changePercent: '+0.52%', type: 'stock' },
    { symbol: 'NASDAQ', name: '나스닥', price: '15,250.80', change: '+95.60', changePercent: '+0.63%', type: 'stock' },
  ];
}
