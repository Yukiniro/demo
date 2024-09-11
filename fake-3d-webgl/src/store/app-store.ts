import { Point, updateOffset, render, updateFocus, updateEnlarge, updateDilation } from "./render-store";
import { MotionType } from "./use-tools-store";

let canvas: HTMLCanvasElement | null = null;
let timer: number | null = null;

function bindCanvas(renderCanvas: HTMLCanvasElement) {
  if (renderCanvas === canvas) {
    return;
  }
  canvas = renderCanvas;
}

function updateAnimationRender(
  canvasSize: { width: number; height: number },
  options: {
    startPoint: Point;
    middlePoint: Point;
    endPoint: Point;
    animationDuration: number;
    amountOfMotion: number;
    amplitudePoint: Point;
    phasePoint: Point;
    enlarge: number;
    focus: number;
    edgeDilation: number;
    motionType: MotionType;
    isLoop: boolean;
    isReverse: boolean;
  },
) {
  if (!canvasSize || !canvas) {
    return;
  }
  const {
    startPoint,
    middlePoint,
    endPoint,
    animationDuration,
    amountOfMotion,
    enlarge,
    focus,
    edgeDilation,
    amplitudePoint,
    phasePoint,
    motionType,
    isLoop,
    isReverse,
  } = options;

  updateEnlarge(enlarge);
  updateFocus(focus);
  updateDilation(edgeDilation);

  if (timer) {
    cancelAnimationFrame(timer);
    timer = null;
  }

  const isCircular = motionType === "CIRCULAR";

  const tick = () => {
    const progress = calcProgress(performance.now() / 1e3 / animationDuration, isCircular, isLoop, isReverse);
    const offset = { x: 0, y: 0, z: 0 };
    if (motionType === "CIRCULAR") {
      const [x, y, z] = calcCircularProgressOffset(
        [amplitudePoint.x, amplitudePoint.y, amplitudePoint.z],
        [phasePoint.x, phasePoint.y, phasePoint.z],
        amountOfMotion,
        progress,
      );
      offset.x = x;
      offset.y = y;
      offset.z = z;
    } else {
      const middlePointArr = motionType === "LINEAR" ? null : [middlePoint.x, middlePoint.y, middlePoint.z];
      const [x, y, z] = calcProgressOffset(
        [startPoint.x, startPoint.y, startPoint.z],
        middlePointArr,
        [endPoint.x, endPoint.y, endPoint.z],
        amountOfMotion,
        progress,
      );
      offset.x = x;
      offset.y = y;
      offset.z = z;
    }

    updateOffset(offset);

    if (canvas) {
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      render(canvas as HTMLCanvasElement);
    }

    timer = requestAnimationFrame(tick);
  };
  timer = requestAnimationFrame(tick);
}

function calcProgress(value: number, isCircular: boolean, loop: boolean, reverse: boolean): number {
  let result = isCircular !== loop ? 1 - Math.abs((value % 2) - 1) : value % 1;
  if (reverse) {
    result = 1 - result;
  }
  return result;
}

function calcProgressValue(startValue: number, middleValue: number, endValue: number, progress: number) {
  const coefficientY =
    (1 * (middleValue - startValue) + 0.5 * (startValue - endValue) + 0 * (endValue - middleValue)) / -0.25;
  const coefficientC =
    (1 * 1 * (startValue - middleValue) + 0.5 * 0.5 * (endValue - startValue) + 0 * 0 * (middleValue - endValue)) /
    -0.25;
  const coefficientO =
    (0.5 * 1 * (0.5 - 1) * startValue + 1 * 0 * 1 * middleValue + 0 * 0.5 * (0 - 0.5) * endValue) / -0.25;
  return coefficientY * progress * progress + coefficientC * progress + coefficientO;
}

function calcCircularProgressOffset(amplitudePoint: number[], phasePoint: number[], amount: number, progress: number) {
  return [
    Math.sin(2 * Math.PI * (progress + phasePoint[0])) * amplitudePoint[0] * amount,
    Math.sin(2 * Math.PI * (progress + phasePoint[1])) * amplitudePoint[1] * amount,
    0.5 * (1 + Math.sin(2 * Math.PI * (progress + phasePoint[2]))) * amplitudePoint[2] * amount,
  ];
}

function calcProgressOffset(
  startPoint: number[],
  middlePoint: number[] | null,
  endPoint: number[],
  amount: number,
  progress: number,
) {
  if (middlePoint === null) {
    middlePoint = endPoint.map((value, index) => (value - startPoint[index]) / 2 + startPoint[index]);
  }
  startPoint = startPoint.map(value => value * amount);
  const scaledMiddlePoint = middlePoint.map(value => value * amount);
  endPoint = endPoint.map(value => value * amount);
  return startPoint.map((value, index) =>
    calcProgressValue(value, scaledMiddlePoint[index], endPoint[index], progress),
  );
}

export { bindCanvas, updateAnimationRender, calcProgressOffset };
