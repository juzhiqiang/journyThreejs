#include ../includes/rotate2D.glsl;
#include ../includes/random2D.glsl;

varying vec3 vPosition;
varying vec3 vNormal;
uniform float uTime;

void main() {

  // 位置
  vec4 modelPosition = modelMatrix * vec4(position,1.0);

  // 随机抖动效果
  float glitchTime = uTime - modelPosition.y;
  float glitchStrength = sin(glitchTime) + sin(glitchTime * 3.45) + sin(glitchTime * 8.76);
  glitchStrength /= 3.0;
  glitchStrength = smoothstep(0.3, 1.0, glitchStrength);
  glitchStrength *= 0.25;
  // 抖动效果只在x和z轴上生效,y轴保持不变。
  modelPosition.x += (random2D(modelPosition.xz + uTime ) - 0.5) * glitchStrength;
  modelPosition.z += (random2D(modelPosition.zx + uTime ) - 0.5) * glitchStrength;

  gl_Position = projectionMatrix * viewMatrix * modelPosition;

  // 模型法线,最后一个参数设置为0 表示法线向量不进行平移变换,只进行旋转和缩放变换。
  vec4 modelNormal = modelMatrix * vec4(normal, 0.0);

  vPosition = modelPosition.xyz;
  vNormal = modelNormal.xyz;
}