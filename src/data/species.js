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
