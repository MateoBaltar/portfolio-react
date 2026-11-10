import { render, screen, fireEvent, act } from '@testing-library/react';
import { LanguageProvider } from '../i18n/LanguageContext';
import { Snake } from './Snake';

function renderGame() {
  return render(
    <LanguageProvider initialLang="en">
      <Snake />
    </LanguageProvider>
  );
}

afterEach(() => {
  window.localStorage = undefined;
});

test('renders a 16x16 grid and the score/best labels', () => {
  renderGame();
  const grid = screen.getByTestId('snake-grid');
  expect(grid.children).toHaveLength(256);
  expect(screen.getByTestId('snake-score')).toHaveTextContent('Score: 0');
  expect(screen.getByTestId('snake-best')).toHaveTextContent('Best: 0');
});

test('the restart button resets score and clears a game-over state', () => {
  vi.useFakeTimers();
  renderGame();

  // Drive the snake into the right wall to end the game quickly (it starts
  // at horizontal center heading right, away from its own tail).
  act(() => {
    vi.advanceTimersByTime(140 * 20);
  });
  expect(screen.getByTestId('snake-lose')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /restart/i }));
  expect(screen.queryByTestId('snake-lose')).toBeNull();
  expect(screen.getByTestId('snake-score')).toHaveTextContent('Score: 0');

  vi.useRealTimers();
});

test('a direct 180-degree reversal key is ignored, so the snake does not instantly reverse into itself', () => {
  vi.useFakeTimers();
  renderGame();

  // starts heading RIGHT; ArrowLeft would reverse into itself, isOpposite() should block it
  fireEvent.keyDown(window, { key: 'ArrowLeft' });
  act(() => {
    vi.advanceTimersByTime(140);
  });
  expect(screen.queryByTestId('snake-lose')).toBeNull();

  vi.useRealTimers();
});

test('a previously saved best score is displayed on mount', () => {
  const store = { 'fireos-snake-best': '7' };
  window.localStorage = {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => {
      store[key] = value;
    },
  };

  renderGame();
  expect(screen.getByTestId('snake-best')).toHaveTextContent('Best: 7');
});
