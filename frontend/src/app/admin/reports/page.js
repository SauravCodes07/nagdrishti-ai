"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "../../../components/layouts/AdminLayout";
import { getReports, verifyReport } from "../../../lib/api";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Eye,
  X,
  MapPin,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await getReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Reports load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    const interval = setInterval(loadReports, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async (reportId, newStatus) => {
    setActionLoadingId(reportId);
    try {
      await verifyReport(reportId, newStatus);
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, verification_status: newStatus } : r))
      );
    } catch (err) {
      console.error("Verify report error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredReports = activeFilter === "All"
    ? reports
    : reports.filter((r) => (r.verification_status || "pending").toLowerCase() === activeFilter.toLowerCase());

  const pendingCount = reports.filter((r) => (r.verification_status || "pending") === "pending").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header & Primary Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-[#111111] tracking-tight">
              Hazard Reports Moderation
            </h1>
            <p className="text-xs text-[#666666] font-medium mt-0.5">
              Review, verify, and resolve citizen incident submissions & Hugging Face AI vision classifications
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadReports}
              className="px-3 py-2 rounded-xl bg-white border border-[#E5E5E5] text-xs font-bold text-[#111111] hover:bg-neutral-50 shadow-2xs flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            {/* THE SINGLE PRIMARY ACTION CTA ON THIS SCREEN */}
            <button
              onClick={() => setActiveFilter("Pending")}
              className="px-4 py-2 rounded-xl bg-[#FF8A00] hover:bg-[#E67C00] text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Filter Pending ({pendingCount})</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {["All", "Pending", "Verified", "Resolved", "Rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs ${
                activeFilter === status
                  ? "bg-[#111111] text-white"
                  : "bg-white text-[#666666] border border-[#E5E5E5] hover:bg-neutral-50"
              }`}
            >
              {status} {status === "All" ? `(${reports.length})` : `(${reports.filter((r) => (r.verification_status || "pending").toLowerCase() === status.toLowerCase()).length})`}
            </button>
          ))}
        </div>

        {/* Reports Grid */}
        {filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-4 border border-[#E5E5E5] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#111111] transition"
              >
                <div className="space-y-3">
                  
                  {/* Photo Thumbnail or Placeholder */}
                  {report.photo ? (
                    <div
                      onClick={() => setSelectedPhoto(report.photo)}
                      className="relative h-44 rounded-2xl overflow-hidden bg-neutral-900 cursor-pointer group"
                    >
                      <img
                        src={report.photo}
                        alt="Incident"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1.5">
                        <Eye className="w-4 h-4" />
                        <span>Enlarge Photo</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 rounded-2xl bg-[#F7F7F7] border border-dashed border-[#E5E5E5] flex items-center justify-center text-[#666666] text-xs font-medium">
                      No Photo Attached
                    </div>
                  )}

                  {/* Header Row: ID, Ward & Verification Tag */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-extrabold text-sm text-[#111111]">
                        Report #{report.id}
                      </div>
                      <div className="text-[11px] text-[#666666] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#FF8A00]" />
                        <span>{report.zone_name || `Lat: ${report.lat?.toFixed(4)}, Lng: ${report.lng?.toFixed(4)}`}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        report.verification_status === "verified"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : report.verification_status === "resolved"
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : report.verification_status === "rejected"
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {report.verification_status || "Pending"}
                    </span>
                  </div>

                  {/* Hugging Face AI Vision Feedback Badge */}
                  <div className="p-2.5 rounded-xl bg-[#F7F7F7] border border-[#E5E5E5] text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="flex items-center gap-1 text-[#111111]">
                        <Sparkles className="w-3.5 h-3.5 text-[#FF8A00]" />
                        <span>HF Vision AI</span>
                      </span>
                      <span
                        className={`text-[10px] uppercase font-black ${
                          report.ai_confidence
                            ? report.is_waterlogged
                              ? "text-red-600"
                              : "text-emerald-600"
                            : "text-neutral-500"
                        }`}
                      >
                        {report.ai_confidence
                          ? `${report.is_waterlogged ? "Flood" : "Clear"} (${(report.ai_confidence * 100).toFixed(0)}%)`
                          : "AI Token Queued"}
                      </span>
                    </div>
                  </div>

                  {/* Description Text */}
                  {report.description && (
                    <p className="text-xs text-[#111111] line-clamp-3 bg-[#F7F7F7] p-2.5 rounded-xl border border-[#E5E5E5]">
                      {report.description}
                    </p>
                  )}
                </div>

                {/* Moderation Actions */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-[#E5E5E5]">
                  <button
                    disabled={actionLoadingId === report.id}
                    onClick={() => handleVerify(report.id, "verified")}
                    className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition flex items-center justify-center gap-1"
                    title="Verify Report"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify</span>
                  </button>

                  <button
                    disabled={actionLoadingId === report.id}
                    onClick={() => handleVerify(report.id, "resolved")}
                    className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition flex items-center justify-center gap-1"
                    title="Mark Resolved"
                  >
                    <span>Resolve</span>
                  </button>

                  <button
                    disabled={actionLoadingId === report.id}
                    onClick={() => handleVerify(report.id, "rejected")}
                    className="py-1.5 px-2.5 rounded-xl bg-neutral-100 hover:bg-red-100 hover:text-red-700 text-neutral-600 text-[11px] font-bold transition flex items-center justify-center"
                    title="Reject Spam / False Report"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 border border-[#E5E5E5] text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="font-extrabold text-sm text-[#111111]">
              No Reports in this Category
            </h3>
            <p className="text-xs text-[#666666]">
              All citizen submissions in &apos;{activeFilter}&apos; have been processed.
            </p>
          </div>
        )}

        {/* Fullsize Photo Modal */}
        <AnimatePresence>
          {selectedPhoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setSelectedPhoto(null)}
            >
              <div className="relative max-w-2xl max-h-[85vh] bg-black rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={selectedPhoto}
                  alt="Enlarged report"
                  className="w-full h-full object-contain max-h-[85vh]"
                />
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/70 text-white hover:bg-black transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </AdminLayout>
  );
}
