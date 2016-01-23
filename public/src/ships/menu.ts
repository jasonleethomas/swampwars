import {GameObject} from '../lib/gameobject';
import {Scene} from '../lib/scene';
import {Easing} from '../lib/math/easing';
import {Clock} from '../lib/clock';

export class Menu extends GameObject {
  private logo: HTMLImageElement;
  private schools: HTMLImageElement[];
  private scene: Scene;
  private clock: Clock = new Clock();
  private alpha = 0;
  constructor() {
    super();
    this.logo = new Image();
    this.logo.src = 'sprites/logo.png';

    var i = new Image();
    i.src = 'sprites/fiu.svg';
    this.schools.push(i);

  }
  update(scene: Scene) {
    this.scene = scene;
    var deltaTime = this.clock.deltaTime();
    this.alpha = Easing.easeOutExpo(this.clock.getElapsedTime(), 0, 1, 1);

  }
  render(context: CanvasRenderingContext2D) {
    var vx = this.scene.viewport.position.x + (this.scene.viewport.width / 2);
    var vy = this.scene.viewport.position.y + (this.scene.viewport.height / 2);
    context.save();
    context.globalAlpha = this.alpha;
    context.drawImage(this.logo,
      vx - (this.logo.width / 2),
      vy - (this.logo.height / 2));

    context.drawImage()
    context.restore();
  }
}
