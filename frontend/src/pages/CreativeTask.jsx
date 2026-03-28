import { useEffect, useState } from "react";
import { getStudent, getBuddy, getCreativeTask } from "../api";
import { useLanguage } from "../i18n";
import { Lightbulb, RefreshCw, Sparkles, Users, Package } from "lucide-react";

const CATEGORY_STYLE = {
  art: { bg: "bg-rose-50", text: "text-rose-600" },
  writing: { bg: "bg-violet-50", text: "text-violet-600" },
  science: { bg: "bg-cyan-50", text: "text-cyan-600" },
  music: { bg: "bg-amber-50", text: "text-amber-600" },
  craft: { bg: "bg-orange-50", text: "text-orange-600" },
  social: { bg: "bg-emerald-50", text: "text-emerald-600" },
  puzzle: { bg: "bg-indigo-50", text: "text-indigo-600" },
  nature: { bg: "bg-green-50", text: "text-green-600" },
  tech: { bg: "bg-sky-50", text: "text-sky-600" },
};

const CATEGORY_LABEL = {
  art: "Art", writing: "Writing", science: "Science", music: "Music",
  craft: "Craft", social: "Social", puzzle: "Puzzle", nature: "Nature",
  tech: "Technology",
};

function initials(name) {
  return name.split(" ").map((n) => n[0]).join("");
}

export default function CreativeTask({ studentId }) {
  const [student, setStudent] = useState(null);
  const [buddy, setBuddy] = useState(null);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingTask, setLoadingTask] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (!studentId) return;
    Promise.all([
      getStudent(studentId),
      getBuddy(studentId).catch(() => null),
    ])
      .then(([s, b]) => {
        setStudent(s);
        setBuddy(b?.buddy || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [studentId]);

  async function loadNewTask() {
    setLoadingTask(true);
    try {
      const result = await getCreativeTask(studentId);
      setTask(result);
    } catch (err) {
      console.error("Creative task failed:", err);
    } finally {
      setLoadingTask(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400">{t("loading")}</p>
      </div>
    );
  }

  const catStyle = task ? (CATEGORY_STYLE[task.category] || { bg: "bg-gray-50", text: "text-gray-600" }) : null;

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">{t("creative_title")}</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {t("creative_subtitle")}
        </p>
      </div>

      {buddy && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex items-center gap-4">
          <div className="flex -space-x-2">
            <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold ring-2 ring-white">
              {student ? initials(student.name) : "?"}
            </div>
            <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-semibold ring-2 ring-white">
              {initials(buddy.name)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              You & {buddy.name}
            </p>
            <p className="text-xs text-gray-400">
              {t("th_class")} {buddy.class} &middot; Buddy pair
            </p>
          </div>
          <Users size={16} className="text-gray-300 shrink-0" />
        </div>
      )}

      {student && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
            <p className="text-[11px] text-gray-400 font-medium mb-1.5">{t("creative_your_interests")}</p>
            <div className="flex flex-wrap gap-1">
              {(student.interests || []).map((i) => (
                <span key={i} className="px-2 py-0.5 text-xs bg-gray-50 text-gray-600 rounded-full">
                  {i}
                </span>
              ))}
            </div>
          </div>
          {buddy && (
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
              <p className="text-[11px] text-gray-400 font-medium mb-1.5">{buddy.name.split(" ")[0]}'s interests</p>
              <div className="flex flex-wrap gap-1">
                {(buddy.interests || []).map((i) => (
                  <span key={i} className="px-2 py-0.5 text-xs bg-gray-50 text-gray-600 rounded-full">
                    {i}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-900">
            {t("creative_this_week")}
          </h2>
          <button
            onClick={loadNewTask}
            disabled={loadingTask}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={11} className={loadingTask ? "animate-spin" : ""} />
            {loadingTask ? t("profile_generating") : t("creative_new_task")}
          </button>
        </div>

        {task ? (
          <div>
            <div className="px-4 pt-3 pb-1">
              <span className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded-full ${catStyle.bg} ${catStyle.text}`}>
                {CATEGORY_LABEL[task.category] || task.category}
              </span>
            </div>

            <div className="px-4 py-3">
              <p className="text-sm text-gray-900 leading-relaxed">{task.task_np}</p>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{task.task_en}</p>
            </div>

            {task.why_this_pair && (
              <div className="mx-4 mb-3 flex items-start gap-2 px-3 py-2 bg-gray-50 rounded-md">
                <Sparkles size={12} className="text-gray-400 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-500">{task.why_this_pair}</p>
              </div>
            )}

            {task.materials_needed?.length > 0 && (
              <div className="px-4 pb-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Package size={12} className="text-gray-400" />
                  <p className="text-[11px] text-gray-400 font-medium">{t("creative_youll_need")}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {task.materials_needed.map((m, i) => (
                    <span key={i} className="px-2 py-0.5 text-xs text-gray-600 bg-gray-50 rounded-full">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {task.bonus_challenge && (
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                <p className="text-[11px] text-gray-400 font-medium mb-0.5">{t("creative_bonus")}</p>
                <p className="text-sm text-gray-600">{task.bonus_challenge}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center px-6 py-10">
            <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Lightbulb size={20} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mb-1">
              {t("creative_ready")}{buddy ? ` with ${buddy.name.split(" ")[0]}` : ""}?
            </p>
            <p className="text-xs text-gray-400 mb-5">
              {t("creative_pick_activity")}
            </p>
            <button
              onClick={loadNewTask}
              disabled={loadingTask}
              className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {loadingTask ? t("profile_generating") : t("creative_get_task")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
