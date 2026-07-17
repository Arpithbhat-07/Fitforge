import { useState } from "react";
import { Instagram, Facebook, Youtube, Twitter, Zap, ArrowRight } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";

const ICON = { instagram: Instagram, facebook: Facebook, youtube: Youtube, twitter: Twitter };

const QUICK_LINKS = [
  { label: "About", href: "#about" },
  { label: "Programs", href: "#services" },
  { label: "Membership", href: "#plans" },
  { label: "Trainers", href: "#trainers" },
];
const PROGRAMS = [
  { label: "Strength", href: "#services" },
  { label: "CrossFit", href: "#services" },
  { label: "Yoga", href: "#services" },
  { label: "Nutrition", href: "#services" },
];

export default function Footer({ contact }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/newsletter/subscribe", { email });
      toast.success("Subscribed! Watch your inbox for updates.");
      setEmail("");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally { setSending(false); }
  };

  return (
    <footer className="bg-[#0B0B0B] border-t border-[#2A2A2A] pt-20 pb-8" data-testid="site-footer">
      <div className="container-x">
        <div className="grid md:grid-cols-12 gap-10">
          {/* Brand + Newsletter */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 flex items-center justify-center bg-[#FF5A1F]">
                <Zap className="w-5 h-5 text-black" strokeWidth={3} />
              </div>
              <span className="font-display text-3xl tracking-wider">FIT<span className="text-[#FF5A1F]">FORGE</span></span>
            </div>
            <p className="text-[#CFCFCF] max-w-md leading-relaxed mb-8">
              A premium strength & conditioning gym. Certified coaches, world-class equipment, and a community that shows up.
            </p>
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-[#FF5A1F] font-bold mb-3">Newsletter</div>
              <form onSubmit={subscribe} className="flex border border-[#2A2A2A] focus-within:border-[#FF5A1F] transition-colors" data-testid="footer-newsletter">
                <input required type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-transparent flex-1 outline-none px-4 py-3 text-sm" data-testid="newsletter-email" />
                <button type="submit" disabled={sending} className="bg-[#FF5A1F] hover:bg-[#FF8A00] disabled:opacity-50 px-4 flex items-center gap-1 uppercase text-xs font-bold tracking-widest transition-colors" data-testid="newsletter-submit">
                  {sending ? "…" : <>Subscribe <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-[0.3em] text-white font-bold mb-4">Quick Links</div>
            <ul className="space-y-2">
              {QUICK_LINKS.map(l => (
                <li key={l.label}><a href={l.href} className="text-sm text-[#CFCFCF] hover:text-[#FF5A1F] transition-colors">{l.label}</a></li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-[0.3em] text-white font-bold mb-4">Programs</div>
            <ul className="space-y-2">
              {PROGRAMS.map(l => (
                <li key={l.label}><a href={l.href} className="text-sm text-[#CFCFCF] hover:text-[#FF5A1F] transition-colors">{l.label}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <div className="text-xs uppercase tracking-[0.3em] text-white font-bold mb-4">Contact</div>
            <ul className="space-y-2 text-sm text-[#CFCFCF]">
              <li>{contact?.address}</li>
              <li><a href={`tel:${contact?.phone}`} className="hover:text-[#FF5A1F] transition-colors">{contact?.phone}</a></li>
              <li><a href={`mailto:${contact?.email}`} className="hover:text-[#FF5A1F] transition-colors">{contact?.email}</a></li>
            </ul>
            <div className="flex gap-3 mt-6">
              {Object.entries(contact?.socials || {}).map(([k, v]) => {
                const Icon = ICON[k];
                if (!Icon || !v) return null;
                return (
                  <a key={k} href={v} target="_blank" rel="noreferrer" className="w-9 h-9 flex items-center justify-center border border-[#2A2A2A] hover:border-[#FF5A1F] hover:text-[#FF5A1F] transition-colors" aria-label={k}>
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-[#2A2A2A] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#8A8A8A]">© {new Date().getFullYear()} FitForge Gym. All rights reserved.</div>
          <div className="text-xs text-[#8A8A8A] uppercase tracking-widest">Stronger Every Day.</div>
        </div>
      </div>
    </footer>
  );
}
