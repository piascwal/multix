import { useMemo, useState } from 'preact/hooks';
import { tableDifficultyInfo } from '../game/difficulty';
import { getLeaderboardKey, loadLeaderboard } from '../game/leaderboard';
import type { GameMode, LeaderboardScope } from '../game/types';
import { LeaderboardTable } from './LeaderboardTable';

interface LeaderboardMenuScreenProps {
  initialScope: LeaderboardScope;
  onBack: () => void;
}

export function LeaderboardMenuScreen({ initialScope, onBack }: LeaderboardMenuScreenProps) {
  const [scope, setScope] = useState<LeaderboardScope>(initialScope);
  const [mode, setMode] = useState<GameMode>('classic');

  const entries = useMemo(() => loadLeaderboard(getLeaderboardKey(mode, scope)), [mode, scope]);

  return (
    <section class="screen active">
      <h1 class="neon-title" style={{ fontSize: 'clamp(24px,6vw,38px)' }}>
        🏆 CLASSEMENT
      </h1>
      <div class="panel">
        <div class="section-label">
          <span class="dot" />
          Table à consulter
        </div>
        <select
          class="theme-select"
          value={String(scope)}
          onChange={(e) => {
            const v = (e.target as HTMLSelectElement).value;
            setScope(v === 'general' ? 'general' : parseInt(v, 10));
          }}
        >
          <option value="general">🌈 Général (toutes tables mélangées)</option>
          {Array.from({ length: 11 }, (_, i) => i + 2).map((t) => {
            const diff = tableDifficultyInfo(t);
            return (
              <option key={t} value={t}>
                Table de {t} — {diff.label}
              </option>
            );
          })}
        </select>
      </div>
      <div class="panel">
        <div class="lb-tabs">
          <button type="button" class={`lb-tab${mode === 'classic' ? ' active' : ''}`} onClick={() => setMode('classic')}>
            ⏱️ Classique
          </button>
          <button
            type="button"
            class={`lb-tab${mode === 'timeattack' ? ' active' : ''}`}
            onClick={() => setMode('timeattack')}
          >
            🔥 Time Attack
          </button>
        </div>
        <LeaderboardTable entries={entries} />
      </div>
      <button type="button" class="btn-secondary" style={{ width: '100%' }} onClick={onBack}>
        ⬅ Retour au menu
      </button>
    </section>
  );
}
