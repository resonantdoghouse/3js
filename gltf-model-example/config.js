import { Vector2, Vector3, TextureLoader, RepeatWrapping } from 'three';

const textureLoader = new TextureLoader();

export const modelPosition = {
  x: 0,
  y: 2,
  z: 0,
};

export const cameraPosition = {
  x: 0,
  y: 1,
  z: 10,
};

export const directionalLightPosition = {
  x: 0,
  y: -1,
  z: 0,
};

export const spaceshipVelocity = {
  vx: 0,
  vy: 0,
  vz: 0,
  vRoll: 0,
  vPitch: 0
};

export const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

export const uniforms = {
  fogDensity: { value: 0.01 },
  fogColor: { value: new Vector3(0, 0, 0) },
  time: { value: 1.0 },
  uvScale: { value: new Vector2(10.0, 10.0) },
  texture1: { value: textureLoader.load('/textures/lavatile.jpeg') },
};

uniforms['texture1'].value.wrapS = uniforms['texture1'].value.wrapT =
  RepeatWrapping;
