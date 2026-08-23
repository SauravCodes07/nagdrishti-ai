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

// Base production origin constant — used as absolute safety fallback in production
export const PRODUCTION_SITE_URL = "https://nagdrishti-ai.vercel.app";

/**
 * Resolves the authorized application origin for OAuth redirects.
 * In production deployments, it strictly resolves to https://nagdrishti-ai.vercel.app.
 * Localhost is strictly isolated to local development (NODE_ENV === 'development').
 */
export const getAuthRedirectOrigin = () => {
  // 1. Check explicit environment variable first
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (
    envSiteUrl &&
    !envSiteUrl.includes("localhost") &&
    !envSiteUrl.includes("127.0.0.1")
  ) {
    return envSiteUrl.replace(/\/+$/, "");
  }

  // 2. If running in browser:
  if (typeof window !== "undefined") {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    // Strictly isolated to local development environment
    if (isLocalhost && process.env.NODE_ENV === "development") {
      return window.location.origin.replace(/\/+$/, "");
    }

    // On production / Vercel preview deployments
    if (!isLocalhost && window.location.origin.startsWith("https://")) {
      return window.location.origin.replace(/\/+$/, "");
    }
  }

  // 3. Guaranteed production fallback — NEVER fallback to localhost
  return PRODUCTION_SITE_URL;
};

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
 * Redirects the browser: Frontend -> Supabase -> Google -> Supabase Callback -> /auth/callback.
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

  // Determine site origin strictly for OAuth redirect
  const cleanOrigin = getAuthRedirectOrigin();
  const callbackUrl = `${cleanOrigin}/auth/callback?returnUrl=${encodeURIComponent(
    sanitizedReturnUrl
  )}&role=${requireAdmin ? "admin" : "citizen"}`;

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

/**
 * Retrieves the currently active Supabase user session.
 */
export async function getSupabaseUser() {
  if (!supabase) return null;
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return null;
    return session.user;
  } catch {
    return null;
  }
}

/**
 * Signs out from Supabase Auth.
 */
export async function signOutSupabase() {
  if (!supabase) return;
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn("Supabase signOut warning:", err);
  }
}
