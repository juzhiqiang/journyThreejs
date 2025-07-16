import * as THREE from "three";
import { Scene, TextureLoader } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { Timer } from "three/examples/jsm/Addons.js";
import { mx_bilerp_0 } from "three/src/nodes/materialx/lib/mx_noise.js";

/**
 *  debug
 * */
const gui = new dat.GUI();

// size
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// canvas
const dom = document.querySelector("#canvas");

// scene
const scene = new Scene();

// texture
const textureLoader = new TextureLoader();
const gradientTexture = textureLoader.load("images/textures/gradients/3.jpg");
gradientTexture.magFilter = THREE.NearestFilter;
/**
 * object
 * */
const parameters = {
  materialColor: "#1ab798",
};
const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture,
});

const objectDistance = 4;
const box = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material);
scene.add(box);

const mesh1 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material);
scene.add(mesh1);

const mesh2 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  material
);
scene.add(mesh2);

box.position.y = -objectDistance * 0;
mesh1.position.y = -objectDistance * 1;
mesh2.position.y = -objectDistance * 2;

const sectionMeshes = [box, mesh1, mesh2];

const particlesCount = 2000;
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 1] =
    objectDistance * 0.5 -
    Math.random() * objectDistance * sectionMeshes.length;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

const particlesMaterial = new THREE.PointsMaterial({
  color: parameters.materialColor,
  sizeAttenuation: true,
  size: 0.03,
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

gui.addColor(parameters, "materialColor").onFinishChange((e) => {
  material.color.set(parameters.materialColor);
  particlesMaterial.color.set(parameters.materialColor);
});

// light
const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
scene.add(ambientLight);

const directionLight = new THREE.DirectionalLight("#ffffff", 1);
directionLight.position.set(1, 1, 0);
scene.add(directionLight);

// camera
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

const camera = new THREE.PerspectiveCamera(
  35,
  size.width / size.height,
  0.001,
  100000
);
camera.position.z = 6;
cameraGroup.add(camera);

camera.lookAt(new THREE.Vector3(0, 0, 0));

//  axes
const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);

// renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: dom,
  alpha: true,
});
renderer.setClearAlpha(0);
renderer.setSize(size.width, size.height);
// 需要限制像素比 建议不大于2 大于2可能增加性能损耗,更多渲染
// 原则上像素比越大效果越好,需要与性能平衡
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// const controls = new OrbitControls(camera, renderer.domElement);

/**
 * scroll
 */
let scrollY = window.scrollY;

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
});

/**
 * cursor
 */
const cursor = { x: 0, y: 0 };

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / size.width - 0.5;
  cursor.y = event.clientY / size.height - 0.5;
});

/**
 * fix: 这个方法修复了之前 new THREE.Clock 多动画，以及tab切换导致计时器累加导致数值巨大问题
 * */
const timer = new Timer();
let previousTime = 0;

// Animations
const tick = () => {
  // controls.update();
  timer.update();
  const elapsedTime = timer.getElapsed();
  let deltaTIme = elapsedTime - previousTime;
  if (isNaN(deltaTIme)) {
    previousTime = 0;
  } else {
    previousTime = deltaTIme;
  }
  camera.position.y = (-scrollY / size.height) * objectDistance;

  const parallaxX = cursor.x * 0.5;
  const parallaxY = -cursor.y * 0.5;

  cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 0.5;
  cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 0.5;

  sectionMeshes.forEach((mesh) => {
    mesh.rotation.x = 0.1 * elapsedTime;
    mesh.rotation.y = 0.12 * elapsedTime;
  });

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

window.addEventListener("dblclick", (e) => {
  console.log(document.fullscreenElement);
  if (!document.fullscreenElement) {
    canvas.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});
