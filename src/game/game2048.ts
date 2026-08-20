import type { Rng } from './random';

export const GRID_SIZE = 4;
export const TARGET_MULTIPLIER = 10;

export type Direction2048 = 'up' | 'down' | 'left' | 'right';

export interface Tile2048 {
  id: number;
  value: number;
  /** Vient d'apparaître ce tour-ci (anime le pop-in, un seul rendu). */
  isNew: boolean;
  /** Résulte d'une fusion ce tour-ci (anime le pulse, un seul rendu). */
  mergedFrom: boolean;
  /** Affichage "table×k" tant que la tuile n'a pas encore fusionné. */
  showExpression: boolean;
}

export type Cell2048 = Tile2048 | null;
export type Grid2048 = Cell2048[][];

export interface MoveResult {
  grid: Grid2048;
  moved: boolean;
  scoreGained: number;
  /** true si une tuile table×10 apparaît pour la toute première fois de la partie. */
  reachedTarget: boolean;
}

/** Multiplicateur (1..10+) si `value` est un multiple entier de `table`, sinon null. */
export function multiplierOf(value: number, table: number): number | null {
  if (value <= 0 || value % table !== 0) return null;
  return value / table;
}

/** "table×k" tant que la tuile n'a pas fusionné et que k est dans la plage révisée, sinon le nombre brut. */
export function tileLabel(tile: Tile2048, table: number): string {
  const k = multiplierOf(tile.value, table);
  if (tile.showExpression && k !== null && k <= TARGET_MULTIPLIER) {
    return `${table}×${k}`;
  }
  return String(tile.value);
}

function emptyGrid(): Grid2048 {
  return Array.from({ length: GRID_SIZE }, () => Array<Cell2048>(GRID_SIZE).fill(null));
}

function reverseRows(grid: Grid2048): Grid2048 {
  return grid.map((row) => [...row].reverse());
}

function transpose(grid: Grid2048): Grid2048 {
  const result = emptyGrid();
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      result[c]![r] = grid[r]![c]!;
    }
  }
  return result;
}

const DIRECTION_TRANSFORMS: Record<Direction2048, { to: (g: Grid2048) => Grid2048; from: (g: Grid2048) => Grid2048 }> = {
  left: { to: (g) => g, from: (g) => g },
  right: { to: reverseRows, from: reverseRows },
  up: { to: transpose, from: transpose },
  down: { to: (g) => reverseRows(transpose(g)), from: (g) => transpose(reverseRows(g)) },
};

/** Bonus de multiplicateurs bas, mais tous representes sur une partie complete. */
const SPAWN_WEIGHTS = [5, 5, 4, 4, 3, 3, 2, 2, 1, 1];

export class Game2048Engine {
  grid: Grid2048 = emptyGrid();
  score = 0;
  /** true des qu'une tuile table*10 a ete atteinte une fois (objectif "table maitrisee"). */
  hasWon = false;
  private nextId = 1;
  private readonly rng: Rng;

  constructor(
    readonly table: number,
    rng: Rng = Math.random
  ) {
    this.rng = rng;
  }

  private makeTile(value: number, isNew: boolean, mergedFrom: boolean, showExpression: boolean): Tile2048 {
    return { id: this.nextId++, value, isNew, mergedFrom, showExpression };
  }

  private pickSpawnMultiplier(): number {
    const total = SPAWN_WEIGHTS.reduce((a, b) => a + b, 0);
    let r = this.rng() * total;
    for (let k = 1; k <= SPAWN_WEIGHTS.length; k++) {
      r -= SPAWN_WEIGHTS[k - 1]!;
      if (r <= 0) return k;
    }
    return 1;
  }

  /** Place une nouvelle tuile sur une case vide au hasard. Retourne false si la grille est pleine. */
  spawnTile(): boolean {
    const emptyCells: Array<[number, number]> = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!this.grid[r]![c]) emptyCells.push([r, c]);
      }
    }
    if (emptyCells.length === 0) return false;
    const [r, c] = emptyCells[Math.floor(this.rng() * emptyCells.length)]!;
    const k = this.pickSpawnMultiplier();
    this.grid[r]![c] = this.makeTile(this.table * k, true, false, true);
    return true;
  }

  /** Existe-t-il encore un coup possible (case vide ou deux tuiles adjacentes egales) ? */
  hasValidMoves(): boolean {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const tile = this.grid[r]![c];
        if (!tile) return true;
        if (c < GRID_SIZE - 1 && this.grid[r]![c + 1]?.value === tile.value) return true;
        if (r < GRID_SIZE - 1 && this.grid[r + 1]![c]?.value === tile.value) return true;
      }
    }
    return false;
  }

  private compressAndMergeLine(line: Cell2048[]): { line: Cell2048[]; scoreGained: number; reachedTarget: boolean } {
    const targetValue = this.table * TARGET_MULTIPLIER;
    const tiles = line.filter((c): c is Tile2048 => c !== null);
    const result: Cell2048[] = [];
    let scoreGained = 0;
    let reachedTarget = false;

    let i = 0;
    while (i < tiles.length) {
      const current = tiles[i]!;
      const next = tiles[i + 1];
      if (next && next.value === current.value) {
        const newValue = current.value * 2;
        result.push(this.makeTile(newValue, false, true, false));
        scoreGained += newValue;
        if (newValue >= targetValue && !this.hasWon) {
          reachedTarget = true;
          this.hasWon = true;
        }
        i += 2;
      } else {
        result.push({ ...current, isNew: false, mergedFrom: false });
        i += 1;
      }
    }
    while (result.length < GRID_SIZE) result.push(null);
    return { line: result, scoreGained, reachedTarget };
  }

  move(direction: Direction2048): MoveResult {
    const { to, from } = DIRECTION_TRANSFORMS[direction];
    const working = to(this.grid);

    let scoreGained = 0;
    let reachedTarget = false;
    const mergedRows: Cell2048[][] = working.map((row) => {
      const { line, scoreGained: gained, reachedTarget: reached } = this.compressAndMergeLine(row);
      scoreGained += gained;
      if (reached) reachedTarget = true;
      return line;
    });

    const moved = mergedRows.some((row, r) =>
      row.some((cell, c) => (cell?.id ?? null) !== (working[r]![c]?.id ?? null) || (cell?.value ?? null) !== (working[r]![c]?.value ?? null))
    );

    const newGrid = from(mergedRows);
    this.grid = newGrid;
    this.score += scoreGained;
    return { grid: newGrid, moved, scoreGained, reachedTarget };
  }
}
