#include ../includes/remap.glsl;

uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;
attribute float aSize;
attribute float aTimeMultiplier;


void main() {
  float progress = uProgress * aTimeMultiplier;
  vec3 newPosition = position;

  // 爆炸进度
  float explodingProgress = remap(progress, 0.0, 0.1, 0.0, 1.0);
  // 限制值在0-1间，防止爆炸进度超出范围
  explodingProgress = clamp(explodingProgress, 0.0, 1.0);
  // 爆炸动画曲线，二次方缓动效果，开始快结束慢
  explodingProgress = 1.0 - pow(1.0 - explodingProgress, 2.0);
  newPosition *= explodingProgress;

  // 下落动画
  float fallingProgress = remap(progress, 0.1, 1.0, 0.0, 1.0);
  fallingProgress = clamp(fallingProgress, 0.0, 1.0);
  fallingProgress = 1.0 - pow(1.0 - fallingProgress, 2.0);
  newPosition.y -= fallingProgress * 0.2;

  // 缩放
  float sizeOpeningProgress = remap(progress, 0.0, 0.125, 0.0, 1.0);
  float sizeCloseProgress = remap(progress, 0.125, 1.0, 1.0, 0.0);
  float sizeProgress = min(sizeOpeningProgress,sizeCloseProgress);
  sizeProgress = clamp(sizeProgress, 0.0, 1.0);

  // twinkling 闪烁动画
  float twinklingProgress = remap(progress, 0.2, 0.8, 0.0, 1.0);
  twinklingProgress = clamp(twinklingProgress, 0.0, 1.0);
  float sizeTwinkling = sin(progress * 30.0) * 0.5 +0.5;
  sizeTwinkling = 1.0 - sizeTwinkling * twinklingProgress;



  // 顶点位置
  vec4  modelPosition = modelMatrix * vec4(newPosition, 1.0);
  // 视图位置
  vec4 viewPosition = viewMatrix * modelPosition;
  // 投影位置
  gl_Position = projectionMatrix * viewPosition;

  gl_PointSize = uSize * uResolution.y * aSize * sizeProgress * sizeTwinkling;
  gl_PointSize *= 1.0 / -viewPosition.z;

  // 剔除超出范围的点，节省性能，丢到无限远处即不会渲染（glsl没有提供不渲染的方法，hack丢到足够远）
  if(gl_PointSize <1.0)
    gl_Position = vec4(9999.9);

 
}