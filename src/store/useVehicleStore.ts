import { create } from 'zustand';
import { Vehicle, VehicleType, STORAGE_KEYS } from '@/types';
import { generateId, loadFromStorage, saveToStorage } from '@/utils';

interface VehicleState {
  vehicles: Vehicle[];
  addVehicle: (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateVehicle: (id: string, data: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  getVehicle: (id: string) => Vehicle | undefined;
  getVehiclesByType: (type: VehicleType) => Vehicle[];
  searchVehicles: (query: string) => Vehicle[];
}

export const useVehicleStore = create<VehicleState>((set, get) => ({
  vehicles: loadFromStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES, []),

  addVehicle: (data) => {
    const now = new Date().toISOString();
    const newVehicle: Vehicle = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => {
      const vehicles = [...state.vehicles, newVehicle];
      saveToStorage(STORAGE_KEYS.VEHICLES, vehicles);
      return { vehicles };
    });
  },

  updateVehicle: (id, data) => {
    const now = new Date().toISOString();
    set((state) => {
      const vehicles = state.vehicles.map((v) =>
        v.id === id ? { ...v, ...data, updatedAt: now } : v
      );
      saveToStorage(STORAGE_KEYS.VEHICLES, vehicles);
      return { vehicles };
    });
  },

  deleteVehicle: (id) => {
    set((state) => {
      const vehicles = state.vehicles.filter((v) => v.id !== id);
      saveToStorage(STORAGE_KEYS.VEHICLES, vehicles);
      return { vehicles };
    });
  },

  getVehicle: (id) => {
    return get().vehicles.find((v) => v.id === id);
  },

  getVehiclesByType: (type) => {
    return get().vehicles.filter((v) => v.type === type);
  },

  searchVehicles: (query) => {
    const q = query.toLowerCase().trim();
    if (!q) return get().vehicles;
    return get().vehicles.filter(
      (v) =>
        v.model.toLowerCase().includes(q) ||
        v.roadNumber.toLowerCase().includes(q) ||
        v.notes?.toLowerCase().includes(q)
    );
  },
}));
