import { create } from "zustand";
import { loadImage } from "../utils";
import { initRenderStore } from "./render-store";
import { renderView, updateImage, updateViewSize } from "./app-store";

type State = {
  imageUrl: string;
  pending: boolean;
  isGenerating: boolean;
  error: Error | null;
};

type Action = {
  setImages: (imageUrl: string) => void;
  init: () => void;
  updateViewSize: (width: number, height: number) => void;
  setIsGenerating: (isGenerating: boolean) => void;
};

export const useTextureStore = create<State & Action>((set, get) => ({
  imageUrl: "",
  pending: false,
  error: null,
  isGenerating: false,
  init: () => {
    initRenderStore();
  },
  updateViewSize: (width: number, height: number) => {
    updateViewSize(width, height);
  },
  setImages: async (imageUrl: string) => {
    const { pending, imageUrl: currentOriginalImageUrl } = get();

    if (pending) return;
    if (currentOriginalImageUrl === imageUrl) return;

    try {
      set({ pending: true, error: null });
      set({ imageUrl });

      const originalImage = await loadImage(imageUrl);
      updateImage(originalImage);
      renderView();
    } catch (error) {
      set({ error: error as Error });
    } finally {
      set({ pending: false });
    }
  },
  setIsGenerating: (isGenerating: boolean) => {
    set({ isGenerating });
  },
}));
