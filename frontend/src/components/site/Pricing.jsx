import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";

const formatCurrency = (val) => {
  if (val == null) return "";
  const num = typeof val === "number" ? val : parseFloat(String(val).replace(/[^\d.-]/g, ""));
  if (isNaN(num)) return String(val);
  return `₹ ${num.toLocaleString("en-IN")}`;
};

export default function Pricing({ plans }) {
  return (
    <section id="plans" className="section-y bg-[#0B0B0B] border-t border-[#2A2A2A]" data-testid="plans-section">
      <div className="container-x">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-10 h-[2px] bg-[#FF5A1F]" />
            <span className="text-xs uppercase tracking-[0.3em] text-[#FF5A1F] font-bold">Membership Plans</span>
            <span className="w-10 h-[2px] bg-[#FF5A1F]" />
          </div>
          <h2 className="font-display text-5xl md:text-7xl leading-[0.9] tracking-tight" data-testid="plans-heading">
            Choose your <span className="text-[#FF5A1F]">edge.</span>
          </h2>
          <p className="mt-6 text-lg text-[#CFCFCF] max-w-2xl mx-auto">Transparent pricing. No hidden fees. Cancel anytime.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch" data-testid="plans-grid">
          {(plans || []).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
              className={`relative flex flex-col p-10 border ${p.is_highlighted ? "bg-gradient-to-b from-[#FF5A1F]/10 to-[#171717] border-[#FF5A1F]" : "bg-[#171717] border-[#2A2A2A]"} hover:-translate-y-2 transition-transform duration-300`}
              data-testid={`plan-card-${i}`}
            >
              {p.is_highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FF5A1F] text-white text-[10px] uppercase font-bold tracking-widest px-4 py-1 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-white" /> Most Popular
                </div>
              )}
              <div className="text-xs uppercase tracking-[0.3em] text-[#8A8A8A] mb-4">Plan {i + 1}</div>
              <div className="font-display text-5xl uppercase tracking-wider mb-2">{p.name}</div>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="font-display text-5xl text-white">{formatCurrency(p.price)}</span>
                <span className="text-sm text-[#8A8A8A]">{p.period}</span>
              </div>

              <ul className="space-y-3 mb-10 flex-1">
                {p.features.map((f, k) => (
                  <li key={k} className="flex items-start gap-3 text-sm text-[#CFCFCF]">
                    <Check className={`w-4 h-4 shrink-0 mt-0.5 ${p.is_highlighted ? "text-[#FF5A1F]" : "text-[#3DDC84]"}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#join"
                className={`ripple relative overflow-hidden text-center font-bold uppercase text-sm tracking-widest py-4 transition-colors ${p.is_highlighted ? "bg-[#FF5A1F] hover:bg-[#FF8A00] text-white" : "border border-[#2A2A2A] hover:border-[#FF5A1F] hover:text-[#FF5A1F] text-white"}`}
                data-testid={`plan-cta-${i}`}
              >
                {p.cta_label || "Get Started"}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
