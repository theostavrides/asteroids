import Phaser from 'phaser';
import config from './config';
import Asteroids from './scenes/Asteroids';

new Phaser.Game(
  Object.assign(config, {
    scene: [Asteroids]
  })
);
