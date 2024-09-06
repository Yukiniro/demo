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
uniform vec2 u_mouse;
uniform sampler2D image0;
uniform sampler2D image1;

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
    float scene_z = 1.0 - texture(image1, ray_origin.xy + 0.5).x;
    if (ray_origin.z > scene_z) {
      if (ray_origin.z - scene_z < hit_threshold) {
        break;
      }
      ray_origin -= ray_direction; 
      ray_direction /= 2.0; 
    }
  }

  return texture(image0, ray_origin.xy + 0.5).rgb;
}

void main(void) {

  float focus = 0.5;
  float scaleX = 50.0;
  float scaleY = 30.0;
  float x_offset = u_mouse.x / u_resolution.x * scaleX;
  float y_offset = u_mouse.y / u_resolution.y * scaleY;

  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv.y = 1. - uv.y;

  outColor = vec4(perspective(uv, vec3(x_offset, y_offset, 0.0), focus), 1.0);
}`;
