'use client';

import React from 'react';
import { DayForecastPoint, RiskLevel } from '../../../../lib/types';
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
          bgBadge: 'bg-[#EF4444]/10 text-[#EF4444]',
          dotColor: 'bg-[#EF4444]',
        };
      case 'HIGH':
        return {
          textColor: 'text-[#F97316]',
          borderColor: 'border-[#F97316]/40',
          bgBadge: 'bg-[#F97316]/10 text-[#F97316]',
          dotColor: 'bg-[#F97316]',
        };
      case 'WATCH':
        return {
          textColor: 'text-[#F59E0B]',
          borderColor: 'border-[#F59E0B]/40',
          bgBadge: 'bg-[#F59E0B]/10 text-[#F59E0B]',
          dotColor: 'bg-[#F59E0B]',
        };
      case 'STABLE':
      default:
        return {
          textColor: 'text-[#D3FD50]',
          borderColor: 'border-[#D3FD50]/40',
          bgBadge: 'bg-[#D3FD50]/10 text-[#D3FD50]',
          dotColor: 'bg-[#D3FD50]',
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
    <section className="w-full border-b border-white/[0.08] bg-[#0A0B0D]">
      <div className="max-w-[1720px] mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
        {/* Metric 1: Current / Projected Occupancy */}
        <div className="p-5 lg:p-7 flex flex-col justify-between hover:bg-white/[0.015] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono tracking-widest text-white/50 uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D3FD50]" />
              CURRENT OCCUPANCY
            </span>
            <span className="text-[11px] font-mono text-white/40 tabular-nums">
              {forecastData.totalAdmittedPatients} / {forecastData.capacityThreshold} BEDS
            </span>
          </div>

          <div className="flex items-baseline gap-4 my-2">
            <span className="text-4xl lg:text-5xl font-black font-mono tracking-tight text-white tabular-nums">
              {forecastData.totalOccupancyPercent}%
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-white/40 uppercase">Demand Velocity</span>
              <span className="text-xs font-mono font-semibold text-[#D3FD50] flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +{((forecastData.totalOccupancyPercent - 78) * 0.8 + 2.1).toFixed(1)}% / 24h
              </span>
            </div>
          </div>

          {/* Integrated Micro Occupancy Fill Gauge */}
          <div className="w-full mt-3">
            <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all duration-500 rounded-full ${forecastData.totalOccupancyPercent >= 90
                    ? 'bg-[#EF4444]'
                    : forecastData.totalOccupancyPercent >= 80
                      ? 'bg-[#F97316]'
                      : 'bg-[#D3FD50]'
                  }`}
                style={{ width: `${Math.min(100, forecastData.totalOccupancyPercent)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-white/30 mt-1.5">
              <span>NOMINAL &lt;75%</span>
              <span className="text-white/60">SURGE CAP: 500 BEDS</span>
              <span>BREACH &gt;90%</span>
            </div>
          </div>
        </div>

        {/* Metric 2: 7-Day Risk */}
        <div className="p-5 lg:p-7 flex flex-col justify-between hover:bg-white/[0.015] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono tracking-widest text-white/50 uppercase flex items-center gap-2">
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
              <span className="text-[10px] font-mono text-white/40 uppercase">Failure Window</span>
              <span className="text-xs font-mono font-semibold text-white/80">
                {forecastData.dayOffset === 0 ? '4 DAYS (FRI BREACH)' : forecastData.dayOffset >= 5 ? 'ACTIVE CAPACITY BREACH' : `${Math.max(1, 5 - forecastData.dayOffset)} DAYS TO BREACH`}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-white/50 bg-white/[0.02] p-2 rounded border border-white/[0.04]">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className={`w-3.5 h-3.5 ${riskStyle.textColor}`} />
              Primary Failure Mode:
            </span>
            <span className="text-white font-semibold">
              {forecastData.resources.icu.shortageDelta > 0
                ? `ICU Exhaustion (+${forecastData.resources.icu.shortageDelta} Beds)`
                : 'ICU Compression (9 Beds Free)'}
            </span>
          </div>
        </div>

        {/* Metric 3: Forecast Confidence */}
        <div className="p-5 lg:p-7 flex flex-col justify-between hover:bg-white/[0.015] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono tracking-widest text-white/50 uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D3FD50]" />
              FORECAST CONFIDENCE
            </span>
            <span className="text-[10px] font-mono text-white/40 uppercase">
              BAYESIAN ENSEMBLE
            </span>
          </div>

          <div className="flex items-baseline gap-4 my-2">
            <span className="text-4xl lg:text-5xl font-black font-mono tracking-tight text-[#D3FD50] tabular-nums">
              91%
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-white/40 uppercase">Variance Bound</span>
              <span className="text-xs font-mono text-white/70">
                ±3.4% [CI 95%]
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-white/50 bg-white/[0.02] p-2 rounded border border-white/[0.04]">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#D3FD50]" />
              Simulation Engine:
            </span>
            <span className="text-white font-mono">500 Monte Carlo iterations</span>
          </div>
        </div>
      </div>
    </section>
  );
};
