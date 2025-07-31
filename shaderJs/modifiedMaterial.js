/*
 * @Author: juzhiqiang
 * @Date: 2025-06-30 21:47:43
 * @LastEditors: juzhiqiang
 * @LastEditTime: 2025-07-31 22:57:33
 * @Description: 着色器粒子修改现有材质
 *
 */
import * as THREE from "three";
import { Scene, TextureLoader } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { TextGeometry, Timer } from "three/examples/jsm/Addons.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import testVertexShader from "../shaders/animateGalaxy/vertex.glsl";
import testFragmentShader from "../shaders/animateGalaxy/fragment.glsl";

/**
 *  debug
 * */
const gui = new dat.GUI();
const parameters = {};

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

const environmentMapTexture = cubeTextureLoader.load([
  "/images/environmentMaps/3/px.jpg",
  "/images/environmentMaps/3/nx.jpg",
  "/images/environmentMaps/3/py.jpg",
  "/images/environmentMaps/3/ny.jpg",
  "/images/environmentMaps/3/pz.jpg",
  "/images/environmentMaps/3/nz.jpg",
]);
const mapTexture = textureLoader.load("/models/LeePerrySmith/color.jpg");
mapTexture.encoding = THREE.sRGBEncoding;
const normalTexture = textureLoader.load("/models/LeePerrySmith/normal.jpg");

scene.environment = environmentMapTexture;
scene.background = environmentMapTexture;

/**
 * Object
 */
const material = new THREE.MeshStandardMaterial({
  map: mapTexture,
  normalMap: normalTexture,
});

const depthMaterial = new THREE.MeshDepthMaterial({
  depthPacking: THREE.RGBADepthPacking,
});
const customUniforms = {
  uTime: { value: 0 },
};

material.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = customUniforms.uTime;
  shader.vertexShader = shader.vertexShader.replace(
    "#include <common>",
    `
      #include <common>
      
      uniform float uTime;
      mat2 get2dRotateMatrix(float _angle) {
        return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
      }
    `
  );
  shader.vertexShader = shader.vertexShader.replace(
    "#include <beginnormal_vertex>",
    `#include <beginnormal_vertex>
      
      float angle = sin(position.y + uTime) * 0.2;
      mat2 rotateMatrix = get2dRotateMatrix(angle);

      // 旋转法线，使其与顶点旋转保持一致
      objectNormal.xz = rotateMatrix * objectNormal.xz;
      `
  );
  shader.vertexShader = shader.vertexShader.replace(
    "#include <begin_vertex>",
    `#include <begin_vertex>
      
      // 修复阴影旋转时候有相同定义直接使用即可
      // float angle = (position.y + uTime) * 0.2;
      // mat2 rotateMatrix = get2dRotateMatrix(angle);

      transformed.xz =rotateMatrix * transformed.xz ;
    `
  );
};

depthMaterial.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = customUniforms.uTime;
  shader.vertexShader = shader.vertexShader.replace(
    "#include <common>",
    `
      #include <common>
      
      uniform float uTime;
      mat2 get2dRotateMatrix(float _angle) {
        return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
      }
    `
  );
  shader.vertexShader = shader.vertexShader.replace(
    "#include <begin_vertex>",
    `#include <begin_vertex>
      
      float angle = sin(position.y + uTime) * 0.2;
      mat2 rotateMatrix = get2dRotateMatrix(angle);

      transformed.xz =rotateMatrix * transformed.xz ;
    `
  );
};

gltfLoader.load("/models/LeePerrySmith/LeePerrySmith.glb", (gltf) => {
  const model = gltf.scene.children[0];
  model.scale.set(0.6, 0.6, 0.6);
  model.rotation.y = Math.PI * 0.5;
  model.material = material;
  // 修复修改着色器后阴影不正确问题
  model.customDepthMaterial = depthMaterial;

  gltf.scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      child.material.envMapIntensity = 1;
      child.material.needsUpdate = true;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  scene.add(model);
});

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(15, 15, 15),
  new THREE.MeshStandardMaterial()
);
plane.receiveShadow = true;
plane.rotation.y = Math.PI;
plane.position.y = -5;
plane.position.z = 5;
scene.add(plane);

// light
// const ambientLight = new THREE.AmbientLight(0xffffff, 1);
// scene.add(ambientLight);

const directionLight = new THREE.DirectionalLight('#ffffff', 0.5);
directionLight.position.set(1, 3, 0);
directionLight.castShadow = true;
directionLight.shadow.mapSize.set(1024, 1024);
directionLight.shadow.camera.far = 15;
directionLight.shadow.normalBias = 0.05;
directionLight.position.set(0.25, 2, -2.25);
scene.add(directionLight);

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  size.width / size.height,
  0.001,
  100000
);
camera.position.set(4, 1, -4);
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

  customUniforms.uTime.value = elapsedTIme;

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
