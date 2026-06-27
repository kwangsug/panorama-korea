'use client';

import { useEffect, useState } from 'react';

interface FinanceItem {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  type: 'stock' | 'crypto' | 'currency';
}

interface FinanceWidgetProps {
  rotationSeconds?: number;
}

export function FinanceWidget({ rotationSeconds = 10 }: FinanceWidgetProps) {
  const [markets, setMarkets] = useState<FinanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMock, setIsMock] = useState(false);

  // 금융 데이터 로드
  useEffect(() => {
    const loadMarkets = async () => {
      try {
        const response = await fetch('/api/finance');
        if (!response.ok) {
          throw new Error('Failed to fetch finance data');
        }
        const data = await response.json();
        setMarkets(data.markets || []);
        setIsMock(data.source === 'mock');
      } catch (error) {
        console.error('금융 데이터 로딩 실패:', error);
        setIsMock(true);
      } finally {
        setLoading(false);
      }
    };

    loadMarkets();
    // 5분마다 자동 업데이트
    const interval = setInterval(loadMarkets, 300000);
    return () => clearInterval(interval);
  }, []);

  // 자동 전환
  useEffect(() => {
    if (markets.length <= 1 || rotationSeconds <= 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % markets.length);
    }, rotationSeconds * 1000);
    return () => clearInterval(interval);
  }, [markets.length, rotationSeconds]);

  if (loading) {
    return (
      <div className="h-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-5 border border-white/10 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-green-500/30 rounded-full flex items-center justify-center">
            <span className="text-lg">💹</span>
          </div>
          <h2 className="text-lg font-semibold text-white">금융 시장</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">시장 정보 로딩 중...</div>
        </div>
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className="h-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-5 border border-white/10 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-green-500/30 rounded-full flex items-center justify-center">
            <span className="text-lg">💹</span>
          </div>
          <h2 className="text-lg font-semibold text-white">금융 시장</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400 text-xl">시장 데이터를 불러올 수 없습니다</div>
        </div>
      </div>
    );
  }

  const currentMarket = markets[currentIndex];
  const isPositive = currentMarket.change.startsWith('+');
  const isNegative = currentMarket.change.startsWith('-');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stock': return '📈';
      case 'crypto': return '₿';
      case 'currency': return '💱';
      default: return '💹';
    }
  };

  return (
    <div className="h-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-5 border border-white/10 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-green-500/30 rounded-full flex items-center justify-center">
          <span className="text-lg">💹</span>
        </div>
        <h2 className="text-lg font-semibold text-white">금융 시장</h2>
        {isMock && (
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30"
            title="실시간 데이터를 불러오지 못해 샘플 값을 표시 중입니다"
          >
            📡 샘플
          </span>
        )}
        {markets.length > 1 && (
          <div className="ml-auto text-sm text-gray-400">
            {currentIndex + 1} / {markets.length}
          </div>
        )}
      </div>

      {/* Market Content - 2 Column Layout */}
      <div className="flex-1 flex gap-6">
        {/* Left: Main Stock */}
        {markets.length > 0 && (
          <div className="flex-1 flex flex-col justify-center">
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 backdrop-blur-sm rounded-3xl shadow-2xl border border-green-500/30 p-4 md:p-6 lg:p-8">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <span className="text-[3vw] md:text-[2.5vw]">{getTypeIcon(markets[0].type)}</span>
                <div className="flex-1">
                  <div className="text-[0.7vw] md:text-[0.6vw] text-gray-400">{markets[0].symbol}</div>
                  <div className="text-[1.8vw] md:text-[1.5vw] font-bold text-white">{markets[0].name}</div>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-[4vw] md:text-[3.5vw] font-bold text-white">{markets[0].price}</div>
                <div
                  className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1 md:py-2 rounded-xl ${
                    isPositive ? 'bg-green-500/30 text-green-300' : isNegative ? 'bg-red-500/30 text-red-300' : 'bg-gray-500/30 text-gray-300'
                  }`}
                >
                  <span className="text-[2vw] md:text-[1.8vw]">{isPositive ? '▲' : isNegative ? '▼' : '—'}</span>
                  <span className="text-[1.5vw] md:text-[1.3vw] font-bold">{markets[0].changePercent}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right: Other Markets */}
        {markets.length > 1 && (
          <div className="w-[20vw] md:w-[18vw] flex flex-col justify-center">
            <div className="space-y-2 md:space-y-3">
              {markets.slice(1, 4).map((market, idx) => {
                const isPos = market.change.startsWith('+');
                const isNeg = market.change.startsWith('-');
                return (
                  <div
                    key={idx}
                    className="bg-white/5 rounded-xl p-3 md:p-4 border border-white/10 hover:border-green-400/30 transition-all"
                  >
                    <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                      <span className="text-[1.5vw] md:text-[1.2vw]">{getTypeIcon(market.type)}</span>
                      <div className="flex-1">
                        <div className="text-[0.6vw] md:text-[0.5vw] text-gray-400">{market.symbol}</div>
                        <div className="text-[0.9vw] md:text-[0.8vw] font-semibold text-white">{market.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-[1.2vw] md:text-[1vw] font-bold text-white">{market.price}</div>
                      <div
                        className={`flex items-center gap-1 md:gap-2 px-2 py-0.5 md:py-1 rounded-lg ${
                          isPos ? 'bg-green-500/20 text-green-400' : isNeg ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        <span className="text-[0.8vw] md:text-[0.7vw]">{isPos ? '▲' : isNeg ? '▼' : '—'}</span>
                        <span className="text-[0.8vw] md:text-[0.7vw] font-semibold">{market.changePercent}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Progress Dots */}
      {markets.length > 1 && (
        <div className="flex justify-center gap-1 mt-4">
          {markets.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 rounded-full transition-all ${
                idx === currentIndex ? 'w-4 bg-green-400' : 'w-1 bg-white/20'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
