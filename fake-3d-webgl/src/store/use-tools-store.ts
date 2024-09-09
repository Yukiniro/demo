import { create } from "zustand";
import { Point } from "./render-store";
import { updateAnimationRender } from "./app-store";

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
  triggerAnimationRender: () => void;
};

export const useToolsStore = create<State & Action>((set, get) => ({
  startPoint: { x: 0, y: 0, z: 0 },
  endPoint: { x: 0, y: 0, z: 0 },
  amount: 0,
  animationDuration: 3,
  focus: 0.5,
  edgeDilation: 0,
  updateStartPoint: (x: number, y: number, z: number) => {
    const startPoint = { x, y, z };
    const { endPoint, animationDuration } = get();
    set({ startPoint });
    updateAnimationRender(startPoint, endPoint, animationDuration);
  },
  updateEndPoint: (x: number, y: number, z: number) => {
    const endPoint = { x, y, z };
    const { startPoint, animationDuration } = get();
    set({ endPoint });
    updateAnimationRender(startPoint, endPoint, animationDuration);
  },
  updateAmount: (amount: number) => {
    set({ amount });
  },
  updateAnimationDuration: (duration: number) => {
    set({ animationDuration: duration });
    const { startPoint, endPoint } = get();
    updateAnimationRender(startPoint, endPoint, duration);
  },
  updateFocus: (focus: number) => {
    set({ focus });
  },
  updateEdgeDilation: (edge: number) => {
    set({ edgeDilation: edge });
  },
  triggerAnimationRender: () => {
    const { startPoint, endPoint, animationDuration } = get();
    updateAnimationRender(startPoint, endPoint, animationDuration);
  },
}));
