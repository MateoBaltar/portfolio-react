import { render, screen, fireEvent, act } from '@testing-library/react';
import { Shell } from './Shell';

function skipBoot() {
  act(() => { vi.runAllTimers(); });
}

afterEach(() => {
  vi.restoreAllMocks();
  // one test swaps in a fake localStorage; reset it so it doesn't leak into later tests
  window.localStorage = undefined;
});

test('desktop: clicking a nav item twice opens exactly one focused window', () => {
  window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();
  fireEvent.click(screen.getByTestId('nav-about'));
  fireEvent.click(screen.getByTestId('nav-about'));
  expect(screen.getAllByTestId('window-about')).toHaveLength(1);
  vi.useRealTimers();
});

test('mobile: clicking a nav item renders section content with no window chrome', () => {
  window.matchMedia = () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();
  fireEvent.click(screen.getByTestId('nav-about'));
  expect(screen.queryByTestId('window-about')).toBeNull();
  expect(screen.getByTestId('section-about')).toBeInTheDocument();
  vi.useRealTimers();
});

test('toggling language re-renders an open section without closing its window', () => {
  window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();
  fireEvent.click(screen.getByTestId('nav-about'));
  expect(screen.getByText(/Backend-leaning full-stack developer/)).toBeInTheDocument();
  fireEvent.click(screen.getByTestId('lang-toggle'));
  expect(screen.getByTestId('window-about')).toBeInTheDocument();
  expect(screen.getByText(/Desarrollador full-stack con inclinación backend/)).toBeInTheDocument();
  vi.useRealTimers();
});

test('crossing the desktop/mobile breakpoint keeps the open section visible', () => {
  let listener;
  const mql = {
    matches: true,
    addEventListener: (_, cb) => { listener = cb; },
    removeEventListener: () => {},
  };
  window.matchMedia = () => mql;
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  fireEvent.click(screen.getByTestId('nav-about'));
  expect(screen.getByTestId('window-about')).toBeInTheDocument();

  act(() => {
    mql.matches = false;
    listener({ matches: false });
  });

  expect(screen.queryByTestId('window-about')).toBeNull();
  expect(screen.getByTestId('section-about')).toBeInTheDocument();
  expect(screen.getByText(/Backend-leaning full-stack developer/)).toBeInTheDocument();
  vi.useRealTimers();
});

test('navigating several sections on mobile then crossing to desktop opens only the last-viewed section', () => {
  let listener;
  const mql = {
    matches: false,
    addEventListener: (_, cb) => { listener = cb; },
    removeEventListener: () => {},
  };
  window.matchMedia = () => mql;
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  fireEvent.click(screen.getByTestId('nav-about'));
  fireEvent.click(screen.getByTestId('nav-skills'));
  expect(screen.getByTestId('section-skills')).toBeInTheDocument();

  act(() => {
    mql.matches = true;
    listener({ matches: true });
  });

  expect(screen.queryByTestId('window-about')).toBeNull();
  expect(screen.getByTestId('window-skills')).toBeInTheDocument();
  expect(screen.getAllByTestId(/^window-[a-z]+$/)).toHaveLength(1);
  vi.useRealTimers();
});

test('typing "lang es" into the real command prompt switches the visible language', () => {
  window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  expect(screen.getByText(/Backend-leaning full-stack developer/)).toBeInTheDocument();

  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'lang es' } });
  fireEvent.submit(input.closest('form'));

  expect(screen.getByText(/Desarrollador full-stack con inclinación backend/)).toBeInTheDocument();
  vi.useRealTimers();
});

test('typing an unknown command into the real command prompt shows the not-found message', () => {
  window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'abuot' } });
  fireEvent.submit(input.closest('form'));

  expect(screen.getByText('command not found, try \'help\'')).toBeInTheDocument();
  vi.useRealTimers();
});

test('desktop: double-clicking a desktop icon opens its section, same as the matching nav button', () => {
  window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  expect(screen.getByTestId('desktop-icon-skills')).toBeInTheDocument();
  fireEvent.doubleClick(screen.getByTestId('desktop-icon-skills'));
  expect(screen.getByTestId('window-skills')).toBeInTheDocument();
  vi.useRealTimers();
});

test('mobile: desktop icons are not rendered', () => {
  window.matchMedia = () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  expect(screen.queryByTestId('desktop-icon-about')).toBeNull();
  vi.useRealTimers();
});

test('mobile: the animated space background does not render', () => {
  window.matchMedia = () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  expect(screen.queryByTestId('space-bg')).toBeNull();
  vi.useRealTimers();
});

test('desktop: the animated space background renders', () => {
  window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  expect(screen.getByTestId('space-bg')).toBeInTheDocument();
  vi.useRealTimers();
});

test('desktop: a pointerdown/pointerup with no movement in between still lets a double-click open the section', () => {
  // jsdom/fireEvent doesn't reliably forward clientX/clientY/pointerId into
  // React's synthetic pointer events, so this only exercises the no-movement
  // path (no pointerMove fired at all) — the threshold/clamping math itself
  // is unit-tested directly in dragPosition.test.js instead of simulated here.
  window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  const icon = screen.getByTestId('desktop-icon-skills');
  fireEvent.pointerDown(icon, { pointerId: 2 });
  fireEvent.pointerUp(icon, { pointerId: 2 });
  fireEvent.doubleClick(icon);

  expect(screen.getByTestId('window-skills')).toBeInTheDocument();

  vi.useRealTimers();
});

test('desktop: icons restore a previously saved position from localStorage', () => {
  // jsdom has no window.localStorage, so Desktop's reads/writes are a no-op in
  // every other test; stub a working in-memory version just for this one
  const store = { 'fireos-icon-positions': JSON.stringify({ about: { x: 123, y: 45 } }) };
  window.localStorage = {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = value; },
  };
  window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  const icon = screen.getByTestId('desktop-icon-about');
  expect(icon.style.left).toBe('123px');
  expect(icon.style.top).toBe('45px');

  vi.useRealTimers();
});
