// 点光源着色器函数
// 计算点光源对片段的光照贡献，包括漫反射和镜面反射
// 参数：
//   color: 光源颜色 (vec3)
//   intensity: 光照强度 (float)
//   specularPower: 镜面反射指数，控制高光的锐利程度 (float)
//   decayMultiplier: 光线衰减系数 (float)
//   position: 光源在世界空间中的位置 (vec3)
//   normal: 片段表面法向量 (vec3)
//   viewDirection: 从片段指向观察者的方向向量 (vec3)
//   fragmentPosition: 片段在世界空间中的位置 (vec3)
// 返回值: 最终的光照颜色 (vec3)
vec3 pointLight(vec3 color,
                float intensity,
                float specularPower,
                float decayMultiplier,
                vec3 position,
                vec3 normal,
                vec3 viewDirection,
                vec3 fragmentPosition) {

  // 计算从片段到光源的向量
  vec3 lightDelta = position - fragmentPosition;
  // 计算光源到片段的距离
  float lightDistance = length(lightDelta);

  // 归一化光线方向向量（从片段指向光源）
  vec3 direction = normalize(lightDelta);
  // 计算光线在表面法向量上的反射向量
  vec3 reflection = reflect(-direction, normal);

  // 计算漫反射强度（Lambertian反射模型）
  // 使用法向量和光线方向的点积
  float shading = dot(normal, direction);
  shading = max(0.0, shading); // 确保不为负值

  // 计算镜面反射强度（Phong反射模型）
  // 使用反射向量和视线方向的点积
  float specular = -dot(reflection, viewDirection);
  specular = max(0.0, specular); // 确保不为负值
  specular = pow(specular, specularPower); // 应用镜面反射指数

  // 计算光线衰减（距离越远，光线越弱）
  float decay = 1.0 - lightDistance * decayMultiplier;
  decay = max(0.0, decay); // 确保衰减不为负值

  // 组合所有光照分量：颜色 × 强度 × 衰减 × (漫反射 + 镜面反射)
  return color * intensity * decay * (shading + specular);
}