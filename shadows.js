import * as THREE from 'three'
import { Scene, TextureLoader } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * 培阴影贴图方案（球位置升高阴影变淡，移动阴影面跟着移动来伪造阴影实现性能节省）
 * 1. 利用烘培阴影贴图动态阴影方案 放一个阴影贴图在球下面，
 *    - 直接使用map贴图材质
 * 2. 使用一张中间透明 ， 周边黑色的透明贴图材质（可控性更高）
 *    - alphaMap 贴图材质上
 * */ 

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
directionLight.castShadow = true;

// 阴影发射相关参数
// 阴影面大小 尽量为2的幂次方
directionLight.shadow.mapSize.width = 1024;
directionLight.shadow.mapSize.height = 1024;
// 阴影渲染范围
directionLight.shadow.camera.top = 2;
directionLight.shadow.camera.right = 2;
directionLight.shadow.camera.bottom = -2;
directionLight.shadow.camera.left = -2;
// 阴影最近最远渲染距离
directionLight.shadow.camera.near = 1;
directionLight.shadow.camera.far = 10;
// 阴影半径 默认的PCFftShadowMap下无效
directionLight.shadow.radius = 10;


// 添加聚光灯
const spotLight = new THREE.SpotLight(0x6bd55d, 1, 15, Math.PI / 8);
spotLight.castShadow = true;
spotLight.position.set(0, 5, 3);
scene.add(spotLight);
scene.add(spotLight.target);

// 可视化聚光灯
scene.add( new THREE.CameraHelper( spotLight.shadow.camera ) );


const fd1 = gui.addFolder("平行光")
fd1.addColor(spotLight, 'color')
fd1.add(spotLight, 'intensity', 0, 3, 0.01)
fd1.add(spotLight.position, 'x', -5, 10, 0.01)
fd1.add(spotLight.position, 'y', -5, 10, 0.01)
fd1.add(spotLight.position, 'z', -5, 10, 0.01)

// object
const material = new THREE.MeshStandardMaterial({
    roughness: 0.54,
})


const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1), material)
box.castShadow = true
const plane = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), material)
plane.position.set(0, -0.6, 0)
plane.rotation.x = -Math.PI / 2
plane.receiveShadow = true

scene.add(box, plane)


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


renderer.shadowMap.enabled = true;
// 默认使用pcf阴影贴图计算，会带模糊效果  THREE.PCFShadowMap
// PCFSoftShadowMap  可以改变阴影半径
renderer.shadowMap.type = THREE.PCFShadowMap

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


