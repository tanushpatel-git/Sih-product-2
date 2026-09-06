'use client';

import React from 'react';
import { TimelineDayId, DayForecastPoint } from '../../../../lib/types';
import { ForecastChart } from './ForecastChart';
import { Layers, AlertTriangle, Eye, Sparkles } from 'lucide-react';

interface ForecastHeroProps {
  selectedDay: TimelineDayId;
  onSelectDay: (day: TimelineDayId) => void;
  forecastData: DayForecastPoint;
}

export const ForecastHero: React.FC<ForecastHeroProps> = ({
  selectedDay,
  onSelectDay,
  forecastData,
}) => {
  return (
    <section className="w-full border-b border-white/[0.08] bg-[#090A0C] p-4 lg:p-8">
      <div className="max-w-[1720px] mx-auto">
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#D3FD50]" />
              <span className="text-xs font-mono tracking-widest text-[#D3FD50] uppercase font-bold">
                FORECAST ENGINE v2.8
              </span>
              <span className="text-[10px] font-mono text-white/40 uppercase">
                • AUTOREGRESSIVE BAYESIAN LSTM
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black font-mono tracking-tight text-white uppercase">
              PATIENT DEMAND • NEXT 7 DAYS
            </h2>
            <p className="text-xs font-mono text-white/50 mt-0.5">
              Multi-scale projection combining local outbreak vectors, emergency intake velocity, and ward discharge clearance rates.
            </p>
          </div>

          {/* Telemetry Badges & Legend */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#0e1012] border border-white/[0.08]">
              <span className="w-2.5 h-[2px] bg-[#9CA3AF]" />
              <span className="text-white/60 text-[11px]">Actuals</span>
            </div>

            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#0e1012] border border-white/[0.08]">
              <span className="w-2.5 h-[2px] bg-[#D3FD50]" />
              <span className="text-white/60 text-[11px]">Forecast (Median)</span>
            </div>

            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#0e1012] border border-white/[0.08]">
              <span className="w-2.5 h-2 bg-[#D3FD50]/20 border border-[#D3FD50]/40 rounded-sm" />
              <span className="text-white/60 text-[11px]">95% Conf. Band</span>
            </div>

            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#EF4444]/10 border border-[#EF4444]/30">
              <span className="w-2.5 h-[2px] bg-[#EF4444]" />
              <span className="text-[#EF4444] text-[11px] font-semibold">500 Bed Capacity</span>
            </div>
          </div>
        </div>

        {/* Chart View Container */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0b0d0f] p-3 sm:p-5 relative">
          <ForecastChart selectedDay={selectedDay} onSelectDay={onSelectDay} />

          {/* Bottom Telemetry Bar */}
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-white/50">
            <div className="flex items-center gap-4">
              <span>
                CURRENT VIEW:{' '}
                <strong className="text-white uppercase">{forecastData.label}</strong>
              </span>
              <span>•</span>
              <span>
                BED DEMAND:{' '}
                <strong className="text-white tabular-nums">
                  {forecastData.totalAdmittedPatients} PATIENTS
                </strong>
              </span>
              <span>•</span>
              <span>
                NET SURPLUS/DEFICIT:{' '}
                <strong
                  className={`tabular-nums ${forecastData.capacityThreshold - forecastData.totalAdmittedPatients < 0
                      ? 'text-[#EF4444]'
                      : 'text-[#D3FD50]'
                    }`}
                >
                  {forecastData.capacityThreshold - forecastData.totalAdmittedPatients >= 0 ? '+' : ''}
                  {forecastData.capacityThreshold - forecastData.totalAdmittedPatients} BEDS
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-white/40">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D3FD50]" />
              Continuous Telemetry Feed Synchronized
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
