export const vertexShaderSource = `#version 300 es
in vec4 a_position;
in vec2 a_texCoord;
out vec2 v_texCoord;
void main() {
  gl_Position = a_position;
  v_texCoord = a_texCoord;
}`;

export const fragmentShaderSource = `#version 300 es
precision mediump float;
uniform vec2 u_resolution;
in vec2 v_texCoord;
uniform sampler2D u_texture;
uniform vec2 u_mouse;
uniform vec2 u_threshold;
uniform sampler2D image0;
uniform sampler2D image1;
out vec4 outColor;
  
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv.y = 1. - uv.y;
  vec4 tex1 = texture(image1, uv);
  vec2 fake3d = vec2(uv.x + (tex1.r - 0.5) * u_mouse.x / u_threshold.x, uv.y + (tex1.r - 0.5) * u_mouse.y / u_threshold.y);
  outColor = texture(image0, fake3d);
}`;
