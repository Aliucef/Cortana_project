"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useFinance } from "./FinanceContext";

export default function SuccessToast() {
  const { showSuccessToast, successMessage } = useFinance();

  return (
    <AnimatePresence>
      {showSuccessToast && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-24 right-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 min-w-[300px]"
        >
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold">{successMessage.title}</div>
            <div className="text-sm text-white/90">{successMessage.subtitle}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
