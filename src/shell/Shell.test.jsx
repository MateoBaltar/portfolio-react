import { render, screen, fireEvent, act } from '@testing-library/react';
import { Shell } from './Shell';

function skipBoot() {
  act(() => { vi.runAllTimers(); });
}

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
