import {Player} from './player';

class NetPlayer extends Player {
  constructor(public team = 0, public position: { x: number, y: number }) {
    super(team, position);
  }
}
