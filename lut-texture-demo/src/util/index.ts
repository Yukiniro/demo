export function createShader(gl: WebGL2RenderingContext, type: GLenum, source: string) {
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

export function createTexture(gl: WebGL2RenderingContext): WebGLTexture {
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

const canvas = new OffscreenCanvas(1, 1);
const gl = canvas.getContext("webgl2");

if (!gl) {
  throw new Error("webgl2 not supported");
}

const VERTEX_SHADER_TEXT = `
attribute vec4 a_position;
attribute vec2 a_texCoord;

varying vec2 v_texCoord;

void main() {
  gl_Position = a_position;
  v_texCoord = vec2(a_texCoord.x, 1.0 - a_texCoord.y);
}
`;

const FRAGMENT_SHADER_TEXT = `
precision mediump float;

varying vec2 v_texCoord;
uniform sampler2D u_image0;
uniform sampler2D u_image1;

void main() {
  vec4 textureColor = texture2D(u_image0, v_texCoord);
  float blueColor = textureColor.b * 63.0;
  vec2 quad1;
  quad1.y = floor(floor(blueColor) / 8.0);
  quad1.x = floor(blueColor) - (quad1.y * 8.0);
  vec2 quad2;
  quad2.y = floor(ceil(blueColor) / 8.0);
  quad2.x = ceil(blueColor) - (quad2.y * 8.0);
  vec2 texPos1;
  texPos1.x = (quad1.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.r);
  texPos1.y = (quad1.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.g);
  vec2 texPos2;
  texPos2.x = (quad2.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.r);
  texPos2.y = (quad2.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.g);
  lowp vec4 newColor1 = texture2D(u_image1, texPos1);
  lowp vec4 newColor2 = texture2D(u_image1, texPos2);
  lowp vec4 newColor = mix(newColor1, newColor2, fract(blueColor));
  gl_FragColor = mix(textureColor, vec4(newColor.rgb, textureColor.w), 1.0);
}
`;

// 创建顶点着色器
const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_TEXT);
if (!vertexShader) {
  throw new Error("Create vertex shader fail!");
}

// 创建片段着色器
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_TEXT);
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

const texture = createTexture(gl);
const lutTexture = createTexture(gl);

export function renderWithLutTexture(
  image: TexImageSource,
  lut: TexImageSource,
  size: { width: number; height: number },
) {
  if (!gl || !program) {
    throw new Error("webgl2 not supported");
  }

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.canvas.width = size.width;
  gl.canvas.height = size.height;
  gl.viewport(0, 0, size.width, size.height);

  gl.useProgram(program);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, lutTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, lut);

  // VERTEX
  const positionLocation = gl.getAttribLocation(program, "a_position");
  const texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0]),
    gl.STATIC_DRAW,
  );
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0]),
    gl.STATIC_DRAW,
  );
  gl.enableVertexAttribArray(texcoordLocation);
  gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

  // FRAGMENT
  const image0Location = gl.getUniformLocation(program, "u_image0");
  const image1Location = gl.getUniformLocation(program, "u_image1");

  gl.uniform1i(image0Location, 0);
  gl.uniform1i(image1Location, 1);

  // draw
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  return gl.canvas;
}
