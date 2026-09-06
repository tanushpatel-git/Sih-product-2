'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Hospital
  const [hospitalName, setHospitalName] = useState('Indore Regional Super-Specialty Hospital');
  const [hospitalId, setHospitalId] = useState('HOSP-MP-IND-042');
  const [location, setLocation] = useState('Indore, Madhya Pradesh');
  const [hospitalType, setHospitalType] = useState('Government Tertiary Apex Facility');

  // Step 2: Capacity
  const [totalBeds, setTotalBeds] = useState('650');
  const [icuBeds, setIcuBeds] = useState('75');
  const [ventilators, setVentilators] = useState('32');
  const [oxygenCapacity, setOxygenCapacity] = useState('14,000 Liters (Cryogenic VIE)');

  // Step 3: Administrator
  const [adminName, setAdminName] = useState('Dr. S. K. Mukherjee');
  const [adminEmail, setAdminEmail] = useState('director@indoreregional.gov.in');
  const [password, setPassword] = useState('••••••••••••');

  const [isProvisioning, setIsProvisioning] = useState(false);

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProvisioning(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#080909] text-[#F4F3EF] flex flex-col justify-between font-sans selection:bg-white/20 selection:text-white">
      {/* Top Bar */}
      <header className="w-full border-b border-white/[0.08] bg-[#080909] px-6 lg:px-12 py-4">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#141619] border border-white/[0.15] flex items-center justify-center">
              <span className="text-[#F4F3EF] font-bold text-sm tracking-tight font-mono">N</span>
            </div>
            <div>
              <span className="text-[#F4F3EF] font-bold text-sm tracking-wider uppercase font-mono">NEXUS</span>
              <span className="text-[10px] font-mono text-[#A5A7A3] block">INFRASTRUCTURE ONBOARDING</span>
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="text-xs font-mono text-[#A5A7A3] hover:text-[#F4F3EF] transition-colors"
          >
            SKIP TO BHOPAL DEMO COMMAND →
          </Link>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 lg:px-12 py-10">
        {/* Step Ticker */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { step: 1, title: 'STEP 01', subtitle: 'HOSPITAL IDENTITY' },
            { step: 2, title: 'STEP 02', subtitle: 'BED & ASSET CAPACITY' },
            { step: 3, title: 'STEP 03', subtitle: 'COMMAND ADMINISTRATOR' },
          ].map((s) => {
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;
            return (
              <div
                key={s.step}
                onClick={() => isCompleted && setCurrentStep(s.step as any)}
                className={`p-4 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-[#181B1F] border-white/30 ring-1 ring-white/20'
                    : isCompleted
                    ? 'bg-[#0D0E10] border-white/15 cursor-pointer'
                    : 'bg-[#0A0B0D] border-white/[0.06] opacity-40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase ${
                      isActive ? 'text-[#F4F3EF]' : 'text-[#A5A7A3]'
                    }`}
                  >
                    {s.title}
                  </span>
                  {isCompleted && (
                    <span className="w-4 h-4 rounded-full bg-[#D8D9D5] text-[#080909] flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <div className="text-xs font-mono font-bold text-[#F4F3EF] uppercase">
                  {s.subtitle}
                </div>
              </div>
            );
          })}
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form */}
          <div className="lg:col-span-7 rounded-2xl border border-white/[0.1] bg-[#0D0E10] p-6 sm:p-8">
            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="mb-6">
                  <span className="text-xs font-mono font-bold text-[#A5A7A3] uppercase tracking-wider block mb-1">
                    STEP 01 // FACILITY METADATA
                  </span>
                  <h2 className="text-2xl font-black font-mono tracking-tight text-[#F4F3EF] uppercase">
                    HOSPITAL IDENTITY
                  </h2>
                  <p className="text-xs font-mono text-[#A5A7A3] mt-1">
                    Official facility registration and state health corridor link.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-[#A5A7A3] block mb-1">
                    Hospital Name
                  </label>
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/[0.1] text-[#F4F3EF] font-mono text-xs focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono uppercase text-[#A5A7A3] block mb-1">
                      Hospital ID / Facility Code
                    </label>
                    <input
                      type="text"
                      value={hospitalId}
                      onChange={(e) => setHospitalId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/[0.1] text-[#F4F3EF] font-mono text-xs focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase text-[#A5A7A3] block mb-1">
                      Geographic District
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/[0.1] text-[#F4F3EF] font-mono text-xs focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-[#A5A7A3] block mb-1">
                    Hospital Classification
                  </label>
                  <select
                    value={hospitalType}
                    onChange={(e) => setHospitalType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/[0.1] text-[#F4F3EF] font-mono text-xs focus:outline-none focus:border-white/30"
                  >
                    <option value="Government Tertiary Apex Facility">Government Tertiary Apex Facility</option>
                    <option value="District General Hospital">District General Hospital</option>
                    <option value="Medical College & Research Institute">Medical College & Research Institute</option>
                    <option value="Super-Specialty Pulmonary Center">Super-Specialty Pulmonary Center</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2.5 rounded-xl bg-[#141619] border border-white/[0.15] hover:bg-[#181B1F] text-[#F4F3EF] font-mono font-bold text-xs uppercase transition-all"
                  >
                    NEXT: CAPACITY CONFIGURATION →
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-5">
                <div className="mb-6">
                  <span className="text-xs font-mono font-bold text-[#A5A7A3] uppercase tracking-wider block mb-1">
                    STEP 02 // RESOURCE INVENTORY
                  </span>
                  <h2 className="text-2xl font-black font-mono tracking-tight text-[#F4F3EF] uppercase">
                    CAPACITY SPECIFICATION
                  </h2>
                  <p className="text-xs font-mono text-[#A5A7A3] mt-1">
                    Configures baseline thresholds for 7-day predictive models.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono uppercase text-[#A5A7A3] block mb-1">
                      Total Inpatient Beds
                    </label>
                    <input
                      type="number"
                      value={totalBeds}
                      onChange={(e) => setTotalBeds(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/[0.1] text-[#F4F3EF] font-mono text-xs focus:outline-none focus:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono uppercase text-[#A5A7A3] block mb-1">
                      Dedicated ICU Beds
                    </label>
                    <input
                      type="number"
                      value={icuBeds}
                      onChange={(e) => setIcuBeds(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/[0.1] text-[#F4F3EF] font-mono text-xs focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono uppercase text-[#A5A7A3] block mb-1">
                      Ventilators Fleet
                    </label>
                    <input
                      type="number"
                      value={ventilators}
                      onChange={(e) => setVentilators(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/[0.1] text-[#F4F3EF] font-mono text-xs focus:outline-none focus:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono uppercase text-[#A5A7A3] block mb-1">
                      Oxygen Storage Capacity
                    </label>
                    <input
                      type="text"
                      value={oxygenCapacity}
                      onChange={(e) => setOxygenCapacity(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/[0.1] text-[#F4F3EF] font-mono text-xs focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2.5 rounded-xl border border-white/[0.1] text-[#A5A7A3] font-mono text-xs uppercase hover:text-white"
                  >
                    ← BACK
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-2.5 rounded-xl bg-[#141619] border border-white/[0.15] hover:bg-[#181B1F] text-[#F4F3EF] font-mono font-bold text-xs uppercase transition-all"
                  >
                    NEXT: COMMAND ADMINISTRATOR →
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <form onSubmit={handleFinish} className="space-y-5">
                <div className="mb-6">
                  <span className="text-xs font-mono font-bold text-[#A5A7A3] uppercase tracking-wider block mb-1">
                    STEP 03 // SECURITY CREDENTIALS
                  </span>
                  <h2 className="text-2xl font-black font-mono tracking-tight text-[#F4F3EF] uppercase">
                    COMMAND ADMINISTRATOR
                  </h2>
                  <p className="text-xs font-mono text-[#A5A7A3] mt-1">
                    Primary medical authority empowered to trigger capacity load shedding.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-[#A5A7A3] block mb-1">
                    Administrator Full Name & Title
                  </label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/[0.1] text-[#F4F3EF] font-mono text-xs focus:outline-none focus:border-white/30"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-[#A5A7A3] block mb-1">
                    Official Government Email
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/[0.1] text-[#F4F3EF] font-mono text-xs focus:outline-none focus:border-white/30"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-[#A5A7A3] block mb-1">
                    Security Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/[0.1] text-[#F4F3EF] font-mono text-xs focus:outline-none focus:border-white/30"
                    required
                  />
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2.5 rounded-xl border border-white/[0.1] text-[#A5A7A3] font-mono text-xs uppercase hover:text-white"
                  >
                    ← BACK
                  </button>
                  <button
                    type="submit"
                    disabled={isProvisioning}
                    className="px-6 py-2.5 rounded-xl bg-[#D3FD50] text-[#080909] font-mono font-black text-xs uppercase hover:bg-[#bce433] transition-all flex items-center gap-2 shadow-lg shadow-[#D3FD50]/15"
                  >
                    {isProvisioning ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        PROVISIONING FACILITY NODE...
                      </>
                    ) : (
                      <>
                        PROVISION FACILITY NODE →
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right: Live Manifest Spec */}
          <div className="lg:col-span-5 rounded-2xl border border-white/[0.1] bg-[#0D0E10] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
                <span className="text-xs font-mono font-bold uppercase text-[#A5A7A3] tracking-wider">
                  MANIFEST PREVIEW
                </span>
                <span className="text-[10px] font-mono text-[#D8D9D5] font-bold uppercase px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.1]">
                  SCHEMA VALID
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#080909] border border-white/[0.06] font-mono text-[11px] text-[#D8D9D5] leading-relaxed overflow-x-auto">
                <pre>
{`{
  "facility_manifest": {
    "node_id": "${hospitalId}",
    "facility_name": "${hospitalName}",
    "region": "${location}",
    "classification": "${hospitalType}"
  },
  "operational_thresholds": {
    "max_inpatient_beds": ${totalBeds},
    "icu_critical_slots": ${icuBeds},
    "mechanical_ventilators": ${ventilators},
    "oxygen_storage": "${oxygenCapacity}"
  },
  "command_authority": {
    "superintendent": "${adminName}",
    "dispatch_email": "${adminEmail}",
    "mesh_encryption": "ECDSA-P384"
  }
}`}
                </pre>
              </div>

              <div className="mt-4 text-xs font-mono text-[#A5A7A3] space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D8D9D5]" />
                  <span>Autoregressive Bayesian priors initialized</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D8D9D5]" />
                  <span>Regional medical grid load-shedding enabled</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06] text-[10px] font-mono text-white/30">
              NODE DEPLOYMENT PROTOCOL v2.8 • SMART INDIA HACKATHON
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-white/[0.08] bg-[#070809] py-4 px-6 text-center text-xs font-mono text-[#6B6D69]">
        NEXUS INFRASTRUCTURE ONBOARDING MESH
      </footer>
    </div>
  );
}
