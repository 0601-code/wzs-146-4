import { create } from 'zustand';
import { RunLog, STORAGE_KEYS } from '@/types';
import { generateId, loadFromStorage, saveToStorage } from '@/utils';

interface RunLogState {
  runLogs: RunLog[];
  addRunLog: (data: Omit<RunLog, 'id' | 'createdAt'>) => void;
  updateRunLog: (id: string, data: Partial<RunLog>) => void;
  deleteRunLog: (id: string) => void;
  getRunLog: (id: string) => RunLog | undefined;
  getRunLogsByConsist: (consistId: string) => RunLog[];
  getRunLogsByDateRange: (startDate: string, endDate: string) => RunLog[];
  getTotalDuration: () => number;
}

export const useRunLogStore = create<RunLogState>((set, get) => ({
  runLogs: loadFromStorage<RunLog[]>(STORAGE_KEYS.RUN_LOGS, []),

  addRunLog: (data) => {
    const now = new Date().toISOString();
    const newLog: RunLog = {
      ...data,
      id: generateId(),
      createdAt: now,
    };
    set((state) => {
      const runLogs = [newLog, ...state.runLogs].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      saveToStorage(STORAGE_KEYS.RUN_LOGS, runLogs);
      return { runLogs };
    });
  },

  updateRunLog: (id, data) => {
    set((state) => {
      const runLogs = state.runLogs
        .map((log) => (log.id === id ? { ...log, ...data } : log))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      saveToStorage(STORAGE_KEYS.RUN_LOGS, runLogs);
      return { runLogs };
    });
  },

  deleteRunLog: (id) => {
    set((state) => {
      const runLogs = state.runLogs.filter((log) => log.id !== id);
      saveToStorage(STORAGE_KEYS.RUN_LOGS, runLogs);
      return { runLogs };
    });
  },

  getRunLog: (id) => {
    return get().runLogs.find((log) => log.id === id);
  },

  getRunLogsByConsist: (consistId) => {
    return get().runLogs.filter((log) => log.consistId === consistId);
  },

  getRunLogsByDateRange: (startDate, endDate) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return get().runLogs.filter((log) => {
      const logDate = new Date(log.date).getTime();
      return logDate >= start && logDate <= end;
    });
  },

  getTotalDuration: () => {
    return get().runLogs.reduce((total, log) => total + log.durationMinutes, 0);
  },
}));
