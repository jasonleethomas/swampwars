import * as SocketIO from 'socket.io';

export var io: SocketIO.Server = SocketIO();

io.on('connection', function (socket: SocketIO.Socket) {
  console.log('connected client');
  io.emit('requestUpdate');
  socket.on('disconnect', function() {
    io.emit('requestUpdate');
  });
});
