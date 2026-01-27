/**
 * OpenWeatherMap API 2.5 클라이언트
 *
 * API 키 발급: https://openweathermap.org/api
 * 무료 가입 후 즉시 사용 가능
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

// 주요 도시 이름 (OpenWeatherMap에서 사용)
export const MAJOR_CITIES = [
  'Seoul',
  'Busan',
  'Incheon',
  'Daegu',
  'Daejeon',
  'Gwangju',
  'Ulsan',
  'Sejong',
] as const;

export type CityName = (typeof MAJOR_CITIES)[number];

// 한글 도시명 매핑
const CITY_NAME_KR: Record<CityName, string> = {
  Seoul: '서울',
  Busan: '부산',
  Incheon: '인천',
  Daegu: '대구',
  Daejeon: '대전',
  Gwangju: '광주',
  Ulsan: '울산',
  Sejong: '세종',
};

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
 * 현재 날씨 조회 (Weather API 2.5)
 */
export async function getCurrentWeather(city: CityName = 'Seoul'): Promise<WeatherData> {
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

  // API 키가 없으면 목업 데이터 반환
  if (!apiKey) {
    return {
      temperature: 15,
      condition: '맑음',
      conditionIcon: '01d',
      humidity: 60,
      windSpeed: 2.5,
      location: CITY_NAME_KR[city],
      updatedAt: new Date(),
    };
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},KR&appid=${apiKey}&units=metric&lang=kr`;

    const response = await fetch(url, {
      next: { revalidate: 600 }, // 10분마다 캐시 갱신
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();

    return {
      temperature: Math.round(data.main.temp),
      condition: WEATHER_CONDITION_KR[data.weather[0].main] || data.weather[0].description,
      conditionIcon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      location: CITY_NAME_KR[city],
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('OpenWeatherMap API 오류:', error);

    // 에러 시 목업 데이터 반환
    return {
      temperature: 15,
      condition: '맑음',
      conditionIcon: '01d',
      humidity: 60,
      windSpeed: 2.5,
      location: CITY_NAME_KR[city],
      updatedAt: new Date(),
    };
  }
}

/**
 * 5일 예보 조회 (Forecast API 2.5)
 */
export async function getWeatherForecast(city: CityName = 'Seoul'): Promise<WeatherForecast[]> {
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

  // API 키가 없으면 목업 데이터 반환
  if (!apiKey) {
    return generateMockForecast();
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city},KR&appid=${apiKey}&units=metric&lang=kr`;

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // 1시간마다 캐시 갱신
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();

    // 일별 데이터로 그룹화
    const dailyData: Record<string, any[]> = {};

    data.list.forEach((item: any) => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyData[date]) {
        dailyData[date] = [];
      }
      dailyData[date].push(item);
    });

    // 각 날짜별 최고/최저 온도 계산
    const forecasts: WeatherForecast[] = Object.entries(dailyData)
      .slice(0, 5)
      .map(([date, items]) => {
        const temps = items.map((item) => item.main.temp);
        const maxTemp = Math.round(Math.max(...temps));
        const minTemp = Math.round(Math.min(...temps));

        // 가장 빈번한 날씨 상태 선택
        const weatherCounts: Record<string, number> = {};
        items.forEach((item) => {
          const weather = item.weather[0].main;
          weatherCounts[weather] = (weatherCounts[weather] || 0) + 1;
        });
        const mostCommonWeather = Object.entries(weatherCounts).sort((a, b) => b[1] - a[1])[0][0];
        const weatherIcon = items.find((item) => item.weather[0].main === mostCommonWeather)
          ?.weather[0].icon;

        // 강수량 계산
        const precipitation = items.reduce((sum, item) => sum + (item.rain?.['3h'] || 0), 0);

        return {
          date,
          maxTemp,
          minTemp,
          condition: WEATHER_CONDITION_KR[mostCommonWeather] || mostCommonWeather,
          conditionIcon: weatherIcon || '01d',
          precipitation: Math.round(precipitation),
        };
      });

    return forecasts;
  } catch (error) {
    console.error('OpenWeatherMap Forecast API 오류:', error);
    return generateMockForecast();
  }
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
