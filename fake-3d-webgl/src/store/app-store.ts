import anime from "animejs";
import { Point, updateOffset, render } from "./render-store";

let canvas: HTMLCanvasElement | null = null;
let animation: anime.AnimeInstance | null = null;
let targets: object | null = null;

function bindCanvas(renderCanvas: HTMLCanvasElement) {
  if (renderCanvas === canvas) {
    return;
  }
  canvas = renderCanvas;
}

function updateAnimationRender(startPoint: Point, endPoint: Point, animationDuration: number) {
  targets && anime.remove(targets);
  targets = {
    pointX: 0,
    pointY: 0,
    pointZ: 0,
  };
  animation = anime({
    targets,
    pointX: [startPoint.x, endPoint.x],
    pointY: [startPoint.y, endPoint.y],
    pointZ: [startPoint.z, endPoint.z],
    duration: animationDuration,
    easing: "linear",
    loop: true,
    direction: "alternate",
    update: function () {
      const { pointX, pointY, pointZ } = targets as { pointX: number; pointY: number; pointZ: number };
      updateOffset({ x: pointX, y: pointY, z: pointZ });
      render(canvas as HTMLCanvasElement);
    },
  });
  animation.play();
}

export { bindCanvas, updateAnimationRender };
