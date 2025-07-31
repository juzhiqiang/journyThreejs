uniform float uSize;
uniform float uTime;

attribute float aScale;
attribute vec3 aRandoms;
varying vec3 vColor;

void main(){
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  // 角度
  float angle = atan(modelPosition.x, modelPosition.z);
  float distanceToCenter = length(modelPosition.xz);
  float angleOffset = (1.0 / distanceToCenter) * uTime * 0.2;
  angle += angleOffset;
  modelPosition.x = cos(angle) * distanceToCenter;
  modelPosition.z = sin(angle) * distanceToCenter;

  // 粒子围绕随机
  modelPosition.xyz += aRandoms;


  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  
  gl_Position = projectedPosition ;

  // size
  gl_PointSize = uSize * aScale;
  // 通过距离衰减点大小
  // 这里的衰减是为了让近处的点更大，远处的点更小
  gl_PointSize *= (1.0 / - viewPosition.z);

  /* 
    颜色
   */
  vColor = color;
}