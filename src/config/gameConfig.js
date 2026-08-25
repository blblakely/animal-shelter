import Phaser from 'phaser';
import { TitleScene } from '../scenes/TitleScene.js';
import { WorldScene } from '../scenes/WorldScene.js';
import { VIEWPORT } from './constants.js';

export const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: VIEWPORT.width,
  height: VIEWPORT.height,
  backgroundColor: '#162d2a',
  pixelArt: true,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 }, debug: false },
  },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [TitleScene, WorldScene],
};
