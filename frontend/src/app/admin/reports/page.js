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
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Hazard Reports Moderation
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-0.5">
              Review citizen photo evidence, inspect AI vision confidence, and verify incident dispatches
            </p>
          </div>

          <button
            onClick={fetchReports}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold text-xs shadow-sm hover:bg-slate-100 dark:hover:bg-[#1E293B] active:scale-95 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#EA580C] dark:text-[#FF8A00]" : ""}`} />
            <span>Refresh Submissions</span>
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {["All", "Pending", "Verified", "Rejected"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                filterStatus === st
                  ? "bg-[#EA580C] dark:bg-[#FF8A00] text-white dark:text-slate-950 shadow-md shadow-[#FF8A00]/20"
                  : "bg-white dark:bg-[#131B2A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E293B] hover:bg-slate-100 dark:hover:bg-[#1E293B]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Reports Grid */}
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
                className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#EA580C] dark:text-[#FF8A00]">
                      Incident #{rep.id}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        rep.verification_status === "Verified"
                          ? "bg-emerald-500 text-white"
                          : rep.verification_status === "Rejected"
                          ? "bg-red-500 text-white"
                          : "bg-amber-500 text-white"
                      }`}
                    >
                      {rep.verification_status || "Pending"}
                    </span>
                  </div>

                  {photoUrl ? (
                    <div
                      onClick={() => setActivePhoto(photoUrl)}
                      className="h-44 rounded-2xl overflow-hidden cursor-pointer relative group bg-black"
                    >
                      <img src={photoUrl} alt="Evidence" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-black text-white transition">
                        View Full Photo
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] flex items-center justify-center text-xs text-slate-400 font-semibold border border-dashed border-slate-200 dark:border-[#1E293B]">
                      No Photo Evidence Attached
                    </div>
                  )}

                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
                    {rep.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>GPS: {rep.latitude?.toFixed(4)}, {rep.longitude?.toFixed(4)}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{rep.zone_name || "Nagpur Zone"}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-[#1E293B] flex items-center gap-2">
                  <button
                    onClick={() => handleModeration(rep.id, "Verified")}
                    disabled={updatingId === rep.id}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                  >
                    Verify & Dispatch
                  </button>

                  <button
                    onClick={() => handleModeration(rep.id, "Rejected")}
                    disabled={updatingId === rep.id}
                    className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Photo Lightbox */}
        {activePhoto && (
          <div
            onClick={() => setActivePhoto(null)}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="relative max-w-3xl w-full bg-white dark:bg-[#131B2A] rounded-3xl overflow-hidden p-2">
              <button
                onClick={() => setActivePhoto(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/70 text-white hover:bg-red-600 transition z-10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <img src={activePhoto} alt="Evidence" className="w-full max-h-[80vh] object-contain rounded-2xl" />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
