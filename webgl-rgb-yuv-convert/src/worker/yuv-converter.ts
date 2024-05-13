// function rgb2yuv(rgba: Uint8Array): Uint8Array {
//   const length = (rgba.length / 4) * 1.5;
//   const yuv = new Uint8Array(length);
//   for (let i = 0; i < rgba.length; i += 8) {
//     const r1 = rgba[i];
//     const g1 = rgba[i + 1];
//     const b1 = rgba[i + 2];
//     const r2 = rgba[i + 4];
//     const g2 = rgba[i + 5];
//     const b2 = rgba[i + 6];
//     const y1 = 0.299 * r1 + 0.587 * g1 + 0.114 * b1;
//     const y2 = 0.299 * r2 + 0.587 * g2 + 0.114 * b2;
//     const u = (-0.147 * (r1 + r2)) / 2 - (0.289 * (g1 + g2)) / 2 + (0.436 * (b1 + b2)) / 2;
//     const v = (0.615 * (r1 + r2)) / 2 - (0.515 * (g1 + g2)) / 2 - (0.1 * (b1 + b2)) / 2;
//     yuv[(i / 4) * 3] = y1;
//     yuv[(i / 4) * 3 + 1] = y2;
//     yuv[(i / 4) * 3 + 2] = u + 128;
//     yuv[(i / 4) * 3 + 3] = v + 128;
//   }
//   return yuv as Uint8Array;
// }

function linearToSrgb(value: number): number {
  if (value <= 0.0031308) {
    return 12.92 * value;
  } else {
    return 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
  }
}

function rgb2yuv(rgba: Uint8Array, width: number, height: number): Uint8Array {
  const yuv = new Uint8Array(width * height * 3);
  for (let i = 0; i < width * height; i++) {
    const r = linearToSrgb(rgba[i * 4] / 255);
    const g = linearToSrgb(rgba[i * 4 + 1] / 255);
    const b = linearToSrgb(rgba[i * 4 + 2] / 255);
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const u = -0.14713 * r - 0.28886 * g + 0.436 * b;
    const v = 0.615 * r - 0.51498 * g - 0.10001 * b;
    yuv[i * 3] = Math.round(Math.max(0, Math.min(255, y * 255)));
    yuv[i * 3 + 1] = Math.round(Math.max(0, Math.min(255, (u + 0.5) * 255)));
    yuv[i * 3 + 2] = Math.round(Math.max(0, Math.min(255, (v + 0.5) * 255)));
  }
  return yuv;
}

function createShader(gl: WebGL2RenderingContext, type: GLenum, source: string) {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error("Create shader fail!");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.error(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

const imageBitmapToYuv2 = (() => {
  const canvas = new OffscreenCanvas(1, 1);
  const gl = canvas.getContext("webgl2");

  if (!gl) {
    throw new Error("webgl2 not supported");
  }

  const vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;
in vec2 a_texCoord;
uniform vec2 u_resolution;

out vec2 v_texCoord;

// all shaders have a main function
void main() {

  vec2 zeroToOne = a_position / u_resolution;
  vec2 zeroToTwo = zeroToOne * 2.0;
  vec2 clipSpace = zeroToTwo - 1.0;
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

  v_texCoord = a_texCoord;
  v_texCoord.y = 1.0 - v_texCoord.y; // 翻转 y 分量
}
`;

  const fragmentShaderSource = `#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"

precision highp float;
uniform sampler2D u_image;
in vec2 v_texCoord;

out vec4 outColor;

void main() {
  outColor = texture(u_image, v_texCoord);
}
`;

  // 创建顶点着色器
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  if (!vertexShader) {
    throw new Error("Create vertex shader fail!");
  }

  // 创建片段着色器
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!fragmentShader) {
    throw new Error("Create fragment shader fail!");
  }

  // 创建程序
  const program = gl.createProgram();
  if (!program) {
    throw new Error("Create program fail!");
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Create program fail!");
  }
  gl.useProgram(program);

  const positionLocation = gl.getAttribLocation(program, "a_position");
  const texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord");

  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  const imageLocation = gl.getUniformLocation(program, "u_image");

  const positionBuffer = gl.createBuffer();
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]),
    gl.STATIC_DRAW,
  );
  gl.enableVertexAttribArray(texCoordAttributeLocation);
  gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  function setRectangle(gl: WebGL2RenderingContext, x: number, y: number, width: number, height: number) {
    const x1 = x;
    const x2 = x + width;
    const y1 = y;
    const y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]), gl.STATIC_DRAW);
  }

  return (image: ImageBitmap): Uint8Array => {
    const { width, height } = image;

    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.uniform2f(resolutionLocation, width, height);
    gl.uniform1i(imageLocation, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    setRectangle(gl, 0, 0, width, height);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // 创建一个 ArrayBuffer 来存储像素数据
    const pixels = new Uint8Array(width * height * 4);

    // 使用 readPixels 方法读取像素数据
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    const yuv = rgb2yuv(pixels as Uint8Array, width, height);

    return yuv;
  };
})();

function postError(error: Error): void {
  const msg1 = error?.message || "webcodec worker post error";
  postMessage({ type: "error", message: `${msg1}` });
}

onmessage = (event: MessageEvent) => {
  try {
    const { type, data, id } = event.data;
    switch (type) {
      case "rgb2yuv": {
        const yuv = imageBitmapToYuv2(data.data);
        postMessage({ type, id, data: yuv }, [yuv.buffer]);
        break;
      }
      default:
    }
  } catch (e: Error | unknown) {
    postError(e as Error);
  }
};
