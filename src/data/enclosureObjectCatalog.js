import { cloneSerializable } from '../systems/GridCells.js';

export const ENCLOSURE_OBJECT_CATALOG = {
  'dog-food-bowl': {
    id: 'dog-food-bowl',
    displayName: 'Dog Food Bowl',
    objectType: 'feeding_station',
    compatibleSpecies: ['dog'],
    collisionBehavior: 'none',
    walkable: true,
    movable: true,
    rotatable: false,
    removable: true,
    required: false,
    gameplayEffects: ['holds-food', 'restores-hunger'],
    sprite: {
      key: 'temporary-food-bowl',
      path: 'assets/temporary-food-bowl.png',
      frameWidth: 32,
      frameHeight: 32,
      emptyFrame: 0,
      filledFrame: 1,
    },
  },
  'fixed-dog-wash-station': {
    id: 'fixed-dog-wash-station',
    displayName: 'Dog Washing Station',
    objectType: 'washing_station',
    compatibleSpecies: ['dog'],
    collisionBehavior: 'footprint',
    walkable: false,
    movable: false,
    rotatable: false,
    removable: false,
    required: true,
    gameplayEffects: ['supports-washing', 'restores-cleanliness'],
    itemTags: ['water', 'soap'],
    sprite: {
      key: 'temporary-wash-station',
      path: 'assets/temporary-wash-station.png',
    },
  },
};

export function createPlacedObject(instance) {
  const catalog = ENCLOSURE_OBJECT_CATALOG[instance.catalogId];
  if (!catalog) throw new Error(`Unknown enclosure object catalog item: ${instance.catalogId}`);
  return {
    ...cloneSerializable(catalog),
    ...cloneSerializable(instance),
    sprite: { ...cloneSerializable(catalog.sprite), ...cloneSerializable(instance.sprite ?? {}) },
    reservation: instance.reservation ?? { reservedBy: null },
  };
}
