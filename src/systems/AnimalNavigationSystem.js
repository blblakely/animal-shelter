import { GRID_SIZE } from '../config/constants.js';
import { cellKey } from './GridCells.js';
import { findGridPath } from './GridPathfinder.js';

const randomBetween = (min, max, random) => min + (max - min) * random();

// Compatibility helpers for older rectangular-region callers and tests.
export function getAnimalRegionBounds(region) {
  return {
    left: region.tileX * GRID_SIZE + GRID_SIZE,
    right: (region.tileX + region.width) * GRID_SIZE - GRID_SIZE,
    top: region.tileY * GRID_SIZE + GRID_SIZE,
    bottom: (region.tileY + region.height) * GRID_SIZE - GRID_SIZE,
  };
}

export function chooseWanderTarget(region, isBlocked, random = Math.random) {
  const bounds = getAnimalRegionBounds(region);
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const x = randomBetween(bounds.left, bounds.right, random);
    const y = randomBetween(bounds.top, bounds.bottom, random);
    const footTileX = Math.floor(x / GRID_SIZE);
    const footTileY = Math.floor((y + GRID_SIZE * 0.75) / GRID_SIZE);
    if (!isBlocked(footTileX, footTileY)) return { x, y };
  }
  return {
    x: (region.tileX + region.width / 2) * GRID_SIZE,
    y: (region.tileY + region.height / 2 - 0.5) * GRID_SIZE,
  };
}

const pointToCell = ({ x, y }) => ({ tileX: Math.floor(x / GRID_SIZE), tileY: Math.floor(y / GRID_SIZE) });
// Animal sprites are positioned by their center while navigation cells describe their feet.
const cellToPoint = ([tileX, tileY]) => ({ x: (tileX + 0.5) * GRID_SIZE, y: tileY * GRID_SIZE + 4 });

export class AnimalNavigationSystem {
  constructor(mapManager, enclosureState) {
    this.mapManager = mapManager;
    this.enclosure = enclosureState;
  }

  isInNormalRegion(point) { return this.enclosure.isAnimalWalkable(pointToCell(point)); }

  getNormalCellKeys() {
    return new Set(this.enclosure.getAnimalWalkableCells().map((cell) => cellKey(cell)));
  }

  routeTo(startPoint, destinationPoint, additionalAuthorizedCells = []) {
    const allowed = this.getNormalCellKeys();
    additionalAuthorizedCells.forEach((cell) => allowed.add(cellKey(cell)));
    const start = pointToCell(startPoint);
    const goal = pointToCell(destinationPoint);
    allowed.add(cellKey(start));
    const path = findGridPath(start, goal, (cell) => allowed.has(cellKey(cell)) && !this.mapManager.isBlocked(cell.tileX, cell.tileY));
    if (!path) return null;
    const waypoints = path.slice(1).map(cellToPoint);
    if (waypoints.length === 0) waypoints.push({ ...destinationPoint });
    else waypoints[waypoints.length - 1] = { ...destinationPoint };
    return waypoints;
  }

  nextRoute(startPoint, random = Math.random) {
    const cells = this.enclosure.getAnimalWalkableCells();
    if (cells.length === 0) return null;
    const target = cells[Math.min(cells.length - 1, Math.floor(random() * cells.length))];
    return this.routeTo(startPoint, cellToPoint(target));
  }

  careRouteTo(startPoint, destinationPoint, careRoute) {
    return this.routeTo(startPoint, destinationPoint, careRoute.authorizedCells);
  }
}
