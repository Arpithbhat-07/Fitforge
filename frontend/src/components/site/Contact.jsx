import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Youtube, Twitter } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";

const SOCIAL_ICON = { instagram: Instagram, facebook: Facebook, youtube: Youtube, twitter: Twitter };

export default function Contact({ contact }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/contact", form);
      toast.success("Message sent — we'll be in touch shortly.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Failed to send");
    } finally {
      setSubmitting(false);
    }
  };

  if (!contact) return null;

  return (
    <section id="contact" className="section-y bg-[#0B0B0B] border-t border-[#2A2A2A]" data-testid="contact-section">
      <div className="container-x">
        <div className="grid lg:grid-cols-12 gap-10 mb-10">
          <div className="lg:col-span-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-[2px] bg-[#FF5A1F]" />
              <span className="text-xs uppercase tracking-[0.3em] text-[#FF5A1F] font-bold">Get In Touch</span>
            </div>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.9] tracking-tight" data-testid="contact-heading">
              Let's<br /><span className="text-[#FF5A1F]">talk.</span>
            </h2>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Info column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#171717] border border-[#2A2A2A] p-6 flex items-start gap-4">
              <MapPin className="w-6 h-6 text-[#FF5A1F] shrink-0" />
              <div>
                <div className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-1">Address</div>
                <p className="text-[#CFCFCF]" data-testid="contact-address">{contact.address}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <a href={`tel:${contact.phone}`} className="bg-[#171717] border border-[#2A2A2A] p-6 hover:border-[#FF5A1F]/60 transition-colors" data-testid="contact-phone">
                <Phone className="w-5 h-5 text-[#FF5A1F] mb-3" />
                <div className="text-xs uppercase tracking-widest text-[#8A8A8A]">Call</div>
                <div className="mt-1 text-white">{contact.phone}</div>
              </a>
              <a href={`mailto:${contact.email}`} className="bg-[#171717] border border-[#2A2A2A] p-6 hover:border-[#FF5A1F]/60 transition-colors" data-testid="contact-email">
                <Mail className="w-5 h-5 text-[#FF5A1F] mb-3" />
                <div className="text-xs uppercase tracking-widest text-[#8A8A8A]">Email</div>
                <div className="mt-1 text-white break-all">{contact.email}</div>
              </a>
            </div>

            <div className="bg-[#171717] border border-[#2A2A2A] p-6" data-testid="contact-hours">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-[#FF5A1F]" />
                <div className="text-xs uppercase tracking-widest text-[#8A8A8A]">Business Hours</div>
              </div>
              <ul className="space-y-2">
                {(contact.business_hours || []).map((h, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span className="text-[#CFCFCF]">{h.day}</span>
                    <span className="text-white font-medium">{h.hours}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#171717] border border-[#2A2A2A] p-6 flex items-center gap-4">
              <div className="text-xs uppercase tracking-widest text-[#8A8A8A] mr-2">Follow</div>
              {Object.entries(contact.socials || {}).map(([k, v]) => {
                const Icon = SOCIAL_ICON[k];
                if (!Icon || !v) return null;
                return (
                  <a key={k} href={v} target="_blank" rel="noreferrer" className="text-[#CFCFCF] hover:text-[#FF5A1F] transition-colors" aria-label={k} data-testid={`social-${k}`}>
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Form + Map */}
          <div className="lg:col-span-7 space-y-6">
            <motion.form
              onSubmit={submit}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#171717] border border-[#2A2A2A] p-8"
              data-testid="contact-form"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-2 block">Name</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-transparent border-b border-[#2A2A2A] focus:border-[#FF5A1F] outline-none py-2 w-full transition-colors" data-testid="contact-input-name" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-2 block">Email</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-transparent border-b border-[#2A2A2A] focus:border-[#FF5A1F] outline-none py-2 w-full transition-colors" data-testid="contact-input-email" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-2 block">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-transparent border-b border-[#2A2A2A] focus:border-[#FF5A1F] outline-none py-2 w-full transition-colors" data-testid="contact-input-phone" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-2 block">Subject</label>
                  <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="bg-transparent border-b border-[#2A2A2A] focus:border-[#FF5A1F] outline-none py-2 w-full transition-colors" data-testid="contact-input-subject" />
                </div>
              </div>
              <div className="mt-6">
                <label className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-2 block">Message</label>
                <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="bg-transparent border-b border-[#2A2A2A] focus:border-[#FF5A1F] outline-none py-2 w-full resize-none transition-colors" data-testid="contact-input-message" />
              </div>
              <button type="submit" disabled={submitting} className="ripple relative overflow-hidden mt-8 bg-[#FF5A1F] hover:bg-[#FF8A00] disabled:opacity-50 text-white font-bold uppercase tracking-widest px-10 py-4 transition-colors" data-testid="contact-submit">
                {submitting ? "Sending…" : "Send Message"}
              </button>
            </motion.form>

            {contact.map_embed_url && (
              <div className="border border-[#2A2A2A] overflow-hidden" data-testid="contact-map">
                <iframe src={contact.map_embed_url} title="Map" width="100%" height="320" loading="lazy" style={{ border: 0, filter: "invert(0.9) hue-rotate(180deg)" }} referrerPolicy="no-referrer-when-downgrade" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
