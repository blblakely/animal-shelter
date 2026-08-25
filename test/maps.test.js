import { describe, expect, it } from 'vitest';
import { MAPS, getMapDefinition } from '../src/data/maps.js';

describe('map registry', () => {
  it('contains two connected maps with valid return routes', () => {
    expect(Object.keys(MAPS)).toHaveLength(2);
    for (const map of Object.values(MAPS)) {
      for (const exit of map.layers.transitions.exits) {
        const destination = getMapDefinition(exit.toMap);
        expect(destination.layers.spawns.entrances[exit.entranceId]).toBeDefined();
      }
    }
  });
  it('keeps entrance tiles walkable', () => {
    for (const map of Object.values(MAPS)) {
      const blocked = new Set(map.layers.structure.blocked.map(([x, y]) => `${x},${y}`));
      for (const spawn of Object.values(map.layers.spawns.entrances)) expect(blocked.has(`${spawn.tileX},${spawn.tileY}`)).toBe(false);
    }
  });
  it('uses the authoritative 32 pixel grid', () => {
    for (const map of Object.values(MAPS)) expect([map.tileWidth, map.tileHeight]).toEqual([32, 32]);
  });
});
