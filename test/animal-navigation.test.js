import { describe, expect, it } from 'vitest';
import { chooseWanderTarget, getAnimalRegionBounds } from '../src/systems/AnimalNavigationSystem.js';

const region = { tileX: 6, tileY: 6, width: 7, height: 6 };

describe('animal navigation', () => {
  it('chooses continuous points inside its assigned region', () => {
    const bounds = getAnimalRegionBounds(region);
    const values = [0, 0.25, 0.5, 0.75, 0.999];
    values.forEach((value) => {
      const target = chooseWanderTarget(region, () => false, () => value);
      expect(target.x).toBeGreaterThanOrEqual(bounds.left);
      expect(target.x).toBeLessThanOrEqual(bounds.right);
      expect(target.y).toBeGreaterThanOrEqual(bounds.top);
      expect(target.y).toBeLessThanOrEqual(bounds.bottom);
    });
  });

  it('retries when a sampled foot tile is blocked', () => {
    const samples = [0, 0, 0.9, 0.9];
    let checks = 0;
    const target = chooseWanderTarget(region, () => {
      checks += 1;
      return checks === 1;
    }, () => samples.shift() ?? 0.5);
    expect(checks).toBe(2);
    expect(target.x).toBeGreaterThan(300);
  });
});
