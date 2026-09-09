'use client';

import React, { useState } from 'react';
import { TimelineDayId } from '@/lib/types';
import { TIMELINE_FORECAST_MAP } from '@/lib/mockData';
import { HospitalHeader } from './components/HospitalHeader';
import { VerticalSidebar } from './components/VerticalSidebar';
import { SevenDayTimeline } from './components/SevenDayTimeline';
import { DigitalTwin } from './components/DigitalTwin';
import { ResourceUtilization } from './components/ResourceUtilization';
import { DepartmentForecast } from './components/DepartmentForecast';
import { RightColumnForecastDeck } from './components/RightColumnForecastDeck';
import { SkylineAside } from './components/SkylineAside';
import { CoordinationModal } from './components/CoordinationModal';

export default function DashboardPage() {
  const [selectedDay, setSelectedDay] = useState<TimelineDayId>('NOW');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [coordinationOpen, setCoordinationOpen] = useState<boolean>(false);
  const [preselectedHospitalId, setPreselectedHospitalId] = useState<string | undefined>(undefined);

  const forecastData = TIMELINE_FORECAST_MAP[selectedDay];

  const handleOpenCoordination = (targetHospitalId?: string) => {
    setPreselectedHospitalId(targetHospitalId);
    setCoordinationOpen(true);
  };

  const handleScrollToForecast = () => {
    setActiveTab('forecast');
    const el = document.getElementById('section-forecast');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#0F172A] flex flex-col font-sans selection:bg-[#3B82F6]/20 selection:text-[#1E40AF] relative">
      {/* 1. Top Brand Navigation Bar */}
      <HospitalHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCoordination={() => handleOpenCoordination()}
        breachActive={forecastData.isBreach}
        shortageBeds={Math.max(13, forecastData.resources.icu.shortageDelta)}
        currentDateString={forecastData.dateString}
      />

      {/* 2. Main Body Container with Vertical Sidebar, Central Command Deck, and Skyline Aside */}
      <div className="flex-1 w-full max-w-[1920px] mx-auto flex p-3 sm:p-5 lg:p-6 gap-5 lg:gap-6">
        {/* Left Navigation Dock */}
        <VerticalSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenCoordination={() => handleOpenCoordination()}
          breachActive={forecastData.isBreach}
          shortageBeds={Math.max(13, forecastData.resources.icu.shortageDelta)}
        />

        {/* Center / Primary Command Canvas */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Main Grid: Left Area (Hero Header, 3D Campus, Resource Meters, Dept Forecast) + Right Area (7-Day Forecast, Risk, Nearby Hospitals, Key Insights) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left Primary Column (8 of 12 cols on desktop) */}
            <div className="xl:col-span-8 space-y-6">
              {/* 1. Hero Header & 4 Key Numbers Strip with 7-Day Timeline Scrubber */}
              <div id="section-overview">
                <SevenDayTimeline
                  selectedDay={selectedDay}
                  onSelectDay={(day) => setSelectedDay(day)}
                  forecastData={forecastData}
                />
              </div>

              {/* 2. Digital Twin 2.5D Isometric Architectural Campus */}
              <div id="section-twin">
                <DigitalTwin
                  selectedDay={selectedDay}
                  forecastData={forecastData}
                  onOpenCoordination={() => handleOpenCoordination()}
                  onViewForecast={handleScrollToForecast}
                />
              </div>

              {/* 3. Bottom Row: Resource Utilization (5 Circular Gauges) + Department Forecast (Spline Chart) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7">
                  <ResourceUtilization
                    selectedDay={selectedDay}
                    forecastData={forecastData}
                    onOpenCoordination={() => handleOpenCoordination()}
                  />
                </div>
                <div className="lg:col-span-5">
                  <DepartmentForecast
                    selectedDay={selectedDay}
                    forecastData={forecastData}
                  />
                </div>
              </div>
            </div>

            {/* Right Column (4 of 12 cols on desktop): 7-Day Forecast, Upcoming Risk, Nearby Hospitals, Key Insights */}
            <div className="xl:col-span-4">
              <RightColumnForecastDeck
                selectedDay={selectedDay}
                forecastData={forecastData}
                onOpenCoordination={(hospId) => handleOpenCoordination(hospId)}
              />
            </div>
          </div>

          {/* Minimalist Command Deck Footer */}
          <footer className="w-full pt-4 pb-2 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#0F172A]">NEXUS</span>
              <span>•</span>
              <span>National Healthcare Forecasting & Resource Intelligence Platform</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Madhya Pradesh State Health Operations Center</span>
              <span>•</span>
              <span className="font-mono text-[11px] text-[#94A3B8]">v2.8.4-PROD</span>
            </div>
          </footer>
        </main>

        {/* Far Right Atmospheric Edge (Visible on 2xl displays, matching reference image) */}
        <SkylineAside />
      </div>

      {/* Capacity Coordination & Transfer Modal Drawer */}
      <CoordinationModal
        isOpen={coordinationOpen}
        onClose={() => setCoordinationOpen(false)}
        defaultShortageBeds={Math.max(13, forecastData.resources.icu.shortageDelta)}
      />
    </div>
  );
}
