import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Phone, X } from "lucide-react";

export default function FloatingCTAs({ contact, whatsappEnabled, stickyEnabled }) {
  const [expanded, setExpanded] = useState(false);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 800);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const wa = (contact?.whatsapp || "").replace(/\D/g, "");
  const phone = contact?.phone;

  return (
    <>
      {/* WhatsApp float */}
      {whatsappEnabled && wa && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3" data-testid="floating-ctas">
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col gap-2 items-end"
              >
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="flex items-center gap-2 bg-[#171717] border border-[#2A2A2A] px-4 py-3 hover:border-[#FF5A1F] transition-colors group"
                    data-testid="floating-call"
                  >
                    <span className="text-xs uppercase tracking-widest text-white group-hover:text-[#FF5A1F]">Call us</span>
                    <Phone className="w-4 h-4 text-[#FF5A1F]" />
                  </a>
                )}
                <a
                  href={`https://wa.me/${wa}?text=Hi%20FitForge!%20I%20want%20to%20join.`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 bg-[#25D366] px-4 py-3 hover:bg-[#20b957] transition-colors"
                  data-testid="floating-whatsapp"
                >
                  <span className="text-xs uppercase tracking-widest text-white font-bold">WhatsApp</span>
                  <MessageCircle className="w-4 h-4 text-white" />
                </a>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setExpanded(!expanded)}
            className="relative w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20b957] flex items-center justify-center shadow-[0_10px_30px_rgba(37,211,102,0.4)] transition-colors pulse-glow"
            aria-label="Chat"
            data-testid="floating-toggle"
          >
            {expanded ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
          </button>
        </div>
      )}

      {/* Sticky join CTA */}
      {stickyEnabled && (
        <AnimatePresence>
          {showSticky && (
            <motion.a
              href="#join"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="fixed bottom-6 left-6 z-40 hidden md:inline-flex items-center gap-2 bg-[#FF5A1F] hover:bg-[#FF8A00] text-white font-bold uppercase text-sm tracking-widest px-6 py-4 shadow-[0_10px_30px_rgba(255,90,31,0.35)] transition-colors"
              data-testid="sticky-join"
            >
              Join FitForge →
            </motion.a>
          )}
        </AnimatePresence>
      )}
    </>
  );
}
