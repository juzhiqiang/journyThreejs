varying vec3 vColor;

void main(){

  vec2 uv = gl_PointCoord;
  float distanceToCenter = length(uv - vec2(0.5));


  if(distanceToCenter > 0.5){
    discard;
  }


  gl_FragColor = vec4(vColor, 1.0);

  // 引入色调映射功能，将高动态范围(HDR)颜色适配到显示器的有限动态范围
  #include <tonemapping_fragment>
  // 引入颜色空间转换功能，通常用于将线性颜色空间转换为sRGB颜色空间以确保正确显示
  #include <colorspace_fragment>


}