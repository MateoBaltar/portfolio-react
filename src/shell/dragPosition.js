export const DRAG_THRESHOLD = 5;
export const ICON_WIDTH = 84;
export const ICON_HEIGHT = 96;

// Pure so it's directly testable without simulating real pointer coordinates
// through jsdom (fireEvent doesn't reliably forward clientX/clientY/pointerId
// into React's synthetic pointer events in this environment).
export function resolveDragPosition({
  originX,
  originY,
  deltaX,
  deltaY,
  containerWidth,
  containerHeight,
}) {
  if (Math.abs(deltaX) < DRAG_THRESHOLD && Math.abs(deltaY) < DRAG_THRESHOLD) {
    return null;
  }

  const maxX = Math.max(0, containerWidth - ICON_WIDTH);
  const maxY = Math.max(0, containerHeight - ICON_HEIGHT);
  const x = Math.min(Math.max(originX + deltaX, 0), maxX);
  const y = Math.min(Math.max(originY + deltaY, 0), maxY);

  return { x, y };
}
