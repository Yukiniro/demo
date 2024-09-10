import { create } from "zustand";
import { fitSize, loadImage } from "../utils";
import { initRenderStore, updateFocus, updateOffset, updateResolution, updateTexture } from "./render-store";
import { useToolsStore } from "./use-tools-store";

type State = {
  originalImageUrl: string;
  depthMapImageUrl: string;
  pending: boolean;
  error: Error | null;
  viewSize: { width: number; height: number };
  canvasSize: { width: number; height: number };
  imageSize: { width: number; height: number };
};

type Action = {
  setImages: (originalImageUrl: string, depthMapImageUrl: string) => void;
  init: () => void;
  updateViewSize: (width: number, height: number) => void;
};

export const useTextureStore = create<State & Action>((set, get) => ({
  originalImageUrl: "",
  depthMapImageUrl: "",
  pending: false,
  error: null,
  viewSize: { width: 0, height: 0 },
  canvasSize: { width: 0, height: 0 },
  imageSize: { width: 0, height: 0 },
  init: () => {
    initRenderStore();
  },
  updateViewSize: (width: number, height: number) => {
    set({ viewSize: { width, height } });
    useToolsStore.getState().triggerAnimationRender();
  },
  setImages: async (originalImageUrl: string, depthMapImageUrl: string) => {
    const {
      pending,
      originalImageUrl: currentOriginalImageUrl,
      depthMapImageUrl: currentDepthMapImageUrl,
      viewSize,
    } = get();
    if (pending) return;
    if (currentOriginalImageUrl === originalImageUrl && currentDepthMapImageUrl === depthMapImageUrl) return;
    if (viewSize.width === 0 || viewSize.height === 0) return;

    try {
      set({ pending: true, error: null });
      const originalImage = await loadImage(originalImageUrl);
      const depthMapImage = await loadImage(depthMapImageUrl);

      const imageSize = { width: originalImage.width, height: originalImage.height };
      const canvasSize = fitSize(imageSize, viewSize);
      set({ imageSize, canvasSize });

      updateResolution(canvasSize.width, canvasSize.height);
      updateTexture(originalImage, depthMapImage);

      // TODO 更新
      updateOffset({ x: 0, y: 0, z: 0 });
      updateFocus(0.5);

      set({ originalImageUrl, depthMapImageUrl });

      useToolsStore.getState().triggerAnimationRender();
    } catch (error) {
      set({ error: error as Error });
    } finally {
      set({ pending: false });
    }
  },
}));
