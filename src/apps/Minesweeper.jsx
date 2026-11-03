import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  createEmptyBoard,
  placeMines,
  revealCell,
  toggleFlag,
  checkWin,
  revealAllMines,
  countFlags,
  MINE_COUNT,
} from './minesweeperLogic';

function newGameState() {
  return {
    board: createEmptyBoard(),
    started: false,
    status: 'playing',
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
  const [game, setGame] = useState(newGameState);
  const [flagMode, setFlagMode] = useState(false);

  const handleRestart = () => setGame(newGameState());

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
    if (!game.started) {
      board = placeMines(board, row, col, MINE_COUNT);
    }

    if (board[row][col].mine) {
      setGame({ board: revealAllMines(board), started: true, status: 'lost' });
      return;
    }

    const revealed = revealCell(board, row, col);
    setGame({ board: revealed, started: true, status: checkWin(revealed) ? 'won' : 'playing' });
  };

  const minesLeft = MINE_COUNT - countFlags(game.board);

  return (
    <section className="section minesweeper">
      <h2>{strings.title}</h2>
      <div className="minesweeper__toolbar">
        <span className="minesweeper__counter" data-testid="mines-left">
          {strings.minesLabel}: {minesLeft}
        </span>
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
