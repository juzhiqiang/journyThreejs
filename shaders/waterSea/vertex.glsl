// 大波浪的高度幅度
uniform float uBigWavesElevation;
// 大波浪的频率（x轴和z轴方向）
uniform vec2 uBigWavesFrequency;
// 时间uniform，用于动画
uniform float uTime;
// 大波浪的速度
uniform float uBigWavesSpeed;
// 传递给片段着色器的高度值
varying float vElevation;
// 小波浪的高度幅度
uniform float uSmallWavesElevation;
// 小波浪的频率
uniform float uSmallWavesFrequency;
// 小波浪的速度
uniform float uSmallWavesSpeed;
// 小波浪的迭代次数（控制细节层级）
uniform float uSmallWavesIterations;

// 传递给片段着色器的法向量
varying vec3 vNormal;
// 传递给片段着色器的世界坐标位置
varying vec3 vPosition;

// 引入3D Perlin噪声函数
#include ../includes/perlinClassic3D.glsl

/**
 * 计算指定位置的波浪高度
 * 结合大波浪（正弦波）和小波浪（Perlin噪声）
 */
float waveElevation(vec3 position){
  // 计算大波浪：使用两个正弦波的乘积创建更自然的波浪模式
  float elevation = 
    sin(position.x * uBigWavesFrequency.x + uTime*uBigWavesSpeed) *
    sin(position.z * uBigWavesFrequency.y + uTime*uBigWavesSpeed)  *
    uBigWavesElevation;

  // 添加小波浪细节：使用多层Perlin噪声
  for(float i=1.0;i<=uSmallWavesIterations;i++){
    // 每一层的影响逐渐减小（除以i），创建分形噪声效果
    elevation -= abs(
      perlinClassic3D(
        vec3(
          position.xz * uSmallWavesFrequency * i, // 频率随层级增加
          uTime * uSmallWavesSpeed                // 时间动画
        )
      ) * uSmallWavesElevation / i);             // 幅度随层级递减
  
  }

  return elevation;
}

void main(){
  // 用于计算法向量的微小偏移量
  float shift = 0.01;
  
  // 将顶点位置转换到世界坐标系
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  
  // 创建两个稍微偏移的位置点，用于计算法向量
  vec3 modelPositionA = modelPosition.xyz + vec3(shift, 0.0, 0.0);  // X轴偏移
  vec3 modelPositionB = modelPosition.xyz + vec3(0.0, 0.0, -shift); // Z轴偏移

  // 计算当前顶点和两个偏移点的波浪高度
  float elevation = waveElevation(modelPosition.xyz);
  modelPosition.y += elevation;                    // 应用波浪高度到当前顶点
  modelPositionA.y += waveElevation(modelPositionA); // 应用到A点
  modelPositionB.y += waveElevation(modelPositionB); // 应用到B点

  // 通过三点计算表面法向量
  vec3 toA = normalize(modelPositionA - modelPosition.xyz); // 指向A点的向量
  vec3 toB = normalize(modelPositionB - modelPosition.xyz); // 指向B点的向量
  vec3 computeNormal = cross(toA, toB);                     // 叉积得到法向量

  // 变换顶点位置到裁剪空间
  // 计算顶点位置，投影到裁剪空间
  vec4 viewPosition = viewMatrix * modelPosition;           // 视图空间
  vec4 projectedPosition = projectionMatrix * viewPosition; // 裁剪空间
  gl_Position = projectedPosition;                          // 输出最终位置

  // 传递数据给片段着色器
  vElevation = elevation;           // 传递高度值用于颜色混合
  vNormal = computeNormal;          // 传递计算出的法向量
  vPosition = modelPosition.xyz;    // 传递世界坐标位置

}