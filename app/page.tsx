'use client';

import { useState, useEffect } from 'react';
import { ClockWidget } from '@/components/widgets/ClockWidget';
import { WeatherWidget } from '@/components/widgets/WeatherWidget';
import { NewsWidget } from '@/components/widgets/NewsWidget';
import { JobWidget } from '@/components/widgets/JobWidget';
import { CalendarWidget } from '@/components/widgets/CalendarWidget';
import { FinanceWidget } from '@/components/widgets/FinanceWidget';
import { MAJOR_CITIES, type CityName } from '@/lib/api/weather';

type ContentView = 'weather' | 'news' | 'jobs' | 'calendar' | 'finance';

const VIEWS: ContentView[] = ['weather', 'news', 'jobs', 'calendar', 'finance'];

const CITIES: Record<string, string> = {
  Seoul: '서울',
  Busan: '부산',
  Daegu: '대구',
  Incheon: '인천',
  Gwangju: '광주',
  Daejeon: '대전',
  Ulsan: '울산',
  Sejong: '세종',
  Gyeonggi: '경기',
  Gangwon: '강원',
  Chungbuk: '충북',
  Chungnam: '충남',
  Jeonbuk: '전북',
  Jeonnam: '전남',
  Gyeongbuk: '경북',
  Gyeongnam: '경남',
  Jeju: '제주',
};

export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ContentView>('weather');
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [swipeAxis, setSwipeAxis] = useState<'horizontal' | 'vertical' | null>(null);
  const [showSettingsHint, setShowSettingsHint] = useState(false);

  // Settings state
  const [selectedCity, setSelectedCity] = useState<string>('Seoul');
  const [newsSource, setNewsSource] = useState<'naver' | 'yonhap' | 'google'>('naver');
  const [autoSwitchSeconds, setAutoSwitchSeconds] = useState(30);
  const [newsRotationSeconds, setNewsRotationSeconds] = useState(15);
  const [jobRotationSeconds, setJobRotationSeconds] = useState(10);
  const [serpApiKey, setSerpApiKey] = useState<string>('');
  const [financeDataSources, setFinanceDataSources] = useState<string[]>([
    'https://serpapi.com/search?engine=google_finance'
  ]);
  const [calendarSources, setCalendarSources] = useState<Array<{
    id: string;
    url: string;
    color: string;
    enabled: boolean;
    name: string;
  }>>([
    {
      id: '1',
      url: 'https://calendar.google.com/calendar/ical/ko.south_korea%23holiday%40group.v.calendar.google.com/public/basic.ics',
      color: '#a78bfa', // 보라
      enabled: true,
      name: '한국 공휴일'
    }
  ]);

  // 설정 로드
  useEffect(() => {
    const saved = localStorage.getItem('panorama-settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        if (settings.selectedCity) setSelectedCity(settings.selectedCity as string);
        if (settings.newsSource) setNewsSource(settings.newsSource);
        if (settings.autoSwitchSeconds) setAutoSwitchSeconds(settings.autoSwitchSeconds);
        if (settings.newsRotationSeconds) setNewsRotationSeconds(settings.newsRotationSeconds);
        if (settings.jobRotationSeconds) setJobRotationSeconds(settings.jobRotationSeconds);
        if (settings.serpApiKey) setSerpApiKey(settings.serpApiKey);
        if (settings.financeDataSources) setFinanceDataSources(settings.financeDataSources);
        if (settings.calendarSources) setCalendarSources(settings.calendarSources);
      } catch (e) {
        console.error('설정 로드 실패:', e);
      }
    }
  }, []);

  // 설정 저장
  const saveSettings = (updates: Record<string, unknown>) => {
    const saved = localStorage.getItem('panorama-settings');
    const current = saved ? JSON.parse(saved) : {};
    const newSettings = { ...current, ...updates };
    localStorage.setItem('panorama-settings', JSON.stringify(newSettings));
  };

  // 자동 전환 (설정된 초 간격)
  useEffect(() => {
    if (autoSwitchSeconds <= 0) return;
    const interval = setInterval(() => {
      setCurrentView((prev) => {
        const currentIdx = VIEWS.indexOf(prev);
        return VIEWS[(currentIdx + 1) % VIEWS.length];
      });
    }, autoSwitchSeconds * 1000);
    return () => clearInterval(interval);
  }, [autoSwitchSeconds]);

  // 포인터 이벤트로 통합 스와이프 감지 (터치 + 마우스)
  const handlePointerDown = (e: React.PointerEvent) => {
    setTouchStart({
      x: e.clientX,
      y: e.clientY,
    });
    setIsDragging(true);
    setDragOffset(0);
    setSwipeAxis(null); // 방향 초기화
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const diffX = e.clientX - touchStart.x;
    const diffY = e.clientY - touchStart.y;

    // 방향이 아직 결정되지 않은 경우, 8px 이상 움직이면 방향 결정
    if (!swipeAxis && (Math.abs(diffX) > 8 || Math.abs(diffY) > 8)) {
      // 세로가 가로보다 크면 세로로 판정 (세로 스와이프 우선)
      if (Math.abs(diffY) >= Math.abs(diffX)) {
        setSwipeAxis('vertical');
      } else {
        setSwipeAxis('horizontal');
      }
    }

    // 세로 스와이프일 때만 위젯 드래그 적용
    if (swipeAxis === 'vertical') {
      setDragOffset(diffY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const diffX = touchStart.x - e.clientX;
    const diffY = touchStart.y - e.clientY;
    const screenWidth = window.innerWidth;

    // 왼쪽 가장자리에서 오른쪽으로 스와이프 → 설정 열기
    if (touchStart.x < 100 && diffX < -30) {
      setIsDragging(false);
      setDragOffset(0);
      setSwipeAxis(null);
      setSettingsOpen(true);
      return;
    }

    // 설정이 열린 상태에서 왼쪽으로 스와이프 → 설정 닫기
    if (settingsOpen && diffX > 30) {
      setIsDragging(false);
      setDragOffset(0);
      setSwipeAxis(null);
      setSettingsOpen(false);
      return;
    }

    // 세로 스와이프로 위젯 전환 (방향이 vertical로 잠긴 경우만, 30px 이상)
    if (swipeAxis === 'vertical' && Math.abs(diffY) > 30) {
      const currentIdx = VIEWS.indexOf(currentView);
      if (diffY > 0) {
        // 위로 스와이프 → 다음 위젯
        setCurrentView(VIEWS[(currentIdx + 1) % VIEWS.length]);
      } else {
        // 아래로 스와이프 → 이전 위젯
        setCurrentView(VIEWS[(currentIdx - 1 + VIEWS.length) % VIEWS.length]);
      }
    }

    setIsDragging(false);
    setDragOffset(0);
    setSwipeAxis(null);
  };

  // 위젯 transform 계산 함수
  const getWidgetTransform = (view: ContentView) => {
    const currentIdx = VIEWS.indexOf(currentView);
    const viewIdx = VIEWS.indexOf(view);
    const diff = viewIdx - currentIdx;

    // 드래그 중일 때 실시간으로 위치 반영
    const dragPx = isDragging ? dragOffset : 0;

    if (view === currentView) {
      const scale = isDragging ? Math.max(0.95, 1 - Math.abs(dragOffset) / 1000) : 1;
      return `translateY(${dragPx}px) scale(${scale})`;
    } else {
      // 다음/이전 위젯 위치
      const baseOffset = diff > 0 ? 100 : -100;
      // 드래그 방향에 따라 다음 위젯 미리보기
      const previewOffset = isDragging ? dragOffset * 0.5 : 0;
      return `translateY(calc(${baseOffset}% + ${previewOffset}px)) scale(0.85)`;
    }
  };

  const getWidgetOpacity = (view: ContentView) => {
    if (view === currentView) {
      return isDragging ? Math.max(0.7, 1 - Math.abs(dragOffset) / 500) : 1;
    }
    // 드래그 방향의 다음 위젯만 보이기
    const currentIdx = VIEWS.indexOf(currentView);
    const viewIdx = VIEWS.indexOf(view);
    const diff = viewIdx - currentIdx;

    if (isDragging) {
      // 드래그 방향에 있는 위젯 보이기
      if ((dragOffset < 0 && diff === 1) || (dragOffset > 0 && diff === -1)) {
        return Math.min(0.6, Math.abs(dragOffset) / 200);
      }
    }
    return 0.3;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden flex items-center justify-center">
      {/* Dashboard Container - 32:9 Aspect Ratio (1920x540) */}
      <div className="w-full max-w-[1920px] aspect-[32/9] p-4 md:p-6 flex gap-4 md:gap-5">
        {/* Clock Widget - 왼쪽 (4 비율) */}
        <div className="w-[40%] flex-shrink-0 h-full">
          <ClockWidget />
        </div>

        {/* Content Area - 오른쪽 (6 비율) */}
        <div
          className="w-[60%] flex-shrink-0 h-full relative overflow-hidden"
          style={{ perspective: '1200px' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => { setIsDragging(false); setDragOffset(0); }}
        >
          {/* Weather Widget (index 0) */}
          <div
            className={`absolute inset-0 ${isDragging ? '' : 'transition-all duration-500 ease-out'} ${
              currentView === 'weather' ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
            style={{
              transform: getWidgetTransform('weather'),
              opacity: getWidgetOpacity('weather'),
              transformOrigin: 'center center',
            }}
          >
            <WeatherWidget />
          </div>

          {/* News Widget (index 1) */}
          <div
            className={`absolute inset-0 ${isDragging ? '' : 'transition-all duration-500 ease-out'} ${
              currentView === 'news' ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
            style={{
              transform: getWidgetTransform('news'),
              opacity: getWidgetOpacity('news'),
              transformOrigin: 'center center',
            }}
          >
            <NewsWidget rotationSeconds={newsRotationSeconds} />
          </div>

          {/* Job Widget (index 2) */}
          <div
            className={`absolute inset-0 ${isDragging ? '' : 'transition-all duration-500 ease-out'} ${
              currentView === 'jobs' ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
            style={{
              transform: getWidgetTransform('jobs'),
              opacity: getWidgetOpacity('jobs'),
              transformOrigin: 'center center',
            }}
          >
            <JobWidget rotationSeconds={jobRotationSeconds} />
          </div>

          {/* Calendar Widget (index 3) */}
          <div
            className={`absolute inset-0 ${isDragging ? '' : 'transition-all duration-500 ease-out'} ${
              currentView === 'calendar' ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
            style={{
              transform: getWidgetTransform('calendar'),
              opacity: getWidgetOpacity('calendar'),
              transformOrigin: 'center center',
            }}
          >
            <CalendarWidget calendarSources={calendarSources} />
          </div>

          {/* Finance Widget (index 4) */}
          <div
            className={`absolute inset-0 ${isDragging ? '' : 'transition-all duration-500 ease-out'} ${
              currentView === 'finance' ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
            style={{
              transform: getWidgetTransform('finance'),
              opacity: getWidgetOpacity('finance'),
              transformOrigin: 'center center',
            }}
          >
            <FinanceWidget rotationSeconds={10} />
          </div>

          {/* Vertical Page Indicator - Inside Widget */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-10">
            <div
              className={`w-2 rounded-full transition-all duration-300 ${
                currentView === 'weather' ? 'bg-blue-400 h-6' : 'bg-white/30 h-2'
              }`}
            />
            <div
              className={`w-2 rounded-full transition-all duration-300 ${
                currentView === 'news' ? 'bg-green-400 h-6' : 'bg-white/30 h-2'
              }`}
            />
            <div
              className={`w-2 rounded-full transition-all duration-300 ${
                currentView === 'jobs' ? 'bg-orange-400 h-6' : 'bg-white/30 h-2'
              }`}
            />
            <div
              className={`w-2 rounded-full transition-all duration-300 ${
                currentView === 'calendar' ? 'bg-purple-400 h-6' : 'bg-white/30 h-2'
              }`}
            />
            <div
              className={`w-2 rounded-full transition-all duration-300 ${
                currentView === 'finance' ? 'bg-green-400 h-6' : 'bg-white/30 h-2'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Settings Sidebar - Left Side */}
      <div
        className={`fixed inset-y-0 left-0 w-80 bg-black/80 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-in-out z-50 ${
          settingsOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 h-full overflow-y-auto">
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
            {/* 위치 설정 */}
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span>📍</span> 위치 설정
              </h3>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  saveSettings({ selectedCity: e.target.value });
                }}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
              >
                {Object.entries(CITIES).map(([key, name]) => (
                  <option key={key} value={key} className="bg-slate-800">
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* 뉴스 소스 */}
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span>📰</span> 뉴스 소스
              </h3>
              <select
                value={newsSource}
                onChange={(e) => {
                  const value = e.target.value as 'naver' | 'yonhap' | 'google';
                  setNewsSource(value);
                  saveSettings({ newsSource: value });
                }}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="naver" className="bg-slate-800">네이버 뉴스</option>
                <option value="yonhap" className="bg-slate-800">연합뉴스</option>
                <option value="google" className="bg-slate-800">구글 뉴스 (지역 포함)</option>
              </select>
              <p className="mt-2 text-xs text-gray-400">
                구글 뉴스는 선택한 지역 뉴스를 자동으로 포함합니다
              </p>
            </div>

            {/* 캘린더 소스 관리 */}
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span>📅</span> 캘린더 소스
              </h3>
              <div className="space-y-3">
                {calendarSources.map((source, index) => (
                  <div key={source.id} className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={source.enabled}
                        onChange={(e) => {
                          const newSources = [...calendarSources];
                          newSources[index].enabled = e.target.checked;
                          setCalendarSources(newSources);
                          saveSettings({ calendarSources: newSources });
                        }}
                        className="w-4 h-4"
                      />
                      <div
                        className="w-6 h-6 rounded-full flex-shrink-0 border-2 border-white/20"
                        style={{ backgroundColor: source.color }}
                      />
                      <span className="flex-1 text-sm text-gray-300 truncate">
                        {source.name}
                      </span>
                      <input
                        type="color"
                        value={source.color}
                        onChange={(e) => {
                          const newSources = [...calendarSources];
                          newSources[index].color = e.target.value;
                          setCalendarSources(newSources);
                          saveSettings({ calendarSources: newSources });
                        }}
                        className="w-6 h-6 rounded cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                        title="색상 변경"
                      />
                      {calendarSources.length > 1 && (
                        <button
                          onClick={() => {
                            const newSources = calendarSources.filter((_, i) => i !== index);
                            setCalendarSources(newSources);
                            saveSettings({ calendarSources: newSources });
                          }}
                          className="text-red-400 hover:text-red-300 px-2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={source.url}
                      onChange={(e) => {
                        const newSources = [...calendarSources];
                        newSources[index].url = e.target.value;
                        // URL에서 이름 자동 추출 시도
                        const urlName = e.target.value.includes('holidays') ? '한국 공휴일' : `캘린더 ${index + 1}`;
                        newSources[index].name = urlName;
                        setCalendarSources(newSources);
                        saveSettings({ calendarSources: newSources });
                      }}
                      placeholder="iCal URL"
                      className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs"
                    />
                  </div>
                ))}

                {calendarSources.length < 5 && (
                  <button
                    onClick={() => {
                      // 위젯과 어울리는 색상 팔레트 (보라, 분홍, 청록, 주황, 연두)
                      const colors = ['#a78bfa', '#f472b6', '#06b6d4', '#fb923c', '#84cc16'];
                      const usedColors = calendarSources.map(s => s.color);
                      const availableColor = colors.find(c => !usedColors.includes(c)) || colors[calendarSources.length % colors.length];

                      const newSource = {
                        id: Date.now().toString(),
                        url: '',
                        color: availableColor,
                        enabled: true,
                        name: `캘린더 ${calendarSources.length + 1}`
                      };
                      const newSources = [...calendarSources, newSource];
                      setCalendarSources(newSources);
                      saveSettings({ calendarSources: newSources });
                    }}
                    className="w-full py-2 text-sm text-gray-300 hover:text-white border border-dashed border-white/20 hover:border-white/40 rounded-lg transition-colors"
                  >
                    + 캘린더 추가
                  </button>
                )}
              </div>
              <p className="mt-3 text-xs text-gray-400">
                최대 5개까지 추가 가능합니다
              </p>
            </div>

            {/* 자동 전환 */}
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span>🔄</span> 자동 전환
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-300">전환 간격</span>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={autoSwitchSeconds}
                  onChange={(e) => {
                    const value = Math.max(0, Math.min(300, Number(e.target.value)));
                    setAutoSwitchSeconds(value);
                    saveSettings({ autoSwitchSeconds: value });
                  }}
                  className="w-20 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm text-center"
                />
                <span className="text-sm text-gray-400">초</span>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                0으로 설정하면 자동 전환 비활성화
              </p>
            </div>

            {/* 콘텐츠 전환 주기 */}
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span>⏱️</span> 콘텐츠 전환 주기
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">뉴스</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={newsRotationSeconds}
                      onChange={(e) => {
                        const value = Math.max(0, Math.min(120, Number(e.target.value)));
                        setNewsRotationSeconds(value);
                        saveSettings({ newsRotationSeconds: value });
                      }}
                      className="w-16 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-sm text-center"
                    />
                    <span className="text-sm text-gray-400">초</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">채용정보</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={jobRotationSeconds}
                      onChange={(e) => {
                        const value = Math.max(0, Math.min(120, Number(e.target.value)));
                        setJobRotationSeconds(value);
                        saveSettings({ jobRotationSeconds: value });
                      }}
                      className="w-16 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-sm text-center"
                    />
                    <span className="text-sm text-gray-400">초</span>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                0으로 설정하면 자동 전환 비활성화
              </p>
            </div>

            {/* SerpAPI 키 설정 */}
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span>🔑</span> SerpAPI 키
              </h3>
              <input
                type="password"
                value={serpApiKey}
                onChange={(e) => {
                  setSerpApiKey(e.target.value);
                  saveSettings({ serpApiKey: e.target.value });
                }}
                placeholder="SerpAPI 키를 입력하세요"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
              />
              <p className="mt-2 text-xs text-gray-400">
                구글 뉴스와 금융 정보에 사용됩니다 (선택사항)
              </p>
            </div>

            {/* 정보 */}
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span>ℹ️</span> 정보
              </h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>버전: 2.0.0</p>
                <p>Inspired by ishikoken28 with Panorama</p>
                <p>
                  <a
                    href="https://github.com/starkid/panorama-korea"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    GitHub
                  </a>
                </p>
              </div>
            </div>

            {/* 설정 닫기 버튼 */}
            <button
              onClick={() => setSettingsOpen(false)}
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              설정 닫기
            </button>
          </div>

        </div>
      </div>

      {/* Settings Hint - Left Edge */}
      {!settingsOpen && (
        <div
          className="fixed left-0 top-0 bottom-0 w-16 z-30 flex items-center justify-start cursor-e-resize"
          onMouseEnter={() => setShowSettingsHint(true)}
          onMouseLeave={() => setShowSettingsHint(false)}
          onClick={() => {
            setSettingsOpen(true);
            setShowSettingsHint(false);
          }}
        >
          <div
            className={`flex items-center gap-1 px-2 py-4 bg-black/40 backdrop-blur-sm rounded-r-lg transition-all duration-300 ${
              showSettingsHint ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            }`}
          >
            <span className="text-white/80 text-xl">⚙️</span>
            <span className="text-white/80 text-lg">▶</span>
          </div>
        </div>
      )}

      {/* Overlay when settings open */}
      {settingsOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
