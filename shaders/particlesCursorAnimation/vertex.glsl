// 从顶点着色器传递到片段着色器的插值变量
varying vec2 vUv;           // 纹理坐标
varying vec3 vColor;        // 粒子颜色强度

// 统一变量(CPU传入的全局参数)
uniform float uTime;                    // 时间值(用于动画)
uniform vec2 uResolution;               // 屏幕分辨率
uniform sampler2D uPictureTexture;      // 图片纹理(控制粒子密度分布)
uniform sampler2D uDisplacementTexture; // 位移纹理(鼠标交互产生的扰动贴图)

// 顶点属性(每个粒子的独特属性)
attribute float aIntensity;  // 粒子强度系数
attribute float aAngle;      // 粒子扰动角度

void main() {

  // 获取粒子的原始位置
  vec3 newPosition = position;
  
  // 从位移纹理中采样扰动强度(鼠标交互产生的影响)
  float displacementIntensity = texture(uDisplacementTexture, uv).r;
  // 使用smoothstep平滑映射,增强扰动效果的对比度
  displacementIntensity = smoothstep(0.1, 1.0, displacementIntensity);

  // 计算粒子扰动方向 - 基于每个粒子的随机角度
  vec3 displacement = vec3(
    cos(aAngle) * .2,  // X方向位移
    sin(aAngle) * .2,  // Y方向位移  
    1.0                // Z方向位移(向外扩散)
  );
  displacement = normalize(displacement);     // 标准化扰动方向
  displacement *= displacementIntensity;     // 乘以位移纹理强度
  displacement *= 3.0;                       // 整体扰动幅度缩放
  displacement *= aIntensity;                // 乘以粒子个体强度
  newPosition += displacement;               // 应用位移到粒子位置
 
  // 标准的3D变换管线 - 将粒子从模型空间转换到屏幕空间
  vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);     // 模型变换
  vec4 viewPosition = viewMatrix * modelPosition;                // 视图变换  
  vec4 projectedPosition = projectionMatrix * viewPosition;      // 投影变换

  // 从图片纹理采样强度值,用于控制粒子的可见度和大小
  float pictureIntensity = texture(uPictureTexture,uv).r;


  // 设置最终的屏幕位置
  gl_Position = projectedPosition ;

  // 计算粒子点的大小
  gl_PointSize = 0.15 * pictureIntensity * uResolution.y;  // 基础大小 × 图片强度 × 屏幕高度
  gl_PointSize *= (1.0 / -viewPosition.z);                // 透视缩放(距离越远点越小)

  // 计算传递给片段着色器的颜色强度
  // 使用平方函数增强对比度,暗部更暗,亮部保持
  vColor = vec3(pow(pictureIntensity, 2.0));
}