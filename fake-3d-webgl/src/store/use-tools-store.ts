import { create } from "zustand";
import { Point } from "./render-store";
import { updateAnimationRender } from "./app-store";
import { useTextureStore } from "./use-texture-store";
import { PRESET_TYPE_MAP } from "../config";

export type MotionType = "CIRCULAR" | "LINEAR" | "THREEPOINTLINEAR";
export type PresetType =
  | "Vertical"
  | "Horizontal"
  | "Circle"
  | "Perspective"
  | "Zoom"
  | "Dolly"
  | "Zoom Left"
  | "Zoom Center"
  | "Zoom Right"
  | "Custom";

type State = {
  startPoint: Point;
  endPoint: Point;
  middlePoint: Point;
  amplitudePoint: Point;
  phasePoint: Point;
  amount: number;
  animationDuration: number;
  focus: number;
  edgeDilation: number;
  isLoop: boolean;
  isReverse: boolean;
  motionType: MotionType;
  presetType: PresetType;
  isLoopDisabled: boolean;
  isReverseDisabled: boolean;
};

type Action = {
  updateStartPoint: (x: number, y: number, z: number) => void;
  updateEndPoint: (x: number, y: number, z: number) => void;
  updateMiddlePoint: (x: number, y: number, z: number) => void;
  updateAmplitudePoint: (x: number, y: number, z: number) => void;
  updatePhasePoint: (x: number, y: number, z: number) => void;
  updateAmount: (amount: number) => void;
  updateAnimationDuration: (amount: number) => void;
  updateFocus: (amount: number) => void;
  updateEdgeDilation: (amount: number) => void;
  updateMotionType: (motionType: MotionType) => void;
  triggerAnimationRender: () => void;
  updatePresetType: (presetType: PresetType) => void;
  updateIsLoop: (isLoop: boolean) => void;
  updateIsReverse: (isReverse: boolean) => void;
};

export const useToolsStore = create<State & Action>((set, get) => ({
  motionType: "LINEAR",
  presetType: "Custom",
  startPoint: { x: 0.05, y: 0, z: 0 },
  endPoint: { x: -0.05, y: 0, z: 0 },
  middlePoint: { x: 0, y: 0, z: 0 },
  amplitudePoint: { x: 0.1, y: 0.1, z: 0 },
  phasePoint: { x: 0, y: 1, z: 1 }, // 0-3 对应 u_phase 0.0 - 0.75
  amount: 1,
  animationDuration: 4,
  focus: 0.5, // 0-1 对应 u_focus 0.0 - 1.0
  edgeDilation: 0, // 0-1 对应 u_dilation 0.0 - 0.005
  isLoopDisabled: false,
  isReverseDisabled: false,
  isLoop: true,
  isReverse: false,
  updateIsLoop: (isLoop: boolean) => {
    set({ isLoop, presetType: "Custom" });
    get().triggerAnimationRender();
  },
  updateIsReverse: (isReverse: boolean) => {
    set({ isReverse, presetType: "Custom" });
    get().triggerAnimationRender();
  },
  updatePresetType: (presetType: PresetType) => {
    set({ presetType });
    if (presetType !== "Custom") {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      set(PRESET_TYPE_MAP[presetType]);
    }
    get().triggerAnimationRender();
  },
  updateStartPoint: (x: number, y: number, z: number) => {
    const startPoint = { x, y, z };
    set({ startPoint, presetType: "Custom" });
    get().triggerAnimationRender();
  },
  updateEndPoint: (x: number, y: number, z: number) => {
    const endPoint = { x, y, z };
    set({ endPoint, presetType: "Custom" });
    get().triggerAnimationRender();
  },
  updateMiddlePoint: (x: number, y: number, z: number) => {
    const middlePoint = { x, y, z };
    set({ middlePoint, presetType: "Custom" });
    get().triggerAnimationRender();
  },
  updateAmplitudePoint: (x: number, y: number, z: number) => {
    const amplitudePoint = { x, y, z };
    set({ amplitudePoint, presetType: "Custom" });
    get().triggerAnimationRender();
  },
  updatePhasePoint: (x: number, y: number, z: number) => {
    const phasePoint = { x, y, z };
    set({ phasePoint, presetType: "Custom" });
    get().triggerAnimationRender();
  },
  updateAmount: (amount: number) => {
    set({ amount, presetType: "Custom" });
    get().triggerAnimationRender();
  },
  updateAnimationDuration: (duration: number) => {
    set({ animationDuration: duration, presetType: "Custom" });
    get().triggerAnimationRender();
  },
  updateFocus: (focus: number) => {
    set({ focus, presetType: "Custom" });
    get().triggerAnimationRender();
  },
  updateEdgeDilation: (edgeDilation: number) => {
    set({ edgeDilation, presetType: "Custom" });
    get().triggerAnimationRender();
  },
  updateMotionType: (motionType: MotionType) => {
    set({ motionType, presetType: "Custom" });
    get().triggerAnimationRender();
  },
  triggerAnimationRender: () => {
    const {
      startPoint,
      endPoint,
      animationDuration,
      focus,
      amount,
      edgeDilation,
      middlePoint,
      motionType,
      amplitudePoint,
      phasePoint,
      isLoop,
      isReverse,
    } = get();
    const { canvasSize } = useTextureStore.getState();
    updateAnimationRender(canvasSize, {
      startPoint,
      middlePoint,
      endPoint,
      amplitudePoint,
      phasePoint: {
        x: 0.25 * phasePoint.x,
        y: 0.25 * phasePoint.y,
        z: 0.25 * phasePoint.z,
      },
      amountOfMotion: amount,
      animationDuration: motionType === "LINEAR" ? animationDuration / 2 : animationDuration,
      enlarge: 1 + calculateCropValue(),
      focus,
      edgeDilation: edgeDilation * 0.005,
      motionType,
      isLoop,
      isReverse,
    });
  },
}));

function calculateCropValue() {
  const { motionType, startPoint, endPoint, middlePoint, amplitudePoint, amount, focus } = useToolsStore.getState();
  const calculateMaxValue = (points: number[], focus: number, amount: number) =>
    Math.max(
      ...[-0.5, 0.5].map(offset => {
        const adjustedPoints1 = points
          .map(value => (1 - amount * focus) * offset + amount * value + offset * focus - value)
          .map(Math.abs);
        const adjustedPoints2 = points.map(value => (1 - amount * focus) * offset + amount * value).map(Math.abs);
        return Math.max(Math.max(...adjustedPoints1), Math.max(...adjustedPoints2));
      }),
    );

  const type = motionType;
  if (type === "CIRCULAR") {
    const amplitudeX = amplitudePoint.x;
    const amplitudeY = amplitudePoint.y;
    const amplitudeZ = amplitudePoint.z;
    const maxValue = calculateMaxValue(
      [amplitudeX * amount, amplitudeY * amount].map(Math.abs),
      amplitudeZ * amount,
      focus,
    );
    return ((Math.max(maxValue, 0.5) - 0.5) / (2 * maxValue)) * 2;
  } else {
    const startPosition = [startPoint.x, startPoint.y, startPoint.z].map(value => value * amount);
    const middlePosition =
      type === "THREEPOINTLINEAR"
        ? [middlePoint.x, middlePoint.y, middlePoint.z].map(value => value * amount)
        : [0, 0, 0];
    const endPosition = [endPoint.x, endPoint.y, endPoint.z].map(value => value * amount);
    const maxStartValue = calculateMaxValue(
      [startPosition[0], startPosition[1]].map(Math.abs),
      startPosition[2],
      focus,
    );
    const maxMiddleValue =
      type === "THREEPOINTLINEAR"
        ? calculateMaxValue([middlePosition[0], middlePosition[1]].map(Math.abs), middlePosition[2], focus)
        : 0;
    const maxEndValue = calculateMaxValue([endPosition[0], endPosition[1]].map(Math.abs), endPosition[2], focus);
    const maxValue = Math.max(Math.max(maxStartValue, maxMiddleValue), maxEndValue);
    return ((Math.max(maxValue, 0.5) - 0.5) / (2 * maxValue)) * 2;
  }
}
