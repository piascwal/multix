import type { Question } from './types';
import { rand, shuffle, type Rng } from './random';

/** Toutes les questions uniques possibles pour les tables sélectionnées : chaque table x 1 à 10. */
export function buildQuestionPool(tables: readonly number[], rng: Rng = Math.random): Question[] {
  const pool: Question[] = [];
  tables.forEach((table) => {
    for (let multiplier = 1; multiplier <= 10; multiplier++) {
      pool.push({ table, multiplier });
    }
  });
  return shuffle(pool, rng);
}

function questionKey(q: Question): string {
  return `${q.table}x${q.multiplier}`;
}

/**
 * Distribue les questions d'un pool sans répétition, en repuisant un nouveau
 * pool mélangé une fois épuisé — en évitant, quand c'est possible, de reposer
 * immédiatement la toute dernière question tirée.
 */
export class QuestionSupplier {
  private pool: Question[] = [];
  private lastKey: string | null = null;
  private readonly rng: Rng;

  constructor(
    private tables: readonly number[],
    rng: Rng = Math.random
  ) {
    this.rng = rng;
    this.pool = buildQuestionPool(tables, rng);
  }

  reset(tables: readonly number[]): void {
    this.tables = tables;
    this.pool = buildQuestionPool(tables, this.rng);
    this.lastKey = null;
  }

  next(): Question {
    if (this.pool.length === 0) {
      this.pool = buildQuestionPool(this.tables, this.rng);
      if (this.lastKey && this.pool.length > 1) {
        const top = this.pool[this.pool.length - 1]!;
        if (questionKey(top) === this.lastKey) {
          const tmp = this.pool[this.pool.length - 1]!;
          this.pool[this.pool.length - 1] = this.pool[0]!;
          this.pool[0] = tmp;
        }
      }
    }
    const question = this.pool.pop();
    if (!question) throw new Error('QuestionSupplier: pool vide après reconstruction');
    this.lastKey = questionKey(question);
    return question;
  }
}

export function generateDistractors(
  table: number,
  multiplier: number,
  correct: number,
  rng: Rng = Math.random
): number[] {
  const candidates = new Set<number>();
  const tries = [
    table * (multiplier + 1),
    table * (multiplier - 1),
    (table + 1) * multiplier,
    (table - 1) * multiplier,
    correct + table,
    correct - table,
    correct + multiplier,
    correct - multiplier,
    correct + rand(1, 5, rng),
    correct - rand(1, 5, rng),
    correct + 10,
    correct - 10,
  ];

  // transposition des chiffres (ex: 42 -> 24) si à 2 chiffres
  if (correct >= 10 && correct < 100) {
    const s = String(correct);
    const swapped = parseInt(s[1]! + s[0]!, 10);
    if (swapped !== 0) tries.push(swapped);
  }

  shuffle(tries, rng);
  for (const v of tries) {
    if (v > 0 && v !== correct && !candidates.has(v)) {
      candidates.add(v);
    }
    if (candidates.size >= 3) break;
  }

  // filet de sécurité si pas assez de distracteurs uniques générés
  while (candidates.size < 3) {
    const v = correct + rand(-15, 15, rng);
    if (v > 0 && v !== correct) candidates.add(v);
  }

  return Array.from(candidates).slice(0, 3);
}
