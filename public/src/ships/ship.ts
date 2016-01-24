import {GameObject} from '../lib/gameobject';
import {GameSocket} from '../lib/socket';
import {Scene} from '../lib/scene';
import {Input} from '../lib/input';
import {MathEx} from '../lib/math/mathex';
import {Clock} from '../lib/clock';
import {Bullet} from './bullet';

/**
 * The player ship.
 */
export class Ship extends GameObject {

  public nextRotation: number;
  public moving: boolean;
  public shooting: boolean;

  //Ship Kinematics
  public spd = 0;
  public acc = 16;
  public deacc = 12;
  public spdMax = 256;
  private clock: Clock = new Clock();
  private prevDir = 1;
  //Ship Guns
  private gunTimer: number = 0;
  private gunReloadTime: number = .1;

  //Spray
  private spray: HTMLImageElement = new Image();
  constructor(public team = 0, position: { x: number, y: number }) {
    super();
    this.team = team;
    //Transform
    this.position = position;

    //Sprites
    this.sprites = new Image();
    this.sprites.src = 'sprites/mascot.png';
    this.spray.src = 'sprites/spray.png';
  }

  update(socket: GameSocket, scene: Scene, input: Input) {
    var deltaTime = this.clock.deltaTime();

    //Gun
    this.gunTimer -= deltaTime;
    if (this.shooting) {
      if (this.gunTimer < 0) {
        this.gunTimer = this.gunReloadTime;
        var bullet = new Bullet(this.team, this.position.x, this.position.y, Math.cos(this.rotation * (Math.PI / 180)) * 16, -Math.sin(this.rotation * (Math.PI / 180)) * 16);
        scene.add(bullet);
        socket.addObject(bullet);
      }
    }

    if (this.moving) {
      this.spd = MathEx.clamp(this.spd + this.acc, 0, this.spdMax);
      this.rotation += MathEx.angleDifference(this.nextRotation, this.rotation) / (this.spd / 16);
      this.prevDir = this.velocity.x > 0 ? 1 : -1;
    } else {
      this.spd = MathEx.clamp(this.spd - this.deacc, 0, this.spdMax);
    }

    // Apply Kinematics
    this.velocity.x = deltaTime * this.spd * Math.cos(this.rotation * (Math.PI / 180));
    this.velocity.y = deltaTime * this.spd * -Math.sin(this.rotation * (Math.PI / 180));
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    socket.updateObject(this);

    //Sync Viewport with Screen
    scene.viewport.position.x = this.position.x - (scene.viewport.width / 2);
    scene.viewport.position.y = this.position.y - (scene.viewport.height / 2);
  }

  render(context: CanvasRenderingContext2D) {
    context.save();
    context.translate(this.position.x, this.position.y)

    context.scale(this.prevDir, 1);
    context.drawImage(this.sprites, this.team * 48, 0, 48, 48, -24, -24, 48, 48);
    context.drawImage(this.spray, (Math.floor(this.clock.getElapsedTime() * 4) % 4) * 32, 0, 32, 32, -48, -16, 32, 32);
    context.restore();
  }
}