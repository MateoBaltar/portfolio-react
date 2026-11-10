import { renderHook, act } from '@testing-library/react';
import { WindowManagerProvider, useWindowManager } from './WindowManagerContext';

const wrapper = ({ children }) => <WindowManagerProvider>{children}</WindowManagerProvider>;

test('opening the same id twice focuses the existing window instead of duplicating it', () => {
  const { result } = renderHook(() => useWindowManager(), { wrapper });
  act(() => result.current.openWindow('about', 'About'));
  act(() => result.current.openWindow('skills', 'Skills'));
  act(() => result.current.openWindow('about', 'About'));
  expect(result.current.windows).toHaveLength(2);
  const about = result.current.windows.find((w) => w.id === 'about');
  const skills = result.current.windows.find((w) => w.id === 'skills');
  expect(about.zIndex).toBeGreaterThan(skills.zIndex);
});

test('closeWindow removes the entry', () => {
  const { result } = renderHook(() => useWindowManager(), { wrapper });
  act(() => result.current.openWindow('about', 'About'));
  act(() => result.current.closeWindow('about'));
  expect(result.current.windows).toHaveLength(0);
});

test('focusWindow raises the target above all others', () => {
  const { result } = renderHook(() => useWindowManager(), { wrapper });
  act(() => result.current.openWindow('about', 'About'));
  act(() => result.current.openWindow('skills', 'Skills'));
  act(() => result.current.focusWindow('about'));
  const about = result.current.windows.find((w) => w.id === 'about');
  const skills = result.current.windows.find((w) => w.id === 'skills');
  expect(about.zIndex).toBeGreaterThan(skills.zIndex);
});

test('moveWindow clamps position within the given bounds', () => {
  const { result } = renderHook(() => useWindowManager(), { wrapper });
  act(() => result.current.openWindow('about', 'About'));
  act(() => result.current.moveWindow('about', { x: 99999, y: -99999 }, { width: 800, height: 600, winWidth: 1000, winHeight: 800 }));
  const about = result.current.windows.find((w) => w.id === 'about');
  expect(about.x).toBeLessThanOrEqual(1000 - 800);
  expect(about.y).toBeGreaterThanOrEqual(0);
});

test('openWindow defaults every window to the same starting size', () => {
  const { result } = renderHook(() => useWindowManager(), { wrapper });
  act(() => result.current.openWindow('about', 'About'));
  const about = result.current.windows.find((w) => w.id === 'about');
  expect(about.width).toBe(480);
  expect(about.height).toBe(360);
});

test('openWindow honors a caller-provided initial size', () => {
  const { result } = renderHook(() => useWindowManager(), { wrapper });
  act(() => result.current.openWindow('minesweeper', 'Minesweeper', { width: 560, height: 640 }));
  const mw = result.current.windows.find((w) => w.id === 'minesweeper');
  expect(mw.width).toBe(560);
  expect(mw.height).toBe(640);
});

test('resizeWindow updates width and height', () => {
  const { result } = renderHook(() => useWindowManager(), { wrapper });
  act(() => result.current.openWindow('about', 'About'));
  act(() =>
    result.current.resizeWindow(
      'about',
      { width: 600, height: 500 },
      { x: 0, y: 0, winWidth: 1200, winHeight: 900 }
    )
  );
  const about = result.current.windows.find((w) => w.id === 'about');
  expect(about.width).toBe(600);
  expect(about.height).toBe(500);
});

test('resizeWindow clamps below a sensible minimum', () => {
  const { result } = renderHook(() => useWindowManager(), { wrapper });
  act(() => result.current.openWindow('about', 'About'));
  act(() =>
    result.current.resizeWindow(
      'about',
      { width: 10, height: 10 },
      { x: 0, y: 0, winWidth: 1200, winHeight: 900 }
    )
  );
  const about = result.current.windows.find((w) => w.id === 'about');
  expect(about.width).toBeGreaterThanOrEqual(260);
  expect(about.height).toBeGreaterThanOrEqual(200);
});

test('resizeWindow clamps to the viewport, accounting for the window\'s own position', () => {
  const { result } = renderHook(() => useWindowManager(), { wrapper });
  act(() => result.current.openWindow('about', 'About'));
  act(() =>
    result.current.resizeWindow(
      'about',
      { width: 99999, height: 99999 },
      { x: 100, y: 50, winWidth: 1000, winHeight: 800 }
    )
  );
  const about = result.current.windows.find((w) => w.id === 'about');
  expect(about.width).toBeLessThanOrEqual(900);
  expect(about.height).toBeLessThanOrEqual(750);
});
