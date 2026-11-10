import { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { playClick } from '../shell/sound';
import { GRID_COLS, GRID_ROWS, DIRECTIONS, initialSnake, isOpposite, placeFood, step } from './snakeLogic';

const TICK_MS = 140;
const BEST_KEY = 'fireos-snake-best';

const KEY_DIRECTIONS = {
  ArrowUp: DIRECTIONS.UP,
  ArrowDown: DIRECTIONS.DOWN,
  ArrowLeft: DIRECTIONS.LEFT,
  ArrowRight: DIRECTIONS.RIGHT,
};

function loadBest() {
  try {
    const raw = window.localStorage.getItem(BEST_KEY);
    const value = raw ? Number(raw) : 0;
    return Number.isFinite(value) ? value : 0;
  } catch {
    // localStorage may be unavailable (blocked storage, privacy mode, etc.)
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // storage may be blocked, best score just won't persist
  }
}

function newGameState() {
  const snake = initialSnake(GRID_COLS, GRID_ROWS);
  return {
    snake,
    // body trails left of the head (initialSnake), so start moving RIGHT or
    // the first tick walks the head into its own neck
    direction: DIRECTIONS.RIGHT,
    pendingDirection: DIRECTIONS.RIGHT,
    food: placeFood(snake, GRID_COLS, GRID_ROWS),
    status: 'playing',
    score: 0,
  };
}

export function Snake() {
  const { t } = useLanguage();
  const strings = t('snake');
  const [game, setGame] = useState(newGameState);
  const [best, setBest] = useState(loadBest);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const next = KEY_DIRECTIONS[event.key];
      if (!next) return;
      event.preventDefault();
      setGame((g) => {
        if (g.status !== 'playing' || isOpposite(next, g.direction)) {
          return g;
        }
        return { ...g, pendingDirection: next };
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (game.status !== 'playing') {
      return undefined;
    }
    const id = setInterval(() => {
      setGame((g) => {
        const direction = g.pendingDirection;
        const result = step(g.snake, direction, g.food, GRID_COLS, GRID_ROWS);
        if (!result.alive) {
          return { ...g, status: 'lost' };
        }
        const score = result.ate ? g.score + 1 : g.score;
        const food = result.ate ? placeFood(result.snake, GRID_COLS, GRID_ROWS) : g.food;
        return { ...g, snake: result.snake, direction, food, score };
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [game.status]);

  useEffect(() => {
    if (game.status === 'lost' && game.score > best) {
      setBest(game.score);
      saveBest(game.score);
    }
    // Only fires on the playing -> lost transition, not every score change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.status]);

  const handleRestart = () => {
    playClick();
    setGame(newGameState());
  };

  const occupied = new Set(game.snake.map((s) => `${s.row},${s.col}`));

  return (
    <section className="section snake">
      <h2>{strings.title}</h2>
      <div className="snake__toolbar">
        <span className="snake__score" data-testid="snake-score">
          {strings.scoreLabel}: {game.score}
        </span>
        <span className="snake__best" data-testid="snake-best">
          {strings.bestLabel}: {best}
        </span>
        <button type="button" onClick={handleRestart}>
          {strings.restart}
        </button>
      </div>

      {game.status === 'lost' && <p data-testid="snake-lose">{strings.lose}</p>}

      <div
        className="snake__grid"
        data-testid="snake-grid"
        style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}
      >
        {Array.from({ length: GRID_ROWS * GRID_COLS }, (_, index) => {
          const row = Math.floor(index / GRID_COLS);
          const col = index % GRID_COLS;
          const isSnakeCell = occupied.has(`${row},${col}`);
          const isFoodCell = Boolean(game.food) && game.food.row === row && game.food.col === col;
          const cellClass = isSnakeCell
            ? 'snake__cell snake__cell--snake'
            : isFoodCell
            ? 'snake__cell snake__cell--food'
            : 'snake__cell';
          return <div className={cellClass} key={index} />;
        })}
      </div>
    </section>
  );
}

export default Snake;
