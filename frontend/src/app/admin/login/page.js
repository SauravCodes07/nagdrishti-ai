"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  User,
  AlertTriangle,
  ArrowRight,
  Home,
  Shield,
  RefreshCw,
  Sun,
  Moon,
} from "lucide-react";
import { loginAdmin } from "../../../lib/api";
import { useTheme } from "../../../components/ThemeProvider";

export default function AdminLoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      await loginAdmin(username, password);
      router.push("/admin");
    } catch (err) {
      console.error("Login failed:", err);
      setErrorMsg(
        err.message?.includes("Failed to fetch")
          ? "Unable to reach the municipal authentication service. Please check your network or try again in a moment."
          : err.message || "Invalid credentials or unauthorized access."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] flex flex-col items-center justify-center p-4 text-slate-900 dark:text-slate-100 antialiased selection:bg-teal-500 selection:text-white transition-colors duration-200">
      {/* Top Bar for Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-2xl bg-white dark:bg-[#131B2A] hover:bg-slate-100 dark:hover:bg-[#1E293B] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#1E293B] transition-colors shadow-sm"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-teal-600" />}
        </button>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Brand Logo & Header */}
        <div className="text-center space-y-3">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-950 p-1 flex items-center justify-center mx-auto shadow-md border border-teal-500/40">
            <Image
              src="/brand/nagdrishti-logo.png"
              alt="NagDrishti AI"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/30">
              Command Portal
            </span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1.5">
              Municipal Officer Login
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Nagpur Urban Crisis Response & Dispatch Desk
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Officer ID / Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter officer username"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B] text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B] text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs shadow-xl shadow-teal-600/30 active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Authenticating Officer...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Sign In to Command Center</span>
              </>
            )}
          </button>
        </form>

        {/* Back to Citizen Portal Link */}
        <div className="pt-2 text-center">
          <Link
            href="/"
            className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 flex items-center justify-center gap-1.5 transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Public Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
