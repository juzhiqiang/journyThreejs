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
const floorAlphaTexture = textureLoader.load('/images/textures/floor/alpha.jpg')
const floorColorTexture = textureLoader.load('/images/textures/floor/coast_sand_rocks_02_diff_1k.jpg')
const floorArmTexture = textureLoader.load('/images/textures/floor/coast_sand_rocks_02_arm_1k.jpg')
const floorNormalTexture = textureLoader.load('/images/textures/floor/coast_sand_rocks_02_nor_gl_1k.jpg')
const floorDisplacementTexture = textureLoader.load('/images/textures/floor/coast_sand_rocks_02_disp_1k.jpg')


floorColorTexture.repeat.set(8, 8)
floorArmTexture.repeat.set(8, 8)
floorNormalTexture.repeat.set(8, 8)
floorDisplacementTexture.repeat.set(8, 8)
floorColorTexture.wrapS = THREE.RepeatWrapping;
floorColorTexture.wrapT = THREE.RepeatWrapping;

floorArmTexture.wrapT = THREE.RepeatWrapping;
floorArmTexture.wrapS = THREE.RepeatWrapping;
floorNormalTexture.wrapS = THREE.RepeatWrapping;
floorNormalTexture.wrapT = THREE.RepeatWrapping;
floorDisplacementTexture.wrapS = THREE.RepeatWrapping;
floorDisplacementTexture.wrapT = THREE.RepeatWrapping;

// wall
const wallColorTexture = textureLoader.load('/images/textures/wall/castle_brick_broken_06_diff_1k.jpg')
const wallArmTexture = textureLoader.load('/images/textures/wall/castle_brick_broken_06_arm_1k.jpg')
const wallNormalTexture = textureLoader.load('/images/textures/wall/castle_brick_broken_06_nor_gl_1k.jpg')

wallColorTexture.colorSpace = THREE.SRGBColorSpace;

// roof
const roofColorTexture = textureLoader.load('/images/textures/roof/roof_slates_02_diff_1k.jpg')
const roofArmTexture = textureLoader.load('/images/textures/roof/roof_slates_02_arm_1k.jpg')
const roofNormalTexture = textureLoader.load('/images/textures/roof/roof_slates_02_nor_gl_1k.jpg')

roofColorTexture.colorSpace = THREE.SRGBColorSpace;
roofColorTexture.repeat.set(3, 1)
roofArmTexture.repeat.set(3, 1)
roofNormalTexture.repeat.set(3, 1)
roofColorTexture.wrapS = THREE.RepeatWrapping;
roofArmTexture.wrapS = THREE.RepeatWrapping;
roofNormalTexture.wrapS = THREE.RepeatWrapping;

// bushes
const bushesColorTexture = textureLoader.load('/images/textures/bushes/leaves_forest_ground_diff_1k.jpg')
const bushesArmTexture = textureLoader.load('/images/textures/bushes/leaves_forest_ground_arm_1k.jpg')
const bushesNormalTexture = textureLoader.load('/images/textures/bushes/leaves_forest_ground_nor_gl_1k.jpg')

bushesColorTexture.colorSpace = THREE.SRGBColorSpace;
bushesColorTexture.repeat.set(2, 1)
bushesArmTexture.repeat.set(2, 1)
bushesNormalTexture.repeat.set(2, 1)
bushesColorTexture.wrapS = THREE.RepeatWrapping;
bushesArmTexture.wrapS = THREE.RepeatWrapping;
bushesNormalTexture.wrapS = THREE.RepeatWrapping;

// grave
const graveColorTexture = textureLoader.load('/images/textures/grave/plastered_stone_wall_diff_1k.jpg')
const graveArmTexture = textureLoader.load('/images/textures/grave/plastered_stone_wall_arm_1k.jpg')
const graveNormalTexture = textureLoader.load('/images/textures/grave/plastered_stone_wall_nor_gl_1k.jpg')

graveColorTexture.colorSpace = THREE.SRGBColorSpace;
graveColorTexture.repeat.set(0.3, 0.4)
graveArmTexture.repeat.set(0.3, 0.4)
graveNormalTexture.repeat.set(0.3, 0.4)

// door
const doorColorTexture = textureLoader.load('/images/textures/door/color.jpg')
const doorAphaTexture = textureLoader.load('/images/textures/door/alpha.jpg')
const doorAmbientOcclusionTexture = textureLoader.load('/images/textures/door/ambientOcclusion.jpg')
const doorHeightTexture = textureLoader.load('/images/textures/door/height.jpg')
const doorMetalnessTexture = textureLoader.load('/images/textures/door/metalness.jpg')
const doorNormalTexture = textureLoader.load('/images/textures/door/normal.jpg')
const doorRoughnessTexture = textureLoader.load('/images/textures/door/roughness.jpg')
doorColorTexture.colorSpace = THREE.SRGBColorSpace;


/**
/**
 * House
 * */
/**
 * floor 地面
 * */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20, 100, 100),
    new THREE.MeshStandardMaterial({
        map: floorColorTexture,
        normalMap: floorNormalTexture,
        aoMap: floorArmTexture,
        metalnessMap: floorArmTexture,
        roughnessMap: floorArmTexture,
        transparent: true,
        alphaMap: floorAlphaTexture,
        opacity: .6,
        displacementMap: floorDisplacementTexture,
        displacementScale: .3,
        displacementBias: -0.2
    })
);
floor.rotation.x = -Math.PI / 2
scene.add(floor)

gui.add(floor.material, "displacementScale", 0, 1, 0.001).name("地形高程缩放")
gui.add(floor.material, "displacementBias", -1, 1, 0.001).name("地形高程位置")

const house = new THREE.Group();
house.name = 'house';
scene.add(house);

// walls
const walls = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 4),
    new THREE.MeshStandardMaterial({
        map: wallColorTexture,
        normalMap: wallNormalTexture,
        aoMap: wallArmTexture,
        metalnessMap: wallArmTexture,
        roughnessMap: wallArmTexture,
    })
)
walls.position.y += 1.25
house.add(walls)

// Roof
/**
 * fix： 
 * 单纯只用材质属性map，normalMap,aoMap,metalnessMap:roughessMap 时会出现光照不对情况
 * 这是由于ConeGeometry,SphereGeometry内部uv定义导致
 * 要效果更好，可以自己使用BufferGeometry实现，这时uv，normal规则是由自己定制的
 * 如果是圆取巧方案就是旋转下把顶部uv连接块旋转到看不到的地方
 * */
const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 1.5, 4),
    new THREE.MeshStandardMaterial({
        map: roofColorTexture,
        normalMap: roofNormalTexture,
        aoMap: roofArmTexture,
        metalnessMap: roofArmTexture,
        roughnessMap: roofArmTexture,
    })
)
roof.position.y = 3.25
roof.rotation.y = Math.PI / 4
house.add(roof)

// door
const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
    new THREE.MeshStandardMaterial({
        map: doorColorTexture,
        transparent: true,
        alphaMap: doorAphaTexture,
        aoMap: doorAmbientOcclusionTexture,
        displacementMap: doorHeightTexture,
        displacementBias: -0.04,
        displacementScale: 0.15,
        normalMap: doorNormalTexture,
        metalnessMap: doorMetalnessTexture,
        roughnessMap: doorRoughnessTexture
    })
)
door.position.y = 1;
door.position.z = 2.02
house.add(door)

// Bushes
const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
const bushMaterial = new THREE.MeshStandardMaterial({
    color: "#ccffcc",
    map: bushesColorTexture,
    normalMap: bushesNormalTexture,
    aoMap: bushesArmTexture,
    metalnessMap: bushesArmTexture,
    roughnessMap: bushesArmTexture,
});
const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
bush1.scale.set(0.5, 0.5, 0.5)
bush1.rotation.x = Math.PI / 1.3
bush1.position.set(0.8, 0.2, 2.2)

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
bush2.scale.set(0.25, 0.25, 0.25)
bush2.rotation.x = Math.PI / 1.3
bush2.position.set(1.4, 0.1, 2.1)

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
bush3.scale.set(0.4, 0.4, 0.4)
bush3.rotation.x = Math.PI / 1.3
bush3.position.set(-0.8, 0.2, 2.2)

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial)
bush4.scale.set(0.15, 0.15, 0.15)
bush4.rotation.x = Math.PI / 1.3
bush4.position.set(-1, 0.05, 2.6)
house.add(bush1, bush2, bush3, bush4)

// Graves
const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2)
const graveMaterial = new THREE.MeshStandardMaterial({
    map: graveColorTexture,
    normalMap: graveNormalTexture,
    aoMap: graveArmTexture,
    metalnessMap: graveArmTexture,
    roughnessMap: graveArmTexture,
})

const graves = new THREE.Group();
graves.name = "graves";
scene.add(graves);

for (let i = 0; i < 30; i++) {

    const angle = Math.random() * Math.PI * 2
    const raduis = 3 + Math.random() * 7;
    const x = Math.sin(angle) * raduis;
    const z = Math.cos(angle) * raduis;

    const grave = new THREE.Mesh(graveGeometry, graveMaterial);
    grave.position.set(x, Math.random() * 0.4, z)
    grave.rotation.x = (Math.random() - 0.5) * 0.4
    grave.rotation.y = (Math.random() - 0.5) * 0.4
    grave.rotation.z = (Math.random() - 0.5) * 0.4
    graves.add(grave)

}

// light
const ambientLight = new THREE.AmbientLight("#223344", 0.08)
scene.add(ambientLight)

const directionLight = new THREE.DirectionalLight("#335577", .5)
directionLight.position.set(3, 2, -8)
scene.add(directionLight)

// doorLight
const doorLight = new THREE.PointLight('#ff7d46', 5)
doorLight.position.set(0, 2.2, 2.5)
house.add(doorLight)


// 氛围灯
const ghost = new THREE.PointLight('#8800ff', 6)
const ghost1 = new THREE.PointLight('#ff0088', 6)
const ghost2 = new THREE.PointLight('#ff0000', 6)
scene.add(ghost, ghost1, ghost2)

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
 * shadows
 * */
renderer.shadowMap.enabled = true;
// 默认使用pcf阴影贴图计算，会带模糊效果  THREE.PCFShadowMap
// PCFSoftShadowMap  可以改变阴影半径
renderer.shadowMap.type = THREE.PCFSoftShadowMap
directionLight.castShadow = true;
ghost.castShadow = true;
ghost1.castShadow = true;
ghost2.castShadow = true;

walls.castShadow = true;
walls.receiveShadow = true;
roof.castShadow = true
floor.receiveShadow = true

graves.traverse(child => {
    if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
    }
})


// mapping
directionLight.shadow.mapSize.width = 256;
directionLight.shadow.mapSize.height = 256
directionLight.shadow.camera.top = 8
directionLight.shadow.camera.right = 8
directionLight.shadow.camera.bottom = -8
directionLight.shadow.camera.left = -8
directionLight.shadow.camera.near = 1
directionLight.shadow.camera.far = 20
directionLight.shadow.camera.raduis = 8


// Sky
const sky = new Sky();
sky.scale.set(100, 100, 100)
scene.add(sky)
sky.material.uniforms['turbidity'].value = 10
sky.material.uniforms['rayleigh'].value = 3
sky.material.uniforms['mieCoefficient'].value = 0.1
sky.material.uniforms['mieDirectionalG'].value = 0.95
sky.material.uniforms['sunPosition'].value.set(0.3, -0.038, -0.95)

scene.fog = new THREE.FogExp2('#02141a', 0.001)


/**
 * fix: 这个方法修复了之前 new THREE.Clock 多动画，以及tab切换导致计时器累加导致数值巨大问题
 * */
const timer = new Timer();
// Animations
const tick = () => {

    controls.update();
    timer.update();
    const elapsedTime = timer.getElapsed();

    // 氛围灯
    const ghost1Angle = elapsedTime * 0.5
    ghost.position.x = Math.cos(ghost1Angle) * 4;
    ghost.position.z = Math.sin(ghost1Angle) * 4;
    ghost.position.y =
        Math.sin(ghost1Angle) *
        Math.sin(ghost1Angle * 2.34) *
        Math.sin(ghost1Angle * 3.45)


    const ghost2Angle = -elapsedTime * 0.38
    ghost1.position.x = Math.cos(ghost2Angle) * 5;
    ghost1.position.z = Math.sin(ghost2Angle) * 5;
    ghost1.position.y =
        Math.sin(ghost2Angle) *
        Math.sin(ghost2Angle * 2.34) *
        Math.sin(ghost2Angle * 3.45)

    const ghost3Angle = elapsedTime * 0.23
    ghost2.position.x = Math.cos(ghost3Angle) * 6;
    ghost2.position.z = Math.sin(ghost3Angle) * 6;
    ghost2.position.y =
        Math.sin(ghost3Angle) *
        Math.sin(ghost3Angle * 2.34) *
        Math.sin(ghost3Angle * 3.45)

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


