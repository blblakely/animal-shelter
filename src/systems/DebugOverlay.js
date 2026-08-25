import { DEBUG_DEFAULT, GRID_SIZE } from '../config/constants.js';

export class DebugOverlay {
  constructor(scene, mapManager, transitionManager, player, animalManager) {
    this.scene = scene;
    this.map = mapManager;
    this.transitions = transitionManager;
    this.player = player;
    this.animalManager = animalManager;
    this.enabled = DEBUG_DEFAULT;
    this.graphics = scene.add.graphics().setDepth(100);
    this.bodyGraphics = scene.add.graphics().setDepth(102);
    this.label = scene.add.text(14, 14, '', { fontFamily: 'monospace', fontSize: '14px', color: '#ffffff', backgroundColor: '#14211ddd', padding: { x: 8, y: 6 } }).setScrollFactor(0).setDepth(101);
    this.key = scene.input.keyboard.addKey('D');
    this.key.on('down', () => { this.enabled = !this.enabled; this.draw(); });
    this.draw();
  }

  draw() {
    this.graphics.clear();
    this.bodyGraphics.clear();
    this.label.setVisible(this.enabled);
    if (!this.enabled) return;
    const { width, height, layers } = this.map.definition;
    this.graphics.fillStyle(0x4acb78, 0.09).fillRect(0, 0, width * GRID_SIZE, height * GRID_SIZE);
    this.graphics.lineStyle(1, 0xffffff, 0.18);
    for (let x = 0; x <= width; x += 1) this.graphics.lineBetween(x * GRID_SIZE, 0, x * GRID_SIZE, height * GRID_SIZE);
    for (let y = 0; y <= height; y += 1) this.graphics.lineBetween(0, y * GRID_SIZE, width * GRID_SIZE, y * GRID_SIZE);
    this.graphics.fillStyle(0xff4d5d, 0.35);
    layers.structure.blocked.forEach(([x, y]) => this.graphics.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE));
    this.graphics.fillStyle(0xffd34e, 0.48);
    this.transitions.zones.forEach((zone) => this.graphics.fillRect(zone.x - zone.width / 2, zone.y - zone.height / 2, zone.width, zone.height));
    this.graphics.fillStyle(0x4ea5ff, 0.8);
    Object.values(layers.spawns.entrances).forEach((spawn) => this.graphics.fillCircle((spawn.tileX + .5) * GRID_SIZE, (spawn.tileY + .5) * GRID_SIZE, 6));
    this.graphics.fillStyle(0xc56eff, 0.28);
    layers.animalNavigation.objects.forEach((region) => this.graphics.fillRect(region.tileX * GRID_SIZE, region.tileY * GRID_SIZE, region.width * GRID_SIZE, region.height * GRID_SIZE));
    this.label.setText('DEBUG [D]\nGreen: walkable  Red: blocked\nYellow: transition  Blue: spawn  Purple: animal area');
  }

  update() {
    this.bodyGraphics.clear();
    if (!this.enabled) return;
    const body = this.player.body;
    this.bodyGraphics.lineStyle(2, 0x55e8ff, 1).strokeRect(body.x, body.y, body.width, body.height);
    this.bodyGraphics.lineStyle(2, 0xff8bf3, 1);
    this.animalManager.animals.forEach((animal) => this.bodyGraphics.strokeRect(animal.body.x, animal.body.y, animal.body.width, animal.body.height));
  }
}
