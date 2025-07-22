uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;
varying float vElevation;


void main(){
  // 通过高度混合颜色，深度越深颜色越暗
  float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
  vec3 mixColor  = mix(uDepthColor, uSurfaceColor, mixStrength);

  gl_FragColor = vec4(mixColor, 1.0);
}