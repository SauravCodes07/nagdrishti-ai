"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  Mail,
  Calendar,
  KeyRound,
  FileText,
  Filter,
  ShieldAlert,
  Edit2,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../../../components/layouts/AdminLayout";
import { getAdminUsers } from "../../../lib/api";
import {
  HoverLiftCard,
  SpotlightCard,
  AnimatedCounter,
  StaggerGrid,
  StaggerItem,
  BlurFade,
} from "../../../components/motion";

const DEFAULT_ADMIN_USERS = [
  { id: 1, username: "control_officer", name: "Saurav (NMC Command)", email: "control@nagpur.gov.in", role: "admin", is_staff: true, created_at: "2026-08-20T00:00:00Z", reports_count: 14 },
  { id: 2, username: "zone2_field_lead", name: "R. Sharma (Zone 2 QRT)", email: "sharma.qrt@nagpur.gov.in", role: "admin", is_staff: true, created_at: "2026-08-21T00:00:00Z", reports_count: 22 },
  { id: 3, username: "nagpur_citizen_1", name: "Priya Deshmukh", email: "priya.d@gmail.com", role: "citizen", is_staff: false, created_at: "2026-08-22T00:00:00Z", reports_count: 6 },
  { id: 4, username: "nagpur_citizen_2", name: "Amit Wankhede", email: "amit.w@gmail.com", role: "citizen", is_staff: false, created_at: "2026-08-23T00:00:00Z", reports_count: 3 },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState(DEFAULT_ADMIN_USERS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAdminUsers();
      if (res && Array.isArray(res.users) && res.users.length > 0) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = (userId) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newIsStaff = !u.is_staff;
          const newRole = newIsStaff ? "admin" : "citizen";
          setSuccessMsg(`Updated @${u.username} permissions to ${newRole.toUpperCase()}`);
          setTimeout(() => setSuccessMsg(""), 3500);
          return { ...u, is_staff: newIsStaff, role: newRole };
        }
        return u;
      })
    );
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "admin" && (u.is_staff || u.role === "admin")) ||
      (roleFilter === "citizen" && !u.is_staff && u.role === "citizen");

    return matchesSearch && matchesRole;
  });

  const citizenCount = users.filter((u) => !u.is_staff).length;
  const officerCount = users.filter((u) => u.is_staff).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <BlurFade delay={0.05}>
            <h1 className="text-2xl sm:text-[28px] font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Registered Accounts & Credentials
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] font-normal mt-0.5">
              Directory of citizens, disaster response officers, and authentication providers
            </p>
          </BlurFade>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={fetchUsers}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-[#FFFFFF] dark:bg-[#111C2E] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] transition shadow-sm flex items-center gap-1.5 self-start cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#0F766E] dark:text-[#14B8A6]" : ""}`} />
            <span>Refresh Users</span>
          </motion.button>
        </div>

        {/* Success Alert */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3.5 rounded-xl bg-[#DCFCE7] dark:bg-green-500/15 border border-green-200 dark:border-green-500/30 text-[#166534] dark:text-[#4ADE80] text-xs font-semibold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Metric Cards with AnimatedCounters */}
        <StaggerGrid className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StaggerItem>
            <SpotlightCard className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] shadow-sm space-y-1 h-full">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                Total Accounts
              </span>
              <p className="text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                <AnimatedCounter value={users.length} />
              </p>
            </SpotlightCard>
          </StaggerItem>

          <StaggerItem>
            <SpotlightCard className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] shadow-sm space-y-1 h-full">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#14B8A6]">
                Registered Citizens
              </span>
              <p className="text-2xl font-bold text-[#0F766E] dark:text-[#14B8A6]">
                <AnimatedCounter value={citizenCount} />
              </p>
            </SpotlightCard>
          </StaggerItem>

          <StaggerItem>
            <SpotlightCard className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] shadow-sm space-y-1 h-full">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#854D0E] dark:text-[#FDE68A]">
                Municipal Officers
              </span>
              <p className="text-2xl font-bold text-[#854D0E] dark:text-[#FDE68A]">
                <AnimatedCounter value={officerCount} />
              </p>
            </SpotlightCard>
          </StaggerItem>
        </StaggerGrid>

        {/* Filters Bar */}
        <div className="bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by username, name, or email..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#CBD5E1] dark:border-[#334155] text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#14B8A6] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#CBD5E1] dark:border-[#334155] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#14B8A6]"
            >
              <option value="all">All Roles</option>
              <option value="citizen">Citizens Only</option>
              <option value="admin">Officers Only</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] dark:bg-[#0B0F17] border-b border-[#E2E8F0] dark:border-[#243244] text-[#64748B] dark:text-[#94A3B8] font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role & Access</th>
                  <th className="py-3.5 px-4">Authentication</th>
                  <th className="py-3.5 px-4">Reports Filed</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#243244]">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
                      Loading user directory...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
                      No accounts found matching your query.
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {filteredUsers.map((u) => (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={u.id}
                        className="hover:bg-[#F8FAFC] dark:hover:bg-[#162235] transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#CCFBF1] dark:bg-teal-500/20 text-[#0F766E] dark:text-[#5EEAD4] font-bold flex items-center justify-center shrink-0">
                              {u.name ? u.name.charAt(0).toUpperCase() : u.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                                {u.name || u.username}
                              </p>
                              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                                @{u.username} • {u.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {u.is_staff || u.role === "admin" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#854D0E] dark:bg-amber-500/20 dark:text-[#FDE68A] text-[10px] font-bold border border-[#F59E0B]/30">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Municipal Officer</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] dark:bg-green-500/20 dark:text-[#4ADE80] text-[10px] font-bold border border-green-500/30">
                              <UserCheck className="w-3 h-3" />
                              <span>Verified Citizen</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-[11px] font-mono text-[#475569] dark:text-[#CBD5E1]">
                            {u.email && u.picture ? "Google SSO" : "Local Database"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                          {u.reports_count || u.report_count || 0} Reports
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleToggleRole(u.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#F1F5F9] dark:bg-[#162235] hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] transition cursor-pointer"
                          >
                            {u.is_staff || u.role === "admin" ? "Demote to Citizen" : "Promote to Officer"}
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
