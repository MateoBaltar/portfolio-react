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
