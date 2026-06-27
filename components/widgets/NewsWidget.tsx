'use client';

import { useEffect, useState, useCallback } from 'react';
import { getMockNews } from '@/lib/api/news';
import type { NewsItem } from '@/types';

interface NewsWidgetProps {
  rotationSeconds?: number;
}

export function NewsWidget({ rotationSeconds = 15 }: NewsWidgetProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsSource, setNewsSource] = useState<'naver' | 'yonhap' | 'google'>('naver');
  const [isMock, setIsMock] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [swipeAxis, setSwipeAxis] = useState<'horizontal' | 'vertical' | null>(null);
  const [selectedCity, setSelectedCity] = useState('Seoul');

  useEffect(() => {
    const savedSettings = localStorage.getItem('panorama-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.newsSource) {
          setNewsSource(settings.newsSource);
        }
        if (settings.selectedCity) {
          setSelectedCity(settings.selectedCity);
        }
      } catch (error) {
        console.error('설정 로드 실패:', error);
      }
    }
  }, []);

  const loadNews = useCallback(async () => {
    try {
      const response = await fetch(`/api/news?source=${newsSource}&city=${selectedCity}`);
      if (!response.ok) {
        throw new Error('뉴스 로드 실패');
      }
      const data = await response.json();
      setNews(data.news || []);
      setIsMock(data.source === 'mock');
    } catch (error) {
      console.error('뉴스 로딩 실패:', error);
      setNews(getMockNews());
      setIsMock(true);
    } finally {
      setLoading(false);
    }
  }, [newsSource, selectedCity]);

  useEffect(() => {
    loadNews();
    // 1분마다 자동 업데이트
    const interval = setInterval(loadNews, 60000);
    return () => clearInterval(interval);
  }, [loadNews]);

  // 뉴스 자동 전환
  useEffect(() => {
    if (news.length === 0 || rotationSeconds <= 0) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % Math.min(news.length, 5));
        setIsTransitioning(false);
      }, 300);
    }, rotationSeconds * 1000);
    return () => clearInterval(interval);
  }, [news.length, rotationSeconds]);

  // 가로 스와이프로 뉴스 전환 (드래그 따라가기 효과 + 방향 잠금)
  const handlePointerDown = (e: React.PointerEvent) => {
    setTouchStart(e.clientX);
    setIsDragging(true);
    setDragX(0);
    setSwipeAxis(null);
    (e.currentTarget as HTMLElement).dataset.startY = String(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const diffX = e.clientX - touchStart;
    const startY = Number((e.currentTarget as HTMLElement).dataset.startY || 0);
    const diffY = e.clientY - startY;

    // 방향이 아직 결정되지 않은 경우, 10px 이상 움직이면 방향 결정
    if (!swipeAxis && (Math.abs(diffX) > 10 || Math.abs(diffY) > 10)) {
      // 가로가 세로보다 1.2배 이상일 때만 가로로 판정
      if (Math.abs(diffX) > Math.abs(diffY) * 1.2) {
        setSwipeAxis('horizontal');
      } else if (Math.abs(diffY) > Math.abs(diffX)) {
        setSwipeAxis('vertical');
      }
    }

    // 가로 스와이프일 때만 드래그 적용
    if (swipeAxis === 'horizontal') {
      setDragX(diffX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const diff = touchStart - e.clientX;

    // 가로 스와이프 감지 (방향이 horizontal로 잠긴 경우만)
    if (swipeAxis === 'horizontal' && Math.abs(diff) > 50) {
      e.stopPropagation();
      setSwipeDirection(diff > 0 ? 'left' : 'right');
      setIsTransitioning(true);

      setTimeout(() => {
        if (diff > 0) {
          setCurrentIndex((prev) => (prev + 1) % Math.min(news.length, 5));
        } else {
          setCurrentIndex((prev) => (prev - 1 + Math.min(news.length, 5)) % Math.min(news.length, 5));
        }
        setDragX(0);
        setSwipeDirection(null);
        setIsTransitioning(false);
      }, 300);
    } else {
      setDragX(0);
    }

    setIsDragging(false);
    setSwipeAxis(null);
  };

  // HTML 엔티티 디코드
  function decodeHtmlEntities(text: string): string {
    const entities: Record<string, string> = {
      '&quot;': '"',
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&#39;': "'",
      '&apos;': "'",
      '&nbsp;': ' ',
    };
    return text.replace(/&[^;]+;/g, (match) => entities[match] || match);
  }

  function getTimeAgo(date: Date): string {
    const now = new Date();
    const dateObj = date instanceof Date ? date : new Date(date);
    const diff = now.getTime() - dateObj.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  }

  // QR 코드 URL 생성
  function getQRCodeUrl(url: string): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}`;
  }

  if (loading) {
    return (
      <div className="h-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-5 border border-white/10 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-green-500/30 rounded-full flex items-center justify-center">
            <span className="text-lg">📰</span>
          </div>
          <h2 className="text-lg font-semibold text-white">뉴스</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">뉴스 로딩 중...</div>
        </div>
      </div>
    );
  }

  const currentNews = news[currentIndex];
  if (!currentNews) return null;

  // 스와이프 트랜스폼 계산
  const getSwipeTransform = () => {
    if (isDragging) {
      return `translateX(${dragX}px) scale(${1 - Math.abs(dragX) / 2000})`;
    }
    if (isTransitioning && swipeDirection) {
      return swipeDirection === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
    }
    return 'translateX(0)';
  };

  return (
    <div
      className="h-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-5 border border-white/10 flex flex-col overflow-hidden"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => { setIsDragging(false); setDragX(0); }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500/30 rounded-full flex items-center justify-center">
            <span className="text-lg">📰</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">주요 뉴스</h2>
              {isMock && (
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30"
                  title="실시간 뉴스를 불러오지 못해 샘플을 표시 중입니다 — 네이버 API 키 또는 네트워크를 확인하세요"
                >
                  📡 샘플
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {newsSource === 'naver' ? '네이버' : newsSource === 'yonhap' ? '연합' : '구글'} 뉴스
            </p>
          </div>
        </div>
        {/* 뉴스 소스 선택 버튼 */}
        <div className="flex gap-1">
          <button
            onClick={() => {
              setLoading(true);
              setNewsSource('naver');
              localStorage.setItem('panorama-settings', JSON.stringify({
                ...JSON.parse(localStorage.getItem('panorama-settings') || '{}'),
                newsSource: 'naver'
              }));
            }}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              newsSource === 'naver'
                ? 'bg-green-500/30 text-green-300'
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
            }`}
          >
            네이버
          </button>
          <button
            onClick={() => {
              setLoading(true);
              setNewsSource('yonhap');
              localStorage.setItem('panorama-settings', JSON.stringify({
                ...JSON.parse(localStorage.getItem('panorama-settings') || '{}'),
                newsSource: 'yonhap'
              }));
            }}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              newsSource === 'yonhap'
                ? 'bg-green-500/30 text-green-300'
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
            }`}
          >
            연합
          </button>
          <button
            onClick={() => {
              setLoading(true);
              setNewsSource('google');
              localStorage.setItem('panorama-settings', JSON.stringify({
                ...JSON.parse(localStorage.getItem('panorama-settings') || '{}'),
                newsSource: 'google'
              }));
            }}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              newsSource === 'google'
                ? 'bg-green-500/30 text-green-300'
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
            }`}
          >
            구글
          </button>
        </div>
      </div>

      {/* Single News Item - 앱처럼 스와이프 효과 */}
      <div
        className={`flex-1 flex flex-col ${isDragging ? '' : 'transition-transform duration-300'}`}
        style={{ transform: getSwipeTransform() }}
      >
        {/* Title - 글씨만 아래에서 나타나는 효과 */}
        <h3
          key={`title-${currentIndex}`}
          className={`text-4xl font-bold text-white mb-3 line-clamp-2 transition-all duration-500 ${
            isTransitioning ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'
          }`}
        >
          {decodeHtmlEntities(currentNews.title)}
        </h3>

        {/* Content Area with QR */}
        <div className="flex-1 flex gap-5">
          {/* News Content - Left Side */}
          <div className="flex-1 flex flex-col">
            {/* Summary - 글씨만 애니메이션 */}
            <p
              key={`summary-${currentIndex}`}
              className={`text-base text-gray-300 line-clamp-4 mb-4 flex-1 transition-all duration-500 delay-100 ${
                isTransitioning ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0'
              }`}
            >
              {decodeHtmlEntities(currentNews.summary)}
            </p>

            {/* Source & Time */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="font-medium">{currentNews.source}</span>
              <span>·</span>
              <span>{getTimeAgo(currentNews.publishedAt)}</span>
            </div>
          </div>

          {/* QR Code - Right Side */}
          <div className="flex flex-col items-center justify-end w-28 flex-shrink-0">
            <div className="bg-white p-1.5 rounded-lg mb-1">
              <img
                src={getQRCodeUrl(currentNews.url)}
                alt="QR Code"
                className="w-20 h-20"
              />
            </div>
            <p className="text-[10px] text-gray-400 text-center">
              QR로 기사보기
            </p>
          </div>
        </div>
      </div>

      {/* Progress Dots - 위로 조금 올림 */}
      <div className="flex justify-center gap-1 mt-2 mb-1">
        {news.slice(0, 5).map((_, idx) => (
          <div
            key={idx}
            className={`h-1 rounded-full transition-all ${
              idx === currentIndex % 5 ? 'w-4 bg-green-400' : 'w-1 bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
