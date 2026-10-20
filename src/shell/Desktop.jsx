import { useMemo, useRef, useState } from 'react';
import { DESKTOP_ICONS } from './desktopIcons';
import { ICON_HEIGHT, resolveDragPosition } from './dragPosition';

const STORAGE_KEY = 'fireos-icon-positions';
const COLUMN_X = 20;
const ROW_STEP = ICON_HEIGHT + 14;
const ROW_START = 20;

function loadPositions() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    // localStorage may be unavailable (blocked storage, privacy mode, etc.)
    return {};
  }
}

function savePositions(positions) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // storage may be blocked, icon positions just won't persist
  }
}

function defaultPosition(index) {
  return { x: COLUMN_X, y: ROW_START + index * ROW_STEP };
}

export function Desktop({ items, onOpen }) {
  const containerRef = useRef(null);
  const dragStateRef = useRef(null);
  const [positions, setPositions] = useState(loadPositions);

  const effectivePositions = useMemo(() => {
    const result = {};
    items.forEach((item, index) => {
      result[item.id] = positions[item.id] ?? defaultPosition(index);
    });
    return result;
  }, [items, positions]);

  const handlePointerDown = (id) => (event) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    const origin = effectivePositions[id];
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
    setPositions((current) => ({ ...current, [id]: next }));
  };

  const handlePointerUp = (id) => (event) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.id !== id || dragState.pointerId !== event.pointerId) {
      return;
    }
    if (dragState.dragging) {
      savePositions(positions);
    }
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
        const pos = effectivePositions[item.id];
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
