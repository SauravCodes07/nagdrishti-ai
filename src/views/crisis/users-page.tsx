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
      <div className="bg-white dark:bg-[#111C2E] p-4 sm:p-6 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-[#FFC107] text-[#111111] font-mono text-[10px] font-black">
              MUNICIPAL ACCESS CONTROL
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] dark:text-white tracking-tight">
            Users & Role Governance
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-gray-400 mt-0.5">
            Authorized personnel across NMC, Traffic Police, PWD, and NDRF emergency command.
          </p>
        </div>

        <Button className="bg-[#FF8A00] hover:bg-[#E07A00] text-white font-bold text-xs gap-1.5">
          <Plus className="size-4" /> Add Authorized Officer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {USERS_LIST.map((u, i) => (
          <div key={i} className="bg-white dark:bg-[#111C2E] p-5 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-base text-[#111111] dark:text-white">{u.name}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#22A447]/10 text-[#22A447] font-mono">
                {u.status}
              </span>
            </div>
            <p className="text-xs font-semibold text-[#FF8A00] uppercase tracking-wider">{u.role}</p>
            <p className="text-xs text-[#666666] dark:text-gray-400">🏢 {u.department}</p>
            <p className="text-xs text-[#666666] dark:text-gray-400 font-mono">✉️ {u.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersPage;
