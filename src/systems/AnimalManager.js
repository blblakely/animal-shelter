import Phaser from 'phaser';
import { GRID_SIZE } from '../config/constants.js';
import { getAnimalsForMap } from '../data/animals.js';
import { getSpeciesDefinition } from '../data/species.js';
import { Animal } from '../entities/Animal.js';
import { AnimalNavigationSystem } from './AnimalNavigationSystem.js';
import { AnimalNeedsSystem } from './AnimalNeedsSystem.js';

export class AnimalManager {
  constructor(scene, mapManager, feedingStations, enclosureRegistry) {
    this.scene = scene;
    this.mapManager = mapManager;
    this.feedingStations = feedingStations;
    this.enclosureRegistry = enclosureRegistry;
    this.needsSystem = new AnimalNeedsSystem();
    this.animals = [];
  }

  create() {
    getAnimalsForMap(this.mapManager.definition.id).forEach((animalData) => {
      const enclosure = this.enclosureRegistry.get(animalData.location.enclosureId);
      if (!enclosure) throw new Error(`Missing enclosure for ${animalData.id}`);
      const species = getSpeciesDefinition(animalData.speciesId);
      const spawn = animalData.location.spawn;
      const animal = new Animal(
        this.scene,
        (spawn.tileX + 0.5) * GRID_SIZE,
        (spawn.tileY + 0.5) * GRID_SIZE,
        animalData,
        species,
        new AnimalNavigationSystem(this.mapManager, enclosure),
        this.feedingStations,
      );
      this.scene.physics.add.collider(animal, this.mapManager.structureLayer);
      this.animals.push(animal);
    });
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.animals.forEach((animal) => animal.releaseStation());
    });
    return this;
  }

  update(time, elapsedGameMinutes) {
    this.animals.forEach((animal) => {
      this.needsSystem.update(animal.animalData, animal.species, animal.animalData.currentBehavior, elapsedGameMinutes);
      animal.update(time);
    });
  }

  findNearest(x, y, maximumDistance) {
    let nearest = null;
    let nearestDistance = maximumDistance;
    this.animals.forEach((animal) => {
      const distance = Phaser.Math.Distance.Between(x, y, animal.x, animal.y);
      if (distance < nearestDistance) {
        nearest = animal;
        nearestDistance = distance;
      }
    });
    return nearest;
  }
}
