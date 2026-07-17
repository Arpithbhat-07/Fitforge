import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap } from "lucide-react";

const NAV = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Programs", href: "#services" },
  { label: "Plans", href: "#plans" },
  { label: "Trainers", href: "#trainers" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${scrolled ? "bg-[#0B0B0B]/85 backdrop-blur-xl border-b border-[#2A2A2A]" : "bg-transparent"}`}
      data-testid="site-navbar"
    >
      <div className="container-x flex items-center justify-between h-20">
        <a href="#home" className="flex items-center gap-2" data-testid="brand-logo">
          <div className="w-9 h-9 flex items-center justify-center bg-[#FF5A1F]">
            <Zap className="w-5 h-5 text-black" strokeWidth={3} />
          </div>
          <span className="font-display text-2xl tracking-wider">FIT<span className="text-[#FF5A1F]">FORGE</span></span>
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-sm font-medium text-[#CFCFCF] hover:text-white transition-colors relative group"
              data-testid={`nav-${n.label.toLowerCase()}`}
            >
              {n.label}
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-[#FF5A1F] group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link to="/admin/login" className="text-xs uppercase tracking-widest text-[#8A8A8A] hover:text-white transition-colors" data-testid="nav-admin">Admin</Link>
          <a
            href="#join"
            className="ripple relative overflow-hidden bg-[#FF5A1F] hover:bg-[#FF8A00] text-white font-bold uppercase text-sm tracking-wider px-6 py-3 transition-colors"
            data-testid="nav-join-cta"
          >
            Join Now
          </a>
        </div>

        <button
          className="lg:hidden text-white p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          data-testid="mobile-menu-toggle"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden bg-[#0B0B0B]/95 backdrop-blur-xl border-t border-[#2A2A2A]"
            data-testid="mobile-menu"
          >
            <div className="container-x py-6 flex flex-col gap-4">
              {NAV.map((n) => (
                <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="text-white text-lg font-medium py-2 border-b border-[#2A2A2A]" data-testid={`mobile-nav-${n.label.toLowerCase()}`}>{n.label}</a>
              ))}
              <a href="#join" onClick={() => setOpen(false)} className="bg-[#FF5A1F] text-white font-bold uppercase tracking-wider px-6 py-3 text-center mt-2" data-testid="mobile-join-cta">Join Now</a>
              <Link to="/admin/login" onClick={() => setOpen(false)} className="text-center text-xs uppercase tracking-widest text-[#8A8A8A]">Admin Login</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
