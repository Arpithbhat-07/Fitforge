import { motion } from "framer-motion";
import { Target, Eye, Heart, TrendingUp, Users, Shield } from "lucide-react";

const VALUE_ICONS = { Discipline: Shield, Community: Users, Progress: TrendingUp, Integrity: Heart };

export default function About({ about }) {
  if (!about) return null;
  const values = about.core_values || [];
  const journey = about.journey || [];

  return (
    <section id="about" className="relative section-y bg-[#0B0B0B]" data-testid="about-section">
      <div className="container-x">
        {/* Section header */}
        <div className="grid lg:grid-cols-12 gap-10 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-[2px] bg-[#FF5A1F]" />
              <span className="text-xs uppercase tracking-[0.3em] text-[#FF5A1F] font-bold">About FitForge</span>
            </div>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.9] tracking-tight" data-testid="about-heading">
              Built for those who <span className="text-[#FF5A1F]">refuse<br />to settle.</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-7 lg:pt-10"
          >
            <p className="text-[#CFCFCF] leading-relaxed text-lg prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: about.who_we_are }} data-testid="about-who" />
          </motion.div>
        </div>

        {/* Mission / Vision */}
        {(() => {
          const sections = about.sections || {};
          const isMissionActive = !sections.mission?.hidden && !sections.mission?.deleted;
          const isVisionActive = !sections.vision?.hidden && !sections.vision?.deleted;
          const gridCols = isMissionActive && isVisionActive ? "grid md:grid-cols-2" : "grid grid-cols-1";

          if (!isMissionActive && !isVisionActive) return null;

          return (
            <div className={`${gridCols} gap-6 mb-20`}>
              {isMissionActive && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-[#171717] border border-[#2A2A2A] p-10 hover:border-[#FF5A1F]/50 transition-colors relative overflow-hidden group"
                >
                  <Target className="w-10 h-10 text-[#FF5A1F] mb-6" />
                  <div className="font-display text-3xl uppercase tracking-wider mb-3">Mission</div>
                  <p className="text-[#CFCFCF] leading-relaxed prose prose-invert max-w-none text-sm" dangerouslySetInnerHTML={{ __html: about.mission }} />
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-[#FF5A1F]/10 blur-2xl group-hover:bg-[#FF5A1F]/20 transition-colors" />
                </motion.div>
              )}
              {isVisionActive && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 }}
                  className="bg-[#171717] border border-[#2A2A2A] p-10 hover:border-[#FF5A1F]/50 transition-colors relative overflow-hidden group"
                >
                  <Eye className="w-10 h-10 text-[#FF5A1F] mb-6" />
                  <div className="font-display text-3xl uppercase tracking-wider mb-3">Vision</div>
                  <p className="text-[#CFCFCF] leading-relaxed prose prose-invert max-w-none text-sm" dangerouslySetInnerHTML={{ __html: about.vision }} />
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-[#FF8A00]/10 blur-2xl group-hover:bg-[#FF8A00]/20 transition-colors" />
                </motion.div>
              )}
            </div>
          );
        })()}


        {/* Core Values */}
        <div className="mb-20">
          <div className="flex items-baseline justify-between mb-10">
            <h3 className="font-display text-4xl md:text-5xl uppercase tracking-tight">Core Values</h3>
            <div className="hidden md:block h-[2px] flex-1 mx-8 bg-[#2A2A2A]" />
            <span className="text-xs text-[#8A8A8A] uppercase tracking-widest">04 Pillars</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((v, i) => {
              const Icon = VALUE_ICONS[v.title] || Shield;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="bg-[#171717] border border-[#2A2A2A] p-6 hover:-translate-y-2 hover:border-[#FF5A1F]/60 transition-all duration-300"
                  data-testid={`value-card-${i}`}
                >
                  <Icon className="w-8 h-8 text-[#FF5A1F] mb-4" />
                  <div className="font-display text-2xl uppercase tracking-wider mb-2">{v.title}</div>
                  <p className="text-sm text-[#CFCFCF] leading-relaxed">{v.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Journey timeline */}
        <div>
          <div className="flex items-baseline justify-between mb-10">
            <h3 className="font-display text-4xl md:text-5xl uppercase tracking-tight">Our Journey</h3>
            <div className="hidden md:block h-[2px] flex-1 mx-8 bg-[#2A2A2A]" />
            <span className="text-xs text-[#8A8A8A] uppercase tracking-widest">Milestones</span>
          </div>
          <div className="relative">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-[#2A2A2A] md:-translate-x-[1px]" />
            {journey.map((j, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`relative pl-16 md:pl-0 md:grid md:grid-cols-2 md:gap-16 items-center mb-10 ${i % 2 === 0 ? "" : "md:direction-rtl"}`}
                data-testid={`journey-${i}`}
              >
                <div className={`${i % 2 === 0 ? "md:text-right md:pr-8" : "md:col-start-2 md:pl-8"} bg-[#171717] border border-[#2A2A2A] p-6 md:inline-block`}>
                  <div className="font-display text-4xl text-[#FF5A1F] leading-none mb-2">{j.year}</div>
                  <div className="font-display text-2xl uppercase tracking-wider mb-2">{j.title}</div>
                  <p className="text-sm text-[#CFCFCF] leading-relaxed">{j.description}</p>
                </div>
                <div className="absolute left-4 md:left-1/2 top-6 w-5 h-5 bg-[#FF5A1F] pulse-glow md:-translate-x-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
