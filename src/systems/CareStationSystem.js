import Phaser from 'phaser';
import { GRID_SIZE } from '../config/constants.js';
import { getCareStationsForMap } from '../data/careStations.js';
import { StationReservationState } from './StationReservationState.js';

const worldPoint = ({ tileX, tileY }) => ({
  x: (tileX + 0.5) * GRID_SIZE,
  y: (tileY + 0.5) * GRID_SIZE,
});

const animalFootPoint = ({ tileX, tileY }) => ({
  x: (tileX + 0.5) * GRID_SIZE,
  y: tileY * GRID_SIZE + 4,
});

class CareStationView extends Phaser.GameObjects.Image {
  constructor(scene, definition, reservation) {
    const width = definition.footprint.width * GRID_SIZE;
    const height = definition.footprint.height * GRID_SIZE;
    const x = definition.tileX * GRID_SIZE + width / 2;
    const y = definition.tileY * GRID_SIZE + height / 2;
    super(scene, x, y, definition.sprite.key);
    scene.add.existing(this);
    this.definition = definition;
    this.reservation = reservation;
    this.setDisplaySize(88, 88).setDepth(7);
    this.collisionZone = scene.add.zone(x, y + 8, width - 6, height - 16);
    scene.physics.add.existing(this.collisionZone, true);
  }

  get playerInteractionPoint() { return worldPoint(this.definition.playerInteractionPositions[0]); }
  get animalInteractionPoint() { return animalFootPoint(this.definition.animalInteractionPositions[0]); }
}

export class CareStationSystem {
  constructor(scene, mapManager) {
    this.scene = scene;
    this.mapManager = mapManager;
    this.stations = [];
    this.stateStore = scene.registry.get('careStationStates') ?? new Map();
    scene.registry.set('careStationStates', this.stateStore);
  }

  create() {
    getCareStationsForMap(this.mapManager.definition.id).forEach((definition) => {
      const saved = this.stateStore.get(definition.instanceId);
      const state = saved instanceof StationReservationState
        ? saved
        : new StationReservationState(saved?.reservedBy ?? null);
      this.stateStore.set(definition.instanceId, state);
      this.stations.push(new CareStationView(this.scene, definition, state));
    });
    return this;
  }

  connectPlayerCollision(player) {
    this.stations.forEach((station) => this.scene.physics.add.collider(player, station.collisionZone));
  }

  findNearestInteraction(x, y, maximumDistance) {
    let nearest = null;
    let nearestDistance = maximumDistance;
    this.stations.forEach((station) => {
      const point = station.playerInteractionPoint;
      const distance = Phaser.Math.Distance.Between(x, y, point.x, point.y);
      if (distance < nearestDistance) { nearest = station; nearestDistance = distance; }
    });
    return nearest;
  }

  getAvailable(typeId, speciesId) {
    return this.stations.find((station) => (
      station.definition.objectType === typeId
      && station.definition.compatibleSpecies.includes(speciesId)
      && !station.reservation.reservedBy
    )) ?? null;
  }

  reserve(station, animalId) { return station?.reservation.reserve(animalId) ?? false; }
  release(station, animalId) { return station?.reservation.release(animalId) ?? false; }
}
