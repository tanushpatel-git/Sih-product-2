'use client';

import React from 'react';
import { TimelineDayId, DayForecastPoint } from '@/lib/types';
import { ChevronRight } from 'lucide-react';

interface ResourceUtilizationProps {
  selectedDay: TimelineDayId;
  forecastData: DayForecastPoint;
  onOpenCoordination: () => void;
}

export const ResourceUtilization: React.FC<ResourceUtilizationProps> = ({
  selectedDay,
  forecastData,
  onOpenCoordination,
}) => {
  const isBreach = forecastData.isBreach;

  // 5 Resources data matching reference
  const resources = [
    {
      id: 'icu',
      name: 'ICU Beds',
      percentage: isBreach ? 92 : 82,
      current: isBreach ? 73 : 66,
      total: 80,
      unit: '',
      color: isBreach ? '#EF4444' : '#DC2626',
      trackColor: '#FEE2E2',
      sparklineColor: '#EF4444',
      sparklinePath: 'M0,18 Q12,14 24,16 T48,10 T72,4',
    },
    {
      id: 'general',
      name: 'General Beds',
      percentage: 76,
      current: 456,
      total: 600,
      unit: '',
      color: '#2563EB',
      trackColor: '#DBEAFE',
      sparklineColor: '#2563EB',
      sparklinePath: 'M0,16 Q12,12 24,14 T48,12 T72,8',
    },
    {
      id: 'ventilators',
      name: 'Ventilators',
      percentage: 68,
      current: 34,
      total: 50,
      unit: '',
      color: '#0D9488',
      trackColor: '#CCFBF1',
      sparklineColor: '#0D9488',
      sparklinePath: 'M0,14 Q12,16 24,12 T48,10 T72,12',
    },
    {
      id: 'oxygen',
      name: 'Oxygen Supply',
      percentage: 83,
      current: '12,480',
      total: '15,000 L',
      unit: '',
      color: '#10B981',
      trackColor: '#D1FAE5',
      sparklineColor: '#10B981',
      sparklinePath: 'M0,12 Q12,14 24,10 T48,14 T72,6',
    },
    {
      id: 'ambulances',
      name: 'Ambulances',
      percentage: 60,
      current: 9,
      total: 15,
      unit: '',
      color: '#6366F1',
      trackColor: '#E0E7FF',
      sparklineColor: '#6366F1',
      sparklinePath: 'M0,15 Q12,10 24,15 T48,8 T72,11',
    },
  ];

  return (
    <div id="section-resources" className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E2E8F0] p-5 lg:p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]/80 mb-5">
        <h2 className="text-base font-bold font-sans text-[#0F172A]">
          Resource Utilization
        </h2>
        <button
          onClick={onOpenCoordination}
          className="text-xs font-medium text-[#2563EB] hover:text-blue-700 flex items-center gap-1"
        >
          <span>View all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5 Circular Gauge Columns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
        {resources.map((item) => {
          // Circumference for r=32 is 2 * PI * 32 = 201.06
          const radius = 28;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (item.percentage / 100) * circumference;

          return (
            <div key={item.id} className="flex flex-col items-center text-center">
              {/* Circular Gauge */}
              <div className="relative w-20 h-20 flex items-center justify-center mb-2">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 68 68">
                  {/* Background Track */}
                  <circle
                    cx="34"
                    cy="34"
                    r={radius}
                    fill="none"
                    stroke={item.trackColor}
                    strokeWidth="5"
                  />
                  {/* Progress Ring */}
                  <circle
                    cx="34"
                    cy="34"
                    r={radius}
                    fill="none"
                    stroke={item.color}
                    strokeWidth="5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>

                {/* Centered Percentage & Fraction */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-sm font-extrabold font-sans text-[#0F172A] tabular-nums">
                    {item.percentage}%
                  </span>
                  <span className="text-[9px] text-[#64748B] font-mono">
                    {item.current}/{typeof item.total === 'number' ? item.total : item.total.split(' ')[0]}
                  </span>
                </div>
              </div>

              {/* Resource Label */}
              <div className="text-xs font-semibold text-[#0F172A] mb-0.5">
                {item.name}
              </div>

              {/* Ratio text */}
              <div className="text-[11px] text-[#64748B] font-mono mb-2">
                {item.current} / {item.total}
              </div>

              {/* Mini Sparkline Graph */}
              <div className="w-16 h-5">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 72 20">
                  <path
                    d={item.sparklinePath}
                    fill="none"
                    stroke={item.sparklineColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
