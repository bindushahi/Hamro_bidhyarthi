import { useState } from "react";
import { submitCheckin } from "../api";
import { useLanguage } from "../i18n";
import { Check } from "lucide-react";

export default function CheckIn({ studentId }) {
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { t } = useLanguage();

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

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await submitCheckin({
        student_id: studentId,
        mood,
        energy,
        note,
      });
      setStep(3);
    } catch (err) {
      console.error("Check-in failed:", err);
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setStep(0);
    setMood(null);
    setEnergy(null);
    setNote("");
  }

  return (
    <div className="max-w-sm mx-auto pt-6">
      <div className="flex items-center justify-center gap-2 mb-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i <= step ? "w-8 bg-gray-900" : "w-4 bg-gray-200"
            }`}
          />
        ))}
      </div>

      {step === 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 text-center mb-1">
            {t("checkin_mood_title")}
          </h2>
          <p className="text-sm text-gray-400 text-center mb-6">
            {t("checkin_mood_subtitle")}
          </p>
          <div className="space-y-1.5">
            {MOODS.map((m) => (
              <button
                key={m.value}
                onClick={() => {
                  setMood(m.value);
                  setTimeout(() => setStep(1), 200);
                }}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm font-medium text-left transition-all ${
                  mood === m.value
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                {t(m.labelKey)}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 text-center mb-1">
            {t("checkin_energy_title")}
          </h2>
          <p className="text-sm text-gray-400 text-center mb-6">
            {t("checkin_energy_subtitle")}
          </p>
          <div className="space-y-1.5">
            {ENERGY.map((e) => (
              <button
                key={e.value}
                onClick={() => {
                  setEnergy(e.value);
                  setTimeout(() => setStep(2), 200);
                }}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm font-medium text-left transition-all ${
                  energy === e.value
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                {t(e.labelKey)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(0)}
            className="mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            &larr; {t("back")}
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 text-center mb-1">
            {t("checkin_note_title")}
          </h2>
          <p className="text-sm text-gray-400 text-center mb-6">
            {t("checkin_note_subtitle")}
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Write here..."
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 resize-none"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full mt-3 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {submitting ? t("submitting") : t("checkin_submit")}
          </button>
          <button
            onClick={() => setStep(1)}
            className="w-full mt-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            &larr; {t("back")}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="text-center pt-6">
          <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Check size={22} strokeWidth={2} className="text-gray-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-0.5">
            {t("checkin_thanks")}
          </h2>
          <p className="text-sm text-gray-400">
            {t("checkin_recorded")}
          </p>
          <button
            onClick={handleReset}
            className="mt-6 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            {t("checkin_again")}
          </button>
        </div>
      )}
    </div>
  );
}
