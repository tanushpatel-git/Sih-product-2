"use client";

import { useState } from "react";
import DoctorSidebar from "./components/DoctorSidebar";
import DoctorTopBar from "./components/DoctorTopBar";
import DoctorHero from "./components/DoctorHero";
import DoctorMetrics from "./components/DoctorMetrics";
import DoctorPatientRisk from "./components/DoctorPatientRisk";
import DoctorActivity from "./components/DoctorActivity";
import DoctorHospitalSignal from "./components/DoctorHospitalSignal";
import DoctorFooter from "./components/DoctorFooter";
import TluxFloatingButton from "./components/TluxFloatingButton";
import TluxChatDrawer from "./components/TluxChatDrawer";

export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTlux, setShowTlux] = useState(false);

  return (
    <main className="min-h-screen bg-[#f4f6f5] text-[#17201d]">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <DoctorSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* MAIN */}
      <div className="lg:pl-[260px]">
        {/* TOP BAR */}
        <DoctorTopBar onMenuClick={() => setSidebarOpen(true)} />

        {/* CONTENT */}
        <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          {/* HERO */}
          <DoctorHero />

          {/* METRICS */}
          <DoctorMetrics />

          {/* MAIN GRID */}
          <section className="mt-5">
            {/* PATIENT RISK */}
            <DoctorPatientRisk />
          </section>

          {/* BOTTOM */}
          <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
            {/* ACTIVITY */}
            <DoctorActivity />

            {/* HOSPITAL SIGNAL */}
            <DoctorHospitalSignal />
          </section>

          {/* FOOTER */}
          <DoctorFooter />
        </div>
      </div>

      {/* TLUX FLOATING BUTTON */}
      <TluxFloatingButton onChatOpen={() => setShowTlux(true)} />

      {/* TLUX CHAT DRAWER */}
      <TluxChatDrawer isOpen={showTlux} onClose={() => setShowTlux(false)} />
    </main>
  );
}