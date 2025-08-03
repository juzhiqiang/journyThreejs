// 烟花效果的函数，该函数接收参数：粒子数量、位置、大小数组、纹理、半径和颜色。
float remap(float value, float originMin, float originMax, float destinationMin, float destinationMax) {
  return destinationMin + (value - originMin) * (destinationMax - destinationMin) / (originMax - originMin);
}