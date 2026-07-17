import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";
import { ChevronDown, Play } from "lucide-react";

function Stat({ item, index }) {
  const { ref, value } = useCountUp(item.value);
  // Preserve suffix like +, / etc from the original string
  const raw = String(item.value);
  const isSpecial = raw.includes("/") || raw.match(/[A-Za-z]/);
  const numeric = parseFloat((raw.match(/[\d.]+/) || [0])[0]);
  const suffix = raw.replace(/[\d.]/g, "");

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="border-l border-[#2A2A2A] pl-4 md:pl-6"
      data-testid={`hero-stat-${index}`}
    >
      <div className="font-display text-4xl md:text-6xl lg:text-7xl leading-none">
        {isSpecial ? raw : Math.round(value)}
        {!isSpecial && suffix}
      </div>
      <div className="mt-2 text-xs md:text-sm uppercase tracking-[0.2em] text-[#8A8A8A]">{item.label}</div>
    </motion.div>
  );
}

export default function Hero({ hero }) {
  const stats = hero?.stats || [];

  return (
    <section id="home" className="relative min-h-screen overflow-hidden noise-overlay" data-testid="hero-section">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={hero?.background_image}
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-[#0B0B0B]/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B]/90 via-transparent to-transparent" />
      </div>

      {/* Floating shapes */}
      <motion.div
        aria-hidden
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#FF5A1F]/20 blur-3xl"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#FF8A00]/15 blur-3xl"
        animate={{ scale: [1.1, 1, 1.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 container-x min-h-screen flex flex-col justify-center pt-28 pb-32">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3 mb-6"
        >
          <span className="w-10 h-[2px] bg-[#FF5A1F]" />
          <span className="text-xs uppercase tracking-[0.3em] text-[#FF5A1F] font-bold" data-testid="hero-eyebrow">Premium Fitness Club</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] leading-[0.85] tracking-tight max-w-5xl hero-shadow"
          data-testid="hero-title"
        >
          {hero?.title || "FITFORGE"}
          <br />
          <span className="text-[#FF5A1F]">{hero?.tagline || "Stronger Every Day."}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="mt-8 max-w-xl text-lg md:text-xl text-[#CFCFCF] leading-relaxed"
          data-testid="hero-description"
        >
          {hero?.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <a
            href="#join"
            className="ripple relative overflow-hidden bg-[#FF5A1F] hover:bg-[#FF8A00] text-white font-bold uppercase text-sm md:text-base tracking-widest px-10 py-5 transition-colors inline-flex items-center gap-2"
            data-testid="hero-cta-primary"
          >
            {hero?.cta_primary_label || "Join Now"}
            <span className="w-4 h-[2px] bg-white group-hover:w-8 transition-all" />
          </a>
          <a
            href="#book-trial"
            className="border-2 border-white/30 hover:border-[#FF5A1F] text-white font-bold uppercase text-sm md:text-base tracking-widest px-10 py-5 transition-colors inline-flex items-center gap-2 group"
            data-testid="hero-cta-secondary"
          >
            <Play className="w-4 h-4 group-hover:text-[#FF5A1F] transition-colors" />
            {hero?.cta_secondary_label || "Book Free Trial"}
          </a>
        </motion.div>

        {/* Stats */}
        <div className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 max-w-5xl" data-testid="hero-stats">
          {stats.map((s, i) => <Stat key={i} item={s} index={i} />)}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#about"
        aria-label="Scroll down"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/60 hover:text-white flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        data-testid="hero-scroll-indicator"
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <ChevronDown className="w-5 h-5" />
      </motion.a>
    </section>
  );
}
