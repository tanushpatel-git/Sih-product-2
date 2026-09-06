'use client';

import React from 'react';
import { DayForecastPoint } from '../../../../lib/types';
import { AlertOctagon, ArrowRight, ShieldAlert, LineChart, Users } from 'lucide-react';

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
    <div className="w-full px-4 lg:px-8 py-4 bg-[#090A0C] border-b border-white/[0.08]">
      <div className="max-w-[1720px] mx-auto">
        <div
          className={`rounded-xl border p-5 transition-all ${isBreach
              ? 'bg-[#140b0b] border-[#EF4444]/60 ring-1 ring-[#EF4444]/30'
              : 'bg-[#0e1012] border-white/[0.1]'
            }`}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Left: Alert Header & Message */}
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-lg border mt-1 shrink-0 ${isBreach
                    ? 'bg-[#EF4444]/15 border-[#EF4444]/50 text-[#EF4444]'
                    : 'bg-[#F59E0B]/15 border-[#F59E0B]/50 text-[#F59E0B]'
                  }`}
              >
                <AlertOctagon className="w-6 h-6 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded tracking-widest ${isBreach
                        ? 'bg-[#EF4444] text-black font-black'
                        : 'bg-[#F59E0B] text-black font-bold'
                      }`}
                  >
                    CRITICAL
                  </span>
                  <span className="text-xs font-mono text-white/50 tracking-wider uppercase">
                    EARLY WARNING TELEMETRY
                  </span>
                </div>

                <h3 className="text-lg lg:text-xl font-mono font-black text-white uppercase tracking-tight">
                  ICU CAPACITY PROJECTED TO BREACH
                </h3>

                <p className="text-sm font-mono font-bold text-[#EF4444] mt-0.5 uppercase tracking-wide">
                  {forecastData.dayOffset === 0
                    ? '4 DAYS FROM NOW (FRIDAY PEAK)'
                    : forecastData.dayOffset >= 5
                      ? 'ACTIVE CAPACITY OVERLOAD'
                      : `${Math.max(1, 5 - forecastData.dayOffset)} DAYS FROM NOW`}
                </p>

                <p className="text-xs font-mono text-white/60 mt-1">
                  Recommended action:{' '}
                  <span className="text-white">
                    Notify nearby hospitals and initiate capacity coordination.
                  </span>
                </p>
              </div>
            </div>

            {/* Center: Exact Technical Telemetry Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto p-3 rounded-lg bg-black/40 border border-white/[0.06]">
              <div>
                <div className="text-[10px] font-mono text-white/40 uppercase">Current</div>
                <div className="text-base font-mono font-bold text-white tabular-nums">
                  41 / 50
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono text-white/40 uppercase">Projected</div>
                <div className="text-base font-mono font-bold text-[#EF4444] tabular-nums">
                  59 / 50
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono text-white/40 uppercase">Shortage</div>
                <div className="text-base font-mono font-bold text-[#EF4444] tabular-nums">
                  {shortageBeds} ICU beds
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono text-white/40 uppercase">Forecast Conf.</div>
                <div className="text-base font-mono font-bold text-[#D3FD50] tabular-nums">
                  91%
                </div>
              </div>
            </div>

            {/* Right: Primary & Secondary Actions */}
            <div className="flex sm:flex-row lg:flex-col xl:flex-row items-center gap-2.5 w-full lg:w-auto">
              <button
                onClick={onOpenCoordination}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#D3FD50] text-[#080909] hover:bg-[#c0ec39] transition-all font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#D3FD50]/10 shrink-0"
              >
                COORDINATE RESPONSE →
              </button>

              <button
                onClick={onViewForecast}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white hover:bg-white/[0.1] transition-all font-mono text-xs flex items-center justify-center gap-2 shrink-0"
              >
                <LineChart className="w-3.5 h-3.5 text-white/60" />
                VIEW FORECAST
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
