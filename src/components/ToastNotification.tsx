import React from "react";
import { Check, AlertTriangle, Info, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface ToastNotificationProps {
  toast: { message: string; type: "success" | "error" | "info" } | null;
  onClose: () => void;
  isDark: boolean;
}

export default function ToastNotification({ toast, onClose, isDark }: ToastNotificationProps) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className={`fixed bottom-5 right-5 z-[200] p-4 rounded-xl border shadow-2xl flex items-center gap-3.5 max-w-sm ${
            toast.type === "success"
              ? (isDark ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-400 backdrop-blur-md" : "bg-[#f4fbf7] border-emerald-200 text-emerald-800 shadow-md")
              : toast.type === "error"
              ? (isDark ? "bg-rose-950/90 border-rose-500/40 text-rose-400 backdrop-blur-md" : "bg-[#fef5f6] border-rose-200 text-rose-800 shadow-md")
              : (isDark ? "bg-blue-950/90 border-blue-500/40 text-blue-400 backdrop-blur-md" : "bg-[#f5f9fe] border-blue-250 text-blue-800 shadow-md")
          }`}
        >
          <div className={`p-1.5 rounded-lg shrink-0 ${
            toast.type === "success" 
              ? (isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-100 text-emerald-700") 
              : toast.type === "error" 
              ? (isDark ? "bg-rose-500/10 text-rose-400" : "bg-rose-100 text-rose-700") 
              : (isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-100 text-blue-700")
          }`}>
            {toast.type === "success" && <Check className="w-4 h-4" />}
            {toast.type === "error" && <AlertTriangle className="w-4 h-4" />}
            {toast.type === "info" && <Info className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-60">
              {toast.type === "success" ? "Verification OK" : toast.type === "error" ? "Synchronization Alert" : "System Information"}
            </p>
            <p className="text-xs font-sans mt-0.5 leading-normal font-medium">{toast.message}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded opacity-50 hover:opacity-100 transition text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
