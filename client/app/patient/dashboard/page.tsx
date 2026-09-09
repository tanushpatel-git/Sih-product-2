"use client";

import PatientSidebar from "./components/PatientSidebar";
import PatientTopBar from "./components/PatientTopBar";
import PatientHero from "./components/PatientHero";
import PatientHealthMetrics from "./components/PatientHealthMetrics";
import PatientHealthTrend from "./components/PatientHealthTrend";
import PatientClinicalNote from "./components/PatientClinicalNote";
import PatientFooter from "./components/PatientFooter";
import TluxFloatingButton from "./components/TluxFloatingButton";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#f4f6f5] text-[#17221f]">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <PatientSidebar />

        {/* MAIN CONTENT */}
        <section className="min-w-0 flex-1 lg:ml-[245px]">
          {/* Top bar */}
          <PatientTopBar />

          <div className="mx-auto max-w-[1450px] px-5 py-6 md:px-8 md:py-8">
            {/* HERO */}
            <PatientHero />

            {/* HEALTH METRICS */}
            <PatientHealthMetrics />

          {activeTab === "overview" ? (
            <div className="mx-auto max-w-[1450px] px-5 py-6 md:px-8 md:py-8">
              {/* HERO */}
              <PatientHero onAiClick={() => setShowTlux(true)} />

              {/* HEALTH METRICS */}
              <PatientHealthMetrics />

              {/* HEALTH TREND */}
              <section className="mt-5">
                <PatientHealthTrend />
              </section>

              {/* CLINICAL NOTE */}
              <PatientClinicalNote />

              {/* Footer */}
              <PatientFooter />
            </div>
          ) : (
            <div className="min-w-0 flex-1">
              <ClinicalDashboardPage />
            </div>
          )}
        </section>
      </div>

      {/* TLUX FLOATING BUTTON */}
      <TluxFloatingButton />
    </main>
  );
}