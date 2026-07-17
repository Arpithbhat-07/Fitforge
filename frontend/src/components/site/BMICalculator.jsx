import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, formatApiError } from "@/lib/api";
import { Activity } from "lucide-react";

export default function BMICalculator() {
  const [height, setHeight] = useState("170");
  const [weight, setWeight] = useState("70");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const calc = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/bmi", {
        height_cm: parseFloat(height),
        weight_kg: parseFloat(weight),
      });
      setResult(data);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  const categoryColor = {
    Underweight: "#0A84FF",
    Healthy: "#3DDC84",
    Overweight: "#FFCC00",
    Obese: "#FF3B30",
  };

  return (
    <section id="bmi" className="section-y bg-[#0B0B0B] border-t border-[#2A2A2A]" data-testid="bmi-section">
      <div className="container-x">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-6 h-6 text-[#FF5A1F]" />
              <span className="text-xs uppercase tracking-[0.3em] text-[#FF5A1F] font-bold">Health Toolkit</span>
            </div>
            <h2 className="font-display text-5xl md:text-6xl leading-[0.9] tracking-tight" data-testid="bmi-heading">
              Know your<br /><span className="text-[#FF5A1F]">baseline.</span>
            </h2>
            <p className="mt-6 text-lg text-[#CFCFCF] leading-relaxed max-w-md">
              Get an instant BMI reading with personalized advice from our coaching team. Free, private, no account needed.
            </p>
          </motion.div>

          <motion.form
            onSubmit={calc}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#171717] border border-[#2A2A2A] p-8 md:p-10 relative overflow-hidden"
            data-testid="bmi-form"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF5A1F] to-[#FF8A00]" />
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-2 block">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="bg-transparent border-b-2 border-[#2A2A2A] focus:border-[#FF5A1F] outline-none text-3xl font-display py-2 w-full transition-colors"
                  data-testid="bmi-height"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-2 block">Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="bg-transparent border-b-2 border-[#2A2A2A] focus:border-[#FF5A1F] outline-none text-3xl font-display py-2 w-full transition-colors"
                  data-testid="bmi-weight"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="ripple relative overflow-hidden w-full bg-[#FF5A1F] hover:bg-[#FF8A00] disabled:opacity-50 text-white font-bold uppercase tracking-widest py-4 transition-colors"
              data-testid="bmi-calculate"
            >
              {loading ? "Calculating…" : "Calculate BMI"}
            </button>
            {error && <p className="mt-4 text-sm text-[#FF3B30]">{error}</p>}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-8 border-t border-[#2A2A2A] pt-6"
                  data-testid="bmi-result"
                >
                  <div className="flex items-baseline gap-4">
                    <div className="font-display text-6xl" style={{ color: categoryColor[result.category] }}>
                      {result.bmi}
                    </div>
                    <div className="uppercase tracking-widest text-sm" style={{ color: categoryColor[result.category] }}>
                      {result.category}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-[#CFCFCF] leading-relaxed">{result.advice}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
