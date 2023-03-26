import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const urlParams = new URLSearchParams(window.location.search)
let query = ''

if (urlParams.has('query')) {
  query = urlParams.get('query')
}

/*
 * Convert image to black and white grayscale
 */
async function convertBW(id) {
  const imgObj = document.createElement('img')
  imgObj.src = `https://www.artic.edu/iiif/2/${id}/full/843,/0/default.jpg`
  imgObj.crossOrigin = ''
  return new Promise((resolve, reject) => {
    let isError = false
    let grayImage = ''
    imgObj.onload = () => {
      imgObj.width = imgObj.width
      imgObj.height = imgObj.height
      grayImage = gray(imgObj)
      resolve(grayImage)
    }
    if (isError) {
      reject('an error occurred converting gray image')
    }
  })

  function gray(imgObj) {
    let canvas = document.createElement('canvas')
    let canvasContext = canvas.getContext('2d')
    let imgW = imgObj.width
    let imgH = imgObj.height
    canvas.width = imgW
    canvas.height = imgH
    canvasContext.drawImage(imgObj, 0, 0)
    const imgPixels = canvasContext.getImageData(0, 0, imgW, imgH)
    const { data, width, height } = imgPixels
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let i = (y * width + x) << 2
        let avg = ((data[i] + data[i + 1] + data[i + 2]) / 3) | 0
        data[i] = avg
        data[i + 1] = avg
        data[i + 2] = avg
      }
    }

    canvasContext.putImageData(
      imgPixels,
      0,
      0,
      0,
      0,
      imgPixels.width,
      imgPixels.height
    )
    return canvas.toDataURL()
  }
}

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
// Canvas
const canvas = document.querySelector('canvas.webgl')
// Scene
const scene = new THREE.Scene()
const color = 'skyblue' // white
const near = 10
const far = 100
scene.fog = new THREE.Fog(color, near, far)
scene.background = new THREE.Color(color)
const imageTextureSettings = {
  heightmapSize: -0.75,
  metalness: 0,
  roughness: 1,
  normalScale: new THREE.Vector2(0, 0),
}
/**
 * Models
 */
const gltfLoader = new GLTFLoader()
const directionalLightPosition = {
  x: 0,
  y: 0,
  z: 0,
}
let model = null
/*
 * Dat GUI controls, folders
 */
function enableDatGUI() {
  // Dat GUI controls
  const imageTextureFolder = gui.addFolder('Height Map')
  imageTextureFolder
    .add(imageTextureSettings, 'heightmapSize', -2, 2)
    .onChange((value) => {
      imageTextureSettings.heightmapSize = value
      imageMaterial.displacementScale = value
    })
  imageTextureFolder
    .add(imageTextureSettings, 'metalness', 0, 1)
    .onChange((value) => {
      imageTextureSettings.metalness = value
      imageMaterial.metalness = value
    })
  imageTextureFolder
    .add(imageTextureSettings, 'roughness', 0, 1)
    .onChange((value) => {
      imageTextureSettings.roughness = value
      imageMaterial.roughness = value
    })
  // imageTextureFolder.open();
}
/*
 * Blender Model Loader
 */
function loadModelPromise(url) {
  return new Promise((resolve) => {
    new GLTFLoader().load(url, resolve)
  })
}
function loadModel(position) {
  loadModelPromise('./models/meter.gltf')
    .then((gltf) => {
      model = gltf.scene
      model.scale.set(1, 1, 1)
      model.position.x = position.x
      model.position.y = position.y
      model.position.z = position.z
      model.receiveShadow = true
      model.castShadow = true
      scene.add(model)
    })
    .catch((error) => console.log(error))
}
/**
 * Floor
 */
const terrain = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({
    color: '#444444',
    metalness: 0,
    roughness: 1,
  })
)
// terrain.receiveShadow = true;
terrain.rotation.x = -Math.PI * 0.5
terrain.position.y = -10
scene.add(terrain)
/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)
const pointLight = new THREE.PointLight(0xffffff, 0.5)
const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(-5, 10, 3)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()
  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})
/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.set(0, 0, 9)
camera.add(pointLight)
scene.add(camera)
// Controls
const controls = new OrbitControls(camera, canvas)
controls.minPolarAngle = 0.1
controls.maxPolarAngle = Math.PI / 2 + 1.5 // avoids going below ground
controls.minAzimuthAngle = -Math.PI / 2 + 0.5 // radians
controls.maxAzimuthAngle = Math.PI / 2 - 0.5 // radians
controls.target.set(0, 0.75, 0)
controls.enableDamping = true
controls.listenToKeyEvents(window)
let imageMaterial
function loadImage(id) {
  const loader = new THREE.TextureLoader()
  const heightMapImage = convertBW(id)
  heightMapImage
    .then((data) => {
      addHeightMapMesh(data)
    })
    .catch((error) => console.log(error))
  function addHeightMapMesh(data) {
    const heightMapTexture = loader.load(data)
    const imageTexture = loader.load(
      `https://www.artic.edu/iiif/2/${id}/full/843,/0/default.jpg`
    )
    imageMaterial = new THREE.MeshStandardMaterial({
      map: imageTexture,
      displacementMap: heightMapTexture,
      displacementScale: imageTextureSettings.heightmapSize,
      metalness: imageTextureSettings.metalness,
      roughness: imageTextureSettings.roughness,
      metalnessMap: imageTexture,
    })
    const imageMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10, 128, 128),
      imageMaterial
    )
    imageMesh.position.y = 0
    imageMaterial.name = 'imageMaterial'
    imageMaterial.needsUpdate = true
    scene.add(imageMesh)
  }
}
/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0
// rotation
let lineZRotation = null
let ninetyDegrees = Math.PI / 2
const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime
  // Update controls
  controls.update()
  // Render
  renderer.render(scene, camera)
  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}
tick()
async function getArtIds() {
  await fetch(`https://api.artic.edu/api/v1/artworks/`)
    .then((response) => response.json())
    .then((response) => {
      const { data } = response
      const randomIndex = randomFromArray(data)
    })
}
// util
function randomFromArray(array) {
  return Math.floor(Math.random() * array.length)
}
function loadArt(id) {
  fetch(`https://api.artic.edu/api/v1/artworks/${id}`)
    .then((response) => response.json())
    .then((response) => {
      loadImage(response.data.image_id)
    })
}
function appendImg(data) {
  const { thumbnail, image_id, title } = data
  const article = document.createElement('article')
  article.style.position = 'absolute'
  article.style.top = '0'
  article.style.left = '0'
  const imgUrl = `https://www.artic.edu/iiif/2/${image_id}/full/843,/0/default.jpg`
  const img = document.createElement('img')
  img.src = thumbnail.lqip
  img.src = imgUrl
  img.style.zIndex = '999'
  img.style.width = '90%'
  img.style.opacity = '0.9'
  img.style.maxWidth = '100%'
  const imgTitle = document.createElement('h2')
  imgTitle.innerText = title
  article.appendChild(img)
  article.appendChild(imgTitle)
  document.body.appendChild(article)
}
function findImage(query) {
  const queryObj = {
    q: query,
    query: {
      term: {
        is_public_domain: true,
      },
    },
  }
  fetch(
    `https://api.artic.edu/api/v1/artworks/search?params=${JSON.stringify(
      queryObj
    )}`
  )
    .then((response) => response.json())
    .then((response) => {
      const randomIndex = randomFromArray(response.data)
      const imageId = response.data[randomIndex].id
      loadArt(imageId)
    })
    .catch((error) => console.log(error))
}
findImage(query || 'monet')
enableDatGUI()
