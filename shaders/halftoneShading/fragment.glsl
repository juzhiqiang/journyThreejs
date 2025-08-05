// 水面深度颜色（深水区域的颜色）
uniform vec3 uDepthColor;
// 水面表面颜色（浅水区域的颜色）
uniform vec3 uSurfaceColor;
// 颜色偏移量，用于调整颜色混合的起始点
uniform float uColorOffset;
// 颜色倍增器，用于控制颜色过渡的强度
uniform float uColorMultiplier;
// 从顶点着色器传来的高度值（水面波浪的起伏）
varying float vElevation;
// 从顶点着色器传来的法向量
varying vec3 vNormal;
// 从顶点着色器传来的世界坐标位置
varying vec3 vPosition;

// 引入光照计算函数
#include ../includes/ambientLight.glsl
#include ../includes/directionalLight.glsl
#include ../includes/pointLight.glsl

void main(){
  // 标准化法向量，确保长度为1
  vec3 normal = normalize(vNormal);
  // 计算视角方向向量，从摄像机指向当前片段的位置
  vec3 viewDirection = normalize(vPosition - cameraPosition);

  // 基于高度的颜色混合计算
  // 通过高度混合颜色，深度越深颜色越暗
  float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
  // 使用smoothstep函数创建平滑的颜色过渡
  mixStrength = smoothstep(0.0, 1.0, mixStrength);
  // 在深水色和浅水色之间进行混合
  vec3 mixColor  = mix(uDepthColor, uSurfaceColor, mixStrength);

  // 光照计算
  vec3 light = vec3(0.0);
  // 环境光被注释掉了
  // light += ambientLight(vec3(1.0,0.0,0.0), 1.0);
  
  // 添加点光源照明效果
  light += pointLight(
    vec3(1.0),                // 光源颜色（白色）
    10.0,                     // 光源强度
    30.0,                     // 光源衰减距离
    0.95,                     // 镜面反射衰减因子
    vec3(0.0,0.25,0.0),      // 光源位置
    normal,                   // 表面法向量
    viewDirection,            // 视角方向
    vPosition                 // 片段世界坐标位置
  );

  // 将基础颜色与光照相乘，得到最终颜色
  mixColor *= light;

  // 输出最终的片段颜色
  gl_FragColor = vec4(mixColor, 1.0);

  // Three.js后处理效果
  // clang-format off
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  // clang-format on
}