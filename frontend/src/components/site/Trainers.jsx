import { motion } from "framer-motion";
import { Instagram, Linkedin, Twitter, Award } from "lucide-react";

const SOCIAL_ICONS = { instagram: Instagram, linkedin: Linkedin, twitter: Twitter };

export default function Trainers({ trainers }) {
  return (
    <section id="trainers" className="section-y bg-[#0B0B0B] border-t border-[#2A2A2A]" data-testid="trainers-section">
      <div className="container-x">
        <div className="grid lg:grid-cols-12 gap-10 mb-14">
          <div className="lg:col-span-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-[2px] bg-[#FF5A1F]" />
              <span className="text-xs uppercase tracking-[0.3em] text-[#FF5A1F] font-bold">The Coaches</span>
            </div>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.9] tracking-tight" data-testid="trainers-heading">
              Coached by<br /><span className="text-[#FF5A1F]">the best.</span>
            </h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 lg:pt-8">
            <p className="text-lg text-[#CFCFCF] leading-relaxed">
              Every trainer at FitForge holds nationally recognized certifications and years of hands-on experience with real athletes.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="trainers-grid">
          {(trainers || []).map((t, i) => (
            <motion.article
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 4) * 0.08, duration: 0.55 }}
              className="group relative bg-[#171717] border border-[#2A2A2A] overflow-hidden hover:border-[#FF5A1F]/60 transition-colors"
              data-testid={`trainer-card-${i}`}
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={t.photo}
                  alt={t.name}
                  loading="lazy"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-[filter,transform] duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-transparent" />
                <div className="absolute top-4 left-4 flex items-center gap-1 bg-[#0B0B0B]/70 backdrop-blur-md px-2 py-1 text-[10px] uppercase tracking-widest">
                  <Award className="w-3 h-3 text-[#FF5A1F]" />
                  {t.experience}
                </div>
              </div>
              <div className="p-6">
                <div className="font-display text-2xl uppercase tracking-wider">{t.name}</div>
                <div className="text-xs uppercase tracking-widest text-[#FF5A1F] mb-3">{t.role}</div>
                <p className="text-sm text-[#CFCFCF] leading-relaxed clamp-2 mb-4">{t.specialization}</p>
                {t.certifications?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {t.certifications.map((c, k) => (
                      <span key={k} className="text-[10px] uppercase tracking-widest border border-[#2A2A2A] px-2 py-1 text-[#CFCFCF]">{c}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-[#2A2A2A] pt-4">
                  <div className="flex gap-3">
                    {t.socials && Object.entries(t.socials).map(([k, v]) => {
                      const Icon = SOCIAL_ICONS[k];
                      if (!Icon) return null;
                      return (
                        <a key={k} href={v} target="_blank" rel="noreferrer" className="text-[#8A8A8A] hover:text-[#FF5A1F] transition-colors" aria-label={k}>
                          <Icon className="w-4 h-4" />
                        </a>
                      );
                    })}
                  </div>
                  <a href="#join" className="text-[10px] uppercase tracking-widest text-white hover:text-[#FF5A1F] transition-colors" data-testid={`trainer-book-${i}`}>
                    Book Session →
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
