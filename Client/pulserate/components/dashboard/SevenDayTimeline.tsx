'use client';

import React, { useEffect, useState } from 'react';
import { TimelineDayId, DayForecastPoint } from '@/lib/types';
import { TIMELINE_KEYS, TIMELINE_FORECAST_MAP } from '@/lib/mockData';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

interface SevenDayTimelineProps {
  selectedDay: TimelineDayId;
  onSelectDay: (day: TimelineDayId) => void;
  forecastData: DayForecastPoint;
}

export const SevenDayTimeline: React.FC<SevenDayTimelineProps> = ({
  selectedDay,
  onSelectDay,
  forecastData,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

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

  const shortageBeds = Math.max(0, forecastData.resources.icu.shortageDelta);
  const isBreach = forecastData.isBreach || shortageBeds > 0;
  const dayNumber = forecastData.dayOffset === 0 ? 'NOW' : `DAY 0${forecastData.dayOffset}`;

  return (
    <section className="w-full border-b border-white/[0.08] bg-[#07090C]">
      {/* 1. Dramatic Typography Scale Contrast Strip */}
      <div className="max-w-[1780px] mx-auto px-6 lg:px-10 pt-6 pb-4 border-b border-white/[0.05]">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 items-baseline">
          {/* Typo Block 1: Active Forecast Window */}
          <div>
            <div className="text-[10px] font-mono tracking-widest text-[#66707C] uppercase font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF]" />
              FORECAST WINDOW
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-[#F4F3EF] tabular-nums mt-1">
              {dayNumber}
            </div>
            <div className="text-[10px] font-mono text-[#A7ADB5] uppercase mt-0.5">
              {forecastData.label} • {forecastData.dateString}
            </div>
          </div>

          {/* Typo Block 2: System Occupancy */}
          <div>
            <div className="text-[10px] font-mono tracking-widest text-[#66707C] uppercase font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" />
              SYSTEM OCCUPANCY
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-[#F4F3EF] tabular-nums mt-1">
              {forecastData.totalOccupancyPercent}%
            </div>
            <div className="text-[10px] font-mono text-[#A7ADB5] uppercase mt-0.5">
              {forecastData.totalAdmittedPatients} / {forecastData.capacityThreshold} BEDS
            </div>
          </div>

          {/* Typo Block 3: Projected Breach Deficit (Hero Warning) */}
          <div>
            <div className="text-[10px] font-mono tracking-widest text-[#66707C] uppercase font-bold flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isBreach ? 'bg-[#EF4444]' : 'bg-[#9DF0DA]'}`} />
              PROJECTED BREACH
            </div>
            <div
              className={`text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight tabular-nums mt-1 ${
                isBreach ? 'text-[#EF4444]' : 'text-[#9DF0DA]'
              }`}
            >
              {isBreach ? `${shortageBeds} BEDS` : '0 BEDS'}
            </div>
            <div className="text-[10px] font-mono text-[#A7ADB5] uppercase mt-0.5">
              {isBreach ? 'ICU CAPACITY DEFICIT' : 'SURPLUS CAPACITY SECURE'}
            </div>
          </div>

          {/* Typo Block 4: Model Confidence */}
          <div>
            <div className="text-[10px] font-mono tracking-widest text-[#66707C] uppercase font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" />
              MODEL CONFIDENCE
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-[#F4F3EF] tabular-nums mt-1">
              91%
            </div>
            <div className="text-[10px] font-mono text-[#A7ADB5] uppercase mt-0.5">
              BAYESIAN ENSEMBLE [CI 95%]
            </div>
          </div>

          {/* Typo Block 5: Capacity Threshold Limit */}
          <div className="hidden lg:block">
            <div className="text-[10px] font-mono tracking-widest text-[#66707C] uppercase font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
              CAPACITY THRESHOLD
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-[#F4F3EF] tabular-nums mt-1">
              500
            </div>
            <div className="text-[10px] font-mono text-[#A7ADB5] uppercase mt-0.5">
              LICENSED SURGE CEILING
            </div>
          </div>
        </div>
      </div>

      {/* 2. Precision Time Machine Scrubber Bar */}
      <div className="max-w-[1780px] mx-auto px-6 lg:px-10 py-3 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Simulation Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-[#A7ADB5] uppercase font-bold">
              TIME MACHINE
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#11161D] text-[#60A5FA] border border-white/[0.08]">
              7-DAY HORIZON
            </span>
          </div>

          <div className="h-4 w-[1px] bg-white/[0.08]" />

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-1 text-xs font-mono rounded-lg flex items-center gap-1.5 transition-all ${
                isPlaying
                  ? 'bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444]'
                  : 'bg-[#151B23] border border-white/[0.08] text-[#A7ADB5] hover:text-[#F4F3EF] hover:bg-[#11161D]'
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
              className="p-1 rounded-lg bg-[#151B23] border border-white/[0.08] text-[#A7ADB5] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === TIMELINE_KEYS.length - 1}
              className="p-1 rounded-lg bg-[#151B23] border border-white/[0.08] text-[#A7ADB5] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                onSelectDay('NOW');
              }}
              className="p-1 rounded-lg bg-[#151B23] border border-white/[0.08] text-[#66707C] hover:text-[#F4F3EF] transition-colors"
              title="Reset to Today"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 8 Timeline Day Segment Buttons */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 w-full xl:w-auto">
          {TIMELINE_KEYS.map((key) => {
            const data = TIMELINE_FORECAST_MAP[key];
            const isSelected = selectedDay === key;
            const isPeakBreach = key === 'FRI';
            const hasBreach = data.isBreach;

            return (
              <button
                key={key}
                onClick={() => {
                  setIsPlaying(false);
                  onSelectDay(key);
                }}
                className={`relative px-3 py-2 rounded-xl border text-left transition-all ${
                  isSelected
                    ? hasBreach
                      ? 'bg-[#181214] border-[#EF4444]/60 text-white ring-1 ring-[#EF4444]/30'
                      : 'bg-[#151B23] border-white/30 text-white ring-1 ring-white/10'
                    : hasBreach
                    ? 'bg-[#0D1117] border-[#EF4444]/30 text-white/70 hover:border-[#EF4444]/50'
                    : 'bg-[#0D1117] border-white/[0.08] text-[#A7ADB5] hover:border-white/20 hover:text-[#F4F3EF]'
                }`}
              >
                {/* Top row: Day label + Breach Tag */}
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span
                    className={`text-[11px] font-mono font-bold tracking-wider uppercase ${
                      isSelected
                        ? hasBreach
                          ? 'text-[#EF4444]'
                          : 'text-[#F4F3EF]'
                        : hasBreach
                        ? 'text-[#EF4444]/80'
                        : 'text-[#A7ADB5]'
                    }`}
                  >
                    {key}
                  </span>

                  {isPeakBreach && (
                    <span className="text-[8px] font-mono font-black uppercase px-1 py-0.2 rounded bg-[#EF4444] text-white">
                      BREACH
                    </span>
                  )}
                  {hasBreach && !isPeakBreach && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                  )}
                </div>

                {/* Date sub-label */}
                <div className="text-[9px] font-mono text-[#66707C] uppercase">
                  {key === 'NOW' ? 'Today' : data.dateString.split(' ')[0]}
                </div>

                {/* Occupancy telemetry figure */}
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/[0.05]">
                  <span
                    className={`text-xs font-mono font-bold tabular-nums ${
                      hasBreach
                        ? 'text-[#EF4444]'
                        : data.totalOccupancyPercent >= 85
                        ? 'text-[#F97316]'
                        : 'text-[#F4F3EF]'
                    }`}
                  >
                    {data.totalOccupancyPercent}%
                  </span>
                  <span className="text-[9px] font-mono text-[#66707C]">
                    {data.resources.icu.shortageDelta > 0
                      ? `+${data.resources.icu.shortageDelta} ICU`
                      : `${50 - data.resources.icu.currentCapacity} free`}
                  </span>
                </div>

                {/* Selected Day Signature Accent (rare lime tick) */}
                {isSelected && (
                  <div
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full ${
                      hasBreach ? 'bg-[#EF4444]' : 'bg-[#D3FD50]'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
