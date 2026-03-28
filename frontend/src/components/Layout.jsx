import { NavLink, Outlet } from "react-router-dom";
import {
  ClipboardCheck,
  Lightbulb,
  Eye,
  LayoutDashboard,
  LogOut,
  Globe,
} from "lucide-react";
import { useLanguage } from "../i18n";

const NAV = {
  student: [
    { to: "/checkin", labelKey: "nav_checkin", icon: ClipboardCheck },
    { to: "/creative", labelKey: "nav_creative", icon: Lightbulb },
  ],
  teacher: [
    { to: "/observe", labelKey: "nav_observe", icon: Eye },
  ],
  counselor: [
    { to: "/dashboard", labelKey: "nav_dashboard", icon: LayoutDashboard },
  ],
};

const ROLE_LABEL_KEY = {
  student: "role_student",
  teacher: "role_teacher",
  counselor: "role_counselor",
};

export default function Layout({ role, onRoleChange }) {
  const links = NAV[role] || [];
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-4 pt-5 pb-3">
          <h1 className="text-base font-semibold text-gray-900 tracking-tight">
            {t("app_title")}
          </h1>
          <p className="text-[11px] text-gray-400 mt-0.5">{t(ROLE_LABEL_KEY[role])}</p>
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

        <div className="px-2.5 pb-3 space-y-1">
          <button
            onClick={() => setLang(lang === "en" ? "np" : "en")}
            className="flex items-center gap-2.5 px-3 py-2 w-full rounded-lg text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Globe size={16} strokeWidth={1.8} />
            {lang === "en" ? "नेपाली" : "English"}
          </button>
          <button
            onClick={onRoleChange}
            className="flex items-center gap-2.5 px-3 py-2 w-full rounded-lg text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <LogOut size={16} strokeWidth={1.8} />
            {t("nav_switch_role")}
          </button>
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
