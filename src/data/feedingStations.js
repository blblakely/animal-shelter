import { ENCLOSURES } from './enclosures.js';

export const asFeedingStationDefinition = (object) => ({
  ...object,
  id: object.instanceId,
  displayName: object.animalId === 'dog-maple' ? "Maple's Bowl" : object.displayName,
  playerInteraction: object.playerInteractionPositions[0],
  animalUse: object.animalInteractionPositions[0],
});

export const FEEDING_STATIONS = ENCLOSURES
  .flatMap((enclosure) => enclosure.installedObjects)
  .filter(({ objectType }) => objectType === 'feeding_station')
  .map(asFeedingStationDefinition);

export function getFeedingStationsForMap(mapId) {
  return FEEDING_STATIONS.filter((station) => station.mapId === mapId);
}
