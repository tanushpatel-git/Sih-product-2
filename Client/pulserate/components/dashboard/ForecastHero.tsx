'use client';

import React from 'react';
import { TimelineDayId, DayForecastPoint } from '@/lib/types';
import { ForecastChart } from './ForecastChart';
import { ArrowRight, CheckCircle2, AlertOctagon, TrendingUp, ShieldAlert } from 'lucide-react';

interface ForecastHeroProps {
  selectedDay: TimelineDayId;
  onSelectDay: (day: TimelineDayId) => void;
  forecastData: DayForecastPoint;
  onOpenCoordination: () => void;
}

export const ForecastHero: React.FC<ForecastHeroProps> = ({
  selectedDay,
  onSelectDay,
  forecastData,
  onOpenCoordination,
}) => {
  // 6-Step Clinical Narrative Tracker (Film Pacing)
  const STORY_STAGES: Array<{
    day: TimelineDayId;
    step: string;
    title: string;
    headline: string;
    description: string;
  }> = [
    {
      day: 'NOW',
      step: '01',
      title: 'CURRENT STATE',
      headline: 'Everything is nominal today.',
      description: '78% occupancy (390 / 500 beds) • 9 ICU beds free',
    },
    {
      day: 'TUE',
      step: '02',
      title: 'DEMAND VELOCITY',
      headline: 'Demand is increasing.',
      description: 'Inflow +4.5% / 24h • General wards approaching 88%',
    },
    {
      day: 'THU',
      step: '03',
      title: 'CAPACITY BREACH',
      headline: 'ICU capacity exceeded in 4 days.',
      description: '54 / 50 ICU beds • 4 patients over licensed ceiling',
    },
    {
      day: 'FRI',
      step: '04',
      title: 'DEFICIT PEAK',
      headline: '13 beds will be missing.',
      description: '59 / 50 ICU demand • Critical threshold breached',
    },
    {
      day: 'SAT',
      step: '05',
      title: 'REGIONAL CAPACITY',
      headline: 'Nearby hospital has capacity.',
      description: 'Hamidia Hospital has 18 ICU beds free (4.2 km)',
    },
    {
      day: 'SUN',
      step: '06',
      title: 'COORDINATED RESPONSE',
      headline: 'Coordinate patient transfer.',
      description: 'Dispatch diversion protocol to prevent triage failure',
    },
  ];

  const shortageBeds = Math.max(0, forecastData.resources.icu.shortageDelta);
  const isBreach = forecastData.isBreach || shortageBeds > 0;

  return (
    <section className="w-full border-b border-white/[0.08] bg-[#07090C] p-6 lg:p-10">
      <div className="max-w-[1780px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF]" />
              <span className="text-[11px] font-mono tracking-widest text-[#A7ADB5] uppercase font-bold">
                7-DAY PATIENT DEMAND FORECAST INSTRUMENT
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black font-mono tracking-tight text-[#F4F3EF] uppercase">
              HOSPITAL DEMAND TRAJECTORY & BREACH PROJECTION
            </h2>
            <p className="text-xs font-mono text-[#66707C] mt-1 max-w-3xl">
              Historical admissions baseline combined with emergency intake velocity and predictive epidemiological modeling.
            </p>
          </div>

          {/* Instrument Legend */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#0D1117] border border-white/[0.08]">
              <span className="w-2.5 h-[1.5px] bg-[#66707C]" />
              <span className="text-[#A7ADB5] text-[11px]">Actual Admissions</span>
            </div>

            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#0D1117] border border-white/[0.08]">
              <span className="w-2.5 h-[2px] bg-[#155EEF]" />
              <span className="text-[#60A5FA] text-[11px] font-semibold">Forecast (Cobalt)</span>
            </div>

            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#0D1117] border border-white/[0.08]">
              <span className="w-2.5 h-2 bg-[#155EEF]/20 border border-[#60A5FA]/40 rounded-xs" />
              <span className="text-[#9DDFF2] text-[11px]">95% Confidence Band</span>
            </div>

            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30">
              <span className="w-2.5 h-[1.5px] bg-[#EF4444]" />
              <span className="text-[#EF4444] text-[11px] font-semibold">500 Bed Capacity Limit</span>
            </div>
          </div>
        </div>

        {/* The Main Chart Instrument Container */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0D1117] p-4 sm:p-6 relative">
          <ForecastChart selectedDay={selectedDay} onSelectDay={onSelectDay} />

          {/* Middle Telemetry Readout */}
          <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-[#A7ADB5]">
            <div className="flex flex-wrap items-center gap-4">
              <span>
                SELECTED VIEW:{' '}
                <strong className="text-[#F4F3EF] uppercase">{forecastData.label}</strong>
              </span>
              <span>•</span>
              <span>
                EXPECTED ADMISSIONS:{' '}
                <strong className="text-[#F4F3EF] tabular-nums">
                  {forecastData.totalAdmittedPatients} PATIENTS
                </strong>
              </span>
              <span>•</span>
              <span>
                CAPACITY STATUS:{' '}
                <strong
                  className={`tabular-nums ${
                    forecastData.capacityThreshold - forecastData.totalAdmittedPatients < 0
                      ? 'text-[#EF4444]'
                      : 'text-[#60A5FA]'
                  }`}
                >
                  {forecastData.capacityThreshold - forecastData.totalAdmittedPatients >= 0 ? '+' : ''}
                  {forecastData.capacityThreshold - forecastData.totalAdmittedPatients} BEDS MARGIN
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#A7ADB5]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF]" />
              Continuous Predictive Synchronization Active
            </div>
          </div>
        </div>

        {/* 6-Stage Clinical Storytelling Ribbon: "Film Pacing" */}
        <div className="mt-6">
          <div className="text-[10px] font-mono tracking-widest text-[#66707C] uppercase font-bold mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" />
            CLINICAL PROJECTION NARRATIVE • 6-STAGE EVENT HORIZON
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {STORY_STAGES.map((stage) => {
              const isActive = selectedDay === stage.day;
              const isBreachStage = stage.step === '03' || stage.step === '04';

              return (
                <button
                  key={stage.step}
                  onClick={() => {
                    onSelectDay(stage.day);
                    if (stage.step === '06') {
                      onOpenCoordination();
                    }
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isActive
                      ? isBreachStage
                        ? 'bg-[#1A1012] border-[#EF4444]/60 ring-1 ring-[#EF4444]/30'
                        : 'bg-[#151B23] border-white/30 ring-1 ring-white/10'
                      : isBreachStage
                      ? 'bg-[#0D1117] border-[#EF4444]/25 hover:border-[#EF4444]/40'
                      : 'bg-[#0D1117] border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[9px] font-mono font-bold text-[#66707C] uppercase">
                        PHASE {stage.step}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold uppercase ${
                          isActive
                            ? isBreachStage
                              ? 'text-[#EF4444]'
                              : 'text-[#60A5FA]'
                            : 'text-[#A7ADB5]'
                        }`}
                      >
                        {stage.title}
                      </span>
                    </div>

                    <div
                      className={`text-xs font-mono font-black uppercase mt-1 leading-snug ${
                        isBreachStage ? 'text-[#EF4444]' : 'text-[#F4F3EF]'
                      }`}
                    >
                      {stage.headline}
                    </div>

                    <p className="text-[10px] font-mono text-[#A7ADB5] mt-1.5 leading-tight">
                      {stage.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[9px] font-mono text-[#66707C]">
                    <span>VIEW {stage.day}</span>
                    <ArrowRight className="w-3 h-3 text-[#60A5FA]" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
