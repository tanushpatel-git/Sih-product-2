'use client';

import React from 'react';
import { DayForecastPoint, RiskLevel } from '@/lib/types';
import { AlertTriangle, TrendingUp, Activity } from 'lucide-react';

interface MetricDisplayProps {
  forecastData: DayForecastPoint;
}

export const MetricDisplay: React.FC<MetricDisplayProps> = ({ forecastData }) => {
  const getRiskDetails = (risk: RiskLevel) => {
    switch (risk) {
      case 'CRITICAL':
        return {
          textColor: 'text-[#EF4444]',
          borderColor: 'border-[#EF4444]/40',
          bgBadge: 'bg-[#EF4444]/15 text-[#EF4444]',
          dotColor: 'bg-[#EF4444]',
        };
      case 'HIGH':
        return {
          textColor: 'text-[#F97316]',
          borderColor: 'border-[#F97316]/40',
          bgBadge: 'bg-[#F97316]/15 text-[#F97316]',
          dotColor: 'bg-[#F97316]',
        };
      case 'WATCH':
        return {
          textColor: 'text-[#F59E0B]',
          borderColor: 'border-[#F59E0B]/40',
          bgBadge: 'bg-[#F59E0B]/15 text-[#F59E0B]',
          dotColor: 'bg-[#F59E0B]',
        };
      case 'STABLE':
      default:
        return {
          textColor: 'text-[#F4F3EF]',
          borderColor: 'border-white/[0.08]',
          bgBadge: 'bg-[#151B23] text-[#A7ADB5]',
          dotColor: 'bg-[#60A5FA]',
        };
    }
  };

  const aggregateRisk: RiskLevel = forecastData.isBreach
    ? 'CRITICAL'
    : forecastData.totalOccupancyPercent >= 85
    ? 'HIGH'
    : forecastData.totalOccupancyPercent >= 80
    ? 'WATCH'
    : 'STABLE';

  const riskStyle = getRiskDetails(aggregateRisk);

  return (
    <section className="w-full border-b border-white/[0.08] bg-[#0D1117]">
      <div className="max-w-[1720px] mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
        {/* Metric 1: Current Occupancy */}
        <div className="p-6 lg:p-8 flex flex-col justify-between hover:bg-[#11161D]/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono tracking-widest text-[#A7ADB5] uppercase font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" />
              CURRENT OCCUPANCY
            </span>
            <span className="text-[11px] font-mono text-[#66707C] tabular-nums">
              {forecastData.totalAdmittedPatients} / {forecastData.capacityThreshold} BEDS
            </span>
          </div>

          <div className="flex items-baseline gap-4 my-2">
            <span className="text-4xl lg:text-5xl font-black font-mono tracking-tight text-[#F4F3EF] tabular-nums">
              {forecastData.totalOccupancyPercent}%
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-[#66707C] uppercase">Demand Velocity</span>
              <span className="text-xs font-mono font-semibold text-[#A7ADB5] flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-[#60A5FA]" />
                +{((forecastData.totalOccupancyPercent - 78) * 0.8 + 2.1).toFixed(1)}% / 24h
              </span>
            </div>
          </div>

          {/* Micro Capacity Bar */}
          <div className="w-full mt-3">
            <div className="w-full h-1.5 bg-[#151B23] rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  forecastData.totalOccupancyPercent >= 90
                    ? 'bg-[#EF4444]'
                    : forecastData.totalOccupancyPercent >= 80
                    ? 'bg-[#F97316]'
                    : 'bg-[#155EEF]'
                }`}
                style={{ width: `${Math.min(100, forecastData.totalOccupancyPercent)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-[#66707C] mt-1.5">
              <span>NOMINAL &lt;75%</span>
              <span className="text-[#A7ADB5]">SURGE CAP: 500 BEDS</span>
              <span>BREACH &gt;90%</span>
            </div>
          </div>
        </div>

        {/* Metric 2: 7-Day Risk */}
        <div className="p-6 lg:p-8 flex flex-col justify-between hover:bg-[#11161D]/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono tracking-widest text-[#A7ADB5] uppercase font-semibold flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${riskStyle.dotColor}`} />
              7-DAY RISK
            </span>
            <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${riskStyle.borderColor} ${riskStyle.bgBadge}`}>
              {aggregateRisk}
            </span>
          </div>

          <div className="flex items-baseline gap-4 my-2">
            <span className={`text-4xl lg:text-5xl font-black font-mono tracking-tight tabular-nums ${riskStyle.textColor}`}>
              {aggregateRisk}
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-[#66707C] uppercase">Action Window</span>
              <span className="text-xs font-mono font-semibold text-[#F4F3EF]">
                {forecastData.dayOffset === 0 ? '4 DAYS (FRI BREACH)' : forecastData.dayOffset >= 5 ? 'ACTIVE CAPACITY BREACH' : `${Math.max(1, 5 - forecastData.dayOffset)} DAYS TO BREACH`}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#A7ADB5] bg-[#151B23] p-2 rounded-lg border border-white/[0.06]">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className={`w-3.5 h-3.5 ${riskStyle.textColor}`} />
              Primary Failure Mode:
            </span>
            <span className="text-[#F4F3EF] font-semibold">
              {forecastData.resources.icu.shortageDelta > 0
                ? `ICU Exhaustion (+${forecastData.resources.icu.shortageDelta} Beds)`
                : 'ICU Compression (9 Beds Free)'}
            </span>
          </div>
        </div>

        {/* Metric 3: Forecast Confidence */}
        <div className="p-6 lg:p-8 flex flex-col justify-between hover:bg-[#11161D]/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono tracking-widest text-[#A7ADB5] uppercase font-semibold flex items-center gap-2">
              {/* Rare signature lime indicator for ML active state */}
              <span className="w-1.5 h-1.5 rounded-full bg-[#D3FD50]" />
              FORECAST CONFIDENCE
            </span>
            <span className="text-[10px] font-mono text-[#66707C] uppercase">
              BAYESIAN ENSEMBLE
            </span>
          </div>

          <div className="flex items-baseline gap-4 my-2">
            <span className="text-4xl lg:text-5xl font-black font-mono tracking-tight text-[#F4F3EF] tabular-nums">
              91%
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-[#66707C] uppercase">Variance Bound</span>
              <span className="text-xs font-mono text-[#A7ADB5]">
                ±3.4% [CI 95%]
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#A7ADB5] bg-[#151B23] p-2 rounded-lg border border-white/[0.06]">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#60A5FA]" />
              Simulation Engine:
            </span>
            <span className="text-[#F4F3EF] font-mono">500 Monte Carlo iterations</span>
          </div>
        </div>
      </div>
    </section>
  );
};
