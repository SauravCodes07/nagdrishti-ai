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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Hazard Reports Moderation
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Review citizen photo evidence, inspect AI vision confidence, and verify incident dispatches
            </p>
          </div>

          <button
            onClick={fetchReports}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-[#131B2A] border border-[#1E293B] text-slate-300 hover:text-white font-bold text-xs shadow-sm hover:bg-[#1E293B] active:scale-95 transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-teal-400" : ""}`} />
            <span>Refresh Submissions</span>
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {["All", "Pending", "Verified", "Rejected"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                filterStatus === st
                  ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                  : "bg-[#131B2A] text-slate-300 border border-[#1E293B] hover:bg-[#1E293B]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between hover:border-teal-500/40 transition"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-teal-400">
                        Incident #{rep.id}
                      </span>
                      <h3 className="text-sm font-black text-white">
                        {rep.zone_name || (rep.zone ? `Ward #${rep.zone}` : "Nagpur Urban Zone")}
                      </h3>
                    </div>

                    <span
                      className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${
                        isVerified
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : isRejected
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {rep.verification_status || "Pending"}
                    </span>
                  </div>

                  {/* Photo Evidence with Lightbox Trigger */}
                  {photoUrl ? (
                    <div
                      onClick={() => setActivePhoto(photoUrl)}
                      className="relative h-44 rounded-2xl overflow-hidden bg-black cursor-pointer group border border-[#1E293B]"
                    >
                      <img
                        src={photoUrl}
                        alt="Evidence"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5">
                        <Eye className="w-4 h-4 text-teal-400" />
                        <span>Inspect Evidence Photo</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 rounded-2xl bg-[#0B0F17] border border-[#1E293B] flex items-center justify-center text-slate-500 text-xs font-semibold">
                      No Photo Evidence Attached
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed font-medium line-clamp-2">
                    {rep.description || "Citizen waterlogging hazard report."}
                  </p>

                  {/* Hugging Face AI Vision Metrics */}
                  <div className="p-3 rounded-2xl bg-[#0B0F17] border border-[#1E293B] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px] font-black text-teal-400">
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
                      <span className="text-slate-400">Waterlogging:</span>
                      <strong className={rep.waterlogging_detected ? "text-red-400" : "text-slate-300"}>
                        {rep.waterlogging_detected ? "True (Confirmed)" : "False"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Moderation Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-[#1E293B]">
                  <button
                    onClick={() => handleModeration(rep.id, "Verified")}
                    disabled={updatingId === rep.id || isVerified}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition disabled:opacity-40 flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify</span>
                  </button>

                  <button
                    onClick={() => handleModeration(rep.id, "Rejected")}
                    disabled={updatingId === rep.id || isRejected}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-sm transition disabled:opacity-40 flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            );
          })}

          {filteredReports.length === 0 && (
            <div className="col-span-full p-12 text-center text-slate-500 text-xs bg-[#131B2A] border border-[#1E293B] rounded-3xl">
              No reports matching current moderation status filter.
            </div>
          )}
        </div>

        {/* Photo Lightbox Modal */}
        {activePhoto && (
          <div
            onClick={() => setActivePhoto(null)}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="relative max-w-2xl w-full bg-[#131B2A] rounded-3xl overflow-hidden border border-[#1E293B] shadow-2xl">
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
