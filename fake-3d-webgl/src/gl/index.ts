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

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv.y = 1. - uv.y;

  float focus = 0.5;
  float scaleX = 25.0;
  float scaleY = 15.0;
  float depth = texture(image1, uv).r;
  float x_offset = u_mouse.x / u_resolution.x * scaleX;
  float y_offset = u_mouse.y / u_resolution.y * scaleY;
  vec2 fake3d = uv + (depth - focus) * vec2(x_offset, y_offset);

  outColor = texture(image0, fake3d);
}`;

// export const fragmentShaderSource = `#version 300 es
// precision highp float;
// uniform vec2 u_resolution;
// in vec2 v_texCoord;
// uniform sampler2D u_texture;
// uniform vec2 u_mouse;
// uniform vec2 u_threshold;
// uniform sampler2D image0;
// uniform sampler2D image1;
// out vec4 outColor;

// float getSmoothedDepth(sampler2D depthMap, vec2 uv, float radius) {
//   vec2 texelSize = 1.0 / vec2(textureSize(depthMap, 0));
//   float result = 0.0;
//   float weightSum = 0.0;

//   for(float x = -radius; x <= radius; x += 1.0) {
//     for(float y = -radius; y <= radius; y += 1.0) {
//       vec2 offset = vec2(x, y) * texelSize;
//       float weight = 1.0 - length(vec2(x, y)) / (radius * 1.4142);
//       weight = max(0.0, weight);
//       result += texture(depthMap, uv + offset).r * weight;
//       weightSum += weight;
//     }
//   }

//   return result / weightSum;
// }

// void main() {
//   vec2 uv = gl_FragCoord.xy / u_resolution.xy;
//   uv.y = 1. - uv.y;

//   float focus = 0.5;
//   float scaleX = 25.0;
//   float scaleY = 15.0;
//   float depth = getSmoothedDepth(image1, uv, 25.0);
//   float x_offset = u_mouse.x / u_resolution.x * scaleX;
//   float y_offset = u_mouse.y / u_resolution.y * scaleY;
//   vec2 fake3d = uv + (depth - focus) * vec2(x_offset, y_offset);

//   outColor = texture(image0, fake3d);
// }`;
