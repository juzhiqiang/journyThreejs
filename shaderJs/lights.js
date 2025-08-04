/*
 * @Author: juzhiqiang
 * @Date: 2025-06-30 21:47:43
 * @LastEditors: juzhiqiang
 * @LastEditTime: 2025-08-04 21:31:33
 * @Description: 光照阴影效果
 *
 */
import * as THREE from "three";
import { Scene, TextureLoader } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { TextGeometry, Timer } from "three/examples/jsm/Addons.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import vertexShader from "../shaders/lights/vertex.glsl";
import fragmentShader from "../shaders/lights/fragment.glsl";
import gsap from "gsap";

/**
 *  debug
 * */
const gui = new dat.GUI();
const debug = {
  ambientLight: {
    color: new THREE.Color("#ffffff"),
    intensity: 0.03,
  },
  directionalLight: {
    color: new THREE.Color("#5959ff"),
    intensity: 1,
    specularPower: 20,
  },
  pointLight1: {
    color: new THREE.Color("#ff5959"),
    intensity: 1,
    specularPower: 20,
    decay: 0.25,
  },
  pointLight2: {
    color: new THREE.Color("#59ffbc"),
    intensity: 1,
    specularPower: 20,
    decay: 0.25,
  },
};

// size
const size = {
  width: window.innerWidth,
  height: window.innerHeight,

  pixelRatio: Math.min(window.devicePixelRatio, 2),
};
size.resolution = new THREE.Vector2(
  window.innerWidth * size.pixelRatio,
  window.innerHeight * size.pixelRatio
);
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
const materialParameters = {}
materialParameters.color = '#ffffff'
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uColor: new THREE.Uniform(new THREE.Color(materialParameters.color)),

    uAmbientLightColor: new THREE.Uniform(debug.ambientLight.color),
    uAmbientLightIntensity: new THREE.Uniform(debug.ambientLight.intensity),

    uDirectionalLightPosition: new THREE.Uniform(new THREE.Vector3(0, 0, 3)),
    uDirectionalLightColor: new THREE.Uniform(debug.directionalLight.color),
    uDirectionalLightIntensity: new THREE.Uniform(
      debug.directionalLight.intensity
    ),
    uDirectionalLightSpecularPower: new THREE.Uniform(
      debug.directionalLight.specularPower
    ),

    uPointLight1Position: new THREE.Uniform(new THREE.Vector3(0, 2.5, 0)),
    uPointLight1Color: new THREE.Uniform(debug.pointLight1.color),
    uPointLight1Intensity: new THREE.Uniform(debug.pointLight1.intensity),
    uPointLight1SpecularPower: new THREE.Uniform(
      debug.pointLight1.specularPower
    ),
    uPointLight1Decay: new THREE.Uniform(debug.pointLight1.decay),

    uPointLight2Position: new THREE.Uniform(new THREE.Vector3(2, 2, 2)),
    uPointLight2Color: new THREE.Uniform(debug.pointLight2.color),
    uPointLight2Intensity: new THREE.Uniform(debug.pointLight2.intensity),
    uPointLight2SpecularPower: new THREE.Uniform(
      debug.pointLight2.specularPower
    ),
    uPointLight2Decay: new THREE.Uniform(debug.pointLight2.decay),
  },
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

// Suzanne
let suzanne = null;
gltfLoader.load("/models/hologram/suzanne.glb", (gltf) => {
  suzanne = gltf.scene;
  suzanne.traverse((child) => {
    if (child.isMesh) child.material = material;
  });
  scene.add(suzanne);
});

const directionalLightHelper = new THREE.Mesh(
  new THREE.PlaneGeometry(),
  new THREE.MeshBasicMaterial({})
);
directionalLightHelper.material.color.setRGB(0.1, 0.1, 1);
directionalLightHelper.material.side = THREE.DoubleSide;
directionalLightHelper.position.set(0, 0, 3);
scene.add(directionalLightHelper);

const pointLightHelper = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.1, 2),
  new THREE.MeshBasicMaterial({})
);
pointLightHelper.material.color.setRGB(1, 0.1, 0.1);
pointLightHelper.material.side = THREE.DoubleSide;
pointLightHelper.position.set(0, 2.5, 0);
scene.add(pointLightHelper);

const pointLight2Helper = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.1, 2),
  new THREE.MeshBasicMaterial()
);
pointLight2Helper.material.color.set(debug.pointLight2.color);
pointLight2Helper.position.copy(material.uniforms.uPointLight2Position.value);
scene.add(pointLight2Helper);

// Light helpers
const ambientLightFolder = gui.addFolder("ambient light");
ambientLightFolder.addColor(debug.ambientLight, "color");
ambientLightFolder
  .add(debug.ambientLight, "intensity")
  .min(0)
  .max(10)
  .step(0.01);
ambientLightFolder.onChange(() => {
  material.uniforms.uAmbientLightColor.value.set(debug.ambientLight.color);
  material.uniforms.uAmbientLightIntensity.value = debug.ambientLight.intensity;
});

const directionalLightFolder = gui.addFolder("directional light");
directionalLightFolder.addColor(debug.directionalLight, "color");
directionalLightFolder
  .add(debug.directionalLight, "intensity")
  .min(0)
  .max(10)
  .step(0.01);
directionalLightFolder
  .add(debug.directionalLight, "specularPower")
  .min(0)
  .max(50);
directionalLightFolder.onChange(() => {
  directionalLightHelper.material.color.set(debug.directionalLight.color);
  material.uniforms.uDirectionalLightColor.value.set(
    debug.directionalLight.color
  );
  material.uniforms.uDirectionalLightIntensity.value =
    debug.directionalLight.intensity;
  material.uniforms.uDirectionalLightSpecularPower.value =
    debug.directionalLight.specularPower;
});

const pointLight1Folder = gui.addFolder("point light 1");
pointLight1Folder.addColor(debug.pointLight1, "color");
pointLight1Folder.add(debug.pointLight1, "intensity").min(0).max(10).step(0.01);
pointLight1Folder.add(debug.pointLight1, "specularPower").min(0).max(50);
pointLight1Folder.add(debug.pointLight1, "decay").min(0).max(10).step(0.01);
pointLight1Folder.onChange(() => {
  pointLightHelper.material.color.set(debug.pointLight1.color);
  material.uniforms.uPointLight1Color.value.set(debug.pointLight1.color);
  material.uniforms.uPointLight1Intensity.value = debug.pointLight1.intensity;
  material.uniforms.uPointLight1SpecularPower.value =
    debug.pointLight1.specularPower;
  material.uniforms.uPointLight1Decay.value = debug.pointLight1.decay;
});

const pointLight2Folder = gui.addFolder("point light 2");
pointLight2Folder.addColor(debug.pointLight2, "color");
pointLight2Folder.add(debug.pointLight2, "intensity").min(0).max(10).step(0.01);
pointLight2Folder.add(debug.pointLight2, "specularPower").min(0).max(50);
pointLight2Folder.add(debug.pointLight2, "decay").min(0).max(10).step(0.01);
pointLight2Folder.onChange(() => {
  pointLight2Helper.material.color.set(debug.pointLight2.color);
  material.uniforms.uPointLight2Color.value.set(debug.pointLight2.color);
  material.uniforms.uPointLight2Intensity.value = debug.pointLight2.intensity;
  material.uniforms.uPointLight2SpecularPower.value =
    debug.pointLight2.specularPower;
  material.uniforms.uPointLight2Decay.value = debug.pointLight2.decay;
});

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
renderer.setPixelRatio(size.pixelRatio);
// 设置光照遵循物理世界计算规律
renderer.physicallyCorrectLights = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
// 设置渲染器的色调映射算法为 ACES Filmic。ACES（Academy Color Encoding System）
// 是电影行业常用的色彩编码系统，Filmic 模式能提供更自然、电影级别的色彩映射效果，
// // 使画面在高亮和暗部区域都能保持较好的细节和色彩过渡。
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// // 映射曝光
// renderer.toneMappingExposure = 1.5;

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

  if (suzanne) {
    suzanne.rotation.x = -elapsedTIme * 0.1;
    suzanne.rotation.y = elapsedTIme * 0.2;
  }

  sphere.rotation.x = -elapsedTIme * 0.1;
  sphere.rotation.y = elapsedTIme * 0.2;

  torusKnot.rotation.x = -elapsedTIme * 0.1;

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
