import React, { useState } from 'react';
import { Camera, MapPin, CheckCircle2, Upload } from 'lucide-react';
import { createCitizenReport } from '../../services/incidents/incidentService';
import { CitizenReport } from '../../data/crisis/citizen-reports';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router';

export const CitizenReportPage: React.FC = () => {
  const navigate = useNavigate();

  const [issueType, setIssueType] = useState<CitizenReport['issueType']>('Waterlogging');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE'>('HIGH');
  const [locationName, setLocationName] = useState('Dharampeth West High Court Road');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [createdReportId, setCreatedReportId] = useState('');

  const issueCategories: { type: CitizenReport['issueType']; emoji: string; label: string }[] = [
    { type: 'Waterlogging', emoji: '💧', label: 'Waterlogging' },
    { type: 'Pothole', emoji: '🕳️', label: 'Pothole' },
    { type: 'Road Damage', emoji: '⚠️', label: 'Road Damage' },
    { type: 'Traffic Blockage', emoji: '🚗', label: 'Traffic Block' },
    { type: 'Drainage Overflow', emoji: '🌊', label: 'Drain Choke' },
    { type: 'Fallen Tree', emoji: '🌳', label: 'Tree / Hazard' }
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rep = createCitizenReport({
      citizenName: 'Nagpur Citizen',
      issueType,
      locationName,
      coordinates: [21.1425 + (Math.random() - 0.5) * 0.02, 79.0620 + (Math.random() - 0.5) * 0.02],
      severity,
      description: description || `Reported ${issueType} hazard requiring NMC inspection.`,
      imageUrl: imagePreview || undefined
    });

    setCreatedReportId(rep.id);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-white dark:bg-[#111C2E] p-6 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-sm text-center space-y-4 my-8">
        <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="size-8" />
        </div>

        <h2 className="text-xl font-bold text-[#111111] dark:text-white">
          Report Submitted Successfully!
        </h2>

        <p className="text-xs text-[#666666] dark:text-gray-300">
          Tracking ID: <span className="font-mono font-bold text-[#FF8A00]">{createdReportId}</span>
        </p>

        <p className="text-xs text-[#666666] dark:text-gray-400 max-w-xs mx-auto">
          Your hazard pin has been transmitted to the NMC Crisis Command Center and added to the predictive safe routing layer.
        </p>

        <div className="pt-2 flex flex-col gap-2">
          <Button
            onClick={() => navigate('/citizen/map')}
            className="w-full bg-[#FF8A00] hover:bg-[#E07A00] text-white font-bold h-11 text-xs gap-2"
          >
            <MapPin className="size-4" /> View On Live Map
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              setSubmitted(false);
              setDescription('');
              setImagePreview(null);
            }}
            className="w-full text-xs font-semibold"
          >
            Submit Another Report
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-[#111C2E] p-4 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-1">
        <h1 className="text-xl font-extrabold text-[#111111] dark:text-white tracking-tight">
          Report Urban Hazard
        </h1>
        <p className="text-[11px] text-[#666666] dark:text-gray-400">
          Upload photo and geotag waterlogging, deep potholes, or road closures to notify NMC and keep fellow citizens safe.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#111C2E] p-4 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-4">
        {/* Category Picker */}
        <div>
          <label className="text-xs font-bold text-[#111111] dark:text-white block mb-2">
            1. Select Hazard Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {issueCategories.map(cat => (
              <button
                key={cat.type}
                type="button"
                onClick={() => setIssueType(cat.type)}
                className={cn(
                  "p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer",
                  issueType === cat.type
                    ? "bg-[#FFF8E1] dark:bg-[#FFC107]/20 border-[#FF8A00] text-[#111111] dark:text-white font-bold shadow-xs"
                    : "bg-[#F7F7F7] dark:bg-[#0B1320] border-[#E5E5E5] dark:border-white/10 text-[#666666] dark:text-gray-400"
                )}
              >
                <span className="text-xl">{cat.emoji}</span>
                <span className="text-[10px] tracking-tight">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Severity */}
        <div>
          <label className="text-xs font-bold text-[#111111] dark:text-white block mb-2">
            2. Estimated Severity Level
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {(['LOW', 'MEDIUM', 'HIGH', 'SEVERE'] as const).map(sev => (
              <button
                key={sev}
                type="button"
                onClick={() => setSeverity(sev)}
                className={cn(
                  "py-2 rounded-xl text-[10px] font-bold font-mono transition-all border cursor-pointer",
                  severity === sev
                    ? sev === 'SEVERE'
                      ? "bg-[#E53935] text-white border-[#E53935]"
                      : "bg-[#FF8A00] text-white border-[#FF8A00]"
                    : "bg-[#F7F7F7] dark:bg-[#0B1320] text-[#666666] border-[#E5E5E5] dark:border-white/10"
                )}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Location Pin */}
        <div>
          <label className="text-xs font-bold text-[#111111] dark:text-white block mb-1">
            3. Location (GPS Auto-Detected)
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 size-4 text-[#FF8A00]" />
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#E5E5E5] dark:border-white/10 bg-[#F7F7F7] dark:bg-[#0B1320] text-xs font-medium text-[#111111] dark:text-white focus:ring-1 focus:ring-[#FF8A00]"
            />
          </div>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="text-xs font-bold text-[#111111] dark:text-white block mb-1">
            4. Upload Photo (Optional)
          </label>
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-[#E5E5E5] dark:border-white/10 h-36">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-lg"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-[#E5E5E5] dark:border-white/15 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-[#FF8A00] transition-colors bg-[#F7F7F7] dark:bg-[#0B1320]">
              <Camera className="size-6 text-[#FF8A00]" />
              <span className="text-xs font-bold text-[#111111] dark:text-white">
                Tap to Take Photo / Upload
              </span>
              <span className="text-[10px] text-[#666666] dark:text-gray-400">
                Supports JPG, PNG up to 10MB
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-bold text-[#111111] dark:text-white block mb-1">
            5. Additional Notes
          </label>
          <textarea
            rows={2}
            placeholder="e.g. 2 ft standing water near underpass, scooter stalled..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-[#E5E5E5] dark:border-white/10 bg-[#F7F7F7] dark:bg-[#0B1320] text-xs font-medium text-[#111111] dark:text-white focus:ring-1 focus:ring-[#FF8A00]"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-[#FF8A00] hover:bg-[#E07A00] text-white font-bold h-11 text-xs gap-2 shadow-xs cursor-pointer"
        >
          <Upload className="size-4" /> Submit Report to NMC Crisis Command
        </Button>
      </form>
    </div>
  );
};

export default CitizenReportPage;
