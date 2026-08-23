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

// Initialize Supabase Client with graceful fallback for build/SSR environments
export const supabase =
  isSupabaseConfigured()
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

/**
 * Initiates Google OAuth sign-in flow via Supabase Authentication.
 * Redirects the browser to Supabase -> Google -> /auth/callback on the application frontend.
 */
export async function signInWithGoogleViaSupabase({
  returnUrl = "/dashboard",
  requireAdmin = false,
} = {}) {
  if (!supabase) {
    throw new Error(
      "Supabase client is not configured. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) are set."
    );
  }

  // Determine site origin for redirect URL
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "https://nagdrishti-ai.vercel.app");

  const cleanOrigin = origin.replace(/\/+$/, "");
  const callbackUrl = `${cleanOrigin}/auth/callback?returnUrl=${encodeURIComponent(returnUrl)}&role=${requireAdmin ? "admin" : "citizen"}`;

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
