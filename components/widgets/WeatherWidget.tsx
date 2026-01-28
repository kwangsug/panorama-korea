'use client';

import { useEffect, useState, useCallback } from 'react';
import { getCurrentWeather, getWeatherForecast, type WeatherData, type WeatherForecast, type CityName } from '@/lib/api/weather';

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<CityName>('Seoul');

  useEffect(() => {
    const savedSettings = localStorage.getItem('panorama-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.selectedCity) {
          setSelectedCity(settings.selectedCity);
        }
      } catch (error) {
        console.error('설정 로드 실패:', error);
      }
    }
  }, []);

  const loadWeatherData = useCallback(async () => {
    try {
      const [currentWeather, forecastData] = await Promise.all([
        getCurrentWeather(selectedCity),
        getWeatherForecast(selectedCity),
      ]);
      setWeather(currentWeather);
      setForecast(forecastData);
    } catch (error) {
      console.error('날씨 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCity]);

  useEffect(() => {
    loadWeatherData();
    // 30분마다 자동 업데이트
    const interval = setInterval(loadWeatherData, 1800000);
    return () => clearInterval(interval);
  }, [loadWeatherData]);

  if (loading || !weather) {
    return (
      <div className="h-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-5 border border-white/10 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-500/30 rounded-full flex items-center justify-center">
            <span className="text-lg">☀️</span>
          </div>
          <h2 className="text-lg font-semibold text-white">날씨</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">날씨 로딩 중...</div>
        </div>
      </div>
    );
  }

  // 아이콘 코드에 따른 이모지 폴백
  const getWeatherEmoji = (iconCode: string) => {
    const emojiMap: Record<string, string> = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️',
    };
    return emojiMap[iconCode] || '☀️';
  };

  return (
    <div className="h-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-5 border border-white/10 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500/30 rounded-full flex items-center justify-center">
            <span className="text-lg">{getWeatherEmoji(weather.conditionIcon)}</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">날씨</h2>
            <p className="text-xs text-gray-400">{weather.location}</p>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {weather.updatedAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 업데이트
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center gap-8">
        {/* Current Weather - Left */}
        <div className="flex items-center gap-6">
          {/* Weather Icon */}
          <div className="text-8xl leading-none">
            {getWeatherEmoji(weather.conditionIcon)}
          </div>
          {/* Temperature & Condition */}
          <div>
            <div className="text-8xl font-bold text-white leading-none">
              {weather.temperature}°
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-2xl text-gray-200">{weather.condition}</span>
              <span className="text-lg text-blue-300">▲{weather.maxTemp}°</span>
              <span className="text-lg text-gray-400">▼{weather.minTemp}°</span>
            </div>
          </div>
        </div>

        {/* Weather Details - 세로 구분선 + 중앙 */}
        <div className="h-32 w-px bg-white/20" />
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💧</span>
            <div>
              <div className="text-xs text-gray-400">습도</div>
              <div className="text-2xl font-semibold text-white">{weather.humidity}%</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">💨</span>
            <div>
              <div className="text-xs text-gray-400">풍속</div>
              <div className="text-2xl font-semibold text-white">{weather.windSpeed}m/s</div>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* 5-Day Forecast - Right */}
        <div className="w-52 flex flex-col flex-shrink-0 mr-8">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">5일 예보</h3>
          <div className="flex-1 flex flex-col justify-around">
            {forecast.slice(0, 5).map((day, index) => {
              const date = new Date(day.date);
              const dayName = index === 0 ? '오늘' : ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];

              return (
                <div
                  key={day.date}
                  className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-1"
                >
                  <span className="text-sm text-gray-300 w-8 font-medium">{dayName}</span>
                  <span className="text-lg">{getWeatherEmoji(day.conditionIcon)}</span>
                  <div className="text-sm text-right">
                    <span className="text-blue-300 font-bold">{day.maxTemp}°</span>
                    <span className="text-gray-500 mx-0.5">/</span>
                    <span className="text-gray-400">{day.minTemp}°</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
