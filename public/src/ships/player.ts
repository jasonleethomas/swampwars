import {Ship} from './ship';
import {GameObject} from '../lib/gameobject';
import {Input} from '../lib/input';
import {MathEx} from '../lib/math/mathex';
import {Clock} from '../lib/clock';
import {Bullet} from './bullet';

import {socket} from '../lib/socket';

import {Scene} from '../lib/scene';
export class Player extends Ship {
  constructor(public team = 0, public position: { x: number, y: number }) {
    super(team, position);
  }
  update(scene: Scene, input: Input) {
    super.update(scene, input);
    socket.emit('updateObject', this, scene);
    //input.touches().map((finger) => finger.pageX);
    //Keyboard
    var l = input.getKey('ArrowLeft');
    var r = input.getKey('ArrowRight');
    var u = input.getKey('ArrowUp');
    var d = input.getKey('ArrowDown');

    this.nextRotation = MathEx.keyboardAngle(u, l, d, r);

    this.moving = (u || l || d || r);
    this.shooting = input.getKey('Space');
  }
}
