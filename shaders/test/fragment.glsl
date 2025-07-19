//  精度限定符：highp, mediump, lowp
precision mediump float;

// 顶点着色器传来的随机数
varying float vRandom;

// 测试3使用
uniform vec3 uColor;
uniform sampler2D uTexture;
varying vec2 vUv; 
varying float vElevation;


void main(){
  // 测试2
  // gl_FragColor = vec4(vRandom, vRandom * 0.5, 1.0, 1.0);
  
  // 测试3 
  // gl_FragColor = vec4(uColor, 1.0);

  // 第一个参数是纹理，第二个参数是纹理坐标位置
  vec4 textureColor = texture2D(uTexture, vUv);
  textureColor.rgb *= vElevation * 2.0 + 0.8;
  gl_FragColor = textureColor;
  // gl_FragColor = vec4(vUv, 1.0, 1.0);
}