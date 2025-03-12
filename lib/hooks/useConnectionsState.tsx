import { create } from "zustand";

interface ConnectionsState {
  isCreating: boolean;
  editingConnectionId: number | null;
  openAddConnectionForm: () => void;
  openEditConnectionForm: (id: number) => void;
  closeConnectionForm: () => void;
}

export const useConnectionsState = create<ConnectionsState>((set) => ({
  isCreating: false,
  editingConnectionId: null,
  openAddConnectionForm: () =>
    set({ isCreating: true, editingConnectionId: null }),
  openEditConnectionForm: (id) =>
    set({ isCreating: false, editingConnectionId: id }),
  closeConnectionForm: () =>
    set({ isCreating: false, editingConnectionId: null }),
}));
