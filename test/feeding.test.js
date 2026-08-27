import { describe, expect, it } from 'vitest';
import { FEEDING_STATIONS } from '../src/data/feedingStations.js';
import { FOODS, isFoodCompatible } from '../src/data/foods.js';
import { getEnclosureDefinition } from '../src/data/enclosures.js';
import { SPECIES } from '../src/data/species.js';
import { EnclosureState } from '../src/systems/EnclosureSystem.js';
import { completePhysicalFeeding } from '../src/systems/FeedingBehavior.js';
import { FeedingStationState } from '../src/systems/FeedingStationState.js';

describe('feeding foundation', () => {
  it('validates basic dog food against dog diet tags', () => {
    expect(isFoodCompatible(FOODS.basicDogFood, SPECIES.dog)).toBe(true);
    expect(isFoodCompatible({ compatibleDietTags: ['herbivore'] }, SPECIES.dog)).toBe(false);
  });

  it('places the bowl footprint and interaction point inside the enclosure', () => {
    const bowl = FEEDING_STATIONS[0];
    const definition = getEnclosureDefinition(bowl.enclosureId);
    const enclosure = new EnclosureState({
      ...definition,
      installedObjects: definition.installedObjects.filter(({ instanceId }) => instanceId !== bowl.id),
    });
    for (const point of [bowl, bowl.playerInteraction, bowl.animalUse]) {
      expect(enclosure.isInterior(point)).toBe(true);
    }
    expect(enclosure.canPlaceObject(bowl).allowed).toBe(true);
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
