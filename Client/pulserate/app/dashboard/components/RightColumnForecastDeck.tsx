'use client';

import React from 'react';
import { TimelineDayId, DayForecastPoint } from '@/lib/types';
import {
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Building2,
  Shield,
  Activity,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface RightColumnForecastDeckProps {
  selectedDay: TimelineDayId;
  forecastData: DayForecastPoint;
  onOpenCoordination: (preselectedHospitalId?: string) => void;
}

export const RightColumnForecastDeck: React.FC<RightColumnForecastDeckProps> = ({
  selectedDay,
  forecastData,
  onOpenCoordination,
}) => {
  const isBreach = forecastData.isBreach;
  const shortageBeds = Math.max(13, forecastData.resources.icu.shortageDelta);

  return (
    <div className="space-y-5">
      {/* 1. 7-DAY FORECAST CARD */}
      <div id="section-forecast" className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E2E8F0] p-5 shadow-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]/80 mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold font-sans text-[#0F172A]">
              7-Day Forecast
            </h2>
          </div>
          <button
            onClick={() => onOpenCoordination()}
            className="text-xs font-medium text-[#2563EB] hover:text-blue-700 flex items-center gap-1"
          >
            <span>View details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#64748B] mb-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#2563EB]" />
            <span>Projected Demand</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 border-b border-dashed border-[#94A3B8]" />
            <span>Capacity (90)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2 rounded-xs bg-[#DBEAFE]/60 border border-[#93C5FD]" />
            <span>Confidence Range</span>
          </div>
        </div>

        {/* Interactive SVG Spline Forecast Chart */}
        <div className="relative w-full h-[140px] select-none">
          <svg viewBox="0 0 360 140" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="forecastAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines with Y-Axis values */}
            <line x1="28" y1="20" x2="355" y2="20" stroke="#F1F5F9" strokeWidth="1" />
            <text x="5" y="24" className="text-[9px] fill-[#94A3B8] font-mono">150</text>

            <line x1="28" y1="55" x2="355" y2="55" stroke="#F1F5F9" strokeWidth="1" />
            <text x="5" y="59" className="text-[9px] fill-[#94A3B8] font-mono">100</text>

            <line x1="28" y1="90" x2="355" y2="90" stroke="#F1F5F9" strokeWidth="1" />
            <text x="5" y="94" className="text-[9px] fill-[#94A3B8] font-mono">50</text>

            <line x1="28" y1="120" x2="355" y2="120" stroke="#E2E8F0" strokeWidth="1" />
            <text x="10" y="124" className="text-[9px] fill-[#94A3B8] font-mono">0</text>

            {/* Hospital Licensed Capacity Line (Dashed grey line at y = 62) */}
            <line
              x1="28"
              y1="62"
              x2="355"
              y2="62"
              stroke="#94A3B8"
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />

            {/* 95% Confidence Shaded Area */}
            <path
              d="M 35,105 C 75,98 125,85 180,72 C 235,55 285,38 340,32 L 340,55 C 285,62 235,80 180,95 C 125,108 75,115 35,118 Z"
              fill="url(#forecastAreaGrad)"
            />

            {/* Projected Demand Spline Curve (Rising blue line) */}
            <path
              d="M 35,112 C 85,104 135,92 185,78 C 235,62 285,46 340,40"
              fill="none"
              stroke="#2563EB"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Day 4 (May 8) Critical Breach Vertical Dashed Marker */}
            <line
              x1="285"
              y1="20"
              x2="285"
              y2="120"
              stroke="#EF4444"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            {/* Intersection Point */}
            <circle cx="285" cy="46" r="4" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />

            {/* Floating Breach Tooltip Badge */}
            <g transform="translate(285, 22)">
              <rect
                x="-95"
                y="-18"
                width="125"
                height="22"
                rx="6"
                fill="#1E293B"
                className="shadow-md"
              />
              <path d="M -5,4 L 0,8 L 5,4 Z" fill="#1E293B" />
              <text
                x="-32"
                y="-4"
                textAnchor="middle"
                className="text-[9px] font-sans font-bold fill-white"
              >
                ⚠️ ICU breach in 4 days
              </text>
              <text
                x="-32"
                y="8"
                textAnchor="middle"
                className="text-[8px] font-mono fill-[#FCA5A5]"
              >
                103 / 90 beds
              </text>
            </g>

            {/* X-Axis Day Labels */}
            <text x="35" y="134" textAnchor="middle" className="text-[8px] fill-[#64748B]">May 4</text>
            <text x="85" y="134" textAnchor="middle" className="text-[8px] fill-[#64748B]">May 5</text>
            <text x="135" y="134" textAnchor="middle" className="text-[8px] fill-[#64748B]">May 6</text>
            <text x="185" y="134" textAnchor="middle" className="text-[8px] fill-[#64748B]">May 7</text>
            <text x="235" y="134" textAnchor="middle" className="text-[8px] fill-[#EF4444] font-bold">May 8</text>
            <text x="285" y="134" textAnchor="middle" className="text-[8px] fill-[#64748B]">May 9</text>
            <text x="340" y="134" textAnchor="middle" className="text-[8px] fill-[#64748B]">May 10</text>
          </svg>
        </div>
      </div>

      {/* 2. UPCOMING RISK ALERT CARD */}
      <div id="section-risk" className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E2E8F0] p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#FEE2E2] flex items-center justify-center text-[#EF4444]">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-bold text-[#0F172A]">Upcoming Risk</span>
        </div>

        <div className="space-y-1 mb-3">
          <div className="text-xs font-bold text-[#0F172A]">
            ICU Capacity Breach
          </div>
          <div className="text-[11px] text-[#64748B]">
            Projected in 4 days (May 8)
          </div>
        </div>

        {/* Large +13 Red Stat & Bar */}
        <div className="space-y-2 mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-sans text-[#EF4444] tabular-nums">
              +{shortageBeds}
            </span>
            <span className="text-xs font-medium text-[#EF4444]">Beds short</span>
          </div>

          {/* Progress track */}
          <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
            <div className="h-full rounded-full bg-[#EF4444] w-[88%]" />
          </div>

          <div className="flex justify-between items-center text-[10px] text-[#64748B]">
            <span>103 / 90</span>
            <span>Projected / Capacity</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onOpenCoordination()}
          className="w-full py-2 px-3 rounded-xl border border-[#E2E8F0] hover:border-[#2563EB] bg-white hover:bg-[#EFF6FF] text-xs font-bold text-[#2563EB] transition-all flex items-center justify-center gap-1.5 shadow-xs"
        >
          <span>Take Action</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. NEARBY HOSPITALS (Regional Network Grid) */}
      <div id="section-network" className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E2E8F0] p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]/80 mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold font-sans text-[#0F172A]">
              Nearby Hospitals
            </h2>
          </div>
          <button
            onClick={() => onOpenCoordination()}
            className="text-xs font-medium text-[#2563EB] hover:text-blue-700 flex items-center gap-1"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Facility 1 */}
          <div
            onClick={() => onOpenCoordination('hosp-b-civil')}
            className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-[#E2E8F0] transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center text-[#16A34A]">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#0F172A]">
                  Civil Hospital Bhopal
                </div>
                <div className="text-[11px] font-medium text-[#16A34A]">
                  18 ICU available
                </div>
              </div>
            </div>
            <span className="text-xs font-medium text-[#64748B]">12 km</span>
          </div>

          {/* Facility 2: AIIMS Bhopal (Highlighted Recommended Receiving Partner) */}
          <div
            onClick={() => onOpenCoordination('hosp-a-aiims')}
            className="p-2.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] hover:border-[#3B82F6] transition-all cursor-pointer flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shadow-xs">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#1E3A8A]">
                    AIIMS Bhopal
                  </span>
                  <span className="text-[9px] font-bold bg-[#DBEAFE] text-[#1E40AF] px-1.5 py-0.2 rounded">
                    RECOMMENDED
                  </span>
                </div>
                <div className="text-[11px] font-bold text-[#2563EB]">
                  24 ICU available
                </div>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#1E40AF]">15 km</span>
          </div>

          {/* Facility 3 */}
          <div
            onClick={() => onOpenCoordination('hosp-c-sanjeevani')}
            className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-[#E2E8F0] transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#475569]">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#0F172A]">
                  Sanjeevani Hospital
                </div>
                <div className="text-[11px] font-medium text-[#475569]">
                  6 ICU available
                </div>
              </div>
            </div>
            <span className="text-xs font-medium text-[#64748B]">8 km</span>
          </div>
        </div>
      </div>

      {/* 4. KEY INSIGHTS / DISEASE INTELLIGENCE */}
      <div id="section-insights" className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E2E8F0] p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]/80 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2563EB]" />
            <h2 className="text-sm font-bold font-sans text-[#0F172A]">
              Key Insights
            </h2>
          </div>
          <button className="text-xs font-medium text-[#2563EB] hover:text-blue-700 flex items-center gap-1">
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5 text-xs">
          {/* Item 1 */}
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center text-[10px] font-bold">
                🦠
              </div>
              <div>
                <div className="font-semibold text-[#0F172A]">COVID-19</div>
                <div className="text-[10px] text-[#64748B]">Confidence 87%</div>
              </div>
            </div>
            <span className="text-[#059669] font-bold">↑</span>
          </div>

          {/* Item 2 */}
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center text-[10px] font-bold">
                💧
              </div>
              <div>
                <div className="font-semibold text-[#0F172A]">Influenza A/H1N1</div>
                <div className="text-[10px] text-[#64748B]">Confidence 72%</div>
              </div>
            </div>
            <span className="text-[#2563EB] font-bold">↑</span>
          </div>

          {/* Item 3 */}
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center text-[10px] font-bold">
                🦟
              </div>
              <div>
                <div className="font-semibold text-[#0F172A]">Dengue</div>
                <div className="text-[10px] text-[#64748B]">Confidence 64%</div>
              </div>
            </div>
            <span className="text-[#D97706] font-bold">—</span>
          </div>

          {/* Item 4 */}
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#F3E8FF] text-[#7E22CE] flex items-center justify-center text-[10px] font-bold">
                🫁
              </div>
              <div>
                <div className="font-semibold text-[#0F172A]">RSV</div>
                <div className="text-[10px] text-[#64748B]">Confidence 58%</div>
              </div>
            </div>
            <span className="text-[#7E22CE] font-bold">↑</span>
          </div>
        </div>
      </div>
    </div>
  );
};
