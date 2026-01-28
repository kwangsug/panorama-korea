'use client';

import { useState, useEffect, useRef } from 'react';
import { getCurrentWeather, type WeatherData, type CityName } from '@/lib/api/weather';

interface TickerItem {
  type: 'news' | 'job' | 'finance';
  title: string;
  source?: string; // RSS 피드 제목
}

interface FlipCardProps {
  value: string;
}

function FlipCard({ value }: FlipCardProps) {
  const [previousValue, setPreviousValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (value !== previousValue) {
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setPreviousValue(value);
        setIsFlipping(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [value, previousValue]);

  const textClass = "text-5xl md:text-6xl lg:text-7xl text-white tabular-nums font-bold";
  const fontStyle = { fontFamily: 'var(--font-bebas), system-ui' };

  return (
    <div className="relative w-16 h-20 md:w-20 md:h-24 lg:w-24 lg:h-28" style={{ perspective: '300px' }}>
      {/* 하단 고정 패널 (이전 값 -> 애니메이션 후 현재 값) */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-slate-800 to-slate-900 rounded-b-lg border-x border-b border-white/20 overflow-hidden">
        <div className="absolute inset-0 flex items-start justify-center">
          <span className={textClass} style={{ ...fontStyle, transform: 'translateY(-50%)' }}>
            {previousValue}
          </span>
        </div>
      </div>

      {/* 상단 고정 패널 (현재 값 - 플립 패널 뒤에 숨겨져 있다가 드러남) */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-slate-600 to-slate-700 rounded-t-lg border-x border-t border-white/20 overflow-hidden">
        <div className="absolute inset-0 flex items-end justify-center">
          <span className={textClass} style={{ ...fontStyle, transform: 'translateY(50%)' }}>
            {value}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
      </div>

      {/* 플립되는 패널 */}
      <div
        className="absolute inset-x-0 top-0 h-1/2 origin-bottom"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipping ? 'rotateX(-180deg)' : 'rotateX(0deg)',
          transition: isFlipping ? 'transform 0.6s ease-in-out' : 'none',
          zIndex: isFlipping ? 10 : 1,
        }}
      >
        {/* 앞면 (상단, 이전 값) */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-slate-600 to-slate-700 rounded-t-lg border-x border-t border-white/20 overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="absolute inset-0 flex items-end justify-center">
            <span className={textClass} style={{ ...fontStyle, transform: 'translateY(50%)' }}>
              {previousValue}
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
        </div>

        {/* 뒷면 (하단, 현재 값) */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-slate-900 to-slate-800 rounded-b-lg border-x border-b border-white/20 overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateX(180deg)',
          }}
        >
          <div className="absolute inset-0 flex items-start justify-center">
            <span className={textClass} style={{ ...fontStyle, transform: 'translateY(-50%)' }}>
              {value}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 top-1/2 h-[2px] bg-black/60 z-20 -translate-y-1/2" />
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-black/20 to-transparent pointer-events-none z-20" />
      <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-l from-black/20 to-transparent pointer-events-none z-20" />
    </div>
  );
}

function Separator() {
  return (
    <div className="flex items-center justify-center h-20 md:h-24 lg:h-28 px-1">
      <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-white/50">:</span>
    </div>
  );
}

// 제목에서 기업명 패턴 제거
function cleanJobTitle(title: string, company: string): string {
  let cleanTitle = title;
  // 정규식 특수문자 이스케이프
  const escapedCompany = company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  const companyPatterns = [
    new RegExp(`^\\[${escapedCompany}\\]\\s*`, 'i'),
    new RegExp(`^\\(${escapedCompany}\\)\\s*`, 'i'),
    new RegExp(`^${escapedCompany}\\s*[-:]\\s*`, 'i'),
    new RegExp(`^${escapedCompany}\\s+`, 'i'),
    new RegExp(`\\[${escapedCompany}\\]`, 'gi'),
    new RegExp(`\\(${escapedCompany}\\)`, 'gi'),
  ];
  for (const pattern of companyPatterns) {
    cleanTitle = cleanTitle.replace(pattern, '').trim();
  }
  return cleanTitle;
}

// 날씨 아이콘 이모지 (WeatherWidget과 통일)
function getWeatherEmoji(iconCode: string): string {
  const emojiMap: Record<string, string> = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️',
  };
  return emojiMap[iconCode] || '☀️';
}

export function ClockWidget() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [selectedCity, setSelectedCity] = useState<CityName>('Seoul');
  const [scrollAmount, setScrollAmount] = useState(0);
  const [isTickerHovered, setIsTickerHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  // 클라이언트 사이드에서만 렌더링 (hydration 오류 방지)
  useEffect(() => {
    setMounted(true);
  }, []);

  // 설정에서 선택된 도시 로드
  useEffect(() => {
    const savedSettings = localStorage.getItem('panorama-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.selectedCity) {
          setSelectedCity(settings.selectedCity);
        }
      } catch (error) {
        console.error('설정 로드 실패:', error);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        const data = await getCurrentWeather(selectedCity);
        setWeather(data);
      } catch (error) {
        console.error('날씨 로딩 실패:', error);
      }
    };
    loadWeather();
    // 30분마다 자동 업데이트
    const interval = setInterval(loadWeather, 1800000);
    return () => clearInterval(interval);
  }, [selectedCity]);

  // 뉴스와 채용정보 로드 (20개까지 로컬 저장)
  useEffect(() => {
    const loadTickerData = async () => {
      try {
        const [newsRes, jobsRes, financeRes] = await Promise.all([
          fetch('/api/news'),
          fetch(`/api/jobs?city=${selectedCity}`),
          fetch('/api/finance'),
        ]);
        const newsData = await newsRes.json();
        const jobsData = await jobsRes.json();
        const financeData = await financeRes.json();

        const items: TickerItem[] = [];

        // 뉴스 제목 추출 (최대 8개)
        const newsItems: TickerItem[] = [];
        if (newsData.news) {
          newsData.news.slice(0, 8).forEach((article: { title: string }) => {
            newsItems.push({ type: 'news', title: article.title, source: '뉴스' });
          });
        }

        // 채용정보 제목 추출 (최대 8개) - 기업명 포함
        const jobItems: TickerItem[] = [];
        if (jobsData.jobs) {
          jobsData.jobs.slice(0, 8).forEach((job: { title: string; company: string }) => {
            const cleanedTitle = cleanJobTitle(job.title, job.company);
            // 기업명 + 제목 형태로 표시
            jobItems.push({ type: 'job', title: `${job.company} - ${cleanedTitle}`, source: '채용' });
          });
        }

        // 금융정보 추출 (모든 항목)
        const financeItems: TickerItem[] = [];
        if (financeData.markets) {
          financeData.markets.forEach((market: { symbol: string; name: string; price: string; change: string; changePercent: string }) => {
            const arrow = market.change.startsWith('+') ? '▲' : market.change.startsWith('-') ? '▼' : '—';
            financeItems.push({
              type: 'finance',
              title: `${market.symbol} ${market.price} ${arrow} ${market.changePercent}`,
              source: '금융'
            });
          });
        }

        // 뉴스, 채용, 금융 순환 배치
        const maxLen = Math.max(newsItems.length, jobItems.length, financeItems.length);
        for (let i = 0; i < maxLen; i++) {
          if (i < newsItems.length) items.push(newsItems[i]);
          if (i < jobItems.length) items.push(jobItems[i]);
          if (i < financeItems.length) items.push(financeItems[i]);
        }

        // 20개까지 로컬 저장
        const itemsToSave = items.slice(0, 20);
        localStorage.setItem('clock-ticker-items', JSON.stringify(itemsToSave));
        setTickerItems(itemsToSave);
      } catch (error) {
        console.error('티커 데이터 로딩 실패:', error);
        // 로컬 저장된 데이터 로드
        const saved = localStorage.getItem('clock-ticker-items');
        if (saved) {
          setTickerItems(JSON.parse(saved));
        }
      }
    };

    // 초기 로드 시 로컬 데이터 먼저 표시
    const saved = localStorage.getItem('clock-ticker-items');
    if (saved) {
      setTickerItems(JSON.parse(saved));
    }

    loadTickerData();
    // 5분마다 갱신 (API 캐시와 동기화)
    const interval = setInterval(loadTickerData, 300000);
    return () => clearInterval(interval);
  }, [selectedCity]);

  // 티커 자동 전환 (10초)
  useEffect(() => {
    if (tickerItems.length === 0) return;
    const interval = setInterval(() => {
      setScrollAmount(0);
      setTickerIndex((prev) => (prev + 1) % tickerItems.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [tickerItems.length]);

  // 2초 후 스크롤 시작 (텍스트가 잘린 경우에만)
  useEffect(() => {
    setScrollAmount(0);
    const timer = setTimeout(() => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const textWidth = textRef.current.scrollWidth;
        // 텍스트가 컨테이너보다 긴 경우에만 스크롤
        if (textWidth > containerWidth) {
          setScrollAmount(textWidth - containerWidth + 20); // 20px 여유
        }
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [tickerIndex]);

  const hours = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  const seconds = currentTime.getSeconds().toString().padStart(2, '0');

  // 서버 렌더링 시 플레이스홀더 표시 (hydration 오류 방지)
  if (!mounted) {
    return (
      <div className="h-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-4 md:p-6 border border-white/10 flex flex-col justify-start">
        <div className="flex items-center justify-center gap-1 md:gap-2 mb-4 md:mb-6">
          <div className="w-16 h-20 md:w-20 md:h-24 lg:w-24 lg:h-28 bg-slate-700/50 rounded-lg animate-pulse" />
          <div className="w-16 h-20 md:w-20 md:h-24 lg:w-24 lg:h-28 bg-slate-700/50 rounded-lg animate-pulse" />
          <div className="h-20 md:h-24 lg:h-28 px-1" />
          <div className="w-16 h-20 md:w-20 md:h-24 lg:w-24 lg:h-28 bg-slate-700/50 rounded-lg animate-pulse" />
          <div className="w-16 h-20 md:w-20 md:h-24 lg:w-24 lg:h-28 bg-slate-700/50 rounded-lg animate-pulse" />
          <div className="h-20 md:h-24 lg:h-28 px-1" />
          <div className="w-16 h-20 md:w-20 md:h-24 lg:w-24 lg:h-28 bg-slate-700/50 rounded-lg animate-pulse" />
          <div className="w-16 h-20 md:w-20 md:h-24 lg:w-24 lg:h-28 bg-slate-700/50 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-4 md:p-6 border border-white/10 flex flex-col justify-start">
      {/* 시계 - 플립 카드 */}
      <div className="flex items-center justify-center gap-1 md:gap-2 mb-4 md:mb-6">
        <FlipCard value={hours[0]} />
        <FlipCard value={hours[1]} />
        <Separator />
        <FlipCard value={minutes[0]} />
        <FlipCard value={minutes[1]} />
        <Separator />
        <FlipCard value={seconds[0]} />
        <FlipCard value={seconds[1]} />
      </div>

      {/* 날짜와 날씨 */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="text-xl md:text-2xl text-white font-medium">
            {currentTime.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
          </div>
          <div className="text-lg md:text-xl text-gray-400">
            {currentTime.toLocaleDateString('ko-KR', { weekday: 'long' })}
          </div>
        </div>

        {weather && (
          <div className="flex items-center gap-2">
            <span className="text-2xl md:text-3xl">{getWeatherEmoji(weather.conditionIcon)}</span>
            <div className="text-xl md:text-2xl text-white font-bold">{weather.temperature}°</div>
          </div>
        )}
      </div>

      {/* 뉴스/채용/금융 티커 (마우스 오버 시 확장) */}
      {tickerItems.length > 0 && (
        <div
          className="mt-3 pt-3 border-t border-white/10 overflow-hidden transition-all duration-300"
          style={{ height: isTickerHovered ? 'auto' : '40px' }}
          onMouseEnter={() => setIsTickerHovered(true)}
          onMouseLeave={() => setIsTickerHovered(false)}
        >
          {/* 현재 티커 아이템 (항상 표시) */}
          <div
            key={tickerIndex}
            className="flex items-center gap-2 animate-[slideUp_0.4s_ease-out]"
          >
            <span className={`text-sm px-2 py-0.5 rounded flex-shrink-0 ${
              tickerItems[tickerIndex].type === 'news'
                ? 'bg-purple-500/30 text-purple-300'
                : tickerItems[tickerIndex].type === 'job'
                ? 'bg-orange-500/30 text-orange-300'
                : 'bg-green-500/30 text-green-300'
            }`}>
              {tickerItems[tickerIndex].type === 'news' ? '뉴스' : tickerItems[tickerIndex].type === 'job' ? '채용' : '금융'}
            </span>
            <div ref={containerRef} className="flex-1 overflow-hidden">
              <span
                ref={textRef}
                className="text-lg text-gray-300 whitespace-nowrap inline-block transition-transform duration-[6000ms] ease-linear"
                style={{
                  transform: !isTickerHovered && scrollAmount > 0 ? `translateX(-${scrollAmount}px)` : 'translateX(0)',
                }}
              >
                {tickerItems[tickerIndex].title}
              </span>
            </div>
          </div>

          {/* 다음 4개 아이템 (호버 시 표시 - 같은 타입만) */}
          {isTickerHovered && (() => {
            // 현재 아이템과 같은 타입만 필터링
            const currentType = tickerItems[tickerIndex].type;
            const sameTypeItems = tickerItems.filter(item => item.type === currentType);

            // 현재 아이템의 인덱스 찾기
            const currentIndexInFiltered = sameTypeItems.findIndex(
              item => item.title === tickerItems[tickerIndex].title
            );

            // 다음 4개 아이템 선택 (순환)
            const nextItems = [1, 2, 3, 4].map(offset => {
              const nextIdx = (currentIndexInFiltered + offset) % sameTypeItems.length;
              return sameTypeItems[nextIdx];
            }).filter(Boolean);

            return (
              <div className="space-y-2 mt-2 animate-[slideUp_0.3s_ease-out]">
                {nextItems.map((item, idx) => (
                  <div
                    key={`${currentType}-${idx}`}
                    className="flex items-center gap-2"
                  >
                    <span className={`text-sm px-2 py-0.5 rounded flex-shrink-0 ${
                      item.type === 'news'
                        ? 'bg-purple-500/30 text-purple-300'
                        : item.type === 'job'
                        ? 'bg-orange-500/30 text-orange-300'
                        : 'bg-green-500/30 text-green-300'
                    }`}>
                      {item.type === 'news' ? '뉴스' : item.type === 'job' ? '채용' : '금융'}
                    </span>
                    <div className="flex-1 overflow-hidden">
                      <span className="text-lg text-gray-300 whitespace-nowrap inline-block">
                        {item.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
