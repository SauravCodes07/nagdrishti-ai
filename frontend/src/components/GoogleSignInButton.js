"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { RefreshCw, AlertCircle } from "lucide-react";
import { signInWithGoogleViaSupabase, isSupabaseConfigured } from "../lib/supabaseClient";

export default function GoogleSignInButton({
  onSuccess,
  onError,
  requireAdmin = false,
  text = "Sign in with Google",
}) {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || (requireAdmin ? "/admin" : "/dashboard");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGoogleSignIn = async () => {
    if (!isSupabaseConfigured()) {
      const msg = "Supabase configuration missing. Please verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.";
      setErrorMsg(msg);
      if (onError) onError(msg);
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      await signInWithGoogleViaSupabase({
        returnUrl,
        requireAdmin,
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("[Google OAuth Error via Supabase]:", err);
      const msg = err.message || "Failed to initiate Google sign-in. Please try again.";
      setErrorMsg(msg);
      if (onError) onError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full h-11 px-4 rounded-xl bg-[#FFFFFF] dark:bg-[#1E293B] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] border border-[#CBD5E1] dark:border-[#475569] text-[#0F172A] dark:text-[#F8FAFC] font-medium text-xs sm:text-sm flex items-center justify-center gap-3 transition shadow-sm cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <RefreshCw className="w-4 h-4 animate-spin text-[#0F766E] dark:text-[#14B8A6]" />
        ) : (
          <>
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{text}</span>
          </>
        )}
      </button>

      {errorMsg && (
        <div className="p-2.5 rounded-lg bg-[#FEF2F2] dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-[#991B1B] dark:text-[#F87171] text-xs flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#DC2626]" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
