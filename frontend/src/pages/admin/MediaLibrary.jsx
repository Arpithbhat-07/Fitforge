import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Upload, Trash2, Copy, Loader2, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiError, getMediaUrl } from "@/lib/api";
import { PageHeader, Card, Button } from "@/components/admin/ui";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

const FOLDERS = ["", "content", "gallery", "trainers", "hero"];

export default function MediaLibrary() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [folder, setFolder] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/admin/media", { params: { page, limit: 24, folder, q } })
      .then((r) => { setItems(r.data.items); setTotal(r.data.total); })
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, folder, q]);

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await api.post(`/admin/media/upload?folder=${folder || "media"}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Uploaded");
      load();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setUploading(false); }
  };

  const doDelete = async () => {
    try {
      await api.delete(`/admin/media/${toDelete.id}`);
      toast.success("Deleted");
      setToDelete(null);
      load();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  const copyUrl = async (item) => {
    const full = getMediaUrl(item.url);
    try { await navigator.clipboard.writeText(full); toast.success("URL copied"); }
    catch { toast.error("Copy failed"); }
  };

  const totalPages = Math.max(1, Math.ceil(total / 24));

  return (
    <div data-testid="admin-media-page">
      <PageHeader
        subtitle="Assets"
        title="Media Library"
        actions={
          <>
            <div className="flex items-center gap-2 border border-[#2A2A2A] px-3 py-2 bg-[#171717]">
              <Search className="w-4 h-4 text-[#8A8A8A]" />
              <input placeholder="Search…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="bg-transparent outline-none text-sm w-40" />
            </div>
            <div className="flex items-center gap-2 border border-[#2A2A2A] px-3 py-2 bg-[#171717]">
              <Filter className="w-4 h-4 text-[#8A8A8A]" />
              <select value={folder} onChange={(e) => { setFolder(e.target.value); setPage(1); }} className="bg-transparent outline-none text-sm text-white">
                {FOLDERS.map(f => <option key={f} value={f} className="bg-[#0B0B0B]">{f || "All folders"}</option>)}
              </select>
            </div>
            <label className="ripple relative overflow-hidden inline-flex items-center gap-2 bg-[#FF5A1F] hover:bg-[#FF8A00] text-white font-bold uppercase text-xs tracking-widest px-5 py-2.5 cursor-pointer transition-colors" data-testid="media-upload">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? "Uploading" : "Upload"}
            </label>
          </>
        }
      />

      {loading ? (
        <div className="text-[#8A8A8A] flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
      ) : items.length === 0 ? (
        <Card className="text-center py-16 text-[#8A8A8A]">No media uploaded yet. Click Upload to add your first image.</Card>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {items.map((it, i) => (
            <motion.div
              key={it.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i % 12) * 0.03 }}
              className="group relative bg-[#171717] border border-[#2A2A2A] hover:border-[#FF5A1F]/60 transition-colors overflow-hidden"
              data-testid={`media-item-${i}`}
            >
              <img src={getMediaUrl(it.url)} alt={it.original_filename} loading="lazy" className="w-full aspect-square object-cover" />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <div className="text-[10px] text-[#CFCFCF] truncate">{it.original_filename}</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => copyUrl(it)} className="p-2 bg-[#171717] hover:bg-[#FF5A1F] transition-colors" title="Copy URL"><Copy className="w-4 h-4" /></button>
                  <button onClick={() => setToDelete(it)} className="p-2 bg-[#171717] hover:bg-[#FF3B30] transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 text-xs">
          <span className="text-[#8A8A8A]">Page {page} of {totalPages} • {total} files</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 border border-[#2A2A2A] hover:border-[#FF5A1F] disabled:opacity-40 transition-colors">Prev</button>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1 border border-[#2A2A2A] hover:border-[#FF5A1F] disabled:opacity-40 transition-colors">Next</button>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!toDelete} title="Delete this file?" message="Soft-deletes the file (won't appear in library)." onCancel={() => setToDelete(null)} onConfirm={doDelete} />
    </div>
  );
}
