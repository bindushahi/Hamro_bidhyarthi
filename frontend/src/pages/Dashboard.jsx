import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getStudents, getWatchlist, getCrisisAlerts, acknowledgeCrisisAlert, pollDashboard, getSchoolAnalytics, getClassAnalytics, getTopAtRisk, getAlertHistory, getExportUrl } from "../api";
import { useLanguage } from "../i18n";
import { useAuth } from "../contexts/AuthContext";
import {
  AlertTriangle,
  ChevronRight,
  Search,
  Users,
  TrendingDown,
  ShieldCheck,
  Siren,
  Phone,
  X,
  Bell,
  BarChart3,
  Download,
  Clock,
  Trophy,
} from "lucide-react";

const RISK_STYLE = {
  low: "bg-emerald-50 text-emerald-700",
  moderate: "bg-amber-50 text-amber-700",
  high: "bg-red-50 text-red-700",
  crisis: "bg-red-100 text-red-800",
};

function RiskBadge({ level }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
        RISK_STYLE[level] || "bg-gray-100 text-gray-500"
      }`}
    >
      {level}
    </span>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400 font-medium">{label}</span>
        <Icon size={16} strokeWidth={1.8} className="text-gray-300" />
      </div>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function CrisisAlertBanner({ alerts, onAcknowledge }) {
  const { t } = useLanguage();

  if (alerts.length === 0) return null;

  return (
    <div className="mb-6 space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="bg-red-50 border-2 border-red-300 rounded-lg p-4 animate-pulse-slow"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <Siren size={18} className="text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-red-800">
                  {t("crisis_alert")}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-red-200 text-red-800 rounded-full uppercase">
                  {alert.trigger === "keyword_detected" ? "Keyword" : "Pattern"}
                </span>
              </div>
              <p className="text-sm text-red-700">
                <Link to={`/students/${alert.student_id}`} className="font-medium underline hover:no-underline">
                  {alert.student_name}
                </Link>
                {" "}({t("th_class")} {alert.student_class}) — Mood: {alert.mood}/5
              </p>
              {alert.note_preview && (
                <p className="text-xs text-red-600 mt-1 italic">
                  &quot;{alert.note_preview}&quot;
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Phone size={12} className="text-red-500" />
                <span className="text-xs text-red-600">
                  {t("crisis_helpline")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to={`/students/${alert.student_id}`}
                className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {t("crisis_view")}
              </Link>
              <button
                onClick={() => onAcknowledge(alert.id)}
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                title={t("crisis_dismiss")}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 shadow-lg flex items-center gap-3 animate-slide-in">
      <Bell size={16} className="text-amber-500" />
      <span className="text-sm text-amber-800">{message}</span>
      <button onClick={onClose} className="text-amber-400 hover:text-amber-600">
        <X size={14} />
      </button>
    </div>
  );
}

function RiskBar({ distribution, total }) {
  if (!total) return null;
  const levels = ["low", "moderate", "high", "crisis"];
  const colors = { low: "bg-emerald-400", moderate: "bg-amber-400", high: "bg-red-400", crisis: "bg-red-600" };

  return (
    <div className="flex rounded-full overflow-hidden h-2">
      {levels.map((l) => {
        const pct = ((distribution[l] || 0) / total) * 100;
        if (!pct) return null;
        return <div key={l} className={`${colors[l]}`} style={{ width: `${pct}%` }} />;
      })}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role;
  const isCounselor = role === "counselor" || role === "admin";

  const [students, setStudents] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [crisisAlerts, setCrisisAlerts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [lastCheckinCount, setLastCheckinCount] = useState(null);
  const [schoolStats, setSchoolStats] = useState(null);
  const [classBreakdown, setClassBreakdown] = useState([]);
  const [topAtRisk, setTopAtRisk] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const { t } = useLanguage();

  const loadData = useCallback(() => {
    const promises = [getStudents(), getWatchlist(), getCrisisAlerts(), getTopAtRisk(5), getAlertHistory()];
    if (isCounselor) {
      promises.push(getSchoolAnalytics(), getClassAnalytics());
    }
    return Promise.all(promises)
      .then(([s, w, c, topRisk, history, school, classes]) => {
        setStudents(s);
        setWatchlist(w);
        setCrisisAlerts(c);
        setTopAtRisk(topRisk);
        setAlertHistory(history);
        if (school) setSchoolStats(school);
        if (classes) setClassBreakdown(classes);
      })
      .catch(console.error);
  }, [isCounselor]);

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  // Poll every 15 seconds for new data
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const poll = await pollDashboard();

        // Show toast if new check-ins arrived
        if (lastCheckinCount !== null && poll.total_checkins > lastCheckinCount) {
          const diff = poll.total_checkins - lastCheckinCount;
          setToast(`${diff} new check-in${diff > 1 ? "s" : ""} received`);
          loadData();
        }
        setLastCheckinCount(poll.total_checkins);

        // Refresh crisis alerts
        if (poll.crisis_count > 0) {
          const alerts = await getCrisisAlerts();
          setCrisisAlerts(alerts);
        }
      } catch (e) {
        // polling failure is silent
      }
    }, 15000);

    pollDashboard().then((p) => setLastCheckinCount(p.total_checkins)).catch(() => {});

    return () => clearInterval(interval);
  }, [lastCheckinCount, loadData]);

  async function handleAcknowledge(alertId) {
    try {
      await acknowledgeCrisisAlert(alertId);
      setCrisisAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (e) {
      console.error("Failed to acknowledge alert:", e);
    }
  }

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: students.length,
    flagged: watchlist.length,
    highRisk: students.filter((s) =>
      ["high", "crisis"].includes(s.risk_level)
    ).length,
    healthy: students.filter((s) => s.risk_level === "low").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">
          {role === "teacher" ? t("dash_my_class") || "My Class" : t("dash_title")}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {role === "teacher"
            ? t("dash_teacher_subtitle") || "Students assigned to your class"
            : t("dash_subtitle")}
        </p>
      </div>

      <CrisisAlertBanner alerts={crisisAlerts} onAcknowledge={handleAcknowledge} />

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label={t("dash_total")} value={stats.total} icon={Users} />
        <StatCard label={t("dash_attention")} value={stats.flagged} icon={AlertTriangle} />
        <StatCard label={t("dash_high_risk")} value={stats.highRisk} icon={TrendingDown} />
        <StatCard label={t("dash_healthy")} value={stats.healthy} icon={ShieldCheck} />
      </div>

      {topAtRisk.length > 0 && topAtRisk[0].risk_score > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Trophy size={14} className="text-amber-500" />
              {t("dash_top_risk") || "Top At-Risk Students"}
            </h2>
            <a
              href={getExportUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={12} />
              {t("export_csv") || "Export CSV"}
            </a>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400">#</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400">{t("th_name")}</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400">{t("th_class")}</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400">{t("th_score") || "Score"}</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400">Why Flagged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topAtRisk.filter(s => s.risk_score > 0).map((s, i) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{i + 1}</td>
                    <td className="px-4 py-3">
                      <Link to={`/students/${s.id}`} className="font-medium text-gray-900 hover:underline">
                        {s.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{s.class}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              s.risk_score >= 60 ? "bg-red-500" : s.risk_score >= 30 ? "bg-amber-400" : "bg-emerald-400"
                            }`}
                            style={{ width: `${s.risk_score}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-medium text-gray-700">{s.risk_score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{s.why_flagged}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {alertHistory.length > 0 && (
        <div className="mb-8">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-3 hover:text-gray-700"
          >
            <Clock size={14} className="text-gray-400" />
            Alert History ({alertHistory.length})
            <ChevronRight size={14} className={`text-gray-400 transition-transform ${showHistory ? "rotate-90" : ""}`} />
          </button>
          {showHistory && (
            <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-50">
              {alertHistory.map((a) => (
                <div key={a.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-900">
                      <Link to={`/students/${a.student_id}`} className="font-medium hover:underline">
                        {a.student_name}
                      </Link>
                      <span className="text-gray-400"> — {a.student_class}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {a.trigger === "keyword_detected" ? "Keyword" : "Pattern"} · Mood {a.mood}/5
                      {a.note_preview && <span className="italic"> · "{a.note_preview}"</span>}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400">{new Date(a.timestamp).toLocaleDateString()}</p>
                    <span className={`text-[10px] font-medium ${a.acknowledged ? "text-emerald-600" : "text-red-600"}`}>
                      {a.acknowledged ? "Acknowledged" : "Active"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isCounselor && classBreakdown.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <BarChart3 size={14} className="text-gray-400" />
            {t("dash_class_comparison") || "Class Comparison"}
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400">{t("th_class")}</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400">{t("dash_total")}</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400">{t("th_last_mood")}</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400">{t("th_last_checkin")}</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400 w-48">{t("th_risk")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {classBreakdown.map((c) => (
                  <tr key={c.class} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.class}</td>
                    <td className="px-4 py-3 text-gray-500">{c.student_count}</td>
                    <td className="px-4 py-3 text-gray-700">{c.avg_mood || "\u2014"}</td>
                    <td className="px-4 py-3 text-gray-500">{c.checkin_count}</td>
                    <td className="px-4 py-3">
                      <RiskBar distribution={c.risk_distribution} total={c.student_count} />
                      <div className="flex gap-3 mt-1.5 text-[10px] text-gray-400">
                        {Object.entries(c.risk_distribution).map(([level, count]) =>
                          count > 0 ? (
                            <span key={level} className="capitalize">{count} {level}</span>
                          ) : null
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {watchlist.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-900 mb-3">
            {t("dash_watchlist")}
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
            {watchlist.map((s) => (
              <Link
                key={s.id}
                to={`/students/${s.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                    {s.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-400">
                      {t("th_class")} {s.class}
                      {s.risk?.concerns?.[0] && ` \u2014 ${s.risk.concerns[0]}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RiskBadge level={s.risk?.risk_level} />
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-900">{t("dash_all_students")}</h2>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("dash_search")}
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 placeholder-gray-300 focus:outline-none focus:border-gray-400"
            />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400">{t("th_name")}</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400">{t("th_class")}</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400">{t("th_last_mood")}</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400">{t("th_score") || "Score"}</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400">{t("th_risk")}</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400">{t("th_last_checkin")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      to={`/students/${s.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{s.class}</td>
                  <td className="px-4 py-3 text-gray-700">{s.last_mood ?? "\u2014"} / 5</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-mono font-medium ${
                      s.risk_score >= 60 ? "text-red-600" : s.risk_score >= 30 ? "text-amber-600" : "text-gray-400"
                    }`}>{s.risk_score ?? "\u2014"}</span>
                  </td>
                  <td className="px-4 py-3"><RiskBadge level={s.risk_level} /></td>
                  <td className="px-4 py-3 text-gray-400">{s.last_checkin_date || t("never")}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/students/${s.id}`}>
                      <ChevronRight size={16} className="text-gray-300" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
