import { create } from 'zustand';
import { Consist, STORAGE_KEYS } from '@/types';
import { generateId, loadFromStorage, saveToStorage } from '@/utils';

interface ConsistState {
  consists: Consist[];
  addConsist: (data: Omit<Consist, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateConsist: (id: string, data: Partial<Consist>) => void;
  deleteConsist: (id: string) => void;
  getConsist: (id: string) => Consist | undefined;
  reorderVehicles: (consistId: string, vehicleIds: string[]) => void;
  addVehicleToConsist: (consistId: string, vehicleId: string, position?: number) => void;
  removeVehicleFromConsist: (consistId: string, vehicleId: string) => void;
}

export const useConsistStore = create<ConsistState>((set, get) => ({
  consists: loadFromStorage<Consist[]>(STORAGE_KEYS.CONSISTS, []),

  addConsist: (data) => {
    const now = new Date().toISOString();
    const newConsist: Consist = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => {
      const consists = [...state.consists, newConsist];
      saveToStorage(STORAGE_KEYS.CONSISTS, consists);
      return { consists };
    });
  },

  updateConsist: (id, data) => {
    const now = new Date().toISOString();
    set((state) => {
      const consists = state.consists.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: now } : c
      );
      saveToStorage(STORAGE_KEYS.CONSISTS, consists);
      return { consists };
    });
  },

  deleteConsist: (id) => {
    set((state) => {
      const consists = state.consists.filter((c) => c.id !== id);
      saveToStorage(STORAGE_KEYS.CONSISTS, consists);
      return { consists };
    });
  },

  getConsist: (id) => {
    return get().consists.find((c) => c.id === id);
  },

  reorderVehicles: (consistId, vehicleIds) => {
    const now = new Date().toISOString();
    set((state) => {
      const consists = state.consists.map((c) =>
        c.id === consistId ? { ...c, vehicleIds, updatedAt: now } : c
      );
      saveToStorage(STORAGE_KEYS.CONSISTS, consists);
      return { consists };
    });
  },

  addVehicleToConsist: (consistId, vehicleId, position) => {
    const now = new Date().toISOString();
    set((state) => {
      const consists = state.consists.map((c) => {
        if (c.id !== consistId) return c;
        const newVehicleIds = [...c.vehicleIds];
        if (position !== undefined) {
          newVehicleIds.splice(position, 0, vehicleId);
        } else {
          newVehicleIds.push(vehicleId);
        }
        return { ...c, vehicleIds: newVehicleIds, updatedAt: now };
      });
      saveToStorage(STORAGE_KEYS.CONSISTS, consists);
      return { consists };
    });
  },

  removeVehicleFromConsist: (consistId, vehicleId) => {
    const now = new Date().toISOString();
    set((state) => {
      const consists = state.consists.map((c) => {
        if (c.id !== consistId) return c;
        return {
          ...c,
          vehicleIds: c.vehicleIds.filter((id) => id !== vehicleId),
          updatedAt: now,
        };
      });
      saveToStorage(STORAGE_KEYS.CONSISTS, consists);
      return { consists };
    });
  },
}));
