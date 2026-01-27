'use client';

import { useState, useEffect } from 'react';

interface FlipCardProps {
  value: string;
  label?: string;
}

function FlipCard({ value, label }: FlipCardProps) {
  const [prevValue, setPrevValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (value !== prevValue) {
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setPrevValue(value);
        setIsFlipping(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [value, prevValue]);

  return (
    <div className="relative">
      {label && (
        <div className="text-xs text-gray-400 text-center mb-1 font-medium">
          {label}
        </div>
      )}
      <div className="relative w-20 h-28 perspective-1000">
        <div
          className={`absolute w-full h-full transition-transform duration-300 transform-style-3d ${
            isFlipping ? 'animate-flip' : ''
          }`}
        >
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl border border-white/10 shadow-2xl flex items-center justify-center">
            <span className="text-6xl font-bold text-white tabular-nums">
              {value}
            </span>
          </div>
          {/* Back */}
          <div className="absolute w-full h-full backface-hidden bg-gradient-to-b from-slate-700 to-slate-800 rounded-xl border border-white/20 shadow-2xl flex items-center justify-center rotate-x-180">
            <span className="text-6xl font-bold text-white/90 tabular-nums">
              {prevValue}
            </span>
          </div>
        </div>
        {/* Card shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl pointer-events-none" />
      </div>
    </div>
  );
}

function Separator() {
  return (
    <div className="flex flex-col items-center justify-center h-28 pb-6">
      <div className="text-5xl font-bold text-white/80">:</div>
    </div>
  );
}

export function ClockWidget() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  const seconds = currentTime.getSeconds().toString().padStart(2, '0');

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 hover:bg-white/15 transition-all border border-white/20">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-indigo-500/30 rounded-full flex items-center justify-center backdrop-blur-sm">
          <span className="text-2xl">🕐</span>
        </div>
        <h2 className="text-2xl font-semibold text-white">시계</h2>
      </div>

      {/* Flip Clock Display */}
      <div className="flex items-center justify-center gap-3 mb-6">
        {/* Hours */}
        <FlipCard value={hours[0]} label="시" />
        <FlipCard value={hours[1]} />

        <Separator />

        {/* Minutes */}
        <FlipCard value={minutes[0]} label="분" />
        <FlipCard value={minutes[1]} />

        <Separator />

        {/* Seconds */}
        <FlipCard value={seconds[0]} label="초" />
        <FlipCard value={seconds[1]} />
      </div>

      {/* Date Display */}
      <div className="text-center text-lg text-gray-300">
        {currentTime.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        })}
      </div>
    </div>
  );
}
