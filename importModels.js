/*
 * @Author: juzhiqiang
 * @Date: 2025-06-30 21:47:43
 * @LastEditors: juzhiqiang
 * @LastEditTime: 2025-07-04 18:32:06
 * @Description:
 *
 */
import * as THREE from "three";
import { Scene, TextureLoader } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { TextGeometry, Timer } from "three/examples/jsm/Addons.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

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

// textureLoader
const textureLoader = new THREE.TextureLoader();

/**
 * @description: loaders
 */
const gltfLoader = new GLTFLoader();
gltfLoader.load(
  "/models/Duck/glTF/Duck.gltf",
  (gltf) => {
    scene.add(gltf.scene);
  },
  (progress) => {
    console.log("progress", progress);
  },
  () => {
    console.log('error')
  }
);

/**
 * @description: objects
 */
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({})
);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true; // 接收阴影
scene.add(plane);

// light
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionLight = new THREE.DirectionalLight(0xffffff, 1);
directionLight.position.set(5, 3, 2);
scene.add(directionLight);
directionLight.castShadow = true; // 开启阴影

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
// Animations
const tick = () => {
  controls.update();
  time.update();
  const deltaTime = time.getDelta();

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
