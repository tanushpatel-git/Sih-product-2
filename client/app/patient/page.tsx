"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import HumanBody3D, { OrganNode } from "./HumanBody3D";
import HealthSummaryDoc, { HealthProfileData } from "./HealthSummaryDoc";

export default function PatientDashboardPage() {
  // Navigation active tab
  const [activeNav, setActiveNav] = useState("home");

  // Search query & suggestion popover
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Health Profile Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<HealthProfileData>({
    fullName: "Anushka Verma",
    age: "26",
    gender: "Female",
    contactNumber: "+91 98765 43210",
    email: "anushka.verma@example.com",
    height: "165",
    weight: "60",
    bloodGroup: "B+",
    conditions: [],
    allergies: "None declared",
    medications: "None",
    surgeries: "None",
    activityLevel: "Moderate",
    smoking: "No",
    alcohol: "No",
    symptoms: [],
    uploadedDocuments: [
      { name: "CBC_Blood_Panel_Aug2026.pdf", size: "1.4 MB", type: "PDF" },
      { name: "Lipid_Profile_Report.pdf", size: "890 KB", type: "PDF" },
    ],
  });

  // Selected organ state for 3D human body
  const [selectedOrgan, setSelectedOrgan] = useState<OrganNode | null>(null);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisPhaseText, setAnalysisPhaseText] = useState("");
  const [hasCompletedAnalysis, setHasCompletedAnalysis] = useState(false);

  // Prescription / Health Summary Modal
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  // Modals for Quick Actions / Health Records
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Handle Profile Form field changes
  const handleInputChange = (
    field: keyof HealthProfileData,
    value: string | string[] | { name: string; size: string; type: string }[]
  ) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleCondition = (cond: string) => {
    setProfileData((prev) => {
      const exists = prev.conditions.includes(cond);
      return {
        ...prev,
        conditions: exists
          ? prev.conditions.filter((c) => c !== cond)
          : [...prev.conditions, cond],
      };
    });
  };

  const toggleSymptom = (sym: string) => {
    setProfileData((prev) => {
      const exists = prev.symptoms.includes(sym);
      return {
        ...prev,
        symptoms: exists
          ? prev.symptoms.filter((s) => s !== sym)
          : [...prev.symptoms, sym],
      };
    });
  };

  // Mock File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const newDoc = {
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)} KB`,
        type: file.type.includes("pdf") ? "PDF" : "IMG",
      };
      setProfileData((prev) => ({
        ...prev,
        uploadedDocuments: [...prev.uploadedDocuments, newDoc],
      }));
    }
  };

  const handleRemoveDoc = (index: number) => {
    setProfileData((prev) => ({
      ...prev,
      uploadedDocuments: prev.uploadedDocuments.filter((_, i) => i !== index),
    }));
  };

  // Trigger Analysis Flow
  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(15);
    setAnalysisPhaseText("Reviewing patient profile and vitals...");

    setTimeout(() => {
      setAnalysisProgress(45);
      setAnalysisPhaseText("Processing medical history and indicators...");
    }, 900);

    setTimeout(() => {
      setAnalysisProgress(75);
      setAnalysisPhaseText("Evaluating clinical decision support parameters...");
    }, 1800);

    setTimeout(() => {
      setAnalysisProgress(100);
      setAnalysisPhaseText("Preparing AI-assisted health summary...");
      setTimeout(() => {
        setIsAnalyzing(false);
        setHasCompletedAnalysis(true);
      }, 600);
    }, 2600);
  };

  // Search recommendations filter
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const items = [
      { title: "Cerebrovascular & Stroke Risk Assessment", link: "/dashboard?model=stroke", category: "Clinical Model" },
      { title: "Coronary Heart Disease Assessment", link: "/dashboard?model=heartDisease", category: "Clinical Model" },
      { title: "Renal Function & CKD Risk Analysis", link: "/dashboard?model=kidneyDisease", category: "Clinical Model" },
      { title: "Hepatic Panel (Liver Disease Evaluation)", link: "/dashboard?model=liverDisease", category: "Clinical Model" },
      { title: "Diabetes & Glycemic Risk Model", link: "/dashboard?model=diabetes", category: "Clinical Model" },
      { title: "Cardiac Hemodynamic Evaluation (Heart Failure)", link: "/dashboard?model=heartFailure", category: "Clinical Model" },
      { title: "Hematological Anemia Classification", link: "/dashboard?model=anemia", category: "Clinical Model" },
      { title: "Lab Reports (CBC & Lipid Profile)", action: () => setActiveModal("lab_reports"), category: "Health Records" },
      { title: "Download Latest Health Summary", action: () => setIsDocModalOpen(true), category: "Documents" },
    ];
    return items.filter((item) => item.title.toLowerCase().includes(q));
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col antialiased">
      <div className="flex flex-1 w-full max-w-[1680px] mx-auto">
        {/* ══════════════════════════════════════════════════════════
            1. LEFT SIDEBAR
            ══════════════════════════════════════════════════════════ */}
        <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between p-5 shrink-0 hidden lg:flex">
          <div className="space-y-6">
            {/* VITAWEAVE Brand */}
            <div className="flex items-center gap-3 px-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-sky-500/20">
                ✦
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
                  VITAWEAVE
                </span>
                <span className="block text-[11px] font-medium text-slate-400 tracking-normal mt-0.5">
                  Your Health. Smarter.
                </span>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="space-y-1">
              {[
                { id: "home", label: "Home", icon: "🏠" },
                { id: "my_health", label: "My Health", icon: "❤️" },
                { id: "case_sheets", label: "Case Sheets", icon: "📋" },
                { id: "appointments", label: "Appointments", icon: "📅" },
                { id: "reports", label: "Reports", icon: "📊" },
                { id: "medications", label: "Medications", icon: "💊" },
                { id: "health_records", label: "Health Records", icon: "📁" },
                { id: "ai_assistant", label: "AI Assistant", icon: "✨" },
              ].map((item) => {
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveNav(item.id);
                      if (item.id === "reports" || item.id === "health_records") {
                        setActiveModal("records");
                      } else if (item.id === "ai_assistant") {
                        setActiveModal("ai_assistant");
                      } else if (item.id === "appointments") {
                        setActiveModal("appointment");
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-sky-50 text-sky-700 font-semibold shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar Section */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            {/* Philosophy Card */}
            <div className="bg-[#F0FDF4] border border-emerald-100 rounded-2xl p-3.5 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">
                  🌱
                </span>
                <span className="text-[11px] font-bold text-emerald-900">
                  Traditional Wisdom.
                </span>
              </div>
              <p className="text-[11px] font-bold text-emerald-900 leading-tight">
                Modern Intelligence.
              </p>
              <p className="text-[10px] text-emerald-700/80 leading-relaxed pt-0.5">
                Better insights for a healthier tomorrow.
              </p>
            </div>

            {/* Patient Profile */}
            <div className="flex items-center justify-between px-2 pt-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-200 to-rose-300 flex items-center justify-center text-xs font-bold text-slate-800 border border-white shadow-xs">
                  AV
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Anushka Verma
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Patient ID: VW-28473
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveModal("settings")}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                title="Settings"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </aside>

        {/* ══════════════════════════════════════════════════════════
            2. MAIN CONTENT AREA
            ══════════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* ── TOP HEADER ── */}
          <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-xl">
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400 text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  placeholder="Search symptoms, reports, or ask VITAWEAVE..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                />
              </div>

              {/* Instant Search Results Dropdown */}
              {isSearchFocused && searchResults.length > 0 && (
                <div className="absolute top-12 left-0 w-full bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-40">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick Results
                  </div>
                  {searchResults.map((item, idx) => (
                    <div key={idx}>
                      {item.link ? (
                        <Link
                          href={item.link}
                          className="flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                        >
                          <span>{item.title}</span>
                          <span className="text-[10px] text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded font-medium">
                            {item.category}
                          </span>
                        </Link>
                      ) : (
                        <button
                          onClick={item.action}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition text-left"
                        >
                          <span>{item.title}</span>
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                            {item.category}
                          </span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Profile & Notification Header section */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              {/* Notification Button */}
              <button
                onClick={() => setActiveModal("notifications")}
                className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                title="Notifications"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
              </button>

              {/* Patient Profile Pill */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-200 to-rose-300 flex items-center justify-center text-xs font-bold text-slate-800">
                  AV
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-800 leading-none">
                    Anushka Verma
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                    Patient
                  </div>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </header>

          {/* ── MAIN DASHBOARD BODY ── */}
          <main className="p-4 sm:p-8 space-y-6">
            {/* ══════════════════════════════════════════════════════════
                HERO SECTION (3D Anatomical Twin + View Detailed Analysis)
                ══════════════════════════════════════════════════════════ */}
            <section className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Side: Greeting & Description */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="space-y-2">
                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      Good Morning,
                    </div>
                    <div className="text-3xl sm:text-4xl font-black text-slate-900 flex items-center gap-2">
                      <span>Anushka</span>
                      <span className="text-amber-400">☀️</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                    Your health journey matters. We&apos;re here to support you with
                    personalized insights, AI-powered analysis and better care.
                  </p>

                  {/* ── CRITICAL BUTTON: "View Detailed Analysis →" ── */}
                  <Link
                    href="/dashboard"
                    className="group block bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border border-sky-200/70 hover:border-sky-300 rounded-2xl p-4 transition-all duration-200 hover:shadow-md hover:shadow-sky-500/5 max-w-md"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center text-lg shadow-xs group-hover:scale-105 transition-transform">
                          🩺
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                            View Detailed Analysis
                          </div>
                          <div className="text-xs text-slate-500 font-medium">
                            Explore your health insights, models and risk analysis
                          </div>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-white border border-sky-200 flex items-center justify-center text-sky-600 group-hover:translate-x-1 transition-transform">
                        →
                      </div>
                    </div>
                  </Link>

                  {selectedOrgan && (
                    <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-3 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-sky-900">
                          {selectedOrgan.name}:
                        </span>{" "}
                        <span className="text-slate-700">{selectedOrgan.status}</span>
                      </div>
                      {selectedOrgan.modelKey && (
                        <Link
                          href={`/dashboard?model=${selectedOrgan.modelKey}`}
                          className="text-sky-600 font-semibold hover:underline"
                        >
                          Open Model →
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Side: 3D Anatomical Human Model */}
                <div className="lg:col-span-7 flex justify-center items-center">
                  <HumanBody3D
                    onSelectOrgan={(organ) => setSelectedOrgan(organ)}
                    selectedOrganId={selectedOrgan?.id}
                  />
                </div>
              </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                MIDDLE SECTION: 2-Column Grid (Left: Form/Records, Right: Rail)
                ══════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* ── LEFT & MIDDLE COLUMN (xl:col-span-8) ── */}
              <div className="xl:col-span-8 space-y-6">
                {/* ── "TELL US ABOUT YOURSELF" Multi-step Form ── */}
                <section className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Tell Us About Yourself
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Complete your health profile to help VITAWEAVE provide more relevant insights.
                      </p>
                    </div>
                    <div className="text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-100 px-3 py-1 rounded-full self-start sm:self-auto">
                      Step {currentStep} of 4
                    </div>
                  </div>

                  {/* Step Progress Indicators */}
                  <div className="flex items-center gap-2 sm:gap-4 my-5 overflow-x-auto pb-2 no-scrollbar">
                    {[
                      { step: 1, label: "Personal Info" },
                      { step: 2, label: "Medical History" },
                      { step: 3, label: "Documents" },
                      { step: 4, label: "Review" },
                    ].map((s) => (
                      <button
                        key={s.step}
                        onClick={() => setCurrentStep(s.step)}
                        className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                          currentStep === s.step
                            ? "bg-sky-600 text-white"
                            : currentStep > s.step
                            ? "bg-sky-50 text-sky-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                          {s.step}
                        </span>
                        <span>{s.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* ── STEP 1: Personal Information ── */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={profileData.fullName}
                            onChange={(e) => handleInputChange("fullName", e.target.value)}
                            placeholder="Enter your full name"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition text-slate-800"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Age *
                            </label>
                            <input
                              type="number"
                              value={profileData.age}
                              onChange={(e) => handleInputChange("age", e.target.value)}
                              placeholder="e.g. 26"
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition text-slate-800"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Gender *
                            </label>
                            <select
                              value={profileData.gender}
                              onChange={(e) => handleInputChange("gender", e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition text-slate-800"
                            >
                              <option value="Female">Female</option>
                              <option value="Male">Male</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Contact Number *
                          </label>
                          <input
                            type="tel"
                            value={profileData.contactNumber}
                            onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition text-slate-800"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Height (cm)
                            </label>
                            <input
                              type="number"
                              value={profileData.height}
                              onChange={(e) => handleInputChange("height", e.target.value)}
                              placeholder="165"
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition text-slate-800"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Weight (kg)
                            </label>
                            <input
                              type="number"
                              value={profileData.weight}
                              onChange={(e) => handleInputChange("weight", e.target.value)}
                              placeholder="60"
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition text-slate-800"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Blood Group
                            </label>
                            <select
                              value={profileData.bloodGroup}
                              onChange={(e) => handleInputChange("bloodGroup", e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition text-slate-800"
                            >
                              <option value="B+">B+</option>
                              <option value="A+">A+</option>
                              <option value="O+">O+</option>
                              <option value="AB+">AB+</option>
                              <option value="B-">B-</option>
                              <option value="A-">A-</option>
                              <option value="O-">O-</option>
                              <option value="AB-">AB-</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => alert("Personal information saved successfully.")}
                          className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                        >
                          Save Draft
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition shadow-xs"
                        >
                          Next: Medical History →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── STEP 2: Medical History ── */}
                  {currentStep === 2 && (
                    <div className="space-y-4 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">
                          Existing Conditions
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Hypertension",
                            "Diabetes",
                            "Asthma",
                            "Thyroid Disorder",
                            "Migraine",
                            "None",
                          ].map((cond) => {
                            const isSelected = profileData.conditions.includes(cond);
                            return (
                              <button
                                key={cond}
                                type="button"
                                onClick={() => toggleCondition(cond)}
                                className={`px-3 py-1.5 rounded-lg border text-xs transition ${
                                  isSelected
                                    ? "bg-sky-50 border-sky-300 text-sky-800 font-semibold"
                                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                }`}
                              >
                                {isSelected ? "✓ " : "+ "}
                                {cond}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Allergies
                          </label>
                          <input
                            type="text"
                            value={profileData.allergies}
                            onChange={(e) => handleInputChange("allergies", e.target.value)}
                            placeholder="e.g. Penicillin, Pollen, or None"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Current Medications
                          </label>
                          <input
                            type="text"
                            value={profileData.medications}
                            onChange={(e) => handleInputChange("medications", e.target.value)}
                            placeholder="e.g. Multivitamins, or None"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">
                          Symptoms Today
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Fatigue / Low Energy",
                            "Mild Headache",
                            "Chest Tightness",
                            "Joint Stiffness",
                            "Shortness of breath on exertion",
                            "None",
                          ].map((sym) => {
                            const isSelected = profileData.symptoms.includes(sym);
                            return (
                              <button
                                key={sym}
                                type="button"
                                onClick={() => toggleSymptom(sym)}
                                className={`px-3 py-1.5 rounded-lg border text-xs transition ${
                                  isSelected
                                    ? "bg-sky-50 border-sky-300 text-sky-800 font-semibold"
                                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                }`}
                              >
                                {isSelected ? "✓ " : "+ "}
                                {sym}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(3)}
                          className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition shadow-xs"
                        >
                          Next: Documents →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── STEP 3: Documents ── */}
                  {currentStep === 3 && (
                    <div className="space-y-4 text-xs">
                      {/* Upload Drop Zone */}
                      <label className="border-2 border-dashed border-slate-200 hover:border-sky-300 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-sky-50/30 transition">
                        <span className="text-2xl mb-1 text-sky-600">📁</span>
                        <span className="font-semibold text-slate-800">
                          Click to upload or drag medical reports
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5">
                          PDF, PNG, JPG up to 10MB (Lab reports, previous prescriptions)
                        </span>
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>

                      {/* Uploaded Documents List */}
                      <div>
                        <div className="font-semibold text-slate-700 mb-2">
                          Attached Records ({profileData.uploadedDocuments.length})
                        </div>
                        <div className="space-y-2">
                          {profileData.uploadedDocuments.map((doc, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-sm">📄</span>
                                <div>
                                  <div className="font-bold text-slate-800">
                                    {doc.name}
                                  </div>
                                  <div className="text-[10px] text-slate-500">
                                    {doc.type} · {doc.size}
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveDoc(idx)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                                title="Remove file"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(4)}
                          className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition shadow-xs"
                        >
                          Next: Review & Run Analysis →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── STEP 4: Review & Run Health Analysis ── */}
                  {currentStep === 4 && (
                    <div className="space-y-4 text-xs">
                      {isAnalyzing ? (
                        /* Processing State */
                        <div className="py-8 text-center space-y-4">
                          <div className="w-12 h-12 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
                          <div className="space-y-1">
                            <div className="text-sm font-bold text-slate-900">
                              Analyzing your health information...
                            </div>
                            <div className="text-xs text-slate-500">
                              {analysisPhaseText}
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div className="max-w-xs mx-auto bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-sky-600 h-full transition-all duration-300 rounded-full"
                              style={{ width: `${analysisProgress}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        /* Review Summary */
                        <div className="space-y-4">
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">
                                Personal Details:
                              </span>
                              <button
                                onClick={() => setCurrentStep(1)}
                                className="text-sky-600 font-semibold hover:underline text-[11px]"
                              >
                                Edit
                              </button>
                            </div>
                            <p className="text-slate-600">
                              {profileData.fullName}, {profileData.age} Y, {profileData.gender}, {profileData.bloodGroup} | Height: {profileData.height}cm, Weight: {profileData.weight}kg
                            </p>
                          </div>

                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">
                                Medical History & Symptoms:
                              </span>
                              <button
                                onClick={() => setCurrentStep(2)}
                                className="text-sky-600 font-semibold hover:underline text-[11px]"
                              >
                                Edit
                              </button>
                            </div>
                            <p className="text-slate-600">
                              Conditions: {profileData.conditions.join(", ") || "None"} | Symptoms: {profileData.symptoms.join(", ") || "None"} | Allergies: {profileData.allergies}
                            </p>
                          </div>

                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">
                                Attached Records:
                              </span>
                              <button
                                onClick={() => setCurrentStep(3)}
                                className="text-sky-600 font-semibold hover:underline text-[11px]"
                              >
                                Edit
                              </button>
                            </div>
                            <p className="text-slate-600">
                              {profileData.uploadedDocuments.length} document(s) uploaded
                            </p>
                          </div>

                          {hasCompletedAnalysis && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-800 text-xs flex items-center justify-between">
                              <span>✓ Analysis Completed. Health summary is ready!</span>
                              <button
                                onClick={() => setIsDocModalOpen(true)}
                                className="font-bold underline text-emerald-900"
                              >
                                View Summary
                              </button>
                            </div>
                          )}

                          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => setCurrentStep(3)}
                              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                            >
                              ← Back
                            </button>
                            <button
                              type="button"
                              onClick={handleRunAnalysis}
                              className="px-6 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition shadow-md shadow-sky-500/20"
                            >
                              ⚡ Run Health Analysis
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </section>

                {/* ── MIDDLE SUB-SECTION: My Health Records & Recent Activity ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* My Health Records Card */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sky-600">📁</span>
                        <h3 className="text-sm font-bold text-slate-900">
                          My Health Records
                        </h3>
                      </div>
                      <button
                        onClick={() => setActiveModal("records")}
                        className="text-xs text-sky-600 font-semibold hover:underline"
                      >
                        View All →
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      {[
                        { title: "Medical History", date: "Updated on 20 Aug 2026", icon: "📋" },
                        { title: "Lab Reports", date: "2 reports available", icon: "🔬" },
                        { title: "Prescriptions", date: "Last updated on 15 Aug 2026", icon: "💊" },
                        { title: "Appointments", date: "Next on 10 Sep 2026", icon: "📅" },
                      ].map((rec, i) => (
                        <div
                          key={i}
                          onClick={() => setActiveModal("records")}
                          className="flex items-center justify-between p-2.5 bg-slate-50/70 hover:bg-slate-100/70 border border-slate-100 rounded-xl cursor-pointer transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-slate-500">{rec.icon}</span>
                            <div>
                              <div className="font-semibold text-slate-800">
                                {rec.title}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {rec.date}
                              </div>
                            </div>
                          </div>
                          <span className="text-slate-400 text-xs">›</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Your Recent Activity Card */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sky-600">⚡</span>
                        <h3 className="text-sm font-bold text-slate-900">
                          Your Recent Activity
                        </h3>
                      </div>
                      <button
                        onClick={() => setActiveModal("activity")}
                        className="text-xs text-sky-600 font-semibold hover:underline"
                      >
                        View All →
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      {[
                        { action: "Case sheet generated", time: "10:24 AM · 28 Aug 2026", icon: "📝", color: "text-emerald-600" },
                        { action: "Report uploaded", time: "28 Aug 2026", icon: "📄", color: "text-sky-600" },
                        { action: "Prescription ready", time: "25 Aug 2026", icon: "✓", color: "text-amber-600" },
                      ].map((act, i) => (
                        <div
                          key={i}
                          onClick={() => setActiveModal("activity")}
                          className="flex items-center justify-between p-2.5 bg-slate-50/70 hover:bg-slate-100/70 border border-slate-100 rounded-xl cursor-pointer transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`text-sm ${act.color}`}>{act.icon}</span>
                            <div>
                              <div className="font-semibold text-slate-800">
                                {act.action}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {act.time}
                              </div>
                            </div>
                          </div>
                          <span className="text-slate-400 text-xs">›</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── RIGHT RAIL COLUMN (xl:col-span-4) ── */}
              <div className="xl:col-span-4 space-y-6">
                {/* ── YOUR HEALTH SCORE CARD ── */}
                <section className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      Your Health Score
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Last Updated: 28 Aug 2026
                    </span>
                  </div>

                  {/* Circular Score Gauge */}
                  <div className="flex items-center gap-6">
                    <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#E2E8F0"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#0284C7"
                          strokeWidth="8"
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 * (1 - 0.78)}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-black text-slate-900">
                          78%
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600">
                          Good
                        </span>
                      </div>
                    </div>

                    {/* Breakdown bars */}
                    <div className="flex-1 space-y-2.5 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-600 font-medium flex items-center gap-1">
                            <span>💚</span> Physical Health
                          </span>
                          <span className="font-bold text-slate-800">82%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full w-[82%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-600 font-medium flex items-center gap-1">
                            <span>🧠</span> Mental Well-being
                          </span>
                          <span className="font-bold text-slate-800">76%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-sky-500 h-full rounded-full w-[76%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-600 font-medium flex items-center gap-1">
                            <span>🌿</span> Lifestyle Balance
                          </span>
                          <span className="font-bold text-slate-800">71%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-purple-500 h-full rounded-full w-[71%]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ── QUICK ACTIONS (2x2 Grid) ── */}
                <section className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      Quick Actions
                    </h3>
                    <button
                      onClick={() => setActiveModal("quick_actions")}
                      className="text-xs text-sky-600 font-semibold hover:underline"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setActiveModal("appointment")}
                      className="p-3.5 bg-slate-50 hover:bg-sky-50/70 border border-slate-100 hover:border-sky-200 rounded-2xl text-left transition group"
                    >
                      <div className="text-xl mb-1 text-sky-600">📅</div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-sky-700">
                        Book Appointment
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                        Consult with your doctor
                      </div>
                    </button>

                    <button
                      onClick={() => setCurrentStep(3)}
                      className="p-3.5 bg-slate-50 hover:bg-sky-50/70 border border-slate-100 hover:border-sky-200 rounded-2xl text-left transition group"
                    >
                      <div className="text-xl mb-1 text-sky-600">☁️</div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-sky-700">
                        Upload Reports
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                        Add your medical reports
                      </div>
                    </button>

                    <button
                      onClick={() => setCurrentStep(1)}
                      className="p-3.5 bg-slate-50 hover:bg-sky-50/70 border border-slate-100 hover:border-sky-200 rounded-2xl text-left transition group"
                    >
                      <div className="text-xl mb-1 text-sky-600">📋</div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-sky-700">
                        Fill Health Form
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                        Update your medical history
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveModal("ai_assistant")}
                      className="p-3.5 bg-slate-50 hover:bg-sky-50/70 border border-slate-100 hover:border-sky-200 rounded-2xl text-left transition group"
                    >
                      <div className="text-xl mb-1 text-purple-600">✨</div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-purple-700">
                        Ask VITAWEAVE AI
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                        Get instant health insights
                      </div>
                    </button>
                  </div>
                </section>

                {/* ── YOUR LATEST PRESCRIPTION / HEALTH SUMMARY CARD ── */}
                <section className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      Your Latest Prescription
                    </h3>
                    <button
                      onClick={() => setIsDocModalOpen(true)}
                      className="text-xs text-sky-600 font-semibold hover:underline"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center text-xs">
                          👤
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          AI Generated · 28 Aug 2026
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Ready to Download
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Personalized Health Prescription
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Based on your symptoms, medical history and AI analysis.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setIsDocModalOpen(true)}
                        className="flex-1 px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
                      >
                        <span>📥</span>
                        <span>Download Prescription</span>
                      </button>
                      <button
                        onClick={() => setIsDocModalOpen(true)}
                        className="px-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-bold transition"
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => setIsDocModalOpen(true)}
                        className="px-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-bold transition"
                      >
                        PNG
                      </button>
                      <button
                        onClick={() => setIsDocModalOpen(true)}
                        className="px-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-bold transition"
                      >
                        JPG
                      </button>
                    </div>
                  </div>

                  {/* Botanical Quote Banner */}
                  <div className="mt-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center text-lg shrink-0">
                      🌿
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[11px] text-emerald-950 font-medium italic leading-snug">
                        &ldquo;Your health is not just the absence of disease, but a state of complete balance.&rdquo;
                      </p>
                      <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                        — VITAWEAVE
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                BOTTOM SECTION: "YOUR HEALTH JOURNEY" TIMELINE
                ══════════════════════════════════════════════════════════ */}
            <section className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center text-sm font-bold">
                    📈
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Your Health Journey
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      From your first visit to continuous care — all in one place.
                    </p>
                  </div>
                </div>
              </div>

              {/* Horizontal Stepper Timeline */}
              <div className="pt-2 overflow-x-auto pb-2 no-scrollbar">
                <div className="min-w-[680px] flex items-center justify-between relative">
                  {/* Connecting Line */}
                  <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 z-0" />
                  <div className="absolute top-4 left-6 w-[45%] h-0.5 bg-sky-500 z-0" />

                  {[
                    { step: 1, title: "Visit", status: "completed", icon: "✓" },
                    { step: 2, title: "Case Sheet", status: "completed", icon: "✓" },
                    { step: 3, title: "AI Analysis", status: "active", icon: "⚡" },
                    { step: 4, title: "Doctor Review", status: "pending", icon: "🩺" },
                    { step: 5, title: "Prescription", status: "pending", icon: "📄" },
                    { step: 6, title: "Follow-up", status: "pending", icon: "🔒" },
                  ].map((st) => (
                    <div
                      key={st.step}
                      className="relative z-10 flex flex-col items-center gap-2 group cursor-pointer"
                      onClick={() => {
                        if (st.title === "AI Analysis") {
                          setCurrentStep(4);
                        } else if (st.title === "Doctor Review" || st.title === "Prescription") {
                          setIsDocModalOpen(true);
                        }
                      }}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          st.status === "completed"
                            ? "bg-emerald-500 text-white shadow-xs"
                            : st.status === "active"
                            ? "bg-sky-600 text-white ring-4 ring-sky-100 shadow-md animate-pulse"
                            : "bg-white border-2 border-slate-200 text-slate-400"
                        }`}
                      >
                        {st.icon}
                      </div>
                      <div
                        className={`text-xs font-semibold text-center ${
                          st.status === "active"
                            ? "text-sky-700"
                            : st.status === "completed"
                            ? "text-slate-800"
                            : "text-slate-400"
                        }`}
                      >
                        {st.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* ── Document / Health Summary Modal ── */}
      <HealthSummaryDoc
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        data={profileData}
      />

      {/* ── Generic Quick Action / Assistant Modal ── */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">
                {activeModal === "appointment" && "📅 Book Doctor Appointment"}
                {activeModal === "ai_assistant" && "✨ VITAWEAVE Clinical Assistant"}
                {activeModal === "records" && "📁 Health Records Repository"}
                {activeModal === "activity" && "⚡ Activity Stream"}
                {activeModal === "notifications" && "🔔 Notifications"}
                {activeModal === "settings" && "⚙️ Patient Settings"}
                {activeModal === "quick_actions" && "⚡ Quick Actions Menu"}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              {activeModal === "appointment" && (
                <div className="space-y-3">
                  <p>Schedule a follow-up consultation with your attending specialist.</p>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <div>
                      <span className="font-semibold text-slate-700">Specialty:</span> General Medicine / Preventive Cardiology
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Available Date:</span> 10 Sep 2026 at 10:30 AM
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      alert("Appointment request submitted successfully.");
                      setActiveModal(null);
                    }}
                    className="w-full py-2 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition"
                  >
                    Confirm Appointment
                  </button>
                </div>
              )}

              {activeModal === "ai_assistant" && (
                <div className="space-y-3">
                  <p>
                    VITAWEAVE AI is connected to 8 clinical ML ensembles (Stroke, Coronary Heart Disease, Liver, Kidney, Diabetes, Heart Failure, Anemia, Breast Cancer).
                  </p>
                  <p className="bg-sky-50 p-3 rounded-xl text-sky-800">
                    To interact directly with decision trees and feature attribution radars, visit the <strong>View Detailed Analysis</strong> workstation.
                  </p>
                  <Link
                    href="/dashboard"
                    className="block text-center py-2 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition"
                  >
                    Open Clinical Workstation →
                  </Link>
                </div>
              )}

              {activeModal === "records" && (
                <div className="space-y-2">
                  <p>All laboratory reports, case sheets, and medical records are synchronized with your patient ID: <strong>VW-28473</strong>.</p>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-800">CBC_Blood_Panel_Aug2026.pdf</div>
                    <div className="text-[10px] text-slate-400">1.4 MB · Uploaded 28 Aug 2026</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-800">Lipid_Profile_Report.pdf</div>
                    <div className="text-[10px] text-slate-400">890 KB · Uploaded 20 Aug 2026</div>
                  </div>
                </div>
              )}

              {activeModal === "activity" && (
                <div className="space-y-2">
                  <p>Recent events recorded in your healthcare timeline:</p>
                  <ul className="space-y-1.5 list-disc pl-4 text-slate-600">
                    <li>Case sheet generated (10:24 AM · 28 Aug 2026)</li>
                    <li>Report uploaded (28 Aug 2026)</li>
                    <li>Prescription ready (25 Aug 2026)</li>
                    <li>Profile updated (Just now)</li>
                  </ul>
                </div>
              )}

              {activeModal === "notifications" && (
                <div className="space-y-2">
                  <div className="p-2.5 bg-sky-50 border border-sky-100 rounded-xl">
                    <div className="font-bold text-sky-900">Health Summary Available</div>
                    <div className="text-[10px] text-sky-700">Your AI-assisted health summary is ready for download.</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-800">Upcoming Consultation</div>
                    <div className="text-[10px] text-slate-500">Scheduled on 10 Sep 2026.</div>
                  </div>
                </div>
              )}

              {activeModal === "settings" && (
                <div className="space-y-2">
                  <p>Patient Account Settings for <strong>Anushka Verma</strong> (VW-28473).</p>
                  <p className="text-slate-500 text-[11px]">System: VITAWEAVE Government Healthcare Platform · Release 2.4.0</p>
                </div>
              )}

              {activeModal === "quick_actions" && (
                <div className="space-y-2">
                  <p>Quick access to all patient healthcare tools.</p>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => setActiveModal("appointment")}
                      className="p-2 bg-slate-50 rounded-lg text-left font-semibold text-slate-700 hover:bg-sky-50"
                    >
                      📅 Appointment
                    </button>
                    <button
                      onClick={() => {
                        setActiveModal(null);
                        setCurrentStep(3);
                      }}
                      className="p-2 bg-slate-50 rounded-lg text-left font-semibold text-slate-700 hover:bg-sky-50"
                    >
                      ☁️ Upload Docs
                    </button>
                    <button
                      onClick={() => {
                        setActiveModal(null);
                        setCurrentStep(1);
                      }}
                      className="p-2 bg-slate-50 rounded-lg text-left font-semibold text-slate-700 hover:bg-sky-50"
                    >
                      📋 Profile Form
                    </button>
                    <button
                      onClick={() => setActiveModal("ai_assistant")}
                      className="p-2 bg-slate-50 rounded-lg text-left font-semibold text-slate-700 hover:bg-sky-50"
                    >
                      ✨ Ask AI
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
