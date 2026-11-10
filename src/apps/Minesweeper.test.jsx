import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider } from '../i18n/LanguageContext';
import { Minesweeper } from './Minesweeper';

function renderGame() {
  return render(
    <LanguageProvider initialLang="en">
      <Minesweeper />
    </LanguageProvider>
  );
}

test('renders a 9x9 grid of cells', () => {
  renderGame();
  expect(screen.getByTestId('mine-cell-0-0')).toBeInTheDocument();
  expect(screen.getByTestId('mine-cell-8-8')).toBeInTheDocument();
  expect(screen.queryByTestId('mine-cell-9-0')).toBeNull();
});

test('clicking a cell in flag mode flags it instead of revealing it', () => {
  renderGame();
  fireEvent.click(screen.getByRole('button', { name: /flag mode/i }));
  const cell = screen.getByTestId('mine-cell-4-4');
  fireEvent.click(cell);
  expect(cell).toHaveTextContent('F');
  expect(screen.getByTestId('mines-left')).toHaveTextContent('9');
});

test('the restart button resets the board to a fresh, unrevealed state', () => {
  renderGame();
  fireEvent.click(screen.getByTestId('mine-cell-0-0'));
  fireEvent.click(screen.getByRole('button', { name: /restart/i }));
  expect(screen.queryByTestId('minesweeper-win')).toBeNull();
  expect(screen.queryByTestId('minesweeper-lose')).toBeNull();
  expect(screen.getByTestId('mines-left')).toHaveTextContent('10');
});

test('switching difficulty rebuilds the board at the new size and mine count', () => {
  renderGame();
  expect(screen.getByTestId('mine-cell-8-8')).toBeInTheDocument();
  expect(screen.queryByTestId('mine-cell-15-15')).toBeNull();

  fireEvent.click(screen.getByTestId('minesweeper-difficulty-intermediate'));

  expect(screen.getByTestId('mine-cell-15-15')).toBeInTheDocument();
  expect(screen.queryByTestId('mine-cell-16-0')).toBeNull();
  expect(screen.getByTestId('mines-left')).toHaveTextContent('40');
});

test('no best time is shown before anything has been won', () => {
  renderGame();
  expect(screen.queryByTestId('minesweeper-best')).toBeNull();
});

test('a previously saved best time for the current difficulty is displayed on mount', () => {
  const store = { 'fireos-minesweeper-best': JSON.stringify({ beginner: 42 }) };
  window.localStorage = {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => {
      store[key] = value;
    },
  };

  renderGame();
  expect(screen.getByTestId('minesweeper-best')).toHaveTextContent('42s');

  window.localStorage = undefined;
});
