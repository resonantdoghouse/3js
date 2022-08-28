import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { lavaFragmentShader, lavaVertexShader } from './shaders';
import { modelLoader, createMaterialArray } from './util';
import {
  uniforms,
  modelPosition,
  directionalLightPosition,
  sizes,
} from './config';
import './style.css';

// Scene Setup
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
const color = new THREE.Color('#BF836E');
const near = 10;
const far = 10000;
scene.fog = new THREE.Fog(color, near, far);
scene.background = new THREE.Color(color);

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

// Lava floor
const lava = new THREE.Mesh(
  new THREE.PlaneGeometry(300, 300),
  new THREE.ShaderMaterial({
    uniforms,
    vertexShader: lavaVertexShader,
    fragmentShader: lavaFragmentShader,
  })
);
lava.receiveShadow = true;
lava.rotation.x = -Math.PI * 0.5;
lava.position.y = 0;
scene.add(lava);

const materialArray = createMaterialArray('purplenebula');

const skyboxGeo = new THREE.BoxGeometry(1000, 1000, 1000);
const skybox = new THREE.Mesh(skyboxGeo, materialArray);
scene.add(skybox);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 10);
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
  120,
  sizes.width / sizes.height,
  0.1,
  300000
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
renderer.autoClear = false;

const renderModel = new RenderPass(scene, camera);
const effectFilm = new FilmPass(0.35, 0.95, 2048, false);
const composer = new EffectComposer(renderer);

composer.addPass(renderModel);
// composer.addPass(effectFilm);

// Timing for Animation Loop
const clock = new THREE.Clock();
let previousTime = 0;

// Animation Loop, Renderer
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  uniforms['time'].value += 0.2 * deltaTime;

  controls.update();
  renderer.clear();
  composer.render(0.01);
  // renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

// start loop, if model is loaded
if (model) {
  tick();
}
