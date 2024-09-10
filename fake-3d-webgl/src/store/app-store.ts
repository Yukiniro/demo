import { Point, updateOffset, render, updateFocus, updateEnlarge, updateDilation } from "./render-store";

let canvas: HTMLCanvasElement | null = null;
let timer: number | null = null;
let startTime: number = 0;

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
    endPoint: Point;
    animationDuration: number;
    enlarge: number;
    focus: number;
    edgeDilation: number;
  },
) {
  if (!canvasSize || !canvas) {
    return;
  }
  const { startPoint, endPoint, animationDuration, enlarge, focus, edgeDilation } = options;

  updateEnlarge(enlarge);
  updateFocus(focus);
  updateDilation(edgeDilation);

  if (timer) {
    cancelAnimationFrame(timer);
    timer = null;
    startTime = 0;
  }

  const isLoop = true;
  const isReverse = false;
  const isCircular = false;

  const tick = () => {
    if (startTime === 0) {
      startTime = performance.now();
    }
    const progress = calcProgress(performance.now() / 1e3 / animationDuration, isCircular, isLoop, isReverse);
    const offset = calcProgressOffset(
      [startPoint.x, startPoint.y, startPoint.z],
      null,
      [endPoint.x, endPoint.y, endPoint.z],
      1,
      progress,
    );
    updateOffset({ x: offset[0], y: offset[1], z: offset[2] });

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
