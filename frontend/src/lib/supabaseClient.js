import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://nitrixvlhcinqccjhccp.supabase.co";

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseKey);
};

// Base production origin constant
export const PRODUCTION_SITE_URL = "https://nagdrishti-ai.vercel.app";

/**
 * Resolves the environment-aware site URL for OAuth redirects:
 * - Production / Deployed: https://nagdrishti-ai.vercel.app (or custom HTTPS domain)
 * - Local Development: http://localhost:3000 (or current local origin)
 */
export const getSiteUrl = () => {
  // 1. Browser runtime check
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    const hostname = window.location.hostname;
    // Local development strictly when running on localhost or 127.0.0.1
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return origin.replace(/\/+$/, "");
    }
    // Production / Vercel HTTPS origin
    if (origin.startsWith("https://")) {
      return origin.replace(/\/+$/, "");
    }
  }

  // 2. Explicit environment variable check
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl && !envUrl.includes("localhost")) {
    return envUrl.replace(/\/+$/, "");
  }

  // 3. Guaranteed production fallback
  return PRODUCTION_SITE_URL;
};

export const getAuthRedirectOrigin = getSiteUrl;

// Initialize Supabase Client with PKCE flow and session persistence
export const supabase =
  isSupabaseConfigured()
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
          flowType: "pkce",
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: "nagdrishti_supabase_auth",
        },
      })
    : null;

/**
 * Initiates Google OAuth sign-in flow via Supabase Authentication.
 * Redirects the browser: Frontend -> Supabase -> Google -> Supabase Callback -> ${SITE_URL}/auth/callback.
 */
export async function signInWithGoogleViaSupabase({
  returnUrl = "/dashboard",
  requireAdmin = false,
} = {}) {
  if (!supabase) {
    throw new Error(
      "Supabase client is not configured. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are set."
    );
  }

  // Sanitize returnUrl to prevent open redirects
  const defaultTarget = requireAdmin ? "/admin" : "/dashboard";
  const sanitizedReturnUrl =
    typeof returnUrl === "string" && returnUrl.startsWith("/") && !returnUrl.startsWith("//")
      ? returnUrl
      : defaultTarget;

  // Resolve environment-aware site URL: https://nagdrishti-ai.vercel.app in production, http://localhost:3000 in local dev
  const siteUrl = getSiteUrl();
  const callbackUrl = `${siteUrl}/auth/callback?returnUrl=${encodeURIComponent(
    sanitizedReturnUrl
  )}&role=${requireAdmin ? "admin" : "citizen"}`;

  console.log("[OAuth] redirectTo:", callbackUrl);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

let _cachedSbUser = null;
let _cachedSbUserTimestamp = 0;

/**
 * Retrieves the currently active Supabase user session with memory caching and timeout.
 */
export async function getSupabaseUser(forceRefresh = false) {
  if (!supabase) return null;
  const now = Date.now();
  if (!forceRefresh && _cachedSbUser && now - _cachedSbUserTimestamp < 30000) {
    return _cachedSbUser;
  }
  try {
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => resolve({ data: { session: null } }), 3000)
    );
    const result = await Promise.race([sessionPromise, timeoutPromise]);
    const session = result?.data?.session;
    if (!session || !session.user) return null;
    _cachedSbUser = session.user;
    _cachedSbUserTimestamp = now;
    return session.user;
  } catch {
    return null;
  }
}

/**
 * Signs out from Supabase Auth and clears session cache.
 */
export async function signOutSupabase() {
  _cachedSbUser = null;
  _cachedSbUserTimestamp = 0;
  if (!supabase) return;
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn("Supabase signOut warning:", err);
  }
}
