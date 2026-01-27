'use client';

import { useEffect, useState } from 'react';
import { getCurrentWeather, getWeatherForecast, type WeatherData, type WeatherForecast, type CityName } from '@/lib/api/weather';

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<CityName>('Seoul');

  useEffect(() => {
    loadWeatherData();
    // 10분마다 자동 업데이트
    const interval = setInterval(loadWeatherData, 600000);
    return () => clearInterval(interval);
  }, [selectedCity]);

  async function loadWeatherData() {
    try {
      setLoading(true);
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
  }

  if (loading || !weather) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-500/30 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-2xl">☀️</span>
          </div>
          <h2 className="text-2xl font-semibold text-white">날씨</h2>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/20 rounded w-3/4"></div>
          <div className="h-4 bg-white/20 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 hover:bg-white/15 transition-all border border-white/20">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500/30 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-2xl">☀️</span>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">날씨</h2>
            <p className="text-sm text-gray-300">{weather.location}</p>
          </div>
        </div>
        <button
          onClick={loadWeatherData}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="새로고침"
        >
          <span className="text-xl">🔄</span>
        </button>
      </div>

      {/* 현재 날씨 */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-6xl font-bold text-white">
              {weather.temperature}°
            </div>
            <div className="text-xl text-gray-200 mt-2">
              {weather.condition}
            </div>
          </div>
          <img
            src={`https://openweathermap.org/img/wn/${weather.conditionIcon}@2x.png`}
            alt={weather.condition}
            className="w-24 h-24"
          />
        </div>

        {/* 세부 정보 */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-sm text-gray-300">습도</div>
            <div className="text-lg font-semibold text-white">
              {weather.humidity}%
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-sm text-gray-300">풍속</div>
            <div className="text-lg font-semibold text-white">
              {weather.windSpeed} m/s
            </div>
          </div>
        </div>
      </div>

      {/* 주간 예보 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-200 mb-3">
          주간 예보
        </h3>
        <div className="space-y-2">
          {forecast.slice(0, 5).map((day, index) => {
            const date = new Date(day.date);
            const dayName = index === 0 ? '오늘' : ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];

            return (
              <div
                key={day.date}
                className="flex items-center justify-between bg-white/10 rounded-lg p-3"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm font-medium text-gray-200 w-8">
                    {dayName}
                  </span>
                  <img
                    src={`https://openweathermap.org/img/wn/${day.conditionIcon}.png`}
                    alt={day.condition}
                    className="w-8 h-8"
                  />
                  <span className="text-sm text-gray-300">
                    {day.condition}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-blue-300">
                    {day.maxTemp}°
                  </span>
                  <span className="text-sm text-gray-400">
                    {day.minTemp}°
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 업데이트 시간 */}
      <div className="mt-4 text-xs text-gray-400 text-center">
        마지막 업데이트: {weather.updatedAt.toLocaleTimeString('ko-KR')}
      </div>
    </div>
  );
}
