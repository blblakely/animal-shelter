import { GRID_SIZE } from '../config/constants.js';

const randomBetween = (min, max, random) => min + (max - min) * random();

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

export class AnimalNavigationSystem {
  constructor(mapManager, region) {
    this.mapManager = mapManager;
    this.region = region;
  }

  nextTarget(random = Math.random) {
    return chooseWanderTarget(this.region, (x, y) => this.mapManager.isBlocked(x, y), random);
  }
}
