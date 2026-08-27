import { GRID_SIZE } from '../config/constants.js';

const TILE = { grass: 0, meadow: 1, wall: 2, accent: 3 };

export class MapManager {
  constructor(scene, definition, enclosureRegistry, placedWorldObjects = []) {
    this.scene = scene;
    this.definition = definition;
    this.enclosureRegistry = enclosureRegistry;
    this.staticBlocked = new Set(definition.layers.structure.blocked.map(([x, y]) => `${x},${y}`));
    this.objectBlocked = new Set();
    placedWorldObjects.filter(({ mapId, walkable }) => mapId === definition.id && !walkable).forEach((object) => {
      const relativeCells = object.footprint.cells ?? [[0, 0]];
      relativeCells.forEach(([offsetX, offsetY]) => {
        this.objectBlocked.add(`${object.tileX + offsetX},${object.tileY + offsetY}`);
      });
    });
    this.refreshBlockedSets();
  }

  create() {
    const { width, height, layers } = this.definition;
    const floorIndex = TILE[layers.floor.ground];
    const floorData = Array.from({ length: height }, () => Array(width).fill(floorIndex));
    layers.floor.accents.forEach(([x, y]) => { floorData[y][x] = TILE.accent; });
    const structureData = Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => this.baseBlocked.has(`${x},${y}`) ? TILE.wall : -1));
    const map = this.scene.make.tilemap({ data: floorData, tileWidth: GRID_SIZE, tileHeight: GRID_SIZE });
    const tiles = map.addTilesetImage('terrain');
    this.floorLayer = map.createLayer(0, tiles, 0, 0).setDepth(0);
    const structureMap = this.scene.make.tilemap({ data: structureData, tileWidth: GRID_SIZE, tileHeight: GRID_SIZE });
    const structureTiles = structureMap.addTilesetImage('terrain');
    this.structureLayer = structureMap.createLayer(0, structureTiles, 0, 0).setDepth(5);
    this.structureLayer.setCollision(TILE.wall);
    this.unsubscribeEnclosures = this.enclosureRegistry.onChange((enclosure) => {
      if (!enclosure || enclosure.definition.mapId === this.definition.id) this.refreshEnclosureGeometry();
    });
    this.scene.events.once('shutdown', () => this.unsubscribeEnclosures?.());
    this.scene.physics.world.setBounds(0, 0, width * GRID_SIZE, height * GRID_SIZE);
    this.scene.cameras.main.setBounds(0, 0, width * GRID_SIZE, height * GRID_SIZE);
    return this;
  }

  isBlocked(x, y) { return this.blocked.has(`${x},${y}`); }

  refreshBlockedSets() {
    this.baseBlocked = new Set(this.staticBlocked);
    this.enclosureRegistry.forMap(this.definition.id).forEach((enclosure) => {
      enclosure.definition.boundaryCells.forEach(([x, y]) => this.baseBlocked.add(`${x},${y}`));
    });
    this.blocked = new Set([...this.baseBlocked, ...this.objectBlocked]);
  }

  refreshEnclosureGeometry() {
    this.refreshBlockedSets();
    if (!this.structureLayer) return;
    const { width, height } = this.definition;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (this.baseBlocked.has(`${x},${y}`)) this.structureLayer.putTileAt(TILE.wall, x, y);
        else this.structureLayer.removeTileAt(x, y);
      }
    }
    this.structureLayer.setCollision(TILE.wall);
  }

  getSpawn(entranceId) {
    const spawn = this.definition.layers.spawns.entrances[entranceId];
    if (!spawn) throw new Error(`Unknown entrance ${entranceId} on ${this.definition.id}`);
    return { x: (spawn.tileX + 0.5) * GRID_SIZE, y: (spawn.tileY + 1) * GRID_SIZE, facing: spawn.facing };
  }
}
