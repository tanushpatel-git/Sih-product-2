"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Activity, HeartPulse } from "lucide-react";
import { useState } from "react";

const hotspots = [
  {
    id: "heart",
    label: "Heart rate",
    value: "72 bpm",
    status: "Normal",
    x: 48,
    y: 43,
  },
  {
    id: "signal",
    label: "Health signal",
    value: "82",
    status: "Stable",
    x: 62,
    y: 32,
  },
  {
    id: "pressure",
    label: "Blood pressure",
    value: "118/76",
    status: "Healthy",
    x: 68,
    y: 57,
  },
];

export default function ClinicalCore() {
  const [active, setActive] = useState("heart");

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(
    useTransform(mouseY, [-1, 1], [7, -7]),
    {
      stiffness: 120,
      damping: 18,
    }
  );

  const rotateY = useSpring(
    useTransform(mouseX, [-1, 1], [-9, 9]),
    {
      stiffness: 120,
      damping: 18,
    }
  );

  const moveX = useSpring(
    useTransform(mouseX, [-1, 1], [-12, 12]),
    {
      stiffness: 120,
      damping: 20,
    }
  );

  const moveY = useSpring(
    useTransform(mouseY, [-1, 1], [-8, 8]),
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

  return (
    <div
      className="relative h-[390px] w-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: "1400px",
      }}
    >
      {/* Ambient light */}
      <div className="absolute right-[15%] top-[5%] h-[280px] w-[280px] rounded-full bg-[#d6eae4] opacity-70 blur-[80px]" />

      <div className="absolute bottom-[12%] right-[12%] h-[100px] w-[260px] rounded-full bg-[#6f9389]/15 blur-[35px]" />

      {/* Architectural rings */}
      <motion.div
        style={{
          x: moveX,
          y: moveY,
          rotateX,
          rotateY,
        }}
        className="absolute right-[8%] top-[7%] h-[320px] w-[320px]"
      >
        <div className="absolute inset-0 rounded-full border border-[#b9d2ca]/60" />

        <div className="absolute inset-[25px] rounded-full border border-[#c6dbd5]" />

        <div className="absolute inset-[53px] rounded-full border border-[#d2e2dd]" />

        <div className="absolute inset-[82px] rounded-full border border-[#dae8e3]" />
      </motion.div>

      {/* Floating model */}
      <motion.div
        style={{
          x: moveX,
          y: moveY,
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="absolute right-[12%] top-[3%] h-[340px] w-[330px]"
      >
        {/* Deep shadow */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.18, 0.12, 0.18],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[5%] left-[12%] h-[70px] w-[76%] rounded-full bg-[#36584f] blur-[30px]"
        />

        {/* Back depth layer */}
        <div
          className="absolute inset-[8%]"
          style={{
            transform: "translateZ(-35px) scale(0.92)",
            filter: "blur(1px)",
          }}
        >
          <div className="h-full w-full rounded-[48%] bg-[#b8d3cb]/35 blur-[4px]" />
        </div>

        {/* Image layer */}
        <motion.div
          animate={{
            y: [0, -7, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0"
          style={{
            transform: "translateZ(0)",
            transformStyle: "preserve-3d",
          }}
        >

          {/* Glass lighting */}
          <div className="pointer-events-none absolute left-[20%] top-[15%] h-[90px] w-[70px] rounded-full bg-white/25 blur-[25px]" />

          <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_30%)]" />

          {/* Clinical scan */}
          <motion.div
            animate={{
              top: ["15%", "78%", "15%"],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-[18%] right-[18%] h-[1px] bg-[#8bbbad]/80 shadow-[0_0_15px_rgba(111,163,148,0.5)]"
          />
        </motion.div>

        {/* Floating clinical labels */}
        <motion.div
          animate={{
            y: [0, -4, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-[-30px] top-[25px] z-20 rounded-[14px] border border-white/80 bg-white/80 px-3 py-2 shadow-[0_18px_35px_rgba(40,66,58,0.09)] backdrop-blur-xl"
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

        <motion.div
          animate={{
            y: [0, 5, 0],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-[-35px] top-[72px] z-20 rounded-[14px] border border-white/80 bg-white/80 px-3 py-2 shadow-[0_18px_35px_rgba(40,66,58,0.09)] backdrop-blur-xl"
        >
          <p className="text-[7px] uppercase tracking-[0.16em] text-[#9aa6a1]">
            Health signal
          </p>

          <div className="mt-1 flex items-center gap-2">
            <span className="text-[17px] font-medium">82</span>

            <span className="rounded-full bg-[#e1f0eb] px-2 py-0.5 text-[7px] text-[#4e7c6e]">
              Stable
            </span>
          </div>
        </motion.div>

        <motion.div
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[43px] right-[-12px] z-20 rounded-[14px] border border-white/80 bg-white/80 px-3 py-2 shadow-[0_18px_35px_rgba(40,66,58,0.09)] backdrop-blur-xl"
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

      {/* Hotspots */}
      {hotspots.map((hotspot) => {
        const selected = active === hotspot.id;

        return (
          <motion.button
            key={hotspot.id}
            onClick={() => setActive(hotspot.id)}
            style={{
              left: `${hotspot.x}%`,
              top: `${hotspot.y}%`,
            }}
            whileHover={{ scale: 1.15 }}
            className="absolute z-30 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
          >
            <span
              className={`absolute inset-0 rounded-full ${
                selected
                  ? "animate-ping bg-[#78a99b]/30"
                  : "bg-[#78a99b]/10"
              }`}
            />

            <span
              className={`relative h-2.5 w-2.5 rounded-full border-2 border-white shadow-[0_3px_10px_rgba(48,87,76,0.25)] ${
                selected
                  ? "bg-[#4e8577]"
                  : "bg-[#8ebcaf]"
              }`}
            />
          </motion.button>
        );
      })}

      {/* Model status */}
      <div className="absolute bottom-[7%] left-[5%] z-40 flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-2 shadow-[0_12px_30px_rgba(40,66,58,0.06)] backdrop-blur-xl">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#72a99a] opacity-60" />

          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#619487]" />
        </span>

        <span className="text-[8px] uppercase tracking-[0.2em] text-[#6d817a]">
          Health core active
        </span>
      </div>

      {/* Selected data */}
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-[8%] right-[3%] z-40 hidden rounded-[13px] border border-white/80 bg-white/75 px-3 py-2 shadow-[0_15px_35px_rgba(40,66,58,0.07)] backdrop-blur-xl md:block"
      >
        <div className="flex items-center gap-2">
          <Activity size={12} className="text-[#588679]" />

          <div>
            <p className="text-[7px] uppercase tracking-[0.16em] text-[#9aa6a1]">
              Selected signal
            </p>

            <p className="mt-1 text-[10px] font-medium">
              {hotspots.find((item) => item.id === active)?.label}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}