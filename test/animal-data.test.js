import { describe, expect, it } from 'vitest';
import { ANIMALS } from '../src/data/animals.js';
import { SPECIES } from '../src/data/species.js';
import { getEnclosureDefinition } from '../src/data/enclosures.js';
import { cellKey } from '../src/systems/GridCells.js';

describe('animal data contracts', () => {
  it('uses unique IDs and registered species', () => {
    expect(new Set(ANIMALS.map((animal) => animal.id)).size).toBe(ANIMALS.length);
    ANIMALS.forEach((animal) => expect(SPECIES[animal.speciesId]).toBeDefined());
  });

  it('places every animal in a declared cell-based enclosure and navigation region', () => {
    ANIMALS.forEach((animal) => {
      const enclosure = getEnclosureDefinition(animal.location.enclosureId);
      expect(enclosure.mapId).toBe(animal.location.mapId);
      expect(enclosure.allowedSpecies).toContain(animal.speciesId);
      expect(new Set(enclosure.animalNavigationCells.map(cellKey)).has(cellKey(animal.location.spawn))).toBe(true);
    });
  });

  it('keeps starting need values in the 0–100 range', () => {
    ANIMALS.forEach((animal) => {
      Object.values(animal.needs).forEach((value) => expect(value).toBeGreaterThanOrEqual(0));
      Object.values(animal.needs).forEach((value) => expect(value).toBeLessThanOrEqual(100));
    });
  });
});
