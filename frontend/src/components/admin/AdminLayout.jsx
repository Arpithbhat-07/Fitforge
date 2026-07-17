import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, Dumbbell, Star, HelpCircle, Calendar, Image,
  ShoppingBag, Mail, Bell, Settings, LogOut, Menu, X, FileText, Search,
  Award, Building2, MessageSquare, Activity, Home, ToggleLeft, Trash2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: "Content",
    items: [
      { to: "/admin/hero", label: "Hero Section", icon: Activity },
      { to: "/admin/about", label: "About", icon: Home },
      { to: "/admin/services", label: "Programs", icon: Dumbbell },
      { to: "/admin/plans", label: "Membership Plans", icon: ShoppingBag },
      { to: "/admin/trainers", label: "Trainers", icon: Users },
      { to: "/admin/testimonials", label: "Testimonials", icon: Star },
      { to: "/admin/faqs", label: "FAQs", icon: HelpCircle },
      { to: "/admin/schedule", label: "Class Schedule", icon: Calendar },
      { to: "/admin/gallery", label: "Gallery", icon: Image },
      { to: "/admin/features", label: "Why Choose Us", icon: Award },
    ],
  },
  {
    label: "Leads & Bookings",
    items: [
      { to: "/admin/bookings", label: "Booking Calendar", icon: Calendar },
      { to: "/admin/inquiries", label: "Inquiries", icon: Mail },
      { to: "/admin/trials", label: "Trial Bookings", icon: Bell },
      { to: "/admin/messages", label: "Messages", icon: MessageSquare },
      { to: "/admin/newsletter", label: "Newsletter", icon: Users },
    ],
  },
  {
    label: "Settings",
    items: [
      { to: "/admin/contact-settings", label: "Contact Details", icon: Building2 },
      { to: "/admin/seo", label: "SEO", icon: Search },
      { to: "/admin/site-settings", label: "Site Settings", icon: Settings },
      { to: "/admin/global-settings", label: "Branding & Colors", icon: Settings },
      { to: "/admin/feature-flags", label: "Feature Flags", icon: ToggleLeft },
      { to: "/admin/email-diagnostics", label: "Email Tester", icon: Mail },
      { to: "/admin/media", label: "Media Library", icon: Image },
      { to: "/admin/trash", label: "Trash Bin", icon: Trash2 },
      { to: "/admin/audit-logs", label: "Audit Logs", icon: FileText },
    ],
  },
];

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) return <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center text-white">Loading…</div>;
  if (!user) return <Navigate to="/admin/login" replace />;

  const doLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const isActive = (to, end) => {
    if (end) return location.pathname === to;
    return location.pathname === to || location.pathname.startsWith(to + "/");
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white flex" data-testid="admin-layout">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 h-screen w-72 bg-[#0f0f0f] border-r border-[#2A2A2A] flex flex-col z-40 transition-transform ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-6 border-b border-[#2A2A2A] flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2" data-testid="admin-brand">
            <div className="w-9 h-9 flex items-center justify-center bg-[#FF5A1F]">
              <Dumbbell className="w-5 h-5 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display text-lg tracking-wider leading-none">FIT<span className="text-[#FF5A1F]">FORGE</span></div>
              <div className="text-[10px] uppercase tracking-widest text-[#8A8A8A]">Admin Panel</div>
            </div>
          </Link>
          <button className="lg:hidden text-white" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {NAV_GROUPS.map(g => (
            <div key={g.label} className="mb-6">
              <div className="px-6 mb-2 text-[10px] uppercase tracking-[0.2em] text-[#8A8A8A] font-bold">{g.label}</div>
              {g.items.map(it => {
                const Icon = it.icon;
                const active = isActive(it.to, it.end);
                return (
                  <Link
                    key={it.to}
                    to={it.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-6 py-2.5 text-sm transition-colors border-l-2 ${active ? "bg-[#171717] border-[#FF5A1F] text-white" : "border-transparent text-[#CFCFCF] hover:bg-[#171717] hover:text-white"}`}
                    data-testid={`nav-${it.to.replace(/\//g, "-")}`}
                  >
                    <Icon className={`w-4 h-4 ${active ? "text-[#FF5A1F]" : ""}`} />
                    <span>{it.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-6 border-t border-[#2A2A2A]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-[#FF5A1F]/20 border border-[#FF5A1F] flex items-center justify-center font-display text-lg text-[#FF5A1F]">{user?.name?.[0] || "A"}</div>
            <div className="min-w-0">
              <div className="text-sm truncate">{user?.name}</div>
              <div className="text-[10px] text-[#8A8A8A] uppercase tracking-widest truncate">{user?.email}</div>
            </div>
          </div>
          <button onClick={doLogout} className="w-full flex items-center justify-center gap-2 border border-[#2A2A2A] hover:border-[#FF5A1F] hover:text-[#FF5A1F] py-2 text-xs uppercase tracking-widest transition-colors" data-testid="admin-logout">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 bg-[#0B0B0B]/90 backdrop-blur-xl border-b border-[#2A2A2A]">
          <div className="flex items-center justify-between px-6 py-4">
            <button className="lg:hidden text-white" onClick={() => setMobileOpen(true)} aria-label="Menu" data-testid="admin-menu-toggle">
              <Menu size={22} />
            </button>
            <div className="flex-1" />
            <Link to="/" target="_blank" className="text-xs uppercase tracking-widest text-[#8A8A8A] hover:text-white transition-colors">View Site ↗</Link>
          </div>
        </header>
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 md:p-10"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
