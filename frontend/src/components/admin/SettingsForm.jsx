import { useEffect, useState } from "react";
import { Loader2, Save, Plus, Trash2, Send } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiError } from "@/lib/api";
import { PageHeader, Button, Card, Input, Textarea } from "@/components/admin/ui";
import RichTextEditor from "./RichTextEditor";
import RevisionsLog from "./RevisionsLog";
import MediaSelector from "./MediaSelector";

/**
 * Reusable settings page for singleton content documents.
 */
export default function SettingsForm({ endpoint, title, subtitle, schema }) {
  const [data, setData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    api.get(`/content/${endpoint}?preview=true`)
      .then((r) => {
        setData(r.data);
        setOriginalData(JSON.parse(JSON.stringify(r.data)));
        setIsDirty(false);
      })
      .catch(() => toast.error("Failed to load"));
  }, [endpoint]);

  // Unsaved changes browser prompt
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const setField = (name, value) => {
    const next = { ...data, [name]: value };
    setData(next);
    setIsDirty(JSON.stringify(next) !== JSON.stringify(originalData));
  };

  const toggleSectionState = (name, key) => {
    const currentSections = data.sections || {};
    const currentSecState = currentSections[name] || { hidden: false, deleted: false };
    const nextSecState = { ...currentSecState, [key]: !currentSecState[key] };
    const nextSections = { ...currentSections, [name]: nextSecState };
    const next = { ...data, sections: nextSections };
    setData(next);
    setIsDirty(JSON.stringify(next) !== JSON.stringify(originalData));
  };

  const save = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/admin/content/${endpoint}`, data);
      setData(res.data);
      setOriginalData(JSON.parse(JSON.stringify(res.data)));
      setIsDirty(false);
      toast.success("Changes saved as draft.");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    setPublishing(true);
    try {
      // First auto-save if dirty
      if (isDirty) {
        const res = await api.put(`/admin/content/${endpoint}`, data);
        setOriginalData(JSON.parse(JSON.stringify(res.data)));
        setIsDirty(false);
      }
      await api.post(`/admin/content/${endpoint}/publish`);
      toast.success("Successfully published to live website!");
    } catch (err) {
      toast.error("Failed to publish content.");
    } finally {
      setPublishing(false);
    }
  };

  const handleRestore = (restoredState) => {
    setData(restoredState);
    setIsDirty(JSON.stringify(restoredState) !== JSON.stringify(originalData));
    toast.success("Restored previous revision into workspace! Click Save Draft to commit.");
  };

  if (!data) return <div className="text-[#8A8A8A] flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>;

  return (
    <div data-testid={`admin-${endpoint}-page`}>
      <PageHeader
        subtitle={subtitle}
        title={title}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <RevisionsLog collection="content" documentId={endpoint} onRestore={handleRestore} />
            
            <Button type="button" onClick={save} disabled={saving} data-testid={`${endpoint}-save`}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving" : "Save Draft"}
            </Button>

            <Button type="button" onClick={publish} disabled={publishing} variant="primary" className="bg-[#FF5A1F] hover:bg-[#FF8A00] text-black">
              {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {publishing ? "Publishing" : "Publish Live"}
            </Button>
          </div>
        }
      />

      {isDirty && (
        <div className="bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 text-[#FF5A1F] text-xs py-2.5 px-4 mb-6 uppercase tracking-wider font-semibold">
          * You have unsaved changes in your draft workspace. Click "Save Draft" to keep them.
        </div>
      )}

      <div className="w-full">
        {/* Full Width Form Panel */}
        <form onSubmit={save} className="w-full space-y-6">
          <Card>
            <div className="grid md:grid-cols-2 gap-6">
              {schema.map((f) => (
                <FieldBlock
                  key={f.name}
                  field={f}
                  value={data[f.name]}
                  onChange={(v) => setField(f.name, v)}
                  sections={data.sections || {}}
                  onToggleSection={(key) => toggleSectionState(f.name, key)}
                />
              ))}
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}

function FieldBlock({ field, value, onChange, sections, onToggleSection }) {
  const wrap = field.colSpan === 2 || field.type === "array" || field.type === "objectlist" || field.type === "keyvalue" || field.type === "richtext" ? "md:col-span-2" : "";
  const secState = field.optional ? (sections[field.name] || { hidden: false, deleted: false }) : { hidden: false, deleted: false };

  if (field.optional && secState.deleted) {
    return (
      <div className={`${wrap} border border-dashed border-red-500/20 bg-red-500/5 rounded-xl p-6 text-center space-y-3`}>
        <div className="text-sm font-semibold text-red-400">Section "{field.label}" has been soft-deleted</div>
        <p className="text-xs text-gray-500">It is removed from the public website and the editing form. You can restore it here or in the Trash Bin.</p>
        <button
          type="button"
          onClick={() => onToggleSection("deleted")}
          className="bg-[#1C1C1C] border border-[#2A2A2A] text-xs font-semibold px-4 py-2 hover:bg-[#222] text-white rounded-lg transition-colors"
        >
          Restore Section
        </button>
      </div>
    );
  }

  return (
    <div className={`${wrap} space-y-2`}>
      {field.optional && (
        <div className="flex items-center justify-between bg-[#121212] px-3 py-1.5 rounded-lg border border-[#222]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{field.label} Visibility</span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
              secState.hidden ? "bg-yellow-500/10 text-yellow-500" : "bg-green-500/10 text-green-500"
            }`}>
              {secState.hidden ? "Hidden" : "Visible"}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onToggleSection("hidden")}
              className="text-[10px] uppercase font-bold text-[#FF5A1F] hover:underline"
            >
              {secState.hidden ? "Show" : "Hide"}
            </button>
            <button
              type="button"
              onClick={() => onToggleSection("deleted")}
              className="text-[10px] uppercase font-bold text-red-500 hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      )}
      
      {(() => {
        if (field.type === "textarea") return <Textarea label={field.label} rows={field.rows || 4} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
        if (field.type === "richtext") return <RichTextEditor label={field.label} value={value ?? ""} onChange={onChange} />;
        if (field.type === "image") return <MediaSelector value={value ?? ""} onChange={onChange} folder={field.name} />;
        if (field.type === "switch") return (
          <div>
            <label className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-2 block">{field.label}</label>
            <label className="inline-flex items-center gap-3 cursor-pointer">
              <span className={`relative inline-block w-10 h-5 transition-colors ${value ? "bg-[#FF5A1F]" : "bg-[#2A2A2A]"}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white transition-transform ${value ? "translate-x-5" : ""}`} />
              </span>
              <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
              <span className="text-sm">{value ? "Enabled" : "Disabled"}</span>
            </label>
          </div>
        );
        if (field.type === "objectlist") return <ObjectListEditor label={field.label} value={value || []} onChange={onChange} keys={field.keys} />;
        if (field.type === "keyvalue") return <KeyValueEditor label={field.label} value={value || {}} onChange={onChange} />;
        return <Input label={field.label} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
      })()}
      {field.help && <div className="text-[10px] text-[#8A8A8A] mt-1">{field.help}</div>}
    </div>
  );
}

function ObjectListEditor({ label, value, onChange, keys }) {
  const add = () => onChange([...value, Object.fromEntries(keys.map(k => [k, ""]))]);
  const update = (i, k, v) => {
    const next = value.map((row, idx) => idx === i ? { ...row, [k]: v } : row);
    onChange(next);
  };
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs uppercase tracking-widest text-[#8A8A8A]">{label}</label>
        <button type="button" onClick={add} className="text-xs uppercase tracking-widest text-[#FF5A1F] hover:text-[#FF8A00] flex items-center gap-1">
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>
      <div className="space-y-2">
        {value.map((row, i) => (
          <div key={i} className="border border-[#2A2A2A] p-3 flex gap-2 items-start">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
              {keys.map(k => (
                <input key={k} placeholder={k} value={row[k] || ""} onChange={(e) => update(i, k, e.target.value)} className="bg-[#0B0B0B] border border-[#2A2A2A] focus:border-[#FF5A1F] outline-none py-2 px-3 text-sm animate-in fade-in" />
              ))}
            </div>
            <button type="button" onClick={() => remove(i)} className="p-2 text-[#FF3B30] hover:bg-[#FF3B30]/10" aria-label="Remove"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        {value.length === 0 && <div className="text-xs text-[#8A8A8A] italic">Empty. Click "Add" to insert an entry.</div>}
      </div>
    </div>
  );
}

function KeyValueEditor({ label, value, onChange }) {
  const entries = Object.entries(value || {});
  const setKey = (idx, newK) => {
    const next = entries.map(([k, v], i) => i === idx ? [newK, v] : [k, v]);
    onChange(Object.fromEntries(next));
  };
  const setVal = (idx, newV) => {
    const next = entries.map(([k, v], i) => i === idx ? [k, newV] : [k, v]);
    onChange(Object.fromEntries(next));
  };
  const remove = (idx) => onChange(Object.fromEntries(entries.filter((_, i) => i !== idx)));
  const add = () => onChange({ ...value, "": "" });
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs uppercase tracking-widest text-[#8A8A8A]">{label}</label>
        <button type="button" onClick={add} className="text-xs uppercase tracking-widest text-[#FF5A1F] hover:text-[#FF8A00] flex items-center gap-1">
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>
      <div className="space-y-2">
        {entries.map(([k, v], i) => (
          <div key={i} className="flex gap-2 animate-in fade-in">
            <input placeholder="key" value={k} onChange={(e) => setKey(i, e.target.value)} className="w-40 bg-[#0B0B0B] border border-[#2A2A2A] focus:border-[#FF5A1F] outline-none py-2 px-3 text-sm" />
            <input placeholder="value" value={v} onChange={(e) => setVal(i, e.target.value)} className="flex-1 bg-[#0B0B0B] border border-[#2A2A2A] focus:border-[#FF5A1F] outline-none py-2 px-3 text-sm" />
            <button type="button" onClick={() => remove(i)} className="p-2 text-[#FF3B30] hover:bg-[#FF3B30]/10" aria-label="Remove"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
