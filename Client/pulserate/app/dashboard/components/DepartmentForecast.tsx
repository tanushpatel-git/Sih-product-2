'use client';

import React, { useState } from 'react';
import { TimelineDayId, DayForecastPoint } from '@/lib/types';

interface DepartmentForecastProps {
  selectedDay: TimelineDayId;
  forecastData: DayForecastPoint;
}

export const DepartmentForecast: React.FC<DepartmentForecastProps> = ({
  selectedDay,
  forecastData,
}) => {
  const [selectedDept, setSelectedDept] = useState<'icu' | 'emergency' | 'wards' | 'diagnostics'>('icu');

  const deptTabs = [
    { id: 'icu', label: 'ICU' },
    { id: 'emergency', label: 'Emergency' },
    { id: 'wards', label: 'Wards' },
    { id: 'diagnostics', label: 'Diagnostics' },
  ];

  // Specific curves per department
  const curves: Record<string, { path: string; capacityY: number; breachX: number; breachY: number }> = {
    icu: {
      path: 'M 35,115 C 85,110 135,100 185,82 C 235,62 285,46 340,40',
      capacityY: 65,
      breachX: 285,
      breachY: 46,
    },
    emergency: {
      path: 'M 35,95 C 85,85 135,88 185,76 C 235,70 285,60 340,58',
      capacityY: 55,
      breachX: 300,
      breachY: 59,
    },
    wards: {
      path: 'M 35,100 C 85,95 135,90 185,84 C 235,78 285,72 340,68',
      capacityY: 50,
      breachX: 340,
      breachY: 68,
    },
    diagnostics: {
      path: 'M 35,118 C 85,115 135,110 185,104 C 235,96 285,90 340,84',
      capacityY: 60,
      breachX: -1,
      breachY: -1,
    },
  };

  const activeCurve = curves[selectedDept];

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E2E8F0] p-5 lg:p-6 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header & Department Switcher Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]/80 mb-3">
          <h2 className="text-base font-bold font-sans text-[#0F172A]">
            Department Forecast
          </h2>

          {/* Department Filter Pills */}
          <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-lg">
            {deptTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedDept(tab.id as any)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  selectedDept === tab.id
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-[#64748B] mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#2563EB]" />
            <span>Demand</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-b border-dashed border-[#94A3B8]" />
            <span>Capacity</span>
          </div>
        </div>

        {/* Interactive SVG Chart */}
        <div className="relative w-full h-[145px] select-none">
          <svg viewBox="0 0 360 145" className="w-full h-full overflow-visible">
            {/* Grid lines with Y-Axis values */}
            <line x1="28" y1="20" x2="355" y2="20" stroke="#F1F5F9" strokeWidth="1" />
            <text x="5" y="24" className="text-[9px] fill-[#94A3B8] font-mono">150</text>

            <line x1="28" y1="55" x2="355" y2="55" stroke="#F1F5F9" strokeWidth="1" />
            <text x="5" y="59" className="text-[9px] fill-[#94A3B8] font-mono">100</text>

            <line x1="28" y1="90" x2="355" y2="90" stroke="#F1F5F9" strokeWidth="1" />
            <text x="5" y="94" className="text-[9px] fill-[#94A3B8] font-mono">50</text>

            <line x1="28" y1="125" x2="355" y2="125" stroke="#E2E8F0" strokeWidth="1" />
            <text x="10" y="129" className="text-[9px] fill-[#94A3B8] font-mono">0</text>

            {/* Capacity Threshold Line */}
            <line
              x1="28"
              y1={activeCurve.capacityY}
              x2="355"
              y2={activeCurve.capacityY}
              stroke="#94A3B8"
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />

            {/* Demand Spline Line */}
            <path
              d={activeCurve.path}
              fill="none"
              stroke="#2563EB"
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* Breach Marker */}
            {activeCurve.breachX > 0 && (
              <>
                <line
                  x1={activeCurve.breachX}
                  y1="20"
                  x2={activeCurve.breachX}
                  y2="125"
                  stroke="#EF4444"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={activeCurve.breachX}
                  cy={activeCurve.breachY}
                  r="4"
                  fill="#EF4444"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              </>
            )}

            {/* X-Axis Labels */}
            <text x="35" y="138" textAnchor="middle" className="text-[8px] fill-[#64748B]">May 4</text>
            <text x="85" y="138" textAnchor="middle" className="text-[8px] fill-[#64748B]">May 5</text>
            <text x="135" y="138" textAnchor="middle" className="text-[8px] fill-[#64748B]">May 6</text>
            <text x="185" y="138" textAnchor="middle" className="text-[8px] fill-[#64748B]">May 7</text>
            <text x="235" y="138" textAnchor="middle" className="text-[8px] fill-[#EF4444] font-bold">May 8</text>
            <text x="285" y="138" textAnchor="middle" className="text-[8px] fill-[#64748B]">May 9</text>
            <text x="340" y="138" textAnchor="middle" className="text-[8px] fill-[#64748B]">May 10</text>
          </svg>
        </div>
      </div>
    </div>
  );
};
