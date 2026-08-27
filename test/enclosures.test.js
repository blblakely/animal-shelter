import { describe, expect, it } from 'vitest';
import { getEnclosureDefinition } from '../src/data/enclosures.js';
import { createPlacedObject } from '../src/data/enclosureObjectCatalog.js';
import { EnclosureState } from '../src/systems/EnclosureSystem.js';
import { cellKey } from '../src/systems/GridCells.js';

const makeObject = (overrides = {}) => createPlacedObject({
  instanceId: 'test-bowl', catalogId: 'dog-food-bowl', enclosureId: 'test-l', mapId: 'test',
  tileX: 1, tileY: 1, footprint: { width: 1, height: 1, cells: [[0, 0]] }, rotation: 0,
  playerInteractionPositions: [{ tileX: 1, tileY: 2 }],
  animalInteractionPositions: [{ tileX: 1, tileY: 2 }],
  ...overrides,
});

const lShape = (objects = []) => ({
  id: 'test-l', displayName: 'L Yard', mapId: 'test', allowedSpecies: ['dog', 'cat'],
  interiorCells: [[1, 1], [2, 1], [3, 1], [1, 2], [1, 3]],
  boundaryCells: [[0, 1], [0, 2], [0, 3], [1, 0], [2, 0], [3, 0]],
  gateCells: [[1, 4]],
  flooringCells: [],
  capacity: { current: 2, mode: 'manual', usableAreaModifiers: [], minimumUsableFloorCellsPerAnimalBySpecies: { dog: 4, cat: 2 } },
  spawnPositions: [{ id: 'default', tileX: 1, tileY: 1 }],
  restPositions: [{ id: 'default', tileX: 1, tileY: 2 }],
  animalNavigationCells: [[1, 1], [2, 1], [3, 1], [1, 2], [1, 3]],
  animalInteractionPositions: [], publicViewingPositions: [], requiredGateClearanceCells: [[1, 3]],
  reservedCells: [], installedObjects: objects, careRoutes: [],
});

describe('data-driven enclosures', () => {
  it('represents a nonrectangular L-shaped interior as a cell set', () => {
    const enclosure = new EnclosureState(lShape());
    expect(enclosure.isInterior([1, 3])).toBe(true);
    expect(enclosure.isInterior([2, 2])).toBe(false);
  });

  it('distinguishes interior, fence, and gate cells', () => {
    const enclosure = new EnclosureState(lShape());
    expect(enclosure.isInterior([1, 1])).toBe(true);
    expect(enclosure.isFence([0, 1])).toBe(true);
    expect(enclosure.isGate([1, 4])).toBe(true);
  });

  it('keeps object placement records serializable', () => {
    const object = makeObject();
    expect(JSON.parse(JSON.stringify(object))).toEqual(object);
    expect(object).toMatchObject({ instanceId: 'test-bowl', catalogId: 'dog-food-bowl', rotation: 0 });
  });

  it('derives occupied cells from installed-object footprints', () => {
    const enclosure = new EnclosureState(lShape([makeObject()]));
    expect(enclosure.isOccupied([1, 1])).toBe(true);
    expect(enclosure.getObjectAt([1, 1]).instanceId).toBe('test-bowl');
  });

  it('rejects placement on fence cells', () => {
    expect(new EnclosureState(lShape()).canPlaceObject(makeObject({ tileX: 0, tileY: 1 })).allowed).toBe(false);
  });

  it('rejects object overlap', () => {
    const enclosure = new EnclosureState(lShape([makeObject({ instanceId: 'existing' })]));
    expect(enclosure.canPlaceObject(makeObject()).reason).toBe('occupied-cell');
  });

  it('protects required gate-clearance cells', () => {
    const enclosure = new EnclosureState(lShape());
    expect(enclosure.canPlaceObject(makeObject({ tileX: 1, tileY: 3 })).reason).toBe('required-gate-clearance');
  });

  it('refreshes animal-walkable cells after installed objects change', () => {
    const enclosure = new EnclosureState(lShape());
    expect(enclosure.isAnimalWalkable([2, 1])).toBe(true);
    enclosure.mutate((definition) => definition.installedObjects.push(makeObject({ tileX: 2, tileY: 1, walkable: false })));
    expect(enclosure.isAnimalWalkable([2, 1])).toBe(false);
  });

  it('retains species-aware capacity data and current manual capacity', () => {
    const enclosure = new EnclosureState(lShape());
    expect(enclosure.getCapacityForSpecies('dog')).toBe(2);
    expect(enclosure.getCapacityForSpecies('cat')).toBe(2);
    expect(enclosure.definition.capacity.minimumUsableFloorCellsPerAnimalBySpecies).toEqual({ dog: 4, cat: 2 });
  });

  it('serializes and restores geometry, objects, and capacity', () => {
    const original = new EnclosureState(lShape([makeObject()]));
    const restored = EnclosureState.restore(JSON.stringify(original.serialize()));
    expect(restored.serialize()).toEqual(original.serialize());
    expect(restored.isOccupied([1, 1])).toBe(true);
  });

  it('keeps Maple’s existing bowl valid in the canonical enclosure', () => {
    const definition = getEnclosureDefinition('meet-and-greet-yard');
    const bowl = definition.installedObjects.find(({ instanceId }) => instanceId === 'maple-food-bowl');
    const empty = new EnclosureState({ ...definition, installedObjects: [] });
    expect(empty.canPlaceObject(bowl).allowed).toBe(true);
    expect(new Set(definition.interiorCells.map(cellKey)).has(cellKey([bowl.tileX, bowl.tileY]))).toBe(true);
  });
});
