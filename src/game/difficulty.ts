import type { DifficultyInfo } from './types';

export const EASY_TABLES = [2, 5, 10];
export const HARD_TABLES = [7, 8, 9, 12];
// tables medium = tout le reste (3,4,6,11)

export function tableDifficultyInfo(table: number): DifficultyInfo {
  if (EASY_TABLES.includes(table)) return { tier: 'easy', label: 'Facile', mult: 1 };
  if (HARD_TABLES.includes(table)) return { tier: 'hard', label: 'Difficile', mult: 1.5 };
  return { tier: 'medium', label: 'Moyen', mult: 1.2 };
}

export function diversityMultiplierFor(count: number): number {
  if (count <= 1) return 1;
  if (count <= 3) return 1.15;
  if (count <= 6) return 1.3;
  return 1.5;
}
