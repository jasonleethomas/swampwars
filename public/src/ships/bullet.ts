import {GameObject} from '../lib/gameobject';
import {Collision} from '../lib/math/collision';
import {Scene} from '../lib/scene';
import {Player} from './player';

import {socket} from '../lib/socket';

export class Bullet extends GameObject {
  xprev: number;
  yprev: number;
  constructor(team: number, x: number, y: number, public xSpd: number, public ySpd: number) {
    super();
    this.team = team;
    this.position.x = x;
    this.position.y = y;
    this.xprev = x;
    this.yprev = y;
    var w = 4;
    var h = 4;

    this.hitbox.x = w / 2;
    this.hitbox.y = h / 2;
    this.hitbox.width = w;
    this.hitbox.height = w;

    //if (this === window) return new Bullet(x, y, xSpd, ySpd, color, damage);
  }

  update(scene: Scene) {
    this.xprev = this.position.x;
    this.yprev = this.position.y;
    this.position.x += this.xSpd;
    this.position.y += this.ySpd;

    socket.emit('updateObject', this, scene);

    var collidedWith: GameObject[] = new Collision().box(scene, this.position.x, this.position.y, this.hitbox.width, this.hitbox.height);
    var playersHit = collidedWith.filter((o) => {
      return (typeof (o) == 'Player' && o.team != this.team);
    });

    playersHit.map((o) => {
      socket.emit('destroyObject', o, scene);
    });

    if (this.position.x < 0 || this.position.y < 0 || this.position.x > scene.width || this.position.y > scene.height) {
      scene.destroy(this);
    }
  }
  render(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.strokeStyle = '#ffffff';
    context.lineWidth = 4;
    context.lineTo(this.xprev, this.yprev);
    context.lineTo(this.position.x, this.position.y);
    context.stroke();
  }
}
