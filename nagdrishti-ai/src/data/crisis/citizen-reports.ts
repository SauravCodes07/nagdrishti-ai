export interface CitizenReport {
  id: string;
  citizenName: string;
  issueType: 'Waterlogging' | 'Pothole' | 'Road Damage' | 'Traffic Blockage' | 'Drainage Overflow' | 'Fallen Tree';
  locationName: string;
  coordinates: [number, number];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE';
  timeAgo: string;
  timestamp: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'DISPATCHED' | 'RESOLVED';
  description: string;
  imageUrl: string;
  upvotes: number;
  upvotedByMe?: boolean;
}

export const INITIAL_CITIZEN_REPORTS: CitizenReport[] = [
  {
    id: 'REP-701',
    citizenName: 'Rahul Deshmukh',
    issueType: 'Waterlogging',
    locationName: 'Dharampeth, Near Gokulpeth Market Road',
    coordinates: [21.1425, 79.0620],
    severity: 'SEVERE',
    timeAgo: '12 mins ago',
    timestamp: '2026-08-14 14:48',
    verificationStatus: 'VERIFIED',
    description: 'Water has crossed knee level near the shops! Cars are stalled in the middle of the road. Drain seems completely choked.',
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    upvotes: 56,
    upvotedByMe: true
  },
  {
    id: 'REP-702',
    citizenName: 'Priya Kulkarni',
    issueType: 'Pothole',
    locationName: 'Wardha Road, Near Chhatrapati Flyover',
    coordinates: [21.1020, 79.0550],
    severity: 'HIGH',
    timeAgo: '28 mins ago',
    timestamp: '2026-08-14 14:32',
    verificationStatus: 'VERIFIED',
    description: 'Huge pothole hidden under rainwater! Saw 2 scooters fall down within 10 minutes. Needs immediate cone placement.',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    upvotes: 41
  },
  {
    id: 'REP-703',
    citizenName: 'Amit Joshi',
    issueType: 'Traffic Blockage',
    locationName: 'Sitabuldi Metro Chowk',
    coordinates: [21.1448, 79.0825],
    severity: 'SEVERE',
    timeAgo: '35 mins ago',
    timestamp: '2026-08-14 14:25',
    verificationStatus: 'DISPATCHED',
    description: 'Traffic stalled for 1.5 km due to water logging on left turn. Need traffic police to divert towards Law College Square.',
    imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
    upvotes: 33
  },
  {
    id: 'REP-704',
    citizenName: 'Sanjay Wankhede',
    issueType: 'Drainage Overflow',
    locationName: 'Mankapur Nala Bridge',
    coordinates: [21.1890, 79.0730],
    severity: 'HIGH',
    timeAgo: '42 mins ago',
    timestamp: '2026-08-14 14:18',
    verificationStatus: 'VERIFIED',
    description: 'The nala is overflowing onto the service road. Garbage buildup at the culvert mouth.',
    imageUrl: 'https://images.unsplash.com/photo-1574786198875-49f5d09fe2d2?auto=format&fit=crop&w=800&q=80',
    upvotes: 27
  },
  {
    id: 'REP-705',
    citizenName: 'Sunita Patil',
    issueType: 'Fallen Tree',
    locationName: 'Sadar Main Road, Near RBI Square',
    coordinates: [21.1620, 79.0810],
    severity: 'MEDIUM',
    timeAgo: '1 hour ago',
    timestamp: '2026-08-14 14:00',
    verificationStatus: 'RESOLVED',
    description: 'Tree branch broke and blocked one lane. NMC team already cutting it.',
    imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
    upvotes: 19
  }
];
