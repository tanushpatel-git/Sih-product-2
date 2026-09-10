"use client";

import React, { useRef } from "react";

export interface HealthProfileData {
  fullName: string;
  age: string;
  gender: string;
  contactNumber: string;
  email: string;
  height: string;
  weight: string;
  bloodGroup: string;
  conditions: string[];
  allergies: string;
  medications: string;
  surgeries: string;
  activityLevel: string;
  smoking: string;
  alcohol: string;
  symptoms: string[];
  uploadedDocuments: { name: string; size: string; type: string }[];
}

interface HealthSummaryDocProps {
  isOpen: boolean;
  onClose: () => void;
  data: HealthProfileData;
  assessmentDate?: string;
}

export default function HealthSummaryDoc({
  isOpen,
  onClose,
  data,
  assessmentDate = "28 Aug 2026",
}: HealthSummaryDocProps) {
  const docRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  // Calculate BMI
  const heightM = parseFloat(data.height) / 100;
  const weightKg = parseFloat(data.weight);
  const bmi =
    heightM > 0 && weightKg > 0 ? (weightKg / (heightM * heightM)).toFixed(1) : "22.0";

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPng = () => {
    if (!docRef.current) return;
    // Canvas rasterization
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 1130;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw clean background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative top header bar
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(0, 0, canvas.width, 10);

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText("VITAWEAVE — AI-ASSISTED HEALTH SUMMARY", 40, 55);

    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("National Public Health Digital Mission · Autonomous Health Record", 40, 78);
    ctx.fillText(`Date: ${assessmentDate} | Patient ID: VW-28473`, 40, 96);

    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 115);
    ctx.lineTo(760, 115);
    ctx.stroke();

    // Patient Info box
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(40, 130, 720, 85);
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(`Patient Name: ${data.fullName || "Anushka Verma"}`, 60, 155);
    ctx.fillText(`Age / Gender: ${data.age || "26"} Y / ${data.gender || "Female"}`, 60, 178);
    ctx.fillText(`Blood Group: ${data.bloodGroup || "B+"}`, 60, 200);

    ctx.fillText(`Contact: ${data.contactNumber || "+91 98765 43210"}`, 400, 155);
    ctx.fillText(`Height / Weight: ${data.height || "165"} cm / ${data.weight || "60"} kg (BMI ${bmi})`, 400, 178);
    ctx.fillText(`Lifestyle: ${data.activityLevel || "Moderate"} Activity, Non-smoker`, 400, 200);

    // Clinical Indicators
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("CLINICAL INDICATORS & EVALUATION STATUS", 40, 250);

    const indicators = [
      { name: "Cerebrovascular Assessment", status: "Available (Logistic Model)", risk: "Decision Support Ready" },
      { name: "Coronary Artery Disease", status: "Available (Framingham / RF)", risk: "Decision Support Ready" },
      { name: "Renal Function (CKD)", status: "Available (Ensemble)", risk: "Decision Support Ready" },
      { name: "Hepatic Metabolic Panel", status: "Available (ILPD Model)", risk: "Decision Support Ready" },
      { name: "Metabolic / Glycemic", status: "Available (Ensemble Trees)", risk: "Decision Support Ready" },
    ];

    let yPos = 280;
    indicators.forEach((ind) => {
      ctx.fillStyle = "#f1f5f9";
      ctx.fillRect(40, yPos, 720, 32);
      ctx.fillStyle = "#1e293b";
      ctx.font = "12px sans-serif";
      ctx.fillText(ind.name, 55, yPos + 20);
      ctx.fillStyle = "#0284c7";
      ctx.fillText(ind.status, 350, yPos + 20);
      ctx.fillStyle = "#059669";
      ctx.fillText(ind.risk, 580, yPos + 20);
      yPos += 40;
    });

    // Medical History & Symptoms
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("REPORTED SYMPTOMS & MEDICAL HISTORY", 40, 520);

    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#334155";
    ctx.fillText(
      `Active Symptoms: ${data.symptoms.length > 0 ? data.symptoms.join(", ") : "None reported"}`,
      40,
      550
    );
    ctx.fillText(
      `Existing Conditions: ${data.conditions.length > 0 ? data.conditions.join(", ") : "None documented"}`,
      40,
      575
    );
    ctx.fillText(`Allergies: ${data.allergies || "No known drug allergies"}`, 40, 600);
    ctx.fillText(`Current Medications: ${data.medications || "None"}`, 40, 625);

    // Recommendations
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("PREVENTIVE RECOMMENDATIONS & GUIDANCE", 40, 680);

    const recs = [
      "1. Routine annual metabolic screening (Fasting Blood Glucose, HbA1c, Lipid Profile).",
      "2. Maintain adequate hydration (>2.5L daily) and moderate aerobic exercise 150 mins/week.",
      "3. Balanced nutrient-dense diet emphasizing whole grains, leafy greens, and lean protein.",
      "4. Digital Health Monitoring: Follow-up vitals logging scheduled within 30 days.",
    ];

    yPos = 710;
    recs.forEach((r) => {
      ctx.fillStyle = "#334155";
      ctx.font = "12px sans-serif";
      ctx.fillText(r, 40, yPos);
      yPos += 24;
    });

    // Clinician status box
    ctx.fillStyle = "#fef2f2";
    ctx.fillRect(40, 830, 720, 75);
    ctx.strokeStyle = "#fecaca";
    ctx.strokeRect(40, 830, 720, 75);

    ctx.fillStyle = "#991b1b";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("STATUS: PENDING CLINICIAN REVIEW & COUNTER-SIGNATURE", 60, 858);
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#7f1d1d";
    ctx.fillText(
      "This document is an AI-assisted health summary for decision support and does not constitute",
      60,
      878
    );
    ctx.fillText(
      "an independent clinical diagnosis or finalized medical prescription.",
      60,
      894
    );

    // Footer signature line
    ctx.strokeStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.moveTo(520, 990);
    ctx.lineTo(740, 990);
    ctx.stroke();
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("Authorized Medical Practitioner", 540, 1010);
    ctx.fillText("Seal & Signature", 590, 1025);

    // Download trigger
    const link = document.createElement("a");
    link.download = `VITAWEAVE_Health_Summary_VW28473.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleDownloadJpg = () => {
    if (!docRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 1130;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render basic header & details
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(0, 0, canvas.width, 10);
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText("VITAWEAVE — AI-ASSISTED HEALTH SUMMARY", 40, 55);

    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText(`Date: ${assessmentDate} | Patient ID: VW-28473`, 40, 80);

    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(40, 110, 720, 85);
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(`Patient: ${data.fullName || "Anushka Verma"} (${data.age || "26"} Y, ${data.gender || "Female"})`, 60, 140);
    ctx.fillText(`Height/Weight: ${data.height || "165"} cm / ${data.weight || "60"} kg | Blood Group: ${data.bloodGroup || "B+"}`, 60, 165);

    ctx.fillStyle = "#334155";
    ctx.font = "12px sans-serif";
    ctx.fillText("Summary: AI-Assisted Clinical Decision Support Summary. Requires Clinician Review.", 40, 240);

    const link = document.createElement("a");
    link.download = `VITAWEAVE_Health_Summary_VW28473.jpg`;
    link.href = canvas.toDataURL("image/jpeg", 0.92);
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Top Bar */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center text-sm font-bold">
              VW
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                VITAWEAVE AI-Assisted Health Summary
              </h2>
              <p className="text-[11px] text-slate-500">
                Official Clinical Decision Support Record · Ready for Export
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 transition flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print / Save PDF
            </button>
            <button
              onClick={handleDownloadPng}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
            >
              PNG
            </button>
            <button
              onClick={handleDownloadJpg}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
            >
              JPG
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Official Printable Document Sheet ── */}
        <div ref={docRef} className="p-8 space-y-6 text-slate-800 bg-white font-sans print:p-0">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  VITAWEAVE
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold">
                  Health Summary
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Integrated Public Health Intelligence & Clinical Decision Support
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>
                <span className="font-semibold text-slate-700">Date:</span> {assessmentDate}
              </div>
              <div>
                <span className="font-semibold text-slate-700">Patient ID:</span> VW-28473
              </div>
              <div>
                <span className="font-semibold text-slate-700">Summary ID:</span> SUM-2026-8492
              </div>
            </div>
          </div>

          {/* Patient Demographics Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="text-slate-500 font-medium">Patient Name</div>
              <div className="font-bold text-slate-800 text-sm mt-0.5">
                {data.fullName || "Anushka Verma"}
              </div>
            </div>
            <div>
              <div className="text-slate-500 font-medium">Age & Gender</div>
              <div className="font-bold text-slate-800 text-sm mt-0.5">
                {data.age || "26"} Y / {data.gender || "Female"}
              </div>
            </div>
            <div>
              <div className="text-slate-500 font-medium">Height & Weight</div>
              <div className="font-bold text-slate-800 text-sm mt-0.5">
                {data.height || "165"} cm / {data.weight || "60"} kg
              </div>
            </div>
            <div>
              <div className="text-slate-500 font-medium">Blood Group & BMI</div>
              <div className="font-bold text-slate-800 text-sm mt-0.5">
                {data.bloodGroup || "B+"} · BMI {bmi}
              </div>
            </div>
          </div>

          {/* Clinical Indicators & Models Overview */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Clinical Assessment Status (8 Specialized ML Models)
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Organ / Disease System</th>
                    <th className="py-2.5 px-3">Evaluation Engine</th>
                    <th className="py-2.5 px-3">Assessment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-800">Cerebrovascular (Stroke)</td>
                    <td className="py-2 px-3">Logistic Classifier (15 Features)</td>
                    <td className="py-2 px-3 text-emerald-600 font-medium">Assessment Available</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-800">Coronary Heart Disease</td>
                    <td className="py-2 px-3">Framingham / Logistic Engine</td>
                    <td className="py-2 px-3 text-emerald-600 font-medium">Assessment Available</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-800">Renal Function (Kidney)</td>
                    <td className="py-2 px-3">Chronic Kidney Disease Classifier</td>
                    <td className="py-2 px-3 text-emerald-600 font-medium">Assessment Available</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-800">Hepatic Function (Liver)</td>
                    <td className="py-2 px-3">ILPD Biomarker Pipeline</td>
                    <td className="py-2 px-3 text-emerald-600 font-medium">Assessment Available</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-800">Glycemic Control (Diabetes)</td>
                    <td className="py-2 px-3">100-Tree Random Forest Ensemble</td>
                    <td className="py-2 px-3 text-emerald-600 font-medium">Assessment Available</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-800">Cardiac Hemodynamics</td>
                    <td className="py-2 px-3">800-Tree Random Forest</td>
                    <td className="py-2 px-3 text-emerald-600 font-medium">Assessment Available</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Reported Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="font-semibold text-slate-700 mb-1.5">
                Reported Medical History
              </div>
              <ul className="space-y-1 text-slate-600">
                <li>• Conditions: {data.conditions.length > 0 ? data.conditions.join(", ") : "None reported"}</li>
                <li>• Allergies: {data.allergies || "None declared"}</li>
                <li>• Medications: {data.medications || "None"}</li>
                <li>• Surgeries: {data.surgeries || "None"}</li>
              </ul>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="font-semibold text-slate-700 mb-1.5">
                Lifestyle & Uploaded Records
              </div>
              <ul className="space-y-1 text-slate-600">
                <li>• Activity: {data.activityLevel || "Moderate"} physical activity</li>
                <li>• Tobacco / Alcohol: Non-smoker, {data.alcohol || "No"} alcohol</li>
                <li>• Symptoms: {data.symptoms.length > 0 ? data.symptoms.join(", ") : "None reported"}</li>
                <li>• Indexed Documents: {data.uploadedDocuments.length} document(s) attached</li>
              </ul>
            </div>
          </div>

          {/* Preventive Guidance */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Preventive Guidance & Follow-up
            </h3>
            <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-3.5 text-xs text-slate-700 space-y-1.5">
              <p>• Schedule periodic health screening with your healthcare provider.</p>
              <p>• Review model detailed indicators via the <strong>View Detailed Analysis</strong> workstation.</p>
              <p>• Continue maintaining optimal hydration and structured physical regimen.</p>
            </div>
          </div>

          {/* Clinician Review Required Warning */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900">
            <div className="font-bold flex items-center gap-1.5">
              <span>⚠️</span>
              <span>Pending Clinician Counter-Signature</span>
            </div>
            <p className="mt-1 text-[11px] text-amber-800 leading-relaxed">
              This document is an AI-assisted health summary generated for patient information and clinical decision support.
              It does not constitute an independent medical diagnosis or final prescription without formal evaluation and counter-signature by a licensed medical practitioner.
            </p>
          </div>

          {/* Footer Signature */}
          <div className="pt-4 border-t border-slate-200 flex items-end justify-between text-xs text-slate-500">
            <div>
              <div className="font-semibold text-slate-700">VITAWEAVE Public Health Ecosystem</div>
              <div className="text-[11px]">Secure Health Record · Auto-Generated</div>
            </div>
            <div className="text-right">
              <div className="w-44 border-b border-slate-300 pb-1 font-mono text-[10px] text-slate-400 text-center">
                [ Pending Verification ]
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Authorized Medical Officer</div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 rounded-xl hover:bg-sky-700 transition"
          >
            Print Summary
          </button>
        </div>
      </div>
    </div>
  );
}
