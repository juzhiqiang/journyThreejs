// 大气层渲染统一变量
uniform vec3 uSunDirection;          // 太阳光照方向向量
uniform vec3 uAtmosphereDayColor;    // 大气层白天颜色(通常为蓝色)
uniform vec3 uAtmosphereTwilightColor; // 大气层黄昏颜色(通常为橙红色)

// 从顶点着色器传入的插值变量
varying vec3 vPosition;     // 片段在世界空间中的位置
varying vec3 vNormal;       // 大气层球面法线向量

void main() {

// 计算基础向量
vec3 viewDirection  = normalize(vPosition - cameraPosition); // 从相机到片段的视线方向
vec3 normal = normalize(vNormal);                            // 标准化球面法线
vec3 color = vec3(0.0);                                     // 初始化大气颜色

// 计算太阳光照强度 - 表面法线与太阳方向的点积
// 值域: [-1, 1], 1表示正对太阳, -1表示背对太阳
float sunOrientation = dot(uSunDirection, normal);


// 大气层散射颜色计算
// 根据太阳角度在黄昏色和白天色之间平滑过渡
float atmosphereMix = smoothstep(-0.5, 1.0, sunOrientation); // 光照强度映射到[0,1]
vec3 atmosphereColor = mix(uAtmosphereTwilightColor,uAtmosphereDayColor,atmosphereMix);
color +=atmosphereColor;  // 直接添加大气散射颜色

// 大气层透明度计算 - 双重控制实现真实的大气效果

// 边缘透明度: 基于视线与法线的夹角
// 当视线平行于表面时(边缘区域)透明度最高,垂直时透明度最低
float edgeAlpha = dot(viewDirection, normal);
edgeAlpha = smoothstep(0.0, 0.5, edgeAlpha);  // 平滑映射到边缘透明度

// 光照透明度: 只在向阳面显示大气层
// sunOrientation在-0.5到0.0之间时从完全透明过渡到完全不透明
float dayAlpha = smoothstep(-0.5, 0.0, sunOrientation);

// 最终透明度 = 边缘效应 × 光照效应
float alpha = edgeAlpha * dayAlpha;

// 输出大气层颜色和透明度
gl_FragColor = vec4(color, alpha);

  // Three.js 后处理管线
  #include <tonemapping_fragment>   // 色调映射(HDR到LDR)
  #include <colorspace_fragment>    // 色彩空间转换
}