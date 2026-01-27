import { WeatherWidget } from '@/components/widgets/WeatherWidget';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Panorama Korea
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            한국형 스마트 디스플레이 - 날씨, 캘린더, 뉴스, 교통정보를 한눈에
          </p>
        </header>

        {/* Widget Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Weather Widget */}
          <WeatherWidget />

          {/* Calendar Widget */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">캘린더</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              공휴일, 음력 날짜, 개인 일정 관리
            </p>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              한국 공휴일 API 연동 예정
            </div>
          </div>

          {/* News Widget */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <span className="text-2xl">📰</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">뉴스</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              주요 뉴스 헤드라인을 실시간으로
            </p>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              뉴스 API 연동 예정
            </div>
          </div>

          {/* Traffic Widget */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚇</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">교통</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              실시간 대중교통 및 교통 상황
            </p>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              서울 교통정보 API 연동 예정
            </div>
          </div>
        </div>

        {/* Status Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-white text-center">
          <p className="text-lg font-semibold mb-2">✅ 날씨 위젯 구현 완료!</p>
          <p className="text-sm opacity-90">
            OpenWeatherMap API로 실시간 날씨 데이터를 제공합니다
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            원본:{" "}
            <a
              href="https://panorama-2ps.pages.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Panorama (일본판)
            </a>
          </p>
          <p className="mt-2">Made with ❤️ using Next.js & Tailwind CSS</p>
        </footer>
      </main>
    </div>
  );
}
