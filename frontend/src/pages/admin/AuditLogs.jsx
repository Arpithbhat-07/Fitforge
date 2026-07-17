import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, Card, Badge } from "@/components/admin/ui";

const ACTION_VARIANT = { create: "success", update: "info", delete: "danger", login: "primary" };

export default function AuditLogs() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/activity/recent", { params: { limit: 100 } })
      .then((r) => setItems(r.data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div data-testid="admin-audit-page">
      <PageHeader subtitle="History" title="Audit Logs" />
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0B0B0B] border-b border-[#2A2A2A]">
              <tr>
                {["When", "Actor", "Action", "Entity", "Details"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="px-4 py-10 text-center text-[#8A8A8A]"><Loader2 className="inline w-4 h-4 animate-spin" /> Loading…</td></tr>}
              {!loading && items.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-[#8A8A8A]">No activity recorded.</td></tr>}
              {items.map((a, i) => (
                <tr key={a.id || i} className="border-b border-[#2A2A2A] hover:bg-[#0B0B0B]/50 transition-colors">
                  <td className="px-4 py-3 text-xs text-[#8A8A8A]">{new Date(a.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">{a.actor_email}</td>
                  <td className="px-4 py-3"><Badge variant={ACTION_VARIANT[a.action] || "default"}>{a.action}</Badge></td>
                  <td className="px-4 py-3">{a.entity}</td>
                  <td className="px-4 py-3 text-[#CFCFCF] text-xs">{a.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
