"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Sparkles, Activity, HeartPulse } from "lucide-react";
import { useState } from "react";

const hotspots = [
  {
    id: "heart-rate",
    label: "Heart rate",
    value: "72 bpm",
    status: "Normal",
    x: 47,
    y: 43,
  },
  {
    id: "health-signal",
    label: "Health signal",
    value: "82",
    status: "Stable",
    x: 62,
    y: 31,
  },
  {
    id: "blood-pressure",
    label: "Blood pressure",
    value: "118/76",
    status: "Healthy",
    x: 68,
    y: 58,
  },
];

interface PatientHeroProps {
  onViewChange?: (view: "overview" | "clinical") => void;
}

export default function PatientHero({ onViewChange }: PatientHeroProps) {
  const [activeHotspot, setActiveHotspot] = useState("heart-rate");

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(
    useTransform(mouseY, [-1, 1], [6, -6]),
    {
      stiffness: 120,
      damping: 18,
    }
  );

  const rotateY = useSpring(
    useTransform(mouseX, [-1, 1], [-8, 8]),
    {
      stiffness: 120,
      damping: 18,
    }
  );

  const imageX = useSpring(
    useTransform(mouseX, [-1, 1], [-10, 10]),
    {
      stiffness: 120,
      damping: 20,
    }
  );

  const imageY = useSpring(
    useTransform(mouseY, [-1, 1], [-7, 7]),
    {
      stiffness: 120,
      damping: 20,
    }
  );

  const handleMouseMove = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const x =
      ((event.clientX - rect.left) / rect.width) * 2 - 1;

    const y =
      ((event.clientY - rect.top) / rect.height) * 2 - 1;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const selectedHotspot = hotspots.find(
    (hotspot) => hotspot.id === activeHotspot
  );

  return (
    <section className="relative min-h-[430px] overflow-hidden rounded-[31px] border border-[#dce5e0] bg-[#eaf1ee]">
      {/* Background architectural rings */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-[90px] -top-[340px] h-[720px] w-[720px] rounded-full border border-[#cbded7]" />

        <div className="absolute -right-[10px] -top-[270px] h-[600px] w-[600px] rounded-full border border-[#d3e2dd]" />

        <div className="absolute right-[80px] -top-[180px] h-[440px] w-[440px] rounded-full border border-[#d8e6e1]" />

        <div className="absolute right-[2%] top-[18%] h-[390px] w-[390px] rounded-full bg-[#d4e8e1] opacity-60 blur-[90px]" />

        <div className="absolute bottom-[-100px] left-[30%] h-[240px] w-[420px] rounded-full bg-[#d8e9e4] opacity-50 blur-[90px]" />
      </div>

      {/* Fine grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.17]"
        style={{
          backgroundImage:
            "linear-gradient(#9db4ac 1px, transparent 1px), linear-gradient(90deg, #9db4ac 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage:
            "linear-gradient(to right, transparent 25%, black 65%, transparent 100%)",
        }}
      />

      {/* Hero copy */}
      <div className="relative z-20 max-w-[650px] p-8 md:p-11">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute h-full w-full animate-ping rounded-full bg-[#76a99b]/50" />

            <span className="relative h-2 w-2 rounded-full bg-[#649487]" />
          </span>

          <span className="text-[8px] uppercase tracking-[0.32em] text-[#668078]">
            Personal Health Intelligence
          </span>
        </div>

        <h1 className="mt-7 max-w-[570px] text-[53px] font-medium leading-[0.94] tracking-[-0.055em] text-[#17221f] md:text-[69px]">
          Your health.
          <br />

          <span className="text-[#96a39e]">
            One clear view.
          </span>
        </h1>

        <p className="mt-7 max-w-[465px] text-[12px] leading-6 text-[#687873] md:text-[13px]">
          VITAWEAVE brings your health signals, clinical
          history and personal insights together so
          you can understand what matters before it
          becomes a concern.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            onClick={() => onViewChange?.("clinical")}
            className="group flex items-center gap-3 rounded-[13px] bg-[#17221f] px-5 py-3 text-[10px] font-medium text-white shadow-[0_15px_35px_rgba(20,32,29,0.15)] transition hover:-translate-y-0.5"
          >
            View my health

            <ArrowUpRight
              size={14}
              className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </button>

          <button
            onClick={() => window.location.href = "/patient/Tlux"}
            className="flex items-center gap-2 rounded-[13px] border border-[#cbdad4] bg-white/60 px-5 py-3 text-[10px] text-[#59746b] backdrop-blur-xl transition hover:bg-white"
          >
            <Sparkles size={13} />

            Ask TLUX
          </button>
        </div>
      </div>

      {/* 2.5D HEALTH CORE */}
      <div
        className="absolute right-[-4%] top-0 hidden h-full w-[57%] md:block"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          perspective: "1400px",
        }}
      >
        {/* Core ambient glow */}
        <motion.div
          style={{
            x: imageX,
            y: imageY,
          }}
          className="absolute right-[13%] top-[15%] h-[330px] w-[330px] rounded-full bg-[#c7dfd7] opacity-50 blur-[75px]"
        />

        {/* Large orbit */}
        <motion.div
          style={{
            x: imageX,
            y: imageY,
            rotateX,
            rotateY,
          }}
          className="absolute right-[8%] top-[8%] h-[355px] w-[355px]"
        >
          <div className="absolute inset-0 rounded-full border border-[#b8d1c9]/60" />

          <div className="absolute inset-[27px] rounded-full border border-[#c5dad4]" />

          <div className="absolute inset-[59px] rounded-full border border-[#cfdfda]" />

          <div className="absolute inset-[94px] rounded-full border border-[#d8e5e1]" />

          {/* Orbit marker */}
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0"
          >
            <div className="absolute left-1/2 top-[-3px] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#6d9e91] shadow-[0_0_12px_rgba(90,137,122,0.4)]" />
          </motion.div>
        </motion.div>

        {/* Floating model */}
        <motion.div
          style={{
            x: imageX,
            y: imageY,
            rotateX,
            rotateY,
          }}
          className="absolute right-[11%] top-[3%] h-[365px] w-[350px]"
        >
          {/* Shadow */}
          <motion.div
            animate={{
              scale: [1, 1.06, 1],
              opacity: [0.16, 0.1, 0.16],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-[4%] left-[10%] h-[65px] w-[78%] rounded-full bg-[#355c50] blur-[30px]"
          />

          {/* Back depth */}
          <div
            className="absolute inset-[7%]"
            style={{
              transform:
                "translateZ(-35px) scale(0.92)",
            }}
          >
            <div className="h-full w-full rounded-full bg-[#a9cbc1]/30 blur-[5px]" />
          </div>

          {/* Anatomical object */}
          <motion.div
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0"
          >
            {/* Lighting */}
            <div className="pointer-events-none absolute left-[18%] top-[13%] h-[100px] w-[80px] rounded-full bg-white/25 blur-[25px]" />

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_32%)]" />

            {/* Scan line */}
            <motion.div
              animate={{
                top: ["17%", "80%", "17%"],
                opacity: [0, 0.75, 0],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute left-[18%] right-[18%] h-[1px] bg-[#76a99b]/80 shadow-[0_0_14px_rgba(96,155,139,0.45)]"
            />
          </motion.div>

          {/* Floating heart rate */}
          <motion.div
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-[-36px] top-[27px] z-30 rounded-[15px] border border-white/80 bg-white/80 px-3 py-2.5 shadow-[0_18px_35px_rgba(40,66,58,0.09)] backdrop-blur-xl"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e2f0eb] text-[#588679]">
                <HeartPulse size={12} />
              </div>

              <div>
                <p className="text-[7px] uppercase tracking-[0.16em] text-[#9aa6a1]">
                  Heart rate
                </p>

                <p className="mt-0.5 text-[11px] font-medium">
                  72 bpm
                </p>
              </div>
            </div>
          </motion.div>

          {/* Health score */}
          <motion.div
            animate={{
              y: [0, 5, 0],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute right-[-40px] top-[72px] z-30 rounded-[15px] border border-white/80 bg-white/80 px-3.5 py-2.5 shadow-[0_18px_35px_rgba(40,66,58,0.09)] backdrop-blur-xl"
          >
            <p className="text-[7px] uppercase tracking-[0.16em] text-[#9aa6a1]">
              Health signal
            </p>

            <div className="mt-1 flex items-center gap-2">
              <span className="text-[18px] font-medium tracking-[-0.04em]">
                82
              </span>

              <span className="rounded-full bg-[#e1f0eb] px-2 py-0.5 text-[7px] text-[#4e7c6e]">
                Stable
              </span>
            </div>
          </motion.div>

          {/* Blood pressure */}
          <motion.div
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-[39px] right-[-15px] z-30 rounded-[15px] border border-white/80 bg-white/80 px-3.5 py-2.5 shadow-[0_18px_35px_rgba(40,66,58,0.09)] backdrop-blur-xl"
          >
            <p className="text-[7px] uppercase tracking-[0.16em] text-[#9aa6a1]">
              Blood pressure
            </p>

            <p className="mt-1 text-[11px] font-medium">
              118/76
            </p>

            <div className="mt-1 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#71a899]" />

              <span className="text-[7px] text-[#658278]">
                Healthy
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Interactive hotspots */}
        {hotspots.map((hotspot) => {
          const selected =
            activeHotspot === hotspot.id;

          return (
            <motion.button
              key={hotspot.id}
              onClick={() =>
                setActiveHotspot(hotspot.id)
              }
              whileHover={{ scale: 1.2 }}
              style={{
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`,
              }}
              className="absolute z-40 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
            >
              <span
                className={`absolute inset-0 rounded-full ${
                  selected
                    ? "animate-ping bg-[#6f9f92]/30"
                    : "bg-[#6f9f92]/10"
                }`}
              />

              <span
                className={`relative h-2.5 w-2.5 rounded-full border-2 border-white shadow-[0_3px_10px_rgba(48,87,76,0.25)] ${
                  selected
                    ? "bg-[#4f8577]"
                    : "bg-[#8dbbad]"
                }`}
              />
            </motion.button>
          );
        })}

        {/* Active signal */}
        <motion.div
          key={activeHotspot}
          initial={{
            opacity: 0,
            y: 5,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="absolute bottom-[24px] left-[4%] z-40 rounded-[14px] border border-white/80 bg-white/75 px-3.5 py-2.5 shadow-[0_15px_35px_rgba(40,66,58,0.07)] backdrop-blur-xl"
        >
          <p className="text-[7px] uppercase tracking-[0.18em] text-[#9aa6a1]">
            Selected signal
          </p>

          <div className="mt-1 flex items-center gap-2">
            <Activity
              size={12}
              className="text-[#588679]"
            />

            <span className="text-[10px] font-medium">
              {selectedHotspot?.label}
            </span>

            <span className="text-[9px] text-[#71847d]">
              {selectedHotspot?.value}
            </span>
          </div>
        </motion.div>

        {/* Active state */}
        <div className="absolute bottom-[25px] right-[4%] z-40 flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-2 shadow-[0_12px_30px_rgba(40,66,58,0.06)] backdrop-blur-xl">
          <span className="relative flex h-2 w-2">
            <span className="absolute h-full w-full animate-ping rounded-full bg-[#72a99a] opacity-60" />

            <span className="relative h-2 w-2 rounded-full bg-[#619487]" />
          </span>

          <span className="text-[8px] uppercase tracking-[0.2em] text-[#6d817a]">
            Health core active
          </span>
        </div>
      </div>
    </section>
  );
}