import { useEffect, useState } from "react";
import { getStudents, submitObservation } from "../api";
import { useLanguage } from "../i18n";
import { useAuth } from "../contexts/AuthContext";
import { Check } from "lucide-react";

const TAGS = [
  { id: "grade_drop", labelKey: "tag_grade_drop" },
  { id: "distracted", labelKey: "tag_distracted" },
  { id: "withdrawn", labelKey: "tag_withdrawn" },
  { id: "absent", labelKey: "tag_absent" },
  { id: "aggressive", labelKey: "tag_aggressive" },
  { id: "tearful", labelKey: "tag_tearful" },
  { id: "isolated", labelKey: "tag_isolated" },
  { id: "disruptive", labelKey: "tag_disruptive" },
];

export default function Observe() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    getStudents().then(setStudents).catch(console.error);
  }, []);

  function toggleTag(tagId) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!studentId || selectedTags.length === 0) return;
    setSubmitting(true);
    try {
      await submitObservation({
        student_id: studentId,
        teacher: user?.full_name || "",
        tags: selectedTags,
        note,
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setStudentId("");
    setSelectedTags([]);
    setNote("");
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-start py-20 px-4 overflow-y-auto bg-white/10">
        {/* Glass card */}
        <div className="relative w-full max-w-md p-8 bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 text-center animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
            <Check size={28} strokeWidth={2} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {t("obs_recorded") || "Observation recorded!"}
          </h2>
          <p className="text-gray-600 mb-6">
            {t("obs_thanks") || "Thank you for submitting your observation."}
          </p>
          <button
            onClick={handleReset}
            className="px-6 py-3 font-medium text-white rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
          >
            {t("obs_another") || "Record another observation"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start py-16 px-4 overflow-y-auto bg-white/10">
      {/* Glass card */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-lg p-8 bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 space-y-6 animate-slideUp"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("obs_title") || "Student Observation"}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("obs_subtitle") || "Record what you noticed about a student today"}
          </p>
        </div>

        {/* Student Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t("obs_student_label") || "Student"}
          </label>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-purple-400 hover:shadow-md transition-all bg-white"
          >
            <option value="">{t("obs_select_student") || "Select a student"}</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {t("th_class")} {s.class}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("obs_what_noticed") || "What did you notice?"}
          </label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all transform hover:-translate-y-0.5 ${
                  selectedTags.includes(tag.id)
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
                    : "bg-white border border-gray-300 text-gray-600 hover:border-gray-400 hover:shadow-sm"
                }`}
              >
                {t(tag.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t("obs_notes_label") || "Notes"}{" "}
            <span className="text-gray-400 font-normal">
              {t("obs_notes_optional") || "(optional)"}
            </span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder={t("obs_notes_placeholder") || "Any additional comments..."}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200 resize-none hover:shadow-md transition-all"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!studentId || selectedTags.length === 0 || submitting}
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {submitting ? t("submitting") || "Submitting..." : t("obs_submit") || "Submit Observation"}
        </button>
      </form>
    </div>
  );
}