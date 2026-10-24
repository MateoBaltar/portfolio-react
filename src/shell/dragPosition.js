export const DRAG_THRESHOLD = 5;
export const ICON_WIDTH = 84;
export const ICON_HEIGHT = 96;
export const GRID_CELL_WIDTH = 112;
export const GRID_CELL_HEIGHT = 132;
export const GRID_ORIGIN_X = 16;
export const GRID_ORIGIN_Y = 16;

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

function maxColFor(containerWidth) {
  const usable = Math.max(containerWidth, GRID_ORIGIN_X + ICON_WIDTH) - GRID_ORIGIN_X - ICON_WIDTH;
  return Math.max(0, Math.floor(usable / GRID_CELL_WIDTH));
}

function maxRowFor(containerHeight) {
  const usable =
    Math.max(containerHeight, GRID_ORIGIN_Y + ICON_HEIGHT) - GRID_ORIGIN_Y - ICON_HEIGHT;
  return Math.max(0, Math.floor(usable / GRID_CELL_HEIGHT));
}

export function cellToPixel(col, row) {
  return { x: GRID_ORIGIN_X + col * GRID_CELL_WIDTH, y: GRID_ORIGIN_Y + row * GRID_CELL_HEIGHT };
}

// Rounds a free pixel position (e.g. where an icon was just dropped) to the
// nearest grid cell, clamped so the cell always stays within the container.
export function pixelToNearestCell(x, y, containerWidth, containerHeight) {
  const rawCol = Math.round((x - GRID_ORIGIN_X) / GRID_CELL_WIDTH);
  const rawRow = Math.round((y - GRID_ORIGIN_Y) / GRID_CELL_HEIGHT);
  const col = Math.min(Math.max(rawCol, 0), maxColFor(containerWidth));
  const row = Math.min(Math.max(rawRow, 0), maxRowFor(containerHeight));
  return { col, row };
}

// If (col, row) is already free, returns it unchanged. Otherwise expands
// outward ring by ring (a tiny 5-6 icon desktop, not a file manager, so a
// simple perimeter search is plenty) until it finds an unoccupied cell.
export function nearestFreeCell(col, row, occupiedCells, containerWidth, containerHeight) {
  const maxCol = maxColFor(containerWidth);
  const maxRow = maxRowFor(containerHeight);
  const isFree = (c, r) => !occupiedCells.some((cell) => cell.col === c && cell.row === r);

  if (isFree(col, row)) {
    return { col, row };
  }

  const maxRadius = maxCol + maxRow + 2;
  for (let radius = 1; radius <= maxRadius; radius += 1) {
    for (let dc = -radius; dc <= radius; dc += 1) {
      for (let dr = -radius; dr <= radius; dr += 1) {
        if (Math.max(Math.abs(dc), Math.abs(dr)) !== radius) {
          continue;
        }
        const c = col + dc;
        const r = row + dr;
        if (c < 0 || c > maxCol || r < 0 || r > maxRow) {
          continue;
        }
        if (isFree(c, r)) {
          return { col: c, row: r };
        }
      }
    }
  }

  // Grid is fully occupied (shouldn't happen with a handful of icons).
  return { col, row };
}
