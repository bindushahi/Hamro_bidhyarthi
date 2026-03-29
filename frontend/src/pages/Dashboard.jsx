import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getStudents,
  getWatchlist,
  getSchoolAnalytics,
  getClassAnalytics,
} from "../api";
import { useAuth } from "../contexts/AuthContext";
import {
  AlertTriangle,
  Users,
  TrendingDown,
  ShieldCheck,
  Search,
} from "lucide-react";

// Risk badge styles
const RISK_STYLE = {
  low: "bg-emerald-100 text-emerald-600 border border-emerald-200",
  moderate: "bg-amber-100 text-amber-600 border border-amber-200",
  high: "bg-red-100 text-red-600 border border-red-200",
  crisis: "bg-red-200 text-red-700 border border-red-300",
};

function RiskBadge({ level }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
        RISK_STYLE[level] || "bg-gray-100 text-gray-500 border border-gray-200"
      }`}
    >
      {level}
    </span>
  );
}

// Small stats card
function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 hover:bg-gray-100 transition">
      <div className="flex justify-between items-center mb-2 text-gray-500 text-xs">
        {label}
        <Icon size={16} />
      </div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </div>
  );
}

// Student card
function StudentCard({ s }) {
  return (
    <Link
      to={`/students/${s.id}`}
      className="group relative bg-gray-50 border border-gray-200 rounded-2xl p-4 hover:bg-gray-100 hover:scale-[1.02] transition-all duration-300"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-indigo-50 to-purple-50 blur-xl transition rounded-2xl" />
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-xs font-bold text-white">
          {s.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-800">{s.name}</p>
          <p className="text-xs text-gray-500">Class {s.class}</p>
        </div>
        <RiskBadge level={s.risk_level} />
      </div>
      <div className="mt-3 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition">
        Mood: {s.last_mood ?? "—"} / 5 <br />
        Last: {s.last_checkin_date || "Never"}
      </div>
    </Link>
  );
}

// Main dashboard
export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role;
  const isCounselor = role === "counselor" || role === "admin";

  const [students, setStudents] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [schoolStats, setSchoolStats] = useState(null);
  const [classBreakdown, setClassBreakdown] = useState([]);

  const [search, setSearch] = useState("");
  const [view, setView] = useState("overview");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const perPage = 12;

  // Fetch data
  useEffect(() => {
    const promises = [getStudents(), getWatchlist()];
    if (isCounselor) promises.push(getSchoolAnalytics(), getClassAnalytics());

    Promise.all(promises)
      .then(([s, w, school, classes]) => {
        setStudents(s);
        setWatchlist(w);
        if (school) setSchoolStats(school);
        if (classes) setClassBreakdown(classes);
      })
      .finally(() => setLoading(false));
  }, [isCounselor]);

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const stats = {
    total: students.length,
    flagged: watchlist.length,
    highRisk: students.filter((s) => ["high", "crisis"].includes(s.risk_level))
      .length,
    healthy: students.filter((s) => s.risk_level === "low").length,
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-800 text-lg font-semibold bg-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white text-gray-800 p-8 flex flex-col gap-8">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0">
        <div>
          <h1 className="text-3xl font-bold text-indigo-600">
            {role === "teacher" ? "My Class" : "Dashboard"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            School wellbeing overview
          </p>
        </div>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard label="Total Students" value={stats.total} icon={Users} />
        <StatCard label="Needs Attention" value={stats.flagged} icon={AlertTriangle} />
        <StatCard label="High Risk" value={stats.highRisk} icon={TrendingDown} />
        <StatCard label="Healthy" value={stats.healthy} icon={ShieldCheck} />
      </div>

      {/* TABS */}
      <div className="sticky top-0 z-10 bg-white backdrop-blur-sm border-b border-gray-200">
        <div className="flex gap-6 py-3 text-sm">
          <button
            onClick={() => setView("overview")}
            className={`hover:text-indigo-600 ${view === "overview" && "text-indigo-600 font-semibold"}`}
          >
            Overview
          </button>
          <button
            onClick={() => setView("students")}
            className={`hover:text-indigo-600 ${view === "students" && "text-indigo-600 font-semibold"}`}
          >
            Students
          </button>
          <button
            onClick={() => setView("watchlist")}
            className={`hover:text-indigo-600 ${view === "watchlist" && "text-indigo-600 font-semibold"}`}
          >
            Watchlist
          </button>
        </div>
      </div>

      {/* OVERVIEW */}
      {view === "overview" && isCounselor && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto">
          {classBreakdown.map((c) => (
            <div key={c.class} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 hover:bg-gray-100 transition">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-gray-800">{c.class}</span>
                <span className="text-gray-500">{c.student_count} students</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-gray-200/40">
                {["low", "moderate", "high", "crisis"].map((l) => {
                  const pct = ((c.risk_distribution[l] || 0) / c.student_count) * 100;
                  return pct ? (
                    <div
                      key={l}
                      style={{ width: `${pct}%` }}
                      className={
                        l === "low"
                          ? "bg-emerald-400"
                          : l === "moderate"
                          ? "bg-amber-400"
                          : l === "high"
                          ? "bg-red-400"
                          : "bg-red-600"
                      }
                    />
                  ) : null;
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* WATCHLIST */}
      {view === "watchlist" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-h-[70vh] overflow-y-auto">
          {watchlist.map((s) => (
            <StudentCard key={s.id} s={s} />
          ))}
        </div>
      )}

      {/* STUDENTS */}
      {view === "students" && (
        <div className="flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
          {/* SEARCH */}
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-xl w-full text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 text-gray-800"
            />
          </div>

          {/* GRID */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginated.map((s) => (
              <StudentCard key={s.id} s={s} />
            ))}
          </div>

          {/* PAGINATION */}
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: Math.ceil(filtered.length / perPage) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded-full transition ${
                  page === i + 1 ? "bg-indigo-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}