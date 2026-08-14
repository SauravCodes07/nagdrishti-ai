import React from 'react';
import { Download } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

const ReportsPage: React.FC = () => {
  const handleExport = () => {
    toast.success('Executive PDF Report Generated!', {
      description: 'Downloaded Nagpur Monsoon Crisis Audit Report (August 2026)'
    });
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="bg-white dark:bg-[#111C2E] p-4 sm:p-6 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-[#FFC107] text-[#111111] font-mono text-[10px] font-black">
              CIVIC AUDIT & METRICS
            </Badge>
            <span className="text-xs text-[#666666] dark:text-gray-400">• Municipal Executive Reporting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] dark:text-white tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-gray-400 mt-0.5">
            Automated performance analytics, response lead times, and resource utilization reports.
          </p>
        </div>

        <Button onClick={handleExport} className="bg-[#FF8A00] hover:bg-[#E07A00] text-white font-bold text-xs gap-1.5">
          <Download className="size-4" /> Export Executive PDF Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#111C2E] p-5 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-2">
          <span className="text-xs text-[#666666] dark:text-gray-400 font-semibold">Average Response Time</span>
          <span className="text-3xl font-black font-mono text-[#22A447] block">18.4 Mins</span>
          <span className="text-xs text-[#666666] dark:text-gray-400">32% faster than 2025 baseline</span>
        </div>

        <div className="bg-white dark:bg-[#111C2E] p-5 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-2">
          <span className="text-xs text-[#666666] dark:text-gray-400 font-semibold">Pump Dewatering Efficiency</span>
          <span className="text-3xl font-black font-mono text-[#FF8A00] block">94.2%</span>
          <span className="text-xs text-[#666666] dark:text-gray-400">Zero mechanical breakdowns recorded</span>
        </div>

        <div className="bg-white dark:bg-[#111C2E] p-5 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-2">
          <span className="text-xs text-[#666666] dark:text-gray-400 font-semibold">Citizen Satisfaction Index</span>
          <span className="text-3xl font-black font-mono text-[#FF8A00] block">4.8 / 5.0</span>
          <span className="text-xs text-[#666666] dark:text-gray-400">Based on 1,420 crowdsourced votes</span>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
