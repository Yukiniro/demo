import { create } from "zustand";
import { Point } from "./render-store";
import { updateAnimationRender } from "./app-store";
import { useTextureStore } from "./use-texture-store";

type State = {
  startPoint: Point;
  endPoint: Point;
  middlePoint: Point;
  amplitudePoint: Point;
  amount: number;
  animationDuration: number;
  focus: number;
  edgeDilation: number;
  motionType: number;
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

const MotionType = {
  CIRCULAR: 0,
  LINEAR: 1,
  THREEPOINTLINEAR: 2,
};

export const useToolsStore = create<State & Action>((set, get) => ({
  motionType: MotionType.LINEAR,
  startPoint: { x: 0.05, y: 0, z: 0 },
  endPoint: { x: -0.05, y: 0, z: 0 },
  middlePoint: { x: 0, y: 0, z: 0 },
  amplitudePoint: { x: 0, y: 0, z: 0 },
  amount: 1,
  animationDuration: 4,
  focus: 0.5, // 0-1 对应 u_focus 0.0 - 1.0
  edgeDilation: 0, // 0-1 对应 u_dilation 0.0 - 0.005
  updateStartPoint: (x: number, y: number, z: number) => {
    const startPoint = { x, y, z };
    set({ startPoint });
    get().triggerAnimationRender();
  },
  updateEndPoint: (x: number, y: number, z: number) => {
    const endPoint = { x, y, z };
    set({ endPoint });
    get().triggerAnimationRender();
  },
  updateAmount: (amount: number) => {
    set({ amount });
    get().triggerAnimationRender();
  },
  updateAnimationDuration: (duration: number) => {
    set({ animationDuration: duration });
    get().triggerAnimationRender();
  },
  updateFocus: (focus: number) => {
    set({ focus });
    get().triggerAnimationRender();
  },
  updateEdgeDilation: (edgeDilation: number) => {
    set({ edgeDilation });
    get().triggerAnimationRender();
  },
  triggerAnimationRender: () => {
    const { startPoint, endPoint, animationDuration, focus, edgeDilation } = get();
    const { canvasSize } = useTextureStore.getState();
    updateAnimationRender(canvasSize, {
      startPoint,
      endPoint,
      animationDuration: animationDuration / 2,
      enlarge: 1 + calculateCropValue(),
      focus,
      edgeDilation: edgeDilation * 0.005,
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
  if (type === MotionType.CIRCULAR) {
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
      type === MotionType.THREEPOINTLINEAR
        ? [middlePoint.x, middlePoint.y, middlePoint.z].map(value => value * amount)
        : [0, 0, 0];
    const endPosition = [endPoint.x, endPoint.y, endPoint.z].map(value => value * amount);
    const maxStartValue = calculateMaxValue(
      [startPosition[0], startPosition[1]].map(Math.abs),
      startPosition[2],
      focus,
    );
    const maxMiddleValue =
      type === MotionType.THREEPOINTLINEAR
        ? calculateMaxValue([middlePosition[0], middlePosition[1]].map(Math.abs), middlePosition[2], focus)
        : 0;
    const maxEndValue = calculateMaxValue([endPosition[0], endPosition[1]].map(Math.abs), endPosition[2], focus);
    const maxValue = Math.max(Math.max(maxStartValue, maxMiddleValue), maxEndValue);
    return ((Math.max(maxValue, 0.5) - 0.5) / (2 * maxValue)) * 2;
  }
}
