"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  RefreshCw,
  Activity,
  Calendar,
  Layers,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import AdminLayout from "../../../components/layouts/AdminLayout";
import { getAdminAnalytics } from "../../../lib/api";
import { useTheme } from "../../../components/ThemeProvider";
import {
  ScrollReveal,
  HoverLiftCard,
  AnimatedCounter,
} from "../../../components/motion";

export default function AdminAnalyticsPage() {
  const { theme } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await getAdminAnalytics();
      if (res) setData(res);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const isDark = theme === "dark";
  const gridColor = isDark ? "#243244" : "#E2E8F0";
  const textColor = isDark ? "#94A3B8" : "#64748B";

  const ZONE_COLORS = {
    Dharampeth: "#14B8A6",
    Lakadganj: "#F59E0B",
    Gandhibagh: "#DC2626",
    Mahal: "#8B5CF6",
    "Nehru Nagar": "#3B82F6",
    Sitabuldi: "#EC4899",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Crisis Analytics & Predictive Trends
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] font-normal mt-0.5">
              Historical multi-ward risk index progression, crowdsourced report volume, and hazard distribution
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={fetchAnalytics}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-[#FFFFFF] dark:bg-[#111C2E] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] transition shadow-sm flex items-center gap-1.5 self-start cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#0F766E] dark:text-[#14B8A6]" : ""}`} />
            <span>Refresh Data</span>
          </motion.button>
        </div>

        {/* Charts Grid with Spring Entrances & Active Recharts Animations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 1: 7-Day Risk Score Trends Line Chart */}
          <div className="lg:col-span-8">
            <HoverLiftCard className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                    7-Day Ward Risk Score Evolution (0–100%)
                  </h2>
                </div>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Open-Meteo & Ground Telemetry
                </span>
              </div>

              <div className="h-72 w-full">
                {data?.risk_trends && data.risk_trends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.risk_trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis dataKey="date" stroke={textColor} fontSize={11} tickLine={false} />
                      <YAxis stroke={textColor} fontSize={11} domain={[0, 100]} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                          borderColor: isDark ? "#334155" : "#CBD5E1",
                          borderRadius: "12px",
                          fontSize: "12px",
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                      {Object.keys(data.risk_trends[0] || {})
                        .filter((k) => k !== "date")
                        .map((zoneName) => (
                          <Line
                            key={zoneName}
                            type="monotone"
                            dataKey={zoneName}
                            stroke={ZONE_COLORS[zoneName] || "#0F766E"}
                            strokeWidth={2.5}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                            isAnimationActive={true}
                            animationDuration={900}
                          />
                        ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-[#64748B] dark:text-[#94A3B8]">
                    Loading chart telemetry...
                  </div>
                )}
              </div>
            </HoverLiftCard>
          </div>

          {/* Chart 2: Hazard Distribution Pie Chart */}
          <div className="lg:col-span-4">
            <HoverLiftCard className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] shadow-sm space-y-4 flex flex-col justify-between h-full">
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                  Hazard Category Distribution
                </h2>
              </div>

              <div className="h-56 w-full">
                {data?.category_breakdown ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.category_breakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                        isAnimationActive={true}
                        animationDuration={900}
                      >
                        {data.category_breakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                          borderColor: isDark ? "#334155" : "#CBD5E1",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : null}
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0] dark:border-[#243244]">
                {data?.category_breakdown?.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[#475569] dark:text-[#CBD5E1]">{item.name}</span>
                    </div>
                    <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      <AnimatedCounter value={item.value} suffix=" reports" />
                    </span>
                  </div>
                ))}
              </div>
            </HoverLiftCard>
          </div>

          {/* Chart 3: Report Volume Bar Chart */}
          <div className="lg:col-span-12">
            <HoverLiftCard className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                    Daily Crowdsourced Citizen Reports Volume
                  </h2>
                </div>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Submitted vs Municipal Verified
                </span>
              </div>

              <div className="h-64 w-full">
                {data?.report_volume && data.report_volume.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.report_volume}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis dataKey="date" stroke={textColor} fontSize={11} tickLine={false} />
                      <YAxis stroke={textColor} fontSize={11} allowDecimals={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                          borderColor: isDark ? "#334155" : "#CBD5E1",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                      <Bar dataKey="total_reports" name="Total Ingested Reports" fill="#0F766E" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={900} />
                      <Bar dataKey="verified_reports" name="Officer Verified Reports" fill="#16A34A" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={900} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : null}
              </div>
            </HoverLiftCard>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
