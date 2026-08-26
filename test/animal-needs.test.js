import { describe, expect, it } from 'vitest';
import { SPECIES } from '../src/data/species.js';
import { applyNeedChanges } from '../src/systems/AnimalNeedsSystem.js';

const makeNeeds = () => ({ hunger: 50, cleanliness: 50, happiness: 50, health: 50, energy: 50, social: 50 });

describe('animal need changes', () => {
  it('reduces hunger over game time without reducing normal health', () => {
    const needs = makeNeeds();
    applyNeedChanges(needs, SPECIES.dog.needs, 'Exploring', 60);
    expect(needs.hunger).toBe(38);
    expect(needs.health).toBe(50);
  });

  it('uses behavior-specific energy rates', () => {
    const exploring = makeNeeds();
    const resting = makeNeeds();
    applyNeedChanges(exploring, SPECIES.dog.needs, 'Exploring', 60);
    applyNeedChanges(resting, SPECIES.dog.needs, 'Resting', 60);
    expect(exploring.energy).toBe(43);
    expect(resting.energy).toBe(68);
  });

  it('clamps every changing need between zero and one hundred', () => {
    const needs = makeNeeds();
    needs.hunger = 2;
    needs.energy = 98;
    applyNeedChanges(needs, SPECIES.dog.needs, 'Resting', 600);
    expect(needs.hunger).toBe(0);
    expect(needs.energy).toBe(100);
    Object.values(needs).forEach((value) => expect(value).toBeGreaterThanOrEqual(0));
    Object.values(needs).forEach((value) => expect(value).toBeLessThanOrEqual(100));
  });
});
