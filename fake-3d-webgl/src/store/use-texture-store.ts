import { create } from "zustand";
import { loadImage } from "../utils";
import {
  couldRender,
  initRenderStore,
  render,
  updateFocus,
  updateOffset,
  updateResolution,
  updateTexture,
} from "./render-store";

type State = {
  originalImageUrl: string;
  depthMapImageUrl: string;
  pending: boolean;
  error: Error | null;
  viewSize: { width: number; height: number };
};

type Action = {
  setImages: (originalImageUrl: string, depthMapImageUrl: string) => void;
  init: () => void;
  render: (canvas: HTMLCanvasElement) => void;
};

const BASE_CANVAS_HEIGHT = 650;

export const useTextureStore = create<State & Action>((set, get) => ({
  originalImageUrl: "",
  depthMapImageUrl: "",
  pending: false,
  error: null,
  viewSize: { width: 0, height: 0 },
  init: () => {
    initRenderStore();
  },
  setImages: async (originalImageUrl: string, depthMapImageUrl: string) => {
    const { pending, originalImageUrl: currentOriginalImageUrl, depthMapImageUrl: currentDepthMapImageUrl } = get();
    if (pending) return;
    if (currentOriginalImageUrl === originalImageUrl && currentDepthMapImageUrl === depthMapImageUrl) return;

    try {
      set({ pending: true, error: null });
      const originalImage = await loadImage(originalImageUrl);
      const depthMapImage = await loadImage(depthMapImageUrl);

      const height = BASE_CANVAS_HEIGHT;
      const width = (originalImage.width / originalImage.height) * BASE_CANVAS_HEIGHT;
      set({ viewSize: { width, height } });
      updateResolution(width, height);
      updateTexture(originalImage, depthMapImage);

      // TODO 更新
      updateOffset({ x: 0, y: 0, z: 0 });
      updateFocus(0.5);

      set({ originalImageUrl, depthMapImageUrl });
    } catch (error) {
      set({ error: error as Error });
    } finally {
      set({ pending: false });
    }
  },
  render: (canvas: HTMLCanvasElement) => {
    if (couldRender()) render(canvas);
  },
}));
