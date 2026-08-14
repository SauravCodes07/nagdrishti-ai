import { Link } from "react-router";
import { ShieldAlert, Sparkles } from "lucide-react";

const FullLogo = () => {
  return (
    <Link to={'/'} className="flex items-center gap-2.5 overflow-hidden group">
      <div className="size-9 rounded-lg bg-gradient-to-br from-bhagwa to-bhagwa-dark text-white flex items-center justify-center shadow-md shadow-bhagwa/20 shrink-0 group-hover:scale-105 transition-transform">
        <ShieldAlert className="size-5" />
      </div>
      <div className="flex flex-col hide-menu whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-base tracking-tight text-foreground leading-none">
            NAGPUR
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-bhagwa/10 text-bhagwa rounded border border-bhagwa/20 flex items-center gap-0.5">
            <Sparkles className="size-2.5" /> AI
          </span>
        </div>
        <span className="text-[11px] font-medium text-muted-foreground leading-tight">
          Crisis Command
        </span>
      </div>
    </Link>
  );
};

export default FullLogo;
