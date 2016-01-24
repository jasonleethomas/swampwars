import {GameObject} from './gameobject';
import {Viewport} from './viewport';
export class Scene {

public array:GameObject[];
  constructor(public viewport: Viewport, public width:number, public height:number) {
    this.array = [];
  }

  //Destroys a given instance in the scene.
  destroy(gameObject) {
    this.array = this.array.filter( (v) => { return v !== gameObject;});
  }
  add(gameObject) {
    this.array[gameObject.id] = gameObject;
  }
}
