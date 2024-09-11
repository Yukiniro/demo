export const vertexShaderSource = `#version 300 es
in vec4 a_position;
in vec2 a_texCoord;
out vec2 v_texCoord;
void main() {
  gl_Position = a_position;
  v_texCoord = a_texCoord;
}`;

export const fragmentShaderSource = `#version 300 es
precision highp float;
uniform vec2 u_resolution;
in vec2 v_texCoord;
uniform vec2 u_mouse;
uniform sampler2D image0;
uniform sampler2D image1;
out vec4 outColor;

vec2 mirrored(vec2 v) {
  vec2 m = mod(v,2.);
  return mix(m,2.0 - m, step(1.0 ,m));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv.y = 1. - uv.y;

  float focus = 0.5;
  float scaleX = 50.0;
  float scaleY = 30.0;
  float x_offset = u_mouse.x / u_resolution.x * scaleX;
  float y_offset = u_mouse.y / u_resolution.y * scaleY;

  float depth = texture(image1, mirrored(uv)).r;

  vec2 fakeUV = uv - (depth - focus) * vec2(x_offset, y_offset);

  outColor = texture(image0, mirrored(fakeUV));
}`;
