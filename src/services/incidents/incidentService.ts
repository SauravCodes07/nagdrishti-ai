/**
 * NagDrishti AI — Civic Incident & Citizen Report Service
 * Manages incident verification, status lifecycle, dispatch assignment, and crowdsourced reporting
 */

import { INCIDENTS_DATA, Incident, IncidentStatus } from '../../data/crisis/incident-data';
import { INITIAL_CITIZEN_REPORTS, CitizenReport } from '../../data/crisis/citizen-reports';

let inMemoryIncidents: Incident[] = [...INCIDENTS_DATA];
let inMemoryReports: CitizenReport[] = [...INITIAL_CITIZEN_REPORTS];

export const getIncidents = (): Incident[] => {
  return inMemoryIncidents;
};

export const getCitizenReports = (): CitizenReport[] => {
  return inMemoryReports;
};

export const createCitizenReport = (reportData: {
  citizenName: string;
  issueType: CitizenReport['issueType'];
  locationName: string;
  coordinates: [number, number];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE';
  description: string;
  imageUrl?: string;
}): CitizenReport => {
  const newReport: CitizenReport = {
    id: `REP-${Math.floor(800 + Math.random() * 200)}`,
    citizenName: reportData.citizenName || 'Nagpur Citizen',
    issueType: reportData.issueType,
    locationName: reportData.locationName,
    coordinates: reportData.coordinates,
    severity: reportData.severity,
    timeAgo: 'Just now',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    verificationStatus: 'PENDING',
    description: reportData.description,
    imageUrl: reportData.imageUrl || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    upvotes: 1,
    upvotedByMe: true
  };

  inMemoryReports = [newReport, ...inMemoryReports];
  return newReport;
};

export const updateIncidentStatus = (
  incidentId: string,
  status: IncidentStatus,
  assignedTeam?: string
): Incident | undefined => {
  const idx = inMemoryIncidents.findIndex(inc => inc.id === incidentId);
  if (idx === -1) return undefined;

  const updated: Incident = {
    ...inMemoryIncidents[idx],
    status,
    ...(assignedTeam ? { assignedTeam } : {})
  };

  inMemoryIncidents[idx] = updated;
  return updated;
};

export const upvoteReport = (reportId: string): CitizenReport | undefined => {
  const idx = inMemoryReports.findIndex(r => r.id === reportId);
  if (idx === -1) return undefined;

  const rep = inMemoryReports[idx];
  const isUpvoted = rep.upvotedByMe;

  const updated: CitizenReport = {
    ...rep,
    upvotes: isUpvoted ? Math.max(0, rep.upvotes - 1) : rep.upvotes + 1,
    upvotedByMe: !isUpvoted
  };

  inMemoryReports[idx] = updated;
  return updated;
};
