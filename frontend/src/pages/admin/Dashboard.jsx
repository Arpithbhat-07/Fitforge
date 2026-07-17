import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Mail, MessageSquare, TrendingUp, CalendarCheck, Bell, Eye, Activity } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, Card } from "@/components/admin/ui";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, BarChart, Bar } from "recharts";

const STAT_ICONS = { Users, Mail, MessageSquare, TrendingUp, CalendarCheck, Bell, Eye, Activity };

function Stat({ icon, label, value, hint, delay }) {
  const Icon = STAT_ICONS[icon] || Users;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[#171717] border border-[#2A2A2A] p-6 hover:border-[#FF5A1F]/50 transition-colors relative overflow-hidden"
      data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 flex items-center justify-center bg-[#0B0B0B] border border-[#2A2A2A]">
          <Icon className="w-5 h-5 text-[#FF5A1F]" />
        </div>
        {hint && <div className="text-xs text-[#8A8A8A]">{hint}</div>}
      </div>
      <div className="font-display text-4xl">{value}</div>
      <div className="text-xs uppercase tracking-widest text-[#8A8A8A] mt-1">{label}</div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    api.get("/admin/analytics/overview").then(r => setOverview(r.data)).catch(() => {});
    api.get("/admin/activity/recent").then(r => setActivity(r.data.items || [])).catch(() => {});
  }, []);

  const daily = (overview?.visits_daily || []).map(d => ({ date: (d.date || "").slice(5), visits: d.count }));

  return (
    <div className="space-y-8" data-testid="admin-dashboard">
      <PageHeader
        subtitle="Overview"
        title="Command Center"
        testid="dashboard-header"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon="Eye" label="Website Visits" value={overview?.visits_total ?? "—"} hint="Total tracked" delay={0} />
        <Stat icon="Mail" label="Inquiries" value={overview?.inquiries_total ?? "—"} hint={`${overview?.inquiries_new || 0} new`} delay={0.05} />
        <Stat icon="MessageSquare" label="Messages" value={overview?.messages_total ?? "—"} hint={`${overview?.messages_unread || 0} unread`} delay={0.1} />
        <Stat icon="Users" label="Subscribers" value={overview?.subscribers ?? "—"} hint="Newsletter" delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-1">Traffic</div>
              <div className="font-display text-2xl uppercase">Daily Visits</div>
            </div>
            <div className="text-xs text-[#8A8A8A]">Last 30 days</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily}>
                <defs>
                  <linearGradient id="visitsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF5A1F" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#FF5A1F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="date" tick={{ fill: "#8A8A8A", fontSize: 11 }} stroke="#2A2A2A" />
                <YAxis tick={{ fill: "#8A8A8A", fontSize: 11 }} stroke="#2A2A2A" />
                <Tooltip contentStyle={{ background: "#0B0B0B", border: "1px solid #2A2A2A", color: "#fff" }} />
                <Area type="monotone" dataKey="visits" stroke="#FF5A1F" strokeWidth={2} fill="url(#visitsFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="mb-6">
            <div className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-1">Recent Activity</div>
            <div className="font-display text-2xl uppercase">Audit Log</div>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1" data-testid="recent-activity">
            {activity.length === 0 && <div className="text-sm text-[#8A8A8A]">No recent activity.</div>}
            {activity.map((a, i) => (
              <div key={a.id || i} className="border-l-2 border-[#FF5A1F] pl-3 py-1">
                <div className="text-sm">
                  <span className="font-bold uppercase text-[#FF5A1F]">{a.action}</span>{" "}
                  <span className="text-[#CFCFCF]">{a.entity}</span>
                </div>
                <div className="text-[10px] text-[#8A8A8A]">{a.actor_email} • {new Date(a.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Popular Classes Chart */}
        <Card>
          <div className="mb-4">
            <div className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-1">Analytics</div>
            <div className="font-display text-lg uppercase">Class Popularity</div>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: "CrossFit", bookings: 42 },
                { name: "Strength", bookings: 38 },
                { name: "Yoga", bookings: 25 },
                { name: "HIIT", bookings: 31 },
                { name: "Open Gym", bookings: 12 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="name" tick={{ fill: "#8A8A8A", fontSize: 10 }} stroke="#2A2A2A" />
                <YAxis tick={{ fill: "#8A8A8A", fontSize: 10 }} stroke="#2A2A2A" />
                <Tooltip contentStyle={{ background: "#0B0B0B", border: "1px solid #2A2A2A", color: "#fff" }} />
                <Bar dataKey="bookings" fill="#FF5A1F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Popular Trainers Chart */}
        <Card>
          <div className="mb-4">
            <div className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-1">Analytics</div>
            <div className="font-display text-lg uppercase">Trainer Popularity</div>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: "Arjun Kapoor", sessions: 48 },
                { name: "Priya Sharma", sessions: 35 },
                { name: "Rahul Verma", sessions: 42 },
                { name: "Sneha Iyer", sessions: 22 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="name" tick={{ fill: "#8A8A8A", fontSize: 10 }} stroke="#2A2A2A" />
                <YAxis tick={{ fill: "#8A8A8A", fontSize: 10 }} stroke="#2A2A2A" />
                <Tooltip contentStyle={{ background: "#0B0B0B", border: "1px solid #2A2A2A", color: "#fff" }} />
                <Bar dataKey="sessions" fill="#FF8A00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-1">Quick Actions</div>
            <div className="font-display text-2xl uppercase">Manage</div>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { to: "/admin/inquiries", label: "Inquiries", icon: Mail },
            { to: "/admin/trainers", label: "Trainers", icon: Users },
            { to: "/admin/plans", label: "Plans", icon: TrendingUp },
            { to: "/admin/gallery", label: "Gallery", icon: Activity },
            { to: "/admin/faqs", label: "FAQs", icon: MessageSquare },
            { to: "/admin/media", label: "Media", icon: Bell },
          ].map((x) => (
            <a key={x.to} href={x.to} className="p-4 border border-[#2A2A2A] hover:border-[#FF5A1F] hover:text-[#FF5A1F] flex flex-col items-center gap-2 transition-colors text-center">
              <x.icon className="w-5 h-5" />
              <div className="text-xs uppercase tracking-widest">{x.label}</div>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
