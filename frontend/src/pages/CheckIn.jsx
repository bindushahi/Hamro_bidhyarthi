import { useState, useEffect } from "react";
import { getStudents, submitCheckin } from "../api";
import { useLanguage } from "../i18n";
import { Check, ChevronDown } from "lucide-react";

const MOODS = [
  { value: 1, labelKey: "mood_1" },
  { value: 2, labelKey: "mood_2" },
  { value: 3, labelKey: "mood_3" },
  { value: 4, labelKey: "mood_4" },
  { value: 5, labelKey: "mood_5" },
];

const ENERGY = [
  { value: "low", labelKey: "energy_low" },
  { value: "medium", labelKey: "energy_medium" },
  { value: "high", labelKey: "energy_high" },
];

export default function CheckIn() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const { t } = useLanguage();

  useEffect(() => {
    getStudents().then(setStudents).catch(console.error);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!studentId || !mood || !energy) return;
    setSubmitting(true);
    setError("");
    try {
      await submitCheckin({ student_id: studentId, mood, energy, note });
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setStudentId("");
    setMood(null);
    setEnergy(null);
    setNote("");
    setSubmitted(false);
    setError("");
  }

  if (submitted) {
    const name = students.find((s) => s.id === studentId)?.name || "Student";
    return (
      <div className="max-w-md mx-auto pt-16 text-center">
        <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
          <Check size={22} strokeWidth={2} className="text-gray-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-0.5">
          {t("checkin_thanks") || `Check-in recorded for ${name}`}
        </h2>
        <p className="text-sm text-gray-400">
          {t("checkin_recorded") || "Response has been saved"}
        </p>
        <button
          onClick={handleReset}
          className="mt-6 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {t("checkin_again") || "Check in another student"}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          {t("checkin_mood_title") || "Student Check-in"}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {t("checkin_mood_subtitle") || "Record a student's mood, energy, and notes"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t("obs_student_label") || "Student"}
          </label>
          <div className="relative">
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-gray-400 bg-white"
            >
              <option value="">{t("obs_select_student") || "Select a student"}</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.class}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("checkin_mood_title") || "Mood"}
          </label>
          <div className="flex gap-2">
            {MOODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(m.value)}
                className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-colors ${
                  mood === m.value
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                {t(m.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("checkin_energy_title") || "Energy"}
          </label>
          <div className="flex gap-2">
            {ENERGY.map((e) => (
              <button
                key={e.value}
                type="button"
                onClick={() => setEnergy(e.value)}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  energy === e.value
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                {t(e.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t("checkin_note_title") || "Notes"}{" "}
            <span className="text-gray-400 font-normal">({t("obs_notes_optional") || "optional"})</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder={t("obs_notes_placeholder") || "Any observations or student comments..."}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={!studentId || !mood || !energy || submitting}
          className="w-full px-4 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? t("submitting") : t("checkin_submit") || "Submit check-in"}
        </button>
      </form>
    </div>
  );
}
