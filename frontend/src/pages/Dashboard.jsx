import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  getStudents,
  getWatchlist,
  getSchoolAnalytics,
  getClassAnalytics,
  getCrisisAlerts,
  acknowledgeCrisisAlert,
  pollDashboard,
  getTopAtRisk,
  getAlertHistory,
  getExportUrl,
} from "../api";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../i18n";
import {
  AlertTriangle,
  Users,
  TrendingDown,
  ShieldCheck,
  Search,
  Siren,
  Phone,
  X,
  Download,
  Clock,
  ChevronRight,
  Brain,
} from "lucide-react";
import Toast from "../components/Toast";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";

// Risk badge styles
const RISK_STYLE = {
  low: "bg-emerald-100 text-emerald-600 border border-emerald-200",
  moderate: "bg-amber-100 text-amber-600 border border-amber-200",
  high: "bg-red-100 text-red-600 border border-red-200",
  crisis: "bg-red-200 text-red-700 border border-red-300",
};

function RiskBadge({ level, t }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
        RISK_STYLE[level] || "bg-gray-100 text-gray-500 border border-gray-200"
      }`}
    >
      {t(`risk_${level}`) || level}
    </span>
  );
}

// Small stats card
function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 hover:bg-gray-100 transition">
      <div className="flex justify-between items-center mb-2 text-gray-500 text-[11px] font-medium tracking-wide">
        {label}
        <Icon size={16} />
      </div>
      <div className="text-2xl font-semibold text-gray-800 tracking-tight">{value}</div>
    </div>
  );
}

// Crisis alert banner
function CrisisAlertBanner({ alerts, onAcknowledge, t, n }) {
  if (alerts.length === 0) return null;
  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 animate-pulse"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <Siren size={18} className="text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[13px] font-semibold text-red-800">
                  {t("crisis_alert")}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-red-200 text-red-800 rounded-full uppercase tracking-wide">
                  {alert.trigger === "keyword_detected" ? t("crisis_keyword") : t("crisis_pattern")}
                </span>
              </div>
              <p className="text-[13px] text-red-700">
                <Link to={`/students/${alert.student_id}`} className="font-medium underline hover:no-underline">
                  {alert.student_name}
                </Link>
                {" "}({t("th_class")} {alert.student_class}) — {t("th_mood")}: {n(alert.mood)}/{n(5)}
              </p>
              {alert.note_preview && (
                <p className="text-[12px] text-red-600 mt-1 italic">
                  &quot;{alert.note_preview}&quot;
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Phone size={12} className="text-red-500" />
                <span className="text-[11px] text-red-600">
                  {t("crisis_helpline")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to={`/students/${alert.student_id}`}
                className="px-3 py-1.5 text-[12px] font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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

// AI Summary Card
function AISummaryCard({ students, watchlist, crisisAlerts, classBreakdown, t, n }) {
  const declining = students.filter((s) => s.risk_level === "high" || s.risk_level === "crisis");
  const crisisCount = crisisAlerts.length;
  const lowMoodToday = students.filter((s) => s.last_mood && s.last_mood <= 2).length;

  let worstClass = null;
  if (classBreakdown.length > 0) {
    worstClass = classBreakdown.reduce((worst, c) => {
      const highRisk = (c.risk_distribution.high || 0) + (c.risk_distribution.crisis || 0);
      const worstHigh = worst ? (worst.risk_distribution.high || 0) + (worst.risk_distribution.crisis || 0) : 0;
      return highRisk > worstHigh ? c : worst;
    }, null);
  }

  const insights = [];
  if (crisisCount > 0) {
    insights.push({ text: `${n(crisisCount)} ${t("dash_students_count")} ${t("ai_crisis_attention")}`, urgent: true });
  }
  if (declining.length > 0) {
    insights.push({ text: `${n(declining.length)} ${t("dash_students_count")} ${t("ai_high_risk")}`, urgent: declining.length > 3 });
  }
  if (lowMoodToday > 0) {
    insights.push({ text: `${n(lowMoodToday)} ${t("dash_students_count")} ${t("ai_low_mood")}`, urgent: false });
  }
  if (worstClass && ((worstClass.risk_distribution.high || 0) + (worstClass.risk_distribution.crisis || 0)) > 0) {
    insights.push({ text: `${worstClass.class} ${t("ai_worst_class")}`, urgent: false });
  }
  if (watchlist.length > 0) {
    insights.push({ text: `${n(watchlist.length)} ${t("dash_students_count")} ${t("ai_on_watchlist")}`, urgent: false });
  }
  if (insights.length === 0) {
    insights.push({ text: t("ai_all_clear"), urgent: false });
  }

  return (
    <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border border-indigo-100 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
          <Brain size={14} className="text-white" />
        </div>
        <h3 className="text-[14px] font-semibold text-gray-800">{t("dash_ai_summary")}</h3>
      </div>
      <ul className="space-y-2">
        {insights.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${item.urgent ? "bg-red-500" : "bg-indigo-400"}`} />
            <span className={`text-[13px] leading-relaxed ${item.urgent ? "text-red-700 font-medium" : "text-gray-600"}`}>
              {item.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Loading Skeleton
function DashboardSkeleton() {
  return (
    <div className="min-h-screen w-full bg-white text-gray-800 p-8 flex flex-col gap-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-gray-200 rounded-lg" />
          <div className="h-4 w-64 bg-gray-100 rounded" />
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between">
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-4 bg-gray-200 rounded" />
            </div>
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gray-200 rounded-lg" />
          <div className="h-4 w-40 bg-gray-200 rounded" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
            <div className="h-3 bg-gray-200 rounded" style={{ width: `${60 + i * 15}%` }} />
          </div>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-3 w-16 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Student card
function StudentCard({ s, t, n }) {
  return (
    <Link
      to={`/students/${s.id}`}
      className="group relative bg-gray-50 border border-gray-200 rounded-2xl p-4 hover:bg-gray-100 hover:scale-[1.02] transition-all duration-300"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-indigo-50 to-purple-50 blur-xl transition rounded-2xl" />
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-[11px] font-bold text-white tracking-wide">
          {s.name.split(" ").map((w) => w[0]).join("")}
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-gray-800 tracking-tight">{s.name}</p>
          <p className="text-[11px] text-gray-500">{t("th_class")} {s.class}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <RiskBadge level={s.risk_level} t={t} />
          {s.risk_score > 0 && (
            <span className={`text-[10px] font-mono font-semibold ${
              s.risk_score >= 60 ? "text-red-600" : s.risk_score >= 30 ? "text-amber-600" : "text-gray-400"
            }`}>
              {t("th_score")}: {n(s.risk_score)}
            </span>
          )}
        </div>
      </div>
      <div className="relative z-10 mt-3 text-[11px] text-gray-500">
        <div className="flex justify-between">
          <span>{t("th_mood")}: {s.last_mood != null ? n(s.last_mood) : "—"} / {n(5)}</span>
          <span>{s.last_checkin_date || t("never")}</span>
        </div>
        {s.why_flagged && s.why_flagged !== "No concerns detected" && (
          <p className="mt-1 text-[10px] text-amber-600 truncate">
            {s.why_flagged}
          </p>
        )}
      </div>
    </Link>
  );
}

// Main dashboard
export default function Dashboard() {
  const { user } = useAuth();
  const { t, n } = useLanguage();
  const role = user?.role;
  const isCounselor = role === "counselor" || role === "admin";

  const [students, setStudents] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [schoolStats, setSchoolStats] = useState(null);
  const [classBreakdown, setClassBreakdown] = useState([]);
  const [crisisAlerts, setCrisisAlerts] = useState([]);
  const [topAtRisk, setTopAtRisk] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [toast, setToast] = useState(null);
  const [lastCheckinCount, setLastCheckinCount] = useState(null);

  const [search, setSearch] = useState("");
  const [view, setView] = useState("overview");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [confirmAlert, setConfirmAlert] = useState(null);
  const [dateFilter, setDateFilter] = useState("all");

  const perPage = 12;

  const loadData = useCallback(() => {
    const promises = [
      getStudents(), getWatchlist(), getCrisisAlerts(),
      getTopAtRisk(5), getAlertHistory(),
    ];
    if (isCounselor) promises.push(getSchoolAnalytics(), getClassAnalytics());

    return Promise.all(promises)
      .then(([s, w, alerts, topRisk, history, school, classes]) => {
        setStudents(s);
        setWatchlist(w);
        setCrisisAlerts(alerts);
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

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const poll = await pollDashboard();
        if (lastCheckinCount !== null && poll.total_checkins > lastCheckinCount) {
          const diff = poll.total_checkins - lastCheckinCount;
          setToast(`${n(diff)} ${t("dash_new_checkins")}`);
          loadData();
        }
        setLastCheckinCount(poll.total_checkins);
        if (poll.crisis_count > 0) {
          const alerts = await getCrisisAlerts();
          setCrisisAlerts(alerts);
        }
      } catch (e) { /* silent */ }
    }, 15000);

    pollDashboard().then((p) => setLastCheckinCount(p.total_checkins)).catch(() => {});
    return () => clearInterval(interval);
  }, [lastCheckinCount, loadData, t, n]);

  function handleAcknowledge(alertId) {
    setConfirmAlert(alertId);
  }

  async function confirmAcknowledge() {
    if (!confirmAlert) return;
    try {
      await acknowledgeCrisisAlert(confirmAlert);
      setCrisisAlerts((prev) => prev.filter((a) => a.id !== confirmAlert));
      setToast({ message: t("dash_alert_acknowledged"), variant: "success" });
    } catch (e) {
      console.error("Failed to acknowledge alert:", e);
    } finally {
      setConfirmAlert(null);
    }
  }

  function isWithinDateFilter(dateStr) {
    if (dateFilter === "all" || !dateStr) return true;
    const d = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (dateFilter === "today") return d >= today;
    if (dateFilter === "week") {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    }
    if (dateFilter === "month") {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return d >= monthAgo;
    }
    return true;
  }

  const dateFiltered = dateFilter === "all"
    ? students
    : students.filter((s) => isWithinDateFilter(s.last_checkin_date));

  const filtered = dateFiltered.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const stats = {
    total: dateFiltered.length,
    flagged: dateFilter === "all" ? watchlist.length : dateFiltered.filter((s) => ["moderate", "high", "crisis"].includes(s.risk_level)).length,
    highRisk: dateFiltered.filter((s) => ["high", "crisis"].includes(s.risk_level)).length,
    healthy: dateFiltered.filter((s) => s.risk_level === "low").length,
  };

  if (loading) return <DashboardSkeleton />;

  const DATE_FILTERS = [
    { key: "all", labelKey: "dash_filter_all" },
    { key: "today", labelKey: "dash_filter_today" },
    { key: "week", labelKey: "dash_filter_week" },
    { key: "month", labelKey: "dash_filter_month" },
  ];

  return (
    <div className="min-h-screen w-full bg-white text-gray-800 p-8 flex flex-col gap-8">

      {toast && (
        <Toast
          message={typeof toast === "string" ? toast : toast.message}
          variant={typeof toast === "string" ? "warning" : toast.variant}
          onClose={() => setToast(null)}
        />
      )}

      {confirmAlert && (
        <ConfirmDialog
          title={t("crisis_confirm_title")}
          message={t("crisis_confirm_msg")}
          confirmLabel={t("crisis_dismiss")}
          cancelLabel={t("cancel")}
          variant="danger"
          onConfirm={confirmAcknowledge}
          onCancel={() => setConfirmAlert(null)}
        />
      )}

      <CrisisAlertBanner alerts={crisisAlerts} onAcknowledge={handleAcknowledge} t={t} n={n} />

      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-indigo-600 tracking-tight">
            {role === "teacher" ? t("dash_my_class") : t("dash_title")}
          </h1>
          <p className="text-gray-500 text-[13px] mt-1">{t("dash_subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-0.5">
            {DATE_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => { setDateFilter(f.key); setPage(1); }}
                className={`px-3 py-1.5 text-[12px] font-medium rounded-lg transition ${
                  dateFilter === f.key
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t(f.labelKey)}
              </button>
            ))}
          </div>
          <a
            href={getExportUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Download size={14} />
            {t("export_csv")}
          </a>
        </div>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard label={t("dash_total")} value={n(stats.total)} icon={Users} />
        <StatCard label={t("dash_attention")} value={n(stats.flagged)} icon={AlertTriangle} />
        <StatCard label={t("dash_high_risk")} value={n(stats.highRisk)} icon={TrendingDown} />
        <StatCard label={t("dash_healthy")} value={n(stats.healthy)} icon={ShieldCheck} />
      </div>

      {/* AI SUMMARY */}
      <AISummaryCard
        students={students}
        watchlist={watchlist}
        crisisAlerts={crisisAlerts}
        classBreakdown={classBreakdown}
        t={t}
        n={n}
      />

      {/* TOP AT-RISK */}
      {topAtRisk.length > 0 && topAtRisk[0].risk_score > 0 && (
        <div>
          <h2 className="text-[14px] font-semibold text-gray-800 mb-3">{t("dash_top_risk")}</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-400 tracking-wide">#</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-400 tracking-wide">{t("th_name")}</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-400 tracking-wide">{t("th_class")}</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-400 tracking-wide">{t("th_score")}</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-400 tracking-wide">{t("th_reason")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topAtRisk.filter(s => s.risk_score > 0).map((s, i) => (
                  <tr key={s.id} className="hover:bg-gray-100 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-[12px]">{n(i + 1)}</td>
                    <td className="px-4 py-3">
                      <Link to={`/students/${s.id}`} className="text-[13px] font-medium text-gray-900 hover:underline">
                        {s.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-500">{s.class}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              s.risk_score >= 60 ? "bg-red-500" : s.risk_score >= 30 ? "bg-amber-400" : "bg-emerald-400"
                            }`}
                            style={{ width: `${s.risk_score}%` }}
                          />
                        </div>
                        <span className="text-[12px] font-mono font-medium text-gray-700">{n(s.risk_score)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-500">{s.why_flagged}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ALERT HISTORY */}
      {alertHistory.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-[13px] font-semibold text-gray-800 mb-3 hover:text-gray-600"
          >
            <Clock size={14} className="text-gray-400" />
            {t("dash_alert_history")} ({n(alertHistory.length)})
            <ChevronRight size={14} className={`text-gray-400 transition-transform ${showHistory ? "rotate-90" : ""}`} />
          </button>
          {showHistory && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl divide-y divide-gray-100">
              {alertHistory.map((a) => (
                <div key={a.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[13px] text-gray-900">
                      <Link to={`/students/${a.student_id}`} className="font-medium hover:underline">
                        {a.student_name}
                      </Link>
                      <span className="text-gray-400"> — {a.student_class}</span>
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {a.trigger === "keyword_detected" ? t("crisis_keyword") : t("crisis_pattern")} · {t("th_mood")} {n(a.mood)}/{n(5)}
                      {a.note_preview && <span className="italic"> · &quot;{a.note_preview}&quot;</span>}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-gray-400">{new Date(a.timestamp).toLocaleDateString()}</p>
                    <span className={`text-[10px] font-medium ${a.acknowledged ? "text-emerald-600" : "text-red-600"}`}>
                      {a.acknowledged ? t("dash_acknowledged") : t("dash_active")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TABS */}
      <div className="sticky top-0 z-10 bg-white backdrop-blur-sm border-b border-gray-200">
        <div className="flex gap-6 py-3 text-[13px]">
          <button
            onClick={() => setView("overview")}
            className={`font-medium hover:text-indigo-600 ${view === "overview" ? "text-indigo-600" : "text-gray-400"}`}
          >
            {t("dash_overview")}
          </button>
          <button
            onClick={() => setView("students")}
            className={`font-medium hover:text-indigo-600 ${view === "students" ? "text-indigo-600" : "text-gray-400"}`}
          >
            {t("dash_all_students")}
          </button>
          <button
            onClick={() => setView("watchlist")}
            className={`font-medium hover:text-indigo-600 ${view === "watchlist" ? "text-indigo-600" : "text-gray-400"}`}
          >
            {t("dash_watchlist")}
          </button>
        </div>
      </div>

      {/* OVERVIEW */}
      {view === "overview" && isCounselor && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto">
          {classBreakdown.map((c) => (
            <div key={c.class} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 hover:bg-gray-100 transition">
              <div className="flex justify-between text-[13px] mb-2">
                <span className="font-semibold text-gray-800">{c.class}</span>
                <span className="text-gray-500">{n(c.student_count)} {t("dash_students_count")}</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-gray-200/40">
                {["low", "moderate", "high", "crisis"].map((l) => {
                  const pct = ((c.risk_distribution[l] || 0) / c.student_count) * 100;
                  return pct ? (
                    <div
                      key={l}
                      style={{ width: `${pct}%` }}
                      className={
                        l === "low" ? "bg-emerald-400"
                          : l === "moderate" ? "bg-amber-400"
                          : l === "high" ? "bg-red-400"
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
        watchlist.length === 0 ? (
          <EmptyState
            icon="users"
            title={t("dash_no_watchlist")}
            description={t("dash_no_watchlist_desc")}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-h-[70vh] overflow-y-auto">
            {watchlist.map((s) => (
              <StudentCard key={s.id} s={s} t={t} n={n} />
            ))}
          </div>
        )
      )}

      {/* STUDENTS */}
      {view === "students" && (
        <div className="flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              data-search-input
              placeholder={t("dash_search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl w-full text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 text-gray-800 transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-mono">/</kbd>
          </div>

          {paginated.length === 0 ? (
            <EmptyState
              icon="search"
              title={t("dash_no_students")}
              description={search ? `${t("dash_no_results")} "${search}"` : t("dash_no_students_desc")}
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginated.map((s) => (
                <StudentCard key={s.id} s={s} t={t} n={n} />
              ))}
            </div>
          )}

          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: Math.ceil(filtered.length / perPage) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded-full text-[13px] font-medium transition ${
                  page === i + 1 ? "bg-indigo-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                {n(i + 1)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
