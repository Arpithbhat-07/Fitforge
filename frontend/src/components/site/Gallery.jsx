import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const FILTERS = ["All", "Gym", "Workouts", "Events", "Transformation"];

export default function Gallery({ images = [] }) {
  const [filter, setFilter] = useState("All");
  const [lightbox, setLightbox] = useState(null);

  const filtered = useMemo(() => {
    const list = images || [];
    if (filter === "All") return list;
    return list.filter(i => i.category === filter);
  }, [images, filter]);

  const openAt = (idx) => setLightbox(idx);
  const close = () => setLightbox(null);
  const prev = () => setLightbox((v) => (v - 1 + filtered.length) % filtered.length);
  const next = () => setLightbox((v) => (v + 1) % filtered.length);

  return (
    <section id="gallery" className="section-y bg-[#0B0B0B] border-t border-[#2A2A2A]" data-testid="gallery-section">
      <div className="container-x">
        <div className="grid lg:grid-cols-12 gap-10 mb-10">
          <div className="lg:col-span-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-[2px] bg-[#FF5A1F]" />
              <span className="text-xs uppercase tracking-[0.3em] text-[#FF5A1F] font-bold">Inside FitForge</span>
            </div>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.9] tracking-tight" data-testid="gallery-heading">
              Where <span className="text-[#FF5A1F]">work</span><br />gets done.
            </h2>
          </div>
          <div className="lg:col-span-6 flex items-end justify-end flex-wrap gap-2" data-testid="gallery-filters">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-xs uppercase tracking-widest font-bold transition-colors border ${filter === f ? "bg-[#FF5A1F] border-[#FF5A1F] text-white" : "border-[#2A2A2A] text-[#CFCFCF] hover:text-white hover:border-[#FF5A1F]"}`}
                data-testid={`gallery-filter-${f.toLowerCase()}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4" data-testid="gallery-masonry">
          {filtered.map((img, i) => (
            <motion.button
              key={img.id}
              onClick={() => openAt(i)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 8) * 0.04 }}
              className="block w-full break-inside-avoid overflow-hidden group relative"
              data-testid={`gallery-item-${i}`}
            >
              <img
                src={img.url}
                alt={img.caption}
                loading="lazy"
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-[#0B0B0B]/0 group-hover:bg-[#0B0B0B]/50 transition-colors flex items-end p-3">
                <span className="text-xs uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity">{img.caption || img.category}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={close}
            data-testid="gallery-lightbox"
          >
            <button onClick={(e) => { e.stopPropagation(); close(); }} aria-label="Close" className="absolute top-6 right-6 text-white/70 hover:text-white p-2" data-testid="lightbox-close">
              <X size={28} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous" className="absolute left-6 text-white/70 hover:text-white p-2">
              <ChevronLeft size={36} />
            </button>
            <motion.img
              key={filtered[lightbox]?.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              src={filtered[lightbox]?.url}
              alt=""
              className="max-h-[85vh] max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next" className="absolute right-6 text-white/70 hover:text-white p-2">
              <ChevronRight size={36} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
