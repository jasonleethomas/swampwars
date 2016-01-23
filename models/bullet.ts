import {Vector} from './math' 
import {Team} from './team'

export class Bullet {
  constructor(public team: Team, public position: Vector)
  {}
}
