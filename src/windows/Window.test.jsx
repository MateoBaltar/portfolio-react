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
