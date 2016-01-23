/// <reference path="../typings/tsd.d.ts"/>
/// <reference path="./math.ts"/>
/// <reference path="./team.ts"/>

import {Vector} from './math' 
import {Team} from './team'

export class Bullet {
  constructor(public team: Team, public position: Vector)
  {}
}
