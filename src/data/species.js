export const SPECIES = {
  dog: {
    id: 'dog',
    displayName: 'Dog',
    sprite: {
      key: 'temporary-dog',
      path: 'assets/temporary-dog.png',
      frameWidth: 64,
      frameHeight: 64,
      framesPerDirection: 4,
    },
    movement: {
      speed: 58,
      animationFrameRate: 5,
      idleDurationMs: [900, 2400],
    },
    needs: {
      ratesPerGameHour: {
        hunger: -12,
        cleanliness: -0.6,
        happiness: -1.2,
        health: 0,
        social: -1.5,
      },
      energyRatesPerGameHour: {
        Exploring: -7,
        'Seeking food': -5,
        Eating: 0,
        Resting: 18,
        Relaxing: 2,
        Hungry: -2,
        default: 0,
      },
    },
    behavior: {
      priority: ['food', 'rest'],
      hungryBelow: 68,
      tiredBelow: 30,
      restedAt: 62,
      eatingDurationMs: 2400,
      eatingAnimationFrames: [12, 13],
    },
    collider: { width: 24, height: 14, offsetX: 20, offsetY: 46 },
    dietTags: ['omnivore', 'dog-food'],
    compatibleEnrichmentTags: ['chew', 'fetch', 'snuffle'],
    minimumSpaceTiles: 12,
  },
};

export function getSpeciesDefinition(speciesId) {
  const species = SPECIES[speciesId];
  if (!species) throw new Error(`Unknown species: ${speciesId}`);
  return species;
}
