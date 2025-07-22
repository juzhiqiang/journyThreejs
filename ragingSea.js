/*
 * @Author: juzhiqiang
 * @Date: 2025-06-30 21:47:43
 * @LastEditors: juzhiqiang
 * @LastEditTime: 2025-07-23 01:18:22
 * @Description: 着色器大海
 *
 */
import * as THREE from "three";
import { Scene, TextureLoader } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { TextGeometry, Timer } from "three/examples/jsm/Addons.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import testVertexShader from "./shaders/water/vertex.glsl";
import testFragmentShader from "./shaders/water/fragment.glsl";

/**
 *  debug
 * */
const gui = new dat.GUI();
const debugObject = {
  depthColor: "#186691",
  surfaceColor: "#9bd8ff",
};

// size
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const cursor = {
  x: 0,
  y: 0,
};
window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / size.width - 0.5;
  cursor.y = -(event.clientY / size.height - 0.5);
});

// canvas
const dom = document.querySelector("#canvas");

/**
 * Loader
 */
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const rgbeLoader = new RGBELoader();
const gltfLoader = new GLTFLoader();

const image = textureLoader.load("/images/textures/chain.png", (texture) => {
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
});

// scene
const scene = new Scene();

/**
 * Object
 */
const geometry = new THREE.PlaneGeometry(2, 2, 512, 512);

const count = geometry.attributes.position.count;
const random = new Float32Array(count);

for (let i = 0; i < count; i++) {
  random[i] = Math.random();
}

// 添加随机属性到顶点位置数据中
geometry.setAttribute("aRandom", new THREE.BufferAttribute(random, 1));

const material = new THREE.ShaderMaterial({
  vertexShader: testVertexShader,
  fragmentShader: testFragmentShader,
  side: THREE.DoubleSide,
  uniforms: {
    uTime: { value: 0.0 },
    uBigWavesSpeed: { value: 0.2 },
    uBigWavesElevation: { value: 0.2 },
    uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },

    uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
    uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
    uColorOffset: { value: 0.08 },
    uColorMultiplier: { value: 5.0 },

    uSmallWavesElevation: { value: 0.15 },
    uSmallWavesFrequency: { value: 3.0 },
    uSmallWavesSpeed: { value: 0.2 },
    uSmallWavesIterations: { value: 4.0 },
  },
});
const mesh = new THREE.Mesh(geometry, material);
mesh.rotation.x = Math.PI / 2;
scene.add(mesh);

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
  .name("深度颜色");
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
gui.add(material.uniforms.uSmallWavesElevation, "value").min(0).max(1).step(0.001).name("小波浪高度");
gui.add(material.uniforms.uSmallWavesFrequency, "value").min(0).max(10).step(0.001).name("小波浪频率");
gui.add(material.uniforms.uSmallWavesSpeed, "value").min(0).max(10).step(0.001).name("小波浪速度");
gui.add(material.uniforms.uSmallWavesIterations, "value").min(0).max(10).step(0.001).name("小波浪迭代");

// light
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionLight = new THREE.DirectionalLight(0xffffff, 1);
directionLight.position.set(1, 3, 0);
directionLight.castShadow = true;
scene.add(directionLight);

// camera
const camera = new THREE.PerspectiveCamera(
  45,
  size.width / size.height,
  0.001,
  100000
);
camera.position.z = 5;
camera.position.y = 6;
scene.add(camera);

//  axes
const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);

// renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: dom,
});
renderer.setSize(size.width, size.height);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// 需要限制像素比 建议不大于2 大于2可能增加性能损耗,更多渲染
// 原则上像素比越大效果越好,需要与性能平衡
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// 设置光照遵循物理世界计算规律
renderer.physicallyCorrectLights = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
// 设置渲染器的色调映射算法为 ACES Filmic。ACES（Academy Color Encoding System）
// 是电影行业常用的色彩编码系统，Filmic 模式能提供更自然、电影级别的色彩映射效果，
// 使画面在高亮和暗部区域都能保持较好的细节和色彩过渡。
renderer.toneMapping = THREE.ACESFilmicToneMapping;
// 映射曝光
renderer.toneMappingExposure = 1.5;

const controls = new OrbitControls(camera, renderer.domElement);

// time
const time = new Timer();
/**
 * @description: 动画循环
 */
const tick = () => {
  controls.update();
  time.update();
  const deltaTime = time.getDelta();
  const elapsedTIme = time.getElapsed();

  material.uniforms.uTime.value = elapsedTIme;

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();

window.addEventListener("resize", () => {
  size.width = window.innerWidth;
  size.height = window.innerHeight;

  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();

  renderer.setSize(size.width, size.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
