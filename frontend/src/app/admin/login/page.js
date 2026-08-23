"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  User,
  AlertTriangle,
  ArrowRight,
  Home,
  RefreshCw,
  Sun,
  Moon,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { loginAdmin } from "../../../lib/api";
import { useTheme } from "../../../components/ThemeProvider";
import { useAuth } from "../../../context/AuthContext";
import GoogleSignInButton from "../../../components/GoogleSignInButton";
import { MagneticButton } from "../../../components/motion";

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/admin";
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, isAdmin, saveSession } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Check if already authenticated as officer
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      router.replace(returnUrl);
    }
  }, [isAuthenticated, isAdmin, router, returnUrl]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await loginAdmin(username, password);
      if (res?.user && res?.token) {
        saveSession(res.user, res.token);
      }
      router.replace(returnUrl);
    } catch (err) {
      console.error("Login failed:", err);
      setErrorMsg(
        err.message?.includes("Failed to fetch")
          ? "Unable to reach the municipal authentication service. Please check your network or try again."
          : err.message || "Invalid credentials or unauthorized access."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] flex flex-col items-center justify-center p-4 text-[#0F172A] dark:text-[#F8FAFC] antialiased">
      {/* Top Bar for Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#111C2E] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#243244] transition-colors shadow-sm cursor-pointer"
          title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4 text-[#0F766E]" />}
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-7 shadow-[0_1px_3px_rgba(15,23,42,0.08)] space-y-5"
      >
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2.5">
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
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FEF3C7] text-[#854D0E] dark:bg-amber-500/20 dark:text-[#FDE68A] border border-[#F59E0B]/20">
              Command Portal
            </span>
            <h1 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight mt-1.5">
              Municipal Officer Login
            </h1>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              Nagpur Urban Crisis Response & Dispatch Desk
            </p>
          </div>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3 rounded-xl bg-[#FEF2F2] dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-[#991B1B] dark:text-[#F87171] text-xs font-medium flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#DC2626] mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#475569] dark:text-[#CBD5E1]">
              Officer ID / Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter officer username"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#0B0F17] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-normal focus:outline-none focus:border-[#0F766E] dark:focus:border-[#14B8A6]"
              />
            </div>
          </div>

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

          <MagneticButton>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#14B8A6] dark:hover:bg-[#2DD4BF] text-white dark:text-[#042F2E] font-semibold text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer pt-1"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Access Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </MagneticButton>
        </form>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-[#E2E8F0] dark:border-[#243244]"></div>
          <span className="flex-shrink mx-3 text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
            Or sign in with
          </span>
          <div className="flex-grow border-t border-[#E2E8F0] dark:border-[#243244]"></div>
        </div>

        {/* Google Sign-In */}
        <GoogleSignInButton
          requireAdmin={true}
          text="Officer Sign in with Google"
          onSuccess={() => {
            router.push(returnUrl);
          }}
          onError={(msg) => setErrorMsg(msg)}
        />

        {/* Back Link */}
        <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#243244] text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] font-medium transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Public Website</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] flex items-center justify-center text-[#0F172A] dark:text-[#F8FAFC]">
          <RefreshCw className="w-8 h-8 animate-spin text-[#0F766E] dark:text-[#14B8A6]" />
        </div>
      }
    >
      <AdminLoginContent />
    </Suspense>
  );
}
