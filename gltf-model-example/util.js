import { TextureLoader, MeshBasicMaterial, BackSide } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const gltfLoader = new GLTFLoader();

export function modelLoader(url) {
  return new Promise((resolve, reject) => {
    gltfLoader.load(url, (data) => resolve(data), null, reject);
  });
}

// src: https://codepen.io/codypearce/pen/oNXQyOb?editors=1010
function createPathStrings(filename) {
  const basePath = `https://raw.githubusercontent.com/codypearce/some-skyboxes/master/skyboxes/${filename}/`;
  const baseFilename = basePath + filename;
  const fileType = filename == 'purplenebula' ? '.png' : '.jpg';
  const sides = ['ft', 'bk', 'up', 'dn', 'rt', 'lf'];
  const pathStings = sides.map((side) => {
    return baseFilename + '_' + side + fileType;
  });

  return pathStings;
}

export function createMaterialArray(filename) {
  const skyboxImagepaths = createPathStrings(filename);
  const materialArray = skyboxImagepaths.map((image) => {
    let texture = new TextureLoader().load(image);

    return new MeshBasicMaterial({ map: texture, side: BackSide });
  });
  return materialArray;
}

export const updatePosition = (object, axis, position) => {
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
