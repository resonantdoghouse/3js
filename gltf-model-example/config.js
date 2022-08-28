import { Vector3 } from 'three';

export const modelPosition = {
  x: 0,
  y: 1,
  z: 0,
};

export const directionalLightPosition = {
  x: 0,
  y: 6,
  z: 100,
};

// window width & height
export const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

export const uniforms = {
  iTime: { value: 0 },
  iResolution: { value: new Vector3({ x: -1.5, y: 0, z: 0 }) },
};
