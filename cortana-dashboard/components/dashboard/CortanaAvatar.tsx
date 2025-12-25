"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function CortanaAvatar() {
  return (
    <div className="relative w-full h-[320px] flex items-center justify-center">
      {/* Background glow effect - subtle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-48 h-48 rounded-full bg-blue-50 blur-3xl" />
      </div>

      {/* Main avatar container */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Circular avatar */}
        <motion.div
          className="relative w-40 h-40 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center"
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Inner ring */}
          <div className="absolute inset-3 rounded-full border border-gray-100" />

          {/* Icon */}
          <Sparkles className="w-14 h-14 text-blue-600" />

          {/* Minimal pulsing dots */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-blue-600"
              style={{
                top: '50%',
                left: '50%',
                transformOrigin: '0 0',
              }}
              animate={{
                rotate: i * 90,
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 translate-x-20" />
            </motion.div>
          ))}
        </motion.div>

        {/* Name label */}
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
            CORTANA
          </h2>
          <p className="text-gray-500 text-xs mt-0.5">
            AI Personal Assistant
          </p>
        </motion.div>
      </motion.div>

      {/* Orbital rings - minimal */}
      {[...Array(2)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-gray-100"
          style={{
            width: `${260 + i * 50}px`,
            height: `${260 + i * 50}px`,
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 25 + i * 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
