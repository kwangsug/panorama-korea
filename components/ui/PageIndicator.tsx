/**
 * PageIndicator — 5뷰 자동 순환 상태 표시용 인디케이터.
 * page.tsx의 5개 div 중복 + 하드코딩 색을 단일 컴포넌트로 통일.
 *
 * 새 위젯 추가 시 items에 한 줄만 추가하면 인디케이터는 자동 동기화.
 */

interface PageIndicatorItem {
  /** 식별자 (currentKey와 비교) */
  key: string;
  /** Tailwind 색 클래스 (예: 'bg-blue-400') 또는 CSS 변수명 */
  accent: string;
}

interface PageIndicatorProps {
  items: PageIndicatorItem[];
  currentKey: string;
  /** 'vertical' (콘텐츠 영역 내부 인디케이터) | 'horizontal' (위젯 하단) */
  orientation?: 'vertical' | 'horizontal';
  /** 부모 컨테이너 추가 클래스 */
  className?: string;
}

export function PageIndicator({
  items,
  currentKey,
  orientation = 'vertical',
  className = '',
}: PageIndicatorProps) {
  const isVertical = orientation === 'vertical';

  return (
    <div
      className={
        (isVertical
          ? 'flex flex-col items-center gap-3'
          : 'flex justify-center items-center gap-1.5'
        ) + (className ? ' ' + className : '')
      }
      aria-label="페이지 인디케이터"
    >
      {items.map((item) => {
        const isActive = item.key === currentKey;
        const baseLong = isVertical ? 'h-6' : 'w-4';
        const baseShort = isVertical ? 'h-2' : 'w-1';
        const thickness = isVertical ? 'w-2' : 'h-1';
        const sizeClass = isActive ? baseLong : baseShort;

        return (
          <div
            key={item.key}
            className={`${thickness} ${sizeClass} rounded-full transition-all duration-300 ${
              isActive ? item.accent : 'bg-white/20'
            }`}
            aria-current={isActive ? 'true' : undefined}
            aria-label={item.key}
          />
        );
      })}
    </div>
  );
}
