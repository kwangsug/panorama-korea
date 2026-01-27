/**
 * 공통 타입 정의
 */

// 날씨 관련 타입
export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
  updatedAt: Date;
}

export interface WeatherForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  condition: string;
  precipitation: number;
}

// 캘린더 관련 타입
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  isHoliday: boolean;
  isLunar?: boolean;
  description?: string;
}

export interface Holiday {
  date: string;
  name: string;
  isLunar: boolean;
}

// 뉴스 관련 타입
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: Date;
  imageUrl?: string;
}

// 교통 관련 타입
export interface TrafficInfo {
  id: string;
  line: string;
  status: 'normal' | 'delay' | 'suspended';
  message?: string;
  updatedAt: Date;
}

// 사용자 설정 타입
export interface UserSettings {
  widgets: {
    weather: boolean;
    calendar: boolean;
    news: boolean;
    traffic: boolean;
  };
  location: string;
  refreshInterval: number; // minutes
  theme: 'light' | 'dark' | 'auto';
}
