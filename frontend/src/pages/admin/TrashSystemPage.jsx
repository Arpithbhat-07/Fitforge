import React, { useState, useEffect } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { PageHeader, Button, Card } from "@/components/admin/ui";
import { Loader2, RotateCcw, Trash2, ShieldAlert } from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

export default function TrashSystemPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);
  const [restoringId, setRestoringId] = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/admin/trash")
      .then(r => setItems(r.data))
      .catch(() => toast.error("Failed to load trash bin items"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const restore = async (item) => {
    setRestoringId(item.id);
    try {
      await api.post(`/admin/trash/${item.collection}/${item.id}/restore`);
      toast.success(`Successfully restored "${item.display_name}" to ${item.collection}!`);
      load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Failed to restore item.");
    } finally {
      setRestoringId(null);
    }
  };

  const permanentDelete = async () => {
    if (!toDelete) return;
    try {
      await api.delete(`/admin/trash/${toDelete.collection}/${toDelete.id}/permanent`);
      toast.success(`Permanently deleted "${toDelete.display_name}" and cleaned up Cloudinary references.`);
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Failed to permanently delete item.");
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-trash-page">
      <PageHeader
        title="Trash Bin"
        subtitle="Manage soft-deleted items across all catalog collections"
      />

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto text-left">
          <table className="w-full text-sm">
            <thead className="bg-[#0B0B0B] border-b border-[#2A2A2A]">
              <tr>
                <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold">Collection</th>
                <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold">Item Name/Identifier</th>
                <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold">Deleted Timestamp</th>
                <th className="px-6 py-3 text-right text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold w-48">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#8A8A8A]">
                    <Loader2 className="w-6 h-6 animate-spin inline-block mr-2" /> Loading trash bin...
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#8A8A8A] italic">
                    The Trash Bin is empty. No soft-deleted items found.
                  </td>
                </tr>
              )}
              {!loading && items.map((item) => (
                <tr key={item.id} className="border-b border-[#2A2A2A] hover:bg-[#0B0B0B]/40 transition-colors">
                  <td className="px-6 py-4 align-middle">
                    <span className="bg-[#2A2A2A] text-gray-300 border border-[#3A3A3A] px-2 py-0.5 text-[10px] uppercase tracking-widest font-semibold rounded-full">
                      {item.collection}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white font-medium align-middle">{item.display_name}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs align-middle">
                    {item.deleted_at ? new Date(item.deleted_at).toLocaleString() : "Recently deleted"}
                  </td>
                  <td className="px-6 py-4 text-right align-middle">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => restore(item)}
                        disabled={restoringId === item.id}
                        className="flex items-center gap-1 text-xs text-[#3DDC84] hover:text-[#2cc16e] uppercase tracking-wider font-semibold disabled:opacity-40"
                        title="Restore"
                      >
                        <RotateCcw size={14} /> Restore
                      </button>
                      <button
                        onClick={() => setToDelete(item)}
                        className="flex items-center gap-1 text-xs text-[#FF3B30] hover:text-[#e02d22] uppercase tracking-wider font-semibold"
                        title="Permanently Delete"
                      >
                        <Trash2 size={14} /> Purge
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmDialog
        open={!!toDelete}
        title="Permanently Purge Item?"
        message={`Are you sure you want to permanently delete "${toDelete?.display_name}"? This will purge it from the database and permanently remove any unique assets in Cloudinary storage.`}
        onCancel={() => setToDelete(null)}
        onConfirm={permanentDelete}
      />
    </div>
  );
}
