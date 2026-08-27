export const cellKey = (cellOrX, y) => {
  const x = Array.isArray(cellOrX) ? cellOrX[0] : (typeof cellOrX === 'object' ? cellOrX.tileX : cellOrX);
  const resolvedY = Array.isArray(cellOrX) ? cellOrX[1] : (typeof cellOrX === 'object' ? cellOrX.tileY : y);
  return `${x},${resolvedY}`;
};

export const toCell = (cell) => Array.isArray(cell)
  ? { tileX: cell[0], tileY: cell[1] }
  : { tileX: cell.tileX, tileY: cell.tileY };

export function rectangleCells(tileX, tileY, width, height) {
  const cells = [];
  for (let y = tileY; y < tileY + height; y += 1) {
    for (let x = tileX; x < tileX + width; x += 1) cells.push([x, y]);
  }
  return cells;
}

export function footprintCells(object) {
  const relativeCells = object.footprint?.cells
    ?? rectangleCells(0, 0, object.footprint?.width ?? 1, object.footprint?.height ?? 1);
  return relativeCells.map(([offsetX, offsetY]) => [object.tileX + offsetX, object.tileY + offsetY]);
}

export const cloneSerializable = (value) => JSON.parse(JSON.stringify(value));
