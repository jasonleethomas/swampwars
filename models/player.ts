import * as uuid from 'node-uuid'
import {Vector}  from './math'
import {Team} from './team'

export class Player{
  id: string;
  position: Vector;
  constructor(public team: Team)
  {
    this.id = uuid.v4();
    this.position = {
      x: Math.floor((Math.random() * 640)),
      y: Math.floor((Math.random() * 360)),
      angle: 0
    }
  }
};
