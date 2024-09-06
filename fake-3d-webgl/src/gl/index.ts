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

export const fragmentShaderSource0 = `#version 300 es
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

export const fragmentShaderSource3 = `#version 300 es
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

bool isDepthDiscontinuity(sampler2D depthMap, vec2 uv, float threshold) {
  float center = texture(depthMap, uv).r;
  float left = texture(depthMap, uv - vec2(1.0 / u_resolution.x, 0.0)).r;
  float right = texture(depthMap, uv + vec2(1.0 / u_resolution.x, 0.0)).r;
  float top = texture(depthMap, uv - vec2(0.0, 1.0 / u_resolution.y)).r;
  float bottom = texture(depthMap, uv + vec2(0.0, 1.0 / u_resolution.y)).r;
  
  return abs(center - left) > threshold ||
         abs(center - right) > threshold ||
         abs(center - top) > threshold ||
         abs(center - bottom) > threshold;
}

float getSmoothedDepth(sampler2D depthMap, vec2 uv, float radius) {
  vec2 texelSize = 1.0 / vec2(textureSize(depthMap, 0));
  float result = 0.0;
  float weightSum = 0.0;

  for(float x = -radius; x <= radius; x += 1.0) {
    for(float y = -radius; y <= radius; y += 1.0) {
      vec2 offset = vec2(x, y) * texelSize;
      float weight = 1.0 - length(vec2(x, y)) / (radius * 1.4142);
      weight = max(0.0, weight);
      result += texture(depthMap, uv + offset).r * weight;
      weightSum += weight;
    }
  }

  return result / weightSum;
}

vec4 boxBlur(sampler2D tex, vec2 uv, vec2 resolution, float radius) {
    vec4 color = vec4(0.0);
    float total = 0.0;
    for (float x = -radius; x <= radius; x += 1.0) {
        for (float y = -radius; y <= radius; y += 1.0) {
            vec2 offset = vec2(x, y) / resolution;
            color += texture(tex, uv + offset);
            total += 1.0;
        }
    }
    return color / total;
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

  float depthSampleDepth = texture(image1, mirrored(fakeUV)).r;

  if (depth < focus && depthSampleDepth > focus) {
    // outColor = texture(image0, mirrored(fakeUV));
    // outColor.rgb = vec3(1.0, 0.0, 0.0);

    outColor = boxBlur(image0, mirrored(uv), u_resolution, 10.0);
  } else {
    outColor = texture(image0, mirrored(fakeUV));
  }

}`;

export const fragmentShaderSource2 = `#version 300 es
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
  float x_offset = -u_mouse.x / u_resolution.x * scaleX;
  float y_offset = -u_mouse.y / u_resolution.y * scaleY;

  float depth = texture(image1, mirrored(uv)).r;

  vec2 planeUV = uv - vec2(x_offset, y_offset);
  float planeDepth = texture(image1, mirrored(planeUV)).r;

  vec2 effectUV = uv - (depth - focus) * vec2(x_offset, y_offset);
  float effectDepth = texture(image1, mirrored(effectUV)).r;

  float depthOffset = depth - focus;

  float mixDepth = depth;
  if (planeDepth > focus) {
    depthOffset = planeDepth - focus;
  } else {

    depthOffset = depth - focus;

    if (depth > focus) {
      outColor = vec4(0.0, effectDepth, 0.0, 1.0);
      return;
    } else {
     depthOffset = 0.2;
      // outColor = vec4(planeDepth - focus, 0.0, 0.0, 1.0);
      // return;
    }

    // outColor = vec4(1.0, 1.0, 0.0, 1.0);
    // return;
  }

  vec2 fakeUV = uv - depthOffset * vec2(x_offset, y_offset);

  outColor = texture(image0, mirrored(fakeUV));
}`;

export const fragmentShaderSource1 = `#version 300 es
precision highp float;
uniform vec2 u_resolution;
in vec2 v_texCoord;
uniform sampler2D u_texture;
uniform vec2 u_mouse;
uniform vec2 u_threshold;
uniform sampler2D image0;
uniform sampler2D image1;
out vec4 outColor;

float getSmoothedDepth(sampler2D depthMap, vec2 uv, float radius) {
  vec2 texelSize = 1.0 / vec2(textureSize(depthMap, 0));
  float result = 0.0;
  float weightSum = 0.0;

  for(float x = -radius; x <= radius; x += 1.0) {
    for(float y = -radius; y <= radius; y += 1.0) {
      vec2 offset = vec2(x, y) * texelSize;
      float weight = 1.0 - length(vec2(x, y)) / (radius * 1.4142);
      weight = max(0.0, weight);
      result += texture(depthMap, uv + offset).r * weight;
      weightSum += weight;
    }
  }

  return result / weightSum;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv.y = 1. - uv.y;

  float focus = 0.5;
  float scaleX = 25.0;
  float scaleY = 15.0;
  float depth = getSmoothedDepth(image1, uv, 25.0);
  float x_offset = u_mouse.x / u_resolution.x * scaleX;
  float y_offset = u_mouse.y / u_resolution.y * scaleY;
  vec2 fake3d = uv + (depth - focus) * vec2(x_offset, y_offset);

  outColor = texture(image0, fake3d);
}`;
