import { create } from "zustand";
import { updateBorderSize } from "./render-store";

type State = {
  borderSize: number;
};

type Action = {
  updateBorderSize: (borderSize: number) => void;
};

export const useToolsStore = create<State & Action>(set => ({
  borderSize: 0,
  updateBorderSize: (size: number) => {
    set({ borderSize: size });
    updateBorderSize(size);
  },
}));
