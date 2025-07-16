/*
 * @Author: juzhiqiang
 * @Date: 2025-06-30 21:47:43
 * @LastEditors: juzhiqiang
 * @LastEditTime: 2025-07-11 12:24:14
 * @Description: 环境贴图
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

// scene
const scene = new Scene();

/**
 * @description: 环境贴图
 */
// const environmentMap = cubeTextureLoader.load([
//   "/images/textures/environmentMaps/1/px.png",
//   "/images/textures/environmentMaps/1/nx.png",
//   "/images/textures/environmentMaps/1/py.png",
//   "/images/textures/environmentMaps/1/ny.png",
//   "/images/textures/environmentMaps/1/pz.png",
//   "/images/textures/environmentMaps/1/nz.png",
// ]);
// scene.background = environmentMap;
// scene.environment = environmentMap;

/**
 * @description: rgbeLoader 加载hdr格式的环境贴图
 */
rgbeLoader.load(
  "/resources/textures/environmentMap/2k.hdr",
  (environmentMap) => {
    environmentMap.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = environmentMap;
    // scene.environment = environmentMap;
  }
);

// 伪造灯光 holy donut 制造实时环境贴图
const holyDonut = new THREE.Mesh(
  new THREE.TorusGeometry(8, 0.5),
  new THREE.MeshBasicMaterial({
    color: new THREE.Color(100,0,100),
  })
);
holyDonut.position.set(0, -3.5, 0);
holyDonut.layers.enable(1);
scene.add(holyDonut);

const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
  type: THREE.HalfFloatType,
});
scene.environment = cubeRenderTarget.texture;

const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
// 只看第一层，解除模型中反射模型的bug
cubeCamera.layers.set(1);

// 将环境贴图的映射方式设置为等距柱状投影反射映射
// const ldrEquirectangularMap = textureLoader.load(
//   "/images/environmentMaps/blockadesLabsSkybox/anime_art_style_japan_streets_with_cherry_blossom_.jpg",
//   () => {
//     // 环境贴图的映射方式设置为等距柱状投影反射映射
//     ldrEquirectangularMap.mapping = THREE.EquirectangularReflectionMapping;
//     ldrEquirectangularMap.colorSpace = THREE.SRGBColorSpace;
//     scene.background = ldrEquirectangularMap;
//     scene.environment = ldrEquirectangularMap;
//   }
// );

// 让物体贴在环境贴图底部，不是悬浮在空中
// rgbeLoader.load("/images/environmentMaps/2/2k.hdr", (environmentMap) => {
//   environmentMap.mapping = THREE.EquirectangularReflectionMapping;
//   scene.environment = environmentMap;

//   // Skybox
//   const skybox = new GroundedSkybox(environmentMap, 11, 120);
//   skybox.scale.setScalar(50);
//   scene.add(skybox);
// });
// rgbeLoader.load("/images/environmentMaps/2/2k.hdr", (environmentMap) => {
//   environmentMap.mapping = THREE.EquirectangularReflectionMapping;
//   scene.environment = environmentMap;

//   // Skybox 视差概念
//   const skybox = new GroundedSkybox(environmentMap, 11, 120);
//   skybox.scale.setScalar(50);
//   skybox.scale.y = 0.1
//   scene.add(skybox);

//   console.log(skybox)

//   gui.add(skybox.scale, "y", 0, 200, 0.001);
//   gui.add(skybox.scale, "z", 1, 200, 0.01);
// });
// 环境贴图背景的模糊度.只越大越模糊0~1
// scene.backgroundBlurriness = 0.1;
// 环境贴图背景的曝光度
// scene.backgroundIntensity = 5;

/**
 * @description: objects
 */
const object1 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.8,
    roughness: 0.1,
  })
);
object1.position.set(-2, 0, 0);

const object2 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.8,
    roughness: 0.1,
  })
);
object2.position.set(2, 0, 0);

scene.add(object1, object2);

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
    }
  });
};

gui
  .add(debugObject, "envMapIntensity")
  .min(0)
  .max(10)
  .step(0.001)
  .onChange(updateAllMaterials);
gui.add(scene, "backgroundBlurriness").min(0).max(1).step(0.001);
gui.add(scene, "backgroundIntensity").min(0).max(10).step(0.001);

const gltfLoader = new GLTFLoader();
gltfLoader.load("/models/FlightHelmet/glTF/FlightHelmet.gltf", (gltf) => {
  gltf.scene.scale.set(10, 10, 10);
  gltf.scene.position.set(0, -4, 0);
  gltf.scene.rotation.y = Math.PI * 0.5;
  scene.add(gltf.scene);
  gui
    .add(gltf.scene.rotation, "y")
    .min(-Math.PI)
    .max(Math.PI)
    .step(0.001)
    .name("rotationY");

  updateAllMaterials();
});

// light
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

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

camera.lookAt(new THREE.Vector3(0, 0, 0));

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
// 需要限制像素比 建议不大于2 大于2可能增加性能损耗,更多渲染
// 原则上像素比越大效果越好,需要与性能平衡
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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

  if (holyDonut) {
    holyDonut.rotation.x = elapsedTIme;
    cubeCamera.update(renderer, scene);
  }

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
