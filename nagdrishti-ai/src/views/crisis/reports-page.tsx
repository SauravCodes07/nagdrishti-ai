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
      <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-bhagwa text-white font-mono text-[10px]">
              CIVIC AUDIT & METRICS
            </Badge>
            <span className="text-xs text-muted-foreground">• Municipal Executive Reporting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Automated performance analytics, response lead times, and resource utilization reports.
          </p>
        </div>

        <Button onClick={handleExport} className="bg-bhagwa hover:bg-bhagwa-dark text-white font-bold text-xs gap-1.5">
          <Download className="size-4" /> Export Executive PDF Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-2">
          <span className="text-xs text-muted-foreground font-semibold">Average Response Time</span>
          <span className="text-3xl font-black font-mono text-emerald-600 block">18.4 Mins</span>
          <span className="text-xs text-muted-foreground">32% faster than 2025 baseline</span>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-2">
          <span className="text-xs text-muted-foreground font-semibold">Pump Dewatering Efficiency</span>
          <span className="text-3xl font-black font-mono text-bhagwa block">94.2%</span>
          <span className="text-xs text-muted-foreground">Zero mechanical breakdowns recorded</span>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-2">
          <span className="text-xs text-muted-foreground font-semibold">Citizen Satisfaction Index</span>
          <span className="text-3xl font-black font-mono text-purple-600 block">4.8 / 5.0</span>
          <span className="text-xs text-muted-foreground">Based on 1,420 crowdsourced votes</span>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
