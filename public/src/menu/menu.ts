import {GameObject} from '../lib/gameobject';
import {Scene} from '../lib/scene';
import {Easing} from '../lib/math/easing';
import {Clock} from '../lib/clock';
import {Input} from '../lib/input';

import {Player} from '../ships/player';
import {NetPlayer} from '../ships/netplayer';

import {socket} from '../lib/socket'

export class Menu extends GameObject {
  private logo: HTMLImageElement;

  private fiu: HTMLImageElement;
  private uf: HTMLImageElement;
  private usf: HTMLImageElement;
  private ucf: HTMLImageElement;

  private scene: Scene;
  private clock: Clock = new Clock();
  private alpha = 0;
  constructor() {
    super();
    this.logo = new Image();
    this.logo.src = 'sprites/logo.png';

    this.fiu = new Image();
    this.fiu.src = 'sprites/fiu.png';
    this.uf = new Image();
    this.uf.src = 'sprites/uf.png';
    this.usf = new Image();
    this.usf.src = 'sprites/usf.png';
    this.ucf = new Image();
    this.ucf.src = 'sprites/ucf.png';
  }

  update(scene: Scene, input: Input) {
    this.scene = scene;
    var deltaTime = this.clock.deltaTime();
    this.alpha = Easing.easeOutExpo(this.clock.getElapsedTime(), 0, 1, 1);

    // Spagetti!
    if (input.mouseClick()) {
      if (input.mousePosition().y > 240) {
        var team = Math.floor(input.mousePosition().x / (scene.viewport.width / 4));
        console.log(team);
        var player = new Player(team, {
          x: Math.floor(Math.random() * scene.width),
          y: Math.floor(Math.random() * scene.height)
        });

        scene.add(player);

        socket.emit('addObject', new NetPlayer(player.team, player.position), scene);
        scene.destroy(this);
      }
    }
  }

  render(context: CanvasRenderingContext2D) {
    var vx = this.scene.viewport.position.x + (this.scene.viewport.width / 2);
    var vy = this.scene.viewport.position.y + (this.scene.viewport.height / 2);
    context.save();
    context.globalAlpha = this.alpha;
    context.drawImage(this.logo,
      vx - (this.logo.width / 2),
      vy - (this.logo.height / 2));
    context.fillStyle = "#ffffff";
    context.font = "12px 'PixelFont'";
    context.textAlign = "center";
    context.fillText("Choose your School", vx, vy + 64, 128);

    context.drawImage(this.fiu, vx - 80 - 240, vy - 40 + 128);
    context.drawImage(this.uf, vx - 80 - 80, vy - 40 + 128);
    context.drawImage(this.usf, vx - 80 + 80, vy - 40 + 128);
    context.drawImage(this.ucf, vx - 80 + 240, vy - 40 + 128);

    var my_gradient = context.createLinearGradient(0, 0, 0, 360);
    my_gradient.addColorStop(0, "rgba(0,0,0,0)");
    my_gradient.addColorStop(1, "rgba(0,0,0,0.1)");
    context.fillStyle = my_gradient;
    context.fillRect(this.scene.viewport.position.x, this.scene.viewport.position.y, this.scene.viewport.position.x + this.scene.viewport.width, this.scene.viewport.position.y + this.scene.viewport.height);
    context.restore();
  }
}
