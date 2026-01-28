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
  const [loading, setLoading] = useState(true);
  const [holiday, setHoliday] = useState<string | null>(null);
  const [nextEvent, setNextEvent] = useState<CalendarEvent | null>(null);

  // 캘린더 데이터 로드
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const enabledSources = calendarSources.filter(s => s.enabled);
        if (enabledSources.length === 0) {
          setEvents([]);
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

        // 오늘 날짜 필터링
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);

        const todayEvents = allEvents.filter(event => {
          const eventDate = new Date(event.start);
          return eventDate >= today && eventDate <= todayEnd;
        });

        // 시작 시간 순으로 정렬
        todayEvents.sort((a, b) => a.start.getTime() - b.start.getTime());

        // 공휴일 감지 (제목에 "공휴일", "holiday" 포함 또는 allDay인 특정 이벤트)
        const holidayEvent = todayEvents.find(e =>
          e.allDay && (
            e.title.includes('공휴일') ||
            e.title.includes('Holiday') ||
            e.sourceName?.includes('공휴일') ||
            e.sourceName?.includes('Holiday')
          )
        );

        if (holidayEvent) {
          setHoliday(holidayEvent.title);
        } else {
          setHoliday(null);
        }

        setEvents(todayEvents);
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
      </div>

      {/* Content - 2 Column Layout: Date Left, Events List Right */}
      <div className="flex-1 flex gap-6">
        {/* Left: Date, Day, and Holiday */}
        <div className="flex flex-col items-center justify-start pt-6">
          <div className="text-[8vw] md:text-[6vw] font-bold text-white leading-none">
            {dayOfMonth}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="text-[2.5vw] md:text-[2vw] font-semibold text-purple-200">
              {dayOfWeek}
            </div>
            {holiday && (
              <div className="text-[1.5vw] md:text-[1.2vw] text-red-300 font-semibold">
                🎉 {holiday}
              </div>
            )}
          </div>
          {holiday && (
            <div className="text-[1.2vw] md:text-[1vw] text-red-200 mt-2 text-center">
              {holiday}
            </div>
          )}
        </div>

        {/* Right: Events List */}
        <div className="flex-1 flex flex-col border-l border-white/10 pl-6 overflow-y-auto">
          {events.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-gray-400 text-[1.5vw] md:text-[1.2vw]">오늘은 일정이 없습니다</div>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 rounded-xl p-3 border border-white/10 hover:border-purple-400/30 transition-all"
                >
                  {/* Event Title with Color Bar */}
                  <div className="flex items-start gap-3 mb-2">
                    {event.color && (
                      <div
                        className="w-1.5 h-12 rounded-full flex-shrink-0"
                        style={{ backgroundColor: event.color }}
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-[1.8vw] md:text-[1.5vw] font-bold text-white line-clamp-2">
                        {event.title}
                      </h3>
                      {event.sourceName && (
                        <p className="text-[0.8vw] md:text-[0.6vw] text-gray-400 mt-1">
                          {event.sourceName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Event Time */}
                  {!event.allDay && (
                    <div className="flex items-center gap-2 text-[1.2vw] md:text-[1vw] text-purple-300 mb-2">
                      <span>🕐</span>
                      <span>
                        {formatTime(event.start)}
                        {event.start.getTime() !== event.end.getTime() &&
                          ` - ${formatTime(event.end)}`
                        }
                      </span>
                    </div>
                  )}

                  {/* Event Description */}
                  {event.description && (
                    <p className="text-[1vw] md:text-[0.8vw] text-gray-300 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
