import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Search, X, Loader2, Save, GripVertical, Eye, EyeOff, Copy } from "lucide-react";
import { api, formatApiError, getMediaUrl } from "@/lib/api";
import { toast } from "sonner";
import { PageHeader, Button, Card, Input, Textarea, Select, Switch, Badge } from "@/components/admin/ui";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import RichTextEditor from "./RichTextEditor";
import RevisionsLog from "./RevisionsLog";

/**
 * Generic admin CRUD page.
 */
export default function CrudPage({ resource, title, subtitle, fields, columns, defaultForm }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [originalForm, setOriginalForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [page, setPage] = useState(1);
  const [isDirty, setIsDirty] = useState(false);
  const perPage = 10;

  const load = () => {
    setLoading(true);
    api.get(`/admin/${resource}`, { params: q ? { q } : {} })
      .then((r) => setItems(r.data.items || r.data || [])) // supports paginated and unpaginated standard returns
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  // Unsaved changes browser prompt
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (modalOpen && isDirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [modalOpen, isDirty]);

  const updateForm = (updates) => {
    const next = { ...form, ...updates };
    setForm(next);
    setIsDirty(JSON.stringify(next) !== JSON.stringify(originalForm));
  };

  const filtered = useMemo(() => {
    if (!q) return items;
    const lower = q.toLowerCase();
    return items.filter(it => JSON.stringify(it).toLowerCase().includes(lower));
  }, [items, q]);

  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setOriginalForm(defaultForm);
    setIsDirty(false);
    setModalOpen(true);
  };
  
  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({ ...defaultForm, ...item });
    setOriginalForm({ ...defaultForm, ...item });
    setIsDirty(false);
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      delete payload.id; delete payload.created_at; delete payload._id;
      if (editingId) await api.put(`/admin/${resource}/${editingId}`, payload);
      else await api.post(`/admin/${resource}`, payload);
      toast.success(editingId ? "Updated" : "Created");
      setIsDirty(false);
      setModalOpen(false);
      load();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setSaving(false); }
  };

  const duplicate = async (item) => {
    try {
      const payload = { ...item };
      delete payload.id; delete payload._id; delete payload.created_at; delete payload.updated_at;
      
      const copyFields = ["name", "title", "caption", "class_name", "question"];
      copyFields.forEach(f => {
        if (payload[f]) payload[f] = `${payload[f]} (Copy)`;
      });

      await api.post(`/admin/${resource}`, payload);
      toast.success("Successfully duplicated record");
      load();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  const doDelete = async () => {
    try {
      await api.delete(`/admin/${resource}/${toDelete.id}`);
      toast.success("Soft-deleted item. Go to Trash Bin to manage or restore.");
      setToDelete(null);
      load();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  return (
    <div data-testid={`admin-${resource}-page`}>
      <PageHeader
        subtitle={subtitle || "Manage"}
        title={title}
        actions={
          <>
            <div className="flex items-center gap-2 border border-[#2A2A2A] px-3 py-2 bg-[#171717]">
              <Search className="w-4 h-4 text-[#8A8A8A]" />
              <input placeholder="Search…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="bg-transparent outline-none text-sm w-40" data-testid={`${resource}-search`} />
            </div>
            <Button onClick={openCreate} data-testid={`${resource}-create`}>
              <Plus className="w-4 h-4" /> New
            </Button>
          </>
        }
      />

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0B0B0B] border-b border-[#2A2A2A]">
              <tr>
                {columns.map(c => (
                  <th key={c.key} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold">{c.label}</th>
                ))}
                <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={columns.length + 1} className="px-4 py-10 text-center text-[#8A8A8A]"><Loader2 className="w-5 h-5 animate-spin inline" /> Loading…</td></tr>
              )}
              {!loading && paged.length === 0 && (
                <tr><td colSpan={columns.length + 1} className="px-4 py-10 text-center text-[#8A8A8A]">No records yet. Click "New" to create your first item.</td></tr>
              )}
              {paged.map((item, i) => (
                <tr key={item.id} className="border-b border-[#2A2A2A] hover:bg-[#0B0B0B]/50 transition-colors" data-testid={`${resource}-row-${i}`}>
                  {columns.map(c => (
                    <td key={c.key} className="px-4 py-3 text-[#CFCFCF] align-middle">
                      {c.render ? c.render(item) : (item[c.key] ?? "—")}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => duplicate(item)} className="p-2 hover:text-[#FF8A00] transition-colors" aria-label="Duplicate" title="Duplicate">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEdit(item)} className="p-2 hover:text-[#FF5A1F] transition-colors" aria-label="Edit" data-testid={`${resource}-edit-${i}`}>
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setToDelete(item)} className="p-2 hover:text-[#FF3B30] transition-colors" aria-label="Delete" data-testid={`${resource}-delete-${i}`}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#2A2A2A] text-xs">
            <span className="text-[#8A8A8A]">Page {page} of {totalPages} • {filtered.length} total</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 border border-[#2A2A2A] hover:border-[#FF5A1F] disabled:opacity-40 transition-colors">Prev</button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1 border border-[#2A2A2A] hover:border-[#FF5A1F] disabled:opacity-40 transition-colors">Next</button>
            </div>
          </div>
        )}
      </Card>
 
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start md:items-center justify-center p-4 overflow-y-auto"
            onClick={() => setModalOpen(false)}
          >
            <motion.form
              onSubmit={save}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0B0B0B] border border-[#2A2A2A] max-w-3xl w-full my-8 relative"
              data-testid={`${resource}-modal`}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF5A1F] to-[#FF8A00]" />
              <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A]">
                <div className="font-display text-2xl uppercase">{editingId ? `Edit ${title}` : `New ${title}`}</div>
                <div className="flex items-center gap-2">
                  {editingId && (
                    <RevisionsLog
                      collection={resource}
                      documentId={editingId}
                      onRestore={(restored) => {
                        setForm({ ...defaultForm, ...restored });
                        setIsDirty(true);
                        toast.success("Restored version into modal workspace. Click Save to apply.");
                      }}
                    />
                  )}
                  <button type="button" onClick={() => setModalOpen(false)} className="text-white/60 hover:text-white" aria-label="Close">
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              {isDirty && (
                <div className="bg-[#FF5A1F]/10 border-b border-[#FF5A1F]/20 text-[#FF5A1F] text-[10px] uppercase py-2 px-6 tracking-widest font-semibold">
                  * Unsaved Changes in Item Draft Workspace
                </div>
              )}

              <div className="p-6 grid md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                {fields.map((f) => (
                  <div key={f.name} className={f.colSpan === 2 || f.type === "richtext" ? "md:col-span-2" : ""}>
                    <FieldRenderer field={f} value={form[f.name]} onChange={(v) => updateForm({ [f.name]: v })} />
                    {f.help && <div className="text-[10px] text-[#8A8A8A] mt-1">{f.help}</div>}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-2 p-6 border-t border-[#2A2A2A]">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving} data-testid={`${resource}-save`}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this item?"
        message="This action cannot be undone."
        onCancel={() => setToDelete(null)}
        onConfirm={doDelete}
      />
    </div>
  );
}

function FieldRenderer({ field, value, onChange }) {
  const label = field.label;

  if (field.type === "textarea") {
    return <Textarea label={label} rows={field.rows || 4} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} />;
  }
  if (field.type === "richtext") {
    return <RichTextEditor label={label} value={value ?? ""} onChange={onChange} />;
  }
  if (field.type === "number") {
    return <Input label={label} type="number" value={value ?? 0} onChange={(e) => onChange(Number(e.target.value))} />;
  }
  if (field.type === "select") {
    return (
      <Select label={label} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
        {field.options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </Select>
    );
  }
  if (field.type === "switch") {
    return (
      <div>
        <label className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-2 block">{label}</label>
        <Switch checked={!!value} onChange={onChange} label={value ? "Enabled" : "Disabled"} />
      </div>
    );
  }
  if (field.type === "list") {
    // Comma-separated list or newline-separated
    const arr = Array.isArray(value) ? value : [];
    return (
      <div>
        <label className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-2 block">{label}</label>
        <textarea
          value={arr.join("\n")}
          onChange={(e) => onChange(e.target.value.split("\n").map(s => s.trim()).filter(Boolean))}
          rows={field.rows || 4}
          placeholder={field.placeholder || "One item per line"}
          className="bg-[#0B0B0B] border border-[#2A2A2A] focus:border-[#FF5A1F] outline-none py-2.5 px-3 w-full transition-colors text-white text-sm"
        />
      </div>
    );
  }
  if (field.type === "keyvalue") {
    const obj = value && typeof value === "object" ? value : {};
    const asText = Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join("\n");
    return (
      <div>
        <label className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-2 block">{label}</label>
        <textarea
          defaultValue={asText}
          onBlur={(e) => {
            const next = {};
            e.target.value.split("\n").forEach(line => {
              const idx = line.indexOf(":");
              if (idx > 0) next[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
            });
            onChange(next);
          }}
          rows={field.rows || 4}
          placeholder={field.placeholder || "key: value (one per line)"}
          className="bg-[#0B0B0B] border border-[#2A2A2A] focus:border-[#FF5A1F] outline-none py-2.5 px-3 w-full transition-colors text-white text-sm font-mono"
        />
      </div>
    );
  }
  if (field.type === "image") {
    return <ImageField label={label} value={value} onChange={onChange} />;
  }
  // default text
  return <Input label={label} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} />;
}

function ImageField({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false);

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/admin/media/upload?folder=content", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = getMediaUrl(data.url);
      onChange(url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally { setUploading(false); }
  };

  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-3 items-start">
        {value ? (
          <img src={value} alt="" className="w-32 h-32 object-cover border border-[#2A2A2A]" />
        ) : (
          <div className="w-32 h-32 border-2 border-dashed border-[#2A2A2A] flex items-center justify-center text-xs text-[#8A8A8A]">No image</div>
        )}
        <div className="flex-1 space-y-2 min-w-[200px]">
          <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="Paste URL or upload" className="bg-[#0B0B0B] border border-[#2A2A2A] focus:border-[#FF5A1F] outline-none py-2.5 px-3 w-full text-sm" />
          <label className="inline-flex items-center gap-2 cursor-pointer border border-[#2A2A2A] hover:border-[#FF5A1F] px-3 py-2 text-xs uppercase tracking-widest transition-colors">
            <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {uploading ? "Uploading" : "Upload"}
          </label>
          {value && <button type="button" onClick={() => onChange("")} className="ml-2 text-xs text-[#FF3B30] hover:underline">Remove</button>}
        </div>
      </div>
    </div>
  );
}
