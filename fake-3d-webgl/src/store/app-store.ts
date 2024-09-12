import { sleep } from "../utils";
import {
  Point,
  updateOffset,
  render,
  updateFocus,
  updateEnlarge,
  updateDilation,
  updateResolution,
} from "./render-store";
import { AnimationData, MotionType } from "./use-tools-store";
import { clamp } from "lodash-es";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import MP4Box from "mp4box";

let canvas: HTMLCanvasElement | null = null;
let timer: number | null = null;

function bindCanvas(renderCanvas: HTMLCanvasElement) {
  if (renderCanvas === canvas) {
    return;
  }
  canvas = renderCanvas;
}

function updateAnimationRender(canvasSize: { width: number; height: number }, options: AnimationData) {
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

  const tickRender = () => {
    tick(canvas, {
      canvasSize,
      timestamp: performance.now() / 1e3,
      motionType,
      animationDuration,
      startPoint,
      middlePoint,
      endPoint,
      isCircular,
      isLoop,
      isReverse,
      amplitudePoint,
      phasePoint,
      amountOfMotion,
    });

    timer = requestAnimationFrame(tickRender);
  };
  timer = requestAnimationFrame(tickRender);
}

function tick(
  canvas: HTMLCanvasElement | null,
  options: {
    canvasSize: { width: number; height: number };
    timestamp: number;
    motionType: MotionType;
    animationDuration: number;
    startPoint: Point;
    middlePoint: Point;
    endPoint: Point;
    isCircular: boolean;
    isLoop: boolean;
    isReverse: boolean;
    amplitudePoint: Point;
    phasePoint: Point;
    amountOfMotion: number;
  },
) {
  const {
    canvasSize,
    timestamp,
    motionType,
    startPoint,
    middlePoint,
    endPoint,
    animationDuration,
    isCircular,
    isLoop,
    isReverse,
    amplitudePoint,
    phasePoint,
    amountOfMotion,
  } = options;

  const progress = calcProgress(timestamp / animationDuration, isCircular, isLoop, isReverse);
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

async function exportVideo(
  size: { width: number; height: number },
  exportDuration: number,
  options: AnimationData & { progressCallback: (progress: number) => void },
) {
  const width = size.width % 2 === 0 ? size.width : size.width + 1;
  const height = size.height % 2 === 0 ? size.height : size.height + 1;

  const {
    startPoint,
    middlePoint,
    endPoint,
    animationDuration,
    amountOfMotion,
    amplitudePoint,
    phasePoint,
    enlarge,
    focus,
    edgeDilation,
    motionType,
    isLoop,
    isReverse,
    progressCallback,
  } = options;

  const fps = 30;
  const GOP = 250;
  const isCircular = motionType === "CIRCULAR";

  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = width;
  exportCanvas.height = height;
  const ctx = exportCanvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const totalFrames = Math.floor(exportDuration * fps);
  const mp4box = MP4Box.createFile();
  const trackOptions = {
    timescale: 1_000_000,
    width,
    height,
    nb_samples: totalFrames,
    codec: "avc1.420029",
    brands: ["isom", "iso2", "avc1", "mp42", "mp41"],
  };

  let trackId: number | null = null;
  let outputCount = 0;
  let encodeCount = 0;

  const videoConfig = {
    width,
    height,
    codec: "avc1.420029",
    bitrate: 1000000,
    framerate: fps,
    alpha: "discard",

    // https://github.com/gpac/mp4box.js/issues/243
    avc: { format: "avc" },
  };
  await VideoEncoder.isConfigSupported(videoConfig as VideoEncoderConfig);

  let resolveDone: (() => void) | null = null;
  let rejectDone: ((reason?: Error) => void) | null = null;
  const donePromise = new Promise<void>((resolve, reject) => {
    resolveDone = resolve;
    rejectDone = reject;
  });

  const encoder = new VideoEncoder({
    error: e => {
      rejectDone?.(e);
    },
    output: (chunk, config) => {
      if (trackId === null) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        trackOptions.avcDecoderConfigRecord = config?.decoderConfig.description;
        trackId = mp4box.addTrack(trackOptions);
      }
      const buf = new ArrayBuffer(chunk.byteLength);
      chunk.copyTo(buf);
      mp4box.addSample(trackId, buf, {
        dts: chunk.timestamp,
        cts: chunk.timestamp,
        duration: chunk.duration,
        is_sync: chunk.type === "key",
        data: buf,
      });
      outputCount++;
      if (outputCount === totalFrames) {
        mp4box.save("3d-motion.mp4");
        resolveDone?.();
      }

      progressCallback(clamp(outputCount / totalFrames, 0, 1));
    },
  });
  encoder.configure(videoConfig as VideoEncoderConfig);

  updateResolution(width, height);
  updateEnlarge(enlarge);
  updateFocus(focus);
  updateDilation(edgeDilation);

  let nextTime = 0;
  while (encoder.state === "configured") {
    if (encoder.encodeQueueSize > 10) {
      await sleep(10);
      continue;
    }

    const time = await new Promise<number>((resolve, reject) => {
      if (nextTime > exportDuration) {
        resolve(-1);
        return;
      }

      const currentTime = nextTime;
      try {
        tick(exportCanvas, {
          canvasSize: { width, height },
          timestamp: currentTime,
          motionType,
          animationDuration,
          startPoint,
          middlePoint,
          endPoint,
          isCircular,
          isLoop,
          isReverse,
          amplitudePoint,
          phasePoint,
          amountOfMotion,
        });
      } catch (e) {
        reject(e);
      }
      nextTime = currentTime + 1 / fps;
      resolve(currentTime);
    });

    if (time === -1) {
      encoder.flush();
      break;
    }

    const videoFrame = new VideoFrame(exportCanvas, {
      timestamp: time * 1e6,
      duration: (1 / fps) * 1e6,
    });
    encoder.encode(videoFrame, { keyFrame: encodeCount % GOP === 0 });
    videoFrame.close();
    encodeCount++;
  }

  await donePromise;
  if (encoder.state !== "closed") {
    encoder.close();
  }
}

export { bindCanvas, updateAnimationRender, calcProgressOffset, exportVideo };
