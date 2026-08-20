import { useEffect, useRef, useState } from 'preact/hooks';
import {
  Game2048Engine,
  GRID_SIZE,
  multiplierOf,
  tileLabel,
  type Direction2048,
  type Grid2048,
} from '../game/game2048';
import type { Mode2048Result } from '../game/types';

const GAME_DURATION_MS = 7 * 60 * 1000;

interface Mode2048GameProps {
  table: number;
  effects: { showToast: (text: string) => void };
  onGameEnd: (result: Mode2048Result) => void;
}

function cloneGrid(grid: Grid2048): Grid2048 {
  return grid.map((row) => [...row]);
}

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function tileTier(value: number, table: number): string {
  const k = multiplierOf(value, table);
  if (k === null) return 'overflow';
  if (k >= 10) return 'target';
  if (k >= 7) return 'hard';
  if (k >= 4) return 'medium';
  return 'easy';
}

const KEY_DIRECTIONS: Record<string, Direction2048> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  W: 'up',
  s: 'down',
  S: 'down',
  a: 'left',
  A: 'left',
  d: 'right',
  D: 'right',
};

export function Mode2048Game({ table, effects, onGameEnd }: Mode2048GameProps) {
  const engineRef = useRef<Game2048Engine | null>(null);
  function getEngine(): Game2048Engine {
    if (!engineRef.current) engineRef.current = new Game2048Engine(table);
    return engineRef.current;
  }

  const endedRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const [grid, setGrid] = useState<Grid2048>(() => getEngine().grid);
  const [score, setScore] = useState(0);
  const [timeLeftMs, setTimeLeftMs] = useState(GAME_DURATION_MS);
  const [tableMastered, setTableMastered] = useState(false);

  function endGame(reason: 'time' | 'blocked'): void {
    if (endedRef.current) return;
    endedRef.current = true;
    const engine = getEngine();
    const bestTileValue = engine.grid.flat().reduce((max, cell) => (cell ? Math.max(max, cell.value) : max), 0);
    onGameEnd({ table, score: engine.score, bestTileValue, tableMastered: engine.hasWon, endReason: reason });
  }

  function handleMove(direction: Direction2048): void {
    if (endedRef.current) return;
    const engine = getEngine();
    const result = engine.move(direction);
    if (!result.moved) return;

    if (result.reachedTarget) {
      setTableMastered(true);
      effects.showToast('🏆 Table maîtrisée !');
    }

    engine.spawnTile();
    setGrid(cloneGrid(engine.grid));
    setScore(engine.score);

    if (!engine.hasValidMoves()) {
      endGame('blocked');
    }
  }

  // Deux tuiles de depart, comme le 2048 classique.
  useEffect(() => {
    const engine = getEngine();
    engine.spawnTile();
    engine.spawnTile();
    setGrid(cloneGrid(engine.grid));
  }, []);

  // Chrono (7 minutes), tick chaque seconde.
  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeftMs((t) => Math.max(0, t - 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (timeLeftMs <= 0) endGame('time');
  }, [timeLeftMs]);

  // Clavier (flèches / WASD).
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent): void {
      const dir = KEY_DIRECTIONS[e.key];
      if (!dir) return;
      e.preventDefault();
      handleMove(dir);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  function onTouchStart(e: TouchEvent): void {
    const t = e.touches[0];
    if (!t) return;
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  }

  function onTouchEnd(e: TouchEvent): void {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const THRESHOLD = 24;
    if (Math.max(absX, absY) < THRESHOLD) return;
    if (absX > absY) handleMove(dx > 0 ? 'right' : 'left');
    else handleMove(dy > 0 ? 'down' : 'up');
  }

  const ratio = Math.max(0, timeLeftMs / GAME_DURATION_MS);

  return (
    <section class="screen active">
      <div class="hud">
        <div class="hud-box">
          <div class="hud-label">Temps</div>
          <div class={`hud-value g2048-timer${timeLeftMs <= 30000 ? ' danger' : ''}`}>{formatTime(timeLeftMs)}</div>
        </div>
        <div class="hud-box">
          <div class="hud-label">Score</div>
          <div class="hud-value" style={{ color: 'var(--cyan)' }}>
            {score}
          </div>
        </div>
        <div class="hud-box">
          <div class="hud-label">Table</div>
          <div class="hud-value" style={{ color: 'var(--gold)' }}>
            ×{table}
            {tableMastered ? ' 🏆' : ''}
          </div>
        </div>
      </div>

      <div class="timer-bar-track">
        <div
          class="timer-bar-fill"
          style={{
            width: `${ratio * 100}%`,
            background: timeLeftMs <= 30000 ? 'linear-gradient(90deg,#ff3b5c,#ff9d2e)' : undefined,
          }}
        />
      </div>

      <div class="g2048-board" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => (
          <div class="g2048-cell-bg" key={`bg-${i}`} />
        ))}
        {grid.flatMap((row, r) =>
          row.map((cellTile, c) =>
            cellTile ? (
              <div
                key={cellTile.id}
                class={`g2048-tile g2048-tile--${tileTier(cellTile.value, table)}${cellTile.isNew ? ' is-new' : ''}${cellTile.mergedFrom ? ' is-merged' : ''}`}
                style={{ gridRow: `${r + 1}`, gridColumn: `${c + 1}` }}
              >
                {tileLabel(cellTile, table)}
              </div>
            ) : null
          )
        )}
      </div>

      <div class="selection-info" style={{ marginTop: '14px', textAlign: 'center' }}>
        ⌨️ Flèches / WASD · 📱 Glisse pour déplacer les tuiles
      </div>
    </section>
  );
}
