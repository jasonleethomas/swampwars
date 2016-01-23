import * as SocketIO from 'socket.io';
import {Vector} from './models/math'
import {Player} from './models/player'
import {Bullet} from './models/bullet'
import {Team, Points} from './models/team'

export var io: SocketIO.Server = SocketIO();

io.on('connection', function (socket: SocketIO.Socket) {
  io.emit('sendPositions');
  socket.emit('welcome', {
    message: "Welcome to Swamp"
  });
  socket.on('bulletHit', function(bullet: Bullet) {
    Points[bullet.team]++;
  });
  socket.on('disconnect', function(player: Player) {
    io.emit('sendPositions');
  });
});
