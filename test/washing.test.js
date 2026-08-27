import { describe, expect, it } from 'vitest';
import { CARE_ACTIONS } from '../src/data/careActions.js';
import { CARE_STATIONS } from '../src/data/careStations.js';
import { getEnclosureDefinition } from '../src/data/enclosures.js';
import { SPECIES } from '../src/data/species.js';
import { canStartCareAction, applyCareActionCompletion } from '../src/systems/CareActionBehavior.js';
import { findGridPath } from '../src/systems/GridPathfinder.js';
import { cellKey, footprintCells } from '../src/systems/GridCells.js';
import { StationReservationState } from '../src/systems/StationReservationState.js';

const animal = (cleanliness = 40, behavior = 'Relaxing') => ({
  id: 'dog-maple', speciesId: 'dog', currentBehavior: behavior,
  needs: { hunger: 70, cleanliness, happiness: 70, health: 95, energy: 60, social: 55 },
});

describe('physical washing foundation', () => {
  const action = CARE_ACTIONS.wash;
  const station = CARE_STATIONS[0];
  const enclosure = getEnclosureDefinition('meet-and-greet-yard');
  const routeDefinition = enclosure.careRoutes[0];

  it('defines a reusable data-driven care action', () => {
    expect(action).toMatchObject({ requiredStationType: 'washing_station', durationMs: 2800, reservationRequired: true });
    expect(JSON.parse(JSON.stringify(action))).toEqual(action);
  });

  it('defines a visible station footprint and separate interaction positions', () => {
    expect(station.sprite.path.endsWith('.png')).toBe(true);
    expect(footprintCells(station)).toHaveLength(4);
    expect(station.playerInteractionPositions[0]).not.toEqual(station.animalInteractionPositions[0]);
    expect(station.collisionBehavior).toBe('footprint');
  });

  it('allows washing only for a compatible animal that needs it', () => {
    expect(canStartCareAction(action, animal(60), SPECIES.dog, station)).toBe(true);
    expect(canStartCareAction(action, animal(100), SPECIES.dog, station)).toBe(false);
    expect(canStartCareAction(action, animal(60, 'Eating'), SPECIES.dog, station)).toBe(false);
  });

  it('reserves the station exclusively and releases it', () => {
    const reservation = new StationReservationState();
    expect(reservation.reserve('dog-maple')).toBe(true);
    expect(reservation.reserve('dog-other')).toBe(false);
    expect(reservation.release('dog-other')).toBe(false);
    expect(reservation.release('dog-maple')).toBe(true);
    expect(reservation.reservedBy).toBeNull();
  });

  it('uses a contiguous authorized route through the gate without crossing fence cells', () => {
    const allowed = new Set([...enclosure.animalNavigationCells, ...routeDefinition.authorizedCells].map(cellKey));
    const blocked = new Set(enclosure.boundaryCells.map(cellKey));
    const path = findGridPath([9, 8], station.animalInteractionPositions[0], (cell) => allowed.has(cellKey(cell)) && !blocked.has(cellKey(cell)));
    expect(path.length).toBeGreaterThan(2);
    expect(path.map(cellKey)).toContain(cellKey(routeDefinition.gateCell));
    path.forEach((cell, index) => {
      expect(blocked.has(cellKey(cell))).toBe(false);
      if (index > 0) expect(Math.abs(cell[0] - path[index - 1][0]) + Math.abs(cell[1] - path[index - 1][1])).toBe(1);
    });
  });

  it('has a physical reverse route back into the enclosure', () => {
    const allowed = new Set([...enclosure.animalNavigationCells, ...routeDefinition.authorizedCells].map(cellKey));
    const path = findGridPath(station.animalInteractionPositions[0], [9, 8], (cell) => allowed.has(cellKey(cell)));
    expect(path.at(-1)).toEqual([9, 8]);
    expect(path.map(cellKey)).toContain(cellKey(routeDefinition.gateCell));
  });

  it('does not change cleanliness until completion is explicitly applied', () => {
    const maple = animal(40);
    const before = structuredClone(maple.needs);
    expect(maple.needs).toEqual(before);
    applyCareActionCompletion(action, maple.needs);
    expect(maple.needs.cleanliness).toBe(78);
    expect(maple.needs.happiness).toBe(73);
  });

  it('keeps cancellation reward-free when completion is not applied', () => {
    const maple = animal(40);
    const reservation = new StationReservationState();
    reservation.reserve(maple.id);
    reservation.release(maple.id);
    expect(maple.needs.cleanliness).toBe(40);
    expect(reservation.reservedBy).toBeNull();
  });
});
