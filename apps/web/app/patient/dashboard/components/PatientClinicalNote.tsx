"use client";

import { Stethoscope } from "lucide-react";

export default function PatientClinicalNote() {
  return (
    <section className="mt-5 rounded-[20px] border border-[#e1e8e4] bg-[#f8faf9] px-5 py-4">
      <div className="flex items-start gap-3">
        <Stethoscope
          size={14}
          className="mt-0.5 shrink-0 text-[#78968d]"
        />

        <p className="text-[8px] leading-5 text-[#87928e]">
          VITAWEAVE provides health information and
          decision-support insights. It does not replace
          professional medical advice, diagnosis, or
          treatment. Discuss important health decisions
          with your qualified healthcare professional.
        </p>
      </div>
    </section>
  );
}