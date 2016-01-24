import * as SocketIO from 'socket.io';

export var io: SocketIO.Server = SocketIO();

io.on('connection', function (socket: SocketIO.Socket) {
  io.emit('requestUpdate');
  socket.on('disconnect', function() {
    io.emit('requestUpdate');
  });
});
