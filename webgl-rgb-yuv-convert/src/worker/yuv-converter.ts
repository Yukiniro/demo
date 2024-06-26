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

function createTexture(gl: WebGL2RenderingContext): WebGLTexture {
  const texture = gl.createTexture();
  if (!texture) {
    throw new Error("Create texture fail!");
  }
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  gl.bindTexture(gl.TEXTURE_2D, null);

  return texture;
}

const imageBitmapToYuv2 = (() => {
  const canvas = new OffscreenCanvas(1, 1);
  const gl = canvas.getContext("webgl2");

  if (!gl) {
    throw new Error("webgl2 not supported");
  }

  const vertexShaderSource = `#version 300 es
  in vec2 vertexPos;
  in vec2 vertexUV;

  uniform vec2 u_resolution;

  out vec2 texCoords;
  void main() {
      vec2 zeroToOne = vertexPos / u_resolution;
      vec2 zeroToTwo = zeroToOne * 2.0;
      vec2 clipSpace = zeroToTwo - 1.0;

      gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
      texCoords = vertexUV;
  }
`;

  const fragmentShaderSource = `#version 300 es
  precision mediump float;
  
  uniform sampler2D colorSampler;
  uniform int bufferChannel; // 0=Y, 1=U, 2=V
  in vec2 texCoords;
  out float outColor;
  
  vec3 unmultAlpha(vec4 color) {
      if (color.a == 0.) return vec3(0.);
      return color.rgb / color.a;
  }
  
  void main() {
      vec2 flippedCoords = vec2(texCoords.x, 1. - texCoords.y);
      vec3 rgb = unmultAlpha(texture(colorSampler, flippedCoords));
  
      float y = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
      if (bufferChannel == 0) {
          outColor = (219.0 * y + 16.0) / 255.0;
      } else if (bufferChannel == 1) {
          float u = (rgb.b - y) / 1.8556;
          outColor = (224.0 * u + 128.0) / 255.0;
      } else if (bufferChannel == 2) {
          float v = (rgb.r - y) / 1.5748;
          outColor = (224.0 * v + 128.0) / 255.0;
      }
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

  const positionLocation = gl.getAttribLocation(program, "vertexPos");
  const texCoordAttributeLocation = gl.getAttribLocation(program, "vertexUV");

  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  const imageLocation = gl.getUniformLocation(program, "colorSampler");
  const bufferChannel = gl.getUniformLocation(program, "bufferChannel");

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

  const texture = createTexture(gl);

  function setRectangle(gl: WebGL2RenderingContext, x: number, y: number, width: number, height: number) {
    const x1 = x;
    const x2 = x + width;
    const y1 = y;
    const y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]), gl.STATIC_DRAW);
  }

  const textureTemp = createTexture(gl);
  const frameBufferTemp = gl.createFramebuffer();
  if (!frameBufferTemp) {
    throw new Error("Create framebuffer fail!");
  }

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textureTemp);
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferTemp);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureTemp, 0);

  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  const pboBuffer = gl.createBuffer();
  if (!pboBuffer) {
    throw new Error("Create PBO buffer fail!");
  }

  return (image: ImageBitmap): Uint8Array => {
    const { width, height } = image;

    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);

    const i = width / 2;
    const n = height / 2;
    const o = width * height;
    const s = i * n;
    const a = o + s;
    const c = a + s;

    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pboBuffer);
    gl.bufferData(WebGL2RenderingContext.PIXEL_PACK_BUFFER, c, WebGL2RenderingContext.STREAM_READ);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform2f(resolutionLocation, width, height);
    gl.uniform1i(imageLocation, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    setRectangle(gl, 0, 0, width, height);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const fn = (bufferChannelIndex: number, width: number, height: number, offset: number) => {
      gl.viewport(0, 0, width, height);

      // 更新 textureTemp 的尺寸、格式
      gl.bindTexture(gl.TEXTURE_2D, textureTemp);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, width, height, 0, gl.RED, gl.UNSIGNED_BYTE, null);

      // 绑定 texture 进行渲染
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferTemp);

      gl.uniform1i(bufferChannel, bufferChannelIndex);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pboBuffer);
      gl.readPixels(0, 0, width, height, gl.RED, gl.UNSIGNED_BYTE, offset);
      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
    };

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.bindTexture(gl.TEXTURE_2D, null);

    fn(0, width, height, 0);
    fn(1, i, n, o);
    fn(2, i, n, a);

    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pboBuffer);

    const yuv = new Uint8Array(c);
    // const yuv = FJTypedArrayPool.get("Uint8Array", c);

    gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, yuv);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);

    image.close();

    return yuv as Uint8Array;
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
