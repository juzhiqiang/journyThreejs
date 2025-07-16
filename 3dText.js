import * as THREE from 'three'
import { Scene, TextureLoader } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/Addons.js'



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

// Fonts
const textloader = new FontLoader();
textloader.load("fonts/helvetiker_regular.typeface.json", (response) => {
    const geometry = new TextGeometry("Theia", {
        font: response,
        size: 0.5,
        depth: 0.2,
        curveSegments: 6,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 4
    })

    // 通过box盒子,移动物体中心

    // 方案一 计算包围盒中心位置赋值给物体
    // geometry.computeBoundingBox();
    // geometry.translate(
    //     -(geometry.boundingBox.max.x - 0.02) / 2,
    //     -(geometry.boundingBox.max.y - 0.033) / 2,
    //     -(geometry.boundingBox.max.z - 0.03) / 2,
    // )
    // console.log(geometry.boundingBox)

    // 方案二 直接使用居中方法
    geometry.center()

    const material = new THREE.MeshMatcapMaterial({
        wireframe: false,
        matcap: matcapTexture
    });
    const text = new THREE.Mesh(geometry, material);
    scene.add(text)

    const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45)
    for (let i = 0; i < 1000; i++) {
        const donut = new THREE.Mesh(donutGeometry, material)

        donut.position.x = (Math.random() - 0.5) * 10
        donut.position.y = (Math.random() - 0.5) * 10
        donut.position.z = (Math.random() - 0.5) * 10

        donut.rotation.x = Math.random() * Math.PI
        donut.rotation.y = Math.random() * Math.PI

        const scale = Math.random();
        donut.scale.set(scale, scale, scale)



        scene.add(donut)
    }

});

// light
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)

const directionLight = new THREE.DirectionalLight(0xffffff, 1)
directionLight.position.set(5, 3, 2)
scene.add(directionLight)



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


