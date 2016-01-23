import {GameObject} from './gameobject';
import {Scene} from './scene';
import {Input} from './input';
import {Viewport} from './viewport';
/**
 * Manages rendering objects on canvas.
 */
export class Renderer {
  public canvas: HTMLCanvasElement;
  public context: CanvasRenderingContext2D;
  public input: Input;
  public scene: Scene;
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.tabIndex = 1;
    this.canvas.width = 640;
    this.canvas.height = 360;

    this.context = this.canvas.getContext('2d');

    //Initialize Singletons
    this.input = new Input(this.canvas);
    this.scene = new Scene(new Viewport(),{ x1: 0, y1: 0, x2: this.canvas.width, y2: this.canvas.height});
  }

  //Refreshes the screen with everything in the scene.
  render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    //Viewport
    this.context.setTransform(1, 0, 0, 1, -this.scene.viewport.position.x, -this.scene.viewport.position.y);
    //Defaults
    this.context.fillStyle = '#9eb254';
    this.context.fillRect(this.scene.bounds.x1, this.scene.bounds.y1, this.scene.bounds.x2, this.scene.bounds.y2);

    //Render Scene
    this.scene.array.map((o) => {
      o.update(this.scene, this.input);
      o.render(this.context);
    });
  }
}
