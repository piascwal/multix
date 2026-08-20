import { describe, expect, it } from 'vitest';
import { checkDuelWinner, DUEL_TARGET_SCORE } from './duel';

describe('checkDuelWinner', () => {
  it('pas de gagnant tant que personne n\'atteint le score cible', () => {
    expect(checkDuelWinner({ player1: DUEL_TARGET_SCORE - 1, player2: DUEL_TARGET_SCORE - 1 })).toBeNull();
  });

  it('joueur 1 gagne en premier s\'il atteint le score cible', () => {
    expect(checkDuelWinner({ player1: DUEL_TARGET_SCORE, player2: 3 })).toBe(1);
  });

  it('joueur 2 gagne en premier s\'il atteint le score cible', () => {
    expect(checkDuelWinner({ player1: 4, player2: DUEL_TARGET_SCORE })).toBe(2);
  });

  it('joueur 1 prime si les deux ont atteint le score en meme temps (etat impossible en jeu mais deterministe)', () => {
    expect(checkDuelWinner({ player1: DUEL_TARGET_SCORE, player2: DUEL_TARGET_SCORE })).toBe(1);
  });
});
