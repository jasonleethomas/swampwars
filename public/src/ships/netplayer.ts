import {Player} from './player';

class NetPlayer extends Player {
  constructor(public team = 0) {
    super();
  }
}
