import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import fragmentShader from './fragmentShader';

import * as dat from 'dat.gui';
const app = document.querySelector('#app');

const gui = new dat.GUI();
const planeRotation = { x: -1.5, y: 0, z: 0 };
const guiPlane = gui.addFolder('Plane');
guiPlane.add(planeRotation, 'x', -1.5, 1.5).step(0.1);

// scene
const scene = new THREE.Scene();

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.z = 5;

// box
const boxGeom = new THREE.BoxGeometry(1, 1, 1);
const boxMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('coral') });
const box = new THREE.Mesh(boxGeom, boxMat);
scene.add(box);

// shader
const uniforms = {
  iTime: { value: 0 },
  iResolution: { value: new THREE.Vector3(planeRotation) },
};

// plane
const planeGeom = new THREE.PlaneGeometry(200, 200);
const planeMat = new THREE.ShaderMaterial({
  fragmentShader,
  uniforms,
});

const plane = new THREE.Mesh(planeGeom, planeMat);
scene.add(plane);

plane.rotateX(0);

plane.rotation.set(planeRotation.x, planeRotation.y, planeRotation.z);
plane.position.set(0, -1, -50);
console.log(plane.rotation);

// renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// animation loop
function animate(time) {
  time *= 0.001; // convert to seconds

  box.rotation.x += 0.01;
  box.rotation.y += 0.01;

  plane.rotation.set(planeRotation.x, planeRotation.y, planeRotation.z);

  uniforms.iResolution.value.set(window.innerWidth, window.innerHeight, 1);
  uniforms.iTime.value = time;

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
