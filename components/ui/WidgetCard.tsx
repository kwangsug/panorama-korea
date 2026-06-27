/**
 * WidgetCard — 6개 위젯이 공유하는 글래스모피즘 컨테이너.
 * 기존: 각 위젯이 `h-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-5 border border-white/10 flex flex-col` 하드코딩 중복.
 * → 한 곳 수정으로 전 위젯 톤 변경 가능.
 */
import type { PointerEvent, ReactNode } from 'react';

interface WidgetCardProps {
  children: ReactNode;
  className?: string;
  /** swipe 등 pointer 이벤트 위임 */
  onPointerDown?: (e: PointerEvent) => void;
  onPointerMove?: (e: PointerEvent) => void;
  onPointerUp?: (e: PointerEvent) => void;
  onPointerLeave?: (e: PointerEvent) => void;
  /** 추가 inline style (스와이프 transform 등) */
  style?: React.CSSProperties;
}

export function WidgetCard({
  children,
  className = '',
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerLeave,
  style,
}: WidgetCardProps) {
  return (
    <div
      className={
        'h-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-5 border border-white/10 flex flex-col ' +
        className
      }
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
    >
      {children}
    </div>
  );
}
