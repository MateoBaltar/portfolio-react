import { renderHook, act } from '@testing-library/react';
import { useViewportMode } from './useViewportMode';

function mockMatchMedia(initialMatches) {
  let listener;
  const mql = {
    matches: initialMatches,
    addEventListener: (_, cb) => { listener = cb; },
    removeEventListener: () => {},
  };
  window.matchMedia = () => mql;
  return {
    fire(matches) { mql.matches = matches; listener({ matches }); },
  };
}

test('reports mobile below the breakpoint', () => {
  mockMatchMedia(false);
  const { result } = renderHook(() => useViewportMode(768));
  expect(result.current).toBe('mobile');
});

test('reports desktop above the breakpoint and updates on change', () => {
  const media = mockMatchMedia(false);
  const { result } = renderHook(() => useViewportMode(768));
  act(() => media.fire(true));
  expect(result.current).toBe('desktop');
});
