import type { Badge, GameMode, PerTableStats } from './types';
import { HARD_TABLES } from './difficulty';

export interface BadgesInput {
  perTableStats: PerTableStats;
  maxCombo: number;
  gameMode: GameMode;
  elapsedRealMs: number;
  errors: number;
  questionsTotal: number;
  questionsCorrect: number;
  responseTimes: number[];
  selectedTables: readonly number[];
}

export function computeBadges(input: BadgesInput): Badge[] {
  const badges: Badge[] = [];

  // Maître d'une table (score parfait, au moins 5 questions posées sur cette table)
  Object.entries(input.perTableStats).forEach(([table, s]) => {
    if (s.total >= 5 && s.correct === s.total) {
      badges.push({ icon: '👑', name: `Maître de la table de ${table}`, desc: 'Sans faute sur cette table' });
    }
  });

  if (input.maxCombo >= 15) {
    badges.push({ icon: '⚡', name: 'Inarrêtable', desc: 'Combo de 15 bonnes réponses' });
  }

  if (input.gameMode === 'timeattack' && input.elapsedRealMs >= 120000) {
    badges.push({ icon: '🛡️', name: 'Survivant', desc: '2 minutes en Time Attack' });
  }

  if (input.errors === 0 && input.questionsTotal >= 10) {
    badges.push({ icon: '💎', name: 'Sans Faute', desc: 'Aucune erreur sur la partie' });
  }

  const avgTime = input.responseTimes.length
    ? input.responseTimes.reduce((a, b) => a + b, 0) / input.responseTimes.length
    : 99999;
  if (avgTime < 1500 && input.questionsTotal >= 8) {
    badges.push({ icon: '🌩️', name: 'Éclair', desc: 'Temps de réponse moyen record' });
  }

  // Valorise le fait de jouer avec beaucoup de tables à la fois
  if (input.selectedTables.length >= 8) {
    badges.push({ icon: '🌍', name: 'Explorateur', desc: '8 tables ou plus dans la même partie' });
  }

  // Valorise le choix des tables difficiles (7, 8, 9, 12)
  const hardCount = input.selectedTables.filter((t) => HARD_TABLES.includes(t)).length;
  if (hardCount >= 3 && input.questionsTotal >= 10 && input.questionsCorrect / input.questionsTotal >= 0.7) {
    badges.push({ icon: '🦁', name: 'Chasseur de Défi', desc: 'Réussite sur au moins 3 tables difficiles' });
  }

  return badges;
}

export const NEW_RECORD_BADGE: Badge = {
  icon: '🏆',
  name: 'Nouveau Record Personnel !',
  desc: 'Meilleur score jamais atteint',
};
