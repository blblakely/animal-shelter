import { createPlacedObject } from './enclosureObjectCatalog.js';
import { rectangleCells } from '../systems/GridCells.js';

const yardInterior = rectangleCells(6, 6, 7, 6);
const yardFence = [
  ...rectangleCells(5, 5, 9, 1),
  ...rectangleCells(5, 12, 9, 1),
  ...rectangleCells(5, 6, 1, 6),
  ...rectangleCells(13, 6, 1, 5),
];

export const ENCLOSURES = [
  {
    id: 'meet-and-greet-yard',
    displayName: 'Meet-and-Greet Yard',
    mapId: 'shelter_grounds',
    allowedSpecies: ['dog'],
    interiorCells: yardInterior,
    boundaryCells: yardFence,
    gateCells: [[13, 11]],
    flooringCells: yardInterior.map(([tileX, tileY]) => ({ tileX, tileY, flooringId: 'soft-grass' })),
    capacity: {
      current: 2,
      mode: 'manual',
      usableAreaModifiers: [],
      minimumUsableFloorCellsPerAnimalBySpecies: { dog: 12, cat: 8, rabbit: 6 },
    },
    spawnPositions: [{ id: 'default', tileX: 9, tileY: 8, facing: 'down' }],
    restPositions: [{ id: 'default', tileX: 9, tileY: 8, facing: 'down' }],
    animalNavigationCells: yardInterior,
    animalInteractionPositions: [{ id: 'visitor-meet', tileX: 12, tileY: 10 }],
    publicViewingPositions: [{ id: 'east-gate-view', tileX: 14, tileY: 10 }],
    requiredGateClearanceCells: [[12, 11], [13, 11], [14, 11]],
    reservedCells: [],
    installedObjects: [
      createPlacedObject({
        instanceId: 'maple-food-bowl',
        catalogId: 'dog-food-bowl',
        enclosureId: 'meet-and-greet-yard',
        mapId: 'shelter_grounds',
        animalId: 'dog-maple',
        tileX: 7,
        tileY: 7,
        footprint: { width: 1, height: 1, cells: [[0, 0]] },
        rotation: 0,
        playerInteractionPositions: [{ tileX: 7, tileY: 8 }],
        animalInteractionPositions: [{ tileX: 7, tileY: 8, facing: 'up' }],
        defaultFoodId: 'basic-dog-food',
      }),
    ],
    careRoutes: [
      {
        id: 'yard-to-wash-bay',
        stationId: 'willowmere-wash-bay',
        gateCell: [13, 11],
        authorizedCells: [[13, 11], [14, 11], [15, 11], [16, 11]],
        returnPositionId: 'default',
      },
    ],
  },
];

export const getEnclosureDefinition = (enclosureId) => {
  const enclosure = ENCLOSURES.find(({ id }) => id === enclosureId);
  if (!enclosure) throw new Error(`Unknown enclosure: ${enclosureId}`);
  return enclosure;
};

export const getEnclosuresForMap = (mapId) => ENCLOSURES.filter((enclosure) => enclosure.mapId === mapId);
