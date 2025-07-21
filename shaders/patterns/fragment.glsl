// 精度宏定义，防止精度丢失问题
#define PI 3.14159265358979323846

varying vec2 vUv;

float random(vec2 st){
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

// uv旋转函数
vec2 rotate(vec2 uv, float rotation, vec2 mid) {
  return vec2(
    cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
    cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
  );
}


//	Classic Perlin 2D Noise 
//	by Stefan Gustavson (https://github.com/stegu/webgl-noise)
//
vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}

float cnoise(vec2 P){
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 * 
    vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

void main(){
  // 测试一 uv铺满时候默认颜色
  // gl_FragColor = vec4(vUv, 1.0, 1.0);

  /* 
    测试二 左右/上下黑白渐变 ,
    uv.x 介于0~1之间，uv.y 介于0~1之间
    uv.x 越接近0，颜色越黑
    uv.x 越接近1，颜色越白  
    同理，uv.y 越接近0，颜色越黑
   */

  // float strength = vUv.x;
  // float strength = vUv.y;

  // 颜色上下渐变颠倒过来
  // float strength = 1.0 - vUv.y;
  
  // 黑色只占少部分，非线性
  // float strength = vUv.y * 10.0;

  // 纹理重复,通过取模实现，mod取模函数
  // float strength = mod(vUv.y * 10.0, 2.0);
  
  // 斑马线效果，黑白条纹交错出现，取模值大于0.5时取1，反之取0
  // 同时shader中尽量不适用if条件性能差，使用step代替if条件判断
  // float strength = mod(vUv.y * 10.0, 2.0);
  // strength = step(0.5, strength);

  /*
  实现白线占比少，黑占比多的斑马线
  思路：调节step的区间即可 
  */
  // float strength = mod(vUv.y * 10.0, 1.0);
  // strength = step(0.8, strength);

  /*
  实现垂直斑马线白线占比少，黑占比多的斑马线，
  思路：调节step的区间即可 
  */
  // float strength = mod(vUv.x * 10.0, 1.0);
  // strength = step(0.8, strength);

  /*
  实现网格
  */
  // float strength = step(0.8, mod(vUv.x * 10.0, 1.0));
  // strength += step(0.8, mod(vUv.y * 10.0, 1.0));

  /*
  实现点
  思路：利用相乘获得交点
  */
  // float strength = step(0.8, mod(vUv.x * 10.0, 1.0));
  // strength *= step(0.8, mod(vUv.y * 10.0, 1.0));

  /*
  实现长条状点
  思路：利用相乘获得交点
  */
  // float strength = step(0.2, mod(vUv.x * 10.0, 1.0));
  // strength *= step(0.8, mod(vUv.y * 10.0, 1.0));


  /*
  实现7字形
  思路：利用相乘获得交点
  */
  // float barX = step(0.4, mod(vUv.x * 10.0, 1.0));
  // barX *= step(0.8, mod(vUv.y * 10.0, 1.0));

  // float barY = step(0.8, mod(vUv.x * 10.0, 1.0));
  // barY *= step(0.4, mod(vUv.y * 10.0, 1.0));

  // float strength = barX + barY;

  /*
  实现十字
  思路：利用相乘获得交点
  */
  // float barX = step(0.4, mod(vUv.x * 10.0, 1.0));
  // barX *= step(0.8, mod(vUv.y * 10.0 + 0.2, 1.0));

  // float barY = step(0.8, mod(vUv.x * 10.0 + 0.2, 1.0));
  // barY *= step(0.4, mod(vUv.y * 10.0, 1.0));

  // float strength = barX + barY;

  /*
  实现黑色中间向两边渐变
  思路：利用绝对值
  */
  // float strength = abs(vUv.x - 0.5);

  /*
  实现四叶草 黑色 其他位置渐变到白
  思路：利用min函数取最小值，abs绝对值
  */
  // float strength = min(abs(vUv.x - 0.5), abs(vUv.y - 0.5));

  /*
  实现类似走廊效果
  思路：利用max函数取最小值，abs绝对值
  */
  // float strength = max(abs(vUv.x - 0.5), abs(vUv.y - 0.5));

  /*
  实现口形图案 中心黑，口子白
  思路：利用min函数取最小值，abs绝对值,乘为交集
  */
  // 方案一
  // float strength = step(0.2, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
  // 方案二
  // float square1 = step(0.2, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
  // float square2 = 1.0 - step(0.25, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));

  // float strength = square1 * square2;


  /*
  实现 折叠条纹
  思路：round 左开始，floor右开始
  */
  // float strength = round(vUv.x * 10.0) / 10.0;

  /*
  实现方格折叠条纹
  思路：round 左开始，floor右开始
  */
  // float strength = round(vUv.x * 10.0) / 10.0;
  // strength *= round(vUv.y * 10.0) / 10.0;

  /*
  实现芝麻噪点效果
  思路：噪点
  */
  // float strength = random(vUv);

  /*
  实现马赛克效果
  思路：马赛克
  */
  // 正角
  // vec2 gridUv = vec2(
  //   floor(vUv.x * 10.0) / 10.0, 
  //   floor(vUv.y * 10.0) / 10.0 
  // );
  // 倾斜格栅
  //  vec2 gridUv = vec2(
  //   floor(vUv.x * 10.0) / 10.0, 
  //   floor(vUv.y * 10.0 + vUv.x * 5.0) / 10.0 
  // );
  // float strength = random(gridUv);

  /*
  实现弧形波纹效果
  思路：使用length函数计算弧度
  */
  // float strength = length(vUv);

  /*
  实现中心弧形扩散效果
  思路：使用length函数计算弧度
  */
  // float strength = length(vUv - 0.5);
  // 方案二利用距离
  // float strength = distance(vUv, vec2(0.5));

  /*
  实现中心弧形扩散效果-白色向外扩散效果
  思路：使用distance函数计算弧度
  */
  // float strength = 1.0 - distance(vUv, vec2(0.5)) * 2.0;

  /*
  实现高亮灯光
  思路：使用distance函数计算弧度, + 0.25为增加背景颜色
  */
  // float strength = 0.015 / distance(vUv, vec2(0.5)) + 0.25;

  /*
  实现高亮灯光，控制椭圆形状
  思路：使用distance函数计算弧度, + 0.25为增加背景颜色
  */
  // vec2 lightUv = vec2(
  //   vUv.x * 0.1 + 0.45,
  //   vUv.y * 0.5 + 0.25
  // );
  // float strength = 0.015 / distance(lightUv, vec2(0.5));

  /*
  实现十字光晕效果
  思路：使用distance函数计算弧度, + 0.25为增加背景颜色
  */
  // vec2 lightUvX = vec2(
  //   vUv.x * 0.1 + 0.45,
  //   vUv.y * 0.5 + 0.25
  // );
  // float lightX = 0.015 / distance(lightUvX, vec2(0.5));
  // vec2 lightUvY = vec2(
  //   vUv.y * 0.1 + 0.45,
  //   vUv.x * 0.5 + 0.25
  // );
  // float lightY = 0.015 / distance(lightUvY, vec2(0.5));


  // float strength = lightX * lightY;

  /*
  实现正方形光晕效果
  思路：使用distance函数计算弧度, + 0.25为增加背景颜色
  */
  // vec2 roatateUv = rotate(vUv, PI / 4.0 , vec2(0.5));
  // vec2 lightUvX = vec2(
  //   roatateUv.x * 0.1 + 0.45,
  //   roatateUv.y * 0.5 + 0.25
  // );
  // float lightX = 0.015 / distance(lightUvX, vec2(0.5));
  // vec2 lightUvY = vec2(
  //   roatateUv.y * 0.1 + 0.45,
  //   roatateUv.x * 0.5 + 0.25
  // );
  // float lightY = 0.015 / distance(lightUvY, vec2(0.5));

  // float strength = lightX * lightY;

  /*
  实现镂空圆方型
  思路：
  */
  // float strength = step(0.3, distance(vUv, vec2(0.5)));

  /*
  实现镂空
  思路：
  */
  // float strength = abs( distance(vUv, vec2(0.5)) - 0.25);

  /*
  实现镂空yua
  思路： 
  */
  // float strength = step(0.01,abs( distance(vUv, vec2(0.5)) - 0.25));

  /*
  实现白色圆环
  思路： 
  */
  // float strength = 1.0 - step(0.01,abs( distance(vUv, vec2(0.5)) - 0.25));

  /*
  实现波浪环
  思路： 
  */
  // vec2 wavedUv = vec2(
  //   vUv.x,
  //   vUv.y + sin(vUv.x * 50.0) *0.1
  // );
  // float strength = 1.0 - step(0.01,abs( distance(wavedUv, vec2(0.5)) - 0.25));

  /*
  实现水掉落地上炸开效果
  思路： 
  */
  // vec2 wavedUv = vec2(
  //   vUv.x + sin(vUv.y * 50.0) *0.1,
  //   vUv.y + sin(vUv.x * 50.0) *0.1
  // );
  // float strength = 1.0 - step(0.01,abs( distance(wavedUv, vec2(0.5)) - 0.25));

  /*
  实现
  思路： 
  */
  // float angle = atan(vUv.x,vUv.y);
  // float strength = angle;

  /*
  实现
  思路： 
  */
  // float angle = atan(vUv.x - 0.5,vUv.y - 0.5);
  // float strength = angle;

  /*
    实现
    思路： 
  */
  // float angle = atan(vUv.x - 0.5,vUv.y - 0.5);
  // angle /= PI * 2.0;
  // angle += 0.5;
  // float strength = angle;

  /*
    实现
    思路： 
  */
  // float angle = atan(vUv.x - 0.5,vUv.y - 0.5);
  // angle /= PI * 2.0;
  // angle += 0.5;
  // angle *= 20.0;
  // angle = mod(angle, 1.0);
  // float strength = angle;

  /*
    实现
    思路： 
  */
  // float angle = atan(vUv.x - 0.5,vUv.y - 0.5);
  // angle /= PI * 2.0;
  // angle += 0.5;
  // float strength = sin(angle * 100.0);

  /*
    实现波浪环效果
    思路： 
  */
  // float angle = atan(vUv.x - 0.5,vUv.y - 0.5);
  // angle /= PI * 2.0;
  // angle += 0.5;
  // float sinusoid = sin(angle * 100.0);

  // float radius = 0.25 + sinusoid *0.02;
  // float strength = 1.0 - step(0.01,abs(distance(vUv,vec2(0.5)) - radius));

  /*
    实现佩林噪声基础,适合做随机性云朵
    思路： 
  */
  // float strength =  cnoise(vUv * 10.0);

  /*
    实现佩林噪声,适合做随机性云朵
    思路： 
  */
  // float strength =  step(0.0,cnoise(vUv * 10.0));

  /*
    实现佩林噪声,高亮轮廓线
    思路： 
  */
  // float strength =  1.0 - abs(cnoise(vUv * 10.0));

  /*
    实现佩林噪声,高亮轮廓线
    思路： 
  */
  // float strength =  step(0.9, sin(cnoise(vUv * 10.0) * 20.0));

// 以上通用gl_FragColor 设置颜色
  // gl_FragColor = vec4(strength, strength, strength, 1.0);

  /*
    实现佩林噪声,高亮轮廓线
    思路： 
  */
  float strength =  step(0.9, sin(cnoise(vUv * 10.0) * 20.0));

  // 限制强度范围在0到1之间
  strength = clamp(strength, 0.0, 1.0);

  vec3 blackColor = vec3(0.0);
  vec3 uvColor = vec3(vUv, 1.0);
  // 混合颜色
  vec3 mixedColor = mix(blackColor, uvColor, strength);
  gl_FragColor = vec4(mixedColor, 1.0);


}