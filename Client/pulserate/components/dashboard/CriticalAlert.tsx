'use client';

import React from 'react';
import { DayForecastPoint } from '@/lib/types';
import { AlertOctagon, LineChart, Bell } from 'lucide-react';

interface CriticalAlertProps {
  forecastData: DayForecastPoint;
  onOpenCoordination: () => void;
  onViewForecast: () => void;
}

export const CriticalAlert: React.FC<CriticalAlertProps> = ({
  forecastData,
  onOpenCoordination,
  onViewForecast,
}) => {
  const isBreach = forecastData.isBreach || forecastData.resources.icu.shortageDelta > 0;
  const shortageBeds = Math.max(9, forecastData.resources.icu.shortageDelta);

  return (
    <div className="w-full px-6 lg:px-10 py-4 bg-[#07090C] border-b border-white/[0.08]">
      <div className="max-w-[1720px] mx-auto">
        <div
          className={`rounded-2xl border p-5 sm:p-6 transition-all ${
            isBreach
              ? 'bg-[#181112] border-[#EF4444]/40'
              : 'bg-[#0D1117] border-white/[0.08]'
          }`}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Left: Alert Header & Message */}
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-xl border mt-0.5 shrink-0 ${
                  isBreach
                    ? 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444]'
                    : 'bg-[#F59E0B]/15 border-[#F59E0B]/40 text-[#F59E0B]'
                }`}
              >
                <AlertOctagon className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded tracking-widest ${
                      isBreach
                        ? 'bg-[#EF4444] text-white'
                        : 'bg-[#F59E0B] text-black'
                    }`}
                  >
                    CRITICAL
                  </span>
                  <span className="text-xs font-mono text-[#A7ADB5] tracking-wider uppercase">
                    ICU CAPACITY BREACH
                  </span>
                </div>

                <h3 className="text-lg lg:text-xl font-mono font-black text-[#F4F3EF] uppercase tracking-tight">
                  PROJECTED TO BREACH IN 4 DAYS
                </h3>

                <p className="text-xs font-mono text-[#A7ADB5] mt-1">
                  Recommended action:{' '}
                  <span className="text-[#F4F3EF]">
                    Notify nearby hospitals and initiate capacity coordination.
                  </span>
                </p>
              </div>
            </div>

            {/* Center: Exact Technical Telemetry Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto p-3.5 rounded-xl bg-[#07090C] border border-white/[0.06]">
              <div>
                <div className="text-[10px] font-mono text-[#66707C] uppercase">Current</div>
                <div className="text-base font-mono font-bold text-[#F4F3EF] tabular-nums">
                  41 / 50
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono text-[#66707C] uppercase">Projected</div>
                <div className="text-base font-mono font-bold text-[#EF4444] tabular-nums">
                  59 / 50
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono text-[#66707C] uppercase">Shortage</div>
                <div className="text-base font-mono font-bold text-[#EF4444] tabular-nums">
                  {shortageBeds} ICU beds
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono text-[#66707C] uppercase">Confidence</div>
                <div className="text-base font-mono font-bold text-[#60A5FA] tabular-nums">
                  91%
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex sm:flex-row lg:flex-col xl:flex-row items-center gap-3 w-full lg:w-auto">
              <button
                onClick={onOpenCoordination}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#155EEF] text-white hover:bg-[#1048b8] transition-all font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#155EEF]/15 shrink-0"
              >
                <Bell className="w-3.5 h-3.5" />
                NOTIFY NEARBY HOSPITALS →
              </button>

              <button
                onClick={onViewForecast}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#151B23] border border-white/[0.12] text-[#F4F3EF] hover:bg-[#11161D] transition-all font-mono text-xs flex items-center justify-center gap-2 shrink-0"
              >
                <LineChart className="w-3.5 h-3.5 text-[#66707C]" />
                VIEW FORECAST
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
