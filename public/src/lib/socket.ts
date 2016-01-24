import io from 'socket.io-client';
import {GameObject} from '../lib/gameobject';
import {Scene} from '../lib/scene';

export var socket = io("localhost:3000");

socket.on('connect', function() {
  var uuid;
  if (!(uuid = localStorage.getItem('uuid'))) {
    var randomlyGeneratedUID = Math.random().toString(36).substring(3, 16) + new Date;
    localStorage.setItem('uuid', randomlyGeneratedUID);
  }
  socket.emit('register', uuid);
});

socket.on('addObject', function(gameObject: GameObject, scene: Scene) {
  scene.add(gameObject);
  console.log('ADDED');
});

socket.on('destroyObject', function(gameObject: GameObject, scene: Scene) {
  scene.destroy(gameObject);
});

socket.on('updateObject', function(gameObject: GameObject, scene: Scene) {
  scene.array.push(gameObject);
});
