/// <reference path="./typings/socket.io/socket.io.d.ts"/>

import * as SocketIO from 'socket.io';
import {Vector2D} from './models/math'
import {IPlayer, IPlayerModel, Player} from './models/player'

export var io: SocketIO.Server = SocketIO();

io.on('connection', function (socket: SocketIO.Socket) {
    socket.emit('welcome', {
        message: "Hi welcome to SwampWars"
    });
    console.log('connection');

    socket.on('updatePosition', function(player: IPlayer) {
    }); 
});
