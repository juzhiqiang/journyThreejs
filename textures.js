import * as THREE from 'three'
import { Scene, TextureLoader } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import color from './resources/textures/door/color.jpg'



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

// textureLoader
const loadingManager = new THREE.LoadingManager();
loadingManager.onLoad = () => {
    console.log('加载完成')
}
loadingManager.onError = () => {
    console.log('加载失败')
}
loadingManager.onProgress = () => {
    console.log('加载中')
}
loadingManager.onError = () => {
    console.log('加载失败')
}

const textureLoader = new TextureLoader(loadingManager);

// 颜色贴图 
const colorTexture = textureLoader.load(color)
colorTexture.colorSpace = THREE.SRGBColorSpace
colorTexture.wrapS = THREE.RepeatWrapping
colorTexture.wrapT = THREE.RepeatWrapping

// 当使用NearestFilter时，图片会模糊，可以禁用generateMipmaps停止生成更小版本图来提升程序性能
colorTexture.generateMipmaps = false;
colorTexture.minFilter = THREE.NearestFilter
colorTexture.magFilter = THREE.NearestFilter
// gpu渲染纹理有大小限制 ，需要控制纹理大小建议不大于2048*2048，且图片尽量2的幂次方

// 法线贴图
const alphaTexture = textureLoader.load("./resources/textures/door/alpha.jpg")
// 环境贴图
const ambientOcclusionTexture = textureLoader.load("./resources/textures/door/ambientOcclusion.jpg")
// 深度贴图
const heightTexture = textureLoader.load("./resources/textures/door/height.jpg")
//  法线贴图
const normalTexture = textureLoader.load("./resources/textures/door/normal.jpg")
// 金属度贴图
const metalnessTexture = textureLoader.load("./resources/textures/door/metalness.jpg")
// 粗糙度
const roughnessTexture = textureLoader.load("./resources/textures/door/roughness.jpg")
const matcapTexture = textureLoader.load("./resources/textures/matcaps/1.png")
const gradientTexture = textureLoader.load("./resources/textures/gradients/3.jpg")

// 环境贴图
// const environmentTexture = THREE.CubeTextureLoader.load([
//     "./resources/textures/door/roughness.jpg",
//     "./resources/textures/door/roughness.jpg",
//     "./resources/textures/door/roughness.jpg",
//     "./resources/textures/door/roughness.jpg",
//     "./resources/textures/door/roughness.jpg",
//     "./resources/textures/door/roughness.jpg",
// ])


// light
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)

const directionLight = new THREE.DirectionalLight(0xffffff, 1)
directionLight.position.set(5, 3, 2)
scene.add(directionLight)

// materiial
const material = new THREE.MeshStandardMaterial({
    // 颜色贴图
    map: colorTexture,
    // 使用透明贴图时候transparent开启生效，图片白到黑觉得透明度对应情况 白透明度为1 纯黑透明度为0
    alphaMap: alphaTexture,
    transparent: true,
    side: THREE.DoubleSide,
    // 法线影响光反射，折射方向
    normalMap: normalTexture,
    flatShading: true,
    // 深度作为位移贴图,控制物体的凹凸情况
    displacementMap: heightTexture,
    // 控制深度强度
    displacementScale: 0.1,

    // 金属度贴图
    metalnessMap: metalnessTexture,
    // 值越小金属感觉越强
    metalness: 0,

    // 粗糙度
    roughnessMap: roughnessTexture,
    // 值越大越光滑
    roughness: 0,

    // 加深材质阴影，环境遮蔽贴图
    aoMap: ambientOcclusionTexture,
    aoMapIntensity: 1


})

gui.add(material, 'roughness', 0, 1, 0.01)
gui.add(material, 'metalness', 0, 1, 0.01)
gui.add(material, 'aoMapIntensity', 0, 10, 0.01)
gui.add(material, 'displacementScale', 0, 10, 0.01)

// 材质显示贴图使用自由网格材质才能显示出效果，用于辅助作用，走材质贴图中提取颜色，法线反射等，这时场景中没有光源也可以模拟受光照效果
// const material = new THREE.MeshMatcapMaterial({
//     matcap: matcapTexture
// })



// Object
const geometry = new THREE.SphereGeometry(0.5, 16, 16);
const mesh = new THREE.Mesh(geometry, material)
mesh.position.x = -2

const plane = new THREE.PlaneGeometry(1, 1)
const planeMesh = new THREE.Mesh(plane, material)
planeMesh.position.x = 2

const tour = new THREE.TorusGeometry(0.5, 0.2, 16, 60)
const tourMesh = new THREE.Mesh(tour, material)

scene.add(mesh, planeMesh, tourMesh);

// Rotation 一次按一个轴旋转
mesh.rotation.y = Math.PI;


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


