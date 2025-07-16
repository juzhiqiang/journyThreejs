    uniform mat4 projectionMatrix;
    uniform mat4 viewMatrix;
    uniform mat4 modelMatrix;

    attribute vec3 position;

    void main(){
      // float 浮点型
      // int 整型
      // bool 布尔型
      // vec2 二维向量必须是浮点型 vec2(1.0, 1.0),且必须有值
      // vec3 三维向量 vec3(1.0, 1.0 , 1.0)
      // mat2 二维矩阵


      gl_Position = projectionMatrix * modelMatrix * viewMatrix * vec4(position, 1.0);

      gl_Position.x += 1.0;
    }