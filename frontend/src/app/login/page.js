"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  User,
  Mail,
  AlertTriangle,
  ArrowRight,
  Home,
  RefreshCw,
  Sun,
  Moon,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import { loginUser, signupCitizen, getCurrentUser } from "../../lib/api";
import { useTheme } from "../../components/ThemeProvider";
import GoogleSignInButton from "../../components/GoogleSignInButton";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/dashboard";

  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("signin"); // "signin" | "signup"

  // Form Fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Check if already logged in
  useEffect(() => {
    getCurrentUser()
      .then((data) => {
        if (data && data.authenticated) {
          router.push(returnUrl);
        }
      })
      .catch(() => {});
  }, [router, returnUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (activeTab === "signup") {
        await signupCitizen(username, password, email, name);
        setSuccessMsg("Account registered successfully! Redirecting...");
      } else {
        await loginUser(username, password, false);
        setSuccessMsg("Welcome back! Loading your citizen dashboard...");
      }

      setTimeout(() => {
        router.push(returnUrl);
      }, 500);
    } catch (err) {
      console.error("Auth failed:", err);
      setErrorMsg(
        err.message?.includes("Failed to fetch")
          ? "Unable to connect to authentication services. Please verify network access."
          : err.message || "Authentication failed. Please verify your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] flex flex-col items-center justify-center p-4 text-[#0F172A] dark:text-[#F8FAFC] antialiased">
      {/* Top Bar for Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#111C2E] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#243244] transition-colors shadow-sm cursor-pointer"
          title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4 text-[#0F766E]" />}
        </button>
      </div>

      <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-7 shadow-[0_1px_3px_rgba(15,23,42,0.08)] space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#0F172A] p-1 flex items-center justify-center mx-auto border border-[#E2E8F0] dark:border-[#334155]">
            <Image
              src="/brand/nagdrishti-logo.png"
              alt="NagDrishti AI"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5">
              <span className="font-bold text-lg text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                NagDrishti
              </span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#CCFBF1] dark:bg-teal-500/20 text-[#0F766E] dark:text-[#5EEAD4] border border-[#0F766E]/20">
                Citizen Portal
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
              Nagpur Urban Flood & Crisis Intelligence
            </p>
          </div>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 p-1 bg-[#F1F5F9] dark:bg-[#0B1220] rounded-xl border border-[#E2E8F0] dark:border-[#243244]">
          <button
            type="button"
            onClick={() => {
              setActiveTab("signin");
              setErrorMsg("");
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
              activeTab === "signin"
                ? "bg-[#FFFFFF] dark:bg-[#111C2E] text-[#0F766E] dark:text-[#14B8A6] shadow-sm"
                : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("signup");
              setErrorMsg("");
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
              activeTab === "signup"
                ? "bg-[#FFFFFF] dark:bg-[#111C2E] text-[#0F766E] dark:text-[#14B8A6] shadow-sm"
                : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#FEF2F2] dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-[#991B1B] dark:text-[#F87171] text-xs font-medium flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#DC2626] mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-[#DCFCE7] dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 text-[#166534] dark:text-[#4ADE80] text-xs font-medium flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A] mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {activeTab === "signup" && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#475569] dark:text-[#CBD5E1]">
                Full Name (Optional)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Deshmukh"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#0B0F17] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-normal focus:outline-none focus:border-[#0F766E] dark:focus:border-[#14B8A6]"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#475569] dark:text-[#CBD5E1]">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#0B0F17] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-normal focus:outline-none focus:border-[#0F766E] dark:focus:border-[#14B8A6]"
              />
            </div>
          </div>

          {activeTab === "signup" && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#475569] dark:text-[#CBD5E1]">
                Email Address (Optional)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#0B0F17] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-normal focus:outline-none focus:border-[#0F766E] dark:focus:border-[#14B8A6]"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#475569] dark:text-[#CBD5E1]">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#0B0F17] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-normal focus:outline-none focus:border-[#0F766E] dark:focus:border-[#14B8A6]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#14B8A6] dark:hover:bg-[#2DD4BF] text-white dark:text-[#042F2E] font-semibold text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer pt-1"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{activeTab === "signup" ? "Complete Registration" : "Sign In to NagDrishti"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-[#E2E8F0] dark:border-[#243244]"></div>
          <span className="flex-shrink mx-3 text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
            Or continue with
          </span>
          <div className="flex-grow border-t border-[#E2E8F0] dark:border-[#243244]"></div>
        </div>

        {/* Google Sign-In */}
        <GoogleSignInButton
          requireAdmin={false}
          text={activeTab === "signup" ? "Sign up with Google" : "Sign in with Google"}
          onSuccess={() => {
            setSuccessMsg("Google sign-in successful! Redirecting...");
            setTimeout(() => router.push(returnUrl), 500);
          }}
          onError={(msg) => setErrorMsg(msg)}
        />

        {/* Municipal Officer Command Desk Shortcut */}
        <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#243244] space-y-2 text-center">
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            Are you a Municipal Disaster Response Officer?
          </p>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs text-[#0F766E] dark:text-[#14B8A6] hover:underline font-semibold"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Officer Command Portal Login</span>
          </Link>
        </div>

        {/* Back Link */}
        <div className="pt-2 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] font-medium transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Public Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] flex items-center justify-center text-[#0F172A] dark:text-[#F8FAFC]">
          <RefreshCw className="w-8 h-8 animate-spin text-[#0F766E] dark:text-[#14B8A6]" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
