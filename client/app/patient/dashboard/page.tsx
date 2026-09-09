"use client";

import { useState } from "react";
import PatientSidebar from "./components/PatientSidebar";
import PatientTopBar from "./components/PatientTopBar";
import PatientHero from "./components/PatientHero";
import PatientHealthMetrics from "./components/PatientHealthMetrics";
import PatientHealthTrend from "./components/PatientHealthTrend";
import PatientAppointments from "./components/PatientAppointments";
import PatientRecords from "./components/PatientRecords";
import PatientClinicalNote from "./components/PatientClinicalNote";
import PatientFooter from "./components/PatientFooter";
import TluxFloatingButton from "./components/TluxFloatingButton";
import TluxChatDrawer from "./components/TluxChatDrawer";

export default function Page() {
  const [showTlux, setShowTlux] = useState(false);

  return (
    <main className="min-h-screen bg-[#f4f6f5] text-[#17221f]">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <PatientSidebar onAiClick={() => setShowTlux(true)} />

        {/* MAIN CONTENT */}
        <section className="min-w-0 flex-1 lg:ml-[245px]">
          {/* Top bar */}
          <PatientTopBar />

          <div className="mx-auto max-w-[1450px] px-5 py-6 md:px-8 md:py-8">
            {/* HERO */}
            <PatientHero onAiClick={() => setShowTlux(true)} />

            {/* HEALTH METRICS */}
            <PatientHealthMetrics />

            {/* HEALTH TREND */}
            <section className="mt-5">
              <PatientHealthTrend />
            </section>

            {/* APPOINTMENTS + RECORDS */}
            <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1fr]">
              {/* Appointments */}
              <PatientAppointments />

              {/* Medical records */}
              <PatientRecords />
            </section>

            {/* CLINICAL NOTE */}
            <PatientClinicalNote />

            {/* Footer */}
            <PatientFooter />
          </div>
        </section>
      </div>

      {/* TLUX FLOATING BUTTON */}
      <TluxFloatingButton onChatOpen={() => setShowTlux(true)} />

      {/* TLUX CHAT DRAWER */}
      <TluxChatDrawer isOpen={showTlux} onClose={() => setShowTlux(false)} />
    </main>
  );
}