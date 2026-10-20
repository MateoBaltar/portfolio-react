import { resolveDragPosition } from './dragPosition';

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
