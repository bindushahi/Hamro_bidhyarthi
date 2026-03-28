const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

export const getStudents = () => request("/students");
export const getStudent = (id) => request(`/students/${id}`);
export const getStudentCheckins = (id, days = 14) =>
  request(`/students/${id}/checkins?days=${days}`);

export const submitCheckin = (data) =>
  request("/checkins", { method: "POST", body: JSON.stringify(data) });

export const getObservations = (studentId) =>
  request(`/observations/${studentId}`);
export const submitObservation = (data) =>
  request("/observations", { method: "POST", body: JSON.stringify(data) });

export const getInterventions = (studentId) =>
  request(`/interventions/${studentId}`);
export const submitIntervention = (data) =>
  request("/interventions", { method: "POST", body: JSON.stringify(data) });

export const getWatchlist = () => request("/watchlist");

export const analyzeRisk = (studentId) =>
  request(`/analyze/risk/${studentId}`, { method: "POST" });
export const getConversationStarters = (studentId) =>
  request(`/generate/conversation-starters/${studentId}`, { method: "POST" });
export const getCreativeTask = (studentId) =>
  request(`/generate/creative-task/${studentId}`, { method: "POST" });
export const getBuddy = (studentId) =>
  request(`/buddies/${studentId}`);

export const getCrisisAlerts = () => request("/crisis-alerts");
export const acknowledgeCrisisAlert = (alertId) =>
  request(`/crisis-alerts/${alertId}/acknowledge`, { method: "POST" });

export const pollDashboard = () => request("/dashboard/poll");
