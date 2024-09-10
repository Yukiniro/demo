/**
 * 参考 https://app.immersity.ai/ 的 shader
 */

export const vertexShaderSource = `
precision highp float;
#define SHADER_NAME pixi-shader-3
attribute vec2 aVertexPosition;

uniform mat3 projectionMatrix;
uniform mat3 filterMatrix;

varying vec2 vTextureCoord;
varying vec2 vFilterCoord;
uniform bool isStereoscopic;
uniform bool isAnaglyph;
uniform bool isPickingDepth;
uniform bool isSbsHalfWidth;
uniform vec4 inputSize;
uniform vec4 outputFrame;

vec4 filterVertexPosition(void ) {
  vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.0)) + outputFrame.xy;
  if (!isPickingDepth && isStereoscopic && !isAnaglyph && !isSbsHalfWidth) {
    position =
      aVertexPosition * max(vec2(outputFrame.z * 2.0, outputFrame.w), vec2(0.0)) +
      outputFrame.xy;
  }

  return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}

vec2 filterTextureCoord(void ) {
  return aVertexPosition * (outputFrame.zw * inputSize.zw);
}

void main(void ) {
  gl_Position = filterVertexPosition();
  vTextureCoord = filterTextureCoord();
  
  vTextureCoord = aVertexPosition;
  vFilterCoord = (filterMatrix * vec3(vTextureCoord, 1.0)).xy;
}
`;

export const fragmentShaderSource = `
precision mediump float;
#define SHADER_NAME pixi-shader-3
precision highp float;

varying vec2 vFilterCoord;
varying vec2 vTextureCoord;
uniform sampler2D mapSampler;

uniform sampler2D imageSampler;
uniform sampler2D watermark;
uniform vec4 inputSize;
uniform float scale;
uniform vec3 offset;
uniform float focus;
uniform float enlarge;
uniform float aspect;
uniform bool watermarkEnabled;
uniform bool isPickingDepth;
uniform bool isStereoscopic;
uniform bool isAnaglyph;
uniform bool isSbs;
uniform bool isSbsHalfWidth;
uniform bool isCrossEyed;
uniform bool isLif;
uniform float stereoGain;

vec3 perspective(
  vec2 uv,
  vec3 cameraShift,
  float convergence 
) {
  vec3 ray_origin = vec3(uv - 0.5, 0) * (1.0 - convergence * cameraShift.z); 
  vec3 ray_direction = vec3(0, 0, 1); 

  
  ray_origin.xy -= cameraShift.xy * convergence;
  ray_direction.xy += (uv - 0.5) * cameraShift.z + cameraShift.xy;

  const int step_count = 45; 
  const float hit_threshold = 0.01;
  ray_direction /= float(step_count);

  
  
  vec3 color = vec3(0.0);

  for (int i = 0; i < step_count; i++) {
    ray_origin += ray_direction;
    float scene_z = 1.0 - texture2D(mapSampler, ray_origin.xy + 0.5).x;
    if (ray_origin.z > scene_z) {
      if (ray_origin.z - scene_z < hit_threshold) {
        break;
      }
      ray_origin -= ray_direction; 
      ray_direction /= 2.0; 
    }
  }

  color = texture2D(imageSampler, ray_origin.xy + 0.5).rgb;
  #ifdef DEBUG_CROP
  if (
    ray_origin.x < -0.5 ||
    ray_origin.y < -0.5 ||
    ray_origin.x >= +0.5 ||
    ray_origin.y >= +0.5
  ) {
    color.r = 1.0;
  }
  #endif
  return color;
}

void main(void ) {
  vec2 uv =
    (vTextureCoord - vec2(0.5)) /
      vec2(!isPickingDepth && isStereoscopic ? 1.0 : enlarge) +
    vec2(0.5);
  vec2 uvSbs = vTextureCoord;
  if (!isPickingDepth && isStereoscopic) {
    if (isAnaglyph) {
      vec4 left = vec4(perspective(uv, vec3(stereoGain, 0.0, 0.0), focus), 1.0);
      vec4 right = vec4(perspective(uv, vec3(-stereoGain, 0.0, 0.0), focus), 1.0);
      const vec4 left_glass = vec4(1, 0, 0, 1);
      const vec4 right_glass = vec4(0, 1, 1, 1);
      gl_FragColor = left * left_glass + right * right_glass;
    } else if (isSbs || isCrossEyed || isSbsHalfWidth) {
      
      if (uvSbs.y < 0.0 || uvSbs.y >= 1.0) {
        gl_FragColor = vec4(0);
        return;
      }

      if (uvSbs.x < 0.5) {
        uvSbs.x *= 2.0;
        vec4 left = vec4(
          perspective(
            uvSbs,
            vec3(stereoGain * (isCrossEyed ? -1.0 : 1.0), 0.0, 0.0),
            focus
          ),
          1.0
        );
        gl_FragColor = left;
      } else {
        uvSbs.x -= 0.5;
        uvSbs.x *= 2.0;
        vec4 right = vec4(
          perspective(
            uvSbs,
            vec3(stereoGain * (isCrossEyed ? 1.0 : -1.0), 0.0, 0.0),
            focus
          ),
          1.0
        );
        gl_FragColor = right;
      }
    } else if (isLif) {
      if (uvSbs.y < 0.0 || uvSbs.y >= 1.0) {
        gl_FragColor = vec4(0);
        return;
      }

      if (uvSbs.x < 0.5) {
        uvSbs.x *= 2.0;
        vec4 left = texture2D(imageSampler, uvSbs);
        gl_FragColor = left;
      } else {
        uvSbs.x -= 0.5;
        uvSbs.x *= 2.0;
        vec4 right = texture2D(mapSampler, uvSbs);
        gl_FragColor = right;
      }
    }
  } else {
    gl_FragColor = vec4(
      perspective(uv, vec3(offset.x, offset.y * aspect, offset.z), focus),
      1.0
    );
  }

  if (watermarkEnabled) {
    bool isSbs = isStereoscopic && !isAnaglyph;
    vec2 wmuv = isSbs ? uvSbs : vTextureCoord;
    if (aspect > 1.0) {
      wmuv.y -= 0.5;
      wmuv.y /= aspect;
      wmuv.y += 0.5;
    } else {
      wmuv.x -= 0.5;
      wmuv.x *= aspect;
      wmuv.x += 0.5;
    }
    gl_FragColor += texture2D(watermark, wmuv);
  }
}
`;
