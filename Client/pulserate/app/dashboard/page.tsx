'use client';

import React, { useState } from 'react';
import { TimelineDayId } from '@/lib/types';
import { TIMELINE_FORECAST_MAP } from '@/lib/mockData';
import { VerticalSidebar } from '@/components/dashboard/VerticalSidebar';
import { HospitalHeader } from '@/components/dashboard/HospitalHeader';
import { SpatialHospitalHero } from '@/components/dashboard/SpatialHospitalHero';
import { DigitalTwin } from '@/components/dashboard/DigitalTwin';
import { ForecastHero } from '@/components/dashboard/ForecastHero';
import { HospitalNetwork } from '@/components/dashboard/HospitalNetwork';
import { DiseaseIntelligence } from '@/components/dashboard/DiseaseIntelligence';
import { CoordinationModal } from '@/components/dashboard/CoordinationModal';

export default function DashboardPage() {
  const [selectedDay, setSelectedDay] = useState<TimelineDayId>('NOW');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [coordinationOpen, setCoordinationOpen] = useState<boolean>(false);

  const forecastData = TIMELINE_FORECAST_MAP[selectedDay];

  const handleOpenCoordination = () => {
    setCoordinationOpen(true);
  };

  const handleScrollToForecast = () => {
    setActiveTab('forecast');
    const el = document.getElementById('section-forecast');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#07090C] text-[#F4F3EF] flex font-sans selection:bg-white/20 selection:text-white">
      {/* 1. Apple Vision Pro Spatial Vertical Navigation Dock */}
      <VerticalSidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          const target = document.getElementById(`section-${tab}`);
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenCoordination={handleOpenCoordination}
        breachActive={forecastData.isBreach}
        shortageBeds={Math.max(9, forecastData.resources.icu.shortageDelta)}
      />

      {/* 2. Main Spatial Command Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Operational Header */}
        <HospitalHeader
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            const target = document.getElementById(`section-${tab}`);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenCoordination={handleOpenCoordination}
          breachActive={forecastData.isBreach}
          shortageBeds={Math.max(9, forecastData.resources.icu.shortageDelta)}
        />

        {/* 3. HERO EXPERIENCE: Large 3D Hospital Model in Cinematic Living Environment */}
        <div id="section-hero">
          <SpatialHospitalHero
            selectedDay={selectedDay}
            onSelectDay={(day) => setSelectedDay(day)}
            forecastData={forecastData}
            onOpenCoordination={handleOpenCoordination}
          />
        </div>

        {/* 4. Centerpiece: Architectural Digital Twin Cutaway + Decision Instrument */}
        <div id="section-twin">
          <DigitalTwin
            selectedDay={selectedDay}
            forecastData={forecastData}
            onOpenCoordination={handleOpenCoordination}
            onViewForecast={handleScrollToForecast}
          />
        </div>

        {/* 5. Large 7-Day Patient Demand Forecast Instrument + 6-Stage Narrative Ribbon */}
        <div id="section-forecast">
          <ForecastHero
            selectedDay={selectedDay}
            onSelectDay={(day) => setSelectedDay(day)}
            forecastData={forecastData}
            onOpenCoordination={handleOpenCoordination}
          />
        </div>

        {/* 6. Regional Surge Hospital Network Grid */}
        <div id="section-network">
          <HospitalNetwork
            selectedDay={selectedDay}
            forecastData={forecastData}
            onOpenCoordination={handleOpenCoordination}
          />
        </div>

        {/* 7. Disease Intelligence & Epidemiological Surveillance */}
        <div id="section-disease">
          <DiseaseIntelligence />
        </div>

        {/* Command Operations Footer */}
        <footer className="w-full border-t border-white/[0.08] bg-[#07090C] py-8 px-6 lg:px-10">
          <div className="max-w-[1780px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#66707C]">
            <div className="flex items-center gap-3">
              <span className="text-[#F4F3EF] font-bold">NEXUS</span>
              <span>•</span>
              <span>NATIONAL HEALTHCARE FORECASTING & RESOURCE INTELLIGENCE</span>
              <span>•</span>
              <span>SMART INDIA HACKATHON 2026</span>
            </div>
            <div className="flex items-center gap-4">
              <span>BHOPAL DISTRICT HEALTH DEPT</span>
              <span>•</span>
              <span className="text-[#A7ADB5]">FACILITY CODE: MP-BPL-094</span>
            </div>
          </div>
        </footer>
      </div>

      {/* 8. Capacity Coordination & Transfer Modal Drawer */}
      <CoordinationModal
        isOpen={coordinationOpen}
        onClose={() => setCoordinationOpen(false)}
        defaultShortageBeds={Math.max(9, forecastData.resources.icu.shortageDelta)}
      />
    </div>
  );
}
