"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Layers,
  Search,
  Trash2,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../../../components/layouts/AdminLayout";
import { getReports, verifyReport, deleteReport, API_BASE } from "../../../lib/api";
import {
  HoverLiftCard,
  SpotlightCard,
  BorderBeam,
  BlurFade,
  StaggerGrid,
  StaggerItem,
} from "../../../components/motion";

export default function AdminReportsModerationPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [activePhoto, setActivePhoto] = useState(null);
  const [modifyingId, setModifyingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

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

  const handleModerate = async (reportId, status) => {
    try {
      setModifyingId(reportId);
      // Optimistic local state update for instant UI feedback
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, verification_status: status } : r))
      );
      await verifyReport(reportId, status);
    } catch (err) {
      alert("Failed to moderate report: " + err.message);
      await fetchReports();
    } finally {
      setModifyingId(null);
    }
  };

  const handleDelete = async (reportId) => {
    try {
      setModifyingId(reportId);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      setConfirmDeleteId(null);
      await deleteReport(reportId);
    } catch (err) {
      alert("Failed to delete report: " + err.message);
      await fetchReports();
    } finally {
      setModifyingId(null);
    }
  };

  const handleSwipeModerate = (reportId, offset, velocity) => {
    const swipeThreshold = 80;
    const isFast = Math.abs(velocity.x) > 400;

    if (offset.x > swipeThreshold || (isFast && velocity.x > 0)) {
      handleModerate(reportId, "Verified");
    } else if (offset.x < -swipeThreshold || (isFast && velocity.x < 0)) {
      handleModerate(reportId, "Rejected");
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesFilter =
      filterStatus === "All" ||
      (r.verification_status || "Pending").toLowerCase() === filterStatus.toLowerCase();

    const matchesSearch =
      !searchTerm ||
      (r.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.zone_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(r.id).includes(searchTerm);

    return matchesFilter && matchesSearch;
  });

  const pendingCount = reports.filter((r) => (r.verification_status || "Pending") === "Pending").length;
  const verifiedCount = reports.filter((r) => r.verification_status === "Verified").length;
  const rejectedCount = reports.filter((r) => r.verification_status === "Rejected").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <BlurFade delay={0.05}>
            <h1 className="text-2xl sm:text-[32px] font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Hazard Moderation
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] font-normal mt-0.5">
              Review crowdsourced photo evidence, Hugging Face Vision AI detection metrics, and verify ground truth
            </p>
          </BlurFade>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={fetchReports}
            disabled={loading}
            className="h-10 px-3.5 rounded-xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#CBD5E1] dark:border-[#334155] text-[#334155] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] font-medium text-xs shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#0F766E] dark:text-[#14B8A6]" : ""}`} />
            <span>Sync Reports</span>
          </motion.button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full sm:w-auto no-scrollbar">
            {[
              { id: "All", label: `All (${reports.length})` },
              { id: "Pending", label: `Pending (${pendingCount})` },
              { id: "Verified", label: `Verified (${verifiedCount})` },
              { id: "Rejected", label: `Rejected (${rejectedCount})` },
            ].map((st) => {
              const isSelected = filterStatus === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setFilterStatus(st.id)}
                  className={`relative h-8 px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    isSelected
                      ? "text-white dark:text-[#042F2E]"
                      : "text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="active-reports-filter"
                      className="absolute inset-0 bg-[#0F766E] dark:bg-[#14B8A6] rounded-lg -z-10 shadow-sm"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {!isSelected && (
                    <span className="absolute inset-0 bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-lg -z-20" />
                  )}
                  <span className="relative z-10">{st.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search description, ID, zone..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-normal focus:outline-none focus:border-[#0F766E] dark:focus:border-[#14B8A6]"
            />
          </div>
        </div>

        {/* Grid of Moderation Cards */}
        {loading ? (
          <div className="text-center py-16 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#0F766E] dark:text-[#14B8A6]" />
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">Loading citizen reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-12 text-center space-y-2 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-[#16A34A] mx-auto" />
            <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">No Hazard Reports in Filter</h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">All citizen submissions are current and up to date.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map((rep) => {
                const photoUrl = rep.photo
                  ? rep.photo.startsWith("http")
                    ? rep.photo
                    : `${API_BASE}${rep.photo}`
                  : null;

                const isVerified = rep.verification_status === "Verified";
                const isRejected = rep.verification_status === "Rejected";

                return (
                  <StaggerItem key={rep.id}>
                    <motion.div
                      layout
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.35}
                      onDragEnd={(e, info) => handleSwipeModerate(rep.id, info.offset, info.velocity)}
                      className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex flex-col justify-between space-y-4 touch-pan-y cursor-grab active:cursor-grabbing hover:border-[#0F766E]/40 dark:hover:border-[#14B8A6]/40 transition-colors"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-[#0F766E] dark:text-[#14B8A6]">
                            Incident #{rep.id}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                                isVerified
                                  ? "bg-[#DCFCE7] text-[#166534] dark:bg-emerald-500/20 dark:text-[#4ADE80]"
                                  : isRejected
                                  ? "bg-[#FEE2E2] text-[#991B1B] dark:bg-red-500/20 dark:text-[#F87171]"
                                  : "bg-[#FEF9C3] text-[#854D0E] dark:bg-amber-500/20 dark:text-[#FDE047]"
                              }`}
                            >
                              {rep.verification_status || "Pending"}
                            </span>

                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(rep.id)}
                              className="p-1 rounded text-[#94A3B8] hover:text-[#DC2626] hover:bg-red-50 dark:hover:bg-red-500/10 transition cursor-pointer"
                              title="Delete Incident"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {photoUrl ? (
                          <div
                            onClick={() => setActivePhoto(photoUrl)}
                            className="h-36 rounded-xl overflow-hidden cursor-pointer relative bg-black border border-[#E2E8F0] dark:border-[#243244] group"
                          >
                            <img src={photoUrl} alt="Evidence" className="w-full h-full object-cover transition duration-200 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                              <Eye className="w-4 h-4" />
                              <span>View Full Size</span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-24 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] flex items-center justify-center text-xs text-[#94A3B8] border border-dashed border-[#CBD5E1] dark:border-[#334155]">
                            No Photo Evidence Attached
                          </div>
                        )}

                        <p className="text-xs text-[#334155] dark:text-[#CBD5E1] line-clamp-2 leading-relaxed">
                          {rep.description}
                        </p>

                        <div className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#243244] space-y-1.5 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-[#64748B] dark:text-[#94A3B8]">Waterlogging:</span>
                            <strong className={rep.waterlogging_detected ? "text-[#DC2626] font-semibold" : "text-[#16A34A] font-semibold"}>
                              {rep.waterlogging_detected ? "Detected" : "Clear"}
                            </strong>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[#64748B] dark:text-[#94A3B8]">Pothole Hazard:</span>
                            <strong className={rep.pothole_detected ? "text-[#DC2626] font-semibold" : "text-[#16A34A] font-semibold"}>
                              {rep.pothole_detected ? "Detected" : "Clear"}
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#243244]">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleModerate(rep.id, "Verified")}
                          disabled={modifyingId === rep.id || isVerified}
                          className={`flex-1 h-9 rounded-lg font-semibold text-xs transition cursor-pointer shadow-sm ${
                            isVerified
                              ? "bg-[#DCFCE7] text-[#166534] dark:bg-emerald-500/20 dark:text-[#4ADE80] cursor-default"
                              : "bg-[#16A34A] hover:bg-[#15803D] text-white"
                          }`}
                        >
                          {isVerified ? "Verified ✓" : "Verify"}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleModerate(rep.id, "Rejected")}
                          disabled={modifyingId === rep.id || isRejected}
                          className={`flex-1 h-9 rounded-lg font-semibold text-xs transition cursor-pointer shadow-sm ${
                            isRejected
                              ? "bg-[#FEE2E2] text-[#991B1B] dark:bg-red-500/20 dark:text-[#F87171] cursor-default"
                              : "bg-[#DC2626] hover:bg-[#B91C1C] text-white"
                          }`}
                        >
                          {isRejected ? "Rejected ✕" : "Reject"}
                        </motion.button>
                      </div>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </StaggerGrid>
          </AnimatePresence>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {confirmDeleteId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-sm w-full bg-[#FFFFFF] dark:bg-[#111C2E] rounded-2xl p-6 border border-[#E2E8F0] dark:border-[#243244] shadow-2xl space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 text-[#DC2626] flex items-center justify-center">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">Delete Incident Report</h3>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Report #{confirmDeleteId}</p>
                  </div>
                </div>

                <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                  Are you sure you want to delete this crowdsourced incident report? This action cannot be undone.
                </p>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="px-4 py-2 rounded-xl bg-[#F1F5F9] dark:bg-[#162235] text-[#475569] dark:text-[#CBD5E1] font-semibold text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(confirmDeleteId)}
                    className="px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-xs transition cursor-pointer shadow-sm"
                  >
                    Confirm Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Photo Modal */}
        <AnimatePresence>
          {activePhoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePhoto(null)}
              className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="relative max-w-2xl w-full bg-[#FFFFFF] dark:bg-[#111C2E] rounded-2xl overflow-hidden p-2 border border-[#E2E8F0] dark:border-[#243244] shadow-2xl"
              >
                <button
                  onClick={() => setActivePhoto(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/70 text-white hover:bg-[#DC2626] transition z-10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <img src={activePhoto} alt="Evidence" className="w-full max-h-[75vh] object-contain rounded-xl" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
