/*
 * @Author: juzhiqiang
 * @Date: 2025-06-30 21:47:43
 * @LastEditors: juzhiqiang
 * @LastEditTime: 2025-08-05 19:06:24
 * @Description: 半色调着色
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
import testVertexShader from "../shaders/halftoneShading/vertex.glsl";
import testFragmentShader from "../shaders/halftoneShading/fragment.glsl";

/**
 * GUI调试面板配置
 */
const gui = new dat.GUI();
// 调试对象，存储可调节的颜色参数
const debug = {
  clearColor: "#26132f",
  color: "#ff794d",
  shadowRepetitions: 100,
  shadowColor: "#8e19b8",
  lightRepetitions: 130,
  lightColor: "#e5ffe0",
};

// 屏幕尺寸配置
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
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

// 创建场景
const scene = new Scene();

/**
 * 水面几何体和材质设置
 */
// 创建自定义着色器材质
const material = new THREE.ShaderMaterial({
  vertexShader: testVertexShader, // 顶点着色器
  fragmentShader: testFragmentShader, // 片段着色器
  side: THREE.DoubleSide, // 双面渲染
  wireframe: false, // 非线框模式
  uniforms: {
    // 时间相关
    uTime: { value: 0.0 }, // 动画时间

    // 大波浪参数
    uBigWavesSpeed: { value: 0.2 }, // 大波浪移动速度
    uBigWavesElevation: { value: 0.2 }, // 大波浪高度幅度
    uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) }, // 大波浪频率(X,Z轴)

    // 颜色混合参数
    uDepthColor: { value: new THREE.Color(debug.color) }, // 深水颜色
    uSurfaceColor: { value: new THREE.Color(debug.color) }, // 浅水颜色
    uColorOffset: { value: 0.925 }, // 颜色混合偏移
    uColorMultiplier: { value: 1.0 }, // 颜色混合倍数

    // 小波浪（细节）参数
    uSmallWavesElevation: { value: 0.15 }, // 小波浪高度
    uSmallWavesFrequency: { value: 3.0 }, // 小波浪频率
    uSmallWavesSpeed: { value: 0.2 }, // 小波浪速度
    uSmallWavesIterations: { value: 4.0 }, // 小波浪迭代层数
  },
});


// Torus knot
const torusKnot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.6, 0.25, 128, 32), material)
torusKnot.position.x = 3
scene.add(torusKnot)

// Sphere
const sphere = new THREE.Mesh(new THREE.SphereGeometry(), material)
sphere.position.x = -3
scene.add(sphere)

// Suzanne
let suzanne = null
gltfLoader.load('/models/hologram/suzanne.glb', gltf => {
  suzanne = gltf.scene
  suzanne.traverse(child => {
    if (child.isMesh) child.material = material
  })
  scene.add(suzanne)
})

/**
 * 场景光照设置
 */
// 环境光提供整体照明
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// 方向光模拟太阳光，支持阴影
const directionLight = new THREE.DirectionalLight(0xffffff, 1);
directionLight.position.set(1, 3, 0);
directionLight.castShadow = true;
scene.add(directionLight);

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

// 启用物理正确的光照计算
renderer.physicallyCorrectLights = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// 设置色调映射为ACES Filmic，提供电影级色彩效果
// ACES（Academy Color Encoding System）是电影行业标准色彩系统
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5; // 可选：调整曝光度

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

  if (suzanne) {
    suzanne.rotation.x = -elapsedTime * 0.1;
    suzanne.rotation.y = elapsedTime * 0.2;
  }

  sphere.rotation.x = -elapsedTime * 0.1;
  sphere.rotation.y = elapsedTime * 0.2;

  torusKnot.rotation.x = -elapsedTime * 0.1;
  torusKnot.rotation.y = elapsedTime * 0.2;

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
