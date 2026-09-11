"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import PatientSidebar from "./components/PatientSidebar";
import PatientTopBar from "./components/PatientTopBar";
import PatientHero from "./components/PatientHero";
import PatientHealthMetrics from "./components/PatientHealthMetrics";
import PatientHealthTrend from "./components/PatientHealthTrend";
import PatientClinicalNote from "./components/PatientClinicalNote";
import PatientFooter from "./components/PatientFooter";
import TluxFloatingButton from "./components/TluxFloatingButton";
import ClinicalDashboardPage from "../modelDisplay/page";
import { api } from "../../../lib/api";

const VIEWS = ["overview", "clinical"] as const;
type View = (typeof VIEWS)[number];

export default function Page() {
  const [activeTab, setActiveTab] = useState<View>("overview");
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [department, setDepartment] = useState("General Medicine");
  const [reason, setReason] = useState("");
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");

  const submitAppointment = async (event: FormEvent) => {
    event.preventDefault();
    if (!appointmentDate) { setBookingError("Select an appointment date and time."); return; }
    setBooking(true); setBookingError("");
    try {
      await api.createAppointment({ scheduled_for: new Date(appointmentDate).toISOString(), department, reason: reason.trim() || undefined });
      setBookingSuccess("Appointment request sent to City General Hospital. The hospital can now see it in their dashboard.");
      setReason("");
    } catch (err) { setBookingError(err instanceof Error ? err.message : "Could not book the appointment."); }
    finally { setBooking(false); }
  };

  return (
    <main className="min-h-screen bg-[#f4f6f5] text-[#17221f]">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <PatientSidebar
          activeTab={activeTab}
          onTabChange={(key) => {
            if (key === "overview") {
              setActiveTab("overview");
            } else if (key === "health") {
              setActiveTab("clinical");
            }
          }}
        />

        {/* MAIN CONTENT */}
        <section className="min-w-0 flex-1 lg:ml-[245px]">
          {/* Top bar */}
          <PatientTopBar />

          {activeTab === "overview" ? (
            <div className="mx-auto max-w-[1450px] px-5 py-6 md:px-8 md:py-8">
              {/* HERO */}
              <PatientHero onViewChange={(view) => setActiveTab(view)} onBookAppointment={() => { setBookingError(""); setBookingSuccess(""); setShowAppointmentForm(true); }} />

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

      {showAppointmentForm && <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4 backdrop-blur-sm"><form onSubmit={submitAppointment} className="w-full max-w-lg rounded-[24px] bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#71807a]">City General Hospital</p><h2 className="mt-1 text-2xl font-medium tracking-[-.04em]">Book an appointment</h2><p className="mt-2 text-sm text-[#687873]">Your request will be visible to hospital staff.</p></div><button type="button" onClick={() => setShowAppointmentForm(false)} className="text-xl text-[#71807a]">×</button></div><div className="mt-6 grid gap-4"><label className="text-xs font-medium text-[#35403c]">Preferred date & time<input type="datetime-local" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} required className="mt-2 h-11 w-full rounded-xl border border-[#dfe5e2] bg-[#f9faf9] px-3 text-sm outline-none focus:border-[#8aaba0]"/></label><label className="text-xs font-medium text-[#35403c]">Department<select value={department} onChange={(e) => setDepartment(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#dfe5e2] bg-[#f9faf9] px-3 text-sm outline-none focus:border-[#8aaba0]"><option>General Medicine</option><option>Cardiology</option><option>Endocrinology</option><option>Orthopedics</option><option>Dermatology</option></select></label><label className="text-xs font-medium text-[#35403c]">Reason for visit <span className="font-normal text-[#89938f]">(optional)</span><textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Briefly describe what you need help with" className="mt-2 w-full rounded-xl border border-[#dfe5e2] bg-[#f9faf9] p-3 text-sm outline-none focus:border-[#8aaba0]"/></label>{bookingError && <p className="text-xs text-red-600">{bookingError}</p>}{bookingSuccess && <p className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700">{bookingSuccess}</p>}<button disabled={booking} className="h-12 rounded-xl bg-[#17221f] text-sm font-medium text-white disabled:opacity-60">{booking ? "Sending request…" : "Confirm appointment request"}</button></div></form></div>}
    </main>
  );
}
