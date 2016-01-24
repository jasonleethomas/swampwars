import io from 'socket.io-client';
import {GameObject} from '../lib/gameobject';
import {Scene} from '../lib/scene';

export class GameSocket {
  public url: string;
  public socket: io.Socket;
  constructor(public scene: Scene) {
    this.socket = io("localhost:3000");

    this.socket.on('connect', function() {
      var uuid;
      if (!(uuid = localStorage.getItem('uuid'))) {
        var randomlyGeneratedUID = Math.random().toString(36).substring(3, 16) + new Date;
        localStorage.setItem('uuid', randomlyGeneratedUID);
      }
      this.socket.emit('register', uuid);
    });

    this.socket.on('addObject', function(gameObject: GameObject) {
      this.scene.add(gameObject);
      console.log('ADDED');
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
