import { describe, expect, it } from 'vitest';
import { diversityMultiplierFor, EASY_TABLES, HARD_TABLES, tableDifficultyInfo } from './difficulty';

describe('tableDifficultyInfo', () => {
  it.each(EASY_TABLES)('table %i est facile (x1)', (t) => {
    expect(tableDifficultyInfo(t)).toEqual({ tier: 'easy', label: 'Facile', mult: 1 });
  });

  it.each(HARD_TABLES)('table %i est difficile (x1.5)', (t) => {
    expect(tableDifficultyInfo(t)).toEqual({ tier: 'hard', label: 'Difficile', mult: 1.5 });
  });

  it.each([3, 4, 6, 11])('table %i est moyenne (x1.2)', (t) => {
    expect(tableDifficultyInfo(t)).toEqual({ tier: 'medium', label: 'Moyen', mult: 1.2 });
  });
});

describe('diversityMultiplierFor', () => {
  it('reste à x1 pour 0 ou 1 table', () => {
    expect(diversityMultiplierFor(0)).toBe(1);
    expect(diversityMultiplierFor(1)).toBe(1);
  });

  it('paliers croissants avec le nombre de tables', () => {
    expect(diversityMultiplierFor(2)).toBe(1.15);
    expect(diversityMultiplierFor(3)).toBe(1.15);
    expect(diversityMultiplierFor(4)).toBe(1.3);
    expect(diversityMultiplierFor(6)).toBe(1.3);
    expect(diversityMultiplierFor(7)).toBe(1.5);
    expect(diversityMultiplierFor(11)).toBe(1.5);
  });
});
