varying vec3 vColor;


void main(){
  // disc 绘制圆形点，实体点
  // float strength = distance(gl_PointCoord,vec2(0.5));
  // strength = step(0.5, strength);
  // strength = 1.0 - strength;

  // gl_FragColor = vec4(vec3(color), 1.0);


  // 点效果 模糊点
  // float strength = distance(gl_PointCoord, vec2(0.5));
  // strength *= 2.0;
  // strength = 1.0 - strength;

  // 
  float strength = distance(gl_PointCoord, vec2(0.5));
  strength = 1.0 - strength;
  strength = pow(strength, 10.0);

  // 混合颜色
  vec3 color = mix(vec3(0.0), vColor, strength);
  //  通过点坐标计算颜色
  gl_FragColor = vec4(color, strength);
}