/*
 * @Author: juzhiqiang
 * @Date: 2025-06-30 21:47:43
 * @LastEditors: juzhiqiang
 * @LastEditTime: 2025-07-17 23:47:42
 * @Description: 着色器
 *
 */
import * as THREE from "three";
import { Scene, TextureLoader } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { TextGeometry, Timer } from "three/examples/jsm/Addons.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import testVertexShader from "./shaders/test/vertex.glsl";
import testFragmentShader from "./shaders/test/fragment.glsl";

/**
 *  debug
 * */
const gui = new dat.GUI();
const debugObject = {
  envMapIntensity: 1,
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
const geometry = new THREE.PlaneGeometry(3, 2, 32, 32);

const count = geometry.attributes.position.count;
const random = new Float32Array(count);

for (let i = 0; i < count; i++) {
  random[i] = Math.random();
}

// 添加随机属性到顶点位置数据中
geometry.setAttribute("aRandom", new THREE.BufferAttribute(random, 1));

/**
 * 如果使用ShaderMaterial，下列属性不需要写入shader中，自带了。
 * projectMatrix 用于将顶点坐标从模型空间转换到裁剪空间的矩阵。
 * viewMatrix 用于将顶点坐标从世界空间转换到视图空间的矩阵。
 * modelMatrix 用于将顶点坐标从局部空间转换到世界空间的矩阵。
 * position 用于存储顶点在模型空间中的位置。
 * uv 用于存储顶点在纹理空间中的坐标。
 * precision 对于顶点着色器来说，precision highp float; 是一个常见的设置，它指定了浮点数的精度为高精度。
 *  */
const material = new THREE.RawShaderMaterial({
  vertexShader: testVertexShader,
  fragmentShader: testFragmentShader,
  side: THREE.DoubleSide,
  transparent: true,
  // 测试3使用
  uniforms: {
    uFrequency: { value: new THREE.Vector2(5, 2) },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("pink") },
    uTexture: { value: image },
  },
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

gui.add(material.uniforms.uFrequency.value, "x").min(0).max(50).step(0.1);
gui.add(material.uniforms.uFrequency.value, "y").min(0).max(50).step(0.1);

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

  // 测试3使用
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
