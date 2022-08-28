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
