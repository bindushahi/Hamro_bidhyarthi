import { useEffect, useState } from "react";
import { getStudents, submitObservation } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { Check, ChevronDown } from "lucide-react";

const TAGS = [
  { id: "grade_drop", label: "Grade drop" },
  { id: "distracted", label: "Distracted" },
  { id: "withdrawn", label: "Withdrawn" },
  { id: "absent", label: "Absent" },
  { id: "aggressive", label: "Aggressive" },
  { id: "tearful", label: "Tearful" },
  { id: "isolated", label: "Isolated" },
  { id: "disruptive", label: "Disruptive" },
];

export default function Observe() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      <div className="max-w-md mx-auto pt-16 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Check size={24} strokeWidth={2} className="text-gray-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Observation recorded</h2>
        <p className="text-sm text-gray-400">Thank you for looking out for your students</p>
        <button
          onClick={handleReset}
          className="mt-8 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Log another observation
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Log Observation</h1>
        <p className="text-sm text-gray-400 mt-0.5">Record behavioral observations for a student</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Student</label>
          <div className="relative">
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-gray-400 bg-white"
            >
              <option value="">Select a student</option>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">What did you notice?</label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedTags.includes(tag.id)
                    ? "bg-gray-900 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Additional notes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Any context that might help..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={!studentId || selectedTags.length === 0 || submitting}
          className="w-full px-4 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "Submitting..." : "Submit observation"}
        </button>
      </form>
    </div>
  );
}
