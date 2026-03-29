import { useEffect, useState } from "react";
import { Bell, CheckCircle, AlertTriangle, Info, X } from "lucide-react";

const VARIANTS = {
  info: {
    bg: "bg-indigo-50 border-indigo-200",
    icon: Info,
    iconColor: "text-indigo-500",
    textColor: "text-indigo-800",
    closeColor: "text-indigo-400 hover:text-indigo-600",
  },
  success: {
    bg: "bg-emerald-50 border-emerald-200",
    icon: CheckCircle,
    iconColor: "text-emerald-500",
    textColor: "text-emerald-800",
    closeColor: "text-emerald-400 hover:text-emerald-600",
  },
  warning: {
    bg: "bg-amber-50 border-amber-200",
    icon: Bell,
    iconColor: "text-amber-500",
    textColor: "text-amber-800",
    closeColor: "text-amber-400 hover:text-amber-600",
  },
  error: {
    bg: "bg-red-50 border-red-200",
    icon: AlertTriangle,
    iconColor: "text-red-500",
    textColor: "text-red-800",
    closeColor: "text-red-400 hover:text-red-600",
  },
};

export default function Toast({ message, variant = "warning", onClose, duration = 5000 }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const v = VARIANTS[variant] || VARIANTS.warning;
  const Icon = v.icon;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  function handleClose() {
    setExiting(true);
    setTimeout(onClose, 300);
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 ${v.bg} border rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 transition-all duration-300 ease-out`}
      style={{
        opacity: visible && !exiting ? 1 : 0,
        transform: visible && !exiting ? "translateX(0)" : "translateX(20px)",
      }}
    >
      <Icon size={16} className={v.iconColor} />
      <span className={`text-[13px] font-medium ${v.textColor}`}>{message}</span>
      <button onClick={handleClose} className={v.closeColor}>
        <X size={14} />
      </button>
    </div>
  );
}
