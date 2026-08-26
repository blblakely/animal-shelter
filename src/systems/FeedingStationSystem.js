import Phaser from 'phaser';
import { GRID_SIZE } from '../config/constants.js';
import { getAnimalsForMap } from '../data/animals.js';
import { getFeedingStationsForMap } from '../data/feedingStations.js';
import { getFoodDefinition, isFoodCompatible } from '../data/foods.js';
import { getSpeciesDefinition } from '../data/species.js';
import { completePhysicalFeeding } from './FeedingBehavior.js';
import { FeedingStationState } from './FeedingStationState.js';

const worldPoint = ({ tileX, tileY }) => ({
  x: (tileX + 0.5) * GRID_SIZE,
  y: (tileY + 0.5) * GRID_SIZE,
});

class FeedingStationView extends Phaser.GameObjects.Sprite {
  constructor(scene, definition, state) {
    const position = worldPoint(definition);
    super(scene, position.x, position.y, definition.sprite.key, definition.sprite.emptyFrame);
    scene.add.existing(this);
    this.definition = definition;
    this.state = state;
    this.setDepth(4);
    this.syncVisual();
  }

  syncVisual() {
    this.setFrame(this.state.isFilled ? this.definition.sprite.filledFrame : this.definition.sprite.emptyFrame);
  }

  get playerInteractionPoint() { return worldPoint(this.definition.playerInteraction); }
  get animalUsePoint() { return worldPoint(this.definition.animalUse); }
}

export class FeedingStationSystem {
  constructor(scene, mapManager) {
    this.scene = scene;
    this.mapManager = mapManager;
    this.stations = [];
    this.stateStore = scene.registry.get('feedingStationStates') ?? new Map();
    scene.registry.set('feedingStationStates', this.stateStore);
  }

  create() {
    getFeedingStationsForMap(this.mapManager.definition.id).forEach((definition) => {
      const state = this.stateStore.get(definition.id) ?? new FeedingStationState();
      this.stateStore.set(definition.id, state);
      this.stations.push(new FeedingStationView(this.scene, definition, state));
    });
    return this;
  }

  findNearestInteraction(x, y, maximumDistance) {
    let nearest = null;
    let distanceToNearest = maximumDistance;
    this.stations.forEach((station) => {
      const point = station.playerInteractionPoint;
      const distance = Phaser.Math.Distance.Between(x, y, point.x, point.y);
      if (distance < distanceToNearest) {
        nearest = station;
        distanceToNearest = distance;
      }
    });
    return nearest;
  }

  fill(station, foodId) {
    const changed = station.state.fill(foodId);
    station.syncVisual();
    return changed;
  }

  getAvailableStation(animalData, species) {
    return this.stations.find((station) => {
      if (station.definition.animalId !== animalData.id || !station.state.isFilled) return false;
      const food = getFoodDefinition(station.state.foodId);
      return isFoodCompatible(food, species) && (!station.state.reservedBy || station.state.reservedBy === animalData.id);
    }) ?? null;
  }

  reserve(station, animalId) { return station.state.reserve(animalId); }

  release(station, animalId) { return station?.state.release(animalId) ?? false; }

  completeFeeding(station, animal) {
    const food = getFoodDefinition(station.state.foodId);
    const completed = completePhysicalFeeding({
      stationState: station.state,
      animalId: animal.animalData.id,
      animalNeeds: animal.animalData.needs,
      food,
      species: animal.species,
      position: { x: animal.x, y: animal.y },
      target: station.animalUsePoint,
    });
    station.syncVisual();
    return completed;
  }

  getOwner(station) {
    return getAnimalsForMap(this.mapManager.definition.id).find(({ id }) => id === station.definition.animalId) ?? null;
  }

  isDefaultFoodCompatible(station) {
    const owner = this.getOwner(station);
    if (!owner) return false;
    return isFoodCompatible(getFoodDefinition(station.definition.defaultFoodId), getSpeciesDefinition(owner.speciesId));
  }
}
