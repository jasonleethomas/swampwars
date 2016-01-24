import {Ship} from './ship';
import {Scene} from '../lib/scene';
import {Input} from '../lib/input';

import {socket} from '../lib/socket';

export class NetPlayer extends Ship {
  constructor(public team = 0, public position: { x: number, y: number }) {
    super(team, position);
  }

  update(scene: Scene, input: Input) {
    super.update(scene, input);
    socket.emit('updateObject', this, scene);
  }
}
