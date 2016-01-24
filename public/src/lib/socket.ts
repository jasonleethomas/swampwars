import io from 'socket.io-client';
import {GameObject} from '../lib/gameobject';
import {Scene} from '../lib/scene';

export class GameSocket {
  public url: string;
  public socket: io.Socket;
  constructor(public scene: Scene) {
    this.socket = io("localhost:3000");

    this.socket.on('addObject', function(gameObject: GameObject) {
        this.scene.add(gameObject);
    });

    this.socket.on('destroyObject', function(gameObject: GameObject) {
        this.scene.destroy(gameObject);
    });

    this.socket.on('updateObject', function(gameObject: GameObject) {
        this.scene.array[gameObject.id] = gameObject;
    });
  }

  addObject(gameObject: GameObject) {
      this.socket.emit('addObject', gameObject);
  }

  destroyObject(gameObject: GameObject) {
      this.socket.emit('destroyObject', gameObject);
  }

  updateObject(gameObject: GameObject) {
    this.socket.emit('updateObject', gameObject);
  }
}
