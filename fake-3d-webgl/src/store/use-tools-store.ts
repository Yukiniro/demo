import { create } from "zustand";

type Point = {
  x: number;
  y: number;
  z: number;
};

type State = {
  startPoint: Point;
  endPoint: Point;
  amount: number;
  animationDuration: number;
  focus: number;
  edgeDilation: number;
};

type Action = {
  updateStartPoint: (x: number, y: number, z: number) => void;
  updateEndPoint: (x: number, y: number, z: number) => void;
  updateAmount: (amount: number) => void;
  updateAnimationDuration: (amount: number) => void;
  updateFocus: (amount: number) => void;
  updateEdgeDilation: (amount: number) => void;
};

export const useToolsStore = create<State & Action>(set => ({
  startPoint: { x: 0, y: 0, z: 0 },
  endPoint: { x: 0, y: 0, z: 0 },
  amount: 0,
  animationDuration: 3,
  focus: 0.5,
  edgeDilation: 0,
  updateStartPoint: (x: number, y: number, z: number) => set({ startPoint: { x, y, z } }),
  updateEndPoint: (x: number, y: number, z: number) => set({ endPoint: { x, y, z } }),
  updateAmount: (amount: number) => {
    set({ amount });
  },
  updateAnimationDuration: (duration: number) => {
    set({ animationDuration: duration });
  },
  updateFocus: (focus: number) => {
    set({ focus });
  },
  updateEdgeDilation: (edge: number) => {
    set({ edgeDilation: edge });
  },
}));
