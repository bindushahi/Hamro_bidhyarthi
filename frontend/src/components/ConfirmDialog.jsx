import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({ title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", variant = "danger", onConfirm, onCancel }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  function handleCancel() {
    setVisible(false);
    setTimeout(onCancel, 200);
  }

  function handleConfirm() {
    setVisible(false);
    setTimeout(onConfirm, 200);
  }

  const btnStyle = variant === "danger"
    ? "bg-red-600 hover:bg-red-700 text-white"
    : "bg-indigo-600 hover:bg-indigo-700 text-white";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center transition-all duration-200"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleCancel} />

      {/* Dialog */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm mx-4 overflow-hidden transition-all duration-200"
        style={{ transform: visible ? "scale(1)" : "scale(0.95)" }}
      >
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>
              <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-[13px] font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-[13px] font-medium rounded-xl transition ${btnStyle}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
