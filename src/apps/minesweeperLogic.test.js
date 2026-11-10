import {
  createEmptyBoard,
  placeMines,
  revealCell,
  toggleFlag,
  checkWin,
  revealAllMines,
  countFlags,
  isNewBest,
  GRID_SIZE,
  MINE_COUNT,
  DIFFICULTIES,
} from './minesweeperLogic';

test('createEmptyBoard produces a GRID_SIZE x GRID_SIZE board with no mines', () => {
  const board = createEmptyBoard();
  expect(board).toHaveLength(GRID_SIZE);
  expect(board[0]).toHaveLength(GRID_SIZE);
  expect(board.every((row) => row.every((cell) => !cell.mine))).toBe(true);
});

test('placeMines never places a mine on the first-clicked cell or its neighbors', () => {
  const board = createEmptyBoard();
  const placed = placeMines(board, 4, 4, MINE_COUNT);
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      expect(placed[4 + dr]?.[4 + dc]?.mine).not.toBe(true);
    }
  }
  const mineCount = placed.flat().filter((c) => c.mine).length;
  expect(mineCount).toBe(MINE_COUNT);
});

test('revealCell flood-fills connected zero-adjacent cells and stops at a mine', () => {
  let board = createEmptyBoard(3);
  board = board.map((row, r) => row.map((cell, c) => ({ ...cell, mine: r === 2 && c === 2 })));
  board = board.map((row, r) =>
    row.map((cell, c) => {
      if (cell.mine) return cell;
      let count = 0;
      for (let dr = -1; dr <= 1; dr += 1) {
        for (let dc = -1; dc <= 1; dc += 1) {
          if (dr === 0 && dc === 0) continue;
          if (board[r + dr]?.[c + dc]?.mine) count += 1;
        }
      }
      return { ...cell, adjacent: count };
    })
  );

  const revealed = revealCell(board, 0, 0);
  const revealedCount = revealed.flat().filter((c) => c.revealed).length;
  expect(revealedCount).toBe(8);
  expect(revealed[2][2].revealed).toBe(false);
});

test('toggleFlag flips flagged state on an unrevealed cell, does nothing on a revealed one', () => {
  let board = createEmptyBoard(3);
  board = toggleFlag(board, 1, 1);
  expect(board[1][1].flagged).toBe(true);
  board = toggleFlag(board, 1, 1);
  expect(board[1][1].flagged).toBe(false);

  board[0][0].revealed = true;
  const after = toggleFlag(board, 0, 0);
  expect(after[0][0].flagged).toBe(false);
});

test('checkWin is true only once every non-mine cell is revealed', () => {
  let board = createEmptyBoard(2).map((row, r) =>
    row.map((cell, c) => ({ ...cell, mine: r === 0 && c === 0 }))
  );
  expect(checkWin(board)).toBe(false);
  board = board.map((row) => row.map((cell) => (cell.mine ? cell : { ...cell, revealed: true })));
  expect(checkWin(board)).toBe(true);
});

test('revealAllMines reveals every mine cell without touching others', () => {
  let board = createEmptyBoard(2).map((row, r) =>
    row.map((cell, c) => ({ ...cell, mine: r === 0 && c === 0 }))
  );
  const revealed = revealAllMines(board);
  expect(revealed[0][0].revealed).toBe(true);
  expect(revealed[0][1].revealed).toBe(false);
});

test('countFlags counts flagged cells across the board', () => {
  let board = createEmptyBoard(3);
  board = toggleFlag(board, 0, 0);
  board = toggleFlag(board, 1, 1);
  expect(countFlags(board)).toBe(2);
});

test('createEmptyBoard supports a non-square board (cols != rows)', () => {
  const board = createEmptyBoard(30, 16);
  expect(board).toHaveLength(16);
  expect(board[0]).toHaveLength(30);
});

test('placeMines works correctly on a non-square (expert-size) board', () => {
  const board = createEmptyBoard(DIFFICULTIES.expert.cols, DIFFICULTIES.expert.rows);
  const placed = placeMines(board, 8, 15, DIFFICULTIES.expert.mines);
  const mineCount = placed.flat().filter((c) => c.mine).length;
  expect(mineCount).toBe(DIFFICULTIES.expert.mines);
  // Safe-zone cell and its neighbors must never be mined.
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      expect(placed[8 + dr]?.[15 + dc]?.mine).not.toBe(true);
    }
  }
});

test('revealCell flood-fill respects non-square board edges', () => {
  // 4x2, no mines: one corner reveal should flood-fill the whole board
  const board = createEmptyBoard(4, 2);
  const revealed = revealCell(board, 0, 0);
  const revealedCount = revealed.flat().filter((c) => c.revealed).length;
  expect(revealedCount).toBe(8);
});

test('isNewBest is true when there is no stored best yet', () => {
  expect(isNewBest(null, 30)).toBe(true);
  expect(isNewBest(undefined, 30)).toBe(true);
});

test('isNewBest is true only when the candidate is strictly faster', () => {
  expect(isNewBest(30, 29)).toBe(true);
  expect(isNewBest(30, 30)).toBe(false);
  expect(isNewBest(30, 31)).toBe(false);
});
