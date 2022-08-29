import './style.css';
import * as THREE from 'three';
import { getRandomInt } from './utils/math';
import p5 from 'p5';
const { createVector, noise } = p5.prototype;
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Perlin from './Perlin';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const app = document.querySelector('#app');

const perlin = new Perlin();

/*
 * Scene
 */
const color = 'rgb(106,193,222)'; // white
const near = 1000;
const far = 10000;
const scene = new THREE.Scene();
scene.background = new THREE.Color(color);
scene.fog = new THREE.Fog(color, near, far);

const gltfLoader = new GLTFLoader();
let model = null;
let tree = new THREE.Object3D();
const trees = [];

gltfLoader.load(
  '/models/test.gltf',
  (gltf) => {
    model = { ...gltf };
    let mesh = model.scene.children[2];
    console.log(mesh);
    tree.add(mesh);
    setup();
  },
  (xhr) => {
    const percentLoaded = (xhr.loaded / xhr.total) * 100;
    console.log(percentLoaded + '% loaded');
  },
  (error) => {
    console.log('An error happened');
  }
);

function addTree(x, y, z) {
  let newTree = new THREE.Object3D();
  newTree.add(tree.clone());
  newTree.scale.set(10, 10, 10);
  newTree.position.set(x, y, z);
  trees.push(newTree);
  scene.add(newTree);
}

/*
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  20000
);

// Controls
const controls = new OrbitControls(camera, app);
controls.target.set(0, 0, 0);
controls.enableDamping = true;

/*
 *  Lights
 */
const light = new THREE.DirectionalLight(0xffffff, 1);

const renderer = new THREE.WebGLRenderer({ antialias: true });

const floorGeom = new THREE.PlaneGeometry(2000, 2000, 256, 256);
floorGeom.dynamic = true;

const floorMaterial = new THREE.MeshStandardMaterial({
  vertexColors: true,
  color: new THREE.Color('white'),
  // wireframe: true,
});

const floor = new THREE.Mesh(floorGeom, floorMaterial);

function randomTerrain() {
  const vertices = floor.geometry.attributes.position.array;
  let count = floor.geometry.attributes.position.count;

  const colors = [];
  const color = new THREE.Color('rgb(59,64,123)');

  for (let i = 0; i < vertices.length; i += 3) {
    colors.push(color.r, color.g, color.b);
    colors.push(color.r, color.g, color.b);
    colors.push(color.r, color.g, color.b);
  }

  floor.geometry.setAttribute(
    'color',
    new THREE.Float32BufferAttribute(colors, 3)
  );

  const floorPositionAttribute = floor.geometry.getAttribute('position');
  let peak = 100;
  let smoothing = 300;

  let counter = 0;
  for (let i = 0; i <= vertices.length; i += 3) {
    counter++;
    const objVertex = new THREE.Vector3();
    objVertex.fromBufferAttribute(floorPositionAttribute, counter);

    const level =
      peak *
        perlin.noise(vertices[i] / smoothing, vertices[i + 1] / smoothing) || 0;
    vertices[i + 2] = level;

    if (level < -60) {
      // white snow caps
      colors[i] = 220 / 255; // red
      colors[i + 1] = 242 / 255; // green
      colors[i + 2] = 255 / 255; // blue
    }
    if (level > 60) {
      // water color
      colors[i] = 0 / 255; // red
      colors[i + 1] = 60 / 255; // green
      colors[i + 2] = 255 / 255; // blue
      // console.log(i * 0.01);
    } else if (level > 30) {
      // ground 'sand' or 'grass' color
      colors[i] = 0 / 255; // red
      colors[i + 1] = 189 / 255; // green
      colors[i + 2] = 89 / 255; // blue

      if (level > 42 && level < 48) {
        addTree(objVertex.x, objVertex.z - level, objVertex.y);
      }
    }
  }

  floor.geometry.setAttribute(
    'color',
    new THREE.BufferAttribute(new Float32Array(colors), 3)
  );

  floor.geometry.attributes.position.needsUpdate = true;
  floor.geometry.attributes.color.needsUpdate = true;
  floor.geometry.computeVertexNormals();

  scene.add(floor);

  // console.log(scene);
}

/*
 * Setup
 */
function setup() {
  // camera
  camera.position.z = 600;
  camera.position.y = 300;
  camera.rotation.x = -0.6;

  controls.update();
  scene.add(light);

  floor.position.y = 0;
  floor.material.side = THREE.DoubleSide;
  floor.rotation.x = Math.PI / 2.1;

  // renderer
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
  renderer.setSize(window.innerWidth, window.innerHeight);
  app.appendChild(renderer.domElement);

  randomTerrain();

  // renderer.render(scene, camera);

  draw();
}

/*
 * "Game" Loop
 */
function draw() {
  // randomTerrain();
  renderer.render(scene, camera);
  requestAnimationFrame(draw);
}
