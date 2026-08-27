export const CARE_ACTIONS = {
  wash: {
    id: 'wash',
    displayName: 'Wash',
    compatibleSpecies: ['dog'],
    requiredStationType: 'washing_station',
    requiredItemTags: ['water', 'soap'],
    durationMs: 2800,
    animalPose: { facing: 'right', behavior: 'Being washed' },
    playerPose: { facing: 'right' },
    needChanges: { cleanliness: 38, happiness: 3 },
    cost: 0,
    reservationRequired: true,
    startConditions: { cleanlinessBelow: 98 },
    completionBehavior: 'return-to-enclosure',
    cancellationBehavior: 'return-to-enclosure-without-effects',
  },
};

export const getCareActionDefinition = (actionId) => {
  const action = CARE_ACTIONS[actionId];
  if (!action) throw new Error(`Unknown care action: ${actionId}`);
  return action;
};
