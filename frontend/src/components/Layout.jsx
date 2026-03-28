import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  ClipboardCheck,
  Eye,
  LayoutDashboard,
  LogOut,
  Shield,
  ArrowLeftRight,
} from "lucide-react";

const NAV = {
  teacher: [
    { to: "/checkin", label: "Check In", icon: ClipboardCheck },
    { to: "/observe", label: "Observation", icon: Eye },
    { to: "/dashboard", label: "My Class", icon: LayoutDashboard },
  ],
  counselor: [
    { to: "/checkin", label: "Check In", icon: ClipboardCheck },
    { to: "/observe", label: "Observation", icon: Eye },
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ],
  admin: [
    { to: "/admin", label: "Admin Panel", icon: Shield },
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ],
};

const ROLE_LABEL = { teacher: "Teacher", counselor: "Counselor", admin: "Admin" };

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
            हाम्रो विद्यार्थी
          </h1>
        </div>

        <nav className="flex-1 px-2.5 space-y-0.5">
          {links.map(({ to, label, icon: Icon }) => (
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
              {label}
            </NavLink>
          ))}
        </nav>

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
              <p className="text-[11px] text-gray-400 leading-tight">{ROLE_LABEL[role]}</p>
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
                      {ROLE_LABEL[role]}
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
                  Switch account
                </button>
                <button
                  onClick={() => { setPopoverOpen(false); onSignOut(); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} strokeWidth={1.8} />
                  Sign out
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
