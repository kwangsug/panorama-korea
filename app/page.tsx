'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WeatherWidget } from '@/components/widgets/WeatherWidget';
import { NewsWidget } from '@/components/widgets/NewsWidget';

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-8 py-4 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🌐</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Panorama Korea</h1>
        </div>
        <Link
          href="/settings"
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="설정"
        >
          <span className="text-2xl">⚙️</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="px-8 py-6">
        {/* Current Time & Date */}
        <div className="text-center mb-8">
          <div className="text-7xl font-light text-white mb-2">
            {currentTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-2xl text-gray-300">
            {currentTime.toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </div>
        </div>

        {/* Widget Grid - 3 columns on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1800px] mx-auto">
          {/* Weather Widget */}
          <WeatherWidget />

          {/* Calendar Widget */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 hover:bg-white/15 transition-all border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-500/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl">📅</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">캘린더</h2>
            </div>
            <div className="space-y-3">
              <div className="text-gray-200">
                <p className="text-sm text-gray-400 mb-2">오늘의 일정</p>
                <div className="space-y-2">
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-sm font-medium">공휴일 및 일정 표시 예정</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-400">
                한국 공휴일 API 연동 예정
              </div>
            </div>
          </div>

          {/* News Widget */}
          <NewsWidget />
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-3 px-8 text-center text-sm text-gray-400 bg-black/20 backdrop-blur-sm">
        <p>
          Based on{" "}
          <a
            href="https://panorama-2ps.pages.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Panorama
          </a>
          {" "}• Made with Next.js & Tailwind CSS
        </p>
      </footer>
    </div>
  );
}
