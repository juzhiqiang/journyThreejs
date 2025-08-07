// 从顶点着色器传入的插值变量
varying vec2 vUv;           // 纹理坐标 UV mapping
varying vec3 vNormal;       // 表面法线向量
varying vec3 vPosition;     // 片段在世界空间中的位置

// 纹理贴图
uniform sampler2D uDayTexture;      // 地球日照贴图(卫星图像)
uniform sampler2D uNightTexture;    // 地球夜间灯光贴图(城市灯光)
uniform sampler2D uSpecularTexture; // 镜面反射贴图(r:海洋反射强度, g:云层遮罩)

// 光照和大气参数
uniform vec3 uSunDirection;          // 太阳光照方向向量
uniform vec3 uAtmosphereDayColor;    // 大气层白天颜色
uniform vec3 uAtmosphereTwilightColor; // 大气层黄昏颜色

void main() {

// 计算基础向量
vec3 viewDirection  = normalize(vPosition - cameraPosition); // 从相机到片段的视线方向
vec3 normal = normalize(vNormal);                            // 标准化表面法线
vec3 color = vec3(0.0);                                     // 初始化最终颜色

// 计算太阳光照强度 - 表面法线与太阳方向的点积
// 值域: [-1, 1], 1表示正对太阳, -1表示背对太阳
float sunOrientation = dot(uSunDirection, normal);

// 昼夜过渡 - 基于太阳光照强度平滑混合日夜贴图
// smoothstep(-0.25, 0.5, x): 当x在-0.25到0.5之间时平滑插值0到1
float dayMix = smoothstep(-0.25, 0.5, sunOrientation);
vec3 dayColor = texture(uDayTexture,vUv).rgb;   // 采样日间卫星图像
vec3 nightColor = texture(uNightTexture,vUv).rgb; // 采样夜间城市灯光
color = mix(nightColor,dayColor, dayMix);          // 根据光照强度混合昼夜颜色

// 云层渲染 - 使用镜面贴图的绿色通道作为云层遮罩
vec2 specularTexture = texture(uSpecularTexture,vUv).rg; 
float cloudsMix = smoothstep(0.5, 1.0, specularTexture.g); // 云层密度(绿色通道)
cloudsMix *= dayMix;                                       // 只在白天显示云层
color = mix(color, vec3(1.0), cloudsMix);                 // 将云层渲染为白色

// 菲涅尔效应 - 计算边缘发光强度
// 当视线与法线垂直时(边缘)菲涅尔值最大,产生边缘发光效果
float fresnel = 1.0 + dot(viewDirection, normal);
fresnel = pow(fresnel, 2.0);  // 平方增强边缘效果

// 大气层散射效果
float atmosphereMix = smoothstep(-0.5, 1.0, sunOrientation); // 大气散射强度随光照变化
vec3 atmosphereColor = mix(uAtmosphereTwilightColor,uAtmosphereDayColor,atmosphereMix); // 混合大气颜色
color = mix(color,atmosphereColor,fresnel * atmosphereMix);   // 在边缘区域叠加大气散射


// 海洋镜面反射高光 - 模拟阳光在海面的反射
vec3 reflection = reflect(-uSunDirection, normal);    // 计算太阳光的反射方向
float specular = -dot(reflection, viewDirection);     // 反射光与视线的对齐程度
specular = max(specular, 0.0);                       // 限制为正值
specular = pow(specular, 32.0);                      // 32次幂集中高光,模拟水面光滑反射

specular *= specularTexture.r;  // 使用镜面贴图红色通道控制海洋区域的反射强度

// 镜面反射颜色 - 在边缘区域混合大气颜色,中心区域为纯白
vec3 specularColor = mix(vec3(1.0),atmosphereColor, fresnel);
color += specular * specularColor;  // 将镜面高光叠加到最终颜色




// 输出最终颜色
gl_FragColor = vec4(color, 1.0);

  // Three.js 后处理管线
  #include <tonemapping_fragment>   // 色调映射(HDR到LDR)
  #include <colorspace_fragment>    // 色彩空间转换
}