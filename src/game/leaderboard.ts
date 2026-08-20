import type { GameMode, LeaderboardEntry, LeaderboardScope } from './types';

export function getLeaderboardKey(mode: GameMode, scope: LeaderboardScope): string {
  if (scope === 'general') {
    return mode === 'classic' ? 'multifusion_lb_classic' : 'multifusion_lb_timeattack';
  }
  return mode === 'classic' ? `multifusion_lb_table${scope}_classic` : `multifusion_lb_table${scope}_timeattack`;
}

export function loadLeaderboard(key: string): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as LeaderboardEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveLeaderboard(key: string, entries: LeaderboardEntry[]): void {
  localStorage.setItem(key, JSON.stringify(entries));
}

export function peekPreviousBest(key: string): number {
  const board = loadLeaderboard(key);
  return board.length ? board[0]!.score : 0;
}

export interface NewScore {
  name: string;
  score: number;
  combo: number;
}

/** Enregistre un score, trie par score décroissant et tronque à 100 entrées. */
export function commitScoreToLeaderboard(key: string, newScore: NewScore): LeaderboardEntry {
  const board = loadLeaderboard(key);
  const entry: LeaderboardEntry = {
    id: 'e' + Date.now() + '_' + Math.floor(Math.random() * 10000),
    name: newScore.name,
    score: newScore.score,
    combo: newScore.combo,
    date: new Date().toLocaleDateString('fr-FR'),
  };
  board.push(entry);
  board.sort((a, b) => b.score - a.score);
  saveLeaderboard(key, board.slice(0, 100));
  return entry;
}
