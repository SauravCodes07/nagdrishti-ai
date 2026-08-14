import React from 'react';
import { Plus } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

const USERS_LIST = [
  { name: 'Admin NMC', role: 'Chief Crisis Administrator', department: 'Nagpur Municipal Corporation', email: 'admin@nmc.nagpur.gov.in', status: 'ACTIVE' },
  { name: 'Inspector R. S. Patil', role: 'Traffic Control Lead', department: 'Nagpur Traffic Police West Wing', email: 'traffic.patil@nagpurpolice.gov.in', status: 'ACTIVE' },
  { name: 'Eng. Vikram Deshmukh', role: 'PWD Rapid Road Squad Lead', department: 'Public Works Department', email: 'pwd.deshmukh@mah.gov.in', status: 'ACTIVE' },
  { name: 'Dr. Sunita Wankhede', role: 'Disaster Relief Coordinator', department: 'NDRF Zone 8 Command', email: 'ndrf.sunita@ndrf.gov.in', status: 'ACTIVE' },
];

const UsersPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-bhagwa text-white font-mono text-[10px]">
              MUNICIPAL ACCESS CONTROL
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Users & Role Governance
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Authorized personnel across NMC, Traffic Police, PWD, and NDRF emergency command.
          </p>
        </div>

        <Button className="bg-bhagwa hover:bg-bhagwa-dark text-white font-bold text-xs gap-1.5">
          <Plus className="size-4" /> Add Authorized Officer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {USERS_LIST.map((u, i) => (
          <div key={i} className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-base text-foreground">{u.name}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono">
                {u.status}
              </span>
            </div>
            <p className="text-xs font-semibold text-bhagwa uppercase tracking-wider">{u.role}</p>
            <p className="text-xs text-muted-foreground">🏢 {u.department}</p>
            <p className="text-xs text-muted-foreground font-mono">✉️ {u.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersPage;
