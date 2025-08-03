/*
 * @Author: juzhiqiang
 * @Date: 2025-06-30 21:47:43
 * @LastEditors: juzhiqiang
 * @LastEditTime: 2025-08-04 01:04:43
 * @Description: 烟花效果
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
import vertexShader from "../shaders/fireworks/vertex.glsl";
import fragmentShader from "../shaders/fireworks/fragment.glsl";
import gsap from "gsap";

/**
 *  debug
 * */
const gui = new dat.GUI();
const parameters = {
  color: "#70c1ff",
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

const textures = [
  textureLoader.load("/images/particles/1.png"),
  textureLoader.load("/images/particles/2.png"),
  textureLoader.load("/images/particles/3.png"),
  textureLoader.load("/images/particles/4.png"),
  textureLoader.load("/images/particles/5.png"),
  textureLoader.load("/images/particles/6.png"),
  textureLoader.load("/images/particles/7.png"),
  textureLoader.load("/images/particles/8.png"),
  textureLoader.load("/images/particles/9.png"),
  textureLoader.load("/images/particles/10.png"),
  textureLoader.load("/images/particles/11.png"),
  textureLoader.load("/images/particles/12.png"),
  textureLoader.load("/images/particles/13.png"),
];

/**
 * Object
 */
const createFirework = (count, position, sizes, texture, radius, color) => {
  const positionsArray = new Float32Array(count * 3);
  const sizesArray = new Float32Array(count);
  const timeMultiplierArray = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    const spherical = new THREE.Spherical(
      radius * (0.75 + Math.random() * 0.25),
      Math.random() * Math.PI,
      Math.random() * Math.PI * 2
    );

    const position = new THREE.Vector3();
    position.setFromSpherical(spherical);

    positionsArray[i3] = position.x;
    positionsArray[i3 + 1] = position.y;
    positionsArray[i3 + 2] = position.z;

    sizesArray[i] = Math.random();

    timeMultiplierArray[i] = 1 + Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positionsArray, 3)
  );
  geometry.setAttribute(
    "aSize",
    new THREE.Float32BufferAttribute(sizesArray, 1)
  );
  geometry.setAttribute(
    "aTimeMultiplier",
    new THREE.Float32BufferAttribute(sizesArray, 1)
  );

  texture.flipY = false;
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uSize: new THREE.Uniform(sizes),
      // 分辨率
      uResolution: new THREE.Uniform(size.resolution),
      uTexture: new THREE.Uniform(texture),
      uColor: new THREE.Uniform(color),
      uProgress: new THREE.Uniform(0),
    },
  });

  const firework = new THREE.Points(geometry, material);
  firework.position.copy(position);
  scene.add(firework);

  const destroy = () => {
    scene.remove(firework);
    geometry.dispose();
    material.dispose();
  };

  // 动画
  gsap.to(material.uniforms.uProgress, {
    value: 1,
    duration: 3,
    ease: "linear",
    onComplete: destroy,
  });
};

const createRandomFirework = () => {
  const count = Math.round(400 + Math.random() * 1000);
  const position = new THREE.Vector3(
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2
  );
  const size = 0.1 + Math.random() * 0.1;
  const radius = 0.5 + Math.random();
  const color = new THREE.Color();
  color.setHSL(Math.random(), 1, 0.5);

  createFirework(
    count,
    position,
    size,
    textures[Math.floor(Math.random() * textures.length)],
    radius,
    color
  );
};

window.addEventListener("click", () => {
  createRandomFirework();
});

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
renderer.setPixelRatio(size.pixelRatio);
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

// sky
const sky = new Sky();
sky.scale.setScalar(45000);
scene.add(sky);

const sun = new THREE.Vector3();

const skyParameters = {
  turbidity: 10,
  rayleigh: 3,
  mieCoefficient: 0.005,
  mieDirectionalG: 0.95,
  elevation: -2.2,
  azimuth: 180,
  exposure: renderer.toneMappingExposure,
};

const updateSky = () => {
  const uniforms = sky.material.uniforms;
  uniforms["turbidity"].value = skyParameters.turbidity;
  uniforms["rayleigh"].value = skyParameters.rayleigh;
  uniforms["mieCoefficient"].value = skyParameters.mieCoefficient;
  uniforms["mieDirectionalG"].value = skyParameters.mieDirectionalG;

  const phi = THREE.MathUtils.degToRad(90 - skyParameters.elevation);
  const theta = THREE.MathUtils.degToRad(skyParameters.azimuth);

  sun.setFromSphericalCoords(1, phi, theta);

  uniforms["sunPosition"].value.copy(sun);

  renderer.toneMappingExposure = skyParameters.exposure;
  renderer.render(scene, camera);
};

gui.add(skyParameters, "turbidity", 0.0, 20.0, 0.1).onChange(updateSky);
gui.add(skyParameters, "rayleigh", 0.0, 4, 0.001).onChange(updateSky);
gui.add(skyParameters, "mieCoefficient", 0.0, 0.1, 0.001).onChange(updateSky);
gui.add(skyParameters, "mieDirectionalG", 0.0, 1, 0.001).onChange(updateSky);
gui.add(skyParameters, "elevation", -3, 10, 0.01).onChange(updateSky);
gui.add(skyParameters, "azimuth", -180, 180, 0.1).onChange(updateSky);
gui.add(skyParameters, "exposure", 0, 1, 0.0001).onChange(updateSky);

updateSky();

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
  size.resolution.set(
    size.width * size.pixelRatio,
    size.height * size.pixelRatio
  );

  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();

  renderer.setSize(size.width, size.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
