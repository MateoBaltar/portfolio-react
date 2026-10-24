import { useRef } from 'react';
import { useWindowManager } from './WindowManagerContext';
import { playClick } from '../shell/sound';

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
  // Display-only: the frontmost window by z-index gets a visually
  // distinct title bar. Purely derived from existing state, no behavior change.
  const isFocused =
    windows.length > 0 && windows.every((w) => w.id === id || w.zIndex < zIndex);

  const handleTitleBarPointerDown = (event) => {
    // Pointer capture on the title bar would otherwise steal the click
    // away from the close button when a drag starts on top of it.
    if (event.target.closest('.window__close')) {
      return;
    }
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
    playClick();
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
      className="window"
      data-testid={`window-${id}`}
      data-fullscreen={fullscreen}
      style={style}
      onClick={handleBodyClick}
    >
      <div
        className={
          isFocused ? 'window__titlebar window__titlebar--focused' : 'window__titlebar'
        }
        data-testid={`window-titlebar-${id}`}
        onPointerDown={handleTitleBarPointerDown}
        onPointerMove={handleTitleBarPointerMove}
        onPointerUp={handleTitleBarPointerUp}
        onDoubleClick={handleTitleBarDoubleClick}
      >
        <span className="window__title">{title}</span>
        <button
          type="button"
          className="window__close"
          data-testid={`window-close-${id}`}
          onClick={handleClose}
        >
          x
        </button>
      </div>
      <div className="window__body">{children}</div>
    </div>
  );
}
