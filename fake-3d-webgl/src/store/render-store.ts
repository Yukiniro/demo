import { fragmentShaderSource, vertexShaderSource, edgeDilationFragmentShaderSource } from "../gl";
import { createShader, createTexture } from "../utils";

let originalImage: TexImageSource | null = null;
let originalImageMap: TexImageSource | null = null;
let offset: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
let focus: number = 0;
let enlarge: number = 0;
let dilation: number = 0;
let resolution: { width: number; height: number } = { width: 0, height: 0 };

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

let filterCanvas: OffscreenCanvas | null = null;
let filterGL: WebGL2RenderingContext | null = null;
let filterProgram: WebGLProgram | null = null;
let filterTexture: WebGLTexture | null = null;
let filterAttached = false;

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

  resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  offsetUniformLocation = gl.getUniformLocation(program, "u_offset");
  focusUniformLocation = gl.getUniformLocation(program, "u_focus");
  enlargeUniformLocation = gl.getUniformLocation(program, "u_enlarge");

  imageUniformLocation = gl.getUniformLocation(program, "u_image");
  imageMapUniformLocation = gl.getUniformLocation(program, "u_imageMap");

  gl.uniform1i(imageUniformLocation, 0);
  gl.uniform1i(imageMapUniformLocation, 1);
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

function updateTexture(image: TexImageSource, imageMap: TexImageSource) {
  originalImage = image;
  originalImageMap = imageMap;

  if (!gl || !program) {
    return;
  }

  originalTexture = originalTexture || createTexture(gl);
  depthMapTexture = depthMapTexture || createTexture(gl);

  updateOriginalTexture(originalImage);
  updateDepthMapTexture(originalImageMap);
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

function updateDepthMapTexture(imageMap: TexImageSource) {
  if (!gl) {
    return;
  }

  filterCanvas = filterCanvas || new OffscreenCanvas(1, 1);
  filterGL = filterGL || filterCanvas.getContext("webgl2");
  if (!filterGL) {
    throw new Error("WebGL2 not supported");
  }

  filterProgram = filterProgram || filterGL.createProgram();
  if (!filterProgram) {
    throw new Error("Failed to create program");
  }

  if (!filterAttached) {
    const filterVertexShader = createShader(filterGL, filterGL.VERTEX_SHADER, vertexShaderSource);
    const filterFragmentShader = createShader(filterGL, filterGL.FRAGMENT_SHADER, edgeDilationFragmentShaderSource);
    if (!filterVertexShader || !filterFragmentShader) {
      throw new Error("updateDepthMapTexture: Failed to create shader");
    }

    filterGL.attachShader(filterProgram, filterVertexShader);
    filterGL.attachShader(filterProgram, filterFragmentShader);
    filterGL.linkProgram(filterProgram);
    if (!filterGL.getProgramParameter(filterProgram, filterGL.LINK_STATUS)) {
      throw new Error("Failed to link program");
    }

    filterGL.useProgram(filterProgram);
    updateVerticalShader(filterGL, filterProgram);
    filterAttached = true;
  }

  filterTexture = filterTexture || createTexture(filterGL);
  filterGL.activeTexture(filterGL.TEXTURE0);
  filterGL.bindTexture(filterGL.TEXTURE_2D, filterTexture);
  filterGL.texImage2D(filterGL.TEXTURE_2D, 0, filterGL.RGBA, filterGL.RGBA, filterGL.UNSIGNED_BYTE, imageMap);

  filterGL.uniform1i(filterGL.getUniformLocation(filterProgram, "u_image"), 0);
  filterGL.uniform1f(filterGL.getUniformLocation(filterProgram, "u_dilation"), dilation);
  filterGL.uniform1f(filterGL.getUniformLocation(filterProgram, "u_width"), resolution.width);
  filterGL.uniform1f(filterGL.getUniformLocation(filterProgram, "u_height"), resolution.height);

  filterCanvas.width = resolution.width;
  filterCanvas.height = resolution.height;
  filterGL.viewport(0, 0, resolution.width, resolution.height);

  filterGL.drawArrays(filterGL.TRIANGLES, 0, 6);

  depthMapTexture = depthMapTexture || createTexture(gl);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, depthMapTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, filterCanvas);
}

function updateOffset(value: { x: number; y: number; z: number }) {
  offset = value;

  if (!gl || !offsetUniformLocation) {
    return;
  }

  gl.uniform3f(offsetUniformLocation, offset.x, offset.y, offset.z);
}

function updateFocus(value: number) {
  if (!gl) {
    throw new Error("WebGL2 has not been initialized");
  }

  if (!focusUniformLocation) {
    throw new Error("Focus uniform location has not been initialized");
  }

  focus = value;
  gl.uniform1f(focusUniformLocation, focus);
}

function updateEnlarge(value: number) {
  enlarge = value;

  if (!gl || !enlargeUniformLocation) {
    return;
  }

  gl.uniform1f(enlargeUniformLocation, enlarge);
}

function updateResolution(width: number, height: number) {
  resolution = { width, height };

  if (!canvas || !gl || !resolutionUniformLocation) {
    return;
  }

  canvas.width = width;
  canvas.height = height;
  gl.uniform2f(resolutionUniformLocation, width, height);
  gl.viewport(0, 0, width, height);
}

function updateDilation(value: number) {
  dilation = value;

  if (!originalImageMap) {
    return;
  }

  updateDepthMapTexture(originalImageMap);
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

export {
  initRenderStore,
  updateTexture,
  render,
  updateOffset,
  updateFocus,
  updateEnlarge,
  updateResolution,
  updateDilation,
};
