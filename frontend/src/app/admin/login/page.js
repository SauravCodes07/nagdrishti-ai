"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAdmin } from "../../../lib/api";
import { Shield, Lock, User, ArrowRight, AlertCircle, ArrowLeft, KeyRound } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await loginAdmin(username, password);
      if (res && res.token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("nagdrishti_token", res.token);
          localStorage.setItem("nagdrishti_user", JSON.stringify(res.user || { username }));
        }
        router.push("/admin");
      } else {
        // Standard session login success
        if (typeof window !== "undefined") {
          localStorage.setItem("nagdrishti_token", "admin_session");
          localStorage.setItem("nagdrishti_user", JSON.stringify({ username }));
        }
        router.push("/admin");
      }
    } catch (err) {
      setErrorMsg(err.message || "Invalid administrative credentials. Please verify username and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col justify-between items-center p-4 text-white antialiased">
      {/* Top Bar */}
      <div className="w-full max-w-md flex justify-between items-center py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Citizen Shield</span>
        </Link>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-[#FFC107] border border-neutral-800">
          NMC SECURE GATEWAY
        </span>
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#FFC107] text-[#111111] flex items-center justify-center font-black text-xl mx-auto shadow-md">
            ND
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Command Center Login
          </h1>
          <p className="text-xs text-neutral-400">
            Nagpur Municipal Corporation Disaster Response Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-300 block">
              Officer Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="e.g. admin"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-white placeholder:text-neutral-600 focus:outline-hidden focus:border-[#FFC107]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-300 block">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-white placeholder:text-neutral-600 focus:outline-hidden focus:border-[#FFC107]"
              />
            </div>
          </div>

          {/* Demo Hint Banner */}
          <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#FFC107]" />
              <span>Demo Credentials:</span>
            </div>
            <span className="font-mono text-white text-[11px]">admin / admin123</span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-900 text-red-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* THE SINGLE PRIMARY ACTION CTA ON THIS SCREEN */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#FF8A00] hover:bg-[#E67C00] text-white font-extrabold text-sm shadow-md transition active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Authenticating Officer...</span>
              </>
            ) : (
              <>
                <span>Access Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Footer */}
      <div className="text-[11px] text-neutral-600 py-4 text-center">
        NagDrishti AI v2.4 • Municipal GIS & Emergency Dispatch Shield
      </div>
    </div>
  );
}
