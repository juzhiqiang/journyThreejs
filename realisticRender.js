/*
 * @Author: juzhiqiang
 * @Date: 2025-06-30 21:47:43
 * @LastEditors: juzhiqiang
 * @LastEditTime: 2025-07-11 15:54:26
 * @Description: 真实环境渲染
 *
 */
import * as THREE from "three";
import { Scene, TextureLoader } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { TextGeometry, Timer } from "three/examples/jsm/Addons.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { GroundedSkybox } from "three/examples/jsm/objects/GroundedSkybox.js";
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

// scene
const scene = new Scene();

/**
 * Models
 * @description: 模型加载
 */
gltfLoader.load("/models/FlightHelmet/glTF/FlightHelmet.gltf", (gltf) => {
  scene.add(gltf.scene);
});

/**
 * @description: 更新场景中所有材质的环境贴图强度
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      child.material.envMap = scene.environment;
      child.material.envMapIntensity = debugObject.envMapIntensity;
      child.material.needsUpdate = true;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

/**
 * @description: 环境贴图
 */
const environmentMap = cubeTextureLoader.load(
  [
    "/images/environmentMaps/0/px.png",
    "/images/environmentMaps/0/nx.png",
    "/images/environmentMaps/0/py.png",
    "/images/environmentMaps/0/ny.png",
    "/images/environmentMaps/0/pz.png",
    "/images/environmentMaps/0/nz.png",
  ],
  () => {
    scene.background = environmentMap;
    scene.environment = environmentMap;
    environmentMap.encoding = THREE.sRGBEncoding;
    updateAllMaterials();
  }
);

// light
// const ambientLight = new THREE.AmbientLight(0xffffff, 1);
// scene.add(ambientLight);

const directionLight = new THREE.DirectionalLight(0xffffff, 1);
directionLight.position.set(0.25, 3, -2.25);
directionLight.castShadow = true;
directionLight.shadow.mapSize.width = 1024;
directionLight.shadow.mapSize.height = 1024;
directionLight.shadow.camera.far = 10;
scene.add(directionLight);

// const directionLightHelper = new THREE.CameraHelper(
//   directionLight.shadow.camera
// );
// scene.add(directionLightHelper);

gui.add(directionLight, "intensity").min(-10).max(10).step(0.001);
gui.add(directionLight.position, "x").min(-10).max(10).step(0.001);
gui.add(directionLight.position, "y").min(-10).max(10).step(0.001);
gui.add(directionLight.position, "z").min(-10).max(10).step(0.001);
gui
  .add(debugObject, "envMapIntensity")
  .min(0)
  .max(10)
  .step(0.001)
  .onChange(updateAllMaterials);

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

gui.add(renderer, "toneMapping", {
  NoToneMapping: THREE.NoToneMapping,
  LinearToneMapping: THREE.LinearToneMapping,
  ReinhardToneMapping: THREE.ReinhardToneMapping,
  CineonToneMapping: THREE.CineonToneMapping,
  ACESFilmicToneMapping: THREE.ACESFilmicToneMapping,
});
gui.add(renderer, "toneMappingExposure").min(0).max(10).step(0.001);

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
