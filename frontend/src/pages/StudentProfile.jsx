import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getStudent,
  getStudentCheckins,
  getObservations,
  getInterventions,
  analyzeRisk,
  getConversationStarters,
} from "../api";
import { useLanguage } from "../i18n";
import {
  ArrowLeft,
  MessageCircle,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const RISK_STYLE = {
  low: "bg-emerald-100 text-emerald-800",
  moderate: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800",
  crisis: "bg-red-200 text-red-900",
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

// Simple Accordion component
function Accordion({ title, children, button }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white shadow-md rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 text-left text-gray-900 font-medium hover:bg-gray-50 transition"
      >
        <span className="flex items-center gap-2">
          {button && button}
          {title}
        </span>
        <span className="text-gray-400">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="px-5 py-3 border-t border-gray-100">{children}</div>}
    </div>
  );
}

export default function StudentProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [observations, setObservations] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [starters, setStarters] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingStarters, setLoadingStarters] = useState(false);
  const { t } = useLanguage();

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

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400">{t("loading")}</p>
      </div>
    );
  }

  const chartData = checkins.map((c) => ({
    date: c.date.slice(5),
    mood: c.mood,
  }));

  const last3 = checkins.slice(-3);
  const avgRecent =
    last3.length > 0
      ? (last3.reduce((s, c) => s + c.mood, 0) / last3.length).toFixed(1)
      : "—";

  const trendIcon =
    checkins.length >= 4
      ? (() => {
          const r = checkins.slice(-3).reduce((s, c) => s + c.mood, 0) / 3;
          const e =
            checkins.slice(-6, -3).reduce((s, c) => s + c.mood, 0) /
            Math.min(3, checkins.slice(-6, -3).length || 1);
          if (r - e < -0.5) return TrendingDown;
          if (r - e > 0.5) return TrendingUp;
          return Minus;
        })()
      : Minus;
  const TrendIcon = trendIcon;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Back Link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft size={16} />
        {t("profile_back")}
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{student.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("th_class")} {student.class} &middot; Age {student.age}
          </p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={loadingAI}
          className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-all"
        >
          {loadingAI && <Loader2 size={16} className="animate-spin" />}
          {loadingAI ? t("profile_analyzing") : t("profile_run_ai")}
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sticky top-6 z-10 bg-gray-50 p-2 sm:p-0">
        {[
          { label: t("profile_avg_mood"), value: avgRecent, unit: "/5" },
          { label: t("profile_trend"), value: TrendIcon === Minus ? t("trend_stable") : TrendIcon === TrendingUp ? t("trend_improving") : t("trend_declining"), icon: TrendIcon },
          { label: t("profile_checkins_14d"), value: checkins.length },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white shadow-md rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:shadow-lg transition-shadow"
          >
            <p className="text-xs text-gray-400">{item.label}</p>
            <div className="flex items-center gap-2">
              {item.icon && <item.icon size={20} className="text-gray-500" />}
              <span className="text-xl font-semibold text-gray-900">
                {item.value} {item.unit && <span className="text-gray-400 text-sm">{item.unit}</span>}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Accordions */}
      <div className="space-y-4">
        {/* Mood History */}
        {chartData.length > 0 && (
          <Accordion title={t("profile_mood_history")}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#E5E7EB" }} />
                <YAxis domain={[1, 5]} ticks={[1,2,3,4,5]} tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#E5E7EB" }} width={35} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB" }} />
                <Line type="monotone" dataKey="mood" stroke="#4F46E5" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Accordion>
        )}

        {/* AI Assessment */}
        {analysis && (
          <Accordion title={t("profile_ai_assessment")}>
            {analysis.ai_assessment ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full font-medium text-xs capitalize ${RISK_STYLE[analysis.ai_assessment.risk_level]}`}>
                    {analysis.ai_assessment.risk_level} risk
                  </span>
                  <span className="text-xs text-gray-500">
                    Confidence: {Math.round(analysis.ai_assessment.confidence * 100)}%
                  </span>
                </div>
                <p className="text-sm text-gray-700">{analysis.ai_assessment.signal_summary}</p>
                {analysis.ai_assessment.primary_concerns?.length > 0 && (
                  <ul className="space-y-1">
                    {analysis.ai_assessment.primary_concerns.map((c, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <AlertTriangle size={14} className="text-gray-300" />
                        {c}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">{t("profile_ai_unavailable")}</p>
            )}
          </Accordion>
        )}

        {/* Conversation Starters */}
        <Accordion title={t("profile_starters")} button={<MessageCircle />}>
          <div className="flex flex-wrap gap-3">
            {starters?.starters ? (
              starters.starters.map((s, i) => (
                <div key={i} className="bg-indigo-50 px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition">
                  <p className="text-sm text-indigo-900">{s.nepali}</p>
                  <p className="text-xs text-indigo-700 mt-1">{s.english}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">{t("profile_starters_hint")}</p>
            )}
          </div>
        </Accordion>

        {/* Recent Check-ins */}
        <Accordion title={t("profile_recent_checkins")}>
          <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
            {checkins.slice().reverse().slice(0, 10).map((c) => (
              <div key={c.id} className="p-3 bg-gray-50 rounded-xl flex justify-between items-center hover:bg-gray-100 transition">
                <div>
                  <div className="flex gap-4 text-sm text-gray-700">
                    <span>Mood: {c.mood}/5</span>
                    <span className="text-xs text-gray-400">Energy: {c.energy}</span>
                  </div>
                  {c.note && <p className="text-sm text-gray-500 mt-1">{c.note}</p>}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{c.date}</span>
              </div>
            ))}
          </div>
        </Accordion>

        {/* Observations */}
        {observations.length > 0 && (
          <Accordion title={t("profile_observations")}>
            <div className="flex flex-col gap-3">
              {observations.map((o) => (
                <div key={o.id} className="p-3 bg-gray-50 rounded-xl hover:shadow-sm transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{o.teacher}</span>
                    <span className="text-xs text-gray-400">{o.date}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {o.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                        {t(TAG_LABELS[tag]) || tag}
                      </span>
                    ))}
                  </div>
                  {o.note && <p className="text-sm text-gray-500">{o.note}</p>}
                </div>
              ))}
            </div>
          </Accordion>
        )}

        {/* Interventions */}
        {interventions.length > 0 && (
          <Accordion title={t("profile_interventions")}>
            <div className="flex flex-col gap-3">
              {interventions.map((i) => (
                <div key={i.id} className="p-3 bg-gray-50 rounded-xl hover:shadow-sm transition">
                  <div className="flex items-center gap-3 mb-1 text-sm text-gray-700">
                    <span>{i.counselor}</span>
                    <span className="text-xs text-gray-400">{i.date}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${i.status === "in_progress" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                      {i.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{i.note}</p>
                </div>
              ))}
            </div>
          </Accordion>
        )}
      </div>
    </div>
  );
}