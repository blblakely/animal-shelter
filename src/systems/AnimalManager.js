import Phaser from 'phaser';
import { GRID_SIZE } from '../config/constants.js';
import { getAnimalsForMap } from '../data/animals.js';
import { getSpeciesDefinition } from '../data/species.js';
import { Animal } from '../entities/Animal.js';
import { AnimalNavigationSystem } from './AnimalNavigationSystem.js';

export class AnimalManager {
  constructor(scene, mapManager) {
    this.scene = scene;
    this.mapManager = mapManager;
    this.animals = [];
  }

  create() {
    const navigationRegions = this.mapManager.definition.layers.animalNavigation.objects;
    getAnimalsForMap(this.mapManager.definition.id).forEach((animalData) => {
      const region = navigationRegions.find((candidate) => candidate.enclosureId === animalData.location.enclosureId);
      if (!region) throw new Error(`Missing navigation region for ${animalData.id}`);
      const species = getSpeciesDefinition(animalData.speciesId);
      const spawn = animalData.location.spawn;
      const animal = new Animal(
        this.scene,
        (spawn.tileX + 0.5) * GRID_SIZE,
        (spawn.tileY + 0.5) * GRID_SIZE,
        animalData,
        species,
        new AnimalNavigationSystem(this.mapManager, region),
      );
      this.scene.physics.add.collider(animal, this.mapManager.structureLayer);
      this.animals.push(animal);
    });
    return this;
  }

  update(time) {
    this.animals.forEach((animal) => animal.update(time));
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
