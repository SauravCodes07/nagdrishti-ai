"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Lock,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  RefreshCw,
  Clock,
  Truck,
  Activity,
  FileText,
  Radio,
  Sliders,
  Eye,
  Camera,
  Bot,
  User,
  X,
} from "lucide-react";
import {
  getPriorityQueue,
  getReports,
  verifyReport,
  updateDispatchStatus,
  getAlertLogs,
  simulateRainfall,
  loginAdmin,
  logoutAdmin,
  getCurrentUser,
  API_BASE,
} from "../lib/api";

export default function AdminCommandCenter({
  zones = [],
  onDataRefreshed,
}) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loginUsername, setLoginUsername] = useState("admin");
  const [loginPassword, setLoginPassword] = useState("admin123");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Tab: "priority" | "reports" | "alerts" | "simulation"
  const [adminTab, setAdminTab] = useState("priority");

  // Priority Queue Data
  const [priorityQueue, setPriorityQueue] = useState([]);
  const [queueLoading, setQueueLoading] = useState(false);

  // Reports Moderation Data
  const [reportsList, setReportsList] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportFilter, setReportFilter] = useState("All");
  const [activePhoto, setActivePhoto] = useState(null);

  // Alert Logs Data
  const [alertLogs, setAlertLogs] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);

  // Simulation State
  const [simStage, setSimStage] = useState(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simLog, setSimLog] = useState(null);

  const loadAdminData = async () => {
    setQueueLoading(true);
    setReportsLoading(true);
    setAlertsLoading(true);

    try {
      const [queueRes, repRes, alertRes] = await Promise.all([
        getPriorityQueue().catch(() => ({ priority_queue: [] })),
        getReports().catch(() => []),
        getAlertLogs().catch(() => []),
      ]);

      setPriorityQueue(queueRes.priority_queue || []);
      setReportsList(Array.isArray(repRes) ? repRes : []);
      setAlertLogs(Array.isArray(alertRes) ? alertRes : []);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setQueueLoading(false);
      setReportsLoading(false);
      setAlertsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const initAuth = async () => {
      try {
        const userRes = await getCurrentUser();
        if (mounted) {
          if (userRes && userRes.authenticated) {
            setCurrentUser(userRes.user);
            loadAdminData();
          } else {
            setCurrentUser(null);
          }
          setAuthChecked(true);
        }
      } catch (err) {
        if (mounted) {
          setCurrentUser(null);
          setAuthChecked(true);
        }
      }
    };

    initAuth();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const data = await loginAdmin(loginUsername, loginPassword);
      setCurrentUser(data.user);
      loadAdminData();
    } catch (err) {
      setLoginError(err.message || "Invalid administrative credentials.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      setCurrentUser(null);
    } catch (err) {
      console.warn("Logout error:", err);
      setCurrentUser(null);
    }
  };

  const handleUpdateStatus = async (zoneId, status) => {
    try {
      await updateDispatchStatus(zoneId, status);
      await loadAdminData();
      if (onDataRefreshed) onDataRefreshed();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleVerifyReport = async (reportId, status) => {
    try {
      await verifyReport(reportId, status);
      await loadAdminData();
      if (onDataRefreshed) onDataRefreshed();
    } catch (err) {
      alert("Moderation error: " + err.message);
    }
  };

  const handleRunSimulation = async (stageKey) => {
    setSimLoading(true);
    setSimStage(stageKey);
    try {
      const res = await simulateRainfall({ stage: stageKey });
      setSimLog(res);
      await loadAdminData();
      if (onDataRefreshed) onDataRefreshed();
    } catch (err) {
      alert("Simulation error: " + err.message);
    } finally {
      setSimLoading(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="p-8 text-center text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
        Checking administrative authorization...
      </div>
    );
  }

  // LOGIN SCREEN
  if (!currentUser) {
    return (
      <div className="bg-[#FFFFFF] dark:bg-[#111C2E] rounded-2xl p-6 sm:p-8 border border-[#E2E8F0] dark:border-[#243244] shadow-[0_1px_3px_rgba(15,23,42,0.08)] max-w-md mx-auto my-8">
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#CCFBF1] dark:bg-teal-500/15 text-[#0F766E] dark:text-[#5EEAD4] flex items-center justify-center mx-auto border border-[#0F766E]/20">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
            Officer Command Portal
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            Nagpur Municipal Corporation crisis dispatch desk
          </p>
        </div>

        {loginError && (
          <div className="mb-4 p-3 rounded-xl bg-[#FEF2F2] dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs font-medium text-[#991B1B] dark:text-[#F87171] flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#DC2626]" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#475569] dark:text-[#CBD5E1]">Officer ID</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required
                className="w-full text-xs font-normal pl-9 pr-3 py-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#0B0F17] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#14B8A6]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#475569] dark:text-[#CBD5E1]">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="w-full text-xs font-normal pl-9 pr-3 py-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#0B0F17] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#14B8A6]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full h-11 rounded-xl bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#14B8A6] dark:hover:bg-[#2DD4BF] text-white dark:text-[#042F2E] font-semibold text-xs sm:text-sm shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            {loginLoading ? "Authorizing..." : "Enter Command Center"}
          </button>
        </form>
      </div>
    );
  }

  // LOGGED IN DASHBOARD
  return (
    <div className="bg-[#FFFFFF] dark:bg-[#111C2E] rounded-2xl border border-[#E2E8F0] dark:border-[#243244] shadow-[0_1px_3px_rgba(15,23,42,0.08)] overflow-hidden space-y-4">
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 border-b border-[#E2E8F0] dark:border-[#243244] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#CCFBF1] dark:bg-teal-500/15 text-[#0F766E] dark:text-[#5EEAD4] flex items-center justify-center border border-[#0F766E]/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Municipal Command & Dispatch Center
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Active Officer: <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{currentUser.username}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={loadAdminData}
            className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0F17] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-xs font-medium text-[#475569] dark:text-[#CBD5E1] flex items-center space-x-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${queueLoading ? "animate-spin text-[#0F766E] dark:text-[#14B8A6]" : ""}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-[#FEE2E2] dark:bg-red-500/15 hover:bg-red-200 dark:hover:bg-red-500/25 text-xs font-medium text-[#991B1B] dark:text-[#F87171] flex items-center space-x-1 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-4 sm:px-5 flex space-x-2 border-b border-[#E2E8F0] dark:border-[#243244] overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: "priority", label: `Priority Queue (${priorityQueue.length})`, icon: Truck },
          { id: "reports", label: `Photo Moderation (${reportsList.length})`, icon: Camera },
          { id: "alerts", label: `Alert Logs (${alertLogs.length})`, icon: Radio },
          { id: "simulation", label: "Crisis Simulator", icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? "bg-[#CCFBF1] text-[#0F766E] dark:bg-teal-500/15 dark:text-[#5EEAD4]"
                  : "text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PRIORITY DISPATCH QUEUE */}
      {adminTab === "priority" && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            Multi-variable formula rank: <code className="text-[#0F766E] dark:text-[#14B8A6] font-mono">0.45·Rain + 0.35·(1-Elev) + 0.20·(1-Drain) + Boost</code>
          </div>

          <div className="border border-[#E2E8F0] dark:border-[#243244] rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#243244] text-[#64748B] dark:text-[#94A3B8] font-semibold uppercase text-[11px] tracking-wider">
                  <th className="p-3">Rank & Ward</th>
                  <th className="p-3">Risk Score</th>
                  <th className="p-3">Rainfall</th>
                  <th className="p-3">Drainage</th>
                  <th className="p-3">Dispatch Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#243244]">
                {priorityQueue.map((item, idx) => (
                  <tr key={item.zone_id || idx} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/40 transition">
                    <td className="p-3 font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-md bg-[#F1F5F9] dark:bg-[#0B0F17] text-[#0F766E] dark:text-[#14B8A6] text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span>{item.zone_name}</span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                          item.risk_category === "Severe"
                            ? "bg-[#FEE2E2] text-[#991B1B]"
                            : item.risk_category === "High"
                            ? "bg-[#FFEDD5] text-[#9A3412]"
                            : "bg-[#DCFCE7] text-[#166534]"
                        }`}
                      >
                        {item.risk_score?.toFixed(1)} ({item.risk_category})
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      {item.rainfall_mm?.toFixed(1)} mm/h
                    </td>
                    <td className="p-3 text-[#475569] dark:text-[#CBD5E1]">
                      {Math.round((item.drainage_capacity || 0.5) * 100)}%
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded ${
                          item.dispatch_status === "Dispatched"
                            ? "bg-[#FEF3C7] text-[#854D0E]"
                            : item.dispatch_status === "Resolved"
                            ? "bg-[#DCFCE7] text-[#166534]"
                            : "bg-[#F1F5F9] dark:bg-[#0B0F17] text-[#64748B] dark:text-[#94A3B8]"
                        }`}
                      >
                        {item.dispatch_status || "Unassigned"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {item.dispatch_status !== "Dispatched" && (
                          <button
                            onClick={() => handleUpdateStatus(item.zone_id, "Dispatched")}
                            className="px-2.5 py-1 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white font-semibold text-[11px] transition cursor-pointer"
                          >
                            Dispatch QRT
                          </button>
                        )}
                        {item.dispatch_status !== "Resolved" && (
                          <button
                            onClick={() => handleUpdateStatus(item.zone_id, "Resolved")}
                            className="px-2.5 py-1 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-[11px] transition cursor-pointer"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: HAZARD REPORTS MODERATION */}
      {adminTab === "reports" && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center space-x-2">
            {["All", "Pending", "Verified", "Rejected"].map((st) => (
              <button
                key={st}
                onClick={() => setReportFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  reportFilter === st
                    ? "bg-[#0F766E] text-white dark:bg-[#14B8A6] dark:text-[#042F2E]"
                    : "bg-[#F1F5F9] dark:bg-[#0B0F17] text-[#475569] dark:text-[#CBD5E1]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {reportsList
              .filter((r) => reportFilter === "All" || (r.verification_status || "Pending").toLowerCase() === reportFilter.toLowerCase())
              .map((rep) => {
                const photoUrl = rep.photo
                  ? rep.photo.startsWith("http")
                    ? rep.photo
                    : `${API_BASE}${rep.photo}`
                  : null;

                return (
                  <div key={rep.id} className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#243244] bg-[#F8FAFC] dark:bg-[#0B0F17] space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-[#0F766E] dark:text-[#14B8A6]">Incident #{rep.id}</span>
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                          rep.verification_status === "Verified"
                            ? "bg-[#DCFCE7] text-[#166534]"
                            : rep.verification_status === "Rejected"
                            ? "bg-[#FEE2E2] text-[#991B1B]"
                            : "bg-[#FEF9C3] text-[#854D0E]"
                        }`}
                      >
                        {rep.verification_status || "Pending"}
                      </span>
                    </div>

                    {photoUrl ? (
                      <div
                        onClick={() => setActivePhoto(photoUrl)}
                        className="h-32 rounded-lg overflow-hidden cursor-pointer relative bg-black"
                      >
                        <img src={photoUrl} alt="Evidence" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-20 rounded-lg bg-[#FFFFFF] dark:bg-[#111C2E] flex items-center justify-center text-xs text-[#94A3B8] border border-dashed border-[#CBD5E1] dark:border-[#334155]">
                        No Photo Attached
                      </div>
                    )}

                    <p className="text-xs text-[#334155] dark:text-[#CBD5E1] line-clamp-2">{rep.description}</p>

                    <div className="flex space-x-2 pt-1 border-t border-[#E2E8F0] dark:border-[#243244]">
                      <button
                        onClick={() => handleVerifyReport(rep.id, "Verified")}
                        className="flex-1 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-xs transition cursor-pointer"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => handleVerifyReport(rep.id, "Rejected")}
                        className="flex-1 py-1.5 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-xs transition cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 3: ALERT LOGS */}
      {adminTab === "alerts" && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="border border-[#E2E8F0] dark:border-[#243244] rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#243244] text-[#64748B] dark:text-[#94A3B8] font-semibold uppercase text-[11px] tracking-wider">
                  <th className="p-3">Time</th>
                  <th className="p-3">Ward</th>
                  <th className="p-3">Channel</th>
                  <th className="p-3">Message</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#243244]">
                {alertLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/40">
                    <td className="p-3 font-mono text-[#64748B] dark:text-[#94A3B8] whitespace-nowrap">
                      {log.created_at ? new Date(log.created_at).toLocaleTimeString() : "Live"}
                    </td>
                    <td className="p-3 font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      {log.zone_name || "Nagpur City"}
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#CCFBF1] text-[#0F766E] dark:bg-teal-500/20 dark:text-[#5EEAD4]">
                        {log.channel || "SMS"}
                      </span>
                    </td>
                    <td className="p-3 text-[#334155] dark:text-[#CBD5E1] max-w-xs truncate">{log.message}</td>
                    <td className="p-3">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#DCFCE7] text-[#166534]">
                        {log.status || "Delivered"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CRISIS SIMULATOR */}
      {adminTab === "simulation" && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: "baseline", label: "1. Baseline (0mm)" },
              { id: "onset", label: "2. Rain Onset (15mm)" },
              { id: "downpour", label: "3. Downpour (75mm)" },
              { id: "escalation", label: "4. Crisis Escalation" },
              { id: "waterlogging", label: "5. Photo Confirmed" },
              { id: "alert", label: "6. Broadcast Alert" },
              { id: "dispatch", label: "7. Civic Action" },
              { id: "resolve", label: "8. Resolution" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => handleRunSimulation(st.id)}
                disabled={simLoading}
                className={`p-3 rounded-xl border text-left text-xs font-semibold transition cursor-pointer ${
                  simStage === st.id
                    ? "bg-[#CCFBF1] dark:bg-teal-500/20 border-[#0F766E] text-[#0F766E] dark:text-[#5EEAD4]"
                    : "bg-[#F8FAFC] dark:bg-[#0B0F17] border-[#E2E8F0] dark:border-[#243244] text-[#475569] dark:text-[#CBD5E1] hover:border-[#0F766E]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{st.label}</span>
                  <Play className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>

          {simLog && (
            <div className="p-3.5 rounded-xl bg-[#DCFCE7] dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-xs text-[#166534] dark:text-[#86EFAC] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{simLog.description || simLog.message}</span>
            </div>
          )}
        </div>
      )}

      {/* Photo Modal */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4"
        >
          <div className="relative max-w-2xl w-full bg-[#FFFFFF] dark:bg-[#111C2E] rounded-2xl overflow-hidden p-2">
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/70 text-white hover:bg-[#DC2626] transition z-10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <img src={activePhoto} alt="Evidence" className="w-full max-h-[75vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}
