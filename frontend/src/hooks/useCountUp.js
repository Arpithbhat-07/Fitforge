import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

export function useCountUp(target, { duration = 1600, start = 0 } = {}) {
  const [val, setVal] = useState(start);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  // Parse numeric portion of target if it's a string like "2500+" or "24/7"
  const numericTarget = typeof target === "number"
    ? target
    : parseFloat((String(target).match(/[\d.]+/) || [0])[0]);

  useEffect(() => {
    if (!inView) return;
    const startTime = performance.now();
    let raf;
    const tick = (t) => {
      const elapsed = t - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(numericTarget * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, numericTarget, duration]);

  return { ref, value: val };
}
