/**
 * Open-Meteo API 클라이언트
 *
 * API 문서: https://open-meteo.com/
 * 완전 무료, API 키 불필요
 *
 * 제공 데이터:
 * - 현재 날씨
 * - 시간별 예보
 * - 일별 예보 (16일)
 */

export interface WeatherData {
  temperature: number;
  maxTemp: number;
  minTemp: number;
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

// WMO 날씨 코드 → 한글 + 아이콘 매핑
// https://open-meteo.com/en/docs (WMO Weather interpretation codes)
const WMO_WEATHER_CODES: Record<number, { condition: string; iconDay: string; iconNight: string }> = {
  0: { condition: '맑음', iconDay: '01d', iconNight: '01n' },
  1: { condition: '대체로 맑음', iconDay: '01d', iconNight: '01n' },
  2: { condition: '구름 조금', iconDay: '02d', iconNight: '02n' },
  3: { condition: '흐림', iconDay: '04d', iconNight: '04n' },
  45: { condition: '안개', iconDay: '50d', iconNight: '50n' },
  48: { condition: '짙은 안개', iconDay: '50d', iconNight: '50n' },
  51: { condition: '이슬비', iconDay: '09d', iconNight: '09n' },
  53: { condition: '이슬비', iconDay: '09d', iconNight: '09n' },
  55: { condition: '이슬비', iconDay: '09d', iconNight: '09n' },
  56: { condition: '진눈깨비', iconDay: '13d', iconNight: '13n' },
  57: { condition: '진눈깨비', iconDay: '13d', iconNight: '13n' },
  61: { condition: '약한 비', iconDay: '10d', iconNight: '10n' },
  63: { condition: '비', iconDay: '10d', iconNight: '10n' },
  65: { condition: '강한 비', iconDay: '10d', iconNight: '10n' },
  66: { condition: '진눈깨비', iconDay: '13d', iconNight: '13n' },
  67: { condition: '진눈깨비', iconDay: '13d', iconNight: '13n' },
  71: { condition: '약한 눈', iconDay: '13d', iconNight: '13n' },
  73: { condition: '눈', iconDay: '13d', iconNight: '13n' },
  75: { condition: '폭설', iconDay: '13d', iconNight: '13n' },
  77: { condition: '눈', iconDay: '13d', iconNight: '13n' },
  80: { condition: '소나기', iconDay: '09d', iconNight: '09n' },
  81: { condition: '소나기', iconDay: '09d', iconNight: '09n' },
  82: { condition: '폭우', iconDay: '09d', iconNight: '09n' },
  85: { condition: '눈보라', iconDay: '13d', iconNight: '13n' },
  86: { condition: '폭설', iconDay: '13d', iconNight: '13n' },
  95: { condition: '천둥번개', iconDay: '11d', iconNight: '11n' },
  96: { condition: '뇌우', iconDay: '11d', iconNight: '11n' },
  99: { condition: '심한 뇌우', iconDay: '11d', iconNight: '11n' },
};

/**
 * 낮/밤 판단 (간단히 6시~18시를 낮으로)
 */
function isDay(): boolean {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18;
}

/**
 * WMO 코드를 조건 및 아이콘으로 변환
 */
function getWeatherFromCode(code: number): { condition: string; icon: string } {
  const weather = WMO_WEATHER_CODES[code] || WMO_WEATHER_CODES[0];
  return {
    condition: weather.condition,
    icon: isDay() ? weather.iconDay : weather.iconNight,
  };
}

/**
 * Open-Meteo API로 현재 날씨 조회
 */
export async function getCurrentWeather(city: CityName = 'Seoul'): Promise<WeatherData> {
  try {
    const { lat, lon, nameKr } = MAJOR_CITIES[city];

    // Open-Meteo API 엔드포인트
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=Asia/Seoul&forecast_days=1`;

    const response = await fetch(url, {
      next: { revalidate: 1800 }, // 30분마다 캐시 갱신
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();
    const current = data.current;
    const daily = data.daily;

    const { condition, icon } = getWeatherFromCode(current.weather_code);

    return {
      temperature: Math.round(current.temperature_2m),
      maxTemp: Math.round(daily.temperature_2m_max[0]),
      minTemp: Math.round(daily.temperature_2m_min[0]),
      condition,
      conditionIcon: icon,
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m * 10) / 10, // km/h → 소수점 1자리
      location: nameKr,
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Open-Meteo API 오류:', error);
    return getMockWeather(city);
  }
}

/**
 * Open-Meteo API로 일별 예보 조회
 */
export async function getWeatherForecast(city: CityName = 'Seoul'): Promise<WeatherForecast[]> {
  try {
    const { lat, lon } = MAJOR_CITIES[city];

    // Open-Meteo API 엔드포인트 (7일 예보)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=Asia/Seoul&forecast_days=7`;

    const response = await fetch(url, {
      next: { revalidate: 1800 }, // 30분마다 캐시 갱신
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();
    const daily = data.daily;

    const forecasts: WeatherForecast[] = daily.time.slice(0, 5).map((date: string, i: number) => {
      const { condition, icon } = getWeatherFromCode(daily.weather_code[i]);

      return {
        date,
        maxTemp: Math.round(daily.temperature_2m_max[i]),
        minTemp: Math.round(daily.temperature_2m_min[i]),
        condition,
        conditionIcon: icon, // 예보는 낮 아이콘 사용
        precipitation: daily.precipitation_probability_max[i] || 0,
      };
    });

    return forecasts;
  } catch (error) {
    console.error('Open-Meteo Forecast API 오류:', error);
    return generateMockForecast();
  }
}

/**
 * 목업 날씨 데이터 생성
 */
function getMockWeather(city: CityName): WeatherData {
  return {
    temperature: 15,
    maxTemp: 18,
    minTemp: 8,
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
