import { useEffect, useMemo, useState } from 'preact/hooks';
import { commitScoreToLeaderboard, getLeaderboardKey, loadLeaderboard } from '../game/leaderboard';
import type { GameMode, GameResult } from '../game/types';
import { BadgesGrid } from './BadgesGrid';
import { LeaderboardTable } from './LeaderboardTable';

interface ResultsProps {
  result: GameResult;
  defaultPlayerName: string;
  onLaunchConfetti: () => void;
  onSaveName: (name: string) => void;
  onMenu: () => void;
  onReplay: () => void;
}

export function Results({ result, defaultPlayerName, onLaunchConfetti, onSaveName, onMenu, onReplay }: ResultsProps) {
  const [nameInput, setNameInput] = useState(defaultPlayerName);
  const [saved, setSaved] = useState<{ entryId: string; activeTab: GameMode } | null>(null);

  useEffect(() => {
    if (result.isNewRecord) onLaunchConfetti();
    // ne se relance qu'à l'arrivée sur un nouveau résultat
  }, [result]);

  const precision = result.questionsTotal > 0 ? Math.round((result.questionsCorrect / result.questionsTotal) * 100) : 0;

  const entries = useMemo(
    () => (saved ? loadLeaderboard(getLeaderboardKey(saved.activeTab, result.boardScope)) : []),
    [saved, result.boardScope]
  );

  function handleSave() {
    const name = nameInput.trim() || 'Joueur';
    onSaveName(name);
    const key = getLeaderboardKey(result.gameMode, result.boardScope);
    const entry = commitScoreToLeaderboard(key, { name, score: result.score, combo: result.maxCombo });
    setSaved({ entryId: entry.id, activeTab: result.gameMode });
  }

  const scopeLabel = result.boardScope === 'general' ? '(Général)' : `(Table ${result.boardScope} — focus)`;

  return (
    <section class="screen active">
      <div class="result-header">
        <h2>🏁 Partie terminée !</h2>
        <div class="final-score">{result.score}</div>
        <div class="result-stats">
          <div class="result-stat">
            <div class="num">{result.maxCombo}</div>
            <div class="lbl">Meilleur combo</div>
          </div>
          <div class="result-stat">
            <div class="num">
              {result.questionsCorrect} / {result.questionsTotal}
            </div>
            <div class="lbl">Bonnes réponses</div>
          </div>
          <div class="result-stat">
            <div class="num">{precision}%</div>
            <div class="lbl">Précision</div>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="section-label">
          <span class="dot" />
          Badges débloqués
        </div>
        <BadgesGrid badges={result.badges} />
      </div>

      {!saved ? (
        <div class="panel">
          <div class="section-label">
            <span class="dot" />
            Enregistre ton score
          </div>
          <input
            type="text"
            class="text-input"
            maxLength={15}
            placeholder="Ex: Ninja des Maths"
            value={nameInput}
            onInput={(e) => setNameInput((e.target as HTMLInputElement).value)}
          />
          <div class="hint-error" />
          <button type="button" class="btn-start" style={{ marginTop: '10px' }} onClick={handleSave}>
            💾 Enregistrer mon score
          </button>
        </div>
      ) : (
        <div class="panel">
          <div class="section-label">
            <span class="dot" />
            Classement <span style={{ color: 'var(--gold)', marginLeft: '6px' }}>{scopeLabel}</span>
          </div>
          <div class="lb-tabs">
            <button
              type="button"
              class={`lb-tab${saved.activeTab === 'classic' ? ' active' : ''}`}
              onClick={() => setSaved({ ...saved, activeTab: 'classic' })}
            >
              ⏱️ Classique
            </button>
            <button
              type="button"
              class={`lb-tab${saved.activeTab === 'timeattack' ? ' active' : ''}`}
              onClick={() => setSaved({ ...saved, activeTab: 'timeattack' })}
            >
              🔥 Time Attack
            </button>
          </div>
          <LeaderboardTable entries={entries} highlightId={saved.activeTab === result.gameMode ? saved.entryId : null} />
        </div>
      )}

      <div class="result-actions">
        <button type="button" class="btn-secondary" onClick={onMenu}>
          🏠 Menu
        </button>
        <button type="button" class="btn-primary" onClick={onReplay}>
          🔁 Rejouer
        </button>
      </div>
    </section>
  );
}
