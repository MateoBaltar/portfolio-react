import { useEffect, useRef, useState } from 'react';
import { useWindowManager, DEFAULT_WINDOW_WIDTH, DEFAULT_WINDOW_HEIGHT } from './WindowManagerContext';
import { playClick } from '../shell/sound';

// Matches the CSS window-enter/window-exit keyframe durations.
const CLOSE_ANIMATION_MS = 160;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function Window({ id, title, onClose = () => {}, children }) {
  const { windows, moveWindow, resizeWindow, focusWindow, closeWindow, toggleFullscreen } =
    useWindowManager();
  const containerRef = useRef(null);
  const dragStateRef = useRef(null);
  const resizeStateRef = useRef(null);
  const closeTimeoutRef = useRef(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => () => clearTimeout(closeTimeoutRef.current), []);

  const record = windows.find((w) => w.id === id);
  const x = record?.x ?? 0;
  const y = record?.y ?? 0;
  const width = record?.width ?? DEFAULT_WINDOW_WIDTH;
  const height = record?.height ?? DEFAULT_WINDOW_HEIGHT;
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
      width: rect?.width ?? width,
      height: rect?.height ?? height,
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
    if (prefersReducedMotion()) {
      onClose();
      closeWindow(id);
      return;
    }
    setClosing(true);
    closeTimeoutRef.current = setTimeout(() => {
      onClose();
      closeWindow(id);
    }, CLOSE_ANIMATION_MS);
  };

  // A separate pointer-handler trio from the title bar's own drag, living on
  // its own corner handle, so there's no interaction risk between the two
  // gestures (the same reasoning that kept the close button structurally
  // outside the title bar's drag-capture logic).
  const handleResizePointerDown = (event) => {
    resizeStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: width,
      startHeight: height,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.stopPropagation();
  };

  const handleResizePointerMove = (event) => {
    const resizeState = resizeStateRef.current;
    if (!resizeState || resizeState.pointerId !== event.pointerId) {
      return;
    }
    const deltaX = event.clientX - resizeState.startX;
    const deltaY = event.clientY - resizeState.startY;
    resizeWindow(
      id,
      { width: resizeState.startWidth + deltaX, height: resizeState.startHeight + deltaY },
      { x, y, winWidth: window.innerWidth, winHeight: window.innerHeight }
    );
  };

  const handleResizePointerUp = (event) => {
    const resizeState = resizeStateRef.current;
    if (!resizeState || resizeState.pointerId !== event.pointerId) {
      return;
    }
    resizeStateRef.current = null;
  };

  const style = fullscreen
    ? { position: 'fixed', inset: 0, zIndex }
    : {
        position: 'fixed',
        left: x,
        top: y,
        zIndex,
        width,
        height,
      };

  return (
    <div
      ref={containerRef}
      className={closing ? 'window window--closing' : 'window'}
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
      {!fullscreen && (
        <div
          className="window__resize-handle"
          data-testid={`window-resize-${id}`}
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={handleResizePointerUp}
        />
      )}
    </div>
  );
}
