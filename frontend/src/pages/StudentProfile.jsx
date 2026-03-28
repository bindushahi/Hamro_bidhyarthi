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
  low: "bg-emerald-50 text-emerald-700",
  moderate: "bg-amber-50 text-amber-700",
  high: "bg-red-50 text-red-700",
  crisis: "bg-red-100 text-red-800",
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
    <div>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        {t("profile_back")}
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {student.name}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {t("th_class")} {student.class} &middot; Age {student.age}
          </p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={loadingAI}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {loadingAI && <Loader2 size={14} className="animate-spin" />}
          {loadingAI ? t("profile_analyzing") : t("profile_run_ai")}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">{t("profile_avg_mood")}</p>
          <p className="text-2xl font-semibold text-gray-900">
            {avgRecent}
            <span className="text-gray-300 text-base font-normal"> / 5</span>
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">{t("profile_trend")}</p>
          <div className="flex items-center gap-2">
            <TrendIcon size={20} className="text-gray-500" />
            <span className="text-sm text-gray-700">
              {TrendIcon === TrendingDown
                ? t("trend_declining")
                : TrendIcon === TrendingUp
                  ? t("trend_improving")
                  : t("trend_stable")}
            </span>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">{t("profile_checkins_14d")}</p>
          <p className="text-2xl font-semibold text-gray-900">
            {checkins.length}
          </p>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-8">
          <h2 className="text-sm font-medium text-gray-900 mb-4">
            {t("profile_mood_history")}
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={{ stroke: "#E5E7EB" }}
                tickLine={false}
              />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={{ stroke: "#E5E7EB" }}
                tickLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #E5E7EB",
                  boxShadow: "none",
                }}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#111827"
                strokeWidth={2}
                dot={{ fill: "#111827", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {analysis && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-8">
          <h2 className="text-sm font-medium text-gray-900 mb-4">
            {t("profile_ai_assessment")}
          </h2>

          {analysis.ai_assessment ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                    RISK_STYLE[analysis.ai_assessment.risk_level] ||
                    "bg-gray-100 text-gray-500"
                  }`}
                >
                  {analysis.ai_assessment.risk_level} risk
                </span>
                <span className="text-xs text-gray-400">
                  Confidence:{" "}
                  {Math.round(analysis.ai_assessment.confidence * 100)}%
                </span>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed">
                {analysis.ai_assessment.signal_summary}
              </p>

              {analysis.ai_assessment.primary_concerns?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-2">
                    {t("profile_concerns")}
                  </p>
                  <ul className="space-y-1">
                    {analysis.ai_assessment.primary_concerns.map((c, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <AlertTriangle
                          size={14}
                          className="text-gray-300 mt-0.5 shrink-0"
                        />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-400 mb-1">
                  {t("profile_recommended")}
                </p>
                <p className="text-sm text-gray-700">
                  {analysis.ai_assessment.recommended_action}
                </p>
              </div>

              {analysis.ai_assessment.reasoning && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-400 mb-1">
                    {t("profile_reasoning")}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {analysis.ai_assessment.reasoning}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                {t("profile_ai_unavailable")}
              </p>
              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                    RISK_STYLE[analysis.rule_based?.risk_level] ||
                    "bg-gray-100 text-gray-500"
                  }`}
                >
                  {analysis.rule_based?.risk_level} risk
                </span>
              </div>
              {analysis.rule_based?.concerns?.length > 0 && (
                <ul className="space-y-1">
                  {analysis.rule_based.concerns.map((c, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <AlertTriangle
                        size={14}
                        className="text-gray-300 mt-0.5 shrink-0"
                      />
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-900">
            {t("profile_starters")}
          </h2>
          <button
            onClick={loadStarters}
            disabled={loadingStarters}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <MessageCircle size={14} />
            {loadingStarters ? t("profile_generating") : t("profile_generate")}
          </button>
        </div>
        {starters?.starters ? (
          <div className="space-y-3">
            {starters.starters.map((s, i) => (
              <div
                key={i}
                className="p-3 bg-gray-50 rounded-lg"
              >
                <p className="text-sm text-gray-900">{s.nepali}</p>
                <p className="text-xs text-gray-500 mt-1">{s.english}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            {t("profile_starters_hint")}
          </p>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-8">
        <h2 className="text-sm font-medium text-gray-900 mb-4">
          {t("profile_recent_checkins")}
        </h2>
        <div className="space-y-2">
          {checkins
            .slice()
            .reverse()
            .slice(0, 10)
            .map((c) => (
              <div
                key={c.id}
                className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700">
                      Mood: {c.mood}/5
                    </span>
                    <span className="text-xs text-gray-400">
                      Energy: {c.energy}
                    </span>
                  </div>
                  {c.note && (
                    <p className="text-sm text-gray-500 mt-1">{c.note}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                  {c.date}
                </span>
              </div>
            ))}
        </div>
      </div>

      {observations.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-8">
          <h2 className="text-sm font-medium text-gray-900 mb-4">
            {t("profile_observations")}
          </h2>
          <div className="space-y-3">
            {observations.map((o) => (
              <div key={o.id} className="py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {o.teacher}
                  </span>
                  <span className="text-xs text-gray-400">{o.date}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {o.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                    >
                      {t(TAG_LABELS[tag]) || tag}
                    </span>
                  ))}
                </div>
                {o.note && (
                  <p className="text-sm text-gray-500">{o.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {interventions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-sm font-medium text-gray-900 mb-4">
            {t("profile_interventions")}
          </h2>
          <div className="space-y-3">
            {interventions.map((i) => (
              <div key={i.id} className="py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {i.counselor}
                  </span>
                  <span className="text-xs text-gray-400">{i.date}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      i.status === "in_progress"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {i.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{i.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
