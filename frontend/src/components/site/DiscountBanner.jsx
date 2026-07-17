import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const KEY = "ff_discount_dismissed";

export default function DiscountBanner({ enabled, text }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    setVisible(sessionStorage.getItem(KEY) !== "1");
  }, [enabled]);

  if (!enabled) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-[#FF5A1F] to-[#FF8A00] text-white px-4"
          data-testid="discount-banner"
        >
          <div className="container-x flex items-center justify-center gap-4 py-2 text-sm font-medium relative">
            <div className="marquee-track whitespace-nowrap overflow-hidden">
              {text}
            </div>
            <button onClick={() => { sessionStorage.setItem(KEY, "1"); setVisible(false); }} className="absolute right-4 text-white/80 hover:text-white" aria-label="Dismiss" data-testid="discount-dismiss">
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
