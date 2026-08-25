import Phaser from 'phaser';
import { getMapDefinition } from '../data/maps.js';
import { InputController } from '../systems/InputController.js';
import { MapManager } from '../systems/MapManager.js';
import { TransitionManager } from '../systems/TransitionManager.js';
import { DebugOverlay } from '../systems/DebugOverlay.js';
import { Player } from '../entities/Player.js';
import { SPECIES } from '../data/species.js';
import { AnimalManager } from '../systems/AnimalManager.js';
import { AnimalInteractionSystem } from '../systems/AnimalInteractionSystem.js';

export class WorldScene extends Phaser.Scene {
  constructor() { super('WorldScene'); }
  init(data) { this.mapId = data.mapId ?? 'shelter_grounds'; this.entranceId = data.entranceId ?? 'center_start'; }
  preload() {
    this.load.spritesheet('player-girl', 'assets/player-girl-v2.png', { frameWidth: 64, frameHeight: 96 });
    this.load.spritesheet('terrain', 'assets/temporary-terrain.png', { frameWidth: 32, frameHeight: 32 });
    Object.values(SPECIES).forEach((species) => {
      const { key, path, frameWidth, frameHeight } = species.sprite;
      this.load.spritesheet(key, path, { frameWidth, frameHeight });
    });
  }
  create() {
    const definition = getMapDefinition(this.mapId);
    this.mapManager = new MapManager(this, definition).create();
    this.inputController = new InputController(this);
    const spawn = this.mapManager.getSpawn(this.entranceId);
    this.player = new Player(this, spawn.x, spawn.y, this.inputController, spawn.facing);
    this.physics.add.collider(this.player, this.mapManager.structureLayer);
    this.animalManager = new AnimalManager(this, this.mapManager).create();
    this.animalInteraction = new AnimalInteractionSystem(this, this.player, this.animalManager);
    this.transitionManager = new TransitionManager(this, definition.layers.transitions.exits);
    this.transitionManager.connect(this.player);
    this.debugOverlay = new DebugOverlay(this, this.mapManager, this.transitionManager, this.player, this.animalManager);
    this.cameras.main.startFollow(this.player, true, .12, .12);
    this.cameras.main.fadeIn(260, 16, 35, 33);
    this.add.text(18, 18, definition.name, { fontFamily: 'Fredoka, sans-serif', fontSize: '22px', color: '#fff4d5', stroke: '#25443b', strokeThickness: 5 }).setScrollFactor(0).setDepth(50);
    const objective = this.mapId === 'shelter_grounds' ? 'Visit Maple in the fenced yard' : 'Find the glowing path marker';
    this.add.text(18, 50, objective, { fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#e8f4e8', backgroundColor: '#203a34bb', padding: { x: 7, y: 4 } }).setScrollFactor(0).setDepth(50);
    definition.layers.transitions.exits.forEach((exit) => {
      const x = (exit.tileX + exit.width / 2) * 32; const y = (exit.tileY + exit.height / 2) * 32;
      this.add.rectangle(x, y, exit.width * 32, exit.height * 32, 0xf6d66f, .4).setDepth(2);
      this.tweens.add({ targets: this.add.rectangle(x, y, 10, exit.height * 25, 0xfff2ad, .8).setDepth(3), alpha: .2, yoyo: true, repeat: -1, duration: 650 });
    });
  }
  update(time) {
    this.player?.update();
    this.animalManager?.update(time);
    this.animalInteraction?.update();
    this.debugOverlay?.update();
  }
}
