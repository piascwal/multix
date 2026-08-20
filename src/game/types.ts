export type DifficultyTier = 'easy' | 'medium' | 'hard';

export interface DifficultyInfo {
  tier: DifficultyTier;
  label: string;
  mult: number;
}

export type AnswerMode = 'qcm' | 'keyboard';
export type GameMode = 'classic' | 'timeattack';

export interface Question {
  table: number;
  multiplier: number;
}

export interface TableStat {
  correct: number;
  total: number;
}

export type PerTableStats = Record<number, TableStat>;

export interface Badge {
  icon: string;
  name: string;
  desc: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  combo: number;
  date: string;
}

/** 'general' = toutes tables mélangées, ou un numéro de table en mode focus. */
export type LeaderboardScope = 'general' | number;

export interface GameResult {
  score: number;
  maxCombo: number;
  questionsCorrect: number;
  questionsTotal: number;
  badges: Badge[];
  isNewRecord: boolean;
  gameMode: GameMode;
  boardScope: LeaderboardScope;
}

export interface Mode2048Result {
  table: number;
  score: number;
  bestTileValue: number;
  tableMastered: boolean;
  endReason: 'time' | 'blocked';
}
