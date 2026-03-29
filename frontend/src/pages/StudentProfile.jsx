import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getStudent,
  getStudents,
  getStudentCheckins,
  getObservations,
  getInterventions,
  analyzeRisk,
  getConversationStarters,
  submitIntervention,
} from "../api";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../i18n";
import {
  ArrowLeft,
  MessageCircle,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertTriangle,
  Loader2,
  Activity,
  Calendar,
  Eye,
  ClipboardList,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
  Printer,
  Plus,
  X,
  Check,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

const RISK_STYLE = {
  low: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  moderate: "bg-amber-50 text-amber-700 border border-amber-200",
  high: "bg-red-50 text-red-700 border border-red-200",
  crisis: "bg-red-100 text-red-800 border border-red-300",
};

const RISK_BG = {
  low: "from-emerald-500 to-emerald-600",
  moderate: "from-amber-500 to-amber-600",
  high: "from-red-500 to-red-600",
  crisis: "from-red-600 to-red-800",
};

const TAG_LABELS = {
  grade_drop: "tag_grade_drop",
  distracted: "tag_distracted",
  withdrawn: "tag_withdrawn",
  absent: "tag_absent",
  aggressive: "tag_aggressive",
  tearful: "tag_tearful",
  isolated: "tag_isolated",
  disruptive: "tag_disruptive",
};

const MOOD_EMOJI = { 1: "😢", 2: "😟", 3: "😐", 4: "🙂", 5: "😊" };

// Quick student search/jump
function StudentSearch({ currentId, t }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  function handleOpen() {
    setOpen(true);
    setQuery("");
    if (allStudents.length === 0) {
      setLoading(true);
      getStudents()
        .then(setAllStudents)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  const filtered = allStudents
    .filter((s) => s.id !== currentId && s.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 6);

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-400 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
      >
        <Search size={12} />
        {t("profile_jump_student")}
      </button>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-white border border-indigo-200 rounded-xl px-3 py-2 shadow-lg">
        <Search size={14} className="text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("profile_search_students")}
          className="flex-1 text-[13px] outline-none bg-transparent text-gray-800 placeholder-gray-400"
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter" && filtered.length > 0) {
              navigate(`/students/${filtered[0].id}`);
              setOpen(false);
            }
          }}
        />
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X size={14} />
        </button>
      </div>
      {(query || loading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-3 text-[13px] text-gray-400">{t("loading")}</div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-3 text-[13px] text-gray-400">{t("profile_no_students_found")}</div>
          ) : (
            filtered.map((s) => (
              <Link
                key={s.id}
                to={`/students/${s.id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 transition text-[13px]"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-[10px] font-bold text-white">
                  {s.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{s.name}</p>
                  <p className="text-[11px] text-gray-400">{t("th_class")} {s.class}</p>
                </div>
                {s.risk_level && s.risk_level !== "low" && (
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${RISK_STYLE[s.risk_level]}`}>
                    {s.risk_level}
                  </span>
                )}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Intervention form
function InterventionForm({ studentId, onSubmitted, t }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [type, setType] = useState("counseling_session");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const types = [
    { value: "counseling_session", labelKey: "intv_counseling" },
    { value: "parent_contact", labelKey: "intv_parent" },
    { value: "peer_support", labelKey: "intv_peer" },
    { value: "referral", labelKey: "intv_referral" },
    { value: "follow_up", labelKey: "intv_followup" },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!note.trim()) return;
    setSubmitting(true);
    try {
      await submitIntervention({ student_id: studentId, type, note });
      setSuccess(true);
      setNote("");
      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
        onSubmitted();
      }, 1500);
    } catch (err) {
      console.error("Failed to submit intervention:", err);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition"
      >
        <Plus size={14} />
        {t("intv_log")}
      </button>
    );
  }

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
          <Check size={16} className="text-emerald-600" />
        </div>
        <p className="text-[13px] font-medium text-emerald-700">{t("intv_success")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-sm border border-gray-100 shadow-sm rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-gray-800">{t("intv_log_new")}</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>

      <div>
        <label className="block text-[12px] font-medium text-gray-500 mb-1.5">{t("intv_type")}</label>
        <div className="flex flex-wrap gap-2">
          {types.map((tp) => (
            <button
              key={tp.value}
              type="button"
              onClick={() => setType(tp.value)}
              className={`px-3 py-1.5 text-[12px] rounded-lg font-medium transition ${
                type === tp.value
                  ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                  : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {t(tp.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[12px] font-medium text-gray-500 mb-1.5">{t("intv_notes")}</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder={t("intv_notes_placeholder")}
          className="w-full px-3 py-2 text-[13px] bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 text-gray-800 placeholder-gray-400 resize-none transition"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 text-[13px] font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
        >
          {t("cancel")}
        </button>
        <button
          type="submit"
          disabled={submitting || !note.trim()}
          className="px-4 py-2 text-[13px] font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl hover:shadow-lg disabled:opacity-50 transition"
        >
          {submitting ? t("submitting") : t("intv_log")}
        </button>
      </div>
    </form>
  );
}
const ENERGY_COLOR = { low: "text-red-500", medium: "text-amber-500", high: "text-emerald-500" };

// Collapsible section
function Section({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white/70 backdrop-blur-sm border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50/50 transition"
      >
        <span className="flex items-center gap-2.5">
          {Icon && <Icon size={16} className="text-indigo-500" />}
          <span className="text-[14px] font-semibold text-gray-800">{title}</span>
        </span>
        {open ? (
          <ChevronUp size={16} className="text-gray-400" />
        ) : (
          <ChevronDown size={16} className="text-gray-400" />
        )}
      </button>
      {open && <div className="px-5 pb-5 border-t border-gray-100">{children}</div>}
    </div>
  );
}

// Skeleton loading
function ProfileSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-pulse">
      <div className="h-4 w-32 bg-gray-200 rounded" />
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
        <div className="h-10 w-36 bg-gray-200 rounded-lg" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl" />
        ))}
      </div>
      <div className="h-56 bg-gray-100 rounded-2xl" />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function StudentProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const isCounselor = user?.role === "counselor" || user?.role === "admin";
  const [student, setStudent] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [observations, setObservations] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [starters, setStarters] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingStarters, setLoadingStarters] = useState(false);
  const { t, n } = useLanguage();

  useEffect(() => {
    Promise.all([
      getStudent(id),
      getStudentCheckins(id),
      getObservations(id),
      getInterventions(id),
    ])
      .then(([s, c, o, i]) => {
        setStudent(s);
        setCheckins(c);
        setObservations(o);
        setInterventions(i);
      })
      .catch(console.error);
  }, [id]);

  async function runAnalysis() {
    setLoadingAI(true);
    try {
      const result = await analyzeRisk(id);
      setAnalysis(result);
    } catch (err) {
      console.error("Risk analysis failed:", err);
    } finally {
      setLoadingAI(false);
    }
  }

  function reloadInterventions() {
    getInterventions(id).then(setInterventions).catch(console.error);
  }

  function handlePrint() {
    window.print();
  }

  async function loadStarters() {
    setLoadingStarters(true);
    try {
      const result = await getConversationStarters(id);
      setStarters(result);
    } catch (err) {
      console.error("Conversation starters failed:", err);
    } finally {
      setLoadingStarters(false);
    }
  }

  if (!student) return <ProfileSkeleton />;

  const chartData = checkins.map((c) => ({
    date: c.date.slice(5),
    mood: c.mood,
  }));

  const last3 = checkins.slice(-3);
  const avgRecent =
    last3.length > 0
      ? (last3.reduce((s, c) => s + c.mood, 0) / last3.length).toFixed(1)
      : "—";

  let trendLabel = t("trend_stable");
  let TrendIcon = Minus;
  let trendColor = "text-gray-500";
  if (checkins.length >= 4) {
    const recent = checkins.slice(-3).reduce((s, c) => s + c.mood, 0) / 3;
    const earlier =
      checkins.slice(-6, -3).reduce((s, c) => s + c.mood, 0) /
      Math.min(3, checkins.slice(-6, -3).length || 1);
    if (recent - earlier < -0.5) {
      TrendIcon = TrendingDown;
      trendLabel = t("trend_declining");
      trendColor = "text-red-500";
    } else if (recent - earlier > 0.5) {
      TrendIcon = TrendingUp;
      trendLabel = t("trend_improving");
      trendColor = "text-emerald-500";
    }
  }

  const riskLevel = student.risk_level || "low";
  const riskScore = student.risk_score || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top bar: Back + Search + Print */}
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-[13px] text-gray-400 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={15} />
          {t("profile_back")}
        </Link>
        <div className="flex items-center gap-2">
          <StudentSearch currentId={id} t={t} />
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-400 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
          >
            <Printer size={12} />
            {t("profile_print_report")}
          </button>
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-white/70 backdrop-blur-sm border border-gray-100 shadow-sm rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg">
              <span className="text-lg font-bold text-white">
                {student.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">{student.name}</h1>
              <p className="text-[13px] text-gray-500 mt-0.5">
                {t("th_class")} {student.class} &middot; {t("profile_age")} {n(student.age)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-full text-[12px] font-semibold capitalize ${RISK_STYLE[riskLevel]}`}>
              {t(`risk_${riskLevel}`)} {t("profile_risk_word")}
            </span>
            <button
              onClick={runAnalysis}
              disabled={loadingAI}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[13px] font-medium rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
            >
              {loadingAI ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {loadingAI ? t("profile_analyzing") : t("profile_run_ai")}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white/70 backdrop-blur-sm border border-gray-100 shadow-sm rounded-2xl p-4">
          <p className="text-[11px] text-gray-400 font-medium tracking-wide mb-1">{t("profile_avg_mood")}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900 font-mono">{n(avgRecent)}</span>
            <span className="text-[12px] text-gray-400">/{n(5)}</span>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm border border-gray-100 shadow-sm rounded-2xl p-4">
          <p className="text-[11px] text-gray-400 font-medium tracking-wide mb-1">{t("profile_trend")}</p>
          <div className={`flex items-center gap-1.5 ${trendColor}`}>
            <TrendIcon size={18} />
            <span className="text-[14px] font-semibold">{trendLabel}</span>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm border border-gray-100 shadow-sm rounded-2xl p-4">
          <p className="text-[11px] text-gray-400 font-medium tracking-wide mb-1">{t("profile_checkins_14d")}</p>
          <span className="text-2xl font-bold text-gray-900 font-mono">{n(checkins.length)}</span>
        </div>

        <div className="bg-white/70 backdrop-blur-sm border border-gray-100 shadow-sm rounded-2xl p-4">
          <p className="text-[11px] text-gray-400 font-medium tracking-wide mb-1">{t("profile_risk_score")}</p>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold font-mono ${
              riskScore >= 60 ? "text-red-600" : riskScore >= 30 ? "text-amber-600" : "text-emerald-600"
            }`}>
              {n(riskScore)}
            </span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${RISK_BG[riskLevel]}`}
                style={{ width: `${riskScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Why Flagged */}
      {student.why_flagged && student.why_flagged !== "No concerns detected" && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl px-5 py-3 flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-[13px] text-amber-800">{student.why_flagged}</p>
        </div>
      )}

      {/* Mood History Chart */}
      {chartData.length > 0 && (
        <Section title={t("profile_mood_history")} icon={Activity} defaultOpen={true}>
          <div className="pt-3">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={30} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                  formatter={(value) => [`${n(value)}/${n(5)}`, t("th_mood")]}
                />
                <Area type="monotone" dataKey="mood" stroke="#6366F1" strokeWidth={2.5} fill="url(#moodGradient)" dot={{ r: 4, fill: "#6366F1", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Section>
      )}

      {/* AI Assessment */}
      {analysis && (
        <Section title={t("profile_ai_assessment")} icon={Sparkles} defaultOpen={true}>
          <div className="pt-3">
            {analysis.ai_assessment ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-full font-semibold text-[12px] capitalize ${RISK_STYLE[analysis.ai_assessment.risk_level]}`}>
                    {t(`risk_${analysis.ai_assessment.risk_level}`)} {t("profile_risk_word")}
                  </span>
                  <span className="text-[12px] text-gray-500">
                    {t("profile_confidence")}: {n(Math.round(analysis.ai_assessment.confidence * 100))}%
                  </span>
                </div>
                <p className="text-[13px] text-gray-700 leading-relaxed">{analysis.ai_assessment.signal_summary}</p>
                {analysis.ai_assessment.primary_concerns?.length > 0 && (
                  <div>
                    <p className="text-[12px] font-semibold text-gray-500 mb-2">{t("profile_concerns")}</p>
                    <ul className="space-y-1.5">
                      {analysis.ai_assessment.primary_concerns.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-[13px] text-gray-600">
                          <AlertTriangle size={13} className="text-amber-400 mt-0.5 shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.ai_assessment.recommended_action && (
                  <div className="bg-indigo-50 rounded-xl px-4 py-3">
                    <p className="text-[11px] font-semibold text-indigo-600 mb-1">{t("profile_recommended")}</p>
                    <p className="text-[13px] text-indigo-800">{analysis.ai_assessment.recommended_action}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[13px] text-amber-600 bg-amber-50 px-4 py-3 rounded-xl">{t("profile_ai_unavailable")}</p>
            )}
          </div>
        </Section>
      )}

      {/* Conversation Starters */}
      <Section title={t("profile_starters")} icon={MessageCircle} defaultOpen={false}>
        <div className="pt-3">
          {!starters?.starters ? (
            <div className="text-center py-4">
              <p className="text-[13px] text-gray-400 mb-3">{t("profile_starters_hint")}</p>
              <button
                onClick={loadStarters}
                disabled={loadingStarters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 text-[13px] font-medium rounded-xl hover:bg-indigo-100 disabled:opacity-50 transition"
              >
                {loadingStarters ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {loadingStarters ? t("profile_generating") : t("profile_generate")}
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {starters.starters.map((s, i) => (
                <div key={i} className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 px-4 py-3 rounded-xl">
                  <p className="text-[13px] text-indigo-900 font-medium">{s.nepali}</p>
                  <p className="text-[12px] text-indigo-600 mt-1">{s.english}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Recent Check-ins */}
      <Section title={`${t("profile_recent_checkins")} (${checkins.length})`} icon={Calendar} defaultOpen={true}>
        <div className="pt-3 space-y-2 max-h-80 overflow-y-auto">
          {checkins.length === 0 ? (
            <p className="text-[13px] text-gray-400 text-center py-4">{t("profile_no_checkins")}</p>
          ) : (
            checkins.slice().reverse().slice(0, 10).map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl hover:bg-gray-100 transition">
                <span className="text-xl">{MOOD_EMOJI[c.mood] || "😐"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 text-[13px]">
                    <span className="font-medium text-gray-800">{t("th_mood")} {n(c.mood)}/{n(5)}</span>
                    <span className={`text-[12px] font-medium ${ENERGY_COLOR[c.energy] || "text-gray-400"}`}>
                      {c.energy} {t("energy_label")}
                    </span>
                  </div>
                  {c.note && <p className="text-[12px] text-gray-500 mt-0.5 truncate">{c.note}</p>}
                </div>
                <span className="text-[11px] text-gray-400 whitespace-nowrap">{c.date}</span>
              </div>
            ))
          )}
        </div>
      </Section>

      {/* Observations */}
      {observations.length > 0 && (
        <Section title={`${t("profile_observations")} (${observations.length})`} icon={Eye} defaultOpen={true}>
          <div className="pt-3 space-y-3">
            {observations.map((o) => (
              <div key={o.id} className="p-3 bg-gray-50/80 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-medium text-gray-700">{o.teacher}</span>
                  <span className="text-[11px] text-gray-400">{o.date}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {o.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 text-[11px] bg-indigo-50 text-indigo-600 rounded-full font-medium">
                      {t(TAG_LABELS[tag]) || tag}
                    </span>
                  ))}
                </div>
                {o.note && <p className="text-[12px] text-gray-500">{o.note}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Intervention Form (counselors only) */}
      {isCounselor && (
        <div className="print:hidden">
          <InterventionForm studentId={id} onSubmitted={reloadInterventions} t={t} />
        </div>
      )}

      {/* Interventions */}
      {interventions.length > 0 && (
        <Section title={`${t("profile_interventions")} (${interventions.length})`} icon={ClipboardList} defaultOpen={interventions.length > 0}>
          <div className="pt-3 space-y-3">
            {interventions.map((i) => (
              <div key={i.id} className="p-3 bg-gray-50/80 rounded-xl">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-[13px] font-medium text-gray-700">{i.counselor}</span>
                  <span className="text-[11px] text-gray-400">{i.date}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                    i.status === "in_progress"
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : i.status === "completed"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                  }`}>
                    {i.status === "in_progress" ? t("intv_in_progress") : i.status === "completed" ? t("intv_completed") : i.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-[12px] text-gray-500">{i.note}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
