/**
 * OpenWeatherMap One Call API 3.0 클라이언트
 *
 * API 키 발급: https://openweathermap.org/api
 * One Call API 3.0 구독 필요
 * 무료 플랜: 1,000 calls/day
 *
 * 하나의 API로 제공:
 * - 현재 날씨
 * - 시간별 예보 (48시간)
 * - 일별 예보 (8일)
 */

export interface WeatherData {
  temperature: number;
  condition: string;
  conditionIcon: string;
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
  conditionIcon: string;
  precipitation: number;
}

// 주요 도시 좌표 (위도, 경도)
export const MAJOR_CITIES = {
  Seoul: { lat: 37.5665, lon: 126.9780, nameKr: '서울' },
  Busan: { lat: 35.1796, lon: 129.0756, nameKr: '부산' },
  Incheon: { lat: 37.4563, lon: 126.7052, nameKr: '인천' },
  Daegu: { lat: 35.8714, lon: 128.6014, nameKr: '대구' },
  Daejeon: { lat: 36.3504, lon: 127.3845, nameKr: '대전' },
  Gwangju: { lat: 35.1595, lon: 126.8526, nameKr: '광주' },
  Ulsan: { lat: 35.5384, lon: 129.3114, nameKr: '울산' },
  Sejong: { lat: 36.4800, lon: 127.2890, nameKr: '세종' },
} as const;

export type CityName = keyof typeof MAJOR_CITIES;

// 날씨 상태 한글 매핑
const WEATHER_CONDITION_KR: Record<string, string> = {
  Clear: '맑음',
  Clouds: '구름많음',
  Rain: '비',
  Drizzle: '이슬비',
  Thunderstorm: '천둥번개',
  Snow: '눈',
  Mist: '안개',
  Smoke: '연무',
  Haze: '실안개',
  Dust: '먼지',
  Fog: '안개',
  Sand: '황사',
  Ash: '화산재',
  Squall: '돌풍',
  Tornado: '토네이도',
};

/**
 * One Call API 3.0으로 현재 날씨 조회
 */
export async function getCurrentWeather(city: CityName = 'Seoul'): Promise<WeatherData> {
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

  // API 키가 없으면 목업 데이터 반환
  if (!apiKey) {
    return getMockWeather(city);
  }

  try {
    const { lat, lon, nameKr } = MAJOR_CITIES[city];

    // One Call API 3.0 엔드포인트
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr&exclude=minutely,hourly,alerts`;

    const response = await fetch(url, {
      next: { revalidate: 600 }, // 10분마다 캐시 갱신
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();

    // current 데이터에서 정보 추출
    const current = data.current;

    return {
      temperature: Math.round(current.temp),
      condition: WEATHER_CONDITION_KR[current.weather[0].main] || current.weather[0].description,
      conditionIcon: current.weather[0].icon,
      humidity: current.humidity,
      windSpeed: current.wind_speed,
      location: nameKr,
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('OpenWeatherMap One Call API 오류:', error);
    return getMockWeather(city);
  }
}

/**
 * One Call API 3.0으로 일별 예보 조회
 */
export async function getWeatherForecast(city: CityName = 'Seoul'): Promise<WeatherForecast[]> {
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

  // API 키가 없으면 목업 데이터 반환
  if (!apiKey) {
    return generateMockForecast();
  }

  try {
    const { lat, lon } = MAJOR_CITIES[city];

    // One Call API 3.0 엔드포인트
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr&exclude=minutely,hourly,current,alerts`;

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // 1시간마다 캐시 갱신
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();

    // daily 데이터에서 예보 추출 (첫 5일)
    const forecasts: WeatherForecast[] = data.daily.slice(0, 5).map((day: any) => {
      const date = new Date(day.dt * 1000); // Unix timestamp to Date

      return {
        date: date.toISOString().slice(0, 10),
        maxTemp: Math.round(day.temp.max),
        minTemp: Math.round(day.temp.min),
        condition: WEATHER_CONDITION_KR[day.weather[0].main] || day.weather[0].description,
        conditionIcon: day.weather[0].icon,
        precipitation: Math.round((day.pop || 0) * 100), // 강수 확률 (%)
      };
    });

    return forecasts;
  } catch (error) {
    console.error('OpenWeatherMap One Call Forecast API 오류:', error);
    return generateMockForecast();
  }
}

/**
 * 목업 날씨 데이터 생성
 */
function getMockWeather(city: CityName): WeatherData {
  return {
    temperature: 15,
    condition: '맑음',
    conditionIcon: '01d',
    humidity: 60,
    windSpeed: 2.5,
    location: MAJOR_CITIES[city].nameKr,
    updatedAt: new Date(),
  };
}

/**
 * 목업 예보 데이터 생성
 */
function generateMockForecast(): WeatherForecast[] {
  const forecasts: WeatherForecast[] = [];
  const today = new Date();

  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    forecasts.push({
      date: date.toISOString().slice(0, 10),
      maxTemp: 20 + Math.floor(Math.random() * 10),
      minTemp: 10 + Math.floor(Math.random() * 5),
      condition: '맑음',
      conditionIcon: '01d',
      precipitation: Math.floor(Math.random() * 30),
    });
  }

  return forecasts;
}
