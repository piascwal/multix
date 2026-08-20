import { describe, expect, it } from 'vitest';
import { comboMultiplier, computeAnswerPoints, timeAttackBonusMs } from './scoring';

describe('comboMultiplier', () => {
  it('paliers de multiplicateur par streak', () => {
    expect(comboMultiplier(0)).toBe(1);
    expect(comboMultiplier(2)).toBe(1);
    expect(comboMultiplier(3)).toBe(2);
    expect(comboMultiplier(4)).toBe(2);
    expect(comboMultiplier(5)).toBe(3);
    expect(comboMultiplier(9)).toBe(3);
    expect(comboMultiplier(10)).toBe(5);
    expect(comboMultiplier(42)).toBe(5);
  });
});

describe('computeAnswerPoints', () => {
  it('cas de base : pas de combo, pas de bonus vitesse', () => {
    const points = computeAnswerPoints({
      comboAfter: 1,
      responseTimeMs: 5000,
      difficultyMult: 1,
      diversityMultiplier: 1,
    });
    expect(points).toBe(10);
  });

  it('ajoute le bonus de vitesse sous 3000ms', () => {
    const points = computeAnswerPoints({
      comboAfter: 1,
      responseTimeMs: 2000,
      difficultyMult: 1,
      diversityMultiplier: 1,
    });
    expect(points).toBe(15);
  });

  it('applique combo x difficulté x diversité et arrondit', () => {
    // (10+5) * combo x3 * difficulté 1.5 * diversité 1.3 = 87.75 -> 88
    const points = computeAnswerPoints({
      comboAfter: 5,
      responseTimeMs: 1000,
      difficultyMult: 1.5,
      diversityMultiplier: 1.3,
    });
    expect(points).toBe(88);
  });
});

describe('timeAttackBonusMs', () => {
  it('bonus de 2000ms si réponse rapide (<=4000ms)', () => {
    expect(timeAttackBonusMs(4000)).toBe(2000);
    expect(timeAttackBonusMs(500)).toBe(2000);
  });

  it('bonus de 1000ms sinon', () => {
    expect(timeAttackBonusMs(4001)).toBe(1000);
  });
});
