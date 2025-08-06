/*
 * @Author: juzhiqiang
 * @Date: 2025-06-30 21:47:43
 * @LastEditors: juzhiqiang
 * @LastEditTime: 2025-08-06 21:03:18
 * @Description: 地球
 *
 */
import * as THREE from "three";
import { Scene, TextureLoader } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { TextGeometry, Timer } from "three/examples/jsm/Addons.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
// 导入自定义着色器
import vertexShader from "../shaders/earth/vertex.glsl";
import fragmentShader from "../shaders/earth/fragment.glsl";
import atmosphereVertexShader from "../shaders/earth/atmosphere/vertex.glsl";
import atmosphereFragmentShader from "../shaders/earth/atmosphere/fragment.glsl";


/**
 * GUI调试面板配置
 */
const gui = new dat.GUI();
// 调试对象，存储可调节的颜色参数
const debug = {
  atmosphereDayColor: "#00aaff",
  atmosphereTwilightColor: "#ff6600",
};

// 屏幕尺寸配置
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

// 鼠标光标位置追踪（预留功能，当前未使用）
const cursor = {
  x: 0,
  y: 0,
};
window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / size.width - 0.5;
  cursor.y = -(event.clientY / size.height - 0.5);
});

// 获取canvas元素
const dom = document.querySelector("#canvas");

/**
 * 资源加载器配置
 */
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const rgbeLoader = new RGBELoader();
const gltfLoader = new GLTFLoader();

const earthDayTexture = textureLoader.load("/images/earth/day.jpg");
earthDayTexture.colorSpace = THREE.SRGBColorSpace;
earthDayTexture.anisotropy = 8;

const earthNightTexture = textureLoader.load("/images/earth/night.jpg");
earthNightTexture.colorSpace = THREE.SRGBColorSpace;
earthNightTexture.anisotropy = 8;

const earthSpecularTexture = textureLoader.load(
  "/images/earth/specularClouds.jpg"
);
earthSpecularTexture.anisotropy = 8;

const backgroundTexture = textureLoader.load("/images/earth/milky-way-8k.png");
backgroundTexture.mapping = THREE.EquirectangularReflectionMapping;
backgroundTexture.colorSpace = THREE.SRGBColorSpace

// 创建场景
const scene = new Scene();
scene.background = backgroundTexture;

/**
 * 水面几何体和材质设置
 */
// 创建自定义着色器材质
const material = new THREE.ShaderMaterial({
  vertexShader: vertexShader, // 顶点着色器
  fragmentShader: fragmentShader, // 片段着色器
  uniforms: {
    uDayTexture: { value: earthDayTexture }, // 日间纹理
    uNightTexture: { value: earthNightTexture }, // 夜间纹理
    uSpecularTexture: { value: earthSpecularTexture }, // 镜面纹理
    uSunDirection: new THREE.Uniform(new THREE.Vector3(0.0, 0.0, 1.0)),
    uAtmosphereDayColor: new THREE.Uniform(
      new THREE.Color(debug.atmosphereDayColor)
    ),
    uAtmosphereTwilightColor: new THREE.Uniform(
      new THREE.Color(debug.atmosphereTwilightColor)
    ),
  },
});

// Sphere
const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
const sphere = new THREE.Mesh(earthGeometry, material);
scene.add(sphere);

// 体积大气
const atmosphereMaterial = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  transparent: true,
  vertexShader: atmosphereVertexShader, // 顶点着色器
  fragmentShader: atmosphereFragmentShader, // 片段着色器
  uniforms: {
    uSunDirection: new THREE.Uniform(new THREE.Vector3(0.0, 0.0, 1.0)),
    uAtmosphereDayColor: new THREE.Uniform(
      new THREE.Color(debug.atmosphereDayColor)
    ),
    uAtmosphereTwilightColor: new THREE.Uniform(
      new THREE.Color(debug.atmosphereTwilightColor)
    ),
  },
});
const atmosphere = new THREE.Mesh(earthGeometry, atmosphereMaterial);
atmosphere.scale.set(1.05, 1.05, 1.05);
scene.add(atmosphere);

// 太阳
const sunSphere = new THREE.Spherical(1, Math.PI * 0.5, 0.5);
const sunDirection = new THREE.Vector3();

const debugSun = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.1, 2),
  new THREE.MeshBasicMaterial()
);
scene.add(debugSun);

const updateSun = () => {
  sunDirection.setFromSpherical(sunSphere);

  debugSun.position.copy(sunDirection).multiplyScalar(5);

  material.uniforms.uSunDirection.value.copy(sunDirection);
  atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDirection);
};
updateSun();

gui.add(sunSphere, "phi").min(0).max(Math.PI).onChange(updateSun);
gui.add(sunSphere, "theta").min(-Math.PI).max(Math.PI).onChange(updateSun);
gui
  .addColor(debug, "atmosphereDayColor")
  .name("白天大气颜色")
  .onChange(() => {
    material.uniforms.uAtmosphereDayColor.value.set(debug.atmosphereDayColor);
    atmosphereMaterial.uniforms.uAtmosphereDayColor.value.set(debug.atmosphereDayColor)
  });
gui
  .addColor(debug, "atmosphereTwilightColor")
  .name("黄昏大气颜色")
  .onChange(() => {
    material.uniforms.uAtmosphereTwilightColor.value.set(
      debug.atmosphereTwilightColor
    );
    atmosphereMaterial.uniforms.uAtmosphereTwilightColor.value.set(debug.atmosphereTwilightColor)
  });

/**
 * 场景光照设置
 */
// // 环境光提供整体照明
// const ambientLight = new THREE.AmbientLight(0xffffff, 1);
// scene.add(ambientLight);

// // 方向光模拟太阳光，支持阴影
// const directionLight = new THREE.DirectionalLight(0xffffff, 1);
// directionLight.position.set(1, 3, 0);
// directionLight.castShadow = true;
// scene.add(directionLight);

/**
 * 摄像机设置
 */
const camera = new THREE.PerspectiveCamera(
  45, // 视野角度
  size.width / size.height, // 宽高比
  0.001, // 近裁剪面
  100000 // 远裁剪面
);
camera.position.z = 5; // 摄像机Z轴位置
camera.position.y = 6; // 摄像机Y轴位置（俯视角度）
scene.add(camera);

// 添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);

/**
 * 渲染器配置
 */
const renderer = new THREE.WebGLRenderer({
  antialias: true, // 启用抗锯齿
  canvas: dom, // 指定canvas元素
});
renderer.setSize(size.width, size.height);
renderer.shadowMap.enabled = true; // 启用阴影
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 软阴影类型
// 限制像素比以平衡性能和质量
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor("#000011");

// 启用物理正确的光照计算
renderer.physicallyCorrectLights = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// 设置色调映射为ACES Filmic，提供电影级色彩效果
// ACES（Academy Color Encoding System）是电影行业标准色彩系统
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.toneMappingExposure = 1.5; // 可选：调整曝光度

// 添加轨道控制器，允许用户交互控制摄像机
const controls = new OrbitControls(camera, renderer.domElement);

/**
 * 动画循环系统
 */
const time = new Timer();

/**
 * 主渲染循环函数
 */
const tick = () => {
  controls.update(); // 更新轨道控制器
  time.update(); // 更新计时器
  const deltaTime = time.getDelta(); // 获取帧间隔时间（未使用）
  const elapsedTime = time.getElapsed(); // 获取总经过时间

  // 渲染场景
  renderer.render(scene, camera);
  // 请求下一帧
  window.requestAnimationFrame(tick);
};

// 启动渲染循环
tick();

/**
 * 窗口大小调整事件处理
 */
window.addEventListener("resize", () => {
  // 更新尺寸
  size.width = window.innerWidth;
  size.height = window.innerHeight;

  // 更新摄像机宽高比和投影矩阵
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();

  // 更新渲染器尺寸和像素比
  renderer.setSize(size.width, size.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
