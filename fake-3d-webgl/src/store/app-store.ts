let canvas: HTMLCanvasElement | null = null;

function bindCanvas(renderCanvas: HTMLCanvasElement) {
  if (renderCanvas === canvas) {
    return;
  }
  canvas = renderCanvas;
}

function updateAnimationRender() {
  // TODO 根据参数实现动画
  console.log(!!canvas);
}

export { bindCanvas, updateAnimationRender };
