import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sun, Cloud, Moon } from "lucide-react";

const PERIODS = [
  { key: "Morning", icon: Sun },
  { key: "Afternoon", icon: Cloud },
  { key: "Evening", icon: Moon },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Schedule({ schedule }) {
  const [period, setPeriod] = useState("Morning");

  const byDay = useMemo(() => {
    const grouped = Object.fromEntries(DAYS.map(d => [d, []]));
    (schedule || []).filter(x => x.period === period).forEach(item => {
      if (grouped[item.day]) grouped[item.day].push(item);
    });
    for (const d of DAYS) grouped[d].sort((a, b) => (a.order || 0) - (b.order || 0));
    return grouped;
  }, [schedule, period]);

  return (
    <section id="schedule" className="section-y bg-[#0B0B0B] border-t border-[#2A2A2A]" data-testid="schedule-section">
      <div className="container-x">
        <div className="grid lg:grid-cols-12 gap-10 mb-10">
          <div className="lg:col-span-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-[2px] bg-[#FF5A1F]" />
              <span className="text-xs uppercase tracking-[0.3em] text-[#FF5A1F] font-bold">Class Schedule</span>
            </div>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.9] tracking-tight" data-testid="schedule-heading">
              Weekly<br /><span className="text-[#FF5A1F]">timetable.</span>
            </h2>
          </div>
          <div className="lg:col-span-6 flex items-end justify-end">
            <div className="inline-flex bg-[#171717] border border-[#2A2A2A]" data-testid="schedule-period-tabs">
              {PERIODS.map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setPeriod(key)}
                  className={`flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-widest font-bold transition-colors ${period === key ? "bg-[#FF5A1F] text-white" : "text-[#CFCFCF] hover:text-white"}`}
                  data-testid={`period-${key.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4" /> {key}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[900px] grid grid-cols-7 border border-[#2A2A2A]" data-testid="schedule-grid">
            {DAYS.map((d, i) => (
              <div key={d} className={`p-3 text-center border-b border-[#2A2A2A] ${i < 6 ? "border-r" : ""} bg-[#171717]`}>
                <div className="font-display text-xl">{d}</div>
              </div>
            ))}
            {DAYS.map((d, i) => (
              <div key={d + "col"} className={`p-3 min-h-[280px] flex flex-col gap-2 ${i < 6 ? "border-r" : ""} border-[#2A2A2A]`}>
                {byDay[d].length === 0 && (
                  <div className="text-xs text-[#8A8A8A] italic text-center py-4">—</div>
                )}
                {byDay[d].map((cls, k) => (
                  <motion.div
                    key={cls.id + k}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: k * 0.03 }}
                    className="p-2 border-l-2 bg-[#0B0B0B] hover:bg-[#171717] transition-colors"
                    style={{ borderColor: cls.color }}
                    data-testid={`schedule-${d}-${k}`}
                  >
                    <div className="text-[10px] uppercase tracking-widest text-[#8A8A8A]">{cls.time_slot}</div>
                    <div className="font-display text-lg uppercase leading-tight">{cls.class_name}</div>
                    {cls.trainer && <div className="text-[11px] text-[#CFCFCF] mt-0.5">w/ {cls.trainer}</div>}
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
