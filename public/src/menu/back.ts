import {GameObject} from '../lib/gameobject';
import {GameSocket} from '../lib/socket';
import {Collision} from '../lib/math/collision';
import {Scene} from '../lib/scene';

export class Back extends GameObject {
  private scene: Scene;
  private backImage: HTMLImageElement;
  constructor() {
    super();
    this.sprites = new Image();
    this.sprites.src = 'sprites/tileset.png';
    this.generate();

  }
  update(socket: GameSocket, scene: Scene) {
    this.scene = scene;
  }
  generate() {
    var tempContext = document.createElement('canvas').getContext('2d');
    tempContext.canvas.width = 800;
    tempContext.canvas.height = 800;

    tempContext.clearRect(0, 0, 800, 800);

    for (var i = 0; i < 20; i++) {
      var r = Math.floor(Math.random() * 4);
      var xx = Math.floor(Math.random() * 800 / 16) * 16;
      var yy = Math.floor(Math.random() * 800 / 16) * 16;
      tempContext.drawImage(this.sprites, r * 16, 0, 16, 16, xx, yy, 16, 16);
    }
    this.backImage = new Image();
    this.backImage.src = tempContext.canvas.toDataURL();
  }
  render(context: CanvasRenderingContext2D) {
    context.drawImage(this.backImage, 0, 0, 800, 800, 0, 0, 800, 800);
  }
}
