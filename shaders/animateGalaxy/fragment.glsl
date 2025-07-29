


void main(){
  // disc 绘制圆形点
  float strength = distance(gl_PointCoord,vec2(0.5));
  strength = step(0.5, strength);
  strength = 1.0 - strength;

  //  通过点坐标计算颜色
  gl_FragColor = vec4(vec3(strength), 1.0);
}