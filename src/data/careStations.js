import { createPlacedObject } from './enclosureObjectCatalog.js';

export const CARE_STATIONS = [
  createPlacedObject({
    instanceId: 'willowmere-wash-bay',
    catalogId: 'fixed-dog-wash-station',
    enclosureId: null,
    mapId: 'shelter_grounds',
    tileX: 17,
    tileY: 11,
    footprint: { width: 2, height: 2, cells: [[0, 0], [1, 0], [0, 1], [1, 1]] },
    rotation: 0,
    playerInteractionPositions: [{ tileX: 16, tileY: 12, facing: 'right' }],
    animalInteractionPositions: [{ tileX: 16, tileY: 11, facing: 'right' }],
    reservation: { reservedBy: null },
  }),
];

export const getCareStationsForMap = (mapId) => CARE_STATIONS.filter((station) => station.mapId === mapId);
