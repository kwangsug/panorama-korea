'use client';

import { useEffect, useState } from 'react';

interface JobItem {
  title: string;
  company: string;
  link: string;
  location: string;
  deadline: string;
  experience: string;
}

interface JobWidgetProps {
  rotationSeconds?: number;
}

// 제목에서 기업명 패턴 제거
function cleanJobTitle(title: string, company: string): string {
  let cleanTitle = title;
  const companyPatterns = [
    new RegExp(`^\\[${company}\\]\\s*`, 'i'),
    new RegExp(`^\\(${company}\\)\\s*`, 'i'),
    new RegExp(`^${company}\\s*[-:]\\s*`, 'i'),
    new RegExp(`^${company}\\s+`, 'i'),
    new RegExp(`\\[${company}\\]`, 'gi'),
    new RegExp(`\\(${company}\\)`, 'gi'),
  ];
  for (const pattern of companyPatterns) {
    cleanTitle = cleanTitle.replace(pattern, '').trim();
  }
  return cleanTitle;
}

export function JobWidget({ rotationSeconds = 10 }: JobWidgetProps) {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [swipeAxis, setSwipeAxis] = useState<'horizontal' | 'vertical' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Seoul');
  const [feedTitle, setFeedTitle] = useState('인크루트 신입공채');

  // 설정에서 선택된 도시 로드
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

  // 가로 스와이프로 채용정보 전환 (방향 잠금 적용)
  const handlePointerDown = (e: React.PointerEvent) => {
    setTouchStart(e.clientX);
    setSwipeAxis(null);
    setIsDragging(true);
    (e.currentTarget as HTMLElement).dataset.startY = String(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const diffX = e.clientX - touchStart;
    const startY = Number((e.currentTarget as HTMLElement).dataset.startY || 0);
    const diffY = e.clientY - startY;

    // 방향이 아직 결정되지 않은 경우, 10px 이상 움직이면 방향 결정
    if (!swipeAxis && (Math.abs(diffX) > 10 || Math.abs(diffY) > 10)) {
      // 가로가 세로보다 1.2배 이상일 때만 가로로 판정
      if (Math.abs(diffX) > Math.abs(diffY) * 1.2) {
        setSwipeAxis('horizontal');
      } else if (Math.abs(diffY) > Math.abs(diffX)) {
        setSwipeAxis('vertical');
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (jobs.length === 0) {
      setIsDragging(false);
      setSwipeAxis(null);
      return;
    }

    const diff = touchStart - e.clientX;

    // 가로 스와이프 감지 (방향이 horizontal로 잠긴 경우만)
    if (swipeAxis === 'horizontal' && Math.abs(diff) > 50) {
      e.stopPropagation();
      if (diff > 0) {
        setCurrentIndex((prev) => (prev + 1) % jobs.length);
      } else {
        setCurrentIndex((prev) => (prev - 1 + jobs.length) % jobs.length);
      }
    }

    setIsDragging(false);
    setSwipeAxis(null);
  };

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await fetch(`/api/jobs?city=${selectedCity}`);
        const data = await response.json();
        setJobs(data.jobs || []);
        if (data.feedTitle) {
          setFeedTitle(data.feedTitle);
        }
      } catch (error) {
        console.error('채용정보 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
    const interval = setInterval(loadJobs, 60000); // 1분마다 갱신
    return () => clearInterval(interval);
  }, [selectedCity]);

  // 자동 슬라이드
  useEffect(() => {
    if (jobs.length === 0 || rotationSeconds <= 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % jobs.length);
    }, rotationSeconds * 1000);
    return () => clearInterval(interval);
  }, [jobs.length, rotationSeconds]);

  if (loading) {
    return (
      <div className="h-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-4 border border-white/10 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-orange-500/30 rounded-full flex items-center justify-center">
            <span className="text-sm">💼</span>
          </div>
          <h2 className="text-base font-semibold text-white">채용정보</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-gray-400 text-sm">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="h-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-4 border border-white/10 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-orange-500/30 rounded-full flex items-center justify-center">
            <span className="text-sm">💼</span>
          </div>
          <h2 className="text-base font-semibold text-white">채용정보</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400 text-sm">채용정보를 불러올 수 없습니다</div>
        </div>
      </div>
    );
  }

  const currentJob = jobs[currentIndex];

  // 도시명 매핑 (영어 -> 한글)
  const cityNameMap: Record<string, string> = {
    Seoul: '서울',
    Busan: '부산',
    Daegu: '대구',
    Gwangju: '광주',
    Daejeon: '대전',
    Ulsan: '울산',
    Incheon: '인천',
    Sejong: '세종',
  };

  // 지역이 여러 개인 경우 설정 도시 우선 표시
  const formatLocation = (location: string) => {
    const cleaned = location.replace(/^\|+\s*/, '');
    const locations = cleaned.split(/[,·\/|>]/).map(l => l.trim()).filter(Boolean);

    // 설정된 도시의 한글명
    const selectedCityKr = cityNameMap[selectedCity] || '';

    // 설정 도시가 포함된 항목 찾기
    const matchingIdx = locations.findIndex(loc => loc.includes(selectedCityKr));

    if (matchingIdx > 0) {
      // 설정 도시를 맨 앞으로 이동
      const [matched] = locations.splice(matchingIdx, 1);
      locations.unshift(matched);
    }

    if (locations.length <= 2) return locations.join(', ');
    return locations.slice(0, 2).join(', ') + ' 외';
  };

  return (
    <div
      className="h-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-5 border border-white/10 flex flex-col"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => { setIsDragging(false); setSwipeAxis(null); }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500/30 rounded-full flex items-center justify-center">
            <span className="text-lg">💼</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">채용정보</h2>
            <p className="text-xs text-gray-400">{feedTitle}</p>
          </div>
        </div>
      </div>

      {/* Job Content */}
      <div className="flex-1 flex flex-col">
        {/* Company - 글씨만 애니메이션 */}
        <div
          key={`company-${currentIndex}`}
          className="text-orange-400 font-semibold text-base mb-2 animate-[slideUp_0.4s_ease-out]"
        >
          {currentJob.company}
        </div>

        {/* Title - 글씨만 아래에서 나타나는 효과 */}
        <h3
          key={`title-${currentIndex}`}
          className="text-4xl font-bold text-white mb-3 line-clamp-2 animate-[slideUp_0.5s_ease-out]"
        >
          {cleanJobTitle(currentJob.title, currentJob.company)}
        </h3>

        {/* Content with QR */}
        <div className="flex-1 flex gap-5">
          <div className="flex-1 flex flex-col">
            {/* Details */}
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded">
                {currentJob.experience}
              </span>
              <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded">
                {formatLocation(currentJob.location)}
              </span>
              <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded">
                마감: {currentJob.deadline}
              </span>
            </div>
          </div>

          {/* QR Code - Right Side */}
          <div className="flex flex-col items-center justify-end w-28 flex-shrink-0">
            <div className="bg-white p-1.5 rounded-lg mb-1">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(currentJob.link)}`}
                alt="QR"
                className="w-20 h-20"
              />
            </div>
            <p className="text-[10px] text-gray-400 text-center">
              QR로 지원하기
            </p>
          </div>
        </div>
      </div>

      {/* Progress Dots - 위로 조금 올림 */}
      <div className="flex justify-center gap-1 mt-2 mb-1">
        {jobs.slice(0, 5).map((_, idx) => (
          <div
            key={idx}
            className={`h-1 rounded-full transition-all ${
              idx === currentIndex % 5 ? 'w-4 bg-orange-400' : 'w-1 bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
