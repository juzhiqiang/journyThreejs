import * as THREE from 'three'
import { Scene, TextureLoader } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { Sky } from 'three/examples/jsm/objects/Sky.js'
import { Timer } from 'three/examples/jsm/Addons.js';
import { mx_bilerp_0 } from 'three/src/nodes/materialx/lib/mx_noise.js'

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

// texture
const textureLoader = new TextureLoader();
const particleTexture = textureLoader.load('/images/particles/2.png')

/**
 * object
 * */
const box = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1),
    new THREE.MeshBasicMaterial()
)
scene.add(box)


// const particlesGeometry = new THREE.SphereGeometry(1, 32, 32)
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.2,
    color: '#ff8800',
    transparent: true,
    alphaMap: particleTexture,
    sizeAttenuation: true,
    // 粒子图片图片会有黑边解决方案以一，计算深度，关闭后如果中间有其他物体后面的粒子依然能看到 ，（需要评判合理使用时机）
    // depthTest: false,
    // 方案二，将透明度黑色部分设置为近视为0
    // alphaTest: 0.001,
    // 方案三, 停止深度缓存写入
    depthWrite: false,
    // 颜色混合做不同物体叠加时候提升质感
    blending: THREE.AdditiveBlending,
    // 允许顶点给色
    vertexColors: true
})
// const mesh = new THREE.Points(particlesGeometry, particlesMaterial)
// scene.add(mesh)

// 方案二
const particlesGeometyr = new THREE.BufferGeometry();
const count = 5000;

const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3)
for (let i = 0; i < count * 3; i++) {

    positions[i] = (Math.random() - 0.5) * 10
    colors[i] = Math.random()

}

particlesGeometyr.setAttribute("position", new THREE.BufferAttribute(positions, 3))
particlesGeometyr.setAttribute("color", new THREE.BufferAttribute(colors, 3))
const mesh = new THREE.Points(particlesGeometyr, particlesMaterial)
scene.add(mesh)


// light
const ambientLight = new THREE.AmbientLight("#223344", 0.08)
scene.add(ambientLight)

const directionLight = new THREE.DirectionalLight("#335577", .5)
directionLight.position.set(3, 2, -8)
scene.add(directionLight)

// camera
const camera = new THREE.PerspectiveCamera(45, size.width / size.height, 0.001, 100000)
camera.position.z = 8;
camera.position.y = 10;
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





/**
 * fix: 这个方法修复了之前 new THREE.Clock 多动画，以及tab切换导致计时器累加导致数值巨大问题
 * */
const timer = new Timer();
// Animations
const tick = () => {

    controls.update();
    timer.update();
    const elapsedTime = timer.getElapsed();

    // mesh.rotation.y = elapsedTime * 0.2
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        const x = particlesGeometyr.attributes.position.array[i3]
        particlesGeometyr.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x)

    }

    particlesGeometyr.attributes.position.needsUpdate = true;

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


