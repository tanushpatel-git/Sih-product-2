'use client';

import React, { useEffect, useState } from 'react';
import { TimelineDayId, DayForecastPoint } from '@/lib/types';
import { TIMELINE_KEYS, TIMELINE_FORECAST_MAP } from '@/lib/mockData';
import { MapPin, AlertTriangle, Info, ArrowUpRight, Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

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
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedDay, onSelectDay]);

  const currentIndex = TIMELINE_KEYS.indexOf(selectedDay);
  const isBreach = forecastData.isBreach;

  return (
    <section className="w-full bg-white/70 backdrop-blur-md rounded-2xl border border-[#E2E8F0] p-6 lg:p-7 shadow-xs mb-6">
      {/* Top Row: Hospital Title & Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]/80">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold font-sans tracking-tight text-[#0F172A]">
              Bhopal District Hospital
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-semibold text-[#047857]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              LIVE
            </span>
            <span className="text-xs text-[#64748B] hidden sm:inline">
              Real-time data
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-1">
            <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>Bhopal, Madhya Pradesh</span>
            <span className="mx-1.5 text-[#CBD5E1]">•</span>
            <span className="font-mono text-[11px] text-[#94A3B8]">FACILITY ID: MP-BPL-094</span>
          </div>
        </div>

        {/* 7-Day Timeline Scrubber Control */}
        <div className="flex items-center gap-2 bg-[#F8FAFC] p-1.5 rounded-xl border border-[#E2E8F0]">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isPlaying
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-white'
            }`}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isPlaying ? 'PAUSE' : 'SIMULATE'}</span>
          </button>

          <div className="flex items-center gap-1">
            {TIMELINE_KEYS.map((dayKey, idx) => {
              const dayData = TIMELINE_FORECAST_MAP[dayKey];
              const isSelected = selectedDay === dayKey;
              const hasBreach = dayData.isBreach;
              const dateLabels = ['May 4', 'May 5', 'May 6', 'May 7', 'May 8', 'May 9', 'May 10'];

              return (
                <button
                  key={dayKey}
                  onClick={() => onSelectDay(dayKey)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all relative ${
                    isSelected
                      ? 'bg-white text-[#2563EB] font-bold shadow-xs border border-[#CBD5E1]'
                      : hasBreach
                      ? 'text-[#DC2626] font-medium hover:bg-white/70'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/70'
                  }`}
                >
                  <div className="text-[11px] leading-tight">
                    {dateLabels[idx]}
                  </div>
                  {hasBreach && (
                    <span className="absolute -top-1 -right-0.5 w-2 h-2 rounded-full bg-[#EF4444] ring-1 ring-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4 Large Editorial KPI Numbers (Spacious, Elegant, Highly Readable) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 pt-6">
        {/* Metric 1: Current Occupancy */}
        <div className="space-y-1">
          <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-sans tracking-tight text-[#0F172A] tabular-nums">
            {forecastData.totalOccupancyPercent}%
          </div>
          <div className="text-xs font-semibold text-[#475569]">
            Current Occupancy
          </div>
          <div className="flex items-center gap-1 text-xs text-[#059669] font-medium pt-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+6% vs. last week</span>
          </div>
        </div>

        {/* Metric 2: Forecasted Demand */}
        <div className="space-y-1">
          <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-sans tracking-tight text-[#0F172A] tabular-nums">
            +{forecastData.dayOffset > 0 ? (forecastData.dayOffset * 4 + 14) : 18}%
          </div>
          <div className="text-xs font-semibold text-[#475569]">
            Forecasted Demand
          </div>
          <div className="text-xs text-[#64748B] pt-0.5">
            (7-day trajectory horizon)
          </div>
        </div>

        {/* Metric 3: 7-Day Risk */}
        <div className="space-y-1">
          <div className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold font-sans tracking-tight flex items-center gap-2 ${
            isBreach ? 'text-[#DC2626]' : 'text-[#D97706]'
          }`}>
            <AlertTriangle className={`w-8 h-8 lg:w-10 lg:h-10 ${isBreach ? 'text-[#DC2626]' : 'text-[#F59E0B]'}`} />
            <span>{isBreach ? 'CRITICAL' : 'HIGH'}</span>
          </div>
          <div className="text-xs font-semibold text-[#475569]">
            7-Day Risk Index
          </div>
          <div className="text-xs text-[#64748B] pt-0.5">
            {isBreach ? 'ICU Bed Deficit Expected' : 'Near-capacity threshold'}
          </div>
        </div>

        {/* Metric 4: Forecast Confidence */}
        <div className="space-y-1">
          <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-sans tracking-tight text-[#0F172A] tabular-nums flex items-center gap-1.5">
            <span>91%</span>
            <Info className="w-4 h-4 text-[#94A3B8] cursor-pointer hover:text-[#475569]" />
          </div>
          <div className="text-xs font-semibold text-[#475569]">
            Forecast Confidence
          </div>
          <div className="text-xs text-[#64748B] pt-0.5">
            Bayesian Ensemble (±3.4%)
          </div>
        </div>
      </div>
    </section>
  );
};
