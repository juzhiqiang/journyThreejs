/*
 * @Author: juzhiqiang
 * @Date: 2025-06-30 21:47:43
 * @LastEditors: juzhiqiang
 * @LastEditTime: 2025-07-03 15:33:55
 * @Description: 性能优化可以开启worker线程分担js所用主线程的压力，将高密及度计算放到worker线程中
 * 
 */
import * as THREE from "three";
import { Scene, TextureLoader } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { TextGeometry, Timer } from "three/examples/jsm/Addons.js";
import * as CANNON from "cannon-es";
/**
 *  debug
 * */
const gui = new dat.GUI();
const debugObject = {};
debugObject.createSphere = () => {
  createSphere(
    Math.random() * 0.5,
    new CANNON.Vec3(Math.random() * 3, 3, Math.random() * 3)
  );
};
debugObject.createBox = () => {
  createBox(
    Math.random() * 0.5,
    Math.random() * 0.5,
    Math.random() * 0.5,
    new CANNON.Vec3(Math.random() * 3, 3, Math.random() * 3)
  );
};
debugObject.reset = () => {
  for (const object of objectToUpdate) {
    world.removeBody(object.body);
    object.body.removeEventListener("collide", playHitSound);

    scene.remove(object.mesh);
  }
  objectToUpdate.splice(0, objectToUpdate.length);
};
gui.add(debugObject, "reset").name("Reset Scene");
gui.add(debugObject, "createSphere");
gui.add(debugObject, "createBox");

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

/**
 * @description: 声音 sounds
 * @return {*}
 */
const hitSound = new Audio("/audio/sounds/hit.mp3");
const playHitSound = (collision) => {
  const impactVelocity = collision.contact.getImpactVelocityAlongNormal();
  if (impactVelocity > 1.5) {
    hitSound.volume = Math.min(1, impactVelocity / 10);
    hitSound.currentTime = 0;
    hitSound.play();
  }
};

// textureLoader
const textureLoader = new THREE.TextureLoader();

/**
 * @description: Physics
 */
const world = new CANNON.World();
// 物理世界的时间步长------ 性能优化
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true; // 允许物体休眠
// -------------------------------
world.gravity.set(0, -9.82, 0);

// 材质
const defaultMaterial = new CANNON.Material("default");

// 接触材质
const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    // 摩擦力
    friction: 0.1,
    // 弹性系数
    restitution: 0.7,
  }
);
world.addContactMaterial(defaultContactMaterial);
world.defaultContactMaterial = defaultContactMaterial;

// floor in world
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body({
  mass: 0,
  shape: floorShape,
});
// 平面需要旋转90度
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI / 2);
world.addBody(floorBody);

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

/**
 * @description: utils
 * @return {*}
 */
const objectToUpdate = [];
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  envMap: textureLoader.load("textures/environmentMaps/0/px.jpg"),
});

const createSphere = (radius, position) => {
  const sphereShape = new CANNON.Sphere(radius);
  const sphereBody = new CANNON.Body({
    mass: 1, // 质量
    position, // 初始位置
    shape: sphereShape, // 形状
    material: defaultMaterial, // 材质
  });
  sphereBody.position.copy(position);
  sphereBody.addEventListener("collide", (event) => {
    playHitSound(event);
  });
  world.addBody(sphereBody);

  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.scale.set(radius, radius, radius);
  sphere.castShadow = true;
  sphere.position.copy(position);
  scene.add(sphere);

  // 保存对象到更新
  objectToUpdate.push({
    body: sphereBody,
    mesh: sphere,
  });
};

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const createBox = (width, height, depth, position) => {
  const mesh = new CANNON.Box(
    new CANNON.Vec3(width / 2, height / 2, depth / 2)
  );
  const body = new CANNON.Body({
    mass: 1, // 质量
    position, // 初始位置
    shape: mesh, // 形状
    material: defaultMaterial, // 材质
  });
  body.position.copy(position);
  body.addEventListener("collide", (event) => {
    playHitSound(event);
  });

  world.addBody(body);

  const box = new THREE.Mesh(boxGeometry, sphereMaterial);
  box.scale.set(width, height, depth);
  box.castShadow = true;
  box.position.copy(position);
  scene.add(box);

  // 保存对象到更新
  objectToUpdate.push({
    body: body,
    mesh: box,
  });
};

// time
const time = new Timer();
// Animations
const tick = () => {
  controls.update();
  time.update();
  const deltaTime = time.getDelta();

  // 更新物理世界
  world.step(1 / 60, deltaTime, 3);

  // 更新物体位置
  for (const object of objectToUpdate) {
    object.mesh.position.copy(object.body.position);
    object.mesh.quaternion.copy(object.body.quaternion);
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
