/**
 * NagDrishti AI — Production API Service Layer
 * Connects Next.js frontend to Django REST Framework backend on Render with full Token & Session auth support.
 */

export const getApiBase = () => {
  // If running in browser on a production domain (e.g. netlify.app, custom domain, etc.)
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    if (
      process.env.NEXT_PUBLIC_API_URL &&
      !process.env.NEXT_PUBLIC_API_URL.includes("localhost") &&
      !process.env.NEXT_PUBLIC_API_URL.includes("127.0.0.1")
    ) {
      return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
    }
    return "https://nagdrishti-backend.onrender.com";
  }

  // If environment variable is explicitly provided
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }

  // Local development default
  return "http://localhost:8000";
};

export const API_BASE = getApiBase();

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : null;
}

const FALLBACK_URLS = [
  "https://nagdrishti-backend.onrender.com",
  "https://nagdrishti-ai-backend.onrender.com",
];

async function executeFetch(baseUrl, endpoint, options) {
  const url = `${baseUrl}${endpoint}`;
  const defaultHeaders = {};

  if (!(options.body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  // Attach token if stored from login (admin_token or nagdrishti_token)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token") || localStorage.getItem("nagdrishti_token");
    if (token) {
      defaultHeaders["Authorization"] = `Token ${token}`;
    }
  }

  // Attach CSRF token for mutating requests
  const method = (options.method || "GET").toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    let csrfToken = getCookie("csrftoken");
    if (!csrfToken && typeof window !== "undefined") {
      csrfToken = sessionStorage.getItem("nagdrishti_csrf");
    }
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

  let res;
  try {
    res = await fetch(url, config);
  } catch (netErr) {
    console.error(`[NagDrishti Diagnostic] Network/CORS Error: Failed to reach ${url}. Request aborted by browser. Check server status or CORS_ALLOWED_ORIGINS. Details:`, {
      endpoint,
      baseUrl,
      error: netErr.message,
      type: netErr.name,
    });
    throw netErr;
  }

  const contentType = res.headers.get("content-type");
  let data = null;

  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    console.warn(`[NagDrishti Diagnostic] Backend returned non-2xx response for [${method} ${endpoint}] (HTTP ${res.status}):`, {
      status: res.status,
      statusText: res.statusText,
      url,
      responseBody: data,
    });

    if (res.status === 401 || res.status === 403) {
      if (typeof window !== "undefined" && !endpoint.includes("/api/auth/login") && !endpoint.includes("/api/auth/signup") && !endpoint.includes("/api/auth/google")) {
        window.dispatchEvent(new CustomEvent("nagdrishti:session-expired", { detail: { status: res.status, endpoint } }));
      }
    }

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
    err.url = url;
    throw err;
  }
  return data;
}

async function request(endpoint, options = {}) {
  const primaryBase = getApiBase();
  
  try {
    return await executeFetch(primaryBase, endpoint, options);
  } catch (err) {
    // If network fetch failed and we might be on a sleeping Render instance or alternative Render domain
    if (err.name === "TypeError" || err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
      for (const fallback of FALLBACK_URLS) {
        if (fallback !== primaryBase) {
          try {
            console.info(`Retrying request on fallback endpoint: ${fallback}${endpoint}`);
            return await executeFetch(fallback, endpoint, options);
          } catch (_) {
            // continue to next fallback
          }
        }
      }
    }
    console.error(`API Error [${endpoint}]:`, err.message, { status: err.status, data: err.data });
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

// 7. Auth (Citizen & Admin Session + Token)
export async function getCsrfToken() {
  try {
    const res = await request("/api/auth/csrf/");
    if (res && res.csrftoken && typeof window !== "undefined") {
      sessionStorage.setItem("nagdrishti_csrf", res.csrftoken);
    }
    return res?.csrftoken;
  } catch {
    return null;
  }
}

export async function signupCitizen(username, password, email = "", name = "") {
  const res = await request("/api/auth/signup/", {
    method: "POST",
    body: JSON.stringify({ username, password, email, name }),
  });
  if (res && res.token && typeof window !== "undefined") {
    localStorage.setItem("nagdrishti_token", res.token);
    if (res.user?.role === "admin" || res.user?.is_staff) {
      localStorage.setItem("admin_token", res.token);
    }
  }
  return res;
}

export async function loginUser(username, password, requireAdmin = false) {
  const res = await request("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({ username, password, require_admin: requireAdmin }),
  });
  if (res && res.token && typeof window !== "undefined") {
    localStorage.setItem("nagdrishti_token", res.token);
    if (res.user?.role === "admin" || res.user?.is_staff) {
      localStorage.setItem("admin_token", res.token);
    }
  }
  return res;
}

export async function loginAdmin(username, password) {
  return loginUser(username, password, true);
}

export async function loginWithGoogle(credential, requireAdmin = false) {
  const res = await request("/api/auth/google/", {
    method: "POST",
    body: JSON.stringify({ credential, require_admin: requireAdmin }),
  });
  if (res && res.token && typeof window !== "undefined") {
    localStorage.setItem("nagdrishti_token", res.token);
    if (res.user?.role === "admin" || res.user?.is_staff) {
      localStorage.setItem("admin_token", res.token);
    }
  }
  return res;
}

export async function logoutUser() {
  try {
    await request("/api/auth/logout/", {
      method: "POST",
    });
  } finally {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("nagdrishti_token");
    }
  }
}

export async function logoutAdmin() {
  return logoutUser();
}

export async function getCurrentUser() {
  try {
    return await request("/api/auth/me/");
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("nagdrishti:session-expired"));
      }
    }
    return { authenticated: false, user: null };
  }
}

// 8. Health Check
export async function checkBackendHealth() {
  return request("/api/health/");
}

// 9. Admin Command Desk Aggregated Services
export async function getAdminOverview() {
  return request("/api/admin/overview/");
}

export async function getAdminUsers() {
  return request("/api/admin/users/");
}

export async function getAdminAnalytics() {
  return request("/api/admin/analytics/");
}

