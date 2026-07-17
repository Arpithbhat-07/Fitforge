import { useEffect, useState } from "react";
import { Loader2, Save, Plus, Trash2, Eye, EyeOff, Send } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiError } from "@/lib/api";
import { PageHeader, Button, Card, Input, Textarea } from "@/components/admin/ui";
import RichTextEditor from "./RichTextEditor";
import RevisionsLog from "./RevisionsLog";

/**
 * Reusable settings page for singleton content documents.
 */
export default function SettingsForm({ endpoint, title, subtitle, schema }) {
  const [data, setData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
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
    setOriginalData(JSON.parse(JSON.stringify(restoredState)));
    setIsDirty(false);
    toast.success("Restored previous revision into workspace!");
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
            
            <Button type="button" variant="secondary" onClick={() => setShowPreview(!showPreview)}>
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? "Hide Preview" : "Live Preview"}
            </Button>

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

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Form Panel */}
        <form onSubmit={save} className="flex-1 w-full space-y-6">
          <Card>
            <div className="grid md:grid-cols-2 gap-6">
              {schema.map((f) => (
                <FieldBlock
                  key={f.name}
                  field={f}
                  value={data[f.name]}
                  onChange={(v) => setField(f.name, v)}
                />
              ))}
            </div>
          </Card>
        </form>

        {/* Right Live Preview Panel */}
        {showPreview && (
          <div className="w-full lg:w-96 shrink-0 lg:sticky lg:top-24 space-y-4">
            <div className="text-xs uppercase tracking-widest text-[#8A8A8A] font-bold px-1">Live Side-By-Side Preview</div>
            <LivePreviewPanel endpoint={endpoint} data={data} />
          </div>
        )}
      </div>
    </div>
  );
}

function FieldBlock({ field, value, onChange }) {
  const wrap = field.colSpan === 2 || field.type === "array" || field.type === "objectlist" || field.type === "keyvalue" || field.type === "richtext" ? "md:col-span-2" : "";
  return (
    <div className={wrap}>
      {(() => {
        if (field.type === "textarea") return <Textarea label={field.label} rows={field.rows || 4} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
        if (field.type === "richtext") return <RichTextEditor label={field.label} value={value ?? ""} onChange={onChange} />;
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
                <input key={k} placeholder={k} value={row[k] || ""} onChange={(e) => update(i, k, e.target.value)} className="bg-[#0B0B0B] border border-[#2A2A2A] focus:border-[#FF5A1F] outline-none py-2 px-3 text-sm" />
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
          <div key={i} className="flex gap-2">
            <input placeholder="key" value={k} onChange={(e) => setKey(i, e.target.value)} className="w-40 bg-[#0B0B0B] border border-[#2A2A2A] focus:border-[#FF5A1F] outline-none py-2 px-3 text-sm" />
            <input placeholder="value" value={v} onChange={(e) => setVal(i, e.target.value)} className="flex-1 bg-[#0B0B0B] border border-[#2A2A2A] focus:border-[#FF5A1F] outline-none py-2 px-3 text-sm" />
            <button type="button" onClick={() => remove(i)} className="p-2 text-[#FF3B30] hover:bg-[#FF3B30]/10" aria-label="Remove"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}


function LivePreviewPanel({ endpoint, data }) {
  if (endpoint === "hero") {
    return (
      <div className="bg-black border border-[#2A2A2A] p-8 min-h-[320px] flex flex-col justify-center relative overflow-hidden text-left rounded-md">
        {data.image && (
          <img src={data.image} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        )}
        <div className="relative z-10 space-y-4">
          <div className="text-[10px] text-[#FF5A1F] uppercase tracking-[0.2em] font-bold">{data.badge || "FITFORGE"}</div>
          <h1 className="font-display text-3xl uppercase tracking-wider text-white leading-tight">{data.title || "Forge Your Body"}</h1>
          <p className="text-xs text-gray-400 max-w-[240px]">{data.subtitle || "Elite training facility."}</p>
          <div className="flex gap-2">
            <button type="button" className="bg-[#FF5A1F] text-black text-[9px] uppercase font-bold py-2.5 px-4 tracking-widest">{data.primary_cta || "Join Now"}</button>
            <button type="button" className="border border-white text-white text-[9px] uppercase font-bold py-2.5 px-4 tracking-widest">{data.secondary_cta || "View Schedule"}</button>
          </div>
        </div>
      </div>
    );
  }
  
  if (endpoint === "about") {
    return (
      <div className="bg-[#171717] border border-[#2A2A2A] p-6 space-y-5 text-left rounded-md">
        <h2 className="font-display text-xl uppercase text-white tracking-wide border-b border-[#2A2A2A] pb-2">About FitForge</h2>
        <div className="space-y-4 text-[11px] text-gray-300">
          <div>
            <strong className="text-[#FF5A1F] block uppercase tracking-widest text-[9px] mb-1">Who We Are</strong>
            <p className="leading-relaxed">{data.who_we_are || "We are a community..."}</p>
          </div>
          <div>
            <strong className="text-[#FF5A1F] block uppercase tracking-widest text-[9px] mb-1">Our Mission</strong>
            <p className="leading-relaxed">{data.mission || "To forge athletes..."}</p>
          </div>
          {data.core_values && (
            <div>
              <strong className="text-[#FF5A1F] block uppercase tracking-widest text-[9px] mb-1">Core Values</strong>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {data.core_values.map((v, i) => (
                  <div key={i} className="bg-[#0B0B0B] p-2 border border-[#2A2A2A]">
                    <div className="font-semibold text-white text-[9px]">{v.title}</div>
                    <div className="text-[8px] text-gray-500 mt-1 leading-normal">{v.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // fallback simple JSON preview
  return (
    <div className="bg-[#0B0B0B] border border-[#2A2A2A] p-4 rounded-md text-left">
      <div className="text-[10px] uppercase text-[#8A8A8A] mb-2 font-mono tracking-widest">CMS Data Feed</div>
      <pre className="text-[9px] text-gray-400 overflow-x-auto font-mono max-h-96">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
