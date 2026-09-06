'use client';

import React from 'react';
import { DayForecastPoint, RiskLevel } from '../../../../lib/types';
import { AlertCircle, Gauge, Activity, Flame, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ResourceIntelligenceProps {
  forecastData: DayForecastPoint;
}

export const ResourceIntelligence: React.FC<ResourceIntelligenceProps> = ({ forecastData }) => {
  const { icu, generalBeds, ventilators, oxygen } = forecastData.resources;

  // Helper for risk badge
  const getBadge = (risk: RiskLevel, label?: string) => {
    switch (risk) {
      case 'CRITICAL':
        return (
          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#EF4444]/20 border border-[#EF4444]/50 text-[#EF4444]">
            {label || 'CRITICAL SHORTAGE'}
          </span>
        );
      case 'HIGH':
        return (
          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#F97316]/20 border border-[#F97316]/50 text-[#F97316]">
            {label || 'HIGH PRESSURE'}
          </span>
        );
      case 'WATCH':
        return (
          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#F59E0B]/20 border border-[#F59E0B]/50 text-[#F59E0B]">
            {label || 'WATCH STATE'}
          </span>
        );
      case 'STABLE':
      default:
        return (
          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#D3FD50]/15 border border-[#D3FD50]/40 text-[#D3FD50]">
            {label || 'NOMINAL'}
          </span>
        );
    }
  };

  return (
    <section className="w-full border-b border-white/[0.08] bg-[#080909] p-4 lg:p-8">
      <div className="max-w-[1720px] mx-auto">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#D3FD50]" />
              <span className="text-xs font-mono tracking-widest text-white/50 uppercase font-bold">
                RESOURCE TELEMETRY & BREACH FORECAST
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black font-mono tracking-tight text-white uppercase">
              CRITICAL RESOURCE INTELLIGENCE
            </h2>
          </div>
          <div className="text-xs font-mono text-white/40">
            Active Day: <span className="text-white font-bold">{forecastData.label}</span>
          </div>
        </div>

        {/* 4 Distinct Functional Resource Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* RESOURCE 1: ICU (Modular Bed Matrix Visualization) */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0d0f12] p-5 flex flex-col justify-between hover:border-white/20 transition-all">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                  ICU BEDS
                </span>
                {getBadge(
                  icu.shortageDelta > 0 ? 'CRITICAL' : icu.risk,
                  icu.shortageDelta > 0 ? `SHORTAGE +${icu.shortageDelta}` : undefined
                )}
              </div>

              {/* Current vs Projected Telemetry */}
              <div className="flex items-baseline justify-between mb-3 pb-3 border-b border-white/[0.06]">
                <div>
                  <div className="text-[10px] font-mono text-white/40 uppercase">Current Load</div>
                  <div className="text-2xl font-mono font-bold text-white tabular-nums">
                    {icu.currentCapacity} <span className="text-xs text-white/40">/ {icu.totalCapacity}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-white/40 uppercase">Projected Demand</div>
                  <div
                    className={`text-2xl font-mono font-bold tabular-nums ${icu.shortageDelta > 0 ? 'text-[#EF4444]' : 'text-[#D3FD50]'
                      }`}
                  >
                    {icu.projectedDemand} <span className="text-xs text-white/40">BEDS</span>
                  </div>
                </div>
              </div>

              {/* Functional Visualization: 50 Physical Bed Matrix (5x10) */}
              <div className="my-3">
                <div className="flex items-center justify-between text-[10px] font-mono text-white/40 mb-1.5">
                  <span>FACILITY BED BAY MATRIX</span>
                  <span>{icu.totalCapacity} BAYS</span>
                </div>
                <div className="grid grid-cols-10 gap-1 p-2 rounded bg-black/40 border border-white/[0.04]">
                  {Array.from({ length: 50 }).map((_, idx) => {
                    const isOccupied = idx < icu.currentCapacity;
                    const isProjectedOverflow =
                      idx >= icu.currentCapacity && idx < icu.projectedDemand;
                    return (
                      <div
                        key={idx}
                        className={`h-3 rounded-xs transition-colors ${isOccupied
                            ? 'bg-white/80'
                            : isProjectedOverflow
                              ? 'bg-[#EF4444] animate-pulse'
                              : 'bg-white/[0.08]'
                          }`}
                        title={`Bed #${idx + 1}: ${isOccupied
                            ? 'Occupied'
                            : isProjectedOverflow
                              ? 'Projected Breach Slot'
                              : 'Available'
                          }`}
                      />
                    );
                  })}
                </div>
                {/* Overflow indicators outside the physical 50 slots */}
                {icu.shortageDelta > 0 && (
                  <div className="mt-2 p-1.5 rounded bg-[#EF4444]/15 border border-[#EF4444]/40 flex items-center justify-between text-[10px] font-mono text-[#EF4444]">
                    <span className="font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      EXTRAPOLATED SHORTAGE:
                    </span>
                    <span className="font-black">+{icu.shortageDelta} UNHOUSED PATIENTS</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] text-[10px] font-mono text-white/40 flex justify-between">
              <span>Nurse Ratio: 1:2 Target</span>
              <span className="text-white/60 font-semibold">Triage Code Alpha</span>
            </div>
          </div>

          {/* RESOURCE 2: GENERAL BEDS (Segmented Ward Distribution) */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0d0f12] p-5 flex flex-col justify-between hover:border-white/20 transition-all">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                  GENERAL BEDS
                </span>
                {getBadge(generalBeds.risk)}
              </div>

              {/* Current vs Projected Telemetry */}
              <div className="flex items-baseline justify-between mb-3 pb-3 border-b border-white/[0.06]">
                <div>
                  <div className="text-[10px] font-mono text-white/40 uppercase">Current Inpatients</div>
                  <div className="text-2xl font-mono font-bold text-white tabular-nums">
                    {generalBeds.currentCapacity} <span className="text-xs text-white/40">/ {generalBeds.totalCapacity}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-white/40 uppercase">Projected</div>
                  <div className="text-2xl font-mono font-bold text-[#F97316] tabular-nums">
                    {generalBeds.projectedDemand} <span className="text-xs text-white/40">BEDS</span>
                  </div>
                </div>
              </div>

              {/* Functional Visualization: Ward Capacity Stacks */}
              <div className="my-3 space-y-2">
                <div className="text-[10px] font-mono text-white/40 flex justify-between">
                  <span>WARD BREAKDOWN</span>
                  <span>{generalBeds.projectedDemand}% TOTAL OCCUPANCY</span>
                </div>

                {/* Ward Stack Bars */}
                <div>
                  <div className="flex justify-between text-[9px] font-mono text-white/60 mb-0.5">
                    <span>Medical Ward A</span>
                    <span className="tabular-nums">38 / 40</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-[#F97316] rounded-full" style={{ width: '95%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[9px] font-mono text-white/60 mb-0.5">
                    <span>Surgical Ward B</span>
                    <span className="tabular-nums">32 / 35</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-[#D3FD50] rounded-full" style={{ width: '91%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[9px] font-mono text-white/60 mb-0.5">
                    <span>Stepdown / Recovery</span>
                    <span className="tabular-nums">26 / 25 (Overflow)</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-[#EF4444] rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] text-[10px] font-mono text-white/40 flex justify-between">
              <span>Discharge Rate: 12 / 24h</span>
              <span className="text-white/60 font-semibold">Triage Buffer: 4 Beds</span>
            </div>
          </div>

          {/* RESOURCE 3: VENTILATORS (Radial Dial Gauge) */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0d0f12] p-5 flex flex-col justify-between hover:border-white/20 transition-all">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                  VENTILATORS
                </span>
                {getBadge(
                  ventilators.shortageDelta > 0 ? 'CRITICAL' : ventilators.risk,
                  ventilators.shortageDelta > 0 ? `SHORTAGE +${ventilators.shortageDelta}` : undefined
                )}
              </div>

              {/* Current vs Projected */}
              <div className="flex items-baseline justify-between mb-3 pb-3 border-b border-white/[0.06]">
                <div>
                  <div className="text-[10px] font-mono text-white/40 uppercase">In Use Active</div>
                  <div className="text-2xl font-mono font-bold text-white tabular-nums">
                    {ventilators.currentCapacity} <span className="text-xs text-white/40">/ {ventilators.totalCapacity}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-white/40 uppercase">Projected Need</div>
                  <div
                    className={`text-2xl font-mono font-bold tabular-nums ${ventilators.shortageDelta > 0 ? 'text-[#EF4444]' : 'text-[#D3FD50]'
                      }`}
                  >
                    {ventilators.projectedDemand} <span className="text-xs text-white/40">UNITS</span>
                  </div>
                </div>
              </div>

              {/* Functional Visualization: Circular SVG Gauge */}
              <div className="my-2 flex items-center justify-center">
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="8"
                    />
                    {/* Current active circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#D3FD50"
                      strokeWidth="8"
                      strokeDasharray={`${(ventilators.currentCapacity / ventilators.totalCapacity) * 238.7} 238.7`}
                      strokeLinecap="round"
                    />
                    {/* Deficit arc if breached */}
                    {ventilators.shortageDelta > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="8"
                        strokeDasharray="40 238.7"
                        strokeDashoffset={`-${(ventilators.currentCapacity / ventilators.totalCapacity) * 238.7}`}
                        className="animate-pulse"
                      />
                    )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span
                      className={`text-lg font-mono font-black tabular-nums ${ventilators.shortageDelta > 0 ? 'text-[#EF4444]' : 'text-white'
                        }`}
                    >
                      {Math.round((ventilators.projectedDemand / ventilators.totalCapacity) * 100)}%
                    </span>
                    <span className="text-[8px] font-mono text-white/40 uppercase">
                      OF INVENTORY
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] text-[10px] font-mono text-white/40 flex justify-between">
              <span>Sterilized Reserves: 2</span>
              <span className="text-white/60 font-semibold">Invasive: 82%</span>
            </div>
          </div>

          {/* RESOURCE 4: OXYGEN (Cryogenic Tank Level Visualization) */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0d0f12] p-5 flex flex-col justify-between hover:border-white/20 transition-all">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                  OXYGEN SUPPLY
                </span>
                {getBadge(
                  oxygen.daysRemaining <= 2 ? 'CRITICAL' : oxygen.daysRemaining <= 4 ? 'HIGH' : oxygen.risk,
                  `DEPLETION: ${oxygen.daysRemaining.toFixed(1)} DAYS`
                )}
              </div>

              {/* Current vs Projected */}
              <div className="flex items-baseline justify-between mb-3 pb-3 border-b border-white/[0.06]">
                <div>
                  <div className="text-[10px] font-mono text-white/40 uppercase">Bulk Tank Level</div>
                  <div className="text-2xl font-mono font-bold text-white tabular-nums">
                    {oxygen.currentPercentage}% <span className="text-xs text-white/40">REMAINING</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-white/40 uppercase">Depletion Horizon</div>
                  <div
                    className={`text-2xl font-mono font-bold tabular-nums ${oxygen.daysRemaining <= 3 ? 'text-[#EF4444]' : 'text-[#D3FD50]'
                      }`}
                  >
                    {oxygen.daysRemaining.toFixed(1)} <span className="text-xs text-white/40">DAYS</span>
                  </div>
                </div>
              </div>

              {/* Functional Visualization: Liquid Cryo Tank Level */}
              <div className="my-2 p-2.5 rounded bg-black/40 border border-white/[0.04] flex items-center gap-4">
                {/* Visual Tank Vessel */}
                <div className="w-12 h-20 rounded-md border border-white/20 bg-white/[0.02] p-1 relative flex flex-col justify-end overflow-hidden">
                  <div
                    className={`w-full rounded transition-all duration-500 ${oxygen.projectedPercentage < 30
                        ? 'bg-[#EF4444]'
                        : oxygen.projectedPercentage < 50
                          ? 'bg-[#F97316]'
                          : 'bg-[#D3FD50]'
                      }`}
                    style={{ height: `${Math.max(8, oxygen.projectedPercentage)}%` }}
                  />
                  <div className="absolute inset-x-0 top-1 text-center text-[8px] font-mono text-white/40">
                    VIE-1
                  </div>
                </div>

                {/* Tank Telemetry Stats */}
                <div className="flex-1 space-y-1 text-[10px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-white/40">Liquid Volume:</span>
                    <span className="text-white font-bold tabular-nums">
                      {Math.round((oxygen.projectedPercentage / 100) * 10000)} L
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Manifold Burn:</span>
                    <span className="text-white tabular-nums">{oxygen.burnRateLitersPerMin} L/min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Delivery Pipeline:</span>
                    <span className="text-[#D3FD50]">4.2 Bar NOMINAL</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] text-[10px] font-mono text-white/40 flex justify-between">
              <span>Cryo Supplier: INOX Air</span>
              <span className="text-white/60 font-semibold">Restock: 48h scheduled</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
