/**
 * 参考 https://app.immersity.ai/ 的 shader
 */

export const vertexShaderSource = `
precision highp float;
#define SHADER_NAME pixi-shader-4
attribute vec2 aVertexPosition;

uniform mat3 projectionMatrix;
uniform mat3 filterMatrix;

varying vec2 vTextureCoord;
varying vec2 vFilterCoord;

uniform vec4 inputSize;
uniform vec4 outputFrame;

vec4 filterVertexPosition(void ) {
  vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.0)) + outputFrame.xy;

  return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}

vec2 filterTextureCoord(void ) {
  return aVertexPosition * (outputFrame.zw * inputSize.zw);
}

void main(void ) {
  gl_Position = filterVertexPosition();
  vTextureCoord = filterTextureCoord();
  vFilterCoord = (filterMatrix * vec3(vTextureCoord, 1.0)).xy;
}
`;

export const fragmentShaderSource = `
precision mediump float;
#define SHADER_NAME pixi-shader-4
precision highp float;

varying vec2 vFilterCoord;
varying vec2 vTextureCoord;
varying vec4 vColor;
uniform float widthPx;
uniform float heightPx;
uniform float dilation;
uniform sampler2D uSampler;
const int MAX_RADIUS = 10;

float dilate(vec2 uv, vec2 px) {
  float maxValue = 0.0;
  float minValue = 1.0;
  for (int x = -MAX_RADIUS; x <= +MAX_RADIUS; x++) {
    for (int y = -MAX_RADIUS; y <= +MAX_RADIUS; y++) {
      vec2 offset = vec2(float(x), float(y));
      if (length(offset) > float(MAX_RADIUS)) continue;
      offset *= px;
      vec2 uv2 = uv + offset;
      float val = texture2D(uSampler, uv2).x;
      maxValue = max(val, maxValue);
      minValue = min(val, minValue);
    }
  }
  return dilation < 0.0
    ? minValue
    : maxValue;
}

void main(void ) {
  const float dilationScale = 1.26; 
  float dilationStep = abs(dilationScale * dilation) / float(MAX_RADIUS);
  float aspect = widthPx / heightPx;
  vec2 px =
    widthPx > heightPx
      ? vec2(dilationStep / aspect, dilationStep)
      : vec2(dilationStep, dilationStep * aspect);
  gl_FragColor = vec4(vec3(dilate(vTextureCoord, px)), 1.0);
}
`;
