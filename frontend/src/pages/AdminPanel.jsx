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
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage users, approvals, and class assignments
        </p>
      </div>

      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <UserPlus size={14} className="text-amber-500" />
            Pending Approval ({pending.length})
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
            {pending.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{u.full_name}</p>
                  <p className="text-xs text-gray-400">{u.email} &middot; wants to be <span className="capitalize">{u.role}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(u.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-md hover:bg-emerald-100 transition-colors"
                  >
                    <Check size={12} /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(u.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                  >
                    <X size={12} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-medium text-gray-900 mb-3">All Staff</h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400">Name</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400">Email</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400">Role</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400">Status</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400">Assigned Class</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.full_name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{u.role}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                      u.status === "approved" ? "bg-emerald-50 text-emerald-700"
                      : u.status === "pending" ? "bg-amber-50 text-amber-700"
                      : "bg-red-50 text-red-700"
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {u.role === "teacher" ? (
                      u.assigned_classes?.length > 0
                        ? u.assigned_classes.map((c) => c.replace("cls-", "")).join(", ")
                        : <span className="text-gray-300">None</span>
                    ) : (
                      <span className="text-gray-300">All</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.role === "teacher" && u.status === "approved" && (
                      assigningFor === u.id ? (
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <select
                              value={selectedClass}
                              onChange={(e) => setSelectedClass(e.target.value)}
                              className="appearance-none pl-2 pr-6 py-1 border border-gray-200 rounded text-xs bg-white focus:outline-none focus:border-gray-400"
                            >
                              <option value="">Pick class</option>
                              {classes.map((c) => (
                                <option key={c.id} value={c.id}>{c.grade}{c.section}</option>
                              ))}
                            </select>
                            <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>
                          <button
                            onClick={() => handleAssign(u.id)}
                            disabled={!selectedClass}
                            className="px-2 py-1 text-xs font-medium bg-gray-900 text-white rounded disabled:opacity-40"
                          >
                            Assign
                          </button>
                          <button onClick={() => setAssigningFor(null)} className="text-xs text-gray-400 hover:text-gray-600">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssigningFor(u.id)}
                          className="text-xs text-gray-500 hover:text-gray-700 hover:underline"
                        >
                          + Assign class
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
