'use client';

import { useState } from 'react';
import { ClockWidget } from '@/components/widgets/ClockWidget';
import { WeatherWidget } from '@/components/widgets/WeatherWidget';
import { NewsWidget } from '@/components/widgets/NewsWidget';

export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // 왼쪽에서 드래그 감지
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    // 왼쪽에서 오른쪽으로 50px 이상 드래그
    if (touchStart < 50 && touchEnd - touchStart > 100) {
      setSettingsOpen(true);
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Settings Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-80 bg-black/40 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-in-out z-50 ${
          settingsOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">설정</h2>
            <button
              onClick={() => setSettingsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>

          {/* Settings Options */}
          <div className="space-y-4">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">위젯 표시</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>시계</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>날씨</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>뉴스</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>캘린더</span>
                </label>
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">테마</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <label className="flex items-center gap-2">
                  <input type="radio" name="theme" defaultChecked />
                  <span>다크</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="theme" />
                  <span>라이트</span>
                </label>
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">뉴스 소스</h3>
              <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm">
                <option value="naver">네이버 뉴스</option>
                <option value="yonhap">연합뉴스</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {settingsOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSettingsOpen(false)}
        />
      )}

      {/* Main Content - Vertical Scroll */}
      <main className="h-screen overflow-y-auto px-6 py-6 space-y-6 pb-20">
        {/* Clock Widget */}
        <ClockWidget />

        {/* Weather Widget */}
        <WeatherWidget />

        {/* News Widget */}
        <NewsWidget />

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
      </main>

      {/* Drag Hint */}
      <div className="fixed bottom-4 left-4 text-xs text-gray-500 bg-black/20 backdrop-blur-sm px-3 py-2 rounded-lg">
        ← 왼쪽에서 드래그하여 설정
      </div>
    </div>
  );
}
