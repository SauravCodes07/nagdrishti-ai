/**
 * NagDrishti AI — Production API Service Layer
 * Connects Next.js frontend to Django REST Framework backend.
 */

const getApiBase = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return "https://nagdrishti-ai-backend.onrender.com";
  }
  return "http://localhost:8000";
};

const API_BASE = getApiBase();

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultHeaders = {};

  if (!(options.body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: options.credentials || "include",
    cache: "no-store",
  };

  try {
    const res = await fetch(url, config);
    const contentType = res.headers.get("content-type");
    let data = null;
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const errorMsg =
        (data && (data.error || data.detail || (typeof data === "object" ? JSON.stringify(data) : data))) ||
        `HTTP ${res.status}: ${res.statusText}`;
      throw new Error(errorMsg);
    }
    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

// 1. Zones & Risk
export async function getRiskZones() {
  return request("/api/zones/risk/");
}

export async function updateDispatchStatus(zoneId, dispatchStatus) {
  return request(`/api/zones/${zoneId}/dispatch/`, {
    method: "PATCH",
    body: JSON.stringify({ dispatch_status: dispatchStatus }),
  });
}

// 2. Safe Routing (OSMnx + NetworkX + A*)
export async function getSafeRoute(fromLat, fromLng, toLat, toLng) {
  const fromParam = `${fromLat.toFixed(5)},${fromLng.toFixed(5)}`;
  const toParam = `${toLat.toFixed(5)},${toLng.toFixed(5)}`;
  return request(`/api/route/?from=${fromParam}&to=${toParam}`);
}

// 3. Citizen Incident Reports & Hugging Face Vision AI
export async function getReports() {
  return request("/api/reports/");
}

export async function submitReport({ lat, lng, description, photoFile }) {
  const formData = new FormData();
  if (lat !== undefined && lat !== null) formData.append("lat", lat.toString());
  if (lng !== undefined && lng !== null) formData.append("lng", lng.toString());
  if (description) formData.append("description", description);
  if (photoFile) formData.append("photo", photoFile);

  return request("/api/reports/", {
    method: "POST",
    body: formData,
  });
}

export async function verifyReport(reportId, verificationStatus) {
  return request(`/api/reports/${reportId}/verify/`, {
    method: "PATCH",
    body: JSON.stringify({ verification_status: verificationStatus }),
  });
}

// 4. Priority Queue (Admin)
export async function getPriorityQueue() {
  return request("/api/priority-queue/");
}

// 5. Emergency Alert Logs (Admin)
export async function getAlertLogs() {
  return request("/api/alerts/");
}

// 6. Rainfall Simulation (8-stage demo workflow)
export async function simulateRainfall(payload) {
  return request("/api/simulate-rainfall/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// 7. Auth (Admin Session)
export async function loginAdmin(username, password) {
  return request("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function logoutAdmin() {
  return request("/api/auth/logout/", {
    method: "POST",
  });
}

export async function getCurrentUser() {
  return request("/api/auth/me/");
}

// 8. Health Check
export async function checkBackendHealth() {
  return request("/api/health/");
}

export { API_BASE };
