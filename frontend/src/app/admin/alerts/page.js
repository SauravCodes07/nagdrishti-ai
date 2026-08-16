"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "../../../components/layouts/AdminLayout";
import { getAlertLogs } from "../../../lib/api";
import {
  BellRing,
  Radio,
  Clock,
  MapPin,
  RefreshCw,
  PhoneCall,
  Search,
  ShieldAlert,
  ShieldCheck,
  Send,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminAlertLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await getAlertLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Alert logs error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 20000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter((item) => {
    const matchSearch =
      (item.zone_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.recipient || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.message || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchSeverity =
      severityFilter === "All" || (item.severity || "").toLowerCase() === severityFilter.toLowerCase();
    return matchSearch && matchSeverity;
  });

  const criticalCount = logs.filter((a) => (a.severity || "").toLowerCase().includes("critical") || (a.severity || "").toLowerCase().includes("severe")).length;
  const smsCount = logs.filter((a) => (a.channel || "").toLowerCase().includes("sms")).length;
  const whatsappCount = logs.filter((a) => (a.channel || "").toLowerCase().includes("whatsapp")).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header & Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-[#111111] tracking-tight">
              Emergency Alert Dispatch Log
            </h1>
            <p className="text-xs text-[#666666] font-medium mt-0.5">
              Automated Twilio SMS and WhatsApp notifications dispatched to municipal QRT units and ward supervisors
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAlerts}
              className="px-3 py-2 rounded-xl bg-white border border-[#E5E5E5] text-xs font-bold text-[#111111] hover:bg-neutral-50 shadow-2xs flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Logs</span>
            </button>

            {/* THE SINGLE PRIMARY ACTION CTA ON THIS SCREEN */}
            <a
              href="/admin/simulate"
              className="px-4 py-2 rounded-xl bg-[#FF8A00] hover:bg-[#E67C00] text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Trigger Test Broadcast</span>
            </a>
          </div>
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E5] text-center shadow-xs">
            <div className="text-[10px] text-[#666666] font-bold uppercase">Total Dispatches</div>
            <div className="text-xl font-black text-[#111111] mt-0.5">{logs.length}</div>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-red-200 text-center shadow-xs bg-red-50/30">
            <div className="text-[10px] text-red-700 font-bold uppercase">Critical Escalations</div>
            <div className="text-xl font-black text-red-700 mt-0.5">{criticalCount}</div>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E5] text-center shadow-xs">
            <div className="text-[10px] text-[#666666] font-bold uppercase">Twilio SMS</div>
            <div className="text-xl font-black text-[#111111] mt-0.5">{smsCount}</div>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E5] text-center shadow-xs">
            <div className="text-[10px] text-[#666666] font-bold uppercase">WhatsApp Gateway</div>
            <div className="text-xl font-black text-[#22A447] mt-0.5">{whatsappCount}</div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ward name, recipient phone, or message text..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E5E5] rounded-2xl text-xs text-[#111111] placeholder:text-[#999999] focus:outline-hidden focus:border-[#FFC107] shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {["All", "Critical", "Warning", "Advisory"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition shadow-2xs shrink-0 ${
                  severityFilter === sev
                    ? "bg-[#111111] text-white"
                    : "bg-white text-[#666666] border border-[#E5E5E5] hover:bg-neutral-50"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts Table */}
        <div className="bg-white rounded-3xl border border-[#E5E5E5] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F7F7] text-[#666666] uppercase text-[10px] font-bold border-b border-[#E5E5E5]">
                <tr>
                  <th className="px-5 py-3.5">Time & Zone</th>
                  <th className="px-4 py-3.5">Severity</th>
                  <th className="px-4 py-3.5">Channel</th>
                  <th className="px-4 py-3.5">Recipient</th>
                  <th className="px-5 py-3.5">Alert Dispatch Body</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {filteredLogs.map((alert) => (
                  <tr key={alert.id} className="hover:bg-neutral-50/60 transition">
                    
                    {/* Time & Ward */}
                    <td className="px-5 py-3.5 text-[#111111]">
                      <div className="font-bold">{alert.zone_name || "Nagpur Citywide"}</div>
                      <div className="text-[10px] text-[#666666] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-[#FF8A00]" />
                        <span>
                          {alert.created_at
                            ? new Date(alert.created_at).toLocaleString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Live"}
                        </span>
                      </div>
                    </td>

                    {/* Severity Badge */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          (alert.severity || "").toLowerCase().includes("critical")
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : (alert.severity || "").toLowerCase().includes("warning")
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : "bg-neutral-100 text-neutral-700 border border-neutral-200"
                        }`}
                      >
                        {alert.severity || "Alert"}
                      </span>
                    </td>

                    {/* Channel */}
                    <td className="px-4 py-3.5 font-semibold text-[#111111] capitalize">
                      {alert.channel || "Broadcast"}
                    </td>

                    {/* Recipient */}
                    <td className="px-4 py-3.5 text-[#666666] font-mono text-[11px]">
                      {alert.recipient || "Disaster QRT Units"}
                    </td>

                    {/* Message Body */}
                    <td className="px-5 py-3.5 text-[#111111] max-w-md">
                      <div className="bg-[#F7F7F7] p-2.5 rounded-xl border border-[#E5E5E5] text-[11px] leading-relaxed">
                        {alert.message}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
