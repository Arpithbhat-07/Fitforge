import { motion } from "framer-motion";
import * as Icons from "lucide-react";

export default function WhyChooseUs({ features }) {
  return (
    <section id="why" className="section-y bg-[#0B0B0B] border-t border-[#2A2A2A]" data-testid="why-section">
      <div className="container-x">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-10 h-[2px] bg-[#FF5A1F]" />
            <span className="text-xs uppercase tracking-[0.3em] text-[#FF5A1F] font-bold">Why FitForge</span>
            <span className="w-10 h-[2px] bg-[#FF5A1F]" />
          </div>
          <h2 className="font-display text-5xl md:text-7xl leading-[0.9] tracking-tight" data-testid="why-heading">
            Every detail, <span className="text-[#FF5A1F]">engineered.</span>
          </h2>
        </div>

        {/* Bento-style grid: 2 rows × 4 cols with a spanning feature card */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-testid="why-grid">
          {(features || []).map((f, i) => {
            const Icon = Icons[f.icon] || Icons.ShieldCheck;
            const isFeature = i === 0;
            return (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 4) * 0.06 }}
                className={`relative bg-[#171717] border border-[#2A2A2A] p-6 md:p-8 hover:border-[#FF5A1F]/60 transition-colors group overflow-hidden ${isFeature ? "md:col-span-2 md:row-span-2 flex flex-col justify-between min-h-[240px]" : ""}`}
                data-testid={`feature-${i}`}
              >
                <Icon className={`text-[#FF5A1F] ${isFeature ? "w-12 h-12" : "w-8 h-8"}`} />
                <div className="mt-4">
                  <div className={`font-display uppercase tracking-wider ${isFeature ? "text-3xl md:text-4xl" : "text-xl"}`}>{f.title}</div>
                  {f.description && <p className={`mt-2 text-[#CFCFCF] leading-relaxed ${isFeature ? "text-base" : "text-xs"}`}>{f.description}</p>}
                </div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-[#FF5A1F]/0 group-hover:bg-[#FF5A1F]/10 blur-2xl transition-colors" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
