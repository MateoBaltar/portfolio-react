import { createContext, useContext, useRef, useState } from 'react';

const WindowManagerContext = createContext();

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// position: fixed with no explicit size means a window would otherwise
// shrink-to-fit its content, which compounds the cascade-spawn fix by
// letting windows overlap unpredictably. Give every window a sensible
// default footprint instead.
export const DEFAULT_WINDOW_WIDTH = 480;
export const DEFAULT_WINDOW_HEIGHT = 360;
export const MIN_WINDOW_WIDTH = 260;
export const MIN_WINDOW_HEIGHT = 200;

export function WindowManagerProvider({ children }) {
  const [windows, setWindows] = useState([]);
  const nextZIndexRef = useRef(1);

  const openWindow = (id, title, initialSize, options) => {
    const zIndex = nextZIndexRef.current++;
    setWindows((current) => {
      const existing = current.find((w) => w.id === id);

      if (existing) {
        return current.map((w) => (w.id === id ? { ...w, zIndex } : w));
      }

      const width = initialSize?.width ?? DEFAULT_WINDOW_WIDTH;
      const height = initialSize?.height ?? DEFAULT_WINDOW_HEIGHT;

      let x;
      let y;
      if (options?.centered && typeof window !== 'undefined') {
        x = Math.max(0, (window.innerWidth - width) / 2);
        y = Math.max(0, (window.innerHeight - height) / 2);
      } else {
        // Cascade each newly-opened window's spawn position so new windows
        // don't all stack exactly on top of each other, and start below the
        // taskbar/prompt (which sit in normal document flow above these
        // fixed-position windows) instead of covering them at y: 0.
        const cascadeOffset = (current.length * 28) % 280;
        x = cascadeOffset;
        y = 80 + cascadeOffset;
      }

      return [
        ...current,
        {
          id,
          title,
          x,
          y,
          width,
          height,
          zIndex,
          fullscreen: false,
        },
      ];
    });
  };

  const closeWindow = (id) => {
    setWindows((current) => current.filter((w) => w.id !== id));
  };

  const focusWindow = (id) => {
    const zIndex = nextZIndexRef.current++;
    setWindows((current) =>
      current.map((w) => (w.id === id ? { ...w, zIndex } : w))
    );
  };

  const moveWindow = (id, pos, bounds) => {
    const maxX = Math.max(0, bounds.winWidth - bounds.width);
    const maxY = Math.max(0, bounds.winHeight - bounds.height);
    const x = clamp(pos.x, 0, maxX);
    const y = clamp(pos.y, 0, maxY);

    setWindows((current) =>
      current.map((w) => (w.id === id ? { ...w, x, y } : w))
    );
  };

  // bounds carries the window's x/y plus viewport size, clamping so the right/bottom
  // edge never passes the viewport; same bounds shape moveWindow uses
  const resizeWindow = (id, size, bounds) => {
    const maxWidth = Math.max(MIN_WINDOW_WIDTH, bounds.winWidth - bounds.x);
    const maxHeight = Math.max(MIN_WINDOW_HEIGHT, bounds.winHeight - bounds.y);
    const width = clamp(size.width, MIN_WINDOW_WIDTH, maxWidth);
    const height = clamp(size.height, MIN_WINDOW_HEIGHT, maxHeight);

    setWindows((current) =>
      current.map((w) => (w.id === id ? { ...w, width, height } : w))
    );
  };

  const toggleFullscreen = (id) => {
    setWindows((current) =>
      current.map((w) =>
        w.id === id ? { ...w, fullscreen: !w.fullscreen } : w
      )
    );
  };

  return (
    <WindowManagerContext.Provider
      value={{
        windows,
        openWindow,
        closeWindow,
        focusWindow,
        moveWindow,
        resizeWindow,
        toggleFullscreen,
      }}
    >
      {children}
    </WindowManagerContext.Provider>
  );
}

export function useWindowManager() {
  const context = useContext(WindowManagerContext);
  if (!context) {
    throw new Error('useWindowManager must be used within a WindowManagerProvider');
  }
  return context;
}
