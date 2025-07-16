import * as THREE from 'three'
import { Scene } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'


/**
 *  debug
 * */
const gui = new dat.GUI();


const cursor = {
    x: 0,
    y: 0
}
window.addEventListener("mousemove", (event) => {
    cursor.x = event.clientX / size.width - 0.5;
    cursor.y = -(event.clientY / size.height - 0.5);
});

// canvas
const dom = document.querySelector("#canvas");

// scene 
const scene = new Scene();
// Object
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({
    color: 0xff0000
})
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh);

// Rotation 一次按一个轴旋转
mesh.rotation.y = Math.PI;

let lorem
gui.add(mesh.position, "y").min(-5).max(5).step(0.01)
gui.addColor(material, 'color')


// size
const size = {
    width: window.innerWidth,
    height: window.innerHeight
}

// camera
const camera = new THREE.PerspectiveCamera(45, size.width / size.height, 0.001, 100000)
camera.position.z = 5;
scene.add(camera)

camera.lookAt(new THREE.Vector3(0, 0, 0))


//  axes 
const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper)

// renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: dom
})
renderer.setSize(size.width, size.height)
// 需要限制像素比 建议不大于2 大于2可能增加性能损耗,更多渲染
// 原则上像素比越大效果越好,需要与性能平衡
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const controls = new OrbitControls(camera, renderer.domElement);

// 物体到远点距离
console.log(mesh.position.length())

// 物体到摄像机距离，可以比对任意物体间距离
console.log(mesh.position.distanceTo(camera.position))

// 归一化
console.log(mesh.position.normalize())

// time
let time = Date.now();

// Animations
const tick = () => {
    // mesh.rotation.y += 0.01

    // update camera
    // camera.position.x = Math.sin(cursor.x * 10) * 3;
    // camera.position.z = Math.cos(cursor.x * 10) * 3;
    // camera.position.y = cursor.y * 5;
    // camera.lookAt(mesh.position)

    controls.update();

    // time
    const currentTime = Date.now();
    const deltaTime = currentTime - time;
    time = currentTime;


    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick();

window.addEventListener('resize', () => {
    size.width = window.innerWidth;
    size.height = window.innerHeight;

    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();

    renderer.setSize(size.width, size.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

})


window.addEventListener('dblclick', (e) => {
    console.log(document.fullscreenElement)
    if (!document.fullscreenElement) {
        canvas.requestFullscreen()
    } else {
        document.exitFullscreen()
    }
})


