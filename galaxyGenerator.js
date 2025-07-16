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

// scene
const scene = new Scene();

// texture
const textureLoader = new TextureLoader();
const particleTexture = textureLoader.load(
  "/images/particles/2.png",
  () => {
    console.log("纹理加载成功");
    generateGalaxy(); // 纹理加载成功后重新生成星系
  },
  undefined,
  (error) => {
    console.error("纹理加载失败:", error);
  }
);

/**
 * object
 * */
const parameters = {
  size: 0.02,
  radius: 5,
  branches: 3,
  //   旋转值
  spin: 1,
  randomness: 0.1,
  //   指数
  randomnessPower: 3,
  insideColor: "#ff6030",
  outsideColor: "#1b3984",
};
parameters.count = 100000;

let geometry = null;
let material = null;
let mesh = null;

const generateGalaxy = () => {
  if (mesh !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(mesh);
    mesh = null;
  }

  geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);
  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;
    const radius = Math.random() * parameters.radius;
    // 旋转
    const spinAngle = radius * parameters.spin;
    // 分段
    const angle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);

    const mixColor = colorInside.clone();
    mixColor.lerp(colorOutside, radius / parameters.radius);

    colors[i3] = mixColor.r;
    colors[i3 + 1] = mixColor.g;
    colors[i3 + 2] = mixColor.b;

    positions[i3] = Math.cos(angle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(angle + spinAngle) * radius + randomZ;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    vertexColors: true,
    depthWrite: false,
    transparent: true,
    blending: THREE.AdditiveBlending,
  });
 material.needsUpdate = true;

  mesh = new THREE.Points(geometry, material);
  scene.add(mesh);
};

gui.add(parameters, "count", 100, 1000000, 100).onFinishChange(generateGalaxy);
gui.add(parameters, "size", 0.001, 0.1, 0.0001).onFinishChange(generateGalaxy);
gui.add(parameters, "radius", 0.01, 20, 0.01).onFinishChange(generateGalaxy);
gui.add(parameters, "branches", 2, 20, 1).onFinishChange(generateGalaxy);
gui.add(parameters, "spin", -5, 5, 0.01).onFinishChange(generateGalaxy);
gui.add(parameters, "randomness", 0, 1, 0.01).onFinishChange(generateGalaxy);
gui
  .add(parameters, "randomnessPower", 1, 5, 0.01)
  .onFinishChange(generateGalaxy);
gui.addColor(parameters, "insideColor").onFinishChange(generateGalaxy);
gui.addColor(parameters, "outsideColor").onFinishChange(generateGalaxy);

// const box = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1),
//     new THREE.MeshBasicMaterial()
// )
// scene.add(box)

// light
const ambientLight = new THREE.AmbientLight("#223344", 0.08);
scene.add(ambientLight);

const directionLight = new THREE.DirectionalLight("#335577", 0.5);
directionLight.position.set(3, 2, -8);
scene.add(directionLight);

// camera
const camera = new THREE.PerspectiveCamera(
  45,
  size.width / size.height,
  0.001,
  100000
);
camera.position.z = 8;
camera.position.y = 10;
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
// 需要限制像素比 建议不大于2 大于2可能增加性能损耗,更多渲染
// 原则上像素比越大效果越好,需要与性能平衡
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
const controls = new OrbitControls(camera, renderer.domElement);

/**
 * fix: 这个方法修复了之前 new THREE.Clock 多动画，以及tab切换导致计时器累加导致数值巨大问题
 * */
const timer = new Timer();
// Animations
const tick = () => {
  controls.update();
  timer.update();
  const elapsedTime = timer.getElapsed();

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
