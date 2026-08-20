import { describe, expect, it } from 'vitest';
import { buildQuestionPool, generateDistractors, QuestionSupplier } from './questions';

describe('buildQuestionPool', () => {
  it('génère 10 questions par table sélectionnée (multiplicateurs 1 à 10)', () => {
    const pool = buildQuestionPool([3, 7]);
    expect(pool).toHaveLength(20);
    for (const table of [3, 7]) {
      const multipliers = pool.filter((q) => q.table === table).map((q) => q.multiplier).sort((a, b) => a - b);
      expect(multipliers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    }
  });
});

describe('QuestionSupplier', () => {
  it('distribue toutes les questions du pool sans répétition avant de repuiser', () => {
    const supplier = new QuestionSupplier([4]);
    const seen = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const q = supplier.next();
      const key = `${q.table}x${q.multiplier}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
    expect(seen.size).toBe(10);
  });

  it('repuise un nouveau pool une fois épuisé et continue à fournir des questions valides', () => {
    const supplier = new QuestionSupplier([2]);
    for (let i = 0; i < 25; i++) {
      const q = supplier.next();
      expect(q.table).toBe(2);
      expect(q.multiplier).toBeGreaterThanOrEqual(1);
      expect(q.multiplier).toBeLessThanOrEqual(10);
    }
  });
});

describe('generateDistractors', () => {
  it('retourne 3 distracteurs positifs et différents de la bonne réponse', () => {
    const distractors = generateDistractors(7, 8, 56);
    expect(distractors).toHaveLength(3);
    const unique = new Set(distractors);
    expect(unique.size).toBe(3);
    for (const d of distractors) {
      expect(d).toBeGreaterThan(0);
      expect(d).not.toBe(56);
    }
  });

  it('reste correct même pour de petits produits (bornes basses)', () => {
    const distractors = generateDistractors(2, 1, 2);
    expect(distractors).toHaveLength(3);
    for (const d of distractors) {
      expect(d).toBeGreaterThan(0);
      expect(d).not.toBe(2);
    }
  });
});
