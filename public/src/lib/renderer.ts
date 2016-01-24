import {GameObject} from './gameobject';
import {GameSocket} from './socket';
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
  public socket: GameSocket;
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.tabIndex = 1;
    this.canvas.width = 640;
    this.canvas.height = 360;

    this.context = this.canvas.getContext('2d');

    //Initialize Singletons
    this.input = new Input(this.canvas);
    this.scene = new Scene(new Viewport(), 800, 800);
    this.socket = new GameSocket(this.scene);
  }

  //Refreshes the screen with everything in the scene.
  render() {
    this.context.save();
    //Viewport
    this.context.translate(-this.scene.viewport.position.x, -this.scene.viewport.position.y);
    this.context.clearRect(this.scene.viewport.position.x, this.scene.viewport.position.y, this.scene.viewport.width, this.scene.viewport.height);

    this.context.fillStyle = '#9eb254';
    this.context.fillRect(this.scene.viewport.position.x, this.scene.viewport.position.y, this.scene.width, this.scene.height);


    //Render Scene
    this.scene.array.map((o) => {
      o.update(this.socket, this.scene, this.input);
      o.render(this.context);
    });

    this.context.restore();
  }
}
