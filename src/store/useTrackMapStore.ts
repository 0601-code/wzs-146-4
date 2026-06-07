import { create } from 'zustand';
import { TrackMap, TrackElement, TrackConnection, TrackSection, IssueMarker, STORAGE_KEYS, IssueType } from '@/types';
import { generateId, loadFromStorage, saveToStorage } from '@/utils';
import { findConnections } from '@/utils/topology';

interface TrackMapState {
  trackMaps: TrackMap[];
  trackElements: TrackElement[];
  trackConnections: TrackConnection[];
  trackSections: TrackSection[];
  issueMarkers: IssueMarker[];
  activeTrackMapId: string | null;

  addTrackMap: (data: Omit<TrackMap, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateTrackMap: (id: string, data: Partial<TrackMap>) => void;
  deleteTrackMap: (id: string) => void;
  setActiveTrackMap: (id: string | null) => void;
  getActiveTrackMap: () => TrackMap | undefined;

  addTrackElement: (data: Omit<TrackElement, 'id'>) => void;
  updateTrackElement: (id: string, data: Partial<TrackElement>) => void;
  deleteTrackElement: (id: string) => void;
  getTrackElementsByMap: (trackMapId: string) => TrackElement[];

  addTrackConnection: (data: Omit<TrackConnection, 'id'>) => void;
  deleteTrackConnection: (id: string) => void;
  getConnectionsByMap: (trackMapId: string) => TrackConnection[];
  recalculateConnections: (trackMapId: string) => void;

  addTrackSection: (data: Omit<TrackSection, 'id'>) => string;
  updateTrackSection: (id: string, data: Partial<TrackSection>) => void;
  deleteTrackSection: (id: string) => void;
  getSectionsByMap: (trackMapId: string) => TrackSection[];

  addIssueMarker: (data: Omit<IssueMarker, 'id' | 'createdAt'>) => void;
  updateIssueMarker: (id: string, data: Partial<IssueMarker>) => void;
  deleteIssueMarker: (id: string) => void;
  getIssueMarkersByMap: (trackMapId: string) => IssueMarker[];
}

export const useTrackMapStore = create<TrackMapState>((set, get) => ({
  trackMaps: loadFromStorage<TrackMap[]>(STORAGE_KEYS.TRACK_MAPS, []),
  trackElements: loadFromStorage<TrackElement[]>(STORAGE_KEYS.TRACK_ELEMENTS, []),
  trackConnections: loadFromStorage<TrackConnection[]>(STORAGE_KEYS.TRACK_CONNECTIONS, []),
  trackSections: loadFromStorage<TrackSection[]>(STORAGE_KEYS.TRACK_SECTIONS, []),
  issueMarkers: loadFromStorage<IssueMarker[]>(STORAGE_KEYS.ISSUE_MARKERS, []),
  activeTrackMapId: null,

  addTrackMap: (data) => {
    const now = new Date().toISOString();
    const newMap: TrackMap = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => {
      const trackMaps = [...state.trackMaps, newMap];
      saveToStorage(STORAGE_KEYS.TRACK_MAPS, trackMaps);
      return { trackMaps, activeTrackMapId: newMap.id };
    });
    return newMap.id;
  },

  updateTrackMap: (id, data) => {
    const now = new Date().toISOString();
    set((state) => {
      const trackMaps = state.trackMaps.map((m) =>
        m.id === id ? { ...m, ...data, updatedAt: now } : m
      );
      saveToStorage(STORAGE_KEYS.TRACK_MAPS, trackMaps);
      return { trackMaps };
    });
  },

  deleteTrackMap: (id) => {
    set((state) => {
      const trackMaps = state.trackMaps.filter((m) => m.id !== id);
      const trackElements = state.trackElements.filter((e) => e.trackMapId !== id);
      const trackConnections = state.trackConnections.filter((c) => c.trackMapId !== id);
      const trackSections = state.trackSections.filter((s) => s.trackMapId !== id);
      const issueMarkers = state.issueMarkers.filter((m) => m.trackMapId !== id);
      saveToStorage(STORAGE_KEYS.TRACK_MAPS, trackMaps);
      saveToStorage(STORAGE_KEYS.TRACK_ELEMENTS, trackElements);
      saveToStorage(STORAGE_KEYS.TRACK_CONNECTIONS, trackConnections);
      saveToStorage(STORAGE_KEYS.TRACK_SECTIONS, trackSections);
      saveToStorage(STORAGE_KEYS.ISSUE_MARKERS, issueMarkers);
      return {
        trackMaps,
        trackElements,
        trackConnections,
        trackSections,
        issueMarkers,
        activeTrackMapId: state.activeTrackMapId === id ? null : state.activeTrackMapId,
      };
    });
  },

  setActiveTrackMap: (id) => {
    set({ activeTrackMapId: id });
  },

  getActiveTrackMap: () => {
    const { activeTrackMapId, trackMaps } = get();
    return trackMaps.find((m) => m.id === activeTrackMapId);
  },

  addTrackElement: (data) => {
    const newElement: TrackElement = {
      ...data,
      id: generateId(),
    };
    set((state) => {
      const trackElements = [...state.trackElements, newElement];
      saveToStorage(STORAGE_KEYS.TRACK_ELEMENTS, trackElements);
      return { trackElements };
    });
  },

  updateTrackElement: (id, data) => {
    set((state) => {
      const trackElements = state.trackElements.map((e) =>
        e.id === id ? { ...e, ...data } : e
      );
      saveToStorage(STORAGE_KEYS.TRACK_ELEMENTS, trackElements);
      return { trackElements };
    });
  },

  deleteTrackElement: (id) => {
    set((state) => {
      const trackElements = state.trackElements.filter((e) => e.id !== id);
      saveToStorage(STORAGE_KEYS.TRACK_ELEMENTS, trackElements);
      return { trackElements };
    });
  },

  getTrackElementsByMap: (trackMapId) => {
    return get().trackElements.filter((e) => e.trackMapId === trackMapId);
  },

  addTrackConnection: (data) => {
    const newConn: TrackConnection = {
      ...data,
      id: generateId(),
    };
    set((state) => {
      const trackConnections = [...state.trackConnections, newConn];
      saveToStorage(STORAGE_KEYS.TRACK_CONNECTIONS, trackConnections);
      return { trackConnections };
    });
  },

  deleteTrackConnection: (id) => {
    set((state) => {
      const trackConnections = state.trackConnections.filter((c) => c.id !== id);
      saveToStorage(STORAGE_KEYS.TRACK_CONNECTIONS, trackConnections);
      return { trackConnections };
    });
  },

  getConnectionsByMap: (trackMapId) => {
    return get().trackConnections.filter((c) => c.trackMapId === trackMapId);
  },

  recalculateConnections: (trackMapId) => {
    const elements = get().trackElements.filter((e) => e.trackMapId === trackMapId);
    const newConnections = findConnections(elements);
    set((state) => {
      const otherConnections = state.trackConnections.filter((c) => c.trackMapId !== trackMapId);
      const trackConnections = [...otherConnections, ...newConnections];
      saveToStorage(STORAGE_KEYS.TRACK_CONNECTIONS, trackConnections);
      return { trackConnections };
    });
  },

  addTrackSection: (data) => {
    const newSection: TrackSection = {
      ...data,
      id: generateId(),
    };
    set((state) => {
      const trackSections = [...state.trackSections, newSection];
      saveToStorage(STORAGE_KEYS.TRACK_SECTIONS, trackSections);
      return { trackSections };
    });
    return newSection.id;
  },

  updateTrackSection: (id, data) => {
    set((state) => {
      const trackSections = state.trackSections.map((s) =>
        s.id === id ? { ...s, ...data } : s
      );
      saveToStorage(STORAGE_KEYS.TRACK_SECTIONS, trackSections);
      return { trackSections };
    });
  },

  deleteTrackSection: (id) => {
    set((state) => {
      const trackSections = state.trackSections.filter((s) => s.id !== id);
      saveToStorage(STORAGE_KEYS.TRACK_SECTIONS, trackSections);
      return { trackSections };
    });
  },

  getSectionsByMap: (trackMapId) => {
    return get().trackSections.filter((s) => s.trackMapId === trackMapId);
  },

  addIssueMarker: (data) => {
    const newMarker: IssueMarker = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const issueMarkers = [...state.issueMarkers, newMarker];
      saveToStorage(STORAGE_KEYS.ISSUE_MARKERS, issueMarkers);
      return { issueMarkers };
    });
  },

  updateIssueMarker: (id, data) => {
    set((state) => {
      const issueMarkers = state.issueMarkers.map((m) =>
        m.id === id ? { ...m, ...data } : m
      );
      saveToStorage(STORAGE_KEYS.ISSUE_MARKERS, issueMarkers);
      return { issueMarkers };
    });
  },

  deleteIssueMarker: (id) => {
    set((state) => {
      const issueMarkers = state.issueMarkers.filter((m) => m.id !== id);
      saveToStorage(STORAGE_KEYS.ISSUE_MARKERS, issueMarkers);
      return { issueMarkers };
    });
  },

  getIssueMarkersByMap: (trackMapId) => {
    return get().issueMarkers.filter((m) => m.trackMapId === trackMapId);
  },
}));

export function getIssueTypeColor(type: IssueType): string {
  switch (type) {
    case 'stall':
      return '#f39c12';
    case 'derail':
      return '#c0392b';
    case 'other':
      return '#4a698e';
    default:
      return '#4a698e';
  }
}

export function getIssueTypeLabel(type: IssueType): string {
  switch (type) {
    case 'stall':
      return '卡顿';
    case 'derail':
      return '脱轨';
    case 'other':
      return '其他';
    default:
      return '其他';
  }
}
