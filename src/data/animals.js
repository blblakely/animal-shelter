export const ANIMALS = [
  {
    id: 'dog-maple',
    name: 'Maple',
    speciesId: 'dog',
    breed: 'Mixed breed',
    age: { years: 3, lifeStage: 'Adult' },
    appearance: { coat: 'Golden brown and cream', accessory: 'Red collar' },
    traits: ['Gentle', 'Curious'],
    needs: {
      hunger: 78,
      cleanliness: 84,
      happiness: 72,
      health: 95,
      energy: 68,
      social: 55,
    },
    relationships: { people: {}, animals: {} },
    currentBehavior: 'Idle',
    medicalRequirements: [],
    adoptionAvailable: false,
    location: {
      mapId: 'shelter_grounds',
      enclosureId: 'meet-and-greet-yard',
      spawn: { tileX: 9, tileY: 8 },
    },
  },
];

export function getAnimalsForMap(mapId) {
  return ANIMALS.filter((animal) => animal.location.mapId === mapId);
}
