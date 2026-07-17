import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/admin/ui";

export default function ConfirmDialog({ open, title, message, onCancel, onConfirm, confirmLabel = "Delete" }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onCancel}
          data-testid="confirm-dialog"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0B0B0B] border border-[#FF3B30] max-w-md w-full p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-[#FF3B30]" />
              <div className="font-display text-2xl uppercase">{title}</div>
            </div>
            <p className="text-[#CFCFCF] mb-6 text-sm">{message}</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onCancel} data-testid="confirm-cancel">Cancel</Button>
              <Button variant="danger" onClick={onConfirm} data-testid="confirm-ok">{confirmLabel}</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
