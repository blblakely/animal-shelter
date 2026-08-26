export const clampNeed = (value) => Math.min(100, Math.max(0, value));

export function applyNeedChanges(needs, needsConfig, currentBehavior, elapsedGameMinutes) {
  const elapsedHours = elapsedGameMinutes / 60;
  const changes = { ...needsConfig.ratesPerGameHour };
  changes.energy = needsConfig.energyRatesPerGameHour[currentBehavior]
    ?? needsConfig.energyRatesPerGameHour.default
    ?? 0;

  Object.entries(changes).forEach(([need, hourlyRate]) => {
    needs[need] = clampNeed(needs[need] + hourlyRate * elapsedHours);
  });
  return needs;
}

export class AnimalNeedsSystem {
  update(animalData, species, currentBehavior, elapsedGameMinutes) {
    return applyNeedChanges(animalData.needs, species.needs, currentBehavior, elapsedGameMinutes);
  }
}
