export const FEEDING_STATIONS = [
  {
    id: 'maple-food-bowl',
    displayName: "Maple's Bowl",
    mapId: 'shelter_grounds',
    enclosureId: 'meet-and-greet-yard',
    animalId: 'dog-maple',
    defaultFoodId: 'basic-dog-food',
    tileX: 7,
    tileY: 7,
    footprint: { width: 1, height: 1 },
    playerInteraction: { tileX: 7, tileY: 8 },
    animalUse: { tileX: 7, tileY: 8, facing: 'up' },
    sprite: {
      key: 'temporary-food-bowl',
      path: 'assets/temporary-food-bowl.png',
      frameWidth: 32,
      frameHeight: 32,
      emptyFrame: 0,
      filledFrame: 1,
    },
  },
];

export function getFeedingStationsForMap(mapId) {
  return FEEDING_STATIONS.filter((station) => station.mapId === mapId);
}
