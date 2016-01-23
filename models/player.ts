/// <reference path="../typings/tsd.d.ts"/>
/// <reference path="./math.ts"/>

import * as mongoose from 'mongoose'
import {Vector2D}  from './math'

export interface IPlayer {
  position: Vector2D
}

export interface IPlayerModel extends IPlayer, mongoose.Document {}

export var PlayerSchema = new mongoose.Schema({
  position: {
    x: Number,
    y: Number,
    angle: Number
  }
});

export var Player = mongoose.model('Player', PlayerSchema);
