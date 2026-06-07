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
  durationMinutes: number;
  powerLevel: string;
  issues?: string;
  cleaningNotes?: string;
  notes?: string;
  createdAt: string;
}

export type TrackElementType = 'straight' | 'curve' | 'switch';

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
  ISSUE_MARKERS: 'railway_issuemarkers',
} as const;
