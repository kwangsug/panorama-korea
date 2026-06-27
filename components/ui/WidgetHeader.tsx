/**
 * WidgetHeader — 위젯 상단 통일 헤더.
 * 좌: 색 배경 아이콘 원 + 제목 + (선택) 부제 + (선택) mock 배지
 * 우: children (소스 선택 버튼·페이지 수 등)
 *
 * accent 키 → Tailwind 클래스 매핑. globals.css의 `--accent-*` 토큰과 1:1 대응.
 */
import type { ReactNode } from 'react';

export type AccentKey = 'weather' | 'news' | 'jobs' | 'calendar' | 'finance';

const ACCENT_BG: Record<AccentKey, string> = {
  weather: 'bg-blue-500/30',
  news: 'bg-green-500/30',
  jobs: 'bg-orange-500/30',
  calendar: 'bg-purple-500/30',
  finance: 'bg-amber-500/30',
};

interface WidgetHeaderProps {
  icon: ReactNode;
  title: string;
  accent: AccentKey;
  subtitle?: string;
  isMock?: boolean;
  mockTooltip?: string;
  /** 우측 영역 (버튼·페이지 수·기타) */
  children?: ReactNode;
  className?: string;
}

export function WidgetHeader({
  icon,
  title,
  accent,
  subtitle,
  isMock,
  mockTooltip,
  children,
  className = '',
}: WidgetHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div className="flex items-center gap-2 min-w-0">
        <div
          className={`w-8 h-8 ${ACCENT_BG[accent]} rounded-full flex items-center justify-center flex-shrink-0`}
        >
          <span className="text-lg">{icon}</span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white truncate">{title}</h2>
            {isMock && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex-shrink-0"
                title={mockTooltip || '실시간 데이터를 불러오지 못해 샘플 값을 표시 중입니다'}
              >
                📡 샘플
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-gray-400 truncate">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="flex items-center gap-1 ml-2 flex-shrink-0">{children}</div>}
    </div>
  );
}
