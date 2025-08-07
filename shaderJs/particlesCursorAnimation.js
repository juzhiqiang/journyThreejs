/*
 * @Author: juzhiqiang
 * @Date: 2025-06-30 21:47:43
 * @LastEditors: juzhiqiang
 * @LastEditTime: 2025-08-07 16:10:59
 * @Description: 鼠标粒子动画 - 基于Three.js的交互式粒子系统，通过鼠标移动产生粒子位移效果
 * 
 * 核心功能：
 * 1. 创建基于图片的粒子系统
 * 2. 实时追踪鼠标位置，生成位移贴图
 * 3. 通过着色器实现粒子的位移和动画效果
 * 4. 使用Canvas作为中间层生成位移纹理
 */
import * as THREE from "three";
import { Scene, TextureLoader } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { TextGeometry, Timer } from "three/examples/jsm/Addons.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
// 导入自定义着色器 - 用于粒子的顶点变换和片段着色
import vertexShader from "../shaders/particlesCursorAnimation/vertex.glsl";
import fragmentShader from "../shaders/particlesCursorAnimation/fragment.glsl";

/**
 * GUI调试面板配置 - 用于实时调试和参数调节
 */
const gui = new dat.GUI();
// 调试对象，存储可调节的颜色参数和其他配置项
const debug = {};

// 屏幕尺寸配置 - 管理窗口尺寸和像素密度
const size = {
  width: window.innerWidth,   // 窗口宽度
  height: window.innerHeight, // 窗口高度
  pixelRatio: Math.min(window.devicePixelRatio, 2), // 限制像素比，平衡性能与质量
};

// 鼠标光标位置追踪（预留功能，当前未使用在主要逻辑中）
// 标准化坐标系：中心为(0,0)，范围[-0.5, 0.5]
const cursor = {
  x: 0,
  y: 0,
};
window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / size.width - 0.5;      // 水平位置标准化
  cursor.y = -(event.clientY / size.height - 0.5);  // 垂直位置标准化（翻转Y轴）
});

// 获取canvas元素 - Three.js渲染目标
const dom = document.querySelector("#canvas");

/**
 * 资源加载器配置 - 用于加载各种3D资源
 */
const textureLoader = new THREE.TextureLoader();    // 2D纹理加载器
const cubeTextureLoader = new THREE.CubeTextureLoader(); // 立方体贴图加载器（天空盒等）
const rgbeLoader = new RGBELoader();                // HDR环境贴图加载器
const gltfLoader = new GLTFLoader();                // 3D模型加载器

// 创建场景 - Three.js场景图的根节点
const scene = new Scene();

/**
 * 位移系统 - 核心交互功能，用于生成鼠标交互的位移效果
 * 
 * 工作原理：
 * 1. 创建一个128x128的Canvas作为位移贴图
 * 2. 使用射线投射检测鼠标在3D空间中的位置
 * 3. 在Canvas上绘制发光效果，形成位移数据
 * 4. 将Canvas转换为WebGL纹理传递给着色器
 */
const displacement = {
  canvasCursor: {}, // 画布上的光标位置（对象预留）
};

// 创建位移效果的画布 - 用作动态纹理生成
displacement.canvas = document.createElement("canvas");
displacement.canvas.width = 128;   // 位移贴图宽度
displacement.canvas.height = 128;  // 位移贴图高度
displacement.canvas.style.position = "fixed"; // 固定定位用于调试显示
displacement.canvas.style.top = "0";
displacement.canvas.style.left = "180px";     // 位置调试显示用
displacement.canvas.style.width = "128px";
displacement.canvas.style.height = "128px";
document.body.appendChild(displacement.canvas); // 添加到DOM用于调试查看

// 获取2D绘制上下文并初始化
displacement.context = displacement.canvas.getContext("2d");
displacement.context.fillRect(0, 0, 128, 128); // 初始填充

// 加载发光图像 - 用于在位移Canvas上绘制发光效果
displacement.glowImage = new Image();
displacement.glowImage.src = "/images/dog/glow.png";

// 创建交互检测平面 - 用于射线投射检测鼠标位置
displacement.interactivePlace = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10), // 与粒子系统同样大小的平面
  new THREE.MeshBasicMaterial({
    color: "red",
    side: THREE.DoubleSide, // 双面材质确保射线检测
  })
);
displacement.interactivePlace.visible = false; // 隐藏辅助平面
scene.add(displacement.interactivePlace);

// 射线投射器 - 用于检测鼠标与3D物体的交互
displacement.raycaster = new THREE.Raycaster();
// 屏幕坐标系鼠标位置：范围[-1, 1]，适用于射线投射
displacement.screenCursor = new THREE.Vector2(9999, 9999);
// Canvas坐标系鼠标位置：像素坐标
displacement.canvasCursor = new THREE.Vector2(9999, 9999);
displacement.canvasCursorPrevious = new THREE.Vector2(9999, 9999); // 上一帧位置，用于计算移动距离

// 鼠标移动事件监听 - 更新射线投射用的标准化屏幕坐标
window.addEventListener("pointermove", (event) => {
  // 转换为Three.js标准坐标系：中心(0,0)，范围[-1,1]
  displacement.screenCursor.x = (event.clientX / size.width - 0.5) * 2;
  displacement.screenCursor.y = (-(event.clientY / size.height) + 0.5) * 2;
});

// 将Canvas转换为WebGL纹理
displacement.texture = new THREE.CanvasTexture(displacement.canvas);

/**
 * 粒子系统几何体创建
 */
// 创建粒子几何体 - 基于平面几何，每个顶点代表一个粒子
const particlesGeometry = new THREE.PlaneGeometry(10, 10, 128, 128);
particlesGeometry.setIndex(null); // 移除索引，使每个顶点独立成为粒子
particlesGeometry.deleteAttribute("normal"); // 删除法线属性（粒子不需要）

// 为每个粒子生成随机属性
const intensitiesArray = new Float32Array(
  particlesGeometry.attributes.position.count // 与顶点数量相同
);
const anglesArray = new Float32Array(
  particlesGeometry.attributes.position.count
);

// 为每个粒子分配随机强度和角度属性
for (let i = 0; i < particlesGeometry.attributes.position.count; i++) {
  intensitiesArray[i] = Math.random(); // 随机强度 [0,1]
  anglesArray[i] = Math.random() * Math.PI * 2; // 随机角度 [0,2π]
}

// 将自定义属性添加到几何体 - 这些将传递给顶点着色器
particlesGeometry.setAttribute(
  "aIntensity", // 粒子强度属性
  new THREE.BufferAttribute(intensitiesArray, 1)
);
particlesGeometry.setAttribute(
  "aAngle", // 粒子角度属性
  new THREE.BufferAttribute(anglesArray, 1)
);

/**
 * 粒子材质 - 使用自定义着色器
 */
const particlesMaterial = new THREE.ShaderMaterial({
  vertexShader,   // 顶点着色器 - 处理粒子位置变换
  fragmentShader, // 片段着色器 - 处理粒子颜色和透明度
  blending: THREE.AdditiveBlending, // 加法混合模式，产生发光效果
  uniforms: {
    // 屏幕分辨率 - 用于着色器中的坐标计算
    uResolution: new THREE.Uniform(
      new THREE.Vector2(
        size.width * size.pixelRatio,
        size.height * size.pixelRatio
      )
    ),
    // 粒子源图像纹理
    uPictureTexture: new THREE.Uniform(
      textureLoader.load("/images/dog/picture-1.png")
    ),
    // 位移纹理 - 用于控制粒子的位移效果
    uDisplacementTexture: new THREE.Uniform(displacement.texture),
  },
});

// 创建粒子系统对象
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

/**
 * 场景光照设置 - 基础照明配置（粒子系统通常不需要复杂光照）
 */
// 环境光提供整体照明 - 为场景提供基础亮度
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// 方向光模拟太阳光，支持阴影 - 为场景提供主要光源
const directionLight = new THREE.DirectionalLight(0xffffff, 1);
directionLight.position.set(1, 3, 0); // 光源位置
directionLight.castShadow = true;      // 启用阴影投射
scene.add(directionLight);

/**
 * 摄像机设置 - 定义观察视角和投影参数
 */
const camera = new THREE.PerspectiveCamera(
  45,                        // 视野角度（FOV）
  size.width / size.height,  // 宽高比，根据窗口尺寸动态计算
  0.001,                     // 近裁剪面，定义最近可见距离
  100000                     // 远裁剪面，定义最远可见距离
);
camera.position.set(0, 0, 18); // 摄像机初始位置，Z轴18单位距离
scene.add(camera);

// 添加坐标轴辅助器 - 用于开发调试，显示XYZ轴方向
const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);

/**
 * 渲染器配置 - WebGL渲染器设置和优化
 */
const renderer = new THREE.WebGLRenderer({
  antialias: true, // 启用抗锯齿，提高渲染质量
  canvas: dom,     // 指定canvas元素作为渲染目标
});
renderer.setSize(size.width, size.height);           // 设置渲染尺寸
renderer.shadowMap.enabled = true;                   // 启用阴影渲染
renderer.shadowMap.type = THREE.PCFSoftShadowMap;    // 软阴影类型，提供更自然的阴影效果
// 限制像素比以平衡性能和质量，避免在高DPI屏幕上过度渲染
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor("#000011"); // 设置背景色为深蓝黑色

// 启用物理正确的光照计算 - 提供更真实的光照效果
renderer.physicallyCorrectLights = true;
renderer.outputColorSpace = THREE.SRGBColorSpace; // 设置输出颜色空间

// 设置色调映射为ACES Filmic，提供电影级色彩效果
// ACES（Academy Color Encoding System）是电影行业标准色彩系统
// 注释掉的代码可选择性启用更高级的色调映射
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.toneMappingExposure = 1.5; // 可选：调整曝光度

// 添加轨道控制器，允许用户交互控制摄像机
// 支持鼠标拖拽旋转、滚轮缩放、右键平移等操作
const controls = new OrbitControls(camera, renderer.domElement);

/**
 * 动画循环系统 - 控制时间和帧率
 */
const time = new Timer(); // Three.js时间管理器，提供精确的时间控制

/**
 * 主渲染循环函数 - 每帧执行的核心逻辑
 * 
 * 主要职责：
 * 1. 更新控制器和时间系统
 * 2. 处理鼠标交互的射线检测
 * 3. 更新位移Canvas纹理
 * 4. 渲染场景
 */
const tick = () => {
  controls.update(); // 更新轨道控制器，处理用户交互
  time.update();     // 更新计时器，计算时间差
  const deltaTime = time.getDelta();   // 获取帧间隔时间（可用于帧率无关的动画）
  const elapsedTime = time.getElapsed(); // 获取总经过时间（可用于周期性动画）

  // === 鼠标交互处理 ===
  // 使用射线投射检测鼠标在3D空间中的位置
  displacement.raycaster.setFromCamera(displacement.screenCursor, camera);
  const intersects = displacement.raycaster.intersectObject(
    displacement.interactivePlace // 检测与交互平面的交点
  );

  // 如果射线与平面相交，计算在Canvas上对应的像素坐标
  if (intersects.length > 0) {
    const uv = intersects[0].uv; // 获取UV坐标 [0,1]
    displacement.canvasCursor.x = uv.x * displacement.canvas.width;        // 转换为像素X坐标
    displacement.canvasCursor.y = (1 - uv.y) * displacement.canvas.height; // 转换为像素Y坐标（翻转Y轴）
  }

  // === 位移Canvas更新 ===
  // 第一步：应用渐变效果，让之前的绘制内容逐渐消失
  displacement.context.globalCompositeOperation = "source-over"; // 标准混合模式
  displacement.context.globalAlpha = 0.02; // 很低的透明度，创建拖尾效果
  displacement.context.fillRect(
    0, 0,
    displacement.canvas.width,
    displacement.canvas.height
  );

  // 第二步：计算鼠标移动距离，用于控制发光强度
  const cursorDistance = displacement.canvasCursorPrevious.distanceTo(
    displacement.canvasCursor
  );
  displacement.canvasCursorPrevious.copy(displacement.canvasCursor); // 保存当前位置为下一帧的前一位置
  const alpha = Math.min(cursorDistance * 0.1, 1); // 根据移动距离计算透明度，移动越快越亮

  // 第三步：在当前鼠标位置绘制发光效果
  const glowSize = displacement.canvas.width * 0.25; // 发光区域大小为Canvas的25%
  displacement.context.globalCompositeOperation = "lighten"; // 变亮混合模式，让亮度叠加
  displacement.context.globalAlpha = alpha; // 使用计算出的透明度
  displacement.context.drawImage(
    displacement.glowImage,                                    // 发光图像
    displacement.canvasCursor.x - glowSize * 0.5,            // X位置（居中）
    displacement.canvasCursor.y - glowSize * 0.5,            // Y位置（居中）
    glowSize,                                                 // 宽度
    glowSize                                                  // 高度
  );

  // 通知Three.js纹理已更新，需要重新上传到GPU
  displacement.texture.needsUpdate = true;

  // === 场景渲染 ===
  renderer.render(scene, camera); // 渲染当前帧
  window.requestAnimationFrame(tick); // 请求下一帧，保持60fps循环
};

// 启动渲染循环 - 开始执行动画
tick();

/**
 * 窗口大小调整事件处理 - 响应式设计支持
 * 
 * 当用户调整浏览器窗口大小时，需要同步更新：
 * 1. 渲染器尺寸
 * 2. 摄像机宽高比
 * 3. 像素密度设置
 */
window.addEventListener("resize", () => {
  // 更新尺寸配置对象
  size.width = window.innerWidth;
  size.height = window.innerHeight;

  // 更新摄像机宽高比和投影矩阵
  // 这确保3D场景在窗口尺寸变化时保持正确的比例
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix(); // 重新计算投影矩阵

  // 更新渲染器尺寸和像素比
  // 确保渲染输出与新的窗口尺寸匹配
  renderer.setSize(size.width, size.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 限制像素比以保持性能
});
