"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Hospital,
  Mail,
  Phone,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";

export function DoctorRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialization: "",
    registrationNumber: "",
    experience: "",
    hospital: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const updateField = (field: string, value: string | boolean) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (!form.terms) {
      alert("Please accept the professional terms.");
      return;
    }

    console.log(form);
  };

  return (
    <main className="min-h-screen bg-[#f7f8f7] text-[#17201d]">
      <div className="grid min-h-screen lg:grid-cols-[0.8fr_1.2fr]">
        {/* LEFT */}
        <section className="relative hidden overflow-hidden border-r border-black/[0.06] lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(86,155,140,0.14),transparent_32%),radial-gradient(circle_at_80%_80%,rgba(72,116,165,0.10),transparent_30%)]" />

          <div className="relative flex w-full flex-col justify-between p-10 xl:p-14">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#17201d] text-white">
                <Activity size={17} />
              </div>

              <div>
                <p className="text-[13px] font-semibold tracking-[0.18em]">
                  NEXUS
                </p>

                <p className="text-[10px] uppercase tracking-[0.16em] text-black/40">
                  Healthcare Intelligence
                </p>
              </div>
            </div>

            {/* Main */}
            <div>
              <div className="mb-7 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4c756c]">
                <Stethoscope size={14} />
                Professional onboarding
              </div>

              <h1 className="max-w-lg text-[clamp(3.2rem,5vw,5.8rem)] font-medium leading-[0.9] tracking-[-0.065em]">
                Your
                <br />
                clinical
                <br />
                workspace.
              </h1>

              <p className="mt-8 max-w-md text-[15px] leading-7 text-black/50">
                Connect your professional identity to NEXUS and access
                patient-level clinical intelligence, prediction models and
                decision-support tools.
              </p>

              {/* Steps */}
              <div className="mt-12 space-y-5">
                {[
                  {
                    number: "01",
                    title: "Professional identity",
                    description: "Tell us who you are.",
                  },
                  {
                    number: "02",
                    title: "Clinical profile",
                    description: "Add your specialty and experience.",
                  },
                  {
                    number: "03",
                    title: "Verification",
                    description: "Connect your professional credentials.",
                  },
                ].map((step) => (
                  <div key={step.number} className="flex gap-4">
                    <span className="pt-0.5 text-[10px] font-semibold tracking-[0.15em] text-black/25">
                      {step.number}
                    </span>

                    <div>
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="mt-1 text-xs text-black/40">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom */}
            <div className="flex items-center gap-3 text-[11px] text-black/35">
              <ShieldCheck size={15} />
              Professional information is handled securely.
            </div>
          </div>
        </section>

        {/* RIGHT */}
        <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-[650px]">
            {/* Mobile brand */}
            <div className="mb-12 flex items-center gap-3 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#17201d] text-white">
                <Activity size={17} />
              </div>

              <div>
                <p className="text-[13px] font-semibold tracking-[0.18em]">
                  NEXUS
                </p>

                <p className="text-[10px] uppercase tracking-[0.16em] text-black/40">
                  Healthcare Intelligence
                </p>
              </div>
            </div>

            {/* Header */}
            <div className="mb-9">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-black/[0.07] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                <UserRound size={19} className="text-[#4c756c]" />
              </div>

              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/35">
                Doctor registration
              </p>

              <h2 className="text-4xl font-medium tracking-[-0.045em]">
                Build your profile.
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-6 text-black/45">
                Create your professional identity to enter the NEXUS clinical
                workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* PROFESSIONAL IDENTITY */}
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <UserRound size={15} className="text-[#4c756c]" />

                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/45">
                    Professional identity
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs font-medium text-black/55">
                      Full name
                    </label>

                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(event) =>
                        updateField("fullName", event.target.value)
                      }
                      placeholder="Dr. Ananya Sharma"
                      required
                      className="h-13 w-full rounded-2xl border border-black/[0.08] bg-white px-4 text-sm outline-none transition placeholder:text-black/25 focus:border-[#5b8279] focus:ring-4 focus:ring-[#5b8279]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium text-black/55">
                      Professional email
                    </label>

                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-black/25"
                      />

                      <input
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                          updateField("email", event.target.value)
                        }
                        placeholder="doctor@hospital.com"
                        required
                        className="h-13 w-full rounded-2xl border border-black/[0.08] bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-black/25 focus:border-[#5b8279] focus:ring-4 focus:ring-[#5b8279]/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium text-black/55">
                      Phone number
                    </label>

                    <div className="relative">
                      <Phone
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-black/25"
                      />

                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(event) =>
                          updateField("phone", event.target.value)
                        }
                        placeholder="+91 98765 43210"
                        required
                        className="h-13 w-full rounded-2xl border border-black/[0.08] bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-black/25 focus:border-[#5b8279] focus:ring-4 focus:ring-[#5b8279]/10"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* CLINICAL PROFILE */}
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <Stethoscope size={15} className="text-[#4c756c]" />

                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/45">
                    Clinical profile
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-black/55">
                      Specialization
                    </label>

                    <div className="relative">
                      <select
                        value={form.specialization}
                        onChange={(event) =>
                          updateField("specialization", event.target.value)
                        }
                        required
                        className="h-13 w-full appearance-none rounded-2xl border border-black/[0.08] bg-white px-4 pr-11 text-sm text-black/70 outline-none transition focus:border-[#5b8279] focus:ring-4 focus:ring-[#5b8279]/10"
                      >
                        <option value="">Select specialization</option>
                        <option value="general-medicine">
                          General Medicine
                        </option>
                        <option value="cardiology">Cardiology</option>
                        <option value="neurology">Neurology</option>
                        <option value="oncology">Oncology</option>
                        <option value="nephrology">Nephrology</option>
                        <option value="endocrinology">Endocrinology</option>
                        <option value="pulmonology">Pulmonology</option>
                        <option value="pediatrics">Pediatrics</option>
                        <option value="emergency-medicine">
                          Emergency Medicine
                        </option>
                        <option value="other">Other</option>
                      </select>

                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium text-black/55">
                      Years of experience
                    </label>

                    <div className="relative">
                      <select
                        value={form.experience}
                        onChange={(event) =>
                          updateField("experience", event.target.value)
                        }
                        required
                        className="h-13 w-full appearance-none rounded-2xl border border-black/[0.08] bg-white px-4 pr-11 text-sm text-black/70 outline-none transition focus:border-[#5b8279] focus:ring-4 focus:ring-[#5b8279]/10"
                      >
                        <option value="">Select experience</option>
                        <option value="0-2">0–2 years</option>
                        <option value="3-5">3–5 years</option>
                        <option value="6-10">6–10 years</option>
                        <option value="11-15">11–15 years</option>
                        <option value="16+">16+ years</option>
                      </select>

                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/30"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs font-medium text-black/55">
                      Medical registration number
                    </label>

                    <input
                      type="text"
                      value={form.registrationNumber}
                      onChange={(event) =>
                        updateField(
                          "registrationNumber",
                          event.target.value
                        )
                      }
                      placeholder="Enter professional registration number"
                      required
                      className="h-13 w-full rounded-2xl border border-black/[0.08] bg-white px-4 text-sm outline-none transition placeholder:text-black/25 focus:border-[#5b8279] focus:ring-4 focus:ring-[#5b8279]/10"
                    />
                  </div>
                </div>
              </section>

              {/* AFFILIATION */}
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <Hospital size={15} className="text-[#4c756c]" />

                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/45">
                    Hospital affiliation
                  </h3>
                </div>

                <div className="relative">
                  <Building2
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-black/25"
                  />

                  <input
                    type="text"
                    value={form.hospital}
                    onChange={(event) =>
                      updateField("hospital", event.target.value)
                    }
                    placeholder="Hospital or healthcare organization"
                    required
                    className="h-13 w-full rounded-2xl border border-black/[0.08] bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-black/25 focus:border-[#5b8279] focus:ring-4 focus:ring-[#5b8279]/10"
                  />
                </div>
              </section>

              {/* SECURITY */}
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <ShieldCheck size={15} className="text-[#4c756c]" />

                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/45">
                    Secure workspace
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-black/55">
                      Password
                    </label>

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(event) =>
                          updateField("password", event.target.value)
                        }
                        placeholder="Create a password"
                        required
                        minLength={8}
                        className="h-13 w-full rounded-2xl border border-black/[0.08] bg-white px-4 pr-11 text-sm outline-none transition placeholder:text-black/25 focus:border-[#5b8279] focus:ring-4 focus:ring-[#5b8279]/10"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium text-black/55">
                      Confirm password
                    </label>

                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={(event) =>
                          updateField("confirmPassword", event.target.value)
                        }
                        placeholder="Confirm password"
                        required
                        minLength={8}
                        className="h-13 w-full rounded-2xl border border-black/[0.08] bg-white px-4 pr-11 text-sm outline-none transition placeholder:text-black/25 focus:border-[#5b8279] focus:ring-4 focus:ring-[#5b8279]/10"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((value) => !value)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* TERMS */}
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-black/[0.06] bg-white/60 p-4">
                <input
                  type="checkbox"
                  checked={form.terms}
                  onChange={(event) =>
                    updateField("terms", event.target.checked)
                  }
                  className="mt-0.5 h-4 w-4 rounded border-black/15 accent-[#4c756c]"
                />

                <span className="text-xs leading-5 text-black/45">
                  I confirm that the professional information provided is
                  accurate and agree to the NEXUS professional terms and
                  clinical decision-support guidelines.
                </span>
              </label>

              {/* SUBMIT */}
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="group flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#17201d] text-sm font-medium text-white shadow-[0_14px_35px_rgba(23,32,29,0.16)] transition hover:bg-[#25312d]"
              >
                Create doctor workspace

                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </motion.button>
            </form>

            {/* Verification note */}
            <div className="mt-7 flex items-start gap-3 text-[11px] leading-5 text-black/35">
              <Check size={15} className="mt-0.5 shrink-0 text-[#4c756c]" />

              <p>
                Professional verification can be completed before clinical
                workspace access is enabled.
              </p>
            </div>

            {/* Login */}
            <p className="mt-8 text-center text-sm text-black/40">
              Already have a doctor account?{" "}
              <Link
                href="/doctor/login"
                className="font-medium text-[#4c756c] hover:text-[#17201d]"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default DoctorRegisterPage;