export const GRID_COLS = 16;
export const GRID_ROWS = 16;

export const DIRECTIONS = {
  UP: { row: -1, col: 0 },
  DOWN: { row: 1, col: 0 },
  LEFT: { row: 0, col: -1 },
  RIGHT: { row: 0, col: 1 },
};

export function initialSnake(cols = GRID_COLS, rows = GRID_ROWS) {
  const row = Math.floor(rows / 2);
  const startCol = Math.floor(cols / 2);
  return [
    { row, col: startCol },
    { row, col: startCol - 1 },
    { row, col: startCol - 2 },
  ];
}

// blocks turning 180 into your own neck
export function isOpposite(a, b) {
  return a.row === -b.row && a.col === -b.col;
}

// random free cell for food, null if the board's full (that's the win)
export function placeFood(snake, cols = GRID_COLS, rows = GRID_ROWS, rng = Math.random) {
  const occupied = new Set(snake.map((s) => `${s.row},${s.col}`));
  const free = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (!occupied.has(`${r},${c}`)) {
        free.push({ row: r, col: c });
      }
    }
  }
  if (free.length === 0) {
    return null;
  }
  return free[Math.floor(rng() * free.length)];
}

// one tick in `direction`, returns a new { snake, ate, alive }, doesn't mutate input.
// no wrap-around, edges kill.
export function step(snake, direction, food, cols = GRID_COLS, rows = GRID_ROWS) {
  const head = snake[0];
  const nextHead = { row: head.row + direction.row, col: head.col + direction.col };

  const hitsWall = nextHead.row < 0 || nextHead.row >= rows || nextHead.col < 0 || nextHead.col >= cols;
  if (hitsWall) {
    return { snake, ate: false, alive: false };
  }

  const ate = Boolean(food) && nextHead.row === food.row && nextHead.col === food.col;
  // tail vacates this tick when not eating, so moving into it is fine; skip it from the check
  const bodyToCheck = ate ? snake : snake.slice(0, -1);
  const hitsSelf = bodyToCheck.some((s) => s.row === nextHead.row && s.col === nextHead.col);
  if (hitsSelf) {
    return { snake, ate: false, alive: false };
  }

  const nextSnake = [nextHead, ...(ate ? snake : snake.slice(0, -1))];
  return { snake: nextSnake, ate, alive: true };
}
