'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { TimelineDayId, DayForecastPoint } from '@/lib/types';
import { DIGITAL_TWIN_BASE_ZONES } from '@/lib/mockData';
import {
  Compass,
  Plus,
  Minus,
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  X,
  BedDouble,
  Wind,
  Users,
  Building,
} from 'lucide-react';

interface DigitalTwinProps {
  selectedDay: TimelineDayId;
  forecastData: DayForecastPoint;
  onOpenCoordination: () => void;
  onViewForecast: () => void;
}

export const DigitalTwin: React.FC<DigitalTwinProps> = ({
  selectedDay,
  forecastData,
  onOpenCoordination,
  onViewForecast,
}) => {
  const [activeView, setActiveView] = useState<'hospital' | 'department'>('hospital');
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>('icu');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const isBreach = forecastData.isBreach;
  const icuShortage = Math.max(0, forecastData.resources.icu.shortageDelta);
  const icuOccupancy = isBreach
    ? 118
    : Math.min(100, Math.round((forecastData.resources.icu.projectedDemand / forecastData.resources.icu.totalCapacity) * 100));

  const selectedZoneData = DIGITAL_TWIN_BASE_ZONES.find((z) => z.id === selectedDeptId) || DIGITAL_TWIN_BASE_ZONES[0];

  return (
    <section className="w-full bg-white/70 backdrop-blur-md rounded-2xl border border-[#E2E8F0] p-4 sm:p-6 shadow-xs relative overflow-hidden mb-6">
      {/* 2.5D Isometric Architectural Campus Viewport */}
      <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[520px] rounded-xl overflow-hidden bg-[#F1F5F9] border border-[#E2E8F0]/80">
        {/* Realistic Architectural Isometric Base Campus Image */}
        <div
          className="absolute inset-0 transition-transform duration-500 origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <Image
            src="/hospital_campus_isometric.jpg"
            alt="Bhopal District Hospital Digital Twin Campus"
            fill
            priority
            className="object-cover object-center select-none pointer-events-none"
          />
        </div>

        {/* Soft Ambient Vignette for Depth & Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-white/10 pointer-events-none" />

        {/* ========================================================= */}
        {/* INTERACTIVE VOLUMETRIC PINS & ANNOTATIONS WITH LEADER LINES */}
        {/* ========================================================= */}

        {/* 1. ICU Pin & Volumetric Highlight (Tower Upper Level) */}
        <div
          className="absolute z-20 transition-all duration-300 cursor-pointer group"
          style={{ top: '22%', left: '46%' }}
          onClick={() => setSelectedDeptId('icu')}
        >
          {/* Volumetric Glowing Shroud */}
          <div
            className={`absolute -inset-8 rounded-2xl transition-opacity pointer-events-none ${
              isBreach
                ? 'bg-red-500/25 animate-pulse ring-2 ring-red-500/40'
                : 'bg-rose-500/15 group-hover:bg-rose-500/25'
            }`}
          />

          {/* Leader Line to Roof / Floor Plate */}
          <svg className="absolute -left-6 -top-10 w-16 h-14 pointer-events-none overflow-visible">
            <line
              x1="20"
              y1="4"
              x2="48"
              y2="40"
              stroke={isBreach ? '#EF4444' : '#DC2626'}
              strokeWidth="1.5"
              strokeDasharray={isBreach ? '2 2' : 'none'}
            />
            <circle cx="48" cy="40" r="3" fill={isBreach ? '#EF4444' : '#DC2626'} />
          </svg>

          {/* Department Floating Pill Badge */}
          <div
            className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg font-sans text-xs font-bold shadow-md transition-transform group-hover:scale-105 ${
              isBreach
                ? 'bg-[#EF4444] text-white ring-2 ring-red-300'
                : 'bg-[#DC2626] text-white'
            }`}
          >
            <span>ICU</span>
            <span className="font-extrabold">{icuOccupancy}%</span>
            {isBreach ? (
              <span className="text-[10px] uppercase tracking-wider bg-white/20 px-1 py-0.2 rounded font-black">
                +{icuShortage} SHORT
              </span>
            ) : (
              <span className="text-amber-200">⚡</span>
            )}
          </div>
        </div>

        {/* 2. Emergency Wing Pin (Ground Floor, Front Left Bay) */}
        <div
          className="absolute z-20 transition-all duration-300 cursor-pointer group"
          style={{ top: '56%', left: '26%' }}
          onClick={() => setSelectedDeptId('emergency')}
        >
          {/* Volumetric Amber Wash */}
          <div className="absolute -inset-7 rounded-2xl bg-amber-500/15 pointer-events-none group-hover:bg-amber-500/25 transition-all" />

          {/* Leader Line to Canopy */}
          <svg className="absolute -left-4 -top-8 w-14 h-12 pointer-events-none overflow-visible">
            <line x1="16" y1="6" x2="38" y2="34" stroke="#D97706" strokeWidth="1.5" />
            <circle cx="38" cy="34" r="3" fill="#D97706" />
          </svg>

          {/* Badge */}
          <div className="relative flex items-center gap-1.5 px-3 py-1.2 rounded-lg bg-[#F59E0B] text-white font-sans text-xs font-bold shadow-md transition-transform group-hover:scale-105">
            <span>Emergency</span>
            <span className="font-extrabold">78%</span>
          </div>
        </div>

        {/* 3. Inpatient General Wards Pin (Mid Tower) */}
        <div
          className="absolute z-20 transition-all duration-300 cursor-pointer group"
          style={{ top: '32%', left: '55%' }}
          onClick={() => setSelectedDeptId('general_wards')}
        >
          {/* Volumetric Blue Wash */}
          <div className="absolute -inset-6 rounded-2xl bg-blue-500/15 pointer-events-none group-hover:bg-blue-500/25 transition-all" />

          {/* Leader Line */}
          <svg className="absolute -left-4 -top-8 w-14 h-12 pointer-events-none overflow-visible">
            <line x1="14" y1="6" x2="34" y2="34" stroke="#2563EB" strokeWidth="1.5" />
            <circle cx="34" cy="34" r="3" fill="#2563EB" />
          </svg>

          {/* Badge */}
          <div className="relative flex items-center gap-1.5 px-3 py-1.2 rounded-lg bg-[#2563EB] text-white font-sans text-xs font-bold shadow-md transition-transform group-hover:scale-105">
            <span>Wards</span>
            <span className="font-extrabold">65%</span>
            <span className="text-[10px]">→</span>
          </div>
        </div>

        {/* 4. Diagnostics & Outpatient OPD Pin (East Wing) */}
        <div
          className="absolute z-20 transition-all duration-300 cursor-pointer group"
          style={{ top: '44%', left: '68%' }}
          onClick={() => setSelectedDeptId('isolation')}
        >
          {/* Volumetric Teal Wash */}
          <div className="absolute -inset-6 rounded-2xl bg-teal-500/15 pointer-events-none group-hover:bg-teal-500/25 transition-all" />

          {/* Leader Line */}
          <svg className="absolute -left-4 -top-8 w-14 h-12 pointer-events-none overflow-visible">
            <line x1="14" y1="6" x2="34" y2="34" stroke="#0D9488" strokeWidth="1.5" />
            <circle cx="34" cy="34" r="3" fill="#0D9488" />
          </svg>

          {/* Badge */}
          <div className="relative flex items-center gap-1.5 px-3 py-1.2 rounded-lg bg-[#0D9488] text-white font-sans text-xs font-bold shadow-md transition-transform group-hover:scale-105">
            <span>Diagnostics</span>
            <span className="font-extrabold">54%</span>
          </div>
        </div>

        {/* 5. Main Entrance Marker */}
        <div
          className="absolute z-20 pointer-events-none"
          style={{ top: '70%', left: '42%' }}
        >
          <div className="px-2.5 py-0.5 rounded-full bg-white/95 text-[#475569] border border-[#CBD5E1] font-sans text-[10px] font-semibold shadow-xs">
            Main Entrance
          </div>
        </div>

        {/* ========================================================= */}
        {/* OVERLAY CONTROLS (Exact layout from reference image) */}
        {/* ========================================================= */}

        {/* Top Right: Zone Status Legend Card */}
        <div className="absolute top-4 right-4 z-20 p-3 rounded-xl bg-white/90 backdrop-blur-md border border-[#E2E8F0] shadow-sm text-xs font-sans">
          <div className="text-[11px] font-bold text-[#0F172A] mb-2">Zone Status</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[#475569]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
              <span className="text-[11px]">Critical (ICU)</span>
            </div>
            <div className="flex items-center gap-2 text-[#475569]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <span className="text-[11px]">High (Emergency)</span>
            </div>
            <div className="flex items-center gap-2 text-[#475569]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
              <span className="text-[11px]">Watch (Wards)</span>
            </div>
            <div className="flex items-center gap-2 text-[#475569]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <span className="text-[11px]">Normal (Diagnostics)</span>
            </div>
          </div>
        </div>

        {/* Bottom Left: Hospital View / Department View Toggle */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 p-1 rounded-full bg-white/90 backdrop-blur-md border border-[#E2E8F0] shadow-xs">
          <button
            onClick={() => setActiveView('hospital')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
              activeView === 'hospital'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Hospital View
          </button>
          <button
            onClick={() => setActiveView('department')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
              activeView === 'department'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Department View
          </button>
        </div>

        {/* Bottom Right: Compass & Zoom Controls */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col items-center gap-1.5">
          {/* Compass Icon */}
          <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md border border-[#E2E8F0] shadow-xs flex items-center justify-center text-[#64748B]">
            <Compass className="w-4 h-4 text-[#2563EB]" />
          </div>

          {/* Zoom Buttons */}
          <div className="flex flex-col rounded-lg bg-white/90 backdrop-blur-md border border-[#E2E8F0] shadow-xs overflow-hidden">
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <div className="w-full h-px bg-[#E2E8F0]" />
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.9, z - 0.1))}
              className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Critical Capacity Breach Overlay Strip if breached */}
        {isBreach && (
          <div className="absolute top-4 left-4 z-20 max-w-sm p-3 rounded-xl bg-red-600/90 backdrop-blur-md text-white shadow-lg border border-red-400">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-white animate-bounce" />
              <span className="text-xs font-bold uppercase tracking-wider">
                ICU CAPACITY BREACH PREDICTED
              </span>
            </div>
            <p className="text-[11px] text-white/90 leading-tight">
              Bhopal District Hospital ICU will exceed licensed capacity by{' '}
              <strong className="text-white underline font-bold">+{icuShortage} beds</strong> on this date.
            </p>
            <button
              onClick={onOpenCoordination}
              className="mt-2 w-full py-1 px-2.5 rounded-lg bg-white text-[#DC2626] font-bold text-xs hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>COORDINATE WITH AIIMS BHOPAL</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Selected Department Live Telemetry Drawer / Tray */}
      {selectedDeptId && (
        <div className="mt-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#2563EB] shadow-xs">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#0F172A]">
                  {selectedZoneData.name}
                </span>
                <span className="text-xs text-[#64748B]">• {selectedZoneData.floor}</span>
              </div>
              <div className="text-xs text-[#475569] mt-0.5 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <BedDouble className="w-3 h-3 text-[#94A3B8]" />
                  <span>Occupancy: {selectedZoneData.currentOccupancy} / {selectedZoneData.maxCapacity}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Wind className="w-3 h-3 text-[#94A3B8]" />
                  <span>HVAC: {selectedZoneData.telemetry.temperature}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#94A3B8]" />
                  <span>Staff: {selectedZoneData.telemetry.staffRatio}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={onViewForecast}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-xs font-semibold text-[#2563EB] hover:bg-slate-50 transition-colors"
            >
              View Full 7-Day Trend
            </button>
            <button
              onClick={onOpenCoordination}
              className="px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
            >
              Transfer Routing
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
