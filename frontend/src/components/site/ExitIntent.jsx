import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";

const KEY = "ff_exit_shown";

export default function ExitIntent({ enabled, title, message }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!enabled) return;
    if (sessionStorage.getItem(KEY) === "1") return;
    const onMouseLeave = (e) => {
      if (e.clientY < 5) {
        if (sessionStorage.getItem(KEY) === "1") return;
        setOpen(true);
        sessionStorage.setItem(KEY, "1");
        document.removeEventListener("mouseleave", onMouseLeave);
      }
    };
    // Only trigger on desktop
    if (window.innerWidth >= 1024) {
      document.addEventListener("mouseleave", onMouseLeave);
    }
    return () => document.removeEventListener("mouseleave", onMouseLeave);
  }, [enabled]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/newsletter/subscribe", { email });
      toast.success("You're on the list — check your inbox for the pass code.");
      setOpen(false);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
          data-testid="exit-intent"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#0B0B0B] border border-[#FF5A1F] max-w-md w-full p-10 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF5A1F] to-[#FF8A00]" />
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-white/60 hover:text-white" aria-label="Close" data-testid="exit-close">
              <X size={20} />
            </button>
            <Gift className="w-10 h-10 text-[#FF5A1F] mb-4" />
            <div className="font-display text-4xl uppercase tracking-tight mb-2">{title}</div>
            <p className="text-[#CFCFCF] mb-6">{message}</p>
            <form onSubmit={submit} className="flex border border-[#2A2A2A] focus-within:border-[#FF5A1F] transition-colors">
              <input required type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-transparent flex-1 outline-none px-4 py-3 text-sm" data-testid="exit-email" />
              <button type="submit" className="bg-[#FF5A1F] hover:bg-[#FF8A00] text-white uppercase text-xs font-bold tracking-widest px-6 transition-colors" data-testid="exit-submit">
                Claim
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
