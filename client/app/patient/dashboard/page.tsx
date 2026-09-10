"use client";

import { useState } from "react";
import PatientSidebar from "./components/PatientSidebar";
import PatientTopBar from "./components/PatientTopBar";
import PatientHero from "./components/PatientHero";
import PatientHealthMetrics from "./components/PatientHealthMetrics";
import PatientHealthTrend from "./components/PatientHealthTrend";
import PatientClinicalNote from "./components/PatientClinicalNote";
import PatientFooter from "./components/PatientFooter";
import TluxFloatingButton from "./components/TluxFloatingButton";
import ClinicalDashboardPage from "../modelDisplay/page";

const VIEWS = ["overview", "clinical"] as const;
type View = (typeof VIEWS)[number];

export default function Page() {
  const [activeTab, setActiveTab] = useState<View>("overview");

  return (
    <main className="min-h-screen bg-[#f4f6f5] text-[#17221f]">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <PatientSidebar
          activeTab={activeTab}
          onTabChange={(key) =>
            setActiveTab(key === "overview" ? "overview" : "clinical")
          }
        />

        {/* MAIN CONTENT */}
        <section className="min-w-0 flex-1 lg:ml-[245px]">
          {/* Top bar */}
          <PatientTopBar />

          {/* View switcher */}
          <div className="mx-auto flex max-w-[1450px] flex-wrap items-center justify-between gap-4 px-5 pt-6 md:px-8">
            <div className="flex items-center gap-1 rounded-xl border border-[#e1e7e4] bg-white p-1 shadow-sm">
              {VIEWS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                    activeTab === tab
                      ? "bg-[#17221f] text-white"
                      : "text-[#17221f]/60 hover:text-[#17221f]"
                  }`}
                >
{tab === "overview" ? "Overview" : "NEXUS Clinical"}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "overview" ? (
            <div className="mx-auto max-w-[1450px] px-5 py-6 md:px-8 md:py-8">
              {/* HERO */}
              <PatientHero />

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
            <div className="min-w-0">
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