"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PatientSidebar from "./components/PatientSidebar";
import PatientTopBar from "./components/PatientTopBar";
import PatientHero from "./components/PatientHero";
import PatientHealthMetrics from "./components/PatientHealthMetrics";
import PatientHealthTrend from "./components/PatientHealthTrend";
import PatientClinicalNote from "./components/PatientClinicalNote";
import PatientFooter from "./components/PatientFooter";
import TluxFloatingButton from "./components/TluxFloatingButton";
import TluxChatDrawer from "./components/TluxChatDrawer";
import ClinicalDashboardPage from "../modelDisplay/page";

export default function Page() {
  const router = useRouter();
  const [showTlux, setShowTlux] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "medicalAnalysis">("overview");
  const [sessionUser, setSessionUser] = useState<{ fullName?: string; email?: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("vitaweave_patient_session");
        if (raw) {
          const session = JSON.parse(raw);
          if (session && session.authenticated && session.user) {
            setSessionUser(session.user);
            setIsAuthenticated(true);
            return;
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    setIsAuthenticated(false);
    router.replace("/patient/login");
  }, [router]);

  const handleLogout = () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("vitaweave_patient_session");
      }
    } catch (e) {
      console.error(e);
    }
    router.replace("/patient/login");
  };

  // Prevent flash of protected dashboard before session check
  if (isAuthenticated === null || isAuthenticated === false) {
    return (
      <main className="min-h-screen bg-[#f4f6f5] flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#17221f] border-t-transparent" />
      </main>
    );
  }

  const patientName = sessionUser?.fullName;

  return (
    <main className="min-h-screen bg-[#f4f6f5] text-[#17221f]">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <PatientSidebar
          onAiClick={() => setShowTlux(true)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          patientName={patientName}
        />

        {/* MAIN CONTENT */}
        <section className="min-w-0 flex-1 lg:ml-[245px]">
          {/* Top bar */}
          <PatientTopBar patientName={patientName} />

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
      <TluxFloatingButton onChatOpen={() => setShowTlux(true)} />

      {/* TLUX CHAT DRAWER */}
      <TluxChatDrawer
        isOpen={showTlux}
        onClose={() => setShowTlux(false)}
        patientName={patientName}
      />
    </main>
  );
}