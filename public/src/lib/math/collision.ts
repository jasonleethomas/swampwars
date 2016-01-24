import {Scene} from '../scene';

export class Collision {
  //checks a region for a collision, returns a collection of collided objects.
  box(scene: Scene, x1: number, y1: number, x2: number, y2: number) {
    return scene.array.filter((o) =>
      x1 < o.hitbox.x
      && x2 > o.hitbox.x + o.hitbox.width
      && y1 < o.hitbox.y
      && y2 > o.hitbox.y + o.hitbox.height
      );
  }
}
