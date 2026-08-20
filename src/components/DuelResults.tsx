import type { DuelResult } from '../game/duel';

interface DuelResultsProps {
  result: DuelResult;
  onMenu: () => void;
  onReplay: () => void;
}

export function DuelResults({ result, onMenu, onReplay }: DuelResultsProps) {
  const winnerName = result.winner === 1 ? result.player1Name : result.player2Name;

  return (
    <section class="screen active">
      <div class="result-header">
        <h2>⚔️ Duel terminé !</h2>
        <div class="final-score">🏆 {winnerName}</div>
        <div class="result-stats">
          <div class="result-stat">
            <div class="num">{result.scoreP1}</div>
            <div class="lbl">{result.player1Name}</div>
          </div>
          <div class="result-stat">
            <div class="num">{result.scoreP2}</div>
            <div class="lbl">{result.player2Name}</div>
          </div>
        </div>
      </div>

      <div class="result-actions">
        <button type="button" class="btn-secondary" onClick={onMenu}>
          🏠 Menu
        </button>
        <button type="button" class="btn-primary" onClick={onReplay}>
          🔁 Revanche
        </button>
      </div>
    </section>
  );
}
