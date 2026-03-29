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
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white/50 backdrop-blur-xl border-r border-white/30 flex flex-col shadow-xl shadow-indigo-100/40">
        {/* Logo / Role */}
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-lg font-bold text-gray-900 tracking-tight drop-shadow-sm">
            {t("app_title")}
          </h1>
          <p className="text-[12px] text-gray-500 mt-1">{t(ROLE_LABEL_KEY[role]) || role}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {links.map(({ to, labelKey, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-sm ${
                  isActive
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg hover:shadow-xl"
                    : "text-gray-700 hover:bg-white/40 hover:backdrop-blur-md hover:shadow-sm"
                }`
              }
            >
              <Icon size={18} strokeWidth={1.8} />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>

        {/* Language switch */}
        <div className="px-4 mt-6">
          <button
            onClick={() => setLang(lang === "en" ? "np" : "en")}
            className="flex items-center gap-2 px-4 py-2 w-full rounded-xl text-sm text-gray-600 hover:bg-white/50 hover:backdrop-blur-md shadow-inner transition-all"
          >
            <Globe size={16} strokeWidth={1.8} />
            {lang === "en" ? "नेपाली" : "English"}
          </button>
        </div>

        {/* User popover */}
        <div className="relative mt-auto px-4 pb-4" ref={popoverRef}>
          <button
            onClick={() => setPopoverOpen((v) => !v)}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-white/50 hover:backdrop-blur-md shadow-inner transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shrink-0 shadow-lg">
              <span className="text-xs font-bold text-white">{getInitials(userName)}</span>
            </div>
            <div className="min-w-0 text-left">
              <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
              <p className="text-[11px] text-gray-500 truncate">
                {t(ROLE_LABEL_KEY[role]) || role}
              </p>
            </div>
          </button>

          {popoverOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white/70 backdrop-blur-xl rounded-xl border border-white/30 shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-4 border-b border-white/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-inner">
                    <span className="text-sm font-semibold text-white">{getInitials(userName)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-purple-50 text-purple-700 capitalize">
                      {t(ROLE_LABEL_KEY[role]) || role}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-2.5 space-y-1">
                <button
                  onClick={() => { setPopoverOpen(false); onSwitchAccount(); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-white/50 hover:backdrop-blur-md transition-all"
                >
                  <ArrowLeftRight size={15} strokeWidth={1.8} />
                  {t("nav_switch_role") || "Switch account"}
                </button>
                <button
                  onClick={() => { setPopoverOpen(false); onSignOut(); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut size={15} strokeWidth={1.8} />
                  {t("Sign Out") || "Sign out"}
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-white/90 backdrop-blur-sm overflow-y-auto transition-all">
        <div className="max-w-6xl mx-auto px-6 py-6 rounded-xl shadow-lg bg-white/70">
          <Outlet />
        </div>
      </main>
    </div>
  );
}