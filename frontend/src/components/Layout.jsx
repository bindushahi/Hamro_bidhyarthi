import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  ClipboardCheck,
  Eye,
  LayoutDashboard,
  LogOut,
  Globe,
  Shield,
  ArrowLeftRight,
} from "lucide-react";
import { useLanguage } from "../i18n";

const NAV = {
  teacher: [
    { to: "/checkin", labelKey: "nav_checkin", icon: ClipboardCheck },
    { to: "/observe", labelKey: "nav_observe", icon: Eye },
    { to: "/dashboard", labelKey: "nav_dashboard", icon: LayoutDashboard },
  ],
  counselor: [
    { to: "/checkin", labelKey: "nav_checkin", icon: ClipboardCheck },
    { to: "/observe", labelKey: "nav_observe", icon: Eye },
    { to: "/dashboard", labelKey: "nav_dashboard", icon: LayoutDashboard },
  ],
  admin: [
    { to: "/admin", labelKey: "nav_admin", icon: Shield },
    { to: "/dashboard", labelKey: "nav_dashboard", icon: LayoutDashboard },
  ],
};

const ROLE_LABEL_KEY = {
  teacher: "role_teacher",
  counselor: "role_counselor",
  admin: "role_admin",
};

function getInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Layout({ role, userName, userEmail, onSignOut, onSwitchAccount }) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef(null);
  const links = NAV[role] || [];
  const { lang, setLang, t } = useLanguage();

  useEffect(() => {
    function handleClick(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setPopoverOpen(false);
      }
    }
    if (popoverOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [popoverOpen]);

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-4 pt-5 pb-3">
          <h1 className="text-base font-semibold text-gray-900 tracking-tight">
            {t("app_title")}
          </h1>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {t(ROLE_LABEL_KEY[role]) || role}
          </p>
        </div>

        <nav className="flex-1 px-2.5 space-y-0.5">
          {links.map(({ to, labelKey, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`
              }
            >
              <Icon size={16} strokeWidth={1.8} />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="px-2.5 pb-1">
          <button
            onClick={() => setLang(lang === "en" ? "np" : "en")}
            className="flex items-center gap-2.5 px-3 py-2 w-full rounded-lg text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Globe size={16} strokeWidth={1.8} />
            {lang === "en" ? "\u0928\u0947\u092A\u093E\u0932\u0940" : "English"}
          </button>
        </div>

        <div className="relative border-t border-gray-100 px-2.5 py-2.5" ref={popoverRef}>
          <button
            onClick={() => setPopoverOpen((v) => !v)}
            className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
              <span className="text-[11px] font-semibold text-white leading-none">
                {getInitials(userName)}
              </span>
            </div>
            <div className="min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
              <p className="text-[11px] text-gray-400 leading-tight">
                {t(ROLE_LABEL_KEY[role]) || role}
              </p>
            </div>
          </button>

          {popoverOpen && (
            <div className="absolute bottom-full left-2.5 right-2.5 mb-2 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden z-50">
              <div className="px-4 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-white">{getInitials(userName)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                    <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-600 capitalize">
                      {t(ROLE_LABEL_KEY[role]) || role}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-1.5">
                <button
                  onClick={() => { setPopoverOpen(false); onSwitchAccount(); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeftRight size={15} strokeWidth={1.8} className="text-gray-400" />
                  {t("nav_switch_role") || "Switch account"}
                </button>
                <button
                  onClick={() => { setPopoverOpen(false); onSignOut(); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} strokeWidth={1.8} />
                  {t("nav_sign_out") || "Sign out"}
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
