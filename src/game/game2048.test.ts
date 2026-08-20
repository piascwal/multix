import { describe, expect, it } from 'vitest';
import { Game2048Engine, GRID_SIZE, multiplierOf, tileLabel, type Grid2048, type Tile2048 } from './game2048';

function makeEngineWithGrid(table: number, grid: Grid2048): Game2048Engine {
  const engine = new Game2048Engine(table, () => 0);
  engine.grid = grid;
  return engine;
}

function emptyGrid(): Grid2048 {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
}

function tile(value: number, id = 1, showExpression = false): Tile2048 {
  return { id, value, isNew: false, mergedFrom: false, showExpression };
}

function valuesOf(grid: Grid2048): (number | null)[][] {
  return grid.map((row) => row.map((c) => c?.value ?? null));
}

describe('multiplierOf', () => {
  it('retourne le multiplicateur si la valeur est un multiple exact', () => {
    expect(multiplierOf(12, 4)).toBe(3);
    expect(multiplierOf(40, 4)).toBe(10);
  });

  it('retourne null si ce n\'est pas un multiple', () => {
    expect(multiplierOf(10, 4)).toBeNull();
    expect(multiplierOf(0, 4)).toBeNull();
  });
});

describe('tileLabel', () => {
  it('affiche l\'expression tant que la tuile n\'a pas fusionne et que k <= 10', () => {
    expect(tileLabel(tile(12, 1, true), 4)).toBe('4×3');
    expect(tileLabel(tile(40, 1, true), 4)).toBe('4×10');
  });

  it('affiche le nombre brut si la tuile a deja fusionne (showExpression=false)', () => {
    expect(tileLabel(tile(12, 1, false), 4)).toBe('12');
  });

  it('affiche le nombre brut au-dela de k=10, meme en showExpression', () => {
    expect(tileLabel(tile(44, 1, true), 4)).toBe('44');
  });
});

describe('Game2048Engine.move — fusion et compression', () => {
  it('compresse une ligne vers la gauche sans fusion possible', () => {
    const grid = emptyGrid();
    grid[0]![2] = tile(8, 1);
    grid[0]![3] = tile(4, 2);
    const engine = makeEngineWithGrid(4, grid);
    const result = engine.move('left');
    expect(valuesOf(result.grid)[0]).toEqual([8, 4, null, null]);
    expect(result.moved).toBe(true);
    expect(result.scoreGained).toBe(0);
  });

  it('fusionne deux tuiles egales adjacentes en une seule, doublee', () => {
    const grid = emptyGrid();
    grid[0]![0] = tile(4, 1);
    grid[0]![1] = tile(4, 2);
    const engine = makeEngineWithGrid(4, grid);
    const result = engine.move('left');
    expect(valuesOf(result.grid)[0]).toEqual([8, null, null, null]);
    expect(result.scoreGained).toBe(8);
    expect(engine.score).toBe(8);
  });

  it('ne fusionne pas trois tuiles egales d\'un coup (une seule paire par passage)', () => {
    const grid = emptyGrid();
    grid[0]![0] = tile(4, 1);
    grid[0]![1] = tile(4, 2);
    grid[0]![2] = tile(4, 3);
    const engine = makeEngineWithGrid(4, grid);
    const result = engine.move('left');
    expect(valuesOf(result.grid)[0]).toEqual([8, 4, null, null]);
  });

  it('ne signale pas de mouvement si rien ne bouge', () => {
    const grid = emptyGrid();
    grid[0]![0] = tile(4, 1);
    grid[0]![1] = tile(8, 2);
    const engine = makeEngineWithGrid(4, grid);
    const result = engine.move('left');
    expect(result.moved).toBe(false);
  });

  it('conserve showExpression sur une tuile deplacee sans fusion, le reinitialise sur une tuile fusionnee', () => {
    const grid = emptyGrid();
    grid[0]![2] = tile(4, 1, true); // pas encore fusionnee -> doit rester en expression
    grid[1]![0] = tile(4, 2, true);
    grid[1]![1] = tile(4, 3, true); // va fusionner avec la precedente -> devient un nombre
    const engine = makeEngineWithGrid(4, grid);
    const result = engine.move('left');
    expect(result.grid[0]![0]!.showExpression).toBe(true);
    expect(result.grid[1]![0]!.showExpression).toBe(false);
  });

  it('deplace correctement vers la droite, le bas et le haut', () => {
    const grid = emptyGrid();
    grid[0]![0] = tile(4, 1);

    const right = makeEngineWithGrid(4, grid).move('right');
    expect(valuesOf(right.grid)[0]).toEqual([null, null, null, 4]);

    const down = makeEngineWithGrid(4, grid).move('down');
    expect(valuesOf(down.grid).map((row) => row[0])).toEqual([null, null, null, 4]);

    const gridBottom = emptyGrid();
    gridBottom[3]![0] = tile(4, 1);
    const up = makeEngineWithGrid(4, gridBottom).move('up');
    expect(valuesOf(up.grid).map((row) => row[0])).toEqual([4, null, null, null]);
  });

  it('signale reachedTarget une seule fois, la premiere fois que table*10 est atteint', () => {
    const grid = emptyGrid();
    grid[0]![0] = tile(10, 1);
    grid[0]![1] = tile(10, 2);
    const engine = makeEngineWithGrid(2, grid); // table=2, cible = 2*10 = 20

    const first = engine.move('left');
    expect(first.reachedTarget).toBe(true);
    expect(valuesOf(first.grid)[0]).toEqual([20, null, null, null]);

    // atteindre a nouveau 20 (10+10) plus tard ne doit plus jamais redeclencher reachedTarget
    engine.grid[0]![1] = tile(10, 3);
    engine.grid[0]![2] = tile(10, 4);
    const second = engine.move('left');
    expect(second.reachedTarget).toBe(false);
  });

  it('signale reachedTarget meme si la fusion depasse directement la cible (ex: 32+32 -> 64, sans jamais passer par 40 pile)', () => {
    const grid = emptyGrid();
    grid[0]![0] = tile(32, 1);
    grid[0]![1] = tile(32, 2);
    const engine = makeEngineWithGrid(4, grid); // table=4, cible = 40

    const result = engine.move('left');
    expect(result.reachedTarget).toBe(true);
    expect(valuesOf(result.grid)[0]).toEqual([64, null, null, null]);
  });
});

describe('Game2048Engine.hasValidMoves', () => {
  it('true si une case est vide', () => {
    const engine = makeEngineWithGrid(4, emptyGrid());
    expect(engine.hasValidMoves()).toBe(true);
  });

  it('true si deux tuiles adjacentes egales existent, meme grille pleine', () => {
    const grid: Grid2048 = Array.from({ length: GRID_SIZE }, (_, r) =>
      Array.from({ length: GRID_SIZE }, (_, c) => tile(4 * (r * GRID_SIZE + c + 1), r * GRID_SIZE + c + 1))
    );
    grid[0]![0] = tile(8, 100);
    grid[0]![1] = tile(8, 101);
    const engine = makeEngineWithGrid(4, grid);
    expect(engine.hasValidMoves()).toBe(true);
  });

  it('false si la grille est pleine et sans paire adjacente (damier)', () => {
    let id = 1;
    const grid = emptyGrid();
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        grid[r]![c] = tile(4 * (((r + c) % 2) + 1), id++);
      }
    }
    const engine = makeEngineWithGrid(4, grid);
    expect(engine.hasValidMoves()).toBe(false);
  });
});

describe('Game2048Engine.spawnTile', () => {
  it('place une tuile multiple de la table sur une case vide', () => {
    const engine = new Game2048Engine(4, () => 0.5);
    const spawned = engine.spawnTile();
    expect(spawned).toBe(true);
    const values = engine.grid.flat().filter((c) => c !== null);
    expect(values).toHaveLength(1);
    expect(values[0]!.value % 4).toBe(0);
    expect(values[0]!.isNew).toBe(true);
    expect(values[0]!.showExpression).toBe(true);
  });

  it('retourne false si la grille est pleine', () => {
    let id = 1;
    const grid: Grid2048 = Array.from({ length: GRID_SIZE }, () => Array.from({ length: GRID_SIZE }, () => tile(4, id++)));
    const engine = makeEngineWithGrid(4, grid);
    expect(engine.spawnTile()).toBe(false);
  });
});
