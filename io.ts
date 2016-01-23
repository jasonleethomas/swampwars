/// <reference path="./typings/socket.io/socket.io.d.ts"/>

import * as io from 'socket.io';
import {Vector2D} from './models/math'
import {IPlayer, IPlayerModel, Player} from './models/player'

export var server: SocketIO.Server = io();

server.on('connection', function (socket: SocketIO.Socket) {
    socket.emit('welcome', {
        message: "Hi welcome to SwampWars"
    });
    console.log('connection');

    socket.on('updatePosition', function(player: IPlayer) {
    }); 
});
