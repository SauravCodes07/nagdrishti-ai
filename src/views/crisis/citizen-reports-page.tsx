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
      <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-purple-600 text-white font-mono text-[10px]">
              CROWDSOURCED INTELLIGENCE
            </Badge>
            <span className="text-xs text-muted-foreground">• Live Citizen Geotagged Reports</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Nagpur Citizen Crisis Reports
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real-time citizen submissions of flooded roads, fallen trees, deep potholes, and clogged drains.
          </p>
        </div>

        <CitizenReportModal />
      </div>

      {/* Reports Feed Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map(rep => (
          <div key={rep.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="relative h-44 w-full bg-muted">
              <img
                src={rep.imageUrl}
                alt={rep.issueType}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded bg-slate-900/80 text-white backdrop-blur-md font-mono">
                  {rep.issueType}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                  rep.verificationStatus === 'VERIFIED' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {rep.verificationStatus}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-2 flex-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Reported by {rep.citizenName}</span>
                <span className="flex items-center gap-1 font-mono text-[10px]">
                  <Clock className="size-3" /> {rep.timeAgo}
                </span>
              </div>

              <h4 className="font-bold text-sm text-foreground flex items-center gap-1">
                <MapPin className="size-4 text-bhagwa shrink-0" /> {rep.locationName}
              </h4>

              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {rep.description}
              </p>
            </div>

            <div className="p-3 bg-muted/30 border-t border-border flex items-center justify-between">
              <Button
                variant={rep.upvotedByMe ? "default" : "outline"}
                size="sm"
                onClick={() => handleUpvote(rep.id)}
                className={`text-xs gap-1.5 min-h-[36px] ${rep.upvotedByMe ? 'bg-bhagwa text-white' : ''}`}
              >
                <ThumbsUp className="size-3.5" /> {rep.upvotes} Confirmations
              </Button>

              {rep.verificationStatus !== 'VERIFIED' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVerify(rep.id)}
                  className="text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 min-h-[36px]"
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
