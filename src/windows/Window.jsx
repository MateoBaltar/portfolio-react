import { useRef } from 'react';
import { useWindowManager } from './WindowManagerContext';

// position: fixed with no explicit size means a window would otherwise
// shrink-to-fit its content, which compounds the cascade-spawn fix by
// letting windows overlap unpredictably. Give every window a sensible
// default footprint instead.
const DEFAULT_WINDOW_WIDTH = 480;
const DEFAULT_WINDOW_HEIGHT = 360;

export function Window({ id, title, onClose = () => {}, children }) {
  const { windows, moveWindow, focusWindow, closeWindow, toggleFullscreen } =
    useWindowManager();
  const containerRef = useRef(null);
  const dragStateRef = useRef(null);

  const record = windows.find((w) => w.id === id);
  const x = record?.x ?? 0;
  const y = record?.y ?? 0;
  const zIndex = record?.zIndex ?? 0;
  const fullscreen = record?.fullscreen ?? false;

  const handleTitleBarPointerDown = (event) => {
    const rect = containerRef.current?.getBoundingClientRect();
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: x,
      originY: y,
      width: rect?.width ?? 0,
      height: rect?.height ?? 0,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleTitleBarPointerMove = (event) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }
    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    moveWindow(
      id,
      { x: dragState.originX + deltaX, y: dragState.originY + deltaY },
      {
        width: dragState.width,
        height: dragState.height,
        winWidth: window.innerWidth,
        winHeight: window.innerHeight,
      }
    );
  };

  const handleTitleBarPointerUp = (event) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }
    dragStateRef.current = null;
  };

  const handleTitleBarDoubleClick = () => {
    toggleFullscreen(id);
  };

  const handleBodyClick = () => {
    focusWindow(id);
  };

  const handleClose = () => {
    onClose();
    closeWindow(id);
  };

  const style = fullscreen
    ? { position: 'fixed', inset: 0, zIndex }
    : {
        position: 'fixed',
        left: x,
        top: y,
        zIndex,
        width: DEFAULT_WINDOW_WIDTH,
        height: DEFAULT_WINDOW_HEIGHT,
      };

  return (
    <div
      ref={containerRef}
      data-testid={`window-${id}`}
      data-fullscreen={fullscreen}
      style={style}
      onClick={handleBodyClick}
    >
      <div
        data-testid={`window-titlebar-${id}`}
        onPointerDown={handleTitleBarPointerDown}
        onPointerMove={handleTitleBarPointerMove}
        onPointerUp={handleTitleBarPointerUp}
        onDoubleClick={handleTitleBarDoubleClick}
      >
        <span>{title}</span>
        <button
          type="button"
          data-testid={`window-close-${id}`}
          onClick={handleClose}
        >
          x
        </button>
      </div>
      <div>{children}</div>
    </div>
  );
}
