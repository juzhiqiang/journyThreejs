uniform float uSize;

attribute float aScale;

void main(){
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  
  gl_Position = projectedPosition;

  // size
  gl_PointSize = uSize * aScale;
  // 通过距离衰减点大小
  // 这里的衰减是为了让近处的点更大，远处的点更小
  gl_PointSize *= (1.0 / - viewPosition.z);

}