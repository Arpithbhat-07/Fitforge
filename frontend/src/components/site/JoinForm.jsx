import { useState } from "react";
import { motion } from "framer-motion";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

const GOALS = ["Weight Loss", "Muscle Gain", "Strength", "Endurance", "Overall Fitness"];
const TIMES = ["Early Morning", "Morning", "Afternoon", "Evening", "Late Evening"];

const formatCurrency = (val) => {
  if (val == null) return "";
  const num = typeof val === "number" ? val : parseFloat(String(val).replace(/[^\d.-]/g, ""));
  if (isNaN(num)) return String(val);
  return `₹ ${num.toLocaleString("en-IN")}`;
};

export default function JoinForm({ plans = [] }) {
  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    fitness_goal: GOALS[0], plan: plans?.[1]?.name || "Pro",
    preferred_time: TIMES[1], message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/inquiries", form);
      toast.success("Inquiry received — a coach will call you shortly.");
      setDone(true);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="join" className="relative section-y overflow-hidden noise-overlay" data-testid="join-section">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF5A1F]/20 via-[#0B0B0B] to-[#0B0B0B]" />
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=2000&q=70')",
        backgroundSize: "cover", backgroundPosition: "center"
      }} />
      <div className="absolute inset-0 bg-[#0B0B0B]/80" />

      <div className="relative container-x">
        <div className="grid lg:grid-cols-12 gap-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-[2px] bg-[#FF5A1F]" />
              <span className="text-xs uppercase tracking-[0.3em] text-[#FF5A1F] font-bold">Join FitForge</span>
            </div>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.9] tracking-tight" data-testid="join-heading">
              Start<br />today.<br /><span className="text-[#FF5A1F]">Transform<br />forever.</span>
            </h2>
            <p className="mt-8 text-lg text-[#CFCFCF] max-w-md leading-relaxed">
              Fill in a few details and a certified coach will reach out within 24 hours to book your free consultation.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7"
          >
            {done ? (
              <div className="bg-[#171717] border border-[#3DDC84] p-10 text-center" data-testid="join-success">
                <div className="font-display text-4xl uppercase mb-4 text-[#3DDC84]">You're in.</div>
                <p className="text-[#CFCFCF]">A coach will contact you within 24 hours. In the meantime, check your inbox for a welcome kit.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="bg-[#171717] border border-[#2A2A2A] p-8 md:p-10" data-testid="join-form">
                <div className="grid md:grid-cols-2 gap-6">
                  <Field label="Full Name" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} testid="join-name" />
                  <Field label="Phone" required value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} testid="join-phone" />
                  <Field label="Email" required type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} testid="join-email" />
                  <Select label="Fitness Goal" value={form.fitness_goal} options={GOALS} onChange={(v) => setForm({ ...form, fitness_goal: v })} testid="join-goal" />
                  <Select
                    label="Membership Plan"
                    value={form.plan}
                    options={(plans || []).map(p => ({
                      value: p.name,
                      label: `${p.name} (${formatCurrency(p.price)}${p.period})`
                    }))}
                    onChange={(v) => setForm({ ...form, plan: v })}
                    testid="join-plan"
                  />
                  <Select label="Preferred Time" value={form.preferred_time} options={TIMES} onChange={(v) => setForm({ ...form, preferred_time: v })} testid="join-time" />
                </div>
                <div className="mt-6">
                  <label className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-2 block">Anything else?</label>
                  <textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="bg-transparent border-b border-[#2A2A2A] focus:border-[#FF5A1F] outline-none py-2 w-full resize-none transition-colors" data-testid="join-message" />
                </div>
                <button type="submit" disabled={submitting} className="ripple relative overflow-hidden mt-8 w-full md:w-auto bg-[#FF5A1F] hover:bg-[#FF8A00] disabled:opacity-50 text-white font-bold uppercase tracking-widest px-12 py-4 transition-colors inline-flex items-center gap-3" data-testid="join-submit">
                  {submitting ? "Submitting…" : "Claim Your Spot"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, required, type = "text", testid }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-2 block">{label}{required && <span className="text-[#FF5A1F]"> *</span>}</label>
      <input required={required} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent border-b border-[#2A2A2A] focus:border-[#FF5A1F] outline-none py-2 w-full transition-colors" data-testid={testid} />
    </div>
  );
}

function Select({ label, value, options, onChange, testid }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-2 block">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent border-b border-[#2A2A2A] focus:border-[#FF5A1F] outline-none py-2 w-full transition-colors text-white" data-testid={testid}>
        {options.map((o) => {
          const val = typeof o === "object" ? o.value : o;
          const lbl = typeof o === "object" ? o.label : o;
          return <option key={val} value={val} className="bg-[#0B0B0B]">{lbl}</option>;
        })}
      </select>
    </div>
  );
}

