import React, { useState, useEffect } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { PageHeader, Button, Card, Switch } from "@/components/admin/ui";
import { Loader2, Save, Calendar, Clock } from "lucide-react";

const FLAGS_INFO = {
  trainer_booking: { label: "Trainer Booking System", desc: "Allow users to book PT slots with coaches directly from trainer profiles." },
  newsletter: { label: "Newsletter Subscription", desc: "Show subscription block in footer and homepage overlays." },
  whatsapp: { label: "WhatsApp Direct Floating Button", desc: "Display sticky green contact button for fast enquiries." },
  transformation_slider: { label: "Before/After Slider Widget", desc: "Interactive swipe slider comparison in Testimonials block." },
  analytics: { label: "Client-side Visits Tracker", desc: "Record unique daily sessions and route trackers." },
  dark_mode: { label: "Frontend Mode Switcher Toggle", desc: "Allow users to override theme between light and dark settings." },
  class_schedule: { label: "Weekly Class Timetable Board", desc: "Display schedule lookup and program time slots grid." }
};

export default function FeatureFlagsPage() {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/content/feature-flags?preview=true")
      .then(r => setData(r.data))
      .catch(() => toast.error("Failed to load feature flags"));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/admin/content/feature-flags", data);
      await api.post("/admin/content/feature-flags/publish");
      toast.success("Feature flags saved and published to live website!");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setSaving(false);
    }
  };

  const toggleFlag = (flagKey, checked) => {
    const flagObj = data[flagKey] || { enabled: false, start_date: "", end_date: "" };
    setData({
      ...data,
      [flagKey]: { ...flagObj, enabled: checked }
    });
  };

  const setDates = (flagKey, start, end) => {
    const flagObj = data[flagKey] || { enabled: false, start_date: "", end_date: "" };
    setData({
      ...data,
      [flagKey]: { ...flagObj, start_date: start, end_date: end }
    });
  };

  if (!data) return <div className="text-[#8A8A8A] flex items-center gap-2 p-6"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>;

  return (
    <div className="space-y-6" data-testid="admin-feature-flags-page">
      <PageHeader
        title="Scheduled Feature Flags"
        subtitle="Toggle and schedule website features dynamically without code releases"
        actions={
          <Button onClick={save} disabled={saving} data-testid="save-flags">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving" : "Save & Publish Flags"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(FLAGS_INFO).map(([key, info]) => {
          const flag = data[key] || { enabled: false, start_date: "", end_date: "" };
          return (
            <Card key={key} className="p-6 border border-[#2A2A2A] bg-[#171717] space-y-4 flex flex-col justify-between" data-testid={`flag-card-${key}`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white text-base">{info.label}</h3>
                  <Switch checked={flag.enabled} onChange={(val) => toggleFlag(key, val)} label={flag.enabled ? "Active" : "Disabled"} />
                </div>
                <p className="text-xs text-[#8A8A8A] leading-relaxed mb-4">{info.desc}</p>
              </div>

              <div className="border-t border-[#2A2A2A] pt-4 space-y-3">
                <div className="flex items-center gap-2 text-xs text-[#8A8A8A] font-medium uppercase tracking-wider mb-1">
                  <Calendar size={13} className="text-[#FF5A1F]" /> Schedule Window (Optional)
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[#8A8A8A] uppercase tracking-wider block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={flag.start_date || ""}
                      onChange={(e) => setDates(key, e.target.value, flag.end_date)}
                      className="w-full bg-[#0B0B0B] border border-[#2A2A2A] focus:border-[#FF5A1F] text-xs text-white p-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8A8A8A] uppercase tracking-wider block mb-1">End Date</label>
                    <input
                      type="date"
                      value={flag.end_date || ""}
                      onChange={(e) => setDates(key, flag.start_date, e.target.value)}
                      className="w-full bg-[#0B0B0B] border border-[#2A2A2A] focus:border-[#FF5A1F] text-xs text-white p-2 outline-none"
                    />
                  </div>
                </div>
                
                {flag.start_date || flag.end_date ? (
                  <div className="text-[10px] text-[#FF8A00] flex items-center gap-1.5 bg-[#FF8A00]/5 py-1.5 px-3 border border-[#FF8A00]/10 mt-2">
                    <Clock size={12} /> Scheduled active between {flag.start_date || "Anytime"} and {flag.end_date || "Forever"}
                  </div>
                ) : (
                  <div className="text-[10px] text-[#8A8A8A] italic mt-2">No schedule limit. Follows manual active switch.</div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
