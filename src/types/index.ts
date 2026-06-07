export type VehicleType = 'locomotive' | 'car';

export interface Vehicle {
  id: string;
  type: VehicleType;
  model: string;
  roadNumber: string;
  gauge: string;
  year?: number;
  color?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Consist {
  id: string;
  name: string;
  description?: string;
  vehicleIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RunLog {
  id: string;
  consistId?: string;
  date: string;
  route: string;
  sectionIds?: string[];
  durationMinutes: number;
  powerLevel: string;
  issues?: string;
  cleaningNotes?: string;
  notes?: string;
  createdAt: string;
}

export type TrackElementType = 'straight' | 'curve' | 'switch';

export interface TrackEndpoint {
  id: string;
  elementId: string;
  endpointIndex: number;
  x: number;
  y: number;
  angle: number;
}

export interface TrackConnection {
  id: string;
  trackMapId: string;
  endpointAId: string;
  endpointBId: string;
  elementAId: string;
  elementBId: string;
}

export interface TrackSection {
  id: string;
  trackMapId: string;
  name: string;
  description?: string;
  elementIds: string[];
  color?: string;
}

export interface TrackElement {
  id: string;
  trackMapId: string;
  type: TrackElementType;
  x: number;
  y: number;
  rotation: number;
  length: number;
  radius?: number;
}

export type IssueType = 'stall' | 'derail' | 'other';

export interface IssueMarker {
  id: string;
  trackMapId: string;
  x: number;
  y: number;
  type: IssueType;
  description: string;
  createdAt: string;
}

export interface TrackMap {
  id: string;
  name: string;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExportData {
  version: string;
  exportedAt: string;
  vehicles: Vehicle[];
  consists: Consist[];
  runLogs: RunLog[];
  trackMaps: TrackMap[];
  trackElements: TrackElement[];
  trackConnections: TrackConnection[];
  trackSections: TrackSection[];
  issueMarkers: IssueMarker[];
}

export const GAUGE_OPTIONS = ['HO', 'N', 'O', 'G', 'Z', 'TT', 'OO'] as const;

export const POWER_LEVEL_OPTIONS = ['低速', '中速', '高速', '全速'] as const;

export const STORAGE_KEYS = {
  VEHICLES: 'railway_vehicles',
  CONSISTS: 'railway_consists',
  RUN_LOGS: 'railway_runlogs',
  TRACK_MAPS: 'railway_trackmaps',
  TRACK_ELEMENTS: 'railway_trackelements',
  TRACK_CONNECTIONS: 'railway_trackconnections',
  TRACK_SECTIONS: 'railway_tracksections',
  ISSUE_MARKERS: 'railway_issuemarkers',
} as const;
