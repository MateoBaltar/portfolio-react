import { createContext, useContext, useRef, useState } from 'react';

const WindowManagerContext = createContext();

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function WindowManagerProvider({ children }) {
  const [windows, setWindows] = useState([]);
  const nextZIndexRef = useRef(1);

  const openWindow = (id, title) => {
    const zIndex = nextZIndexRef.current++;
    setWindows((current) => {
      const existing = current.find((w) => w.id === id);

      if (existing) {
        return current.map((w) => (w.id === id ? { ...w, zIndex } : w));
      }

      // Cascade each newly-opened window's spawn position so new windows
      // don't all stack exactly on top of each other, and start below the
      // taskbar/prompt (which sit in normal document flow above these
      // fixed-position windows) instead of covering them at y: 0.
      const cascadeOffset = (current.length * 28) % 280;

      return [
        ...current,
        { id, title, x: cascadeOffset, y: 80 + cascadeOffset, zIndex, fullscreen: false },
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
