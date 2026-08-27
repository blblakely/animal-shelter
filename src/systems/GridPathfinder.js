import { cellKey, toCell } from './GridCells.js';

const NEIGHBORS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export function findGridPath(startCell, goalCell, canEnter, maximumVisited = 4096) {
  const start = toCell(startCell);
  const goal = toCell(goalCell);
  const startKey = cellKey(start);
  const goalKey = cellKey(goal);
  if (startKey === goalKey) return [[start.tileX, start.tileY]];

  const queue = [start];
  const cameFrom = new Map([[startKey, null]]);
  let cursor = 0;
  while (cursor < queue.length && cameFrom.size <= maximumVisited) {
    const current = queue[cursor];
    cursor += 1;
    for (const [offsetX, offsetY] of NEIGHBORS) {
      const next = { tileX: current.tileX + offsetX, tileY: current.tileY + offsetY };
      const nextKey = cellKey(next);
      if (cameFrom.has(nextKey) || !canEnter(next)) continue;
      cameFrom.set(nextKey, cellKey(current));
      if (nextKey === goalKey) {
        const path = [];
        let key = nextKey;
        while (key) {
          path.push(key.split(',').map(Number));
          key = cameFrom.get(key);
        }
        return path.reverse();
      }
      queue.push(next);
    }
  }
  return null;
}
