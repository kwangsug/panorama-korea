'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MAJOR_CITIES, type CityName } from '@/lib/api/weather';

export default function SettingsPage() {
  const [selectedCity, setSelectedCity] = useState<CityName>('Seoul');
  const [showWeather, setShowWeather] = useState(true);
  const [showNews, setShowNews] = useState(true);
  const [showCalendar, setShowCalendar] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [newsSource, setNewsSource] = useState<'naver' | 'yonhap'>('naver');

  // 설정 로드
  useEffect(() => {
    const savedSettings = localStorage.getItem('panorama-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.selectedCity) setSelectedCity(settings.selectedCity);
        if (settings.showWeather !== undefined) setShowWeather(settings.showWeather);
        if (settings.showNews !== undefined) setShowNews(settings.showNews);
        if (settings.showCalendar !== undefined) setShowCalendar(settings.showCalendar);
        if (settings.autoRefresh !== undefined) setAutoRefresh(settings.autoRefresh);
        if (settings.newsSource) setNewsSource(settings.newsSource);
      } catch (error) {
        console.error('설정 로드 실패:', error);
      }
    }
  }, []);

  // 설정 저장
  const saveSettings = () => {
    const settings = {
      selectedCity,
      showWeather,
      showNews,
      showCalendar,
      autoRefresh,
      newsSource,
    };
    localStorage.setItem('panorama-settings', JSON.stringify(settings));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-8 py-4 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="홈으로"
          >
            <span className="text-2xl">←</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">설정</h1>
        </div>
      </header>

      {/* Settings Content */}
      <main className="px-8 py-8 max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Location Settings */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <span>📍</span>
              위치 설정
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  도시 선택
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value as CityName)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(MAJOR_CITIES).map(([key, city]) => (
                    <option key={key} value={key} className="bg-slate-800">
                      {city.nameKr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Widget Display Settings */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <span>🎨</span>
              위젯 표시 설정
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌤️</span>
                  <span className="text-white font-medium">날씨 위젯</span>
                </div>
                <input
                  type="checkbox"
                  checked={showWeather}
                  onChange={(e) => setShowWeather(e.target.checked)}
                  className="w-6 h-6 rounded bg-white/10 border-white/20 text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📰</span>
                  <span className="text-white font-medium">뉴스 위젯</span>
                </div>
                <input
                  type="checkbox"
                  checked={showNews}
                  onChange={(e) => setShowNews(e.target.checked)}
                  className="w-6 h-6 rounded bg-white/10 border-white/20 text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📅</span>
                  <span className="text-white font-medium">캘린더 위젯</span>
                </div>
                <input
                  type="checkbox"
                  checked={showCalendar}
                  onChange={(e) => setShowCalendar(e.target.checked)}
                  className="w-6 h-6 rounded bg-white/10 border-white/20 text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>
          </div>

          {/* News Source Settings */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <span>📡</span>
              뉴스 소스 설정
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  뉴스 제공자 선택
                </label>
                <select
                  value={newsSource}
                  onChange={(e) => setNewsSource(e.target.value as 'naver' | 'yonhap')}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="naver" className="bg-slate-800">
                    네이버 뉴스 (종합)
                  </option>
                  <option value="yonhap" className="bg-slate-800">
                    연합뉴스
                  </option>
                </select>
                <p className="mt-2 text-xs text-gray-400">
                  뉴스 소스를 변경하면 표시되는 뉴스가 달라집니다
                </p>
              </div>
            </div>
          </div>

          {/* Update Settings */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <span>🔄</span>
              업데이트 설정
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                <div>
                  <div className="text-white font-medium">자동 새로고침</div>
                  <div className="text-sm text-gray-400">
                    날씨와 뉴스를 주기적으로 업데이트합니다
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-6 h-6 rounded bg-white/10 border-white/20 text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>
          </div>

          {/* API Settings */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <span>🔑</span>
              API 키 설정
            </h2>
            <div className="space-y-4">
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                <p className="text-sm text-blue-200">
                  💡 API 키는 환경 변수로 설정됩니다. Vercel 배포 시 대시보드에서 설정하세요.
                </p>
              </div>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span>OpenWeatherMap API</span>
                  <span className={process.env.NEXT_PUBLIC_WEATHER_API_KEY ? "text-green-400" : "text-red-400"}>
                    {process.env.NEXT_PUBLIC_WEATHER_API_KEY ? "✓ 설정됨" : "✗ 미설정"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span>Naver API</span>
                  <span className={process.env.NEXT_PUBLIC_NAVER_CLIENT_ID ? "text-green-400" : "text-red-400"}>
                    {process.env.NEXT_PUBLIC_NAVER_CLIENT_ID ? "✓ 설정됨" : "✗ 미설정"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <span>ℹ️</span>
              정보
            </h2>
            <div className="space-y-2 text-gray-300">
              <p>버전: 1.0.0</p>
              <p>
                소스 코드:{" "}
                <a
                  href="https://github.com/kwangsug/panorama-korea"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  GitHub
                </a>
              </p>
              <p className="text-sm text-gray-400 mt-4">
                Based on{" "}
                <a
                  href="https://panorama-2ps.pages.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Panorama (일본판)
                </a>
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center pt-4">
            <Link
              href="/"
              onClick={saveSettings}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105"
            >
              저장하고 홈으로
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
