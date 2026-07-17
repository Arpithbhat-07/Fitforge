import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Trash2, Eye, Phone, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiError } from "@/lib/api";
import { PageHeader, Card, Badge, Select, Button } from "@/components/admin/ui";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

const STATUSES = ["", "new", "contacted", "converted", "closed"];
const STATUS_LABEL = { "": "All", new: "New", contacted: "Contacted", converted: "Converted", closed: "Closed" };
const STATUS_VARIANT = { new: "primary", contacted: "info", converted: "success", closed: "default" };

export default function InquiriesAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = () => {
    setLoading(true);
    api.get("/admin/inquiries", { params: { q, status, page, limit: 15 } })
      .then((r) => { setItems(r.data.items || []); setTotal(r.data.total || 0); })
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q, status, page]);

  const totalPages = Math.max(1, Math.ceil(total / 15));

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/admin/inquiries/${id}`, { status: newStatus });
      toast.success("Status updated");
      load();
      if (selected?.id === id) setSelected({ ...selected, status: newStatus });
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  const doDelete = async () => {
    try {
      await api.delete(`/admin/inquiries/${toDelete.id}`);
      toast.success("Deleted");
      setToDelete(null);
      if (selected?.id === toDelete.id) setSelected(null);
      load();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  return (
    <div data-testid="admin-inquiries-page">
      <PageHeader
        subtitle="Leads"
        title="Membership Inquiries"
        actions={
          <>
            <div className="flex items-center gap-2 border border-[#2A2A2A] px-3 py-2 bg-[#171717]">
              <Search className="w-4 h-4 text-[#8A8A8A]" />
              <input placeholder="Search…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="bg-transparent outline-none text-sm w-40" data-testid="inquiries-search" />
            </div>
            <div className="flex items-center gap-2 border border-[#2A2A2A] px-3 py-2 bg-[#171717]">
              <Filter className="w-4 h-4 text-[#8A8A8A]" />
              <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="bg-transparent outline-none text-sm text-white" data-testid="inquiries-status-filter">
                {STATUSES.map(s => <option key={s} value={s} className="bg-[#0B0B0B]">{STATUS_LABEL[s]}</option>)}
              </select>
            </div>
          </>
        }
      />

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#0B0B0B] border-b border-[#2A2A2A]">
                  <tr>
                    {["Name", "Contact", "Plan", "Goal", "Status", "Date"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan={6} className="px-4 py-10 text-center text-[#8A8A8A]"><Loader2 className="w-4 h-4 animate-spin inline" /> Loading…</td></tr>}
                  {!loading && items.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-[#8A8A8A]">No inquiries yet.</td></tr>}
                  {items.map((it, i) => (
                    <tr key={it.id} onClick={() => setSelected(it)} className={`border-b border-[#2A2A2A] hover:bg-[#0B0B0B]/50 cursor-pointer transition-colors ${selected?.id === it.id ? "bg-[#0B0B0B]" : ""}`} data-testid={`inquiry-row-${i}`}>
                      <td className="px-4 py-3">{it.name}</td>
                      <td className="px-4 py-3 text-[#CFCFCF]">
                        <div className="text-xs">{it.email}</div>
                        <div className="text-xs">{it.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-[#CFCFCF]">{it.plan || "—"}</td>
                      <td className="px-4 py-3 text-[#CFCFCF]">{it.fitness_goal || "—"}</td>
                      <td className="px-4 py-3"><Badge variant={STATUS_VARIANT[it.status] || "default"}>{it.status}</Badge></td>
                      <td className="px-4 py-3 text-[#8A8A8A] text-xs">{new Date(it.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#2A2A2A] text-xs">
                <span className="text-[#8A8A8A]">Page {page} of {totalPages} • {total} total</span>
                <div className="flex gap-1">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 border border-[#2A2A2A] hover:border-[#FF5A1F] disabled:opacity-40 transition-colors">Prev</button>
                  <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1 border border-[#2A2A2A] hover:border-[#FF5A1F] disabled:opacity-40 transition-colors">Next</button>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={selected.id} className="bg-[#171717] border border-[#2A2A2A] p-6 sticky top-24">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-[#8A8A8A]">Lead Details</div>
                  <div className="font-display text-3xl uppercase mt-1">{selected.name}</div>
                </div>
                <Badge variant={STATUS_VARIANT[selected.status] || "default"}>{selected.status}</Badge>
              </div>
              <div className="space-y-3 text-sm">
                <a href={`tel:${selected.phone}`} className="flex items-center gap-2 text-[#CFCFCF] hover:text-[#FF5A1F]"><Phone className="w-4 h-4" /> {selected.phone}</a>
                <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-[#CFCFCF] hover:text-[#FF5A1F]"><Mail className="w-4 h-4" /> {selected.email}</a>
                <div className="pt-3 border-t border-[#2A2A2A] space-y-2">
                  <div><span className="text-xs text-[#8A8A8A] uppercase tracking-widest">Plan</span><div>{selected.plan || "—"}</div></div>
                  <div><span className="text-xs text-[#8A8A8A] uppercase tracking-widest">Goal</span><div>{selected.fitness_goal || "—"}</div></div>
                  <div><span className="text-xs text-[#8A8A8A] uppercase tracking-widest">Preferred Time</span><div>{selected.preferred_time || "—"}</div></div>
                  {selected.message && <div><span className="text-xs text-[#8A8A8A] uppercase tracking-widest">Message</span><p className="text-[#CFCFCF] mt-1">{selected.message}</p></div>}
                </div>
              </div>
              <div className="mt-6">
                <div className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-2 block">Update Status</div>
                <div className="flex flex-wrap gap-2">
                  {["new", "contacted", "converted", "closed"].map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected.id, s)}
                      className={`px-3 py-1.5 text-xs uppercase tracking-widest transition-colors ${selected.status === s ? "bg-[#FF5A1F] text-white" : "border border-[#2A2A2A] hover:border-[#FF5A1F] text-[#CFCFCF]"}`}
                      data-testid={`inquiry-status-${s}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button variant="danger" onClick={() => setToDelete(selected)}>
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="bg-[#171717] border border-[#2A2A2A] border-dashed p-10 text-center text-[#8A8A8A]">
              Select an inquiry to view details.
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this inquiry?"
        message={`Remove ${toDelete?.name}'s inquiry permanently.`}
        onCancel={() => setToDelete(null)}
        onConfirm={doDelete}
      />
    </div>
  );
}
