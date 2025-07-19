uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

attribute vec3 position;
// 自定义属性，在顶点着色器中可以使用
attribute float aRandom;

// 顶点着色器中定义的变量，在片元着色器中可以使用
varying float vRandom;

// 测试3使用
uniform vec2 uFrequency;
uniform float uTime;
attribute vec2 uv;

varying vec2 vUv;
varying float vElevation;


void main(){
  // float 浮点型
  // int 整型
  // bool 布尔型
  // vec2 二维向量必须是浮点型 vec2(1.0, 1.0),且必须有值
  // vec3 三维向量 vec3(1.0, 1.0 , 1.0)
  // mat2 二维矩阵

  // 测试1
  // gl_Position = projectionMatrix * modelMatrix * viewMatrix * vec4(position, 1.0);

  // 测试2
  // vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  // // 模型位置加上x坐标乘以10的正弦值，也就是沿着x轴来回波动
  // // modelPosition.z += sin(modelPosition.x * 20.0) * 0.1;

  // // 模型位置加上随机值乘以0.1得到高低不平的面
  // modelPosition.z += aRandom * 0.1;

  // // 视图位置乘模型位置 = 视图模型位置
  // vec4 viewPosition = viewMatrix * modelPosition;
  // // 投影矩阵乘视图模型位置 = 投影视图模型位置
  // vec4 projectedPosition = projectionMatrix * viewPosition;

  // gl_Position = projectedPosition;

  // vRandom = aRandom;


  // 测试3
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  float elevation = sin(modelPosition.x * uFrequency.x - uTime) * 0.1;
  elevation += sin(modelPosition.y * uFrequency.y - uTime) * 0.1;

  modelPosition.z += elevation;


  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  
  gl_Position = projectedPosition;

  vUv = uv;
  vElevation = elevation;

}