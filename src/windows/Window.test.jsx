import { useEffect } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { WindowManagerProvider, useWindowManager } from './WindowManagerContext';
import { Window } from './Window';
import { playClick } from '../shell/sound';

vi.mock('../shell/sound', () => ({
  playClick: vi.fn(),
  playKey: vi.fn(),
  isMuted: vi.fn(() => false),
  toggleMute: vi.fn(() => true),
}));

afterEach(() => {
  vi.clearAllMocks();
});

function Harness() {
  const { openWindow } = useWindowManager();
  useEffect(() => openWindow('about', 'About'), []);
  return <Window id="about" title="About" onClose={() => {}}>content</Window>;
}

test('double-clicking the title bar toggles fullscreen', () => {
  render(<WindowManagerProvider><Harness /></WindowManagerProvider>);
  const titleBar = screen.getByTestId('window-titlebar-about');
  fireEvent.doubleClick(titleBar);
  expect(screen.getByTestId('window-about').dataset.fullscreen).toBe('true');
});

test('clicking close calls onClose after the exit animation delay', () => {
  vi.useFakeTimers();
  const onClose = vi.fn();
  render(
    <WindowManagerProvider>
      <Window id="about" title="About" onClose={onClose}>content</Window>
    </WindowManagerProvider>
  );
  fireEvent.click(screen.getByTestId('window-close-about'));
  expect(onClose).not.toHaveBeenCalled();
  act(() => {
    vi.advanceTimersByTime(160);
  });
  expect(onClose).toHaveBeenCalled();
  vi.useRealTimers();
});

test('the window stays mounted mid-exit-animation and is removed once it finishes', () => {
  vi.useFakeTimers();
  function Harness2() {
    const { openWindow, windows } = useWindowManager();
    useEffect(() => openWindow('about', 'About'), []);
    if (!windows.find((w) => w.id === 'about')) {
      return null;
    }
    return (
      <Window id="about" title="About">
        content
      </Window>
    );
  }
  render(
    <WindowManagerProvider>
      <Harness2 />
    </WindowManagerProvider>
  );
  fireEvent.click(screen.getByTestId('window-close-about'));
  expect(screen.getByTestId('window-about')).toBeInTheDocument();
  act(() => {
    vi.advanceTimersByTime(160);
  });
  expect(screen.queryByTestId('window-about')).toBeNull();
  vi.useRealTimers();
});

test('closing is instant when the user prefers reduced motion', () => {
  const originalMatchMedia = window.matchMedia;
  window.matchMedia = () => ({ matches: true });
  const onClose = vi.fn();
  render(
    <WindowManagerProvider>
      <Window id="about" title="About" onClose={onClose}>content</Window>
    </WindowManagerProvider>
  );
  fireEvent.click(screen.getByTestId('window-close-about'));
  expect(onClose).toHaveBeenCalled();
  window.matchMedia = originalMatchMedia;
});

test('clicking close plays a click sound', () => {
  render(
    <WindowManagerProvider>
      <Window id="about" title="About">content</Window>
    </WindowManagerProvider>
  );
  fireEvent.click(screen.getByTestId('window-close-about'));
  expect(playClick).toHaveBeenCalled();
});

test('a pointerdown on the close button does not capture the pointer on the title bar', () => {
  // Regression test: capturing here would steal the subsequent click away
  // from the button in a real browser, even though jsdom's fireEvent.click
  // can't reproduce that suppression directly.
  const setPointerCapture = vi.fn();
  window.HTMLElement.prototype.setPointerCapture = setPointerCapture;
  render(
    <WindowManagerProvider>
      <Window id="about" title="About">content</Window>
    </WindowManagerProvider>
  );
  fireEvent.pointerDown(screen.getByTestId('window-close-about'), { pointerId: 1 });
  expect(setPointerCapture).not.toHaveBeenCalled();

  fireEvent.pointerDown(screen.getByTestId('window-titlebar-about'), { pointerId: 2 });
  expect(setPointerCapture).toHaveBeenCalledTimes(1);
});
