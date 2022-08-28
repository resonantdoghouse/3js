import * as dat from 'dat.gui';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import './style.css';

const canvas = document.querySelector('canvas.webgl');
const gui = new dat.GUI(); // debug

// window width & height
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Scene Setup
const scene = new THREE.Scene();
const color = 'skyblue';
const near = 10;
const far = 1000;
scene.fog = new THREE.Fog(color, near, far);
scene.background = new THREE.Color(color);

// Model Loader
const gltfLoader = new GLTFLoader();

const modelPosition = {
  x: 0,
  y: 1,
  z: 0,
};

const directionalLightPosition = {
  x: 0,
  y: 6,
  z: 100,
};

const updatePosition = (object, axis, position) => {
  switch (axis) {
    case 'x':
      object.position.x = position;
      break;
    case 'y':
      object.position.y = position;
      break;
    case 'z':
      object.position.z = position;
      break;
    default:
      break;
  }
};

function modelLoader(url) {
  return new Promise((resolve, reject) => {
    gltfLoader.load(url, (data) => resolve(data), null, reject);
  });
}

async function loadModel() {
  const gltf = await modelLoader('/models/spaceship.gltf');
  const model = gltf.scene;
  model.scale.set(0.5, 0.5, 0.5);
  model.position.x = modelPosition.x;
  model.position.y = modelPosition.y;
  model.position.z = modelPosition.z;
  model.receiveShadow = true;
  model.castShadow = true;
  scene.add(model);

  return model;
}

const model = await loadModel().catch((error) => {
  console.error(error);
});

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({
    color: '#444444',
    metalness: 0.2,
    roughness: 0.5,
  })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 3);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.castShadow = true;

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);

directionalLight.position.set(
  directionalLightPosition.x,
  directionalLightPosition.y,
  directionalLightPosition.z
);

directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.target = model;

scene.add(directionalLight);

// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 2, 4);
camera.add(pointLight);
scene.add(camera);

window.addEventListener('resize', () => {
  // update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  // update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  // update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Controls
const controls = new OrbitControls(camera, canvas);
controls.maxPolarAngle = Math.PI / 2; // avoids going below ground
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Timing for Animation Loop
const clock = new THREE.Clock();
let previousTime = 0;

// Animation Loop, Renderer
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

// start loop, if model is loaded
if (model) {
  tick();
}

/*
 * Debugging with Dat.GUI
 */
const positionFolder = gui.addFolder('Object Position');

positionFolder
  .add(modelPosition, 'x', -10, 10)
  .step('0.1')
  .onChange((value) => {
    updatePosition(model, 'x', value);
  });
positionFolder
  .add(modelPosition, 'y', 0.5, 3.5)
  .onChange((value) => {
    updatePosition(model, 'y', value);
  })
  .step('0.1');
positionFolder
  .add(modelPosition, 'z', -10, 10)
  .onChange((value) => {
    updatePosition(model, 'z', value);
  })
  .step('0.1');
