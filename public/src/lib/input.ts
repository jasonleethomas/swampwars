import {Keyboard} from './input/keyboard';
import {Mouse} from './input/mouse';
/**
 * Manages all input events.
 */
export class Input {
  private keyboard;
  private mouse;
  constructor(public canvas: HTMLCanvasElement) {
    this.keyboard = new Keyboard(canvas);
    this.mouse = new Mouse(canvas);
  }

  //Keyboard
  getKey(key: string) {
    return (this.keyboard.keys[key] === undefined || !this.keyboard.keys[key]) ? false : true;
  }
  mousePosition() {
    return this.mouse.mousePosition;
  }
}
