export const GRID_SIZE = 9;
export const MINE_COUNT = 10;

export function createEmptyBoard(size = GRID_SIZE) {
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => ({
      row,
      col,
      mine: false,
      adjacent: 0,
      revealed: false,
      flagged: false,
    }))
  );
}

function forEachNeighbor(row, col, size, fn) {
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < size && c >= 0 && c < size) {
        fn(r, c);
      }
    }
  }
}

// Mines are placed only after the first click, avoiding that cell and its
// neighbors, so the opening click is never a mine and never a blind guess.
export function placeMines(board, safeRow, safeCol, mineCount = MINE_COUNT, rng = Math.random) {
  const size = board.length;
  const forbidden = new Set([`${safeRow},${safeCol}`]);
  forEachNeighbor(safeRow, safeCol, size, (r, c) => forbidden.add(`${r},${c}`));

  const cells = [];
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (!forbidden.has(`${r},${c}`)) {
        cells.push([r, c]);
      }
    }
  }

  for (let i = cells.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  const mineCells = cells.slice(0, mineCount);
  const next = board.map((row) => row.map((cell) => ({ ...cell })));
  mineCells.forEach(([r, c]) => {
    next[r][c].mine = true;
  });

  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (next[r][c].mine) continue;
      let count = 0;
      forEachNeighbor(r, c, size, (nr, nc) => {
        if (next[nr][nc].mine) count += 1;
      });
      next[r][c].adjacent = count;
    }
  }

  return next;
}

// Flood-fill reveal: reveals (row, col), and if it has no adjacent mines,
// keeps revealing its neighbors too. Returns a new board.
export function revealCell(board, row, col) {
  const size = board.length;
  const next = board.map((r) => r.map((cell) => ({ ...cell })));
  const stack = [[row, col]];
  const seen = new Set();

  while (stack.length) {
    const [r, c] = stack.pop();
    const key = `${r},${c}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const cell = next[r][c];
    if (cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    if (cell.adjacent === 0 && !cell.mine) {
      forEachNeighbor(r, c, size, (nr, nc) => {
        if (!next[nr][nc].revealed) {
          stack.push([nr, nc]);
        }
      });
    }
  }

  return next;
}

export function toggleFlag(board, row, col) {
  const next = board.map((r) => r.map((cell) => ({ ...cell })));
  const cell = next[row][col];
  if (!cell.revealed) {
    cell.flagged = !cell.flagged;
  }
  return next;
}

export function revealAllMines(board) {
  return board.map((row) => row.map((cell) => (cell.mine ? { ...cell, revealed: true } : cell)));
}

export function checkWin(board) {
  return board.every((row) => row.every((cell) => cell.mine || cell.revealed));
}

export function countFlags(board) {
  return board.reduce((sum, row) => sum + row.filter((cell) => cell.flagged).length, 0);
}
