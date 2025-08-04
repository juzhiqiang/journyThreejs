// 平行光光照计算函数
// 参数说明：
// lightColor: 光源颜色 (RGB)
// lightIntensity: 光源强度
// normal: 表面法线方向（单位向量）
// lightPosition: 光源位置（对于平行光，实际上是光的方向）
// viewDirection: 观察方向（从表面指向摄像机的单位向量）
// specularPower: 镜面反射指数，控制高光的锐利程度
vec3 directionalLight(
  vec3 lightColor, 
  float lightIntensity,
  vec3 normal,
  vec3 lightPosition,
  vec3 viewDirection,
  float specularPower
){
  // 计算光线方向：将光源位置标准化作为光线方向
  // 注意：对于平行光，lightPosition实际表示光的方向
  vec3 lightDirection = normalize(lightPosition);
  
  // 计算光线的反射方向
  // reflect函数计算入射光线关于法线的反射向量
  // 使用-lightDirection是因为reflect函数期望入射向量指向表面
  vec3 lightReflection = reflect(-lightDirection, normal);

  // === 漫反射计算（Lambert光照模型） ===
  // 计算法线与光线方向的点积，得到光照强度
  float shading = dot(normal, lightDirection);
  // 确保光照强度不为负（背光面不接受光照）
  shading = max(0.0, shading);

  // === 镜面反射计算（Phong光照模型） ===
  // 计算反射光线与观察方向的点积
  // 使用负号是因为viewDirection通常指向摄像机
  float specular = -dot(lightReflection, viewDirection);
  // 确保镜面反射强度不为负
  specular = max(0.0, specular);
  // 使用幂函数控制高光的锐利程度，specularPower越大高光越集中
  specular = pow(specular, specularPower);

  // 最终光照结果 = 光源颜色 × 光源强度 × (漫反射 + 镜面反射)
  return lightColor * lightIntensity * (shading + specular);
}