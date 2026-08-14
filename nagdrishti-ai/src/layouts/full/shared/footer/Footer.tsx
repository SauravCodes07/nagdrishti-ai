import { Link } from "react-router";

export default function Footer() {
  return (
    <div className="flex md:flex-row flex-col items-center justify-between gap-3 text-center py-4 border-t border-border mt-6 text-xs text-muted-foreground">
      <p className="flex items-center gap-1.5 justify-center">
        <span>© 2026 Nagpur Municipal Corporation (NMC) • AI Urban Crisis Management System</span>
      </p>

      <div className="flex gap-4">
        <Link to="/help" className="hover:text-bhagwa">
          Emergency Helplines
        </Link>
        <Link to="/ai-predictions" className="hover:text-bhagwa">
          AI Model Specs
        </Link>
        <Link to="/citizen-reports" className="hover:text-bhagwa">
          Citizen Portal
        </Link>
      </div>
    </div>
  );
}
