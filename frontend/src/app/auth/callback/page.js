"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawReturnUrl = searchParams.get("returnUrl") || "";
  const role = searchParams.get("role") || "citizen";

  // Validate return URL to prevent open redirects while ensuring proper destination
  const defaultUrl = role === "admin" ? "/admin" : "/dashboard";
  const returnUrl = rawReturnUrl.startsWith("/") ? rawReturnUrl : defaultUrl;

  const [status, setStatus] = useState("verifying"); // 'verifying' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function handleAuth() {
      try {
        if (!supabase) {
          throw new Error("Supabase client is not initialized. Check your environment configuration.");
        }

        // Check if there is an error in URL params
        const errorDescription =
          searchParams.get("error_description") ||
          searchParams.get("error");
        if (errorDescription) {
          throw new Error(errorDescription);
        }

        let session = null;

        // 1. Check for PKCE authorization code in searchParams
        const code = searchParams.get("code");
        if (code) {
          try {
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) {
              console.warn("PKCE code exchange notice:", exchangeError.message);
            } else if (data?.session) {
              session = data.session;
            }
          } catch (codeErr) {
            console.warn("Error during exchangeCodeForSession:", codeErr);
          }
        }

        // 2. Fallback to getSession() (for hash fragment or existing session)
        if (!session) {
          const { data, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            console.warn("getSession error:", sessionError);
          } else if (data?.session) {
            session = data.session;
          }
        }

        const handleSuccessSession = (activeSession) => {
          if (!activeSession || !activeSession.user) return;
          const user = activeSession.user;
          const userRole = role === "admin" ? "admin" : "citizen";

          if (typeof window !== "undefined") {
            const tokenValue = activeSession.access_token || `sb_${user.id}`;
            localStorage.setItem("nagdrishti_token", tokenValue);
            if (userRole === "admin") {
              localStorage.setItem("admin_token", tokenValue);
            }
          }

          if (isMounted) {
            setStatus("success");
            setTimeout(() => {
              router.replace(returnUrl);
            }, 500);
          }
        };

        if (session && session.user) {
          handleSuccessSession(session);
          return;
        }

        // 3. If session not immediately available, listen for auth state change
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (newSession && newSession.user) {
              handleSuccessSession(newSession);
            }
          }
        );

        // Fallback timeout in case auth fails or is cancelled
        const timer = setTimeout(() => {
          if (isMounted && status === "verifying") {
            setStatus("error");
            setErrorMessage("Authentication timed out or could not be completed. Please try signing in again.");
          }
        }, 8000);

        return () => {
          authListener?.subscription?.unsubscribe();
          clearTimeout(timer);
        };
      } catch (err) {
        console.error("Supabase OAuth Callback Error:", err);
        if (isMounted) {
          setStatus("error");
          setErrorMessage(err.message || "Failed to complete authentication with Supabase.");
        }
      }
    }

    handleAuth();

    return () => {
      isMounted = false;
    };
  }, [router, returnUrl, role, searchParams, status]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] flex flex-col items-center justify-center p-4 text-[#0F172A] dark:text-[#F8FAFC]">
      <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-7 shadow-lg text-center space-y-4">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#0F172A] p-1 flex items-center justify-center mx-auto border border-[#E2E8F0] dark:border-[#334155] shadow-sm">
          <Image
            src="/brand/nagdrishti-logo.png"
            alt="NagDrishti AI"
            width={40}
            height={40}
            className="object-contain"
            priority
          />
        </div>

        {status === "verifying" && (
          <div className="space-y-2">
            <RefreshCw className="w-8 h-8 animate-spin text-[#0F766E] dark:text-[#14B8A6] mx-auto" />
            <h2 className="text-base font-semibold">Completing Authentication...</h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Verifying your credentials with Supabase Auth.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto" />
            <h2 className="text-base font-semibold text-[#166534] dark:text-[#4ADE80]">
              Authentication Successful
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Redirecting to your dashboard...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-3">
            <AlertCircle className="w-8 h-8 text-[#DC2626] mx-auto" />
            <h2 className="text-base font-semibold text-[#991B1B] dark:text-[#F87171]">
              Authentication Failed
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{errorMessage}</p>
            <button
              onClick={() => router.push(role === "admin" ? "/admin/login" : "/login")}
              className="mt-2 px-4 py-2 bg-[#0F766E] text-white text-xs font-semibold rounded-xl hover:bg-[#115E59] transition"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#0F766E]" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
