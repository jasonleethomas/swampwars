import {Ship} from './ship';
import {GameSocket} from '../lib/socket';
import {Scene} from '../lib/scene';
import {Input} from '../lib/input';

export class NetPlayer extends Ship {
  constructor(public team = 0, public position: { x: number, y: number }) {
    super(team, position);
  }

  update(socket: GameSocket, scene: Scene, input: Input) {
    super.update(socket, scene, input);
    socket.updateObject(this);
  }
}
