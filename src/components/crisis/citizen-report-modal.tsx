import React, { useState } from 'react';
import { useDemoSimulation } from '../../context/DemoSimulationContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Camera, MapPin, Upload, AlertTriangle } from 'lucide-react';

export const CitizenReportModal: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { addCitizenReport } = useDemoSimulation();
  const [open, setOpen] = useState(false);

  const [citizenName, setCitizenName] = useState('');
  const [issueType, setIssueType] = useState<'Waterlogging' | 'Pothole' | 'Road Damage' | 'Traffic Blockage' | 'Drainage Overflow' | 'Fallen Tree'>('Waterlogging');
  const [locationName, setLocationName] = useState('Dharampeth, Near Gokulpeth Market');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE'>('HIGH');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!citizenName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!description.trim()) {
      toast.error('Please enter a description of the issue');
      return;
    }

    addCitizenReport({
      citizenName,
      issueType,
      locationName,
      coordinates: [21.1425 + (Math.random() - 0.5) * 0.04, 79.0620 + (Math.random() - 0.5) * 0.04],
      severity,
      description,
      imageUrl
    });

    toast.success('Report submitted successfully!', {
      description: 'Your citizen report has been logged and sent to NMC Crisis Control.'
    });

    setOpen(false);
    setCitizenName('');
    setDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          (children as React.ReactElement) || (
            <Button variant="default" className="bg-bhagwa hover:bg-bhagwa-dark text-white font-bold gap-2">
              <Camera className="size-4" /> Submit Citizen Report
            </Button>
          )
        }
      />

      <DialogContent className="sm:max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="size-5 text-bhagwa" /> Submit Urban Incident Report
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Report waterlogging, potholes, or fallen trees directly to Nagpur Municipal Corporation.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Your Full Name *
            </label>
            <Input
              placeholder="e.g. Rajesh Kumar"
              value={citizenName}
              onChange={e => setCitizenName(e.target.value)}
              className="text-xs min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Issue Category *
              </label>
              <select
                value={issueType}
                onChange={e => setIssueType(e.target.value as any)}
                className="w-full h-11 px-3 rounded-md border border-input bg-background text-xs focus:ring-1 focus:ring-bhagwa"
              >
                <option value="Waterlogging">💧 Waterlogging</option>
                <option value="Pothole">⚠️ Pothole</option>
                <option value="Road Damage">🚧 Road Damage</option>
                <option value="Traffic Blockage">🚗 Traffic Blockage</option>
                <option value="Drainage Overflow">🌊 Drainage Overflow</option>
                <option value="Fallen Tree">🪵 Fallen Tree</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Perceived Severity *
              </label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as any)}
                className="w-full h-11 px-3 rounded-md border border-input bg-background text-xs focus:ring-1 focus:ring-bhagwa"
              >
                <option value="SEVERE">🔴 SEVERE</option>
                <option value="HIGH">🟠 HIGH</option>
                <option value="MEDIUM">🟡 MEDIUM</option>
                <option value="LOW">🟢 LOW</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Location in Nagpur *
            </label>
            <div className="relative">
              <Input
                placeholder="e.g. Dharampeth, Near Gokulpeth Market"
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                className="text-xs min-h-[44px] pl-9"
              />
              <MapPin className="size-4 text-bhagwa absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Description & Details *
            </label>
            <Textarea
              placeholder="Describe water depth, vehicle stall risk, or blockage..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="text-xs min-h-[80px]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Photo Upload / Demo Image URL
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Image URL..."
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="text-xs min-h-[44px] flex-1"
              />
              <Button type="button" variant="outline" className="min-h-[44px] px-3 text-xs">
                <Upload className="size-4 mr-1" /> Browse
              </Button>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="min-h-[44px] text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-bhagwa hover:bg-bhagwa-dark text-white font-bold min-h-[44px] text-xs"
            >
              Submit Report
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
