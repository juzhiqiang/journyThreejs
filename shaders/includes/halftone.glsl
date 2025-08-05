/**
 * 半色调着色效果函数
 * 创建类似印刷半色调的视觉效果，通过点阵密度表现明暗变化
 * 
 * @param color - 基础颜色
 * @param pointColor - 半色调点的颜色
 * @param repetitions - 点阵重复次数（控制点的密度）
 * @param direction - 光照方向向量
 * @param normal - 表面法向量
 * @param low - 光照强度的最小阈值
 * @param high - 光照强度的最大阈值
 * @return 处理后的半色调颜色
 */
vec3 halftone(         
    vec3 color,        // 基础色彩
    vec3 pointColor,   // 半色调点的颜色
    float repetitions, // 点阵重复密度
    vec3 direction,    // 光照方向
    vec3 normal,       // 表面法向量
    float low,         // 强度下限
    float high         // 强度上限
) {
  // 计算光照强度：法向量与光照方向的点积
  float intensity = dot(normal, direction);
  // 使用smoothstep在low和high之间创建平滑过渡
  intensity = smoothstep(low, high, intensity);

  // 计算屏幕空间UV坐标
  // gl_FragCoord.xy是当前像素的屏幕坐标
  // 除以uResolution.y使坐标标准化为正方形比例
  vec2 uv = gl_FragCoord.xy / uResolution.y;
  // 根据repetitions缩放UV，控制点阵密度
  uv *= repetitions;
  // 使用mod函数创建重复的瓦片模式，每个瓦片范围[0,1]
  uv = mod(uv, 1.0);

  // 计算当前UV点到瓦片中心(0.5, 0.5)的距离
  float point = distance(uv, vec2(0.5));
  // 使用step函数创建圆形点：
  // 当距离小于 0.5 * intensity 时，点为1（内部）
  // 当距离大于等于时，点为0（外部）
  // intensity越高，圆点越大，创造更亮的效果
  point = step(0.5 * intensity, point);
  // 反转值：1变0，0变1
  // 现在点内部为0，外部为1
  point = 1.0 - point;

  // 在基础颜色和点颜色之间混合
  // point为1时使用pointColor，point为0时使用color
  return mix(color, pointColor, point);
}