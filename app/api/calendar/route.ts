import { NextResponse } from 'next/server';
import ICAL from 'ical.js';

export const dynamic = 'force-dynamic';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  allDay: boolean;
}

// 한국 공휴일 iCal URL (기본값 - Google Calendar)
const DEFAULT_ICAL_URL = 'https://calendar.google.com/calendar/ical/ko.south_korea%23holiday%40group.v.calendar.google.com/public/basic.ics';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customUrl = searchParams.get('url');
    const icalUrl = customUrl || DEFAULT_ICAL_URL;

    // iCal 데이터 가져오기
    const response = await fetch(icalUrl, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('iCal fetch failed');
    }

    const icalData = await response.text();

    // ical.js로 파싱
    const jcalData = ICAL.parse(icalData);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents('vevent');

    // 오늘 날짜 기준으로 필터링
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEvents: CalendarEvent[] = [];
    const upcomingEvents: CalendarEvent[] = [];

    for (const vevent of vevents) {
      const event = new ICAL.Event(vevent);

      const startTime = event.startDate?.toJSDate();
      const endTime = event.endDate?.toJSDate();

      if (!startTime) continue;

      const eventDate = new Date(startTime);
      eventDate.setHours(0, 0, 0, 0);

      const calEvent: CalendarEvent = {
        id: event.uid || Math.random().toString(),
        title: event.summary || '제목 없음',
        description: event.description || '',
        start: startTime,
        end: endTime || startTime,
        allDay: event.startDate?.isDate || false,
      };

      // 오늘 날짜의 이벤트
      if (eventDate.getTime() === today.getTime()) {
        todayEvents.push(calEvent);
      }
      // 미래 이벤트 (오늘 이후)
      else if (eventDate.getTime() > today.getTime()) {
        upcomingEvents.push(calEvent);
      }
    }

    // 시작 시간 순으로 정렬
    todayEvents.sort((a, b) => a.start.getTime() - b.start.getTime());
    upcomingEvents.sort((a, b) => a.start.getTime() - b.start.getTime());

    // 다음 예정 일정 (가장 가까운 미래 일정 1개)
    const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;

    return NextResponse.json({
      events: todayEvents,
      nextEvent: nextEvent,
      source: customUrl ? 'custom' : 'default',
    });
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar', events: [], nextEvent: null },
      { status: 500 }
    );
  }
}
