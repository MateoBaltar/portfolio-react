import { DIRECTIONS, initialSnake, isOpposite, placeFood, step } from './snakeLogic';

test('initialSnake places a 3-segment snake centered on the board, heading right-to-left', () => {
  const snake = initialSnake(16, 16);
  expect(snake).toEqual([
    { row: 8, col: 8 },
    { row: 8, col: 7 },
    { row: 8, col: 6 },
  ]);
});

test('isOpposite detects a direct 180-degree reversal', () => {
  expect(isOpposite(DIRECTIONS.UP, DIRECTIONS.DOWN)).toBe(true);
  expect(isOpposite(DIRECTIONS.LEFT, DIRECTIONS.RIGHT)).toBe(true);
  expect(isOpposite(DIRECTIONS.UP, DIRECTIONS.LEFT)).toBe(false);
  expect(isOpposite(DIRECTIONS.UP, DIRECTIONS.UP)).toBe(false);
});

test('placeFood lands on the only free cell when the rest of the board is occupied', () => {
  const snake = [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
  ];
  const food = placeFood(snake, 2, 2);
  expect(food).toEqual({ row: 1, col: 1 });
});

test('placeFood returns null once the board is completely full', () => {
  const snake = [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 1, col: 1 },
  ];
  expect(placeFood(snake, 2, 2)).toBeNull();
});

test('step moves the snake one cell without growing when it does not eat', () => {
  const snake = [
    { row: 5, col: 5 },
    { row: 5, col: 6 },
    { row: 5, col: 7 },
  ];
  const result = step(snake, DIRECTIONS.LEFT, { row: 0, col: 0 }, 16, 16);
  expect(result.alive).toBe(true);
  expect(result.ate).toBe(false);
  expect(result.snake).toEqual([
    { row: 5, col: 4 },
    { row: 5, col: 5 },
    { row: 5, col: 6 },
  ]);
});

test('step grows the snake by one segment when it eats', () => {
  const snake = [
    { row: 5, col: 5 },
    { row: 5, col: 6 },
  ];
  const result = step(snake, DIRECTIONS.LEFT, { row: 5, col: 4 }, 16, 16);
  expect(result.ate).toBe(true);
  expect(result.snake).toHaveLength(3);
  expect(result.snake[0]).toEqual({ row: 5, col: 4 });
  // grew, not shifted, nothing dropped
  expect(result.snake).toEqual([{ row: 5, col: 4 }, ...snake]);
});

test('step reports death on hitting a wall', () => {
  const snake = [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
  ];
  const result = step(snake, DIRECTIONS.UP, null, 16, 16);
  expect(result.alive).toBe(false);
  expect(result.snake).toBe(snake);
});

test('step allows moving into the current tail cell (it vacates this same tick)', () => {
  // U-shaped snake, moving DOWN lands on the tail's current cell, legal since it vacates
  const snake = [
    { row: 5, col: 5 },
    { row: 5, col: 6 },
    { row: 6, col: 6 },
    { row: 6, col: 5 },
  ];
  const result = step(snake, DIRECTIONS.DOWN, null, 16, 16);
  expect(result.alive).toBe(true);
});

test('step reports death when the head moves into a body segment that is not the tail', () => {
  const snake = [
    { row: 5, col: 5 },
    { row: 4, col: 5 },
    { row: 4, col: 6 },
    { row: 5, col: 6 },
  ];
  // UP from (5,5) lands on (4,5), snake[1], not the tail
  const result = step(snake, DIRECTIONS.UP, null, 16, 16);
  expect(result.alive).toBe(false);
});
