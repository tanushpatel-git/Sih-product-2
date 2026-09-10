"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface TluxFloatingButtonProps {
  onChatOpen?: () => void;
}

export default function TluxFloatingButton({ onChatOpen }: TluxFloatingButtonProps = {}) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (onChatOpen) {
      onChatOpen();
    } else {
      router.push("/patient/Tlux");
    }
  };

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
    >
      <motion.button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#4a7c6e] to-[#3d6b5e] text-white shadow-lg shadow-[#4a7c6e]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#4a7c6e]/40"
      >
        {/* Pulse effect */}
        <motion.span
          className="absolute inset-0 rounded-full bg-[#4a7c6e]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Icon */}
        <MessageCircle size={24} strokeWidth={2} className="relative z-10" />

        {/* Tooltip */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute right-full mr-3 rounded-lg bg-[#17201d] px-3 py-2 text-white shadow-lg"
          >
            <p className="text-xs font-medium">Open TLUX</p>
            <p className="text-[10px] text-white/70">Consultation Assistant</p>
          </motion.div>
        )}
      </motion.button>
    </motion.div>
  );
}