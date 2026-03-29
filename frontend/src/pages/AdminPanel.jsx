import { useEffect, useState } from "react";
import {
  getPendingUsers, getAllUsers, approveUser, rejectUser,
  getClasses, assignClass,
} from "../api";
import { Check, X, UserPlus, ChevronDown } from "lucide-react";

export default function AdminPanel() {
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningFor, setAssigningFor] = useState(null);
  const [selectedClass, setSelectedClass] = useState("");

  function refresh() {
    Promise.all([getPendingUsers(), getAllUsers(), getClasses()])
      .then(([p, u, c]) => { setPending(p); setUsers(u); setClasses(c); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { refresh(); }, []);

  async function handleApprove(userId) {
    await approveUser(userId);
    refresh();
  }

  async function handleReject(userId) {
    await rejectUser(userId);
    refresh();
  }

  async function handleAssign(userId) {
    if (!selectedClass) return;
    await assignClass(userId, selectedClass);
    setAssigningFor(null);
    setSelectedClass("");
    refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <p className="text-gray-400 animate-pulse text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center bg-white min-h-screen p-8">
      <div className="w-full max-w-7xl space-y-12">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-extrabold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2 text-lg">Manage users, approvals, and class assignments</p>
        </div>

        {/* Pending Approval Section */}
        {pending.length > 0 && (
          <div className="animate-fadeIn space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
              <UserPlus size={28} className="text-green-400 animate-bounce" />
              Pending Approvals ({pending.length})
            </h2>
            <div className="flex flex-wrap justify-center -m-4">
              {pending.map((u, i) => (
                <div
                  key={u.id}
                  className="p-6 m-4 bg-white rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-3 hover:scale-105 transition-all duration-300 border-l-4 border-green-400 w-80 animate-pop"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <p className="text-lg font-semibold text-gray-900">{u.full_name}</p>
                  <p className="text-sm text-gray-500 mb-4">{u.email} &middot; wants to be <span className="capitalize">{u.role}</span></p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(u.id)}
                      className="flex-1 px-4 py-2 text-white font-bold rounded-2xl bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-1"
                    >
                      <Check size={16} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(u.id)}
                      className="flex-1 px-4 py-2 text-white font-bold rounded-2xl bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-1"
                    >
                      <X size={16} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Staff Section */}
        <div className="animate-fadeIn space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">All Staff</h2>
          <div className="flex flex-wrap justify-center -m-4">
            {users.map((u, i) => (
              <div
                key={u.id}
                className="p-6 m-4 bg-white rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-3 hover:scale-105 transition-all border-l-4 border-green-400 w-80 animate-pop"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <p className="text-lg font-semibold text-gray-900">{u.full_name}</p>
                <p className="text-sm text-gray-500">{u.email}</p>
                <p className="capitalize text-gray-600 mb-2">{u.role}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                  u.status === "approved"
                    ? "bg-gradient-to-r from-green-200 to-green-300 text-green-800"
                    : u.status === "pending"
                    ? "bg-gradient-to-r from-yellow-200 to-yellow-300 text-yellow-800"
                    : "bg-gradient-to-r from-red-200 to-red-300 text-red-800"
                }`}>
                  {u.status}
                </span>
                <p className="text-gray-500 mb-4">
                  {u.role === "teacher"
                    ? (u.assigned_classes?.length > 0 ? u.assigned_classes.map((c) => c.replace("cls-", "")).join(", ") : "None")
                    : "All"}
                </p>
                {u.role === "teacher" && u.status === "approved" && (
                  assigningFor === u.id ? (
                    <div className="flex gap-2">
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="flex-1 pl-3 pr-6 py-1 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-300 transition-all"
                      >
                        <option value="">Pick class</option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>{c.grade}{c.section}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssign(u.id)}
                        disabled={!selectedClass}
                        className="px-4 py-1 text-sm font-bold rounded-2xl bg-gradient-to-r from-green-800 to-green-900 text-white disabled:opacity-50 hover:from-green-700 hover:to-green-800 transition-all"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => setAssigningFor(null)}
                        className="px-2 py-1 text-gray-400 hover:text-gray-600 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAssigningFor(u.id)}
                      className="px-3 py-1 text-sm text-green-500 font-semibold hover:text-green-700 hover:underline transition-all"
                    >
                      + Assign class
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.6s ease forwards;
          opacity: 0;
        }
        .animate-pop {
          animation: popIn 0.5s ease forwards;
          opacity: 0;
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
        @keyframes popIn {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}