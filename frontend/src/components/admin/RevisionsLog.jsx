import React, { useState, useEffect } from "react";
import { History, X, RotateCcw } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function RevisionsLog({ collection, documentId, onRestore }) {
  const [revisions, setRevisions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      api.get(`/admin/revisions/${collection}/${documentId}`)
        .then(r => setRevisions(r.data))
        .catch(() => toast.error("Failed to load revisions"))
        .finally(() => setLoading(false));
    }
  }, [open, collection, documentId]);

  const restore = (revId) => {
    const rev = revisions.find(r => r.id === revId);
    if (!rev) return;
    
    const targetState = rev.after_state || rev.before_state;
    if (!targetState) {
      toast.error("No state found to restore in this revision.");
      return;
    }

    if (!window.confirm("Are you sure you want to restore this version? This will load the state into your active workspace. You will need to click 'Save' to commit it to the database.")) return;
    
    onRestore(targetState);
    setOpen(false);
  };


  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#8A8A8A] hover:text-[#FF5A1F] border border-[#2A2A2A] hover:border-[#FF5A1F] py-2 px-3 transition-colors bg-[#0B0B0B]"
        data-testid="revisions-trigger"
      >
        <History className="w-3.5 h-3.5" /> Revisions
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 flex justify-end">
          <div className="w-full max-w-md bg-[#0f0f0f] border-l border-[#2A2A2A] p-6 overflow-y-auto flex flex-col z-50">
            <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-4 mb-4">
              <div>
                <h3 className="font-display text-lg tracking-wider">Version History</h3>
                <p className="text-xs text-[#8A8A8A]">Audit revisions and restore prior state</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-[#171717] rounded text-white" aria-label="Close revisions">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center text-[#8A8A8A]">Loading...</div>
            ) : revisions.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-[#8A8A8A] italic">No revisions found for this document.</div>
            ) : (
              <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                {revisions.map((rev) => (
                  <div key={rev.id} className="border border-[#2A2A2A] p-4 bg-[#171717] space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-semibold text-[#FF5A1F] uppercase tracking-wider">{rev.action}</div>
                        <div className="text-xs text-[#8A8A8A]">{new Date(rev.timestamp).toLocaleString()}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => restore(rev.id)}
                        className="flex items-center gap-1 bg-[#2A2A2A] hover:bg-[#FF5A1F] hover:text-black py-1 px-2.5 text-[10px] uppercase tracking-widest font-semibold transition-colors text-white"
                        title="Rollback"
                      >
                        <RotateCcw className="w-3 h-3" /> Restore
                      </button>
                    </div>

                    <div className="text-xs text-[#CFCFCF]">
                      <span className="text-[#8A8A8A]">Changed by:</span> {rev.changed_by}
                    </div>

                    {rev.changed_fields && rev.changed_fields.length > 0 ? (
                      <div>
                        <div className="text-[10px] text-[#8A8A8A] uppercase tracking-widest font-bold">Modified Fields:</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {rev.changed_fields.map((f) => (
                            <span key={f} className="text-[10px] bg-[#2A2A2A] text-white py-0.5 px-2 rounded-full border border-[#3A3A3A]">{f}</span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-[#8A8A8A] italic">Snapshot / No specific fields changed</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
