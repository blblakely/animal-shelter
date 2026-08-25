import { GRID_SIZE } from '../config/constants.js';

const TILE = { grass: 0, meadow: 1, wall: 2, accent: 3 };

export class MapManager {
  constructor(scene, definition) {
    this.scene = scene;
    this.definition = definition;
    this.blocked = new Set(definition.layers.structure.blocked.map(([x, y]) => `${x},${y}`));
  }

  create() {
    const { width, height, layers } = this.definition;
    const floorIndex = TILE[layers.floor.ground];
    const floorData = Array.from({ length: height }, () => Array(width).fill(floorIndex));
    layers.floor.accents.forEach(([x, y]) => { floorData[y][x] = TILE.accent; });
    const structureData = Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => this.isBlocked(x, y) ? TILE.wall : -1));
    const map = this.scene.make.tilemap({ data: floorData, tileWidth: GRID_SIZE, tileHeight: GRID_SIZE });
    const tiles = map.addTilesetImage('terrain');
    this.floorLayer = map.createLayer(0, tiles, 0, 0).setDepth(0);
    const structureMap = this.scene.make.tilemap({ data: structureData, tileWidth: GRID_SIZE, tileHeight: GRID_SIZE });
    const structureTiles = structureMap.addTilesetImage('terrain');
    this.structureLayer = structureMap.createLayer(0, structureTiles, 0, 0).setDepth(5);
    this.structureLayer.setCollision(TILE.wall);
    this.scene.physics.world.setBounds(0, 0, width * GRID_SIZE, height * GRID_SIZE);
    this.scene.cameras.main.setBounds(0, 0, width * GRID_SIZE, height * GRID_SIZE);
    return this;
  }

  isBlocked(x, y) { return this.blocked.has(`${x},${y}`); }

  getSpawn(entranceId) {
    const spawn = this.definition.layers.spawns.entrances[entranceId];
    if (!spawn) throw new Error(`Unknown entrance ${entranceId} on ${this.definition.id}`);
    return { x: (spawn.tileX + 0.5) * GRID_SIZE, y: (spawn.tileY + 1) * GRID_SIZE, facing: spawn.facing };
  }
}
