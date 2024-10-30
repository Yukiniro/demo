import { fitSize } from "../utils";
import { render, updateResolution, updateTexture } from "./render-store";

let canvas: HTMLCanvasElement | null = null;
let viewSize: { width: number; height: number } = { width: 0, height: 0 };
let image: HTMLImageElement | null = null;
let borderSize: number = 0;

function bindCanvas(renderCanvas: HTMLCanvasElement) {
  if (renderCanvas === canvas) {
    return;
  }
  canvas = renderCanvas;
}

function updateViewSize(width: number, height: number): void {
  viewSize = { width, height };
}

function updateImage(i: HTMLImageElement): void {
  image = i;
}

function updateBorderSize(size: number): void {
  borderSize = size;
}

function renderView(): void {
  if (!canvas || !image) return;
  const imageSize = { width: image.width, height: image.height };
  const canvasSize = fitSize(imageSize, viewSize);
  canvas.width = canvasSize.width;
  canvas.height = canvasSize.height;
  updateTexture(image);
  updateResolution(canvasSize.width, canvasSize.height);
  render(canvas);
  console.log(borderSize);
}

export { bindCanvas, renderView, updateViewSize, updateImage, updateBorderSize };
