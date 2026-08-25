import { GRID_SIZE } from '../config/constants.js';

const border = (width, height) => {
  const blocked = [];
  for (let x = 0; x < width; x += 1) blocked.push([x, 0], [x, height - 1]);
  for (let y = 1; y < height - 1; y += 1) blocked.push([0, y], [width - 1, y]);
  return blocked;
};

const makeMap = ({ id, name, width, height, ground, obstacles, entrances, exits, accents, enclosures = [], animalNavigation = [] }) => ({
  id, name, width, height, tileWidth: GRID_SIZE, tileHeight: GRID_SIZE,
  layers: {
    floor: { type: 'tilelayer', ground, accents },
    structure: { type: 'tilelayer', blocked: [...border(width, height), ...obstacles] },
    transitions: { type: 'objectgroup', exits },
    spawns: { type: 'objectgroup', entrances },
    enclosures: { type: 'objectgroup', objects: enclosures },
    furniture: { type: 'objectgroup', objects: [] },
    enrichment: { type: 'objectgroup', objects: [] },
    decorations: { type: 'objectgroup', objects: [] },
    foreground: { type: 'tilelayer', data: [] },
    interactions: { type: 'objectgroup', objects: [] },
    npcNavigation: { type: 'tilelayer', data: [] },
    animalNavigation: { type: 'objectgroup', objects: animalNavigation },
  },
});

export const MAPS = {
  shelter_grounds: makeMap({
    id: 'shelter_grounds', name: 'Shelter Grounds', width: 38, height: 24, ground: 'grass',
    obstacles: [
      ...Array.from({ length: 9 }, (_, i) => [5 + i, 5]),
      ...Array.from({ length: 6 }, (_, i) => [5, 6 + i]),
      ...Array.from({ length: 9 }, (_, i) => [5 + i, 12]),
      ...Array.from({ length: 5 }, (_, i) => [13, 6 + i]),
      ...Array.from({ length: 7 }, (_, i) => [20 + i, 15]),
      ...Array.from({ length: 4 }, (_, i) => [26, 16 + i]),
      [17, 8], [18, 8], [17, 9], [18, 9], [29, 5], [30, 5], [29, 6], [30, 6],
    ],
    accents: [[8, 16], [9, 16], [10, 16], [15, 4], [24, 8], [32, 17]],
    entrances: {
      center_start: { tileX: 9, tileY: 17, facing: 'down' },
      east_path: { tileX: 34, tileY: 11, facing: 'left' },
    },
    enclosures: [{
      id: 'meet-and-greet-yard',
      name: 'Meet-and-Greet Yard',
      tileX: 6,
      tileY: 6,
      width: 7,
      height: 6,
      capacity: 2,
      speciesIds: ['dog'],
      animalIds: ['dog-maple'],
    }],
    animalNavigation: [{
      id: 'meet-and-greet-yard-navigation',
      enclosureId: 'meet-and-greet-yard',
      tileX: 6,
      tileY: 6,
      width: 7,
      height: 6,
    }],
    exits: [{ id: 'east_path', tileX: 36, tileY: 10, width: 1, height: 3, toMap: 'meadow_path', entranceId: 'west_path' }],
  }),
  meadow_path: makeMap({
    id: 'meadow_path', name: 'Meadow Path', width: 42, height: 22, ground: 'meadow',
    obstacles: [
      ...Array.from({ length: 10 }, (_, i) => [11 + i, 6]),
      ...Array.from({ length: 7 }, (_, i) => [24, 10 + i]),
      ...Array.from({ length: 7 }, (_, i) => [30 + i, 14]),
      [7, 14], [8, 14], [7, 15], [34, 5], [35, 5], [34, 6], [35, 6],
    ],
    accents: [[9, 8], [16, 14], [22, 4], [28, 17], [37, 9], [38, 9]],
    entrances: { west_path: { tileX: 3, tileY: 10, facing: 'right' } },
    exits: [{ id: 'west_path', tileX: 1, tileY: 9, width: 1, height: 3, toMap: 'shelter_grounds', entranceId: 'east_path' }],
  }),
};

export function getMapDefinition(mapId) {
  const map = MAPS[mapId];
  if (!map) throw new Error(`Unknown map: ${mapId}`);
  return map;
}
