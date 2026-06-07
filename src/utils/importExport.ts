import { ExportData, STORAGE_KEYS } from '@/types';
import {
  loadFromStorage,
  saveToStorage,
  downloadJsonFile,
  readJsonFile,
  removeFromStorage,
} from '@/utils';
import dayjs from 'dayjs';

export const EXPORT_VERSION = '1.0.0';

export function exportAllData(): ExportData {
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    vehicles: loadFromStorage(STORAGE_KEYS.VEHICLES, []),
    consists: loadFromStorage(STORAGE_KEYS.CONSISTS, []),
    runLogs: loadFromStorage(STORAGE_KEYS.RUN_LOGS, []),
    trackMaps: loadFromStorage(STORAGE_KEYS.TRACK_MAPS, []),
    trackElements: loadFromStorage(STORAGE_KEYS.TRACK_ELEMENTS, []),
    trackConnections: loadFromStorage(STORAGE_KEYS.TRACK_CONNECTIONS, []),
    trackSections: loadFromStorage(STORAGE_KEYS.TRACK_SECTIONS, []),
    issueMarkers: loadFromStorage(STORAGE_KEYS.ISSUE_MARKERS, []),
  };
}

export function downloadExportData(): void {
  const data = exportAllData();
  const filename = `railway-record-${dayjs().format('YYYYMMDD-HHmmss')}.json`;
  downloadJsonFile(data, filename);
}

export async function importDataFromFile(file: File): Promise<ExportData> {
  const data = await readJsonFile<ExportData>(file);
  if (!data || typeof data !== 'object') {
    throw new Error('无效的数据文件');
  }
  if (!data.version) {
    throw new Error('数据文件格式不正确：缺少版本号');
  }
  return data;
}

export function applyImportData(data: ExportData, merge: boolean = false): void {
  if (!merge) {
    removeFromStorage(STORAGE_KEYS.VEHICLES);
    removeFromStorage(STORAGE_KEYS.CONSISTS);
    removeFromStorage(STORAGE_KEYS.RUN_LOGS);
    removeFromStorage(STORAGE_KEYS.TRACK_MAPS);
    removeFromStorage(STORAGE_KEYS.TRACK_ELEMENTS);
    removeFromStorage(STORAGE_KEYS.TRACK_CONNECTIONS);
    removeFromStorage(STORAGE_KEYS.TRACK_SECTIONS);
    removeFromStorage(STORAGE_KEYS.ISSUE_MARKERS);
  }

  if (data.vehicles?.length) {
    const existing = merge ? loadFromStorage(STORAGE_KEYS.VEHICLES, []) : [];
    saveToStorage(STORAGE_KEYS.VEHICLES, [...existing, ...data.vehicles]);
  }
  if (data.consists?.length) {
    const existing = merge ? loadFromStorage(STORAGE_KEYS.CONSISTS, []) : [];
    saveToStorage(STORAGE_KEYS.CONSISTS, [...existing, ...data.consists]);
  }
  if (data.runLogs?.length) {
    const existing = merge ? loadFromStorage(STORAGE_KEYS.RUN_LOGS, []) : [];
    saveToStorage(STORAGE_KEYS.RUN_LOGS, [...existing, ...data.runLogs]);
  }
  if (data.trackMaps?.length) {
    const existing = merge ? loadFromStorage(STORAGE_KEYS.TRACK_MAPS, []) : [];
    saveToStorage(STORAGE_KEYS.TRACK_MAPS, [...existing, ...data.trackMaps]);
  }
  if (data.trackElements?.length) {
    const existing = merge ? loadFromStorage(STORAGE_KEYS.TRACK_ELEMENTS, []) : [];
    saveToStorage(STORAGE_KEYS.TRACK_ELEMENTS, [...existing, ...data.trackElements]);
  }
  if (data.trackConnections?.length) {
    const existing = merge ? loadFromStorage(STORAGE_KEYS.TRACK_CONNECTIONS, []) : [];
    saveToStorage(STORAGE_KEYS.TRACK_CONNECTIONS, [...existing, ...data.trackConnections]);
  }
  if (data.trackSections?.length) {
    const existing = merge ? loadFromStorage(STORAGE_KEYS.TRACK_SECTIONS, []) : [];
    saveToStorage(STORAGE_KEYS.TRACK_SECTIONS, [...existing, ...data.trackSections]);
  }
  if (data.issueMarkers?.length) {
    const existing = merge ? loadFromStorage(STORAGE_KEYS.ISSUE_MARKERS, []) : [];
    saveToStorage(STORAGE_KEYS.ISSUE_MARKERS, [...existing, ...data.issueMarkers]);
  }
}

export function clearAllData(): void {
  removeFromStorage(STORAGE_KEYS.VEHICLES);
  removeFromStorage(STORAGE_KEYS.CONSISTS);
  removeFromStorage(STORAGE_KEYS.RUN_LOGS);
  removeFromStorage(STORAGE_KEYS.TRACK_MAPS);
  removeFromStorage(STORAGE_KEYS.TRACK_ELEMENTS);
  removeFromStorage(STORAGE_KEYS.TRACK_CONNECTIONS);
  removeFromStorage(STORAGE_KEYS.TRACK_SECTIONS);
  removeFromStorage(STORAGE_KEYS.ISSUE_MARKERS);
}

export function getDataStats(): {
  vehicles: number;
  consists: number;
  runLogs: number;
  trackMaps: number;
  trackElements: number;
  trackConnections: number;
  trackSections: number;
  issueMarkers: number;
} {
  return {
    vehicles: loadFromStorage(STORAGE_KEYS.VEHICLES, []).length,
    consists: loadFromStorage(STORAGE_KEYS.CONSISTS, []).length,
    runLogs: loadFromStorage(STORAGE_KEYS.RUN_LOGS, []).length,
    trackMaps: loadFromStorage(STORAGE_KEYS.TRACK_MAPS, []).length,
    trackElements: loadFromStorage(STORAGE_KEYS.TRACK_ELEMENTS, []).length,
    trackConnections: loadFromStorage(STORAGE_KEYS.TRACK_CONNECTIONS, []).length,
    trackSections: loadFromStorage(STORAGE_KEYS.TRACK_SECTIONS, []).length,
    issueMarkers: loadFromStorage(STORAGE_KEYS.ISSUE_MARKERS, []).length,
  };
}

export function refreshAllStores(): void {
  window.dispatchEvent(new Event('railway-data-refreshed'));
}
