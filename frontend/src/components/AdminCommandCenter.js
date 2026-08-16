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
} from "../lib/api";
import { getRiskColor } from "./MapComponent";

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

  const checkAuth = async () => {
    try {
      const data = await getCurrentUser();
      if (data && data.authenticated) {
        setCurrentUser(data.user);
        loadAdminData();
      }
    } catch (err) {
      console.warn("Auth check error:", err);
    } finally {
      setAuthChecked(true);
    }
  };

  // Check auth session on load
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
      // Update local state
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
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 shadow-xl font-sans">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 flex items-center justify-center mb-3">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Admin Command Center</h2>
          <p className="text-xs text-slate-500 mt-1">
            Municipal crisis management & resource dispatch authorization
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Admin Username
            </label>
            <input
              type="text"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Admin Password
            </label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-98 disabled:opacity-60 flex items-center justify-center space-x-2"
          >
            <Shield className="w-4 h-4" />
            <span>{loginLoading ? "Verifying Credentials..." : "Access Command Center"}</span>
          </button>
        </form>

        <div className="mt-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 text-center">
          Default seed credentials: <code className="font-bold text-slate-800">admin</code> / <code className="font-bold text-slate-800">admin123</code>
        </div>
      </div>
    );
  }

  const severeWards = priorityQueue.filter((z) => z.risk_category === "Severe").length;
  const highWards = priorityQueue.filter((z) => z.risk_category === "High").length;
  const dispatchedUnits = priorityQueue.filter((z) => z.dispatch_status === "Dispatched").length;
  const pendingReports = reportsList.filter((r) => r.verification_status === "Pending").length;

  const filteredReports = reportsList.filter((r) => {
    if (reportFilter === "All") return true;
    return r.verification_status === reportFilter;
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
    <div className="space-y-6 font-sans">
      {/* Top Header Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-black text-white">Nagpur Crisis Command Center</h1>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live Admin Mode
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Logged in as <strong className="text-slate-200">{currentUser?.username}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadAdminData}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center space-x-1.5 transition-colors border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Feed</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-red-500/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Monitored Wards</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{priorityQueue.length || zones.length}</span>
          <span className="text-[10px] text-slate-500">Active PostGIS boundaries</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-red-200 shadow-sm bg-red-50/30">
          <span className="text-[10px] font-bold uppercase text-red-600 block">Severe Wards</span>
          <span className="text-2xl font-black text-red-600 mt-1 block">{severeWards}</span>
          <span className="text-[10px] text-red-500">Risk index &gt; 75</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm bg-amber-50/30">
          <span className="text-[10px] font-bold uppercase text-amber-600 block">High Risk Wards</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">{highWards}</span>
          <span className="text-[10px] text-amber-500">Risk index 51–75</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-blue-600 block">Units Dispatched</span>
          <span className="text-2xl font-black text-blue-600 mt-1 block">{dispatchedUnits}</span>
          <span className="text-[10px] text-slate-500">Active municipal teams</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Pending Reports</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{pendingReports}</span>
          <span className="text-[10px] text-slate-500">Awaiting moderation</span>
        </div>
      </div>

      {/* Admin Tab Selector */}
      <div className="flex border-b border-slate-200 space-x-2 overflow-x-auto pb-1">
        {[
          { id: "priority", label: "Priority Queue", icon: Activity, count: priorityQueue.length },
          { id: "reports", label: "Citizen Reports", icon: FileText, count: pendingReports },
          { id: "alerts", label: "Emergency Alerts", icon: Radio, count: alertLogs.length },
          { id: "simulation", label: "Rainfall Simulation", icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-slate-800 text-slate-200" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Priority Queue Table */}
      {adminTab === "priority" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Ward Crisis Priority Queue</h2>
              <p className="text-xs text-slate-500">Ranked by risk score and municipal urgency</p>
            </div>
            <span className="text-xs text-slate-400 font-semibold">{priorityQueue.length} Wards Monitored</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Ward Name</th>
                  <th className="px-4 py-3">Crisis Score</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Rainfall</th>
                  <th className="px-4 py-3">Drainage</th>
                  <th className="px-4 py-3">Photo-Confirmed</th>
                  <th className="px-4 py-3">Dispatch Status</th>
                  <th className="px-4 py-3">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {priorityQueue.map((item, index) => {
                  const color = getRiskColor(item.risk_category, item.risk_score);
                  return (
                    <tr key={item.zone_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-900">#{index + 1}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">{item.zone_name}</td>
                      <td className="px-4 py-3.5 font-black text-slate-900">{item.risk_score} / 100</td>
                      <td className="px-4 py-3.5">
                        <span
                          style={{ backgroundColor: `${color}20`, color: color, borderColor: `${color}40` }}
                          className="font-bold px-2 py-0.5 rounded text-[10px] border"
                        >
                          {item.risk_category.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-700">{item.rainfall_mm ?? 0} mm</td>
                      <td className="px-4 py-3.5 text-slate-600">{Math.round(item.drainage_capacity * 100)}%</td>
                      <td className="px-4 py-3.5">
                        {item.photo_confirmed ? (
                          <span className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded text-[10px] border border-red-200">
                            📸 Confirmed
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <select
                          value={item.dispatch_status}
                          onChange={(e) => handleUpdateDispatch(item.zone_id, e.target.value)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border focus:outline-none ${
                            item.dispatch_status === "Dispatched"
                              ? "bg-amber-50 border-amber-300 text-amber-800"
                              : item.dispatch_status === "Resolved"
                              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                              : "bg-slate-100 border-slate-200 text-slate-700"
                          }`}
                        >
                          <option value="Unassigned">Unassigned</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>
                      <td className="px-4 py-3.5">
                        {item.dispatch_status !== "Dispatched" ? (
                          <button
                            onClick={() => handleUpdateDispatch(item.zone_id, "Dispatched")}
                            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-sm transition-colors"
                          >
                            Dispatch
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateDispatch(item.zone_id, "Resolved")}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-colors"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Citizen Reports Moderation */}
      {adminTab === "reports" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Citizen Hazard Reports Moderation</h2>
              <p className="text-xs text-slate-500">Review AI Vision detection and verify civic action</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
              {["All", "Pending", "Verified", "Rejected"].map((f) => (
                <button
                  key={f}
                  onClick={() => setReportFilter(f)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    reportFilter === f ? "bg-white text-slate-900 shadow-sm font-bold" : "hover:text-slate-900"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((rep) => (
              <div
                key={rep.id}
                className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Report #{rep.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        rep.verification_status === "Verified"
                          ? "bg-emerald-100 text-emerald-800"
                          : rep.verification_status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {rep.verification_status}
                    </span>
                  </div>

                  {rep.photo && (
                    <div className="rounded-lg overflow-hidden h-36 bg-black flex items-center justify-center">
                      <img
                        src={rep.photo}
                        alt="Hazard"
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  )}

                  <p className="text-xs text-slate-700 font-medium line-clamp-2">
                    {rep.description || "No description provided."}
                  </p>

                  {/* AI Vision tags */}
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pothole:</span>
                      <strong className={rep.pothole_detected ? "text-red-600" : "text-slate-600"}>
                        {rep.pothole_detected ? `Detected (${Math.round((rep.pothole_confidence || 0) * 100)}%)` : "No"}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Waterlogging:</span>
                      <strong className={rep.waterlogging_detected ? "text-red-600" : "text-slate-600"}>
                        {rep.waterlogging_detected ? `Detected (${Math.round((rep.waterlogging_confidence || 0) * 100)}%)` : "No"}
                      </strong>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                      <span>Assigned Ward:</span>
                      <strong className="text-slate-700">{rep.zone_name || "Nagpur"}</strong>
                    </div>
                  </div>
                </div>

                {/* Moderation Actions */}
                <div className="flex items-center space-x-2 pt-2 border-t border-slate-200/60">
                  <button
                    onClick={() => handleVerifyReport(rep.id, "Verified")}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1 transition-colors shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify</span>
                  </button>
                  <button
                    onClick={() => handleVerifyReport(rep.id, "Rejected")}
                    className="flex-1 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs flex items-center justify-center space-x-1 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}

            {filteredReports.length === 0 && (
              <div className="col-span-full text-center py-10 text-xs text-slate-400">
                No reports found in this category.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Emergency Alert Audit Log */}
      {adminTab === "alerts" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Emergency Dispatches Audit Log</h2>
            <p className="text-xs text-slate-500">Automated Twilio SMS and WhatsApp notifications</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Ward</th>
                  <th className="px-4 py-3">Severity Trigger</th>
                  <th className="px-4 py-3">Medium</th>
                  <th className="px-4 py-3">Delivery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alertLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-500">
                      {new Date(log.sent_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">{log.zone_name || `Zone #${log.zone}`}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-700 border border-red-200">
                        {log.risk_category_at_send}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{log.channel}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600">{log.status}</td>
                  </tr>
                ))}
                {alertLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400">
                      No automated alerts recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: 8-Stage Rainfall Crisis Simulation Controller */}
      {adminTab === "simulation" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-fadeIn font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-900">8-Stage Crisis Lifecycle Demonstration</h2>
              <p className="text-xs text-slate-500">
                Step-by-step end-to-end simulation driver as specified in Project Build Context
              </p>
            </div>
          </div>

          {/* Stepper Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SIMULATION_STAGES.map((st, idx) => {
              const isSelected = simStage === st.key;
              return (
                <div
                  key={st.key}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-amber-50 border-amber-400 ring-2 ring-amber-300"
                      : "bg-slate-50 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-xs font-black text-slate-900 block">{st.title}</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{st.desc}</p>
                  </div>

                  <button
                    onClick={() => handleRunSimulationStage(st.key)}
                    disabled={simLoading}
                    className="mt-3 w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-1 transition-transform active:scale-95 disabled:opacity-50"
                  >
                    <Play className="w-3 h-3 text-amber-400" />
                    <span>Trigger Stage</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Simulation Output Log */}
          {simLog && (
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 border border-slate-800 animate-fadeIn">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase">
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulation Stage Output</span>
              </div>
              <p className="text-xs font-bold text-amber-300">{simLog.description}</p>
              <p className="text-[11px] text-slate-400">
                Affected {simLog.affected_zones_count} zone(s) at {new Date(simLog.timestamp).toLocaleTimeString()}.
                Risk scores and queue dynamically updated.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
