// 顶点着色器
export const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0, 1);
    v_texCoord = a_texCoord;
  }
`;

// 片段着色器
export const fragmentShaderSource = `
  precision highp float;
  uniform sampler2D u_image;
  varying vec2 v_texCoord;
  void main() {
    vec2 flippedTexCoord = vec2(v_texCoord.x, 1.0 - v_texCoord.y);
    vec4 color = texture2D(u_image, flippedTexCoord);
    // 这里可以添加 HDR 到 SDR 的转换逻辑
    gl_FragColor = color;
  }
`;
