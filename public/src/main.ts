import {Renderer} from './lib/renderer';

import {Player} from './ships/player';
import {Menu} from './menu/menu';

let renderer, viewport;

function start() {
  renderer = new Renderer();
  document.getElementById('game').appendChild(renderer.canvas);
}

function createScene() {
  renderer.scene.add(new Menu());
  //renderer.scene.add(new Player());
}

function animate() {
  renderer.render();
  requestAnimationFrame(animate);
}

start();
createScene();
animate();
