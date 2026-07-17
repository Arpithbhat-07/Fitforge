import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { ArrowUpRight } from "lucide-react";

export default function Services({ services }) {
  return (
    <section id="services" className="section-y bg-[#0B0B0B] border-t border-[#2A2A2A]" data-testid="services-section">
      <div className="container-x">
        <div className="grid lg:grid-cols-12 gap-10 mb-14">
          <div className="lg:col-span-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-[2px] bg-[#FF5A1F]" />
              <span className="text-xs uppercase tracking-[0.3em] text-[#FF5A1F] font-bold">What We Offer</span>
            </div>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.9] tracking-tight" data-testid="services-heading">
              Programs<br />that <span className="text-[#FF5A1F]">deliver.</span>
            </h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 lg:pt-8">
            <p className="text-lg text-[#CFCFCF] leading-relaxed">
              Nine disciplines. One goal. Every program is coached by nationally certified professionals and calibrated to your level.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="services-grid">
          {(services || []).map((s, i) => {
            const Icon = Icons[s.icon] || Icons.Dumbbell;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-5% 0px" }}
                transition={{ delay: (i % 3) * 0.08, duration: 0.55 }}
                className="group relative bg-[#171717] border border-[#2A2A2A] p-8 hover:-translate-y-2 hover:border-[#FF5A1F]/60 hover:shadow-[0_20px_50px_-20px_rgba(255,90,31,0.35)] transition-[transform,border-color,box-shadow] duration-300 overflow-hidden"
                data-testid={`service-card-${i}`}
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="w-14 h-14 flex items-center justify-center bg-[#0B0B0B] border border-[#2A2A2A] group-hover:border-[#FF5A1F] transition-colors">
                    <Icon className="w-6 h-6 text-[#FF5A1F]" />
                  </div>
                  <span className="text-xs text-[#8A8A8A] uppercase tracking-widest">0{i + 1}</span>
                </div>
                <div className="font-display text-3xl uppercase tracking-wider mb-3">{s.title}</div>
                <p className="text-sm text-[#CFCFCF] leading-relaxed mb-6 clamp-3">{s.description}</p>
                <a href="#join" className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-white group-hover:text-[#FF5A1F] transition-colors" data-testid={`service-learn-${i}`}>
                  Learn More
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
                <div className="absolute -bottom-16 -right-16 w-40 h-40 rounded-full bg-[#FF5A1F]/0 group-hover:bg-[#FF5A1F]/10 blur-2xl transition-colors" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
