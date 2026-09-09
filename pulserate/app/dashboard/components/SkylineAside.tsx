'use client';

import React from 'react';
import Image from 'next/image';

export const SkylineAside: React.FC = () => {
  return (
    <aside className="w-52 shrink-0 hidden 2xl:flex flex-col justify-between py-6 px-4 select-none relative overflow-hidden rounded-2xl bg-white/40 backdrop-blur-xs border border-[#E2E8F0]/60">
      {/* Top Editorial Brand Text */}
      <div className="space-y-4 z-10 pt-2">
        <h3 className="text-sm font-bold font-sans text-[#0F172A] leading-snug">
          Better Insights. Healthier Communities.
        </h3>
        <div className="w-6 h-0.5 bg-[#CBD5E1]" />
        <p className="text-xs text-[#475569] leading-relaxed">
          NEXUS helps hospitals stay ahead — with real-time data, predictive intelligence and smarter coordination.
        </p>
      </div>

      {/* Center Waterfront Skyline Image */}
      <div className="relative w-full h-72 my-auto rounded-xl overflow-hidden shadow-xs border border-white/80">
        <Image
          src="/skyline_backdrop.jpg"
          alt="Atmospheric Regional Healthcare Corridor"
          fill
          priority
          className="object-cover object-center opacity-85 hover:opacity-95 transition-opacity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/40" />
      </div>

      {/* Bottom Sine Wave Accent */}
      <div className="w-full h-8 z-10 flex items-center justify-center">
        <svg className="w-full h-6 text-[#3B82F6]/30" viewBox="0 0 100 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M0,12 Q25,0 50,12 T100,12" strokeLinecap="round" />
        </svg>
      </div>
    </aside>
  );
};
