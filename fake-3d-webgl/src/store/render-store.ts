import { fragmentShaderSource, vertexShaderSource } from "../gl";
import { createShader, createTexture } from "../utils";

let canvas: OffscreenCanvas | null = null;
let gl: WebGL2RenderingContext | null = null;
let program: WebGLProgram | null = null;
let resolutionUniformLocation: WebGLUniformLocation | null = null;
let offsetUniformLocation: WebGLUniformLocation | null = null;
let focusUniformLocation: WebGLUniformLocation | null = null;
let enlargeUniformLocation: WebGLUniformLocation | null = null;
let imageUniformLocation: WebGLUniformLocation | null = null;
let imageMapUniformLocation: WebGLUniformLocation | null = null;
let originalTexture: WebGLTexture | null = null;
let depthMapTexture: WebGLTexture | null = null;

function initRenderStore() {
  canvas = canvas || new OffscreenCanvas(1, 1);
  gl = canvas.getContext("webgl2");
  if (!gl) {
    throw new Error("WebGL2 not supported");
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!vertexShader || !fragmentShader) {
    throw new Error("Failed to create shader");
  }

  program = program || gl.createProgram();
  if (!program) {
    throw new Error("Failed to create program");
  }

  const attachedShaders = gl.getAttachedShaders(program);
  if (!attachedShaders || attachedShaders.length === 0) {
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
  }

  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error("Failed to link program");
  }

  gl.useProgram(program);

  const positionBuffer = gl.createBuffer();
  if (!positionBuffer) {
    console.error("Create position buffer fail!");
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const texCoordBuffer = gl.createBuffer();
  if (!texCoordBuffer) {
    console.error("Create texCoord buffer fail!");
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);

  const texCoords = [0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

  const vao = gl.createVertexArray();
  if (!vao) {
    console.error("Create vao fail!");
    return;
  }
  gl.bindVertexArray(vao);

  const positionLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
  gl.enableVertexAttribArray(texCoordLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  offsetUniformLocation = gl.getUniformLocation(program, "u_offset");
  focusUniformLocation = gl.getUniformLocation(program, "u_focus");
  enlargeUniformLocation = gl.getUniformLocation(program, "u_enlarge");

  imageUniformLocation = gl.getUniformLocation(program, "u_image");
  imageMapUniformLocation = gl.getUniformLocation(program, "u_imageMap");

  gl.uniform1i(imageUniformLocation, 0);
  gl.uniform1i(imageMapUniformLocation, 1);
}

function updateTexture(image: TexImageSource, imageMap: TexImageSource) {
  if (!gl) {
    throw new Error("WebGL2 has not been initialized");
  }

  if (!program) {
    throw new Error("Program has not been initialized");
  }

  originalTexture = originalTexture || createTexture(gl);
  depthMapTexture = depthMapTexture || createTexture(gl);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, originalTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, depthMapTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageMap);
}

function updateOffset(offset: { x: number; y: number; z: number }) {
  if (!gl) {
    throw new Error("WebGL2 has not been initialized");
  }

  if (!offsetUniformLocation) {
    throw new Error("Offset uniform location has not been initialized");
  }

  gl.uniform3f(offsetUniformLocation, offset.x, offset.y, offset.z);
}

function updateFocus(focus: number) {
  if (!gl) {
    throw new Error("WebGL2 has not been initialized");
  }

  if (!focusUniformLocation) {
    throw new Error("Focus uniform location has not been initialized");
  }

  gl.uniform1f(focusUniformLocation, focus);
}

function updateEnlarge(enlarge: number) {
  if (!gl) {
    throw new Error("WebGL2 has not been initialized");
  }

  if (!enlargeUniformLocation) {
    throw new Error("Enlarge uniform location has not been initialized");
  }

  gl.uniform1f(enlargeUniformLocation, enlarge);
}

function updateResolution(width: number, height: number) {
  if (!canvas) {
    throw new Error("Canvas has not been initialized");
  }

  if (!gl) {
    throw new Error("WebGL2 has not been initialized");
  }

  if (!resolutionUniformLocation) {
    throw new Error("Resolution uniform location has not been initialized");
  }

  canvas.width = width;
  canvas.height = height;
  gl.uniform2f(resolutionUniformLocation, width, height);
  gl.viewport(0, 0, width, height);
}

function couldRender() {
  return !!gl && !!originalTexture && !!depthMapTexture && !!program && !!canvas;
}

function render(targetCanvas: HTMLCanvasElement) {
  if (!couldRender()) {
    return;
  }

  if (!targetCanvas?.width || !targetCanvas?.height) {
    return;
  }

  gl!.clearColor(0, 0, 0, 0);
  gl!.clear(gl!.COLOR_BUFFER_BIT);

  gl!.drawArrays(gl!.TRIANGLES, 0, 6);

  const context = targetCanvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas context not supported");
  }
  context.drawImage(canvas!, 0, 0, canvas!.width, canvas!.height);
}

export {
  initRenderStore,
  updateTexture,
  render,
  couldRender,
  updateOffset,
  updateFocus,
  updateEnlarge,
  updateResolution,
};
