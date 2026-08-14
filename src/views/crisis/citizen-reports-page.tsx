import React, { useState } from 'react';
import { useDemoSimulation } from '../../context/DemoSimulationContext';
import { CitizenReportModal } from '../../components/crisis/citizen-report-modal';
import { ThumbsUp, MapPin, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

const CitizenReportsPage: React.FC = () => {
  const { citizenReports } = useDemoSimulation();
  const [reports, setReports] = useState(citizenReports);

  const handleUpvote = (id: string) => {
    setReports(prev =>
      prev.map(r => {
        if (r.id === id) {
          const upvoted = !r.upvotedByMe;
          return {
            ...r,
            upvotes: upvoted ? r.upvotes + 1 : r.upvotes - 1,
            upvotedByMe: upvoted
          };
        }
        return r;
      })
    );
    toast.success('Vote recorded!');
  };

  const handleVerify = (id: string) => {
    setReports(prev =>
      prev.map(r => (r.id === id ? { ...r, verificationStatus: 'VERIFIED' } : r))
    );
    toast.success('Report verified by NMC Admin!');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#111C2E] p-4 sm:p-6 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-[#FFC107] text-[#111111] font-mono text-[10px] font-black">
              CROWDSOURCED INTELLIGENCE
            </Badge>
            <span className="text-xs text-[#666666] dark:text-gray-400">• Live Citizen Geotagged Reports</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] dark:text-white tracking-tight">
            Nagpur Citizen Crisis Reports
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-gray-400 mt-0.5">
            Real-time citizen submissions of flooded roads, fallen trees, deep potholes, and clogged drains.
          </p>
        </div>

        <CitizenReportModal />
      </div>

      {/* Reports Feed Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map(rep => (
          <div key={rep.id} className="bg-white dark:bg-[#111C2E] rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="relative h-44 w-full bg-[#F7F7F7]">
              <img
                src={rep.imageUrl}
                alt={rep.issueType}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="text-[10px] font-black px-2.5 py-1 rounded bg-[#111111]/80 text-white backdrop-blur-md font-mono">
                  {rep.issueType}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                  rep.verificationStatus === 'VERIFIED' ? 'bg-[#22A447] text-white' : 'bg-[#FFC107] text-[#111111]'
                }`}>
                  {rep.verificationStatus}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-2 flex-1">
              <div className="flex items-center justify-between text-xs text-[#666666] dark:text-gray-400">
                <span className="font-semibold text-[#111111] dark:text-white">Reported by {rep.citizenName}</span>
                <span className="flex items-center gap-1 font-mono text-[10px]">
                  <Clock className="size-3" /> {rep.timeAgo}
                </span>
              </div>

              <h4 className="font-bold text-sm text-[#111111] dark:text-white flex items-center gap-1">
                <MapPin className="size-4 text-[#FF8A00] shrink-0" /> {rep.locationName}
              </h4>

              <p className="text-xs text-[#666666] dark:text-gray-400 line-clamp-2 leading-relaxed">
                {rep.description}
              </p>
            </div>

            <div className="p-3 bg-[#F7F7F7] dark:bg-[#0B1320] border-t border-[#E5E5E5] dark:border-white/10 flex items-center justify-between">
              <Button
                variant={rep.upvotedByMe ? "default" : "outline"}
                size="sm"
                onClick={() => handleUpvote(rep.id)}
                className={`text-xs gap-1.5 min-h-[36px] ${rep.upvotedByMe ? 'bg-[#FF8A00] hover:bg-[#E07A00] text-white font-bold' : 'border-[#E5E5E5] text-[#111111] dark:text-white'}`}
              >
                <ThumbsUp className="size-3.5" /> {rep.upvotes} Confirmations
              </Button>

              {rep.verificationStatus !== 'VERIFIED' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVerify(rep.id)}
                  className="text-xs text-[#22A447] border-[#22A447]/30 hover:bg-[#22A447]/10 min-h-[36px] font-bold"
                >
                  <CheckCircle2 className="size-3.5 mr-1" /> Admin Verify
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CitizenReportsPage;
