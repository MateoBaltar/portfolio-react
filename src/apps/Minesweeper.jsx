import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { playClick } from '../shell/sound';
import {
  createEmptyBoard,
  placeMines,
  revealCell,
  toggleFlag,
  checkWin,
  revealAllMines,
  countFlags,
  isNewBest,
  DIFFICULTIES,
} from './minesweeperLogic';

const BEST_KEY = 'fireos-minesweeper-best';
const DIFFICULTY_KEYS = Object.keys(DIFFICULTIES);

function loadBestTimes() {
  try {
    const raw = window.localStorage.getItem(BEST_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    // localStorage may be unavailable (blocked storage, privacy mode, etc.)
    return {};
  }
}

function saveBestTimes(times) {
  try {
    window.localStorage.setItem(BEST_KEY, JSON.stringify(times));
  } catch {
    // storage may be blocked (privacy mode etc); best score just won't persist
  }
}

function newGameState(difficulty) {
  const { cols, rows } = DIFFICULTIES[difficulty];
  return {
    difficulty,
    board: createEmptyBoard(cols, rows),
    started: false,
    status: 'playing',
    startedAt: null,
  };
}

function cellLabel(cell) {
  if (cell.revealed) {
    if (cell.mine) return '*';
    return cell.adjacent > 0 ? String(cell.adjacent) : '';
  }
  return cell.flagged ? 'F' : '';
}

export function Minesweeper() {
  const { t } = useLanguage();
  const strings = t('minesweeper');
  const [game, setGame] = useState(() => newGameState('beginner'));
  const [flagMode, setFlagMode] = useState(false);
  const [bestTimes, setBestTimes] = useState(loadBestTimes);

  const mineCount = DIFFICULTIES[game.difficulty].mines;

  const recordBest = (difficulty, elapsedSeconds) => {
    setBestTimes((prev) => {
      if (!isNewBest(prev[difficulty], elapsedSeconds)) {
        return prev;
      }
      const next = { ...prev, [difficulty]: elapsedSeconds };
      saveBestTimes(next);
      return next;
    });
  };

  const handleDifficultyChange = (difficulty) => {
    if (difficulty === game.difficulty) return;
    playClick();
    setGame(newGameState(difficulty));
  };

  const handleRestart = () => {
    playClick();
    setGame(newGameState(game.difficulty));
  };

  const handleCellAction = (row, col, wantFlag) => {
    if (game.status !== 'playing') return;
    const cell = game.board[row][col];

    if (wantFlag) {
      if (cell.revealed) return;
      setGame((g) => ({ ...g, board: toggleFlag(g.board, row, col) }));
      return;
    }
    if (cell.flagged || cell.revealed) return;

    let board = game.board;
    let startedAt = game.startedAt;
    if (!game.started) {
      board = placeMines(board, row, col, mineCount);
      startedAt = Date.now();
    }

    if (board[row][col].mine) {
      setGame({ ...game, board: revealAllMines(board), started: true, status: 'lost', startedAt });
      return;
    }

    const revealed = revealCell(board, row, col);
    const won = checkWin(revealed);
    setGame({
      ...game,
      board: revealed,
      started: true,
      status: won ? 'won' : 'playing',
      startedAt,
    });
    if (won) {
      recordBest(game.difficulty, Math.round((Date.now() - startedAt) / 1000));
    }
  };

  const minesLeft = mineCount - countFlags(game.board);
  const bestForDifficulty = bestTimes[game.difficulty];

  return (
    <section className="section minesweeper">
      <h2>{strings.title}</h2>

      <div className="minesweeper__difficulty">
        {DIFFICULTY_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={
              game.difficulty === key
                ? 'minesweeper__difficulty-btn minesweeper__difficulty-btn--active'
                : 'minesweeper__difficulty-btn'
            }
            aria-pressed={game.difficulty === key}
            data-testid={`minesweeper-difficulty-${key}`}
            onClick={() => handleDifficultyChange(key)}
          >
            {strings.difficulties[key]}
          </button>
        ))}
      </div>

      <div className="minesweeper__toolbar">
        <span className="minesweeper__counter" data-testid="mines-left">
          {strings.minesLabel}: {minesLeft}
        </span>
        {bestForDifficulty != null && (
          <span className="minesweeper__best" data-testid="minesweeper-best">
            {strings.bestLabel}: {bestForDifficulty}s
          </span>
        )}
        <button
          type="button"
          className={
            flagMode
              ? 'minesweeper__flag-toggle minesweeper__flag-toggle--active'
              : 'minesweeper__flag-toggle'
          }
          aria-pressed={flagMode}
          onClick={() => setFlagMode((f) => !f)}
        >
          {strings.flagMode}
        </button>
        <button type="button" onClick={handleRestart}>
          {strings.restart}
        </button>
      </div>

      {game.status === 'won' && <p data-testid="minesweeper-win">{strings.win}</p>}
      {game.status === 'lost' && <p data-testid="minesweeper-lose">{strings.lose}</p>}

      <div className="minesweeper__grid" role="grid">
        {game.board.map((row, r) => (
          <div className="minesweeper__row" role="row" key={r}>
            {row.map((cell, c) => (
              <button
                type="button"
                key={c}
                className={
                  cell.revealed
                    ? 'minesweeper__cell minesweeper__cell--revealed'
                    : 'minesweeper__cell'
                }
                data-testid={`mine-cell-${r}-${c}`}
                onClick={() => handleCellAction(r, c, flagMode)}
                onContextMenu={(event) => {
                  event.preventDefault();
                  handleCellAction(r, c, true);
                }}
              >
                {cellLabel(cell)}
              </button>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

export default Minesweeper;
