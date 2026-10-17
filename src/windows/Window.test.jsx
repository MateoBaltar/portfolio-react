import { useEffect } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WindowManagerProvider, useWindowManager } from './WindowManagerContext';
import { Window } from './Window';

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

test('clicking close calls onClose', () => {
  const onClose = vi.fn();
  render(
    <WindowManagerProvider>
      <Window id="about" title="About" onClose={onClose}>content</Window>
    </WindowManagerProvider>
  );
  fireEvent.click(screen.getByTestId('window-close-about'));
  expect(onClose).toHaveBeenCalled();
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
