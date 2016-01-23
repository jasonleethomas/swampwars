import {GameObject} from '../lib/gameobject';
import {Scene} from '../lib/scene';
import {Input} from '../lib/input';
import {MathEx} from '../lib/math/mathex';
import {Clock} from '../lib/clock';
import {Bullet} from './bullet';

/**
 * The player ship.
 */
export class Player extends GameObject {
  //Stats
  public hp = 100;
  public hpMax = this.hp;
  public ep = 100;
  public epMax = this.ep;

  //Ship Kinematics
  public spd = 0;
  public acc = 16;
  public deacc = 12;
  public spdMax = 256;
  private clock: Clock = new Clock();

  //Ship Guns
  private gunTimer: number = 0;
  private gunReloadTime = .3;
  constructor() {
    super();
    //Transform
    this.position = { x: 128, y: 128 };

    //Sprites
    this.sprites = new Image();
    this.sprites.src = 'sprites/ship.png';
  }

  update(scene: Scene, input: Input) {
    var deltaTime = this.clock.deltaTime();

    //Gun
    this.gunTimer -= deltaTime;
    if (input.getKey('Space')) {
      if (this.gunTimer < 0) {
        this.gunTimer = this.gunReloadTime;
        scene.add(new Bullet(this.position.x, this.position.y, Math.cos(this.rotation * (Math.PI / 180)) * 16, -Math.sin(this.rotation * (Math.PI / 180)) * 16, 0, 0));
      }
    }

    var l = input.getKey('ArrowLeft');
    var r = input.getKey('ArrowRight');
    var u = input.getKey('ArrowUp');
    var d = input.getKey('ArrowDown');

    var keyAngle = MathEx.keyboardAngle(u, l, d, r);

    if (u || l || d || r) {
      this.spd = MathEx.clamp(this.spd + this.acc, 0, this.spdMax);
      this.rotation += MathEx.angleDifference(keyAngle, this.rotation) / (this.spd / 16);
    } else {
      this.spd = MathEx.clamp(this.spd - this.deacc, 0, this.spdMax);
    }

    // Apply Kinematics
    this.velocity.x = deltaTime * this.spd * Math.cos(this.rotation * (Math.PI / 180));
    this.velocity.y = deltaTime * this.spd * -Math.sin(this.rotation * (Math.PI / 180));
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    //Sync Viewport with Screen
    scene.viewport.position.x = this.position.x - (scene.viewport.width / 2);
    scene.viewport.position.y = this.position.y - (scene.viewport.height / 2);
  }

  render(context: CanvasRenderingContext2D) {
    context.save();
    context.translate(this.position.x, this.position.y)
    context.rotate(-this.rotation * (Math.PI / 180));
    context.drawImage(this.sprites, 0, 0, 16, 16, -8, -8, 16, 16);
    context.restore();
  }
}
