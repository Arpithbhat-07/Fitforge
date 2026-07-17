import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? scrolled / height : 0);
      setVisible(scrolled > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[70] h-[2px] bg-transparent pointer-events-none" data-testid="scroll-progress">
        <div className="h-full bg-gradient-to-r from-[#FF5A1F] to-[#FF8A00] origin-left" style={{ transform: `scaleX(${progress})` }} />
      </div>

      <AnimatePresence>
        {visible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-24 right-6 z-40 w-11 h-11 bg-[#171717] border border-[#2A2A2A] hover:border-[#FF5A1F] hover:text-[#FF5A1F] flex items-center justify-center transition-colors"
            aria-label="Back to top"
            data-testid="back-to-top"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
