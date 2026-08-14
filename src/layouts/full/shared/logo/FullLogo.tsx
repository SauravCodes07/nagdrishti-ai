import { Link } from "react-router";
import nagdrishtiLogo from "@/assets/images/logos/nagdrishti-logo.png";

const FullLogo = () => {
  return (
    <Link to={'/'} className="flex items-center gap-2.5 overflow-hidden group">
      <div className="size-10 rounded-xl bg-slate-900/5 dark:bg-slate-800/40 p-1 flex items-center justify-center border border-border shrink-0 group-hover:scale-105 transition-transform shadow-xs">
        <img
          src={nagdrishtiLogo}
          alt="NagDrishti AI Logo"
          className="h-8 w-auto object-contain"
        />
      </div>
      <div className="flex flex-col hide-menu whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-base tracking-tight text-foreground leading-none font-outfit">
            NagDrishti
          </span>
          <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-bhagwa text-white rounded shadow-xs tracking-wider">
            AI
          </span>
        </div>
        <span className="text-[11px] font-medium text-muted-foreground leading-tight mt-0.5 tracking-tight">
          Urban Crisis Management
        </span>
      </div>
    </Link>
  );
};

export default FullLogo;
