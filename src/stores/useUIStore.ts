import { create } from 'zustand';

interface UIState {
  authModalOpen: boolean;
  authModalTab: 'login' | 'signup';
  mobileMenuOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  setAuthModalTab: (tab: 'login' | 'signup') => void;
  setMobileMenuOpen: (open: boolean) => void;
  openAuthModal: (tab: 'login' | 'signup') => void;
}

export const useUIStore = create<UIState>((set) => ({
  authModalOpen: false,
  authModalTab: 'login',
  mobileMenuOpen: false,
  setAuthModalOpen: (open) => set({ authModalOpen: open }),
  setAuthModalTab: (tab) => set({ authModalTab: tab }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  openAuthModal: (tab) => set({ authModalOpen: true, authModalTab: tab }),
}));
