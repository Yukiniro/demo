import { create } from "zustand";
import { fitSize, loadImage } from "../utils";
import { initRenderStore, updateResolution, updateTexture } from "./render-store";
import { useToolsStore } from "./use-tools-store";

type State = {
  originalImageUrl: string;
  depthMapImageUrl: string;
  pending: boolean;
  isGenerating: boolean;
  error: Error | null;
  viewSize: { width: number; height: number };
  canvasSize: { width: number; height: number };
  imageSize: { width: number; height: number };
  presetImageIndex: number;
};

type Action = {
  setImages: (originalImageUrl: string, depthMapImageUrl: string) => void;
  init: () => void;
  updateViewSize: (width: number, height: number) => void;
  updateCanvasSizeAndRender: (
    imageSize: { width: number; height: number },
    viewSize: { width: number; height: number },
  ) => void;
  setPresetImageIndex: (index: number) => void;
  setIsGenerating: (isGenerating: boolean) => void;
};

export const useTextureStore = create<State & Action>((set, get) => ({
  originalImageUrl: "",
  depthMapImageUrl: "",
  presetImageIndex: -1,
  pending: false,
  error: null,
  viewSize: { width: 0, height: 0 },
  canvasSize: { width: 0, height: 0 },
  imageSize: { width: 0, height: 0 },
  isGenerating: false,
  init: () => {
    initRenderStore();
  },
  updateViewSize: (width: number, height: number) => {
    const { imageSize, updateCanvasSizeAndRender } = get();
    const viewSize = { width, height };
    set({ viewSize });

    if (imageSize.width && imageSize.height) {
      updateCanvasSizeAndRender(imageSize, viewSize);
    }
  },
  setPresetImageIndex: (index: number) => {
    set({ presetImageIndex: index });
  },
  setImages: async (originalImageUrl: string, depthMapImageUrl: string) => {
    const {
      pending,
      originalImageUrl: currentOriginalImageUrl,
      depthMapImageUrl: currentDepthMapImageUrl,
      updateCanvasSizeAndRender,
    } = get();

    if (pending) return;
    if (currentOriginalImageUrl === originalImageUrl && currentDepthMapImageUrl === depthMapImageUrl) return;

    try {
      set({ pending: true, error: null });
      set({ originalImageUrl, depthMapImageUrl });

      const originalImage = await loadImage(originalImageUrl);
      const depthMapImage = await loadImage(depthMapImageUrl);
      updateTexture(originalImage, depthMapImage);

      const imageSize = { width: originalImage.width, height: originalImage.height };
      set({ imageSize });

      const { viewSize } = get();
      if (viewSize.width && viewSize.height) {
        updateCanvasSizeAndRender(imageSize, viewSize);
      }
    } catch (error) {
      set({ error: error as Error });
    } finally {
      set({ pending: false });
    }
  },
  updateCanvasSizeAndRender: (
    imageSize: { width: number; height: number },
    viewSize: { width: number; height: number },
  ) => {
    const canvasSize = fitSize(imageSize, viewSize);
    set({ canvasSize });
    updateResolution(canvasSize.width, canvasSize.height);
    useToolsStore.getState().triggerAnimationRender();
  },
  setIsGenerating: (isGenerating: boolean) => {
    set({ isGenerating });
  },
}));
