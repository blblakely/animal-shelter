import { clampNeed } from './AnimalNeedsSystem.js';

export function canStartCareAction(action, animalData, species, stationDefinition) {
  if (!action.compatibleSpecies.includes(species.id)) return false;
  if (stationDefinition.objectType !== action.requiredStationType) return false;
  if (!action.requiredItemTags.every((tag) => stationDefinition.itemTags.includes(tag))) return false;
  if (animalData.needs.cleanliness >= action.startConditions.cleanlinessBelow) return false;
  return !['Eating', 'Seeking food', 'Being washed', 'Returning to enclosure'].includes(animalData.currentBehavior);
}

export function applyCareActionCompletion(action, needs) {
  Object.entries(action.needChanges).forEach(([need, amount]) => {
    needs[need] = clampNeed(needs[need] + amount);
  });
  return needs;
}
