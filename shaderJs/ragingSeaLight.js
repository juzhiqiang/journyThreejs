/*
 * @Author: juzhiqiang
 * @Date: 2025-06-30 21:47:43
 * @LastEditors: juzhiqiang
 * @LastEditTime: 2025-08-05 18:54:25
 * @Description: 着色器大海 - 使用自定义着色器创建逼真的海洋效果
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
import testVertexShader from "../shaders/waterSea/vertex.glsl";
import testFragmentShader from "../shaders/waterSea/fragment.glsl";

/**
 * GUI调试面板配置
 */
const gui = new dat.GUI();
// 调试对象，存储可调节的颜色参数
const debugObject = {
  depthColor: "#ff4000",    // 深水区域颜色（橙红色）
  surfaceColor: "#151c37",  // 浅水区域颜色（深蓝色）
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

// 加载链条纹理（当前未使用在水面上）
const image = textureLoader.load("/images/textures/chain.png", (texture) => {
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
});

// 创建场景
const scene = new Scene();

/**
 * 水面几何体和材质设置
 */
// 创建高细分度的平面几何体作为水面
const geometry = new THREE.PlaneGeometry(2, 2, 512, 512);
// 删除默认的法向量和UV坐标属性，因为会在着色器中重新计算,节省性能开销
geometry.deleteAttribute("normal");
geometry.deleteAttribute("uv");

// 为每个顶点添加随机属性（预留功能，当前着色器中未使用）
const count = geometry.attributes.position.count;
const random = new Float32Array(count);

for (let i = 0; i < count; i++) {
  random[i] = Math.random();
}
geometry.setAttribute("aRandom", new THREE.BufferAttribute(random, 1));

// 创建自定义着色器材质
const material = new THREE.ShaderMaterial({
  vertexShader: testVertexShader,     // 顶点着色器
  fragmentShader: testFragmentShader, // 片段着色器
  side: THREE.DoubleSide,             // 双面渲染
  wireframe: false,                   // 非线框模式
  uniforms: {
    // 时间相关
    uTime: { value: 0.0 },            // 动画时间

    // 大波浪参数
    uBigWavesSpeed: { value: 0.2 },             // 大波浪移动速度
    uBigWavesElevation: { value: 0.2 },         // 大波浪高度幅度
    uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) }, // 大波浪频率(X,Z轴)

    // 颜色混合参数
    uDepthColor: { value: new THREE.Color(debugObject.depthColor) },     // 深水颜色
    uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) }, // 浅水颜色
    uColorOffset: { value: 0.925 },       // 颜色混合偏移
    uColorMultiplier: { value: 1.0 },     // 颜色混合倍数

    // 小波浪（细节）参数
    uSmallWavesElevation: { value: 0.15 },   // 小波浪高度
    uSmallWavesFrequency: { value: 3.0 },    // 小波浪频率
    uSmallWavesSpeed: { value: 0.2 },        // 小波浪速度
    uSmallWavesIterations: { value: 4.0 },   // 小波浪迭代层数
  },
});

// 创建水面网格并旋转90度使其水平
const mesh = new THREE.Mesh(geometry, material);
mesh.rotation.x = Math.PI / 2;
scene.add(mesh);

/**
 * GUI控制面板设置 - 大波浪参数
 */
gui
  .add(material.uniforms.uBigWavesElevation, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("大波浪高度");
gui
  .add(material.uniforms.uBigWavesFrequency.value, "x")
  .min(0)
  .max(10)
  .step(0.001)
  .name("大波浪幅度X");
gui
  .add(material.uniforms.uBigWavesFrequency.value, "y")
  .min(0)
  .max(10)
  .step(0.001)
  .name("大波浪幅度Y");
gui
  .add(material.uniforms.uBigWavesSpeed, "value")
  .min(0)
  .max(10)
  .step(0.001)
  .name("大波浪速度");

/**
 * GUI控制面板设置 - 颜色参数
 */
gui
  .addColor(debugObject, "depthColor")
  .onChange((e) => {
    material.uniforms.uDepthColor.value = new THREE.Color(e);
  })
  .name("深度颜色");
gui
  .addColor(debugObject, "surfaceColor")
  .onChange((e) => {
    material.uniforms.uSurfaceColor.value = new THREE.Color(e);
  })
  .name("表面颜色"); // 修正：原代码错误地写成了"深度颜色"
gui
  .add(material.uniforms.uColorOffset, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("颜色偏移");
gui
  .add(material.uniforms.uColorMultiplier, "value")
  .min(0)
  .max(10)
  .step(0.001)
  .name("颜色倍数");

/**
 * GUI控制面板设置 - 小波浪参数
 */
gui.add(material.uniforms.uSmallWavesElevation, "value").min(0).max(1).step(0.001).name("小波浪高度");
gui.add(material.uniforms.uSmallWavesFrequency, "value").min(0).max(10).step(0.001).name("小波浪频率");
gui.add(material.uniforms.uSmallWavesSpeed, "value").min(0).max(10).step(0.001).name("小波浪速度");
gui.add(material.uniforms.uSmallWavesIterations, "value").min(0).max(10).step(0.001).name("小波浪迭代");

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
  45,                    // 视野角度
  size.width / size.height, // 宽高比
  0.001,                 // 近裁剪面
  100000                 // 远裁剪面
);
camera.position.z = 5;   // 摄像机Z轴位置
camera.position.y = 6;   // 摄像机Y轴位置（俯视角度）
scene.add(camera);

// 添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);

/**
 * 渲染器配置
 */
const renderer = new THREE.WebGLRenderer({
  antialias: true,       // 启用抗锯齿
  canvas: dom,          // 指定canvas元素
});
renderer.setSize(size.width, size.height);
renderer.shadowMap.enabled = true;                    // 启用阴影
renderer.shadowMap.type = THREE.PCFSoftShadowMap;     // 软阴影类型

// 限制像素比以平衡性能和质量
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 启用物理正确的光照计算
renderer.physicallyCorrectLights = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// 设置色调映射为ACES Filmic，提供电影级色彩效果
// ACES（Academy Color Encoding System）是电影行业标准色彩系统
renderer.toneMapping = THREE.ACESFilmicToneMapping;
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
  controls.update();        // 更新轨道控制器
  time.update();           // 更新计时器
  const deltaTime = time.getDelta();    // 获取帧间隔时间（未使用）
  const elapsedTIme = time.getElapsed(); // 获取总经过时间

  // 更新着色器时间uniform，驱动波浪动画
  material.uniforms.uTime.value = elapsedTIme;

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
