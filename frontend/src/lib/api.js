/**
 * NagDrishti AI — Production API Service Layer
 * Connects Next.js frontend to Django REST Framework backend with full Token & Session auth support.
 */

export const getApiBase = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return "https://nagdrishti-ai-backend.onrender.com";
  }
  return "http://localhost:8000";
};

export const API_BASE = getApiBase();

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : null;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultHeaders = {};

  if (!(options.body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  // Attach token if stored from login
  if (typeof window !== "undefined") {
    const adminToken = localStorage.getItem("admin_token");
    if (adminToken) {
      defaultHeaders["Authorization"] = `Token ${adminToken}`;
    }
  }

  // Attach CSRF token for mutating requests if cookie exists
  const method = (options.method || "GET").toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrfToken = getCookie("csrftoken");
    if (csrfToken) {
      defaultHeaders["X-CSRFToken"] = csrfToken;
    }
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
      let errorMsg = `HTTP ${res.status}: ${res.statusText}`;
      if (data) {
        if (typeof data === "string") {
          errorMsg = data;
        } else if (data.error) {
          errorMsg = data.error;
        } else if (data.message) {
          errorMsg = data.message;
        } else if (data.detail) {
          errorMsg = data.detail;
        } else {
          errorMsg = JSON.stringify(data);
        }
      }
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
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
  const fromParam = `${Number(fromLat).toFixed(5)},${Number(fromLng).toFixed(5)}`;
  const toParam = `${Number(toLat).toFixed(5)},${Number(toLng).toFixed(5)}`;
  return request(`/api/route/?from=${fromParam}&to=${toParam}`);
}

// 3. Citizen Incident Reports & Hugging Face Vision AI
export async function getReports() {
  return request("/api/reports/");
}

export async function submitReport({ lat, lng, description, photoFile, is_anonymous }) {
  const formData = new FormData();
  if (lat !== undefined && lat !== null) formData.append("lat", lat.toString());
  if (lng !== undefined && lng !== null) formData.append("lng", lng.toString());
  if (description) formData.append("description", description);
  if (photoFile) formData.append("photo", photoFile);
  if (is_anonymous) formData.append("is_anonymous", "true");

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

// 5. Emergency Alert Logs & Broadcasts
export async function getBroadcastAlerts() {
  return request("/api/alerts/broadcast/");
}

export async function getAlertLogs() {
  return request("/api/alerts/");
}

// 5b. Live Weather Feed
export async function getWeather() {
  return request("/api/zones/weather/");
}

// 6. Rainfall Simulation (8-stage demo workflow)
export async function simulateRainfall(payload) {
  return request("/api/simulate-rainfall/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// 7. Auth (Admin Session + Token)
export async function loginAdmin(username, password) {
  const res = await request("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  if (res && res.token && typeof window !== "undefined") {
    localStorage.setItem("admin_token", res.token);
  }
  return res;
}

export async function logoutAdmin() {
  try {
    await request("/api/auth/logout/", {
      method: "POST",
    });
  } finally {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_token");
    }
  }
}

export async function getCurrentUser() {
  return request("/api/auth/me/");
}

// 8. Health Check
export async function checkBackendHealth() {
  return request("/api/health/");
}
