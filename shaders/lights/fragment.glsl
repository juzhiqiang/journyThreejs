varying vec3 vPosition;
varying vec3 vNormal;
uniform float uTime;
uniform vec3 uColor;

void main(){

  // 归一化处理，确保向量长度为1
  vec3 normal = normalize(vNormal);
  if(!gl_FrontFacing){
    normal *= -1.0;
  }


  // 利用取模运算获取条纹效果，条纹间隔为1/20个单位宽度
  float stripes = mod((vPosition.y - uTime * 0.02) * 20.0, 1.0);
  stripes = pow(stripes, 3.0);

  // 菲涅尔效果，模拟光线穿过物体表面时的弯曲和散射效果
  vec3 viewDirection = normalize(vPosition - cameraPosition);
  float fresnel = dot(viewDirection,normal) + 1.0;
  fresnel = pow(fresnel,2.0);
  
  // 衰减效果，模拟光线穿过物体表面时的衰减
  float falloff = smoothstep(0.8, 0.0, fresnel);

  // 全息效果
  float holographic = stripes * fresnel;
  holographic += fresnel * 1.25;
  holographic *= falloff;


  gl_FragColor = vec4(uColor, holographic);

  // 引入色调映射功能，将高动态范围(HDR)颜色适配到显示器的有限动态范围
  #include <tonemapping_fragment>
  // 引入颜色空间转换功能，通常用于将线性颜色空间转换为sRGB颜色空间以确保正确显示
  #include <colorspace_fragment>


}