import { DEBUG_DEFAULT, GRID_SIZE } from '../config/constants.js';
import { footprintCells } from './GridCells.js';

const fillCells = (graphics, cells) => cells.forEach(([x, y]) => graphics.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE));
const point = ({ tileX, tileY }) => ({ x: (tileX + 0.5) * GRID_SIZE, y: (tileY + 0.5) * GRID_SIZE });

export class DebugOverlay {
  constructor(scene, mapManager, transitionManager, player, animalManager, feedingStations, careStations, enclosureRegistry, careActions) {
    this.scene = scene;
    this.map = mapManager;
    this.transitions = transitionManager;
    this.player = player;
    this.animalManager = animalManager;
    this.feedingStations = feedingStations;
    this.careStations = careStations;
    this.enclosures = enclosureRegistry;
    this.careActions = careActions;
    this.enabled = DEBUG_DEFAULT;
    this.graphics = scene.add.graphics().setDepth(100);
    this.bodyGraphics = scene.add.graphics().setDepth(102);
    this.label = scene.add.text(14, 14, '', { fontFamily: 'monospace', fontSize: '13px', color: '#ffffff', backgroundColor: '#14211dee', padding: { x: 8, y: 6 } }).setScrollFactor(0).setDepth(101);
    this.key = scene.input.keyboard.addKey('D');
    this.key.on('down', () => { this.enabled = !this.enabled; this.draw(); });
    this.unsubscribe = enclosureRegistry.onChange(() => this.draw());
    this.draw();
  }

  draw() {
    this.graphics.clear();
    this.bodyGraphics.clear();
    this.label.setVisible(this.enabled);
    if (!this.enabled) return;
    const { width, height, layers } = this.map.definition;
    this.graphics.lineStyle(1, 0xffffff, 0.15);
    for (let x = 0; x <= width; x += 1) this.graphics.lineBetween(x * GRID_SIZE, 0, x * GRID_SIZE, height * GRID_SIZE);
    for (let y = 0; y <= height; y += 1) this.graphics.lineBetween(0, y * GRID_SIZE, width * GRID_SIZE, y * GRID_SIZE);
    this.graphics.fillStyle(0xff4d5d, 0.32);
    layers.structure.blocked.forEach(([x, y]) => this.graphics.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE));
    this.graphics.fillStyle(0xffd34e, 0.45);
    this.transitions.zones.forEach((zone) => this.graphics.fillRect(zone.x - zone.width / 2, zone.y - zone.height / 2, zone.width, zone.height));
    this.graphics.fillStyle(0x4ea5ff, 0.85);
    Object.values(layers.spawns.entrances).forEach((spawn) => this.graphics.fillCircle((spawn.tileX + .5) * GRID_SIZE, (spawn.tileY + .5) * GRID_SIZE, 6));

    this.enclosures.forMap(this.map.definition.id).forEach((enclosure) => {
      this.graphics.fillStyle(0x64df85, 0.18); fillCells(this.graphics, enclosure.definition.interiorCells);
      this.graphics.fillStyle(0xf15a62, 0.48); fillCells(this.graphics, enclosure.definition.boundaryCells);
      this.graphics.fillStyle(0x46a9ff, 0.6); fillCells(this.graphics, enclosure.definition.gateCells);
      this.graphics.fillStyle(0x54f4e3, 0.18); fillCells(this.graphics, enclosure.getPlacementCells());
      this.graphics.fillStyle(0xffb347, 0.42);
      enclosure.definition.installedObjects.forEach((object) => {
        fillCells(this.graphics, footprintCells(object));
        this.graphics.fillStyle(0xffffff, 0.95);
        object.playerInteractionPositions.forEach((position) => { const world = point(position); this.graphics.fillCircle(world.x, world.y, 5); });
        this.graphics.fillStyle(0xff85f3, 0.95);
        object.animalInteractionPositions.forEach((position) => { const world = point(position); this.graphics.fillCircle(world.x, world.y, 4); });
        this.graphics.fillStyle(0xffb347, 0.42);
      });
      const authorized = enclosure.definition.careRoutes.flatMap((route) => route.authorizedCells);
      this.graphics.fillStyle(0x58a9ff, 0.16); fillCells(this.graphics, authorized);
    });

    this.graphics.fillStyle(0x29d4c6, 0.45);
    this.careStations.stations.forEach((station) => {
      fillCells(this.graphics, footprintCells(station.definition));
      this.graphics.fillStyle(0xffffff, 1).fillCircle(station.playerInteractionPoint.x, station.playerInteractionPoint.y, 6);
      this.graphics.fillStyle(0xff85f3, 1).fillCircle(station.animalInteractionPoint.x, station.animalInteractionPoint.y, 5);
      this.graphics.fillStyle(0x29d4c6, 0.45);
    });
  }

  update() {
    this.bodyGraphics.clear();
    if (!this.enabled) return;
    const body = this.player.body;
    this.bodyGraphics.lineStyle(2, 0x55e8ff, 1).strokeRect(body.x, body.y, body.width, body.height);
    this.bodyGraphics.lineStyle(2, 0xff8bf3, 1);
    this.animalManager.animals.forEach((animal) => {
      this.bodyGraphics.strokeRect(animal.body.x, animal.body.y, animal.body.width, animal.body.height);
      const route = [animal.target, ...animal.route].filter(Boolean);
      if (route.length) {
        this.bodyGraphics.lineStyle(2, 0x74f3ff, 0.9);
        let previous = { x: animal.x, y: animal.y };
        route.forEach((target) => {
          this.bodyGraphics.lineBetween(previous.x, previous.y, target.x, target.y);
          this.bodyGraphics.fillStyle(0x74f3ff, 1).fillCircle(target.x, target.y, 4);
          previous = target;
        });
      }
    });
    const animalLines = this.animalManager.animals.map((animal) => `${animal.animalData.name}: ${animal.animalData.currentBehavior} [${animal.routeKind ?? 'normal'}]`);
    const bowlLines = this.feedingStations.stations.map((station) => `${station.definition.displayName}: ${station.state.status}, reserved ${station.state.reservedBy ?? 'none'}`);
    const careLines = this.careStations.stations.map((station) => `${station.definition.displayName}: reserved ${station.reservation.reservedBy ?? 'none'}`);
    const assignment = this.careActions.assignment;
    this.label.setText([
      'DEBUG [D]',
      'Green interior · Red fence · Blue gate/care route',
      'Cyan placement · Orange occupied · Teal wash station',
      'White player interaction · Pink animal interaction',
      `Authorized navigation: ${assignment ? 'NORMAL + CARE ROUTE' : 'NORMAL ENCLOSURE ONLY'}`,
      ...animalLines,
      ...bowlLines,
      ...careLines,
      `Care: ${assignment?.phase ?? 'none'}`,
    ]);
  }
}
