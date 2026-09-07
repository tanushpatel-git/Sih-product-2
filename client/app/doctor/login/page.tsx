"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";

export function DoctorLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log({
      email,
      password,
      remember,
    });
  };

  return (
    <main className="min-h-screen bg-[#f7f8f7] text-[#17201d]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* LEFT */}
        <section className="relative hidden overflow-hidden border-r border-black/[0.06] lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(86,155,140,0.13),transparent_30%),radial-gradient(circle_at_80%_75%,rgba(73,116,170,0.10),transparent_30%)]" />

          <div className="relative flex w-full flex-col justify-between p-10 xl:p-14">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#17201d] text-white">
                <Activity size={17} strokeWidth={2.2} />
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

            {/* Editorial content */}
            <div className="max-w-xl">
              <div className="mb-7 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#4c756c]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4c756c]" />
                Clinical Workspace
              </div>

              <h1 className="text-[clamp(3.4rem,6vw,6.5rem)] font-medium leading-[0.88] tracking-[-0.065em]">
                See the
                <br />
                signal.
                <br />
                <span className="text-black/35">Act earlier.</span>
              </h1>

              <p className="mt-8 max-w-md text-[15px] leading-7 text-black/55">
                A clinical intelligence workspace connecting patient risk,
                disease signals, and hospital capacity into one decision
                system.
              </p>

              {/* Intelligence flow */}
              <div className="mt-12 flex max-w-lg flex-wrap gap-2">
                {[
                  "PATIENT RISK",
                  "CLINICAL SIGNAL",
                  "PREDICTION",
                  "NEXUS AI",
                ].map((item, index) => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="rounded-full border border-black/[0.08] bg-white/70 px-3.5 py-2 text-[10px] font-semibold tracking-[0.12em] text-black/55 backdrop-blur">
                      {item}
                    </div>

                    {index < 3 && (
                      <ArrowRight size={12} className="text-black/20" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom */}
            <div className="flex items-center gap-3 text-[11px] text-black/35">
              <ShieldCheck size={15} />
              Clinical workspace protected by secure authentication
            </div>
          </div>
        </section>

        {/* RIGHT */}
        <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-[470px]">
            {/* Mobile brand */}
            <div className="mb-14 flex items-center gap-3 lg:hidden">
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
                <Stethoscope size={19} className="text-[#4c756c]" />
              </div>

              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/35">
                Doctor workspace
              </p>

              <h2 className="text-4xl font-medium tracking-[-0.045em]">
                Welcome back.
              </h2>

              <p className="mt-3 text-sm leading-6 text-black/45">
                Sign in to access clinical intelligence and patient
                assessments.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-black/45">
                  Professional email
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-black/25"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="doctor@hospital.com"
                    required
                    className="h-14 w-full rounded-2xl border border-black/[0.08] bg-white pl-12 pr-4 text-sm outline-none transition placeholder:text-black/25 focus:border-[#5b8279] focus:ring-4 focus:ring-[#5b8279]/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2.5 flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-black/45">
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-[11px] font-medium text-[#4c756c] transition hover:text-[#17201d]"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-black/25"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    required
                    className="h-14 w-full rounded-2xl border border-black/[0.08] bg-white pl-12 pr-12 text-sm outline-none transition placeholder:text-black/25 focus:border-[#5b8279] focus:ring-4 focus:ring-[#5b8279]/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30 transition hover:text-black/60"
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <label className="flex cursor-pointer items-center gap-3 text-xs text-black/50">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="h-4 w-4 rounded border-black/15 accent-[#4c756c]"
                />

                Keep me signed in on this device
              </label>

              {/* Submit */}
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="group flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#17201d] text-sm font-medium text-white shadow-[0_14px_35px_rgba(23,32,29,0.16)] transition hover:bg-[#25312d]"
              >
                Enter clinical workspace

                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </motion.button>
            </form>

            {/* SSO */}
            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-black/[0.07]" />
              <span className="text-[10px] uppercase tracking-[0.14em] text-black/25">
                or
              </span>
              <div className="h-px flex-1 bg-black/[0.07]" />
            </div>

            <button
              type="button"
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-black/[0.08] bg-white text-sm font-medium text-black/65 transition hover:border-black/15 hover:bg-black/[0.015]"
            >
              <Sparkles size={16} />
              Continue with professional SSO
            </button>

            {/* Security */}
            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-black/[0.06] bg-white/60 p-4">
              <ShieldCheck
                size={17}
                className="mt-0.5 shrink-0 text-[#4c756c]"
              />

              <p className="text-[11px] leading-5 text-black/40">
                Doctor accounts are intended for verified healthcare
                professionals. Clinical predictions are decision-support
                information and require professional review.
              </p>
            </div>

            {/* Register */}
            <p className="mt-8 text-center text-sm text-black/40">
              New to NEXUS?{" "}
              <Link
                href="/doctor/register"
                className="font-medium text-[#4c756c] hover:text-[#17201d]"
              >
                Register as a doctor
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default DoctorLoginPage;