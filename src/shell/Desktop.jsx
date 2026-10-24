import { useMemo, useRef, useState } from 'react';
import { DESKTOP_ICONS } from './desktopIcons';
import {
  resolveDragPosition,
  cellToPixel,
  pixelToNearestCell,
  nearestFreeCell,
} from './dragPosition';

const STORAGE_KEY = 'fireos-icon-positions';

function loadCells() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    // only accept values that look like grid cells, ignore anything malformed or stale
    const result = {};
    Object.entries(parsed).forEach(([id, value]) => {
      if (value && typeof value.col === 'number' && typeof value.row === 'number') {
        result[id] = { col: value.col, row: value.row };
      }
    });
    return result;
  } catch {
    // localStorage may be unavailable (blocked storage, privacy mode, etc.)
    return {};
  }
}

function saveCells(cells) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cells));
  } catch {
    // storage may be blocked, icon positions just won't persist
  }
}

function defaultCell(index) {
  return { col: 0, row: index };
}

export function Desktop({ items, onOpen }) {
  const containerRef = useRef(null);
  const dragStateRef = useRef(null);
  const [cells, setCells] = useState(loadCells);
  // Free-pixel position of whichever icon is mid-drag, so it tracks the
  // pointer smoothly; only resolved back to a grid cell on release.
  const [liveDrag, setLiveDrag] = useState(null);

  const effectiveCells = useMemo(() => {
    const result = {};
    items.forEach((item, index) => {
      result[item.id] = cells[item.id] ?? defaultCell(index);
    });
    return result;
  }, [items, cells]);

  const handlePointerDown = (id) => (event) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    const originCell = effectiveCells[id];
    const origin = cellToPixel(originCell.col, originCell.row);
    dragStateRef.current = {
      id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: origin.x,
      originY: origin.y,
      dragging: false,
      containerWidth: containerRect?.width ?? 0,
      containerHeight: containerRect?.height ?? 0,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (id) => (event) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.id !== id || dragState.pointerId !== event.pointerId) {
      return;
    }
    const next = resolveDragPosition({
      originX: dragState.originX,
      originY: dragState.originY,
      deltaX: event.clientX - dragState.startX,
      deltaY: event.clientY - dragState.startY,
      containerWidth: dragState.containerWidth,
      containerHeight: dragState.containerHeight,
    });
    if (!next) {
      return;
    }
    dragState.dragging = true;
    setLiveDrag({ id, x: next.x, y: next.y });
  };

  const handlePointerUp = (id) => (event) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.id !== id || dragState.pointerId !== event.pointerId) {
      return;
    }
    if (dragState.dragging && liveDrag) {
      const nearest = pixelToNearestCell(
        liveDrag.x,
        liveDrag.y,
        dragState.containerWidth,
        dragState.containerHeight
      );
      const occupied = Object.entries(effectiveCells)
        .filter(([otherId]) => otherId !== id)
        .map(([, cell]) => cell);
      const cell = nearestFreeCell(
        nearest.col,
        nearest.row,
        occupied,
        dragState.containerWidth,
        dragState.containerHeight
      );
      const nextCells = { ...effectiveCells, [id]: cell };
      saveCells(nextCells);
      setCells(nextCells);
    }
    setLiveDrag(null);
    dragStateRef.current = null;
  };

  const handleDoubleClick = (id) => () => {
    // A completed drag and a double-click are different physical gestures
    // (dblclick requires two quick clicks in roughly the same spot), so no
    // extra guard is needed here beyond the drag-threshold check above.
    onOpen(id);
  };

  return (
    <div className="desktop" ref={containerRef}>
      {items.map((item) => {
        const Icon = DESKTOP_ICONS[item.id];
        const cell = effectiveCells[item.id];
        const pos =
          liveDrag && liveDrag.id === item.id
            ? { x: liveDrag.x, y: liveDrag.y }
            : cellToPixel(cell.col, cell.row);
        return (
          <button
            key={item.id}
            type="button"
            className="desktop__icon"
            data-testid={`desktop-icon-${item.id}`}
            style={{ left: pos.x, top: pos.y }}
            onPointerDown={handlePointerDown(item.id)}
            onPointerMove={handlePointerMove(item.id)}
            onPointerUp={handlePointerUp(item.id)}
            onDoubleClick={handleDoubleClick(item.id)}
          >
            <span className="desktop__icon-glyph">{Icon && <Icon />}</span>
            <span className="desktop__icon-label">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default Desktop;
