import { motion } from "framer-motion";
import { Star, PlayCircle } from "lucide-react";

function Stars({ rating = 5 }) {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-[#FF5A1F] text-[#FF5A1F]" : "text-[#2A2A2A]"}`} />
      ))}
    </div>
  );
}

export default function Testimonials({ testimonials }) {
  const primary = testimonials?.[0];
  const rest = testimonials?.slice(1) || [];

  return (
    <section id="stories" className="section-y bg-[#0B0B0B] border-t border-[#2A2A2A]" data-testid="testimonials-section">
      <div className="container-x">
        <div className="flex items-baseline justify-between mb-14">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-[2px] bg-[#FF5A1F]" />
              <span className="text-xs uppercase tracking-[0.3em] text-[#FF5A1F] font-bold">Transformation Stories</span>
            </div>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.9] tracking-tight" data-testid="stories-heading">
              Real people.<br /><span className="text-[#FF5A1F]">Real results.</span>
            </h2>
          </div>
        </div>

        {primary && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-12 gap-4 bg-[#171717] border border-[#2A2A2A] overflow-hidden mb-6"
            data-testid="story-featured"
          >
            {(primary.before_image || primary.after_image) && (
              <div className="md:col-span-6 grid grid-cols-2">
                <div className="relative">
                  {primary.before_image && (
                    <>
                      <img src={primary.before_image} alt="Before" loading="lazy" className="w-full h-64 md:h-full object-cover grayscale" />
                      <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest bg-[#0B0B0B]/70 px-2 py-1">Before</span>
                    </>
                  )}
                </div>
                <div className="relative">
                  {primary.after_image && (
                    <>
                      <img src={primary.after_image} alt="After" loading="lazy" className="w-full h-64 md:h-full object-cover" />
                      <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest bg-[#FF5A1F] px-2 py-1">After</span>
                    </>
                  )}
                </div>
              </div>
            )}
            <div className="md:col-span-6 p-10 flex flex-col justify-center">
              <Stars rating={primary.rating} />
              <p className="mt-6 text-2xl md:text-3xl font-display uppercase tracking-tight leading-tight text-white">"{primary.story}"</p>
              <div className="mt-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FF5A1F] flex items-center justify-center font-display text-xl">{primary.name[0]}</div>
                <div>
                  <div className="font-bold text-white">{primary.name}</div>
                  <div className="text-xs uppercase tracking-widest text-[#8A8A8A]">{primary.role}</div>
                </div>
                <button className="ml-auto flex items-center gap-2 text-sm text-[#FF5A1F] hover:text-[#FF8A00] transition-colors" data-testid="story-video">
                  <PlayCircle className="w-5 h-5" /> Watch Story
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-4" data-testid="stories-grid">
          {rest.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#171717] border border-[#2A2A2A] p-8 hover:border-[#FF5A1F]/50 transition-colors flex flex-col justify-between"
              data-testid={`story-card-${i}`}
            >
              <div>
                {(t.before_image || t.after_image) && (
                  <div className="grid grid-cols-2 gap-2 mb-6 h-44 overflow-hidden rounded-lg border border-[#2A2A2A]">
                    <div className="relative h-full">
                      {t.before_image && (
                        <>
                          <img src={t.before_image} alt="Before" loading="lazy" className="w-full h-full object-cover grayscale" />
                          <span className="absolute top-2 left-2 text-[8px] uppercase tracking-widest bg-[#0B0B0B]/70 px-2 py-0.5 text-white">Before</span>
                        </>
                      )}
                    </div>
                    <div className="relative h-full">
                      {t.after_image && (
                        <>
                          <img src={t.after_image} alt="After" loading="lazy" className="w-full h-full object-cover" />
                          <span className="absolute top-2 left-2 text-[8px] uppercase tracking-widest bg-[#FF5A1F] px-2 py-0.5 text-white">After</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
                <Stars rating={t.rating} />
                <p className="mt-5 text-sm md:text-base leading-relaxed text-[#CFCFCF]">"{t.story}"</p>
              </div>
              <div className="mt-6 flex items-center gap-3">
                {t.avatar ? (
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 object-cover rounded-full border border-[#2A2A2A]" />
                ) : (
                  <div className="w-12 h-12 bg-[#FF5A1F]/20 border border-[#FF5A1F] flex items-center justify-center font-display text-xl text-[#FF5A1F] rounded-full">{t.name[0]}</div>
                )}
                <div>
                  <div className="font-bold text-white text-sm">{t.name}</div>
                  <div className="text-xs uppercase tracking-widest text-[#8A8A8A]">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
