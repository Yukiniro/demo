import { create } from "zustand";

type State = {
  exportProgress: number;
  isExporting: boolean;
};

type Action = {
  updateExportProgress: (progress: number) => void;
  startExport: () => void;
};

export const useExportStore = create<State & Action>((set, get) => ({
  exportProgress: 0,
  isExporting: false,
  updateExportProgress: (progress: number) => set({ exportProgress: progress }),
  startExport: async () => {
    try {
      if (get().isExporting) {
        return;
      }
      set({ isExporting: true });
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      alert(e?.message || "Failed to export");
    } finally {
      set({ isExporting: false });
    }
  },
}));
