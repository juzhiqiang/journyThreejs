/*
 * @Author: juzhiqiang
 * @Date: 2025-06-30 21:47:43
 * @LastEditors: juzhiqiang
 * @LastEditTime: 2025-07-09 11:17:19
 * @Description: 射线
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
 * @description: objects
 */
const object1 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshStandardMaterial({
    color: 0xff0000,
  })
);
object1.position.set(-2, 0, 0);

const object2 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshStandardMaterial({
    color: 0xff0000,
  })
);
object2.position.set(2, 0, 0);

const object3 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshStandardMaterial({
    color: 0xff0000,
  })
);

scene.add(object1, object2, object3);

/**
 * @description: 射线 raycaster
 * @return {*}
 */
const raycaster = new THREE.Raycaster();

// 平均线触碰，需要演示时候把上一个方法注释
// // 射线起点
// const rayOrighn = new THREE.Vector3(-3, 0, 0);
// // 射线方向
// const rayDirection = new THREE.Vector3(10, 0, 0);
// rayDirection.normalize();

// raycaster.set(rayOrighn, rayDirection);

// 鼠标模拟
const mouse = new THREE.Vector2();
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / size.width) * 2 - 1;
  mouse.y = -(event.clientY / size.height) * 2 + 1;
});

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
  const elapsedTIme = time.getElapsed();

  object1.position.y = Math.sin(elapsedTIme * 0.3) * 1.5;
  object2.position.y = Math.sin(elapsedTIme * 0.8) * 1.5;
  object3.position.y = Math.sin(elapsedTIme * 1.5) * 1.5;

  
  // 鼠标模拟
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects([object1, object2, object3]);

  for (const obj of [object1, object2, object3]) {
    obj.material.color.set(0xff0000);
  }

  for (const intersect of intersects) {
    intersect.object.material.color.set("#0000ff");
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
