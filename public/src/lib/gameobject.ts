export interface Hitbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

import * as uuid from '../../javascripts/node-uuid/uuid';

import {Scene} from './scene';
import {Input} from './input';
import {GameSocket} from './socket'

/**
 * Holds core parameters needed to render/manage a game object.
 */
export abstract class GameObject {

  public id: string = uuid.v4();

  //Position of GameObject.
  public position: { x: number, y: number } = { x: 0, y: 0 };

  public velocity: {x:number, y:number} = {x: 0, y: 0};

  //An angle in degrees.
  public rotation: number = 0;

  // An AABB relative to the origin of the GameObject
  public hitbox: Hitbox = {x: 0, y: 0, width: 16, height: 16};

  public depth: number = 0;

  public sprites: HTMLImageElement;

  abstract update(socket?: GameSocket, scene ?:Scene, input ?: Input);
  abstract render(context:CanvasRenderingContext2D);
  isColliding(target: GameObject) {
    return (
      this.position.x + this.hitbox.x < target.position.x + target.hitbox.x + target.hitbox.width && 	//AL to BR.
      this.position.x + this.hitbox.x + this.hitbox.width > target.position.x + target.hitbox.x && 			//AR to BL.
      this.position.y + this.hitbox.y < target.position.y + target.hitbox.y + target.hitbox.height &&   //AT to BB.
      this.position.y + this.hitbox.y + this.hitbox.height > target.position.y + target.hitbox.y        //AB to BT.
      );
  }
}
