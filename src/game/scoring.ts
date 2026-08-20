export function comboMultiplier(streak: number): number {
  if (streak >= 10) return 5;
  if (streak >= 5) return 3;
  if (streak >= 3) return 2;
  return 1;
}

export interface AnswerPointsInput {
  /** Combo courant APRES incrémentation (bonne réponse). */
  comboAfter: number;
  responseTimeMs: number;
  difficultyMult: number;
  diversityMultiplier: number;
}

export function computeAnswerPoints({
  comboAfter,
  responseTimeMs,
  difficultyMult,
  diversityMultiplier,
}: AnswerPointsInput): number {
  const mult = comboMultiplier(comboAfter);
  const speedBonus = responseTimeMs <= 3000 ? 5 : 0;
  return Math.round((10 + speedBonus) * mult * difficultyMult * diversityMultiplier);
}

export function timeAttackBonusMs(responseTimeMs: number): number {
  return responseTimeMs <= 4000 ? 2000 : 1000;
}
