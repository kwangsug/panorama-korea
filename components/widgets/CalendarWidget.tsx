'use client';

import { useEffect, useState } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  allDay: boolean;
  color?: string;
  sourceName?: string;
}

interface CalendarSource {
  id: string;
  url: string;
  color: string;
  enabled: boolean;
  name: string;
}

interface CalendarWidgetProps {
  rotationSeconds?: number;
  calendarSources?: CalendarSource[];
}

export function CalendarWidget({
  rotationSeconds = 15,
  calendarSources = []
}: CalendarWidgetProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [nextEvent, setNextEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 캘린더 데이터 로드
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const enabledSources = calendarSources.filter(s => s.enabled);
        if (enabledSources.length === 0) {
          setEvents([]);
          setNextEvent(null);
          setLoading(false);
          return;
        }

        // 모든 활성화된 소스에서 이벤트 가져오기
        const allEventsPromises = enabledSources.map(async (source) => {
          try {
            // URL이 비어있으면 스킵
            if (!source.url || source.url.trim() === '') {
              console.warn(`캘린더 URL이 비어있음: ${source.name}`);
              return [];
            }

            const url = `/api/calendar?url=${encodeURIComponent(source.url)}`;
            const response = await fetch(url);
            if (!response.ok) {
              console.error(`캘린더 로드 실패: ${source.name}`, response.status);
              return [];
            }
            const data = await response.json();

            // events가 배열인지 확인
            if (!Array.isArray(data.events)) {
              console.error(`캘린더 응답이 배열이 아님: ${source.name}`, data);
              return [];
            }

            // Date 문자열을 Date 객체로 변환하고 색상과 소스명 추가
            return data.events
              .filter((event: any) => event && event.start && event.end)
              .map((event: any) => ({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end),
                color: source.color,
                sourceName: source.name,
              }));
          } catch (error) {
            console.error(`캘린더 로딩 실패: ${source.name}`, error);
            return [];
          }
        });

        const allEventsArrays = await Promise.all(allEventsPromises);
        const allEvents = allEventsArrays.flat();

        // 시작 시간 순으로 정렬
        allEvents.sort((a, b) => a.start.getTime() - b.start.getTime());

        setEvents(allEvents);

        // 다음 예정 일정 찾기 (현재 표시 중인 이벤트 다음)
        if (allEvents.length > 1) {
          setNextEvent(allEvents[1]);
        } else {
          setNextEvent(null);
        }
      } catch (error) {
        console.error('캘린더 로딩 실패:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
    // 5분마다 자동 업데이트
    const interval = setInterval(loadEvents, 300000);
    return () => clearInterval(interval);
  }, [calendarSources]);

  // 이벤트 자동 전환
  useEffect(() => {
    if (events.length <= 1 || rotationSeconds <= 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, rotationSeconds * 1000);
    return () => clearInterval(interval);
  }, [events.length, rotationSeconds]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="h-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-5 border border-white/10 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center">
            <span className="text-lg">📅</span>
          </div>
          <h2 className="text-lg font-semibold text-white">오늘의 일정</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">일정 로딩 중...</div>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="h-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-5 border border-white/10 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center">
            <span className="text-lg">📅</span>
          </div>
          <h2 className="text-lg font-semibold text-white">오늘의 일정</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400 text-xl">오늘은 일정이 없습니다</div>
        </div>
      </div>
    );
  }

  const currentEvent = events[currentIndex];

  const today = new Date();
  const dayOfMonth = today.getDate();
  const dayOfWeek = today.toLocaleDateString('ko-KR', { weekday: 'long' });

  return (
    <div className="h-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-5 border border-white/10 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center">
          <span className="text-lg">📅</span>
        </div>
        <h2 className="text-lg font-semibold text-white">오늘의 일정</h2>
        {events.length > 1 && (
          <div className="ml-auto text-sm text-gray-400">
            {currentIndex + 1} / {events.length}
          </div>
        )}
      </div>

      {/* Event Content - 2 Column Layout: Date Left, Content Right */}
      <div className="flex-1 flex gap-6">
        {/* Left: Date and Day */}
        <div className="flex flex-col items-center justify-start pt-6">
          <div className="text-[8vw] md:text-[6vw] font-bold text-white leading-none">
            {dayOfMonth}
          </div>
          <div className="text-[2.5vw] md:text-[2vw] font-semibold text-purple-200 mt-2">
            {dayOfWeek}
          </div>
        </div>

        {/* Right: Event Details */}
        <div className="flex-1 flex flex-col justify-center border-l border-white/10 pl-6">
          {/* Event Title with Color Bar */}
          <div className="flex items-start gap-3 mb-4">
            {currentEvent.color && (
              <div
                className="w-2 h-16 rounded-full flex-shrink-0"
                style={{ backgroundColor: currentEvent.color }}
              />
            )}
            <div className="flex-1">
              <h3
                key={`title-${currentIndex}`}
                className="text-[3vw] md:text-[2.5vw] font-bold text-white line-clamp-2 animate-[slideUp_0.5s_ease-out]"
              >
                {currentEvent.title}
              </h3>
              {currentEvent.sourceName && (
                <p className="text-[1vw] md:text-[0.8vw] text-gray-400 mt-2">
                  {currentEvent.sourceName}
                </p>
              )}
            </div>
          </div>

          {/* Event Time */}
          {!currentEvent.allDay && (
            <div className="flex items-center gap-2 text-[1.5vw] md:text-[1.2vw] text-purple-300 mb-3">
              <span>🕐</span>
              <span>
                {formatTime(currentEvent.start)}
                {currentEvent.start.getTime() !== currentEvent.end.getTime() &&
                  ` - ${formatTime(currentEvent.end)}`
                }
              </span>
            </div>
          )}

          {/* Event Description */}
          {currentEvent.description && (
            <p
              key={`desc-${currentIndex}`}
              className="text-[1.3vw] md:text-[1vw] text-gray-300 line-clamp-2 animate-[slideUp_0.5s_ease-out] delay-100"
            >
              {currentEvent.description}
            </p>
          )}

          {/* Next Event */}
          {nextEvent && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[1vw] md:text-[0.8vw] text-gray-400">다음 예정</span>
                <span className="text-[1vw] md:text-[0.8vw] text-gray-500">
                  {nextEvent.start.toLocaleDateString('ko-KR', {
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {nextEvent.color && (
                  <div
                    className="w-1 h-6 rounded-full flex-shrink-0"
                    style={{ backgroundColor: nextEvent.color }}
                  />
                )}
                <p className="text-[1.2vw] md:text-[1vw] text-gray-300 font-semibold line-clamp-1 flex-1">
                  {nextEvent.title}
                </p>
              </div>
              {nextEvent.sourceName && (
                <p className="text-[0.8vw] md:text-[0.6vw] text-gray-500 mt-1 ml-3">
                  {nextEvent.sourceName}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress Dots */}
      {events.length > 1 && (
        <div className="flex justify-center gap-1 mt-4">
          {events.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 rounded-full transition-all ${
                idx === currentIndex ? 'w-4 bg-purple-400' : 'w-1 bg-white/20'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
