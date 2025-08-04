// 环境光着色器
// 环境光着色器函数，返回环境光的颜色和强度
// 参数：
//   lightColor: 环境光的RGB颜色值 (vec3类型)
//   lightIntensity: 环境光的强度系数 (float类型，通常在0.0-1.0之间)
// 返回值：计算后的环境光颜色 (vec3类型)
vec3 ambientLight(vec3 lightColor, float lightIntensity){
  // 将光的颜色与强度相乘，得到最终的环境光颜色
  // 环境光是均匀照射到所有表面的基础光照，没有方向性
  return lightColor * lightIntensity;
}