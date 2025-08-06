uniform vec3 uSunDirection;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {

vec3 viewDirection  = normalize(vPosition - cameraPosition);
vec3 normal = normalize(vNormal);
vec3 color = vec3(0.0);

// 太阳广
float sunOrientation = dot(uSunDirection, normal);


// 大气效果
float atmosphereMix = smoothstep(-0.5, 1.0, sunOrientation);
vec3 atmosphereColor = mix(uAtmosphereTwilightColor,uAtmosphereDayColor,atmosphereMix);
color +=atmosphereColor;

float edgeAlpha = dot(viewDirection, normal);
edgeAlpha = smoothstep(0.0, 0.5, edgeAlpha);

float dayAlpha = smoothstep(-0.5, 0.0, sunOrientation);
float alpha = edgeAlpha * dayAlpha;

gl_FragColor = vec4(color, alpha);

  // clang-format off
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  // clang-format on
}