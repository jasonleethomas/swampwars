export interface Hitbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

import {Scene} from './scene';
import {Input} from './input';

/**
 * Holds core parameters needed to render/manage a game object.
 */
export abstract class GameObject {

  //Position of GameObject.
  public position: { x: number, y: number } = { x: 0, y: 0 };

  public velocity: {x:number, y:number} = {x: 0, y: 0};

  //An angle in degrees.
  public rotation: number = 0;

  // An AABB relative to the origin of the GameObject
  public hitbox: Hitbox = {x: 0, y: 0, width: 16, height: 16};

  public depth: number = 0;

  public sprites: HTMLImageElement;

  abstract update(scene ?:Scene, input ?: Input);
  abstract render(context:CanvasRenderingContext2D);
}
