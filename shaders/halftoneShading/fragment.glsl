// 基础材质颜色
uniform vec3 uColor;
// 屏幕分辨率，用于计算屏幕空间坐标
uniform vec2 uResolution;
// 阴影半色调的点阵密度
uniform float uShadowRepetitions;
// 阴影半色调的点颜色
uniform vec3 uShadowColor;
// 高光半色调的点阵密度
uniform float uLightRepetitions;
// 高光半色调的点颜色
uniform vec3 uLightColor;

// 从顶点着色器传来的法向量
varying vec3 vNormal;
// 从顶点着色器传来的世界坐标位置
varying vec3 vPosition;

// 引入光照计算函数
#include ../includes/ambientLight.glsl
#include ../includes/directionalLight.glsl
#include ../includes/halftone.glsl

void main() {
  // 计算视角方向：从片段位置指向摄像机
  vec3 viewDirection = normalize(vPosition - cameraPosition);
  // 标准化法向量
  vec3 normal = normalize(vNormal);
  // 初始化颜色为基础材质颜色
  vec3 color = uColor;

  // === 基础光照计算 ===
  vec3 light = vec3(0.0);

  // 环境光：提供全局基础照明
  light += ambientLight(
      vec3(1.0),         // 白色环境光
      1.0                // 环境光强度
  );

  // 方向光：主要光源，创建明暗对比
  light += directionalLight(
      vec3(1.0),             // 白色方向光
      1.0,                   // 光源强度
      normal,                // 表面法向量
      vec3(1.0, 1.0, 0.0),   // 光源方向（从右上前方照射）
      viewDirection,         // 视角方向
      1.0                    // 镜面反射锐度
  );

  // 将光照应用到基础颜色
  color *= light;

  // === 半色调效果处理 ===
  
  // 第一层半色调：阴影效果
  // 使用向下的光线方向检测朝上的表面（接收阴影的区域）
  color = halftone(
      color,                // 当前处理的颜色
      uShadowColor,         // 阴影点的颜色
      uShadowRepetitions,   // 阴影点的密度/重复次数
      vec3(0.0, -1.0, 0.0), // 向下的光线方向
      normal,               // 表面法向量
      -0.8,                 // 强度下限：较低值以捕获更多阴影区域
      1.5                   // 强度上限：较高值确保平滑过渡
  );

  // 第二层半色调：高光效果
  // 使用主光源方向检测直接受光的表面
  color = halftone(
      color,               // 经过第一次半色调处理的颜色
      uLightColor,         // 高光点的颜色
      uLightRepetitions,   // 高光点的密度/重复次数
      vec3(1.0, 1.0, 0.0), // 主光源方向（与方向光一致）
      normal,              // 表面法向量
      0.5,                 // 强度下限：只在中等亮度以上生效
      1.5                  // 强度上限：覆盖高光范围
  );

  // 输出最终的半色调效果颜色
  gl_FragColor = vec4(color, 1.0);

  // Three.js后处理：色调映射和颜色空间转换
  // clang-format off
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  // clang-format on
}