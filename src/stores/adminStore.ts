import { create } from 'zustand';

interface AdminState {
  authenticated: boolean;
  role: string | null;
  setAuth: (authenticated: boolean, role?: string | null) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  authenticated: false,
  role: null,
  setAuth: (authenticated, role = null) => set({ authenticated, role }),
}));
