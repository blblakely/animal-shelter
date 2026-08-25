import { describe, expect, it } from 'vitest';
import { ANIMALS } from '../src/data/animals.js';
import { SPECIES } from '../src/data/species.js';
import { getMapDefinition } from '../src/data/maps.js';

describe('animal data contracts', () => {
  it('uses unique IDs and registered species', () => {
    expect(new Set(ANIMALS.map((animal) => animal.id)).size).toBe(ANIMALS.length);
    ANIMALS.forEach((animal) => expect(SPECIES[animal.speciesId]).toBeDefined());
  });

  it('places every animal in a declared enclosure and navigation region', () => {
    ANIMALS.forEach((animal) => {
      const map = getMapDefinition(animal.location.mapId);
      const enclosure = map.layers.enclosures.objects.find(({ id }) => id === animal.location.enclosureId);
      const navigation = map.layers.animalNavigation.objects.find(({ enclosureId }) => enclosureId === animal.location.enclosureId);
      expect(enclosure?.animalIds).toContain(animal.id);
      expect(navigation).toBeDefined();
      expect(animal.location.spawn.tileX).toBeGreaterThanOrEqual(navigation.tileX);
      expect(animal.location.spawn.tileX).toBeLessThan(navigation.tileX + navigation.width);
      expect(animal.location.spawn.tileY).toBeGreaterThanOrEqual(navigation.tileY);
      expect(animal.location.spawn.tileY).toBeLessThan(navigation.tileY + navigation.height);
    });
  });

  it('keeps starting need values in the 0–100 range', () => {
    ANIMALS.forEach((animal) => {
      Object.values(animal.needs).forEach((value) => expect(value).toBeGreaterThanOrEqual(0));
      Object.values(animal.needs).forEach((value) => expect(value).toBeLessThanOrEqual(100));
    });
  });
});
