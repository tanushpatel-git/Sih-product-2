'use client';

import React, { useEffect, useState } from 'react';
import { TimelineDayId } from '../../../../lib/types';
import { TIMELINE_KEYS, TIMELINE_FORECAST_MAP } from '../../../../lib/mockData';
import { Play, Pause, AlertOctagon, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

interface SevenDayTimelineProps {
  selectedDay: TimelineDayId;
  onSelectDay: (day: TimelineDayId) => void;
}

export const SevenDayTimeline: React.FC<SevenDayTimelineProps> = ({
  selectedDay,
  onSelectDay,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-play timeline simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        const currentIndex = TIMELINE_KEYS.indexOf(selectedDay);
        const nextIndex = (currentIndex + 1) % TIMELINE_KEYS.length;
        onSelectDay(TIMELINE_KEYS[nextIndex]);
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedDay, onSelectDay]);

  const currentIndex = TIMELINE_KEYS.indexOf(selectedDay);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectDay(TIMELINE_KEYS[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < TIMELINE_KEYS.length - 1) {
      onSelectDay(TIMELINE_KEYS[currentIndex + 1]);
    }
  };

  return (
    <div className="w-full border-b border-white/[0.08] bg-[#0c0e10] px-4 lg:px-8 py-3.5">
      <div className="max-w-[1720px] mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Left: Operational Time Machine Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-white/50 uppercase font-semibold">
              TIME MACHINE
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#D3FD50]/10 text-[#D3FD50] border border-[#D3FD50]/30">
              7-DAY HORIZON
            </span>
          </div>

          <div className="h-5 w-[1px] bg-white/[0.08]" />

          {/* Play/Pause & Step Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-2.5 py-1 text-xs font-mono rounded flex items-center gap-1.5 transition-all ${isPlaying
                  ? 'bg-[#EF4444]/20 border border-[#EF4444]/50 text-[#EF4444]'
                  : 'bg-white/[0.05] border border-white/[0.1] text-white/80 hover:bg-white/[0.1] hover:text-[#D3FD50]'
                }`}
              title="Automated 7-day progression simulation"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3 h-3" />
                  <span className="text-[11px]">PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span className="text-[11px]">SIMULATE</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-1 rounded bg-white/[0.03] border border-white/[0.08] text-white/60 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === TIMELINE_KEYS.length - 1}
              className="p-1 rounded bg-white/[0.03] border border-white/[0.08] text-white/60 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                onSelectDay('NOW');
              }}
              className="px-2 py-1 text-[11px] font-mono text-white/40 hover:text-white transition-colors"
              title="Reset to Today"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Center / Right: 8 Timeline Day Segment Buttons */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 w-full xl:w-auto">
          {TIMELINE_KEYS.map((key) => {
            const data = TIMELINE_FORECAST_MAP[key];
            const isSelected = selectedDay === key;
            const isPeakBreach = key === 'FRI';
            const isBreach = data.isBreach;

            return (
              <button
                key={key}
                onClick={() => {
                  setIsPlaying(false);
                  onSelectDay(key);
                }}
                className={`relative px-2.5 py-2 rounded-lg border text-left transition-all ${isSelected
                    ? isBreach
                      ? 'bg-[#EF4444]/15 border-[#EF4444] text-white shadow-sm ring-1 ring-[#EF4444]/40'
                      : 'bg-[#15181b] border-[#D3FD50] text-white shadow-sm ring-1 ring-[#D3FD50]/30'
                    : isBreach
                      ? 'bg-[#0f1113] border-[#EF4444]/30 text-white/70 hover:border-[#EF4444]/60'
                      : 'bg-[#0e1012] border-white/[0.07] text-white/50 hover:border-white/20 hover:text-white/80'
                  }`}
              >
                {/* Top row: Day label + Breach Indicator */}
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span
                    className={`text-[11px] font-mono font-bold tracking-wider uppercase ${isSelected
                        ? isBreach
                          ? 'text-[#EF4444]'
                          : 'text-[#D3FD50]'
                        : isBreach
                          ? 'text-[#EF4444]/80'
                          : 'text-white/70'
                      }`}
                  >
                    {key}
                  </span>

                  {isPeakBreach && (
                    <span className="text-[8px] font-mono font-black uppercase px-1 py-0.2 rounded bg-[#EF4444] text-black">
                      BREACH
                    </span>
                  )}
                  {isBreach && !isPeakBreach && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                  )}
                </div>

                {/* Date sub-label */}
                <div className="text-[9px] font-mono text-white/40 uppercase">
                  {key === 'NOW' ? 'Today' : data.dateString.split(' ')[0]}
                </div>

                {/* Occupancy telemetry figure */}
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/[0.05]">
                  <span
                    className={`text-xs font-mono font-bold tabular-nums ${isBreach ? 'text-[#EF4444]' : data.totalOccupancyPercent >= 85 ? 'text-[#F97316]' : 'text-white/90'
                      }`}
                  >
                    {data.totalOccupancyPercent}%
                  </span>
                  <span className="text-[9px] font-mono text-white/30">
                    {data.resources.icu.shortageDelta > 0
                      ? `+${data.resources.icu.shortageDelta} ICU`
                      : `${50 - data.resources.icu.currentCapacity} free`}
                  </span>
                </div>

                {/* Selected Day Arrow Tick */}
                {isSelected && (
                  <div
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-1 rounded-full ${isBreach ? 'bg-[#EF4444]' : 'bg-[#D3FD50]'
                      }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
