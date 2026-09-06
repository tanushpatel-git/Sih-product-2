'use client';

import React, { useState } from 'react';
import { TimelineDayId, DayForecastPoint, RiskLevel } from '../../../../lib/types';
import { DIGITAL_TWIN_BASE_ZONES } from '../../../../lib/mockData';
import { Layers, ShieldAlert, Cpu, CheckCircle2, ChevronRight, Eye } from 'lucide-react';

interface DigitalTwinProps {
  selectedDay: TimelineDayId;
  forecastData: DayForecastPoint;
}

export const DigitalTwin: React.FC<DigitalTwinProps> = ({
  selectedDay,
  forecastData,
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>('icu');

  // Compute dynamic zone risk based on timeline progression
  const getZoneStatus = (zoneId: string) => {
    const isBreach = forecastData.isBreach;
    const offset = forecastData.dayOffset;

    if (zoneId === 'icu') {
      if (forecastData.resources.icu.shortageDelta > 0) {
        return {
          risk: 'CRITICAL' as RiskLevel,
          utilization: Math.round((forecastData.resources.icu.projectedDemand / 50) * 100),
          fill: '#EF4444',
          stroke: '#EF4444',
          glow: 'drop-shadow(0 0 16px rgba(239, 68, 68, 0.6))',
          badge: `BREACH: +${forecastData.resources.icu.shortageDelta} SHORTAGE`,
        };
      }
      if (offset >= 3) {
        return {
          risk: 'HIGH' as RiskLevel,
          utilization: 100,
          fill: '#F97316',
          stroke: '#F97316',
          glow: 'drop-shadow(0 0 10px rgba(249, 115, 22, 0.4))',
          badge: 'CAPACITY SATURATED',
        };
      }
      return {
        risk: 'WATCH' as RiskLevel,
        utilization: 82,
        fill: '#F59E0B',
        stroke: '#F59E0B',
        glow: 'none',
        badge: '82% OCCUPANCY',
      };
    }

    if (zoneId === 'emergency') {
      if (offset >= 4) {
        return {
          risk: 'CRITICAL' as RiskLevel,
          utilization: 96,
          fill: '#EF4444',
          stroke: '#EF4444',
          glow: 'none',
          badge: 'TRIAGE DIVERSION',
        };
      }
      return {
        risk: 'WATCH' as RiskLevel,
        utilization: 76 + offset * 4,
        fill: '#D3FD50',
        stroke: '#D3FD50',
        glow: 'none',
        badge: `${76 + offset * 4}% FLOW`,
      };
    }

    if (zoneId === 'general_wards') {
      const occ = Math.min(100, 82 + offset * 3);
      return {
        risk: occ >= 95 ? ('HIGH' as RiskLevel) : ('WATCH' as RiskLevel),
        utilization: occ,
        fill: occ >= 95 ? '#F97316' : '#9CA3AF',
        stroke: occ >= 95 ? '#F97316' : '#9CA3AF',
        glow: 'none',
        badge: `${occ}% OCCUPIED`,
      };
    }

    if (zoneId === 'ventilator_storage') {
      if (forecastData.resources.ventilators.shortageDelta > 0) {
        return {
          risk: 'CRITICAL' as RiskLevel,
          utilization: 100,
          fill: '#EF4444',
          stroke: '#EF4444',
          glow: 'none',
          badge: `DEPLETED (+${forecastData.resources.ventilators.shortageDelta} REQ)`,
        };
      }
      return {
        risk: 'WATCH' as RiskLevel,
        utilization: 90,
        fill: '#F59E0B',
        stroke: '#F59E0B',
        glow: 'none',
        badge: '2 RESERVES LEFT',
      };
    }

    if (zoneId === 'oxygen_substation') {
      if (forecastData.resources.oxygen.daysRemaining <= 2.5) {
        return {
          risk: 'CRITICAL' as RiskLevel,
          utilization: forecastData.resources.oxygen.projectedPercentage,
          fill: '#EF4444',
          stroke: '#EF4444',
          glow: 'none',
          badge: `${forecastData.resources.oxygen.daysRemaining.toFixed(1)}d TO EMPTY`,
        };
      }
      return {
        risk: 'STABLE' as RiskLevel,
        utilization: forecastData.resources.oxygen.projectedPercentage,
        fill: '#D3FD50',
        stroke: '#D3FD50',
        glow: 'none',
        badge: `${forecastData.resources.oxygen.projectedPercentage}% PRESSURE`,
      };
    }

    // Default neutral zones (Isolation, Pharmacy)
    return {
      risk: 'STABLE' as RiskLevel,
      utilization: 75,
      fill: '#9CA3AF',
      stroke: '#9CA3AF',
      glow: 'none',
      badge: 'STABLE',
    };
  };

  const activeZone =
    DIGITAL_TWIN_BASE_ZONES.find((z) => z.id === selectedZoneId) || DIGITAL_TWIN_BASE_ZONES[0];
  const activeZoneStatus = getZoneStatus(activeZone.id);

  return (
    <section className="w-full border-b border-white/[0.08] bg-[#090A0C] p-4 lg:p-8">
      <div className="max-w-[1720px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#D3FD50]" />
              <span className="text-xs font-mono tracking-widest text-[#D3FD50] uppercase font-bold">
                PHYSICAL FACILITY DIGITAL TWIN
              </span>
              <span className="text-[10px] font-mono text-white/40 uppercase">
                • 2.5D ISOMETRIC SCHEMATIC
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black font-mono tracking-tight text-white uppercase">
              BHOPAL DISTRICT HOSPITAL ARCHITECTURE
            </h2>
            <p className="text-xs font-mono text-white/50">
              Interactive structural model reacting to the 7-day projection horizon. Click zones to inspect wing telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-white/40">Active State:</span>
            <span
              className={`px-2 py-0.5 rounded font-bold uppercase ${activeZoneStatus.risk === 'CRITICAL'
                  ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/50'
                  : 'bg-white/[0.05] text-white/80 border border-white/[0.08]'
                }`}
            >
              {forecastData.label}
            </span>
          </div>
        </div>

        {/* Main Grid: Isometric Twin SVG (Left) + Selected Zone Inspector (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Isometric Hospital Structural Canvas */}
          <div className="lg:col-span-8 rounded-xl border border-white/[0.08] bg-[#0b0d0f] p-4 sm:p-6 relative overflow-hidden flex flex-col justify-between">
            {/* Model Legend & Controls */}
            <div className="flex items-center justify-between text-xs font-mono text-white/40 mb-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#EF4444]" /> Critical Focal Point
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#F97316]" /> High Pressure
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#D3FD50]" /> Nominal Flow
                </span>
              </div>
              <span className="hidden sm:inline text-[11px] text-white/30">
                PROJECTION: T+{forecastData.dayOffset}
              </span>
            </div>

            {/* Isometric SVG Schematic */}
            <div className="w-full flex items-center justify-center py-4">
              <svg
                viewBox="0 0 800 480"
                className="w-full max-w-[720px] h-auto overflow-visible select-none"
              >
                <defs>
                  {/* Grid floor pattern */}
                  <pattern id="isoGrid" width="40" height="20" patternUnits="userSpaceOnUse">
                    <path
                      d="M 20,0 L 40,10 L 20,20 L 0,10 Z"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.03)"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>

                {/* Ground plane grid */}
                <rect x="0" y="0" width="800" height="480" fill="url(#isoGrid)" opacity="0.8" />

                {/* ========================================================= */}
                {/* SUBSTRUCTURE / BASEMENT: OXYGEN SUBSTATION & VENTILATORS */}
                {/* ========================================================= */}
                {/* Oxygen Substation */}
                {(() => {
                  const status = getZoneStatus('oxygen_substation');
                  const isSelected = selectedZoneId === 'oxygen_substation';
                  return (
                    <g
                      className="cursor-pointer transition-transform hover:opacity-95"
                      onClick={() => setSelectedZoneId('oxygen_substation')}
                    >
                      {/* Isometric Box */}
                      <path
                        d="M 120,360 L 260,290 L 260,330 L 120,400 Z"
                        fill="#121518"
                        stroke={status.stroke}
                        strokeWidth={isSelected ? 2 : 1}
                        strokeOpacity={0.8}
                      />
                      <path
                        d="M 260,290 L 360,340 L 360,380 L 260,330 Z"
                        fill="#0e1012"
                        stroke={status.stroke}
                        strokeWidth={isSelected ? 2 : 1}
                        strokeOpacity={0.8}
                      />
                      <path
                        d="M 120,360 L 220,310 L 360,380 L 260,430 Z"
                        fill="#171b1f"
                        stroke={status.stroke}
                        strokeWidth={isSelected ? 2 : 1}
                      />
                      <text
                        x="235"
                        y="365"
                        textAnchor="middle"
                        className="text-[10px] font-mono font-bold fill-white uppercase"
                      >
                        OXYGEN SUBSTATION
                      </text>
                      <text
                        x="235"
                        y="380"
                        textAnchor="middle"
                        className="text-[9px] font-mono font-bold fill-[#D3FD50]"
                      >
                        {status.badge}
                      </text>
                    </g>
                  );
                })()}

                {/* Ventilator Storage Depot */}
                {(() => {
                  const status = getZoneStatus('ventilator_storage');
                  const isSelected = selectedZoneId === 'ventilator_storage';
                  return (
                    <g
                      className="cursor-pointer transition-transform hover:opacity-95"
                      onClick={() => setSelectedZoneId('ventilator_storage')}
                    >
                      <path
                        d="M 420,360 L 560,290 L 560,330 L 420,400 Z"
                        fill="#121518"
                        stroke={status.stroke}
                        strokeWidth={isSelected ? 2 : 1}
                        strokeOpacity={0.8}
                      />
                      <path
                        d="M 560,290 L 660,340 L 660,380 L 560,330 Z"
                        fill="#0e1012"
                        stroke={status.stroke}
                        strokeWidth={isSelected ? 2 : 1}
                        strokeOpacity={0.8}
                      />
                      <path
                        d="M 420,360 L 520,310 L 660,380 L 560,430 Z"
                        fill="#171b1f"
                        stroke={status.stroke}
                        strokeWidth={isSelected ? 2 : 1}
                      />
                      <text
                        x="535"
                        y="365"
                        textAnchor="middle"
                        className="text-[10px] font-mono font-bold fill-white uppercase"
                      >
                        VENTILATOR DEPOT
                      </text>
                      <text
                        x="535"
                        y="380"
                        textAnchor="middle"
                        className={`text-[9px] font-mono font-bold ${status.risk === 'CRITICAL' ? 'fill-[#EF4444]' : 'fill-[#F59E0B]'
                          }`}
                      >
                        {status.badge}
                      </text>
                    </g>
                  );
                })()}

                {/* ========================================================= */}
                {/* LEVEL 01 / GROUND: EMERGENCY & TRAUMA & PHARMACY */}
                {/* ========================================================= */}
                {/* Emergency & Trauma Bay */}
                {(() => {
                  const status = getZoneStatus('emergency');
                  const isSelected = selectedZoneId === 'emergency';
                  return (
                    <g
                      className="cursor-pointer transition-transform hover:opacity-95"
                      onClick={() => setSelectedZoneId('emergency')}
                    >
                      <path
                        d="M 180,260 L 380,160 L 380,210 L 180,310 Z"
                        fill="#15191d"
                        stroke={status.stroke}
                        strokeWidth={isSelected ? 2 : 1}
                      />
                      <path
                        d="M 380,160 L 520,230 L 520,280 L 380,210 Z"
                        fill="#111316"
                        stroke={status.stroke}
                        strokeWidth={isSelected ? 2 : 1}
                      />
                      <path
                        d="M 180,260 L 320,190 L 520,290 L 380,360 Z"
                        fill="#1c2126"
                        stroke={status.stroke}
                        strokeWidth={isSelected ? 2 : 1.2}
                      />
                      <text
                        x="345"
                        y="275"
                        textAnchor="middle"
                        className="text-[11px] font-mono font-black fill-white uppercase tracking-wider"
                      >
                        EMERGENCY & TRAUMA BAY
                      </text>
                      <text
                        x="345"
                        y="292"
                        textAnchor="middle"
                        className={`text-[10px] font-mono font-bold ${status.risk === 'CRITICAL' ? 'fill-[#EF4444]' : 'fill-[#D3FD50]'
                          }`}
                      >
                        {status.badge}
                      </text>
                    </g>
                  );
                })()}

                {/* Central Pharmacy */}
                {(() => {
                  const status = getZoneStatus('pharmacy');
                  const isSelected = selectedZoneId === 'pharmacy';
                  return (
                    <g
                      className="cursor-pointer transition-transform hover:opacity-95"
                      onClick={() => setSelectedZoneId('pharmacy')}
                    >
                      <path
                        d="M 540,240 L 680,170 L 680,210 L 540,280 Z"
                        fill="#121518"
                        stroke="#9CA3AF"
                        strokeWidth={isSelected ? 2 : 1}
                        strokeOpacity={0.6}
                      />
                      <path
                        d="M 540,240 L 640,190 L 740,240 L 640,290 Z"
                        fill="#181c20"
                        stroke="#9CA3AF"
                        strokeWidth={isSelected ? 2 : 1}
                      />
                      <text
                        x="640"
                        y="245"
                        textAnchor="middle"
                        className="text-[9px] font-mono font-bold fill-white/80 uppercase"
                      >
                        STERILE PHARMACY
                      </text>
                    </g>
                  );
                })()}

                {/* ========================================================= */}
                {/* LEVEL 02: GENERAL WARDS */}
                {/* ========================================================= */}
                {(() => {
                  const status = getZoneStatus('general_wards');
                  const isSelected = selectedZoneId === 'general_wards';
                  return (
                    <g
                      className="cursor-pointer transition-transform hover:opacity-95"
                      onClick={() => setSelectedZoneId('general_wards')}
                    >
                      <path
                        d="M 230,165 L 430,65 L 430,105 L 230,205 Z"
                        fill="#15191e"
                        stroke={status.stroke}
                        strokeWidth={isSelected ? 2 : 1}
                        strokeOpacity={0.8}
                      />
                      <path
                        d="M 430,65 L 590,145 L 590,185 L 430,105 Z"
                        fill="#111417"
                        stroke={status.stroke}
                        strokeWidth={isSelected ? 2 : 1}
                        strokeOpacity={0.8}
                      />
                      <path
                        d="M 230,165 L 390,85 L 590,185 L 430,265 Z"
                        fill="#1c2228"
                        stroke={status.stroke}
                        strokeWidth={isSelected ? 2 : 1.2}
                      />
                      <text
                        x="405"
                        y="175"
                        textAnchor="middle"
                        className="text-[11px] font-mono font-black fill-white uppercase tracking-wider"
                      >
                        GENERAL INPATIENT WARDS
                      </text>
                      <text
                        x="405"
                        y="192"
                        textAnchor="middle"
                        className="text-[10px] font-mono font-bold fill-white/70"
                      >
                        {status.badge}
                      </text>
                    </g>
                  );
                })()}

                {/* ========================================================= */}
                {/* LEVEL 03: ICU (THE CRITICAL FOCAL POINT) & ISOLATION POD */}
                {/* ========================================================= */}
                {/* ICU Tower Pavilion */}
                {(() => {
                  const status = getZoneStatus('icu');
                  const isSelected = selectedZoneId === 'icu';
                  const isBreach = status.risk === 'CRITICAL';
                  return (
                    <g
                      className="cursor-pointer"
                      onClick={() => setSelectedZoneId('icu')}
                      style={{ filter: status.glow }}
                    >
                      {/* Elevated Pillar Shaft */}
                      <line
                        x1="320"
                        y1="100"
                        x2="320"
                        y2="50"
                        stroke={status.stroke}
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />

                      {/* Main ICU Isometric Prism */}
                      <path
                        d="M 270,70 L 450,-20 L 450,20 L 270,110 Z"
                        fill={isBreach ? '#380e0e' : '#1a2026'}
                        stroke={status.stroke}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                      />
                      <path
                        d="M 450,-20 L 570,40 L 570,80 L 450,20 Z"
                        fill={isBreach ? '#2a0909' : '#14181c'}
                        stroke={status.stroke}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                      />
                      <path
                        d="M 270,70 L 390,10 L 570,100 L 450,160 Z"
                        fill={isBreach ? '#4a1111' : '#222b33'}
                        stroke={status.stroke}
                        strokeWidth={isSelected ? 2.5 : 2}
                      />

                      {/* Text Callouts */}
                      <text
                        x="420"
                        y="78"
                        textAnchor="middle"
                        className={`text-[12px] font-mono font-black uppercase tracking-widest ${isBreach ? 'fill-[#EF4444]' : 'fill-white'
                          }`}
                      >
                        ICU (INTENSIVE CARE)
                      </text>

                      <text
                        x="420"
                        y="98"
                        textAnchor="middle"
                        className={`text-[11px] font-mono font-black tracking-wider ${isBreach ? 'fill-[#EF4444]' : 'fill-[#D3FD50]'
                          }`}
                      >
                        {status.badge}
                      </text>

                      {/* Prominent Breach Flag if Shortage */}
                      {isBreach && (
                        <g transform="translate(420, -10)">
                          <circle cx="0" cy="0" r="14" fill="#EF4444" className="animate-ping" opacity="0.4" />
                          <circle cx="0" cy="0" r="6" fill="#EF4444" stroke="#ffffff" strokeWidth="1.5" />
                          <rect
                            x="-85"
                            y="-38"
                            width="170"
                            height="24"
                            rx="4"
                            fill="#15181b"
                            stroke="#EF4444"
                            strokeWidth="1.2"
                          />
                          <text
                            x="0"
                            y="-23"
                            textAnchor="middle"
                            className="text-[9px] font-mono font-black fill-[#EF4444] uppercase tracking-wider"
                          >
                            CRITICAL CAPACITY BREACH
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })()}

                {/* Isolation Pod */}
                {(() => {
                  const status = getZoneStatus('isolation');
                  const isSelected = selectedZoneId === 'isolation';
                  return (
                    <g
                      className="cursor-pointer transition-transform hover:opacity-95"
                      onClick={() => setSelectedZoneId('isolation')}
                    >
                      <path
                        d="M 590,60 L 690,10 L 690,45 L 590,95 Z"
                        fill="#15191e"
                        stroke="#9CA3AF"
                        strokeWidth={isSelected ? 2 : 1}
                        strokeOpacity={0.7}
                      />
                      <path
                        d="M 590,60 L 650,30 L 730,70 L 670,100 Z"
                        fill="#1e242b"
                        stroke="#9CA3AF"
                        strokeWidth={isSelected ? 2 : 1}
                      />
                      <text
                        x="660"
                        y="68"
                        textAnchor="middle"
                        className="text-[9px] font-mono font-bold fill-white/80 uppercase"
                      >
                        AIRBORNE ISOLATION
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Bottom model caption */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-white/40">
              <span>Interactive Model: Click any wing to view telemetry</span>
              <span className="text-[#D3FD50] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Building Management System Online
              </span>
            </div>
          </div>

          {/* Right Column: Zone Telemetry Inspector Panel */}
          <div className="lg:col-span-4 rounded-xl border border-white/[0.08] bg-[#0d0f12] p-5 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/[0.08] mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${activeZoneStatus.risk === 'CRITICAL'
                        ? 'bg-[#EF4444]'
                        : activeZoneStatus.risk === 'HIGH'
                          ? 'bg-[#F97316]'
                          : 'bg-[#D3FD50]'
                      }`}
                  />
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    ZONE TELEMETRY
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${activeZoneStatus.risk === 'CRITICAL'
                      ? 'bg-[#EF4444]/20 border-[#EF4444]/50 text-[#EF4444]'
                      : 'bg-[#D3FD50]/15 border-[#D3FD50]/40 text-[#D3FD50]'
                    }`}
                >
                  {activeZoneStatus.risk}
                </span>
              </div>

              {/* Zone Name & Location */}
              <div className="mb-4">
                <h3 className="text-lg font-mono font-black text-white uppercase leading-tight">
                  {activeZone.name}
                </h3>
                <p className="text-[11px] font-mono text-white/40 uppercase mt-0.5">
                  {activeZone.floor}
                </p>
              </div>

              {/* Capacity Telemetry Numbers */}
              <div className="p-3.5 rounded-lg bg-black/40 border border-white/[0.06] space-y-3 mb-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-mono text-white/50">Simulated Load:</span>
                  <span
                    className={`text-xl font-mono font-bold tabular-nums ${activeZoneStatus.risk === 'CRITICAL' ? 'text-[#EF4444]' : 'text-white'
                      }`}
                  >
                    {activeZoneStatus.utilization}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${activeZoneStatus.risk === 'CRITICAL'
                        ? 'bg-[#EF4444]'
                        : activeZoneStatus.risk === 'HIGH'
                          ? 'bg-[#F97316]'
                          : 'bg-[#D3FD50]'
                      }`}
                    style={{ width: `${Math.min(100, activeZoneStatus.utilization)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] font-mono text-white/40 pt-1">
                  <span>Status Vector:</span>
                  <span className="text-white font-semibold uppercase">{activeZoneStatus.badge}</span>
                </div>
              </div>

              {/* Live Physical Environmental Telemetry */}
              <div className="space-y-2.5 text-xs font-mono">
                <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">
                  ENVIRONMENTAL & LOGISTICS TELEMETRY
                </div>
                <div className="flex justify-between p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-white/50">Ambient HVAC:</span>
                  <span className="text-white font-mono">{activeZone.telemetry.temperature}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-white/50">Staff Allocation:</span>
                  <span className="text-white font-mono">{activeZone.telemetry.staffRatio}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-white/50">Air Pressure / Flow:</span>
                  <span className="text-white font-mono">{activeZone.telemetry.flowState}</span>
                </div>
              </div>
            </div>

            {/* Zone Switcher Shortcuts */}
            <div className="pt-4 border-t border-white/[0.06] mt-4">
              <div className="text-[10px] font-mono text-white/40 uppercase mb-2">
                FAST WING SELECTOR:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DIGITAL_TWIN_BASE_ZONES.map((zone) => (
                  <button
                    key={zone.id}
                    onClick={() => setSelectedZoneId(zone.id)}
                    className={`px-2 py-1 text-[10px] font-mono rounded border transition-colors ${selectedZoneId === zone.id
                        ? 'bg-white/[0.1] border-[#D3FD50] text-[#D3FD50] font-bold'
                        : 'bg-white/[0.02] border-white/[0.06] text-white/50 hover:text-white'
                      }`}
                  >
                    {zone.id.toUpperCase().replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
