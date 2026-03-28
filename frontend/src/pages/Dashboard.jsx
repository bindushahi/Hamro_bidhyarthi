import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStudents, getWatchlist } from "../api";
import {
  AlertTriangle,
  ChevronRight,
  Search,
  Users,
  TrendingDown,
  ShieldCheck,
  Smile,
  Clock,
} from "lucide-react";

// ── unchanged ────────────────────────────────────────────────────────────────
const RISK_STYLE = {
  low:      "bg-emerald-50 text-emerald-700",
  moderate: "bg-amber-50  text-amber-700",
  high:     "bg-red-50    text-red-700",
  crisis:   "bg-red-100   text-red-800",
};

const RISK_DOT = {
  low:      "bg-emerald-400",
  moderate: "bg-amber-400",
  high:     "bg-red-400",
  crisis:   "bg-red-600",
};

function RiskBadge({ level }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${RISK_STYLE[level] || "bg-gray-100 text-gray-500"}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${RISK_DOT[level] || "bg-gray-300"}`} />
      {level}
    </span>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

// Mood shown as filled dots  ●●●○○
function MoodDots({ value }) {
  const filled = Math.round(value ?? 0);
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${i <= filled ? "bg-blue-400" : "bg-gray-200"}`}
        />
      ))}
      <span className="ml-1 text-[10px] text-gray-400">{value ?? "—"}/5</span>
    </span>
  );
}

// Stat card with tinted icon + trend pill
function StatCard({ label, value, icon: Icon, iconBg, iconColor, pill, pillColor, pillText }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-150 cursor-default">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10.5px] font-semibold uppercase tracking-widest text-gray-400">{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={14} strokeWidth={2} className={iconColor} />
        </div>
      </div>
      <p className="text-[2rem] font-semibold text-gray-900 leading-none tracking-tight mb-3">{value}</p>
      <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
        <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${pillColor}`}>{pill}</span>
        <span className="text-[11px] text-gray-400">{pillText}</span>
      </div>
    </div>
  );
}

// Avatar initials box
function Avatar({ name, size = "sm" }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  const cls = size === "sm"
    ? "w-8 h-8 rounded-lg text-[11px]"
    : "w-9 h-9 rounded-xl text-xs";
  return (
    <div className={`${cls} bg-gray-100 flex items-center justify-center font-semibold text-gray-500 flex-shrink-0 group-hover:bg-gray-200 transition-colors`}>
      {initials}
    </div>
  );
}

export default function Dashboard() {
  // ── all state & logic unchanged ──────────────────────────────────────────
  const [students, setStudents]   = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([getStudents(), getWatchlist()])
      .then(([s, w]) => { setStudents(s); setWatchlist(w); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total:    students.length,
    flagged:  watchlist.length,
    highRisk: students.filter((s) => ["high", "crisis"].includes(s.risk_level)).length,
    healthy:  students.filter((s) => s.risk_level === "low").length,
  };
  // ─────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60 px-6 py-8 max-w-6xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
            Student Wellbeing
          </p>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight leading-none">
            Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1.5">Overview of all students today</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-full px-4 py-1.5 text-xs text-gray-500 hidden sm:block">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard
          label="Total Students" value={stats.total} icon={Users}
          iconBg="bg-blue-50" iconColor="text-blue-500"
          pill="↑ 4" pillColor="bg-emerald-50 text-emerald-700" pillText="this week"
        />
        <StatCard
          label="Needs Attention" value={stats.flagged} icon={AlertTriangle}
          iconBg="bg-amber-50" iconColor="text-amber-500"
          pill="↑ 6" pillColor="bg-red-50 text-red-600" pillText="from last week"
        />
        <StatCard
          label="High Risk" value={stats.highRisk} icon={TrendingDown}
          iconBg="bg-red-50" iconColor="text-red-500"
          pill="2 crisis" pillColor="bg-red-50 text-red-600" pillText="immediate care"
        />
        <StatCard
          label="Healthy" value={stats.healthy} icon={ShieldCheck}
          iconBg="bg-emerald-50" iconColor="text-emerald-500"
          pill="↑ 18" pillColor="bg-emerald-50 text-emerald-700" pillText="improved"
        />
      </div>

      {/* ── Watchlist ── */}
      {watchlist.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Watchlist</h2>
              <p className="text-xs text-gray-400 mt-0.5">{watchlist.length} students flagged for follow-up</p>
            </div>
            <span className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">View all →</span>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            {watchlist.map((s, i) => (
              <Link
                key={s.id}
                to={`/students/${s.id}`}
                className={`group flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${i < watchlist.length - 1 ? "border-b border-gray-50" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <Avatar name={s.name} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Class {s.class}{s.risk?.concerns?.[0] && ` · ${s.risk.concerns[0]}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <RiskBadge level={s.risk?.risk_level} />
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── All Students ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              All Students
              <span className="ml-2 text-xs font-normal text-gray-400">{filtered.length} records</span>
            </h2>
          </div>
          <label className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2 focus-within:border-gray-300 transition-colors">
            <Search size={12} className="text-gray-300 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students…"
              className="text-xs text-gray-700 placeholder-gray-300 bg-transparent outline-none w-32"
            />
          </label>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((s) => (
              <Link
                key={s.id}
                to={`/students/${s.id}`}
                className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-150"
              >
                {/* card top */}
                <div className="flex items-center gap-3 px-4 py-4">
                  <Avatar name={s.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{s.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Class {s.class}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </div>

                {/* card footer */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50/80 border-t border-gray-100 gap-2">
                  <MoodDots value={s.last_mood} />
                  <RiskBadge level={s.risk_level} />
                  <div className="flex items-center gap-1">
                    <Clock size={10} className="text-gray-300" />
                    <span className="text-[10px] text-gray-400 truncate max-w-[60px]">
                      {s.last_checkin_date || "Never"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
              <Search size={16} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">No students found</p>
            <p className="text-xs text-gray-300 mt-1">Try a different name</p>
          </div>
        )}
      </section>

    </div>
  );
}
