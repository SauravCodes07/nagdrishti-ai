import React from 'react';
import { ShieldCheck, ThumbsUp, ArrowRight } from 'lucide-react';
import { getCitizenReports } from '../../services/incidents/incidentService';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router';
import { cn } from '../../lib/utils';

export const CitizenProfilePage: React.FC = () => {
  const reports = getCitizenReports().slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <div className="bg-white dark:bg-[#111C2E] p-4 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-gradient-to-tr from-[#FF8A00] to-[#FFC107] text-white font-bold text-lg flex items-center justify-center shadow-xs">
            NC
          </div>
          <div>
            <h2 className="font-bold text-base text-[#111111] dark:text-white">
              Nagpur Citizen User
            </h2>
            <p className="text-xs text-[#666666] dark:text-gray-400">
              Civic Safety Volunteer • Level 2
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-mono">
            VERIFIED CITIZEN
          </span>
        </div>
      </div>

      {/* Admin Switcher Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFF8E1] to-white dark:from-[#FFC107]/15 dark:to-[#111C2E] border border-[#FFC107]/40 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF8A00]">
            <ShieldCheck className="size-4" /> NMC Authority Access
          </div>
          <p className="text-[11px] text-[#666666] dark:text-gray-300 mt-0.5">
            Switch to Crisis Command Center (Laptop-first interface)
          </p>
        </div>

        <Button
          render={<Link to="/admin" />}
          className="bg-[#FF8A00] hover:bg-[#E07A00] text-white font-bold text-xs h-9 gap-1 shadow-xs cursor-pointer"
        >
          Open Admin <ArrowRight className="size-3.5" />
        </Button>
      </div>

      {/* My Submitted Reports */}
      <div className="bg-white dark:bg-[#111C2E] rounded-2xl p-4 border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-[#111111] dark:text-white">
            My Submitted Hazard Reports ({reports.length})
          </h3>
          <span className="text-[10px] text-[#666666] dark:text-gray-400">
            Real-Time Status
          </span>
        </div>

        <div className="space-y-2.5">
          {reports.map((r) => (
            <div
              key={r.id}
              className="p-3 rounded-xl bg-[#F7F7F7] dark:bg-[#0B1320] border border-[#E5E5E5] dark:border-white/5 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#111111] dark:text-white">
                  {r.issueType} — {r.locationName}
                </span>
                <span
                  className={cn(
                    "text-[9px] font-bold font-mono px-2 py-0.5 rounded",
                    r.verificationStatus === 'VERIFIED'
                      ? "bg-emerald-500/15 text-emerald-600"
                      : r.verificationStatus === 'DISPATCHED'
                      ? "bg-blue-500/15 text-blue-600"
                      : "bg-amber-500/15 text-amber-600"
                  )}
                >
                  {r.verificationStatus}
                </span>
              </div>
              <p className="text-[11px] text-[#666666] dark:text-gray-400">
                {r.description}
              </p>
              <div className="flex items-center justify-between text-[10px] text-[#666666] dark:text-gray-400 pt-1">
                <span>{r.timeAgo}</span>
                <span className="flex items-center gap-1 font-bold text-[#FF8A00]">
                  <ThumbsUp className="size-3" /> {r.upvotes} upvotes
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Saved Places */}
      <div className="bg-white dark:bg-[#111C2E] rounded-2xl p-4 border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-3">
        <h3 className="font-bold text-xs text-[#111111] dark:text-white">
          Saved Places & Routes
        </h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F7F7] dark:bg-[#0B1320] text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">🏠</span>
              <div>
                <span className="font-bold text-[#111111] dark:text-white">Home</span>
                <p className="text-[10px] text-[#666666] dark:text-gray-400">Dharampeth West High Court Road</p>
              </div>
            </div>
            <Link to="/citizen/route?origin=airport&destination=dharampeth" className="text-[11px] text-[#FF8A00] font-bold">
              Route
            </Link>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F7F7] dark:bg-[#0B1320] text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">🏢</span>
              <div>
                <span className="font-bold text-[#111111] dark:text-white">Workplace / Office</span>
                <p className="text-[10px] text-[#666666] dark:text-gray-400">Civil Lines Administrative Complex</p>
              </div>
            </div>
            <Link to="/citizen/route?origin=dharampeth&destination=civil_lines" className="text-[11px] text-[#FF8A00] font-bold">
              Route
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenProfilePage;
