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

in vec2 v_texCoord;

uniform vec2 u_resolution;
uniform vec3 u_offset;
uniform float u_focus;
uniform float u_enlarge;
uniform sampler2D u_image;
uniform sampler2D u_imageMap;

out vec4 outColor;

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
    float scene_z = 1.0 - texture(u_imageMap, ray_origin.xy + 0.5).x;
    if (ray_origin.z > scene_z) {
      if (ray_origin.z - scene_z < hit_threshold) {
        break;
      }
      ray_origin -= ray_direction; 
      ray_direction /= 2.0; 
    }
  }

  return texture(u_image, ray_origin.xy + 0.5).rgb;
}

void main(void) {
  float aspect = u_resolution.x / u_resolution.y;
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv.y = 1. - uv.y;
  outColor = vec4(perspective(uv, vec3(u_offset.x, u_offset.y * aspect, u_offset.z), u_focus), 1.0);
}`;
