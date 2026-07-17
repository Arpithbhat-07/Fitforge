import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CalendarCheck } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";

export default function BookTrialModal() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", preferred_date: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === "#book-trial") {
        setOpen(true);
        // clear hash so re-triggering works
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    };
    window.addEventListener("hashchange", onHash);
    onHash();
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/trial-bookings", form);
      toast.success("Trial booked — see you at the gym!");
      setForm({ name: "", phone: "", email: "", preferred_date: "" });
      setOpen(false);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally { setSaving(false); }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
            data-testid="book-trial-modal"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0B0B0B] border border-[#FF5A1F] max-w-md w-full p-10 relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF5A1F] to-[#FF8A00]" />
              <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-white/60 hover:text-white" aria-label="Close" data-testid="trial-close">
                <X size={20} />
              </button>
              <CalendarCheck className="w-10 h-10 text-[#FF5A1F] mb-4" />
              <div className="font-display text-4xl uppercase mb-2">Book a Free Trial</div>
              <p className="text-[#CFCFCF] mb-6 text-sm">3 days full access. Coach on the floor. Zero commitment.</p>
              <form onSubmit={submit} className="space-y-4">
                <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-transparent border-b border-[#2A2A2A] focus:border-[#FF5A1F] outline-none py-2 w-full transition-colors" data-testid="trial-name" />
                <input required placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-transparent border-b border-[#2A2A2A] focus:border-[#FF5A1F] outline-none py-2 w-full transition-colors" data-testid="trial-phone" />
                <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-transparent border-b border-[#2A2A2A] focus:border-[#FF5A1F] outline-none py-2 w-full transition-colors" data-testid="trial-email" />
                <input type="date" value={form.preferred_date} onChange={(e) => setForm({ ...form, preferred_date: e.target.value })} className="bg-transparent border-b border-[#2A2A2A] focus:border-[#FF5A1F] outline-none py-2 w-full transition-colors text-white" data-testid="trial-date" />
                <button type="submit" disabled={saving} className="ripple relative overflow-hidden mt-2 w-full bg-[#FF5A1F] hover:bg-[#FF8A00] disabled:opacity-50 text-white font-bold uppercase tracking-widest py-4 transition-colors" data-testid="trial-submit">
                  {saving ? "Booking…" : "Confirm Trial"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
