/*
 * @Author: juzhiqiang
 * @Date: 2025-06-30 21:47:43
 * @LastEditors: juzhiqiang
 * @LastEditTime: 2025-08-02 23:01:55
 * @Description: 全息效果(菲涅尔效果)
 *
 */
import * as THREE from "three";
import { Scene, TextureLoader } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { TextGeometry, Timer } from "three/examples/jsm/Addons.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import vertexShader from "../shaders/hologram/vertex.glsl";
import fragmentShader from "../shaders/hologram/fragment.glsl";
/**
 *  debug
 * */
const gui = new dat.GUI();
const parameters = {
  backgroundColor: "#1d1f2a",
  color: '#70c1ff'
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

// scene
const scene = new Scene();

/**
 * Object
 */
const material = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  transparent: true,
  side: THREE.DoubleSide,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: {
    uTime: new THREE.Uniform(0),
    uColor: new THREE.Uniform(new THREE.Color(parameters.color)),
  },
});

gui.addColor(parameters, "color").onChange((e) => {
  material.uniforms.uColor.value = new THREE.Color(e);
});

let suzanne;
gltfLoader.load("/models/hologram/suzanne.glb", (gltf) => {
  suzanne = gltf.scene;
  scene.add(suzanne);
  suzanne.children[0].material = material;
});

// Torus knot
const torusKnot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.6, 0.25, 128, 32),
  material
);
torusKnot.position.x = 3;
scene.add(torusKnot);

// Sphere
const sphere = new THREE.Mesh(new THREE.SphereGeometry(), material);
sphere.position.x = -3;
scene.add(sphere);

// light
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionLight = new THREE.DirectionalLight(0xffffff, 1);
directionLight.position.set(1, 5, 0);
directionLight.castShadow = true;
scene.add(directionLight);

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  size.width / size.height,
  0.001,
  100000
);
camera.position.z = 10;
camera.position.y = 3;
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
renderer.setClearColor(parameters.backgroundColor);

gui.addColor(parameters, "backgroundColor").onChange((color) => {
  renderer.setClearColor(color);
});

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

  if (suzanne) {
    suzanne.rotation.x = -elapsedTIme * 0.1;
    suzanne.rotation.y = elapsedTIme * 0.2;
  }

  sphere.rotation.x = -elapsedTIme * 0.1;
  sphere.rotation.y = elapsedTIme * 0.2;

  torusKnot.rotation.x = -elapsedTIme * 0.1;
  torusKnot.rotation.y = elapsedTIme * 0.2;

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
