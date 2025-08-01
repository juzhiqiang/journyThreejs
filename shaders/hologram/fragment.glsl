varying vec2 vUv;
uniform sampler2D uPerlinTexture;
uniform float uTime;

void main(){

  // 缩放和动画
  vec2 smokeUv = vUv;
  smokeUv.x *=0.5;
  smokeUv.y *=0.3;
  smokeUv.y -= uTime * 0.03;

  // 通过噪声纹理获取烟雾的颜色信息
  float smoke = texture(uPerlinTexture, smokeUv).r;

  // 平滑过渡，使烟雾看起来更自然
  smoke = smoothstep(0.4, 1.0,smoke);
  

  // 边缘进行淡化
  smoke *= smoothstep(0.0, 0.1, vUv.x);
  smoke *= smoothstep(1.0, 0.9, vUv.x);
  smoke *= smoothstep(0.0, 0.1, vUv.y);
  smoke *= smoothstep(1.0, 0.4, vUv.y);

  gl_FragColor = vec4(0.6,0.3,0.2, smoke);

  // 引入色调映射功能，将高动态范围(HDR)颜色适配到显示器的有限动态范围
  #include <tonemapping_fragment>
  // 引入颜色空间转换功能，通常用于将线性颜色空间转换为sRGB颜色空间以确保正确显示
  #include <colorspace_fragment>


}