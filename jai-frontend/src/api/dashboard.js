// Dashboard-specific API calls, added alongside the existing client.

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

async function request(path) {
  const res = await fetch(`${API_URL}${path}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export function getDashboard() {
  return request("/api/dashboard");
}

export function getHistory(limit = 20) {
  return request(`/api/history?limit=${limit}`);
}
