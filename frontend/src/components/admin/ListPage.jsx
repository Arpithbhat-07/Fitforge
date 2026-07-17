import { useEffect, useState } from "react";
import { Loader2, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiError } from "@/lib/api";
import { PageHeader, Card } from "@/components/admin/ui";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

/** Generic paginated list page with search + delete for read-only submissions. */
export default function ListPage({ endpoint, title, subtitle, columns, testid, canDelete = true }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);

  const load = () => {
    setLoading(true);
    api.get(`/admin/${endpoint}`, { params: { page, limit: 15, q } })
      .then((r) => { setItems(r.data.items || []); setTotal(r.data.total || 0); })
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, page, q]);

  const totalPages = Math.max(1, Math.ceil(total / 15));

  const doDelete = async () => {
    try {
      await api.delete(`/admin/${endpoint}/${toDelete.id}`);
      toast.success("Deleted");
      setToDelete(null);
      load();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  return (
    <div data-testid={testid}>
      <PageHeader
        subtitle={subtitle}
        title={title}
        actions={
          <div className="flex items-center gap-2 border border-[#2A2A2A] px-3 py-2 bg-[#171717]">
            <Search className="w-4 h-4 text-[#8A8A8A]" />
            <input placeholder="Search…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="bg-transparent outline-none text-sm w-40" />
          </div>
        }
      />
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0B0B0B] border-b border-[#2A2A2A]">
              <tr>
                {columns.map(c => (<th key={c.key} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold">{c.label}</th>))}
                {canDelete && <th className="w-16"></th>}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={columns.length + 1} className="px-4 py-10 text-center text-[#8A8A8A]"><Loader2 className="w-4 h-4 inline animate-spin" /> Loading…</td></tr>}
              {!loading && items.length === 0 && <tr><td colSpan={columns.length + 1} className="px-4 py-10 text-center text-[#8A8A8A]">No records.</td></tr>}
              {items.map((item, i) => (
                <tr key={item.id} className="border-b border-[#2A2A2A] hover:bg-[#0B0B0B]/50 transition-colors">
                  {columns.map(c => (<td key={c.key} className="px-4 py-3 text-[#CFCFCF]">{c.render ? c.render(item) : (item[c.key] ?? "—")}</td>))}
                  {canDelete && (
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setToDelete(item)} className="p-2 hover:text-[#FF3B30] transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  )}
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

      <ConfirmDialog open={!!toDelete} title="Delete this record?" message="This action cannot be undone." onCancel={() => setToDelete(null)} onConfirm={doDelete} />
    </div>
  );
}
