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
  Send,
  Truck,
  Activity,
  Layers,
  FileText,
  Radio,
  Sliders,
  ChevronRight,
  Eye,
  Camera,
  Bot,
  User,
  Sparkles,
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
        const data = await getCurrentUser();
        if (mounted && data && data.authenticated) {
          setCurrentUser(data.user);
          loadAdminData();
        }
      } catch (err) {
        console.warn(err);
      } finally {
        if (mounted) setAuthChecked(true);
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
      const res = await loginAdmin(loginUsername, loginPassword);
      setCurrentUser(res.user);
      loadAdminData();
    } catch (err) {
      setLoginError(err.message || "Invalid credentials.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch (err) {
      console.warn(err);
    }
    setCurrentUser(null);
  };

  const handleUpdateDispatch = async (zoneId, newStatus) => {
    try {
      await updateDispatchStatus(zoneId, newStatus);
      setPriorityQueue((prev) =>
        prev.map((z) => (z.zone_id === zoneId ? { ...z, dispatch_status: newStatus } : z))
      );
      if (onDataRefreshed) onDataRefreshed();
    } catch (err) {
      alert(`Failed to update dispatch status: ${err.message}`);
    }
  };

  const handleVerifyReport = async (reportId, status) => {
    try {
      await verifyReport(reportId, status);
      setReportsList((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, verification_status: status } : r))
      );
      if (onDataRefreshed) onDataRefreshed();
    } catch (err) {
      alert(`Failed to verify report: ${err.message}`);
    }
  };

  const handleRunSimulationStage = async (stageKey) => {
    setSimLoading(true);
    setSimStage(stageKey);

    try {
      const res = await simulateRainfall({ stage: stageKey });
      setSimLog(res);
      await loadAdminData();
      if (onDataRefreshed) onDataRefreshed();
    } catch (err) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setSimLoading(false);
    }
  };

  // Login Gate View
  if (authChecked && !currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white dark:bg-[#131B2A] rounded-3xl p-8 border border-slate-200 dark:border-[#1E293B] shadow-2xl font-sans text-slate-900 dark:text-slate-100">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FFF7ED] dark:bg-[#FF8A00]/15 text-[#EA580C] dark:text-[#FF8A00] border border-[#FF8A00]/30 flex items-center justify-center mb-3">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Admin Command Center</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Municipal crisis management & resource dispatch authorization
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
              Admin Username
            </label>
            <input
              type="text"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B] rounded-2xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF8A00]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
              Admin Password
            </label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B] rounded-2xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF8A00]"
              required
            />
          </div>

          {loginError && (
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs font-medium text-red-700 dark:text-red-300 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full py-3.5 rounded-2xl bg-[#EA580C] dark:bg-[#FF8A00] hover:bg-[#C2410C] dark:hover:bg-[#FFA726] text-white dark:text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-[#FF8A00]/25 transition-all active:scale-98 disabled:opacity-60 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Shield className="w-4 h-4" />
            <span>{loginLoading ? "Verifying Credentials..." : "Access Command Center"}</span>
          </button>
        </form>
      </div>
    );
  }

  const severeWards = priorityQueue.filter((z) => (z.risk_category === "Severe" || z.risk_score >= 75)).length;
  const highWards = priorityQueue.filter((z) => (z.risk_category === "High" || (z.risk_score >= 50 && z.risk_score < 75))).length;
  const dispatchedUnits = priorityQueue.filter((z) => z.dispatch_status === "Dispatched").length;
  const pendingReports = reportsList.filter((r) => r.verification_status === "Pending").length;

  const filteredReports = reportsList.filter((r) => {
    if (reportFilter === "All") return true;
    return (r.verification_status || "Pending").toLowerCase() === reportFilter.toLowerCase();
  });

  const SIMULATION_STAGES = [
    { key: "baseline", title: "1. Baseline", desc: "0mm rain, Low risk, normal traffic" },
    { key: "onset", title: "2. Rainfall Onset", desc: "15mm rain across Nagpur" },
    { key: "downpour", title: "3. Downpour (75mm)", desc: "Heavy rain in low-lying basins" },
    { key: "waterlogging", title: "4. Waterlogging Emergence", desc: "Citizen photo confirms flood" },
    { key: "alert", title: "5. Emergency Alert", desc: "Twilio SMS/WhatsApp triggered" },
    { key: "dispatch", title: "6. Civic Dispatch", desc: "Dewatering pumps deployed" },
    { key: "resolve", title: "7. Resolution", desc: "Water recedes, marked Resolved" },
  ];

  return (
    <div className="space-y-6 font-sans text-slate-900 dark:text-slate-100">
      {/* Top Header Bar */}
      <div className="bg-white dark:bg-[#131B2A] text-slate-900 dark:text-white rounded-3xl p-5 border border-slate-200 dark:border-[#1E293B] shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#FFF7ED] dark:bg-[#FF8A00]/20 text-[#EA580C] dark:text-[#FF8A00] rounded-2xl border border-[#FF8A00]/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-black text-slate-900 dark:text-white">Nagpur Crisis Command Center</h1>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                Duty Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Logged in as <strong className="text-slate-900 dark:text-white">{currentUser?.username}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadAdminData}
            className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#0B0F17] hover:bg-slate-100 dark:hover:bg-[#1E293B] border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer"
            title="Refresh All Records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${queueLoading ? "animate-spin text-[#EA580C] dark:text-[#FF8A00]" : ""}`} />
            <span>Sync Feeds</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 font-bold text-xs flex items-center space-x-1 transition cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#131B2A] rounded-2xl p-4 border border-slate-200 dark:border-[#1E293B]">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Critical Wards</span>
          <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-0.5">
            {severeWards + highWards}
          </div>
          <span className="text-[10px] text-slate-500">{severeWards} Severe, {highWards} High</span>
        </div>

        <div className="bg-white dark:bg-[#131B2A] rounded-2xl p-4 border border-slate-200 dark:border-[#1E293B]">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Pending Reports</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
            {pendingReports}
          </div>
          <span className="text-[10px] text-slate-500">Awaiting officer moderation</span>
        </div>

        <div className="bg-white dark:bg-[#131B2A] rounded-2xl p-4 border border-slate-200 dark:border-[#1E293B]">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Dispatches</span>
          <div className="text-2xl font-black text-[#EA580C] dark:text-[#FF8A00] mt-0.5">
            {dispatchedUnits}
          </div>
          <span className="text-[10px] text-slate-500">Pumps & QRT deployed</span>
        </div>

        <div className="bg-white dark:bg-[#131B2A] rounded-2xl p-4 border border-slate-200 dark:border-[#1E293B]">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Alerts Logged</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
            {alertLogs.length}
          </div>
          <span className="text-[10px] text-slate-500">Twilio SMS & WhatsApp</span>
        </div>
      </div>

      {/* Tab Navigation Controls */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-[#0B0F17] p-1.5 rounded-2xl border border-slate-200 dark:border-[#1E293B] overflow-x-auto no-scrollbar">
        {[
          { id: "priority", label: "Priority Queue", count: priorityQueue.length, icon: Activity },
          { id: "reports", label: "Hazard Moderation", count: pendingReports, icon: FileText },
          { id: "alerts", label: "Alert Logs", count: alertLogs.length, icon: Radio },
          { id: "simulation", label: "Simulation Runner", icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-[#EA580C] dark:bg-[#FF8A00] text-white dark:text-slate-950 shadow-md shadow-[#FF8A00]/25"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#131B2A]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-white/20 text-white dark:text-slate-950" : "bg-slate-200 dark:bg-[#1E293B] text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Priority Queue */}
      {adminTab === "priority" && (
        <div className="bg-white dark:bg-[#131B2A] rounded-3xl p-5 border border-slate-200 dark:border-[#1E293B] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E293B]">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Multi-Variable Priority Dispatch Queue
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Formula: 0.45·Rain + 0.35·(1-Elev) + 0.20·(1-Drain) + Photo Boost
              </p>
            </div>
            <span className="text-xs font-bold text-[#EA580C] dark:text-[#FF8A00]">
              {priorityQueue.length} Wards Ranked
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0B0F17] border-b border-slate-200 dark:border-[#1E293B] text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                  <th className="p-3">Rank & Ward</th>
                  <th className="p-3">Risk Score</th>
                  <th className="p-3">Rainfall</th>
                  <th className="p-3">Drainage</th>
                  <th className="p-3">Citizen Reports</th>
                  <th className="p-3">Dispatch Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#1E293B]">
                {priorityQueue.map((item, idx) => (
                  <tr key={item.zone_id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/40 transition">
                    <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span className="w-5 h-5 rounded bg-slate-100 dark:bg-[#0B0F17] text-[#EA580C] dark:text-[#FF8A00] text-[10px] font-black flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span>{item.zone_name}</span>
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.risk_category === "Severe"
                            ? "bg-red-500/10 text-red-600 dark:text-red-300"
                            : item.risk_category === "High"
                            ? "bg-orange-500/10 text-orange-600 dark:text-orange-300"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                        }`}
                      >
                        {item.risk_score?.toFixed(1)} ({item.risk_category})
                      </span>
                    </td>

                    <td className="p-3 font-bold text-slate-900 dark:text-white">{item.rainfall_mm?.toFixed(1)} mm/h</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{Math.round((item.drainage_capacity || 0.5) * 100)}%</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">
                      {item.pending_reports_count || 0} Pending
                    </td>

                    <td className="p-3">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          item.dispatch_status === "Dispatched"
                            ? "bg-[#FFF7ED] dark:bg-[#FF8A00]/20 text-[#EA580C] dark:text-[#FF8A00] border border-[#FF8A00]/30"
                            : item.dispatch_status === "Resolved"
                            ? "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {item.dispatch_status || "Unassigned"}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {item.dispatch_status !== "Dispatched" && (
                          <button
                            onClick={() => handleUpdateDispatch(item.zone_id, "Dispatched")}
                            className="px-2.5 py-1 rounded-lg bg-[#EA580C] dark:bg-[#FF8A00] hover:bg-[#C2410C] dark:hover:bg-[#FFA726] text-white dark:text-slate-950 font-bold text-[10px] shadow-sm transition cursor-pointer"
                          >
                            Dispatch
                          </button>
                        )}
                        {item.dispatch_status !== "Resolved" && (
                          <button
                            onClick={() => handleUpdateDispatch(item.zone_id, "Resolved")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow-sm transition cursor-pointer"
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

      {/* TAB 2: Hazard Moderation */}
      {adminTab === "reports" && (
        <div className="bg-white dark:bg-[#131B2A] rounded-3xl p-5 border border-slate-200 dark:border-[#1E293B] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E293B]">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Citizen Hazard Moderation
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Inspect evidence photos, verify Vision AI inferences, and advance municipal status
              </p>
            </div>

            <div className="flex space-x-1">
              {["All", "Pending", "Verified", "Rejected"].map((st) => (
                <button
                  key={st}
                  onClick={() => setReportFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    reportFilter === st
                      ? "bg-[#EA580C] dark:bg-[#FF8A00] text-white dark:text-slate-950"
                      : "bg-slate-100 dark:bg-[#0B0F17] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((rep) => {
              const photoUrl = rep.photo
                ? rep.photo.startsWith("http")
                  ? rep.photo
                  : `${API_BASE}${rep.photo}`
                : null;

              return (
                <div
                  key={rep.id}
                  className="bg-slate-50 dark:bg-[#0B0F17] rounded-2xl p-4 border border-slate-200 dark:border-[#1E293B] space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#EA580C] dark:text-[#FF8A00]">Report #{rep.id}</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white dark:bg-[#131B2A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                        {rep.verification_status || "Pending"}
                      </span>
                    </div>

                    {photoUrl && (
                      <div
                        onClick={() => setActivePhoto(photoUrl)}
                        className="h-36 rounded-xl overflow-hidden cursor-pointer relative group bg-black"
                      >
                        <img src={photoUrl} alt="Hazard" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-white transition">
                          Inspect Photo
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 font-medium">
                      {rep.description || "Waterlogging report"}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-200 dark:border-[#1E293B]">
                    <button
                      onClick={() => handleVerifyReport(rep.id, "Verified")}
                      className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => handleVerifyReport(rep.id, "Rejected")}
                      className="flex-1 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition cursor-pointer"
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

      {/* TAB 3: Alert Logs */}
      {adminTab === "alerts" && (
        <div className="bg-white dark:bg-[#131B2A] rounded-3xl p-5 border border-slate-200 dark:border-[#1E293B] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E293B]">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Twilio SMS & WhatsApp Broadcast Logs
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Audit trail of all automated civic emergency dispatches
              </p>
            </div>
            <span className="text-xs font-bold text-[#EA580C] dark:text-[#FF8A00]">{alertLogs.length} Dispatches</span>
          </div>

          <div className="space-y-2">
            {alertLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B] flex items-start justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 dark:text-white">{log.zone_name || "Nagpur Ward"}</span>
                    <span className="text-[10px] text-[#EA580C] dark:text-[#FF8A00] font-mono">[{log.channel || "SMS"}]</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-xs font-medium">{log.message}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                    {log.status || "Delivered"}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {log.created_at ? new Date(log.created_at).toLocaleTimeString() : "Live"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Simulation Runner */}
      {adminTab === "simulation" && (
        <div className="bg-white dark:bg-[#131B2A] rounded-3xl p-6 border border-slate-200 dark:border-[#1E293B] shadow-xl space-y-5">
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              7-Stage Monsoon Crisis Demonstration Cycle
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click any stage to simulate rainfall escalation, hazard emergence, and alert triggering
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SIMULATION_STAGES.map((st) => (
              <button
                key={st.key}
                onClick={() => handleRunSimulationStage(st.key)}
                disabled={simLoading}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B] hover:border-[#FF8A00]/50 text-left transition flex flex-col justify-between space-y-2 active:scale-95 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-slate-900 dark:text-white">{st.title}</span>
                  <Play className="w-3.5 h-3.5 text-[#EA580C] dark:text-[#FF8A00]" />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{st.desc}</p>
              </button>
            ))}
          </div>

          {simLog && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs font-semibold text-emerald-700 dark:text-emerald-300 space-y-1 animate-in fade-in">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{simLog.description || simLog.message || "Simulation Completed"}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Photo Lightbox */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="relative max-w-2xl w-full bg-white dark:bg-[#131B2A] rounded-3xl overflow-hidden border border-slate-200 dark:border-[#1E293B] shadow-2xl">
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/90 text-white hover:bg-red-600 transition z-10 cursor-pointer"
            >
              <XCircle className="w-5 h-5" />
            </button>
            <img src={activePhoto} alt="Evidence" className="w-full max-h-[80vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
