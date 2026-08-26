import { describe, expect, it } from 'vitest';
import { FEEDING_STATIONS } from '../src/data/feedingStations.js';
import { FOODS, isFoodCompatible } from '../src/data/foods.js';
import { getMapDefinition } from '../src/data/maps.js';
import { SPECIES } from '../src/data/species.js';
import { completePhysicalFeeding } from '../src/systems/FeedingBehavior.js';
import { FeedingStationState } from '../src/systems/FeedingStationState.js';

describe('feeding foundation', () => {
  it('validates basic dog food against dog diet tags', () => {
    expect(isFoodCompatible(FOODS.basicDogFood, SPECIES.dog)).toBe(true);
    expect(isFoodCompatible({ compatibleDietTags: ['herbivore'] }, SPECIES.dog)).toBe(false);
  });

  it('places the bowl footprint and interaction point inside the enclosure', () => {
    const bowl = FEEDING_STATIONS[0];
    const map = getMapDefinition(bowl.mapId);
    const enclosure = map.layers.enclosures.objects.find(({ id }) => id === bowl.enclosureId);
    for (const point of [bowl, bowl.playerInteraction, bowl.animalUse]) {
      expect(point.tileX).toBeGreaterThanOrEqual(enclosure.tileX);
      expect(point.tileX).toBeLessThan(enclosure.tileX + enclosure.width);
      expect(point.tileY).toBeGreaterThanOrEqual(enclosure.tileY);
      expect(point.tileY).toBeLessThan(enclosure.tileY + enclosure.height);
    }
    expect(map.layers.structure.blocked).not.toContainEqual([bowl.tileX, bowl.tileY]);
  });

  it('begins empty, fills without changing hunger, and reserves exclusively', () => {
    const state = new FeedingStationState();
    const needs = { hunger: 40 };
    expect(state.isFilled).toBe(false);
    expect(state.fill(FOODS.basicDogFood.id)).toBe(true);
    expect(needs.hunger).toBe(40);
    expect(state.reserve('dog-maple')).toBe(true);
    expect(state.reserve('another-dog')).toBe(false);
  });

  it('cannot feed from a distance and keeps the reservation', () => {
    const state = new FeedingStationState();
    const needs = { hunger: 40 };
    state.fill(FOODS.basicDogFood.id);
    state.reserve('dog-maple');
    const completed = completePhysicalFeeding({
      stationState: state,
      animalId: 'dog-maple',
      animalNeeds: needs,
      food: FOODS.basicDogFood,
      species: SPECIES.dog,
      position: { x: 0, y: 0 },
      target: { x: 100, y: 100 },
    });
    expect(completed).toBe(false);
    expect(needs.hunger).toBe(40);
    expect(state.isFilled).toBe(true);
    expect(state.reservedBy).toBe('dog-maple');
  });

  it('improves hunger only at the bowl, empties it, and releases the reservation', () => {
    const state = new FeedingStationState();
    const needs = { hunger: 76 };
    state.fill(FOODS.basicDogFood.id);
    state.reserve('dog-maple');
    const completed = completePhysicalFeeding({
      stationState: state,
      animalId: 'dog-maple',
      animalNeeds: needs,
      food: FOODS.basicDogFood,
      species: SPECIES.dog,
      position: { x: 100, y: 100 },
      target: { x: 104, y: 103 },
    });
    expect(completed).toBe(true);
    expect(needs.hunger).toBe(100);
    expect(state.isFilled).toBe(false);
    expect(state.reservedBy).toBeNull();
  });
});
