/*
 * @Author: juzhiqiang
 * @Date: 2025-06-30 21:47:43
 * @LastEditors: juzhiqiang
 * @LastEditTime: 2025-08-07 18:21:35
 * @Description: 粒子形变动画
 *
 */
import * as THREE from "three";
import { Scene, TextureLoader } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { TextGeometry, Timer } from "three/examples/jsm/Addons.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
// 导入自定义着色器
import vertexShader from "../shaders/particlesMorphing/vertex.glsl";
import fragmentShader from "../shaders/particlesMorphing/fragment.glsl";

/**
 * GUI调试面板配置
 */
const gui = new dat.GUI();
// 调试对象，存储可调节的颜色参数
const debug = {
  clearColor: "#160920",
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
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
console.log(gltfLoader);

// 创建场景
const scene = new Scene();

let particles = null;

gltfLoader.load("/models/models.glb", (gltf) => {
  console.log(gltf);
  particles = {};

  const positions = [];
  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      positions.push(child.geometry.attributes.position);
    }
  });

  particles.maxCount = 0;
  for (const position of positions) {
    if (position.count > particles.maxCount) {
      particles.maxCount = position.count;
    }
  }

  particles.positions = [];
  for (const position of positions) {
    const originalArray = position.array;
    const newArray = new Float32Array(position.maxCount * 3);

    for (let i = 0; i < particles.maxCount; i++) {
      const i3 = i * 3;
      if (i3 < originalArray.length) {
        newArray[i3] = originalArray[i3];
        newArray[i3 + 1] = originalArray[i3 + 1];
        newArray[i3 + 2] = originalArray[i3 + 2];
      } else {
        newArray[i3] = 0;
        newArray[i3 + 1] = 0;
        newArray[i3 + 2] = 0;
      }
    }

    particles.positions.push(newArray);

  }

  particles.geometry = new THREE.SphereGeometry(3);
  particles.geometry.setIndex(null);

  particles.material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: true,
    uniforms: {
      uSize: new THREE.Uniform(0.4),
      uResolution: new THREE.Uniform(
        new THREE.Vector2(
          size.width * size.pixelRatio,
          size.height * size.pixelRatio
        )
      ),
    },
  });
  const particlesMesh = new THREE.Points(
    particles.geometry,
    particles.material
  );
  scene.add(particlesMesh);
});

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
camera.position.set(0, 0, 18);
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

gui.addColor(debug, "clearColor").onChange(() => {
  renderer.setClearColor(debug.clearColor);
});
renderer.setClearColor(debug.clearColor);

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
  size.pixelRatio = Math.min(window.devicePixelRatio, 2);

  if (particles) {
    particles.material.uniforms.uResolution.value.set(
      size.width * size.pixelRatio,
      size.height * size.pixelRatio
    );
  }

  // 更新摄像机宽高比和投影矩阵
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();

  // 更新渲染器尺寸和像素比
  renderer.setSize(size.width, size.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
