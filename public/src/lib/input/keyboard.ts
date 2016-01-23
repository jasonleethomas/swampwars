export class Keyboard {
    public keys: Object = {};
    constructor(public canvas: HTMLCanvasElement) {
      this.canvas.addEventListener('keydown', (e) => this.keyDownCallback(e));
      this.canvas.addEventListener('keyup', (e) => this.keyUpCallback(e));
    }
    keyDownCallback(event) {
      this.keys[event.code] = true;
    }
    keyUpCallback(event) {
      this.keys[event.code] = false;
    }
}
