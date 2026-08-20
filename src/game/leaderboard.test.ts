import { beforeEach, describe, expect, it } from 'vitest';
import { commitScoreToLeaderboard, getLeaderboardKey, loadLeaderboard, peekPreviousBest } from './leaderboard';

beforeEach(() => {
  localStorage.clear();
});

describe('getLeaderboardKey', () => {
  it('clé générale par mode', () => {
    expect(getLeaderboardKey('classic', 'general')).toBe('multifusion_lb_classic');
    expect(getLeaderboardKey('timeattack', 'general')).toBe('multifusion_lb_timeattack');
  });

  it('clé dédiée à une table en mode focus', () => {
    expect(getLeaderboardKey('classic', 7)).toBe('multifusion_lb_table7_classic');
    expect(getLeaderboardKey('timeattack', 7)).toBe('multifusion_lb_table7_timeattack');
  });
});

describe('commitScoreToLeaderboard / loadLeaderboard', () => {
  it('enregistre puis relit un score', () => {
    const key = getLeaderboardKey('classic', 'general');
    commitScoreToLeaderboard(key, { name: 'Alice', score: 120, combo: 8 });
    const board = loadLeaderboard(key);
    expect(board).toHaveLength(1);
    expect(board[0]).toMatchObject({ name: 'Alice', score: 120, combo: 8 });
  });

  it('trie par score décroissant', () => {
    const key = getLeaderboardKey('classic', 'general');
    commitScoreToLeaderboard(key, { name: 'Bob', score: 50, combo: 3 });
    commitScoreToLeaderboard(key, { name: 'Alice', score: 120, combo: 8 });
    const board = loadLeaderboard(key);
    expect(board.map((e) => e.name)).toEqual(['Alice', 'Bob']);
  });

  it('tronque à 100 entrées', () => {
    const key = getLeaderboardKey('classic', 'general');
    for (let i = 0; i < 105; i++) {
      commitScoreToLeaderboard(key, { name: `J${i}`, score: i, combo: 0 });
    }
    expect(loadLeaderboard(key)).toHaveLength(100);
  });

  it('retourne un tableau vide si rien en localStorage', () => {
    expect(loadLeaderboard('inexistant')).toEqual([]);
  });
});

describe('peekPreviousBest', () => {
  it('0 si aucun score enregistré', () => {
    expect(peekPreviousBest('inexistant')).toBe(0);
  });

  it('meilleur score existant sinon', () => {
    const key = getLeaderboardKey('classic', 'general');
    commitScoreToLeaderboard(key, { name: 'Alice', score: 120, combo: 8 });
    expect(peekPreviousBest(key)).toBe(120);
  });
});
