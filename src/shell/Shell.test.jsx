import { render, screen, fireEvent, act } from '@testing-library/react';
import { Shell } from './Shell';
import { playClick } from './sound';

vi.mock('./sound', () => ({
  playClick: vi.fn(),
  playKey: vi.fn(),
  isMuted: vi.fn(() => false),
  toggleMute: vi.fn(() => true),
}));

function skipBoot() {
  act(() => { vi.runAllTimers(); });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  // one test swaps in a fake localStorage; reset it so it doesn't leak into later tests
  window.localStorage = undefined;
});

test('desktop: opening the same item twice via the start menu opens exactly one focused window', () => {
  window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  fireEvent.click(screen.getByTestId('desktop-menu-button'));
  fireEvent.click(screen.getByTestId('desktop-menu-item-skills'));
  fireEvent.click(screen.getByTestId('desktop-menu-button'));
  fireEvent.click(screen.getByTestId('desktop-menu-item-skills'));

  expect(screen.getAllByTestId('window-skills')).toHaveLength(1);
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
  // boot auto-opens the terminal, not About, so open About explicitly
  fireEvent.doubleClick(screen.getByTestId('desktop-icon-about'));
  expect(screen.getByText(/Backend-leaning full-stack developer/)).toBeInTheDocument();
  fireEvent.click(screen.getByTestId('lang-toggle'));
  expect(screen.getByTestId('window-about')).toBeInTheDocument();
  expect(screen.getByText(/Desarrollador full-stack con orientación a backend/)).toBeInTheDocument();
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

  // boot auto-opens the terminal, not About, so open About explicitly
  fireEvent.doubleClick(screen.getByTestId('desktop-icon-about'));
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

test('desktop: typing "lang es" into the terminal window switches the visible language', () => {
  window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  // boot auto-opens the terminal, so type directly with no need to open it first
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'lang es' } });
  fireEvent.submit(input.closest('form'));

  fireEvent.doubleClick(screen.getByTestId('desktop-icon-about'));
  expect(screen.getByText(/Desarrollador full-stack con orientación a backend/)).toBeInTheDocument();
  vi.useRealTimers();
});

test('desktop: typing an unknown command into the terminal window shows the not-found message', () => {
  window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  // boot auto-opens the terminal, so type directly with no need to open it first
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'abuot' } });
  fireEvent.submit(input.closest('form'));

  expect(screen.getByText('command not found, try \'help\'')).toBeInTheDocument();
  vi.useRealTimers();
});

test('desktop: boot auto-opens the terminal window, not About', () => {
  window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  expect(screen.getByTestId('window-terminal')).toBeInTheDocument();
  expect(screen.queryByTestId('window-about')).toBeNull();
  vi.useRealTimers();
});

test('mobile: typing an unknown command into the real command prompt shows the not-found message', () => {
  window.matchMedia = () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'abuot' } });
  fireEvent.submit(input.closest('form'));

  expect(screen.getByText('command not found, try \'help\'')).toBeInTheDocument();
  vi.useRealTimers();
});

test('desktop: double-clicking a desktop icon opens its section', () => {
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
  // jsdom doesn't reliably forward clientX/clientY/pointerId into React's synthetic
  // pointer events, so this only covers the no-movement path; the drag math itself
  // is unit-tested directly in dragPosition.test.js
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

test('desktop: icons restore a previously saved grid position from localStorage', () => {
  // jsdom has no window.localStorage, so Desktop's reads/writes are a no-op in
  // every other test; stub a working in-memory version just for this one
  const store = { 'fireos-icon-positions': JSON.stringify({ about: { col: 1, row: 2 } }) };
  window.localStorage = {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = value; },
  };
  window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  const icon = screen.getByTestId('desktop-icon-about');
  // GRID_ORIGIN_X=16 + col(1)*GRID_CELL_WIDTH(112) = 128; GRID_ORIGIN_Y=16 + row(2)*GRID_CELL_HEIGHT(132) = 280.
  expect(icon.style.left).toBe('128px');
  expect(icon.style.top).toBe('280px');

  vi.useRealTimers();
});

test('desktop: the old flat nav bar is not rendered, the start menu is used instead', () => {
  window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  expect(screen.queryByTestId('nav-about')).toBeNull();
  expect(screen.getByTestId('desktop-menu-button')).toBeInTheDocument();
  vi.useRealTimers();
});

test('mobile: the desktop taskbar/start-menu is not rendered, the flat nav bar is kept', () => {
  window.matchMedia = () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  expect(screen.queryByTestId('desktop-menu-button')).toBeNull();
  expect(screen.getByTestId('nav-about')).toBeInTheDocument();
  vi.useRealTimers();
});

test('desktop: the start menu lists every section plus the terminal, and closes on an outside click', () => {
  window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  fireEvent.click(screen.getByTestId('desktop-menu-button'));
  expect(screen.getByTestId('desktop-menu-popup')).toBeInTheDocument();
  expect(screen.getByTestId('desktop-menu-item-about')).toBeInTheDocument();
  expect(screen.getByTestId('desktop-menu-item-skills')).toBeInTheDocument();
  expect(screen.getByTestId('desktop-menu-item-experience')).toBeInTheDocument();
  expect(screen.getByTestId('desktop-menu-item-projects')).toBeInTheDocument();
  expect(screen.getByTestId('desktop-menu-item-contact')).toBeInTheDocument();
  expect(screen.getByTestId('desktop-menu-item-terminal')).toBeInTheDocument();

  fireEvent.pointerDown(document.body);
  expect(screen.queryByTestId('desktop-menu-popup')).toBeNull();
  vi.useRealTimers();
});

test('desktop: pressing Escape closes the start menu', () => {
  window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  fireEvent.click(screen.getByTestId('desktop-menu-button'));
  expect(screen.getByTestId('desktop-menu-popup')).toBeInTheDocument();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByTestId('desktop-menu-popup')).toBeNull();
  vi.useRealTimers();
});

test('desktop: opening the terminal twice focuses the existing window instead of duplicating it', () => {
  window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  fireEvent.doubleClick(screen.getByTestId('desktop-icon-terminal'));
  fireEvent.doubleClick(screen.getByTestId('desktop-icon-terminal'));

  expect(screen.getAllByTestId('window-terminal')).toHaveLength(1);
  vi.useRealTimers();
});

test('desktop: double-clicking a desktop icon plays a click sound', () => {
  window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  fireEvent.doubleClick(screen.getByTestId('desktop-icon-skills'));
  expect(playClick).toHaveBeenCalled();
  vi.useRealTimers();
});

test('desktop: the menu button shows the FireOS mark', () => {
  window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  const button = screen.getByTestId('desktop-menu-button');
  expect(button.querySelector('img')).toBeTruthy();
  vi.useRealTimers();
});

test('desktop: the taskbar shows the FireOS version and a clock reflecting the system time', () => {
  window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-19T10:30:00'));
  render(<Shell />);
  skipBoot();

  expect(screen.getByTestId('taskbar-version')).toHaveTextContent('FireOS v1.0');
  expect(screen.getByTestId('taskbar-clock')).toHaveTextContent('10:30');
  vi.useRealTimers();
});

test('desktop: the sound toggle switches mute state', () => {
  window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  const toggle = screen.getByTestId('sound-toggle');
  expect(toggle.getAttribute('aria-pressed')).toBe('false');
  fireEvent.click(toggle);
  expect(toggle.getAttribute('aria-pressed')).toBe('true');
  vi.useRealTimers();
});

test('desktop: GitHub and Minesweeper are openable from the start menu and the icon grid', () => {
  window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  expect(screen.getByTestId('desktop-icon-github')).toBeInTheDocument();
  expect(screen.getByTestId('desktop-icon-minesweeper')).toBeInTheDocument();

  fireEvent.click(screen.getByTestId('desktop-menu-button'));
  expect(screen.getByTestId('desktop-menu-item-github')).toBeInTheDocument();
  expect(screen.getByTestId('desktop-menu-item-minesweeper')).toBeInTheDocument();

  fireEvent.doubleClick(screen.getByTestId('desktop-icon-minesweeper'));
  expect(screen.getByTestId('window-minesweeper')).toBeInTheDocument();
  vi.useRealTimers();
});

test('mobile: GitHub and Minesweeper appear in the flat nav bar', () => {
  window.matchMedia = () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  expect(screen.getByTestId('nav-github')).toBeInTheDocument();
  expect(screen.getByTestId('nav-minesweeper')).toBeInTheDocument();
  fireEvent.click(screen.getByTestId('nav-minesweeper'));
  expect(screen.getByTestId('section-minesweeper')).toBeInTheDocument();
  vi.useRealTimers();
});

test('desktop: typing "fetch" into the terminal prints OS info', () => {
  window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'fetch' } });
  fireEvent.submit(input.closest('form'));

  expect(screen.getByText(/OS: FireOS v1\.0/)).toBeInTheDocument();
  expect(screen.getByText(/Host: Uppsala, Sweden/)).toBeInTheDocument();
  vi.useRealTimers();
});

test('desktop: an easter egg command prints its joke instead of "command not found"', () => {
  window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'sudo' } });
  fireEvent.submit(input.closest('form'));

  expect(screen.getByText("nice try, you're not root here.")).toBeInTheDocument();
  expect(screen.queryByText('command not found, try \'help\'')).toBeNull();
  vi.useRealTimers();
});

test('desktop: clicking an open-window taskbar tab focuses that window', () => {
  window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} });
  vi.useFakeTimers();
  render(<Shell />);
  skipBoot();

  // boot auto-opened 'terminal'; opening 'skills' next makes it the focused one
  fireEvent.doubleClick(screen.getByTestId('desktop-icon-skills'));
  expect(screen.getByTestId('taskbar-tab-terminal')).toBeInTheDocument();
  expect(screen.getByTestId('taskbar-tab-skills')).toBeInTheDocument();

  fireEvent.click(screen.getByTestId('taskbar-tab-terminal'));

  expect(screen.getByTestId('window-titlebar-terminal').className).toMatch(/--focused/);
  expect(screen.getByTestId('window-titlebar-skills').className).not.toMatch(/--focused/);
  vi.useRealTimers();
});
