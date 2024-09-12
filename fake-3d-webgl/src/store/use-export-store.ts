import { create } from "zustand";
import { exportVideo } from "./app-store";
import { useToolsStore } from "./use-tools-store";
import { useTextureStore } from "./use-texture-store";

type State = {
  exportProgress: number;
  isExporting: boolean;
};

type Action = {
  updateExportProgress: (progress: number) => void;
  exportVideo: () => void;
};

export const useExportStore = create<State & Action>((set, get) => ({
  exportProgress: 0,
  isExporting: false,
  updateExportProgress: (progress: number) => set({ exportProgress: progress }),
  exportVideo: async () => {
    try {
      if (get().isExporting) {
        return;
      }
      set({ exportProgress: 0 });
      set({ isExporting: true });
      const { animationDuration, getAnimationData } = useToolsStore.getState();
      const { imageSize } = useTextureStore.getState();
      await exportVideo(imageSize, animationDuration, {
        ...getAnimationData(),
        progressCallback: value => {
          set({ exportProgress: value * 100 });
        },
      });
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      alert(e?.message || "Failed to export");
    } finally {
      set({ isExporting: false });
    }
  },
}));
