"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Bot,
  MapPin,
  X,
  Sparkles,
} from "lucide-react";
import AdminLayout from "../../../components/layouts/AdminLayout";
import { getReports, verifyReport, API_BASE } from "../../../lib/api";

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [activePhoto, setActivePhoto] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getReports();
      if (Array.isArray(data)) {
        setReports(data);
      }
    } catch (err) {
      console.error("Reports fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleModeration = async (reportId, newStatus) => {
    try {
      setUpdatingId(reportId);
      await verifyReport(reportId, newStatus);
      await fetchReports();
    } catch (err) {
      alert("Moderation error: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (filterStatus === "All") return true;
    return (r.verification_status || "Pending").toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Hazard Reports Moderation
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Review citizen photo evidence, inspect AI vision confidence, and verify incident dispatches
            </p>
          </div>

          <button
            onClick={fetchReports}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs shadow-sm hover:bg-slate-50 active:scale-95 transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-teal-600" : ""}`} />
            <span>Refresh Submissions</span>
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2">
          {["All", "Pending", "Verified", "Rejected"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filterStatus === st
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-white dark:bg-[#131B2A] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((rep) => {
            const isVerified = rep.verification_status === "Verified";
            const isRejected = rep.verification_status === "Rejected";
            const photoUrl = rep.photo
              ? rep.photo.startsWith("http")
                ? rep.photo
                : `${API_BASE}${rep.photo}`
              : null;

            return (
              <div
                key={rep.id}
                className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400">
                        Incident #{rep.id}
                      </span>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        {rep.zone ? `Ward #${rep.zone}` : "Nagpur Urban Zone"}
                      </h3>
                    </div>

                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isVerified
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : isRejected
                          ? "bg-red-500/10 text-red-600 border border-red-500/20"
                          : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                      }`}
                    >
                      {rep.verification_status || "Pending"}
                    </span>
                  </div>

                  {/* Photo Evidence with Lightbox Trigger */}
                  {photoUrl ? (
                    <div
                      onClick={() => setActivePhoto(photoUrl)}
                      className="relative h-40 rounded-2xl overflow-hidden bg-slate-950 cursor-pointer group border border-slate-200 dark:border-slate-800"
                    >
                      <img
                        src={photoUrl}
                        alt="Evidence"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5">
                        <Eye className="w-4 h-4" />
                        <span>Enlarge Photo</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 text-xs font-semibold">
                      No Photo Attached
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium line-clamp-2">
                    {rep.description || "Citizen waterlogging hazard report."}
                  </p>

                  {/* Hugging Face AI Vision Metrics */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px] font-black text-teal-600 dark:text-teal-400">
                      <div className="flex items-center gap-1">
                        <Bot className="w-3.5 h-3.5" />
                        <span>AI Vision Result</span>
                      </div>
                      <span>
                        {rep.waterlogging_confidence
                          ? `${(rep.waterlogging_confidence * 100).toFixed(0)}% Confidence`
                          : "Queued"}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Waterlogging:</span>
                      <strong className={rep.waterlogging_detected ? "text-red-500" : "text-slate-700 dark:text-slate-300"}>
                        {rep.waterlogging_detected ? "True (Confirmed)" : "False"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Moderation Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleModeration(rep.id, "Verified")}
                    disabled={updatingId === rep.id || isVerified}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify</span>
                  </button>

                  <button
                    onClick={() => handleModeration(rep.id, "Rejected")}
                    disabled={updatingId === rep.id || isRejected}
                    className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Photo Lightbox Modal */}
        {activePhoto && (
          <div
            onClick={() => setActivePhoto(null)}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="relative max-w-2xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
              <button
                onClick={() => setActivePhoto(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/80 text-white hover:bg-red-600 transition z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={activePhoto}
                alt="Full Evidence"
                className="w-full max-h-[80vh] object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
