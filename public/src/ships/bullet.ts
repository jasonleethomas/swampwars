import {GameObject} from '../lib/gameobject';
import {GameSocket} from '../lib/socket'
import {Scene} from '../lib/scene';

export class Bullet extends GameObject {
  xprev: number;
  yprev: number;
  constructor(x: number, y: number, public xSpd: number, public ySpd: number, public color: number, public damage: number) {
    super();
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
  update(socket: GameSocket, scene:Scene) {
    this.xprev = this.position.x;
    this.yprev = this.position.y;
    this.position.x += this.xSpd;
    this.position.y += this.ySpd;
    
    // transmit updates to network
    socket.updateObject(this);

    if (this.position.x > scene.bounds.x2) {
      scene.destroy(this);
      socket.destroyObject(this);
    }
  }
  render(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.strokeStyle = '#ffffff';
    context.lineWidth = 4;
    context.lineTo(this.xprev, this.yprev);
    context.lineTo(this.position.x, this.position.y);
    context.stroke();
    //context.fillRect(this.position.x - 2, this.position.y -2, 4, 4);
  }
}
