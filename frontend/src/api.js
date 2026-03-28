const BASE = "/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { headers, ...options });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `API ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export const registerUser = (data) =>
  request("/auth/register", { method: "POST", body: JSON.stringify(data) });

export const loginUser = (data) =>
  request("/auth/login", { method: "POST", body: JSON.stringify(data) });

export const verifyOtp = (data) =>
  request("/auth/verify-otp", { method: "POST", body: JSON.stringify(data) });

export const requestElevate = () =>
  request("/auth/request-elevate", { method: "POST" });

export const verifyElevate = (otp) =>
  request("/auth/verify-elevate", { method: "POST", body: JSON.stringify({ otp }) });

export const getMe = () => request("/auth/me");

export const getPendingUsers = () => request("/admin/pending");
export const getAllUsers = () => request("/admin/users");
export const approveUser = (userId) =>
  request(`/admin/approve/${userId}`, { method: "POST", body: JSON.stringify({ school_id: "school-1" }) });
export const rejectUser = (userId) =>
  request(`/admin/reject/${userId}`, { method: "POST" });
export const getClasses = () => request("/admin/classes");
export const assignClass = (userId, classId) =>
  request("/admin/assign-class", { method: "POST", body: JSON.stringify({ user_id: userId, class_id: classId }) });

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

export const getSchoolAnalytics = () => request("/analytics/school");
export const getClassAnalytics = () => request("/analytics/by-class");
