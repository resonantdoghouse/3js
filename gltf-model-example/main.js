import {
  Scene,
  PerspectiveCamera,
  Color,
  Fog,
  Mesh,
  BoxGeometry,
  PlaneGeometry,
  ShaderMaterial,
  AmbientLight,
  PointLight,
  DirectionalLight,
  WebGLRenderer,
  PCFSoftShadowMap,
  Clock,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { lavaFragmentShader, lavaVertexShader } from './shaders';
import { modelLoader, createMaterialArray } from './util';
import {
  uniforms,
  cameraPosition,
  modelPosition,
  directionalLightPosition,
  sizes,
  spaceshipVelocity,
} from './config';
import InputControl from './InputControl';
import './style.css';

// Scene Setup
const canvas = document.querySelector('canvas.webgl');
const scene = new Scene();
const color = new Color('#BF836E');
const near = 10;
const far = 10000;
scene.fog = new Fog(color, near, far);
scene.background = new Color(color);

const inputKeys = new InputControl();
inputKeys.init();

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
const lava = new Mesh(
  new PlaneGeometry(300, 300),
  new ShaderMaterial({
    uniforms,
    vertexShader: lavaVertexShader,
    fragmentShader: lavaFragmentShader,
  })
);
lava.receiveShadow = true;
lava.rotation.x = -Math.PI * 0.5;
lava.position.y = 0;
scene.add(lava);

const materialArray = createMaterialArray('flame');

const skyboxGeo = new BoxGeometry(1000, 1000, 1000);
const skybox = new Mesh(skyboxGeo, materialArray);
scene.add(skybox);

// Lights
const ambientLight = new AmbientLight(0xffffff, 10);
scene.add(ambientLight);

const pointLight = new PointLight(0xffffff, 1);
pointLight.castShadow = true;

const directionalLight = new DirectionalLight(0xffffff, 1);
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
const camera = new PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  300000
);
camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
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
controls.maxPolarAngle = Math.PI / 2 + 0.15; // avoids going below ground
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;
controls.target = model.position;

const renderer = new WebGLRenderer({
  canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.autoClear = false;

const renderModel = new RenderPass(scene, camera);
const effectFilm = new FilmPass(0.35, 0.95, 2048, false);
const composer = new EffectComposer(renderer);

composer.addPass(renderModel);
// composer.addPass(effectFilm);

// Timing for Animation Loop
const clock = new Clock();
let previousTime = 0;

// Animation Loop, Renderer
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  uniforms['time'].value += 0.2 * deltaTime;

  const keyState = inputKeys.checkState();

  if (keyState) {
    if (keyState === 'a') {
      spaceshipVelocity.vx += 0.001;
    }
    if (keyState === 'd') {
      spaceshipVelocity.vx -= 0.001;
    }
    if (keyState === 'w') {
      spaceshipVelocity.vz += 0.001;
    }
    if (keyState === 's') {
      spaceshipVelocity.vz -= 0.001;
    }
  }

  model.position.x += spaceshipVelocity.vx;
  model.position.z += spaceshipVelocity.vz;

  // camera.position.x = model.position.x;
  // camera.position.y = model.position.y;

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
