import vertexShaderSource from "../gl/vert/vertext-shader-source.glsl?raw";
import fragmentShaderSource from "../gl/frag/basic.glsl?raw";
import { createShader, createTexture } from "../utils";

let originalImage: TexImageSource | null = null;
let borderSize: number = 0;

let canvas: OffscreenCanvas | null = null;
let gl: WebGL2RenderingContext | null = null;
let program: WebGLProgram | null = null;
let imageUniformLocation: WebGLUniformLocation | null = null;
let resolutionUniformLocation: WebGLUniformLocation | null = null;
let borderSizeUniformLocation: WebGLUniformLocation | null = null;
let originalTexture: WebGLTexture | null = null;

export interface Point {
  x: number;
  y: number;
  z: number;
}

function initRenderStore() {
  canvas = canvas || new OffscreenCanvas(1, 1);
  gl = canvas.getContext("webgl2");
  if (!gl) {
    throw new Error("WebGL2 not supported");
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!vertexShader || !fragmentShader) {
    throw new Error("initRenderStore: Failed to create shader");
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
  updateVerticalShader(gl, program);

  borderSizeUniformLocation = gl.getUniformLocation(program, "u_size");
  resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  imageUniformLocation = gl.getUniformLocation(program, "u_image");

  gl.uniform1i(imageUniformLocation, 0);
}

function updateVerticalShader(gl: WebGL2RenderingContext, program: WebGLProgram) {
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
}

function updateTexture(image: TexImageSource) {
  originalImage = image;

  if (!gl || !program) {
    return;
  }

  originalTexture = originalTexture || createTexture(gl);

  updateOriginalTexture(originalImage);
}

function updateOriginalTexture(image: TexImageSource) {
  if (!gl) {
    return;
  }

  originalTexture = originalTexture || createTexture(gl);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, originalTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
}

function updateBorderSize(size: number) {
  borderSize = size;

  if (!gl) {
    return;
  }

  gl.uniform1f(borderSizeUniformLocation, borderSize);
}

function updateResolution(width: number, height: number) {
  if (!canvas || !gl || !resolutionUniformLocation) {
    return;
  }

  canvas.width = width;
  canvas.height = height;
  gl.uniform2f(resolutionUniformLocation, width, height);
  gl.viewport(0, 0, width, height);
}

function render(targetCanvas: HTMLCanvasElement) {
  if (!gl) {
    return;
  }

  if (!targetCanvas?.width || !targetCanvas?.height) {
    return;
  }

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl!.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  const context = targetCanvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas context not supported");
  }
  context.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  context.drawImage(canvas!, 0, 0, canvas!.width, canvas!.height);
}

export { initRenderStore, updateTexture, render, updateBorderSize, updateResolution };
