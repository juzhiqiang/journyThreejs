import * as THREE from 'three'
import { Scene, TextureLoader } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'


/**
 *  debug
 * */
const gui = new dat.GUI();

// size
const size = {
    width: window.innerWidth,
    height: window.innerHeight
}
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

// textureLoader
const textureLoader = new THREE.TextureLoader();
const matcapTexture = textureLoader.load("/resources/textures/matcaps/5.png")

// light
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)

const directionLight = new THREE.DirectionalLight(0xffffff, 1)
directionLight.position.set(5, 3, 2)
scene.add(directionLight)

const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 1)
scene.add(hemisphereLight)

const pointLight = new THREE.PointLight(0xff9000, 1)
scene.add(pointLight)

// 只在标准网格材质有效
const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 2, 1, 1)
scene.add(rectAreaLight)

// 聚光灯
const spotLight = new THREE.SpotLight(0x78ff00, 0.5, 7, Math.PI * 0.1, 0.25, 0.1)
spotLight.position.set(0, 2, 3)
scene.add(spotLight)
// 如果需要改变灯光方向，需要将spotLight.target 添加进场景

// 需要多光源时候可以使用光照烘培，threejs不能承受大多灯光否者性能影响很大，尤其是矩形灯光跟聚光灯


const fd = gui.addFolder("环境光")
fd.addColor(ambientLight, 'color')
fd.add(ambientLight, 'intensity', 0, 3, 0.01)
const fd1 = gui.addFolder("平行光")
fd1.addColor(directionLight, 'color')
fd1.add(directionLight, 'intensity', 0, 3, 0.01)
fd1.add(directionLight.position, 'x', -5, 10, 0.01)
fd1.add(directionLight.position, 'y', -5, 10, 0.01)
fd1.add(directionLight.position, 'z', -5, 10, 0.01)
const fd2 = gui.addFolder("球光")
fd2.addColor(hemisphereLight, 'color')
fd2.add(hemisphereLight, 'intensity', 0, 3, 0.01)
fd2.add(hemisphereLight.position, 'x', -5, 10, 0.01)
fd2.add(hemisphereLight.position, 'y', -5, 10, 0.01)
fd2.add(hemisphereLight.position, 'z', -5, 10, 0.01)
const fd3 = gui.addFolder("点光源")
fd3.addColor(pointLight, 'color')
fd3.add(pointLight, 'intensity', 0, 3, 0.01)
fd3.add(pointLight.position, 'x', -5, 10, 0.01)
fd3.add(pointLight.position, 'y', -5, 10, 0.01)
fd3.add(pointLight.position, 'z', -5, 10, 0.01)
const fd4 = gui.addFolder("矩形光源")
fd4.addColor(rectAreaLight, 'color')
fd4.add(rectAreaLight, 'intensity', 0, 3, 0.01)
fd4.add(rectAreaLight.position, 'x', -5, 10, 0.01)
fd4.add(rectAreaLight.position, 'y', -5, 10, 0.01)
fd4.add(rectAreaLight.position, 'z', -5, 10, 0.01)
const fd5 = gui.addFolder("聚光灯")
fd5.addColor(spotLight, 'color')
fd5.add(spotLight, 'intensity', 0, 3, 0.01)
fd5.add(spotLight.position, 'x', -5, 10, 0.01)
fd5.add(spotLight.position, 'y', -5, 10, 0.01)
fd5.add(spotLight.position, 'z', -5, 10, 0.01)

// object
const material = new THREE.MeshStandardMaterial({
    roughness: 0.1
})

const shaere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material)
shaere.position.set(-2, 0, 0)
const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1), material)
const torus = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.2), material)
torus.position.set(2, 0, 0)
const plane = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), material)
plane.position.set(0, -0.6, 0)
plane.rotation.x = -Math.PI / 2

scene.add(shaere, box, torus, plane)


// camera
const camera = new THREE.PerspectiveCamera(45, size.width / size.height, 0.001, 100000)
camera.position.z = 5;
camera.position.y = 2;
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

// time
let time = Date.now();

// Animations
const tick = () => {

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


