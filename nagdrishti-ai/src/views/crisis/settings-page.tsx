import React from 'react';
import { Bell, Cpu, Save } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

const SettingsPage: React.FC = () => {
  const handleSave = () => {
    toast.success('System Configuration Saved!');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-bhagwa text-white font-mono text-[10px]">
              NMC SYSTEM CONTROL
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            System Settings & Telemetry Config
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Configure AI risk thresholds, automated SMS alerts, and Doppler radar sync frequency.
          </p>
        </div>

        <Button onClick={handleSave} className="bg-bhagwa hover:bg-bhagwa-dark text-white font-bold text-xs gap-1.5">
          <Save className="size-4" /> Save Configuration
        </Button>
      </div>

      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-6 max-w-3xl">
        <div className="space-y-3">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <Cpu className="size-5 text-bhagwa" /> AI Engine Thresholds
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-foreground block mb-1">Severe Flood Risk Trigger (% Risk)</label>
              <input type="number" defaultValue={85} className="w-full p-2.5 rounded-lg border border-input bg-background font-mono" />
            </div>
            <div>
              <label className="font-semibold text-foreground block mb-1">Doppler Radar Sync Interval (Mins)</label>
              <input type="number" defaultValue={2} className="w-full p-2.5 rounded-lg border border-input bg-background font-mono" />
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-border">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <Bell className="size-5 text-bhagwa" /> Broadcast Emergency Alert Settings
          </h3>
          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="size-4 accent-bhagwa rounded" />
              <span className="font-medium text-foreground">Auto-trigger SMS Broadcast to Residents in Severe Risk Zones</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="size-4 accent-bhagwa rounded" />
              <span className="font-medium text-foreground">Auto-notify Nagpur Traffic Police Control Room on Flyover Gridlock</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
