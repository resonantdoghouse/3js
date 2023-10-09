class InputControl {
  constructor() {
    this.keyState = {};
  }

  init() {
    this.addKeyListener();
  }

  addKeyListener() {
    document.addEventListener('keydown', (event) => {
      this.keyState[event.key] = true;
    });
    document.addEventListener('keyup', (event) => {
      this.keyState[event.key] = false;
    });
  }

  checkKey(key) {
    if (this.keyState[key]) {
      return true;
    }
  }

  checkState() {
    if (this.checkKey('w')) {
      return 'w';
    }
    if (this.checkKey('s')) {
      return 's';
    }
    if (this.checkKey('a')) {
      return 'a';
    }
    if (this.checkKey('d')) {
      return 'd';
    }
    if (this.checkKey('q')) {
      return 'q';
    }
    if (this.checkKey('z')) {
      return 'z';
    }
    if (this.checkKey('ArrowLeft')) {
      return 'ArrowLeft';
    }
    if (this.checkKey('ArrowRight')) {
      return 'ArrowRight';
    }
    if (this.checkKey('ArrowUp')) {
      return 'ArrowUp';
    }
    if (this.checkKey('ArrowDown')) {
      return 'ArrowDown';
    }
    return null;
  }
}

export default InputControl;
