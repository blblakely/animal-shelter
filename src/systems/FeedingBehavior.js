import { clampNeed } from './AnimalNeedsSystem.js';
import { isFoodCompatible } from '../data/foods.js';

export function hasReachedActivityTarget(position, target, arrivalDistance = 8) {
  return Math.hypot(target.x - position.x, target.y - position.y) <= arrivalDistance;
}

export function completePhysicalFeeding({ stationState, animalId, animalNeeds, food, species, position, target }) {
  if (!hasReachedActivityTarget(position, target)) return false;
  if (!isFoodCompatible(food, species)) return false;
  if (stationState.reservedBy !== animalId) return false;
  if (!stationState.consume(animalId)) return false;
  animalNeeds.hunger = clampNeed(animalNeeds.hunger + food.nutrition);
  return true;
}
