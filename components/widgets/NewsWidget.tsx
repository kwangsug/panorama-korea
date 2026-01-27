'use client';

import { useEffect, useState } from 'react';
import { getNews, getMockNews } from '@/lib/api/news';
import type { NewsItem } from '@/types';

export function NewsWidget() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsSource, setNewsSource] = useState<'naver' | 'yonhap'>('naver');

  useEffect(() => {
    // 설정에서 뉴스 소스 읽기
    const savedSettings = localStorage.getItem('panorama-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.newsSource) {
          setNewsSource(settings.newsSource);
        }
      } catch (error) {
        console.error('설정 로드 실패:', error);
      }
    }
  }, []);

  useEffect(() => {
    loadNews();
    // 30분마다 자동 업데이트
    const interval = setInterval(loadNews, 1800000);
    return () => clearInterval(interval);
  }, [newsSource]);

  async function loadNews() {
    try {
      setLoading(true);
      const newsData = await getNews(newsSource);
      setNews(newsData);
    } catch (error) {
      console.error('뉴스 로딩 실패:', error);
      // 에러 시 목업 데이터 사용
      setNews(getMockNews());
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-500/30 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-2xl">📰</span>
          </div>
          <h2 className="text-2xl font-semibold text-white">뉴스</h2>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-white/20 rounded w-full"></div>
              <div className="h-3 bg-white/20 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 hover:bg-white/15 transition-all border border-white/20">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-500/30 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-2xl">📰</span>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">뉴스</h2>
            <p className="text-sm text-gray-300">주요 헤드라인</p>
          </div>
        </div>
        <button
          onClick={loadNews}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="새로고침"
        >
          <span className="text-xl">🔄</span>
        </button>
      </div>

      {/* 뉴스 목록 */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {news.slice(0, 5).map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors group"
          >
            <div className="flex items-start gap-3">
              {/* 이미지 (있는 경우) */}
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}

              {/* 텍스트 */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-white mb-2 line-clamp-2 group-hover:text-green-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                  {item.summary}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="font-medium">{item.source}</span>
                  <span>•</span>
                  <span>{getTimeAgo(item.publishedAt)}</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* 더보기 링크 */}
      <div className="mt-4 text-center">
        <a
          href="https://news.naver.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-green-300 hover:text-green-200 hover:underline transition-colors"
        >
          더 많은 뉴스 보기 →
        </a>
      </div>
    </div>
  );
}
