import { resolveDragPosition, pixelToNearestCell, nearestFreeCell, cellToPixel } from './dragPosition';

test('returns null when movement stays within the drag threshold (a click, not a drag)', () => {
  const result = resolveDragPosition({
    originX: 20,
    originY: 20,
    deltaX: 3,
    deltaY: -2,
    containerWidth: 400,
    containerHeight: 400,
  });
  expect(result).toBeNull();
});

test('returns the shifted position once movement exceeds the threshold', () => {
  const result = resolveDragPosition({
    originX: 20,
    originY: 20,
    deltaX: 40,
    deltaY: 20,
    containerWidth: 400,
    containerHeight: 400,
  });
  expect(result).toEqual({ x: 60, y: 40 });
});

test('clamps to the container bottom-right edge', () => {
  const result = resolveDragPosition({
    originX: 20,
    originY: 20,
    deltaX: 9999,
    deltaY: 9999,
    containerWidth: 120,
    containerHeight: 120,
  });
  // Container is 120x120, icon footprint is 84x96, so max left/top is 36/24.
  expect(result).toEqual({ x: 36, y: 24 });
});

test('clamps to the container top-left edge', () => {
  const result = resolveDragPosition({
    originX: 20,
    originY: 20,
    deltaX: -9999,
    deltaY: -9999,
    containerWidth: 400,
    containerHeight: 400,
  });
  expect(result).toEqual({ x: 0, y: 0 });
});

test('cellToPixel places cell (0,0) at the grid origin', () => {
  expect(cellToPixel(0, 0)).toEqual({ x: 16, y: 16 });
});

test('cellToPixel offsets by the cell size per column/row', () => {
  expect(cellToPixel(1, 2)).toEqual({ x: 128, y: 280 });
});

test('pixelToNearestCell rounds a drop point to the nearest grid cell', () => {
  const result = pixelToNearestCell(140, 150, 2000, 2000);
  expect(result).toEqual({ col: 1, row: 1 });
});

test('pixelToNearestCell clamps to (0, 0) when the container is too small for a second cell', () => {
  const result = pixelToNearestCell(9999, 9999, 140, 160);
  expect(result).toEqual({ col: 0, row: 0 });
});

test('nearestFreeCell returns the target cell unchanged when nothing occupies it', () => {
  const result = nearestFreeCell(2, 1, [{ col: 0, row: 0 }], 2000, 2000);
  expect(result).toEqual({ col: 2, row: 1 });
});

test('nearestFreeCell falls back to an adjacent free cell when the target is taken', () => {
  const result = nearestFreeCell(0, 0, [{ col: 0, row: 0 }], 2000, 2000);
  expect(result).not.toEqual({ col: 0, row: 0 });
  expect(Math.max(Math.abs(result.col), Math.abs(result.row))).toBe(1);
});
