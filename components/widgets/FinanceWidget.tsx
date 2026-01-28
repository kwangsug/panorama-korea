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
      } catch (error) {
        console.error('금융 데이터 로딩 실패:', error);
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'stock': return '주식';
      case 'crypto': return '암호화폐';
      case 'currency': return '환율';
      default: return '시장';
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
        {markets.length > 1 && (
          <div className="ml-auto text-sm text-gray-400">
            {currentIndex + 1} / {markets.length}
          </div>
        )}
      </div>

      {/* Market Content - Single Column List */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="space-y-3">
          {markets.slice(0, 4).map((market, idx) => {
            const isPos = market.change.startsWith('+');
            const isNeg = market.change.startsWith('-');
            const isCurrent = idx === currentIndex;
            return (
              <div
                key={idx}
                className={`bg-white/5 rounded-xl p-4 border transition-all ${
                  isCurrent ? 'border-green-400/50 bg-white/10' : 'border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{getTypeIcon(market.type)}</span>
                  <div className="flex-1">
                    <div className="text-xs text-gray-400">{market.symbol}</div>
                    <div className="text-lg font-semibold text-white">{market.name}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-white">{market.price}</div>
                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                      isPos ? 'bg-green-500/20 text-green-400' : isNeg ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    <span className="text-lg">{isPos ? '▲' : isNeg ? '▼' : '—'}</span>
                    <span className="text-base font-semibold">{market.changePercent}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
