import { useState } from 'preact/hooks';
import { diversityMultiplierFor, tableDifficultyInfo } from '../game/difficulty';
import type { AnswerMode, GameMode } from '../game/types';
import { TablesGrid } from './TablesGrid';
import { ToggleGroup, type ToggleOption } from './ToggleGroup';

const ANSWER_MODE_OPTIONS: readonly ToggleOption<AnswerMode>[] = [
  { value: 'qcm', icon: '🎯', label: 'QCM', hint: '4 choix rapides', modeClass: 'mode-qcm' },
  { value: 'keyboard', icon: '⌨️', label: 'Clavier', hint: 'Tape le résultat', modeClass: 'mode-keyboard' },
];

const GAME_MODE_OPTIONS: readonly ToggleOption<GameMode>[] = [
  { value: 'classic', icon: '⏱️', label: 'Classique', hint: '60 sec chrono', modeClass: 'mode-classic' },
  { value: 'timeattack', icon: '🔥', label: 'Time Attack', hint: 'Survie: 30s +/-', modeClass: 'mode-timeattack' },
];

const ALL_TABLES_COUNT = 11;

interface HomeProps {
  tables: ReadonlySet<number>;
  onToggleTable: (table: number) => void;
  onSelectAll: (allSelected: boolean) => void;
  answerMode: AnswerMode;
  onAnswerModeChange: (mode: AnswerMode) => void;
  gameMode: GameMode;
  onGameModeChange: (mode: GameMode) => void;
  onStart: () => void;
  onViewLeaderboard: () => void;
  onStartDuel: () => void;
}

function selectionInfoText(tables: ReadonlySet<number>): { text: string; multiplier: string } | null {
  const n = tables.size;
  if (n === 0) return null;
  const divMult = diversityMultiplierFor(n);
  const avgDiff = Array.from(tables).reduce((sum, t) => sum + tableDifficultyInfo(t).mult, 0) / n;
  const total = (divMult * avgDiff).toFixed(2);
  const focusNote = n === 1 ? ' · Mode focus : classement dédié à cette table' : '';
  return {
    text: `🌈 Diversité x${divMult.toFixed(2)} · 🎯 Difficulté x${avgDiff.toFixed(2)} → `,
    multiplier: `Multiplicateur total x${total}${focusNote}`,
  };
}

export function Home({
  tables,
  onToggleTable,
  onSelectAll,
  answerMode,
  onAnswerModeChange,
  gameMode,
  onGameModeChange,
  onStart,
  onViewLeaderboard,
  onStartDuel,
}: HomeProps) {
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const allSelected = tables.size === ALL_TABLES_COUNT;
  const info = selectionInfoText(tables);

  function handleStart() {
    if (tables.size === 0) {
      setError('Sélectionne au moins une table de multiplication !');
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    setError('');
    onStart();
  }

  return (
    <section class="screen active">
      <h1 class="neon-title">⚡ MULTI FUSION ⚡</h1>

      <div class={`panel${shake ? ' error-shake' : ''}`}>
        <div class="section-label">
          <span class="dot" />
          Choisis tes tables
        </div>
        <TablesGrid selected={tables} onToggle={onToggleTable} />
        <div class="difficulty-legend">
          <span>
            <span class="legend-dot" style={{ background: 'var(--green)' }} />
            Facile (2,5,10)
          </span>
          <span>
            <span class="legend-dot" style={{ background: 'var(--orange)' }} />
            Moyen ×1.2 points
          </span>
          <span>
            <span class="legend-dot" style={{ background: 'var(--red)' }} />
            Difficile ★ ×1.5 points
          </span>
        </div>
        <button type="button" class={`btn-select-all${allSelected ? ' on' : ''}`} onClick={() => onSelectAll(allSelected)}>
          {allSelected ? '❌ Tout désélectionner' : '✅ Tout sélectionner'}
        </button>
        <div class="selection-info">
          {info ? (
            <>
              {info.text}
              <strong>{info.multiplier}</strong>
            </>
          ) : (
            'Sélectionne au moins une table pour voir ton bonus de points.'
          )}
        </div>
      </div>

      <div class={`panel${shake ? ' error-shake' : ''}`}>
        <div class="section-label">
          <span class="dot" />
          Mode de réponse
        </div>
        <ToggleGroup options={ANSWER_MODE_OPTIONS} value={answerMode} onChange={onAnswerModeChange} />
      </div>

      <div class={`panel${shake ? ' error-shake' : ''}`}>
        <div class="section-label">
          <span class="dot" />
          Mode de jeu
        </div>
        <ToggleGroup options={GAME_MODE_OPTIONS} value={gameMode} onChange={onGameModeChange} />
      </div>

      <div class="hint-error">{error}</div>
      <button type="button" class="btn-start" onClick={handleStart}>
        🚀 LANCER LA PARTIE
      </button>
      <button type="button" class="btn-secondary" style={{ width: '100%', marginTop: '12px' }} onClick={onStartDuel}>
        ⚔️ Mode Duel (2 joueurs)
      </button>
      <button type="button" class="btn-secondary" style={{ width: '100%', marginTop: '12px' }} onClick={onViewLeaderboard}>
        🏆 Voir le classement
      </button>
    </section>
  );
}
