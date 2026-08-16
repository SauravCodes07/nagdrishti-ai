"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldAlert,
  Lock,
  User,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Home,
  CheckCircle2,
} from "lucide-react";
import { loginAdmin } from "../../../lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
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
      setErrorMsg(err.message || "Invalid officer credentials or access unauthorized.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0B0F17] flex flex-col items-center justify-center p-4 text-slate-900 dark:text-slate-100 antialiased">
      <div className="w-full max-w-md bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-950 p-1.5 flex items-center justify-center mx-auto shadow-lg border border-teal-500/30">
            <Image
              src="/brand/nagdrishti-logo.png"
              alt="NagDrishti AI"
              width={60}
              height={60}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              Command Authentication
            </span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
              Municipal Officer Login
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Nagpur Urban Crisis Response & Dispatch Portal
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Username / Officer ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                required
              />
            </div>
          </div>

          {/* Quick Demo Credentials Autofill */}
          <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-teal-800 dark:text-teal-300 flex items-center justify-between">
            <span className="text-[11px]">Demo: admin / admin123</span>
            <button
              type="button"
              onClick={() => {
                setUsername("admin");
                setPassword("admin123");
              }}
              className="text-[10px] font-black uppercase underline hover:text-teal-600"
            >
              Fill Credentials
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs shadow-xl shadow-teal-600/30 active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
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
            <span>Return to Citizen Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
