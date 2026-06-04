import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import EncryptedStorage from 'react-native-encrypted-storage';
import { ENCRYPTED_STORAGE_KEYS } from '@constants/storage.constants';

interface WorksiteSettings {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  shiftStartHour: number;
}

interface SettingsStore {
  worksite: WorksiteSettings | null;
  supervisorPin: string | null; // Hashed PIN for supervisor mode access

  setWorksite: (worksite: WorksiteSettings) => void;
  setSupervisorPin: (pinHash: string) => void;
  clearSettings: () => void;
}

// EncryptedStorage adapter for Zustand persist middleware
const encryptedStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await EncryptedStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await EncryptedStorage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    await EncryptedStorage.removeItem(key);
  },
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    immer((set) => ({
      worksite: null,
      supervisorPin: null,

      setWorksite: (worksite) =>
        set((state) => {
          state.worksite = worksite;
        }),
      setSupervisorPin: (pinHash) =>
        set((state) => {
          state.supervisorPin = pinHash;
        }),
      clearSettings: () =>
        set((state) => {
          state.worksite = null;
          state.supervisorPin = null;
        }),
    })),
    {
      name: ENCRYPTED_STORAGE_KEYS.WORKSITE_CONFIG,
      storage: createJSONStorage(() => encryptedStorageAdapter),
    },
  ),
);
