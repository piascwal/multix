export type DuelPlayer = 1 | 2;

/** Premier à atteindre ce score gagne le duel. */
export const DUEL_TARGET_SCORE = 10;

export interface DuelScores {
  player1: number;
  player2: number;
}

/** Retourne le joueur gagnant si le score cible est atteint, sinon null. */
export function checkDuelWinner(scores: DuelScores): DuelPlayer | null {
  if (scores.player1 >= DUEL_TARGET_SCORE) return 1;
  if (scores.player2 >= DUEL_TARGET_SCORE) return 2;
  return null;
}

export interface DuelResult {
  winner: DuelPlayer;
  scoreP1: number;
  scoreP2: number;
  player1Name: string;
  player2Name: string;
}
