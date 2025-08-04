varying vec3 vNormal;
varying vec3 vPosition;

void main() {

  // 位置
  vec4 modelPosition = modelMatrix * vec4(position,1.0);
  gl_Position = projectionMatrix * viewMatrix * modelPosition;

  // 法线变换到模型空间,第四个参数0，表示法线变换时不考虑平移变换。
  vec4 modelNormal = modelMatrix * vec4(normal,0.0);


  vNormal = modelNormal.xyz;
  vPosition = modelPosition.xyz;
}