import { multiplierOf } from '../game/game2048';
import type { Mode2048Result } from '../game/types';

interface Mode2048ResultsProps {
  result: Mode2048Result;
  onMenu: () => void;
  onReplay: () => void;
}

export function Mode2048Results({ result, onMenu, onReplay }: Mode2048ResultsProps) {
  const k = multiplierOf(result.bestTileValue, result.table);
  const bestTileLabel = k !== null ? `${result.table}×${k} = ${result.bestTileValue}` : String(result.bestTileValue);
  const endReasonText =
    result.endReason === 'time' ? '⏱️ Temps écoulé' : '🧱 Plus aucun coup possible';

  return (
    <section class="screen active">
      <div class="result-header">
        <h2>🔢 Partie terminée !</h2>
        <div class="final-score">{result.score}</div>
        <div class="result-stats">
          <div class="result-stat">
            <div class="num">{bestTileLabel}</div>
            <div class="lbl">Meilleure tuile</div>
          </div>
          <div class="result-stat">
            <div class="num">{result.tableMastered ? '🏆 Oui' : 'Pas encore'}</div>
            <div class="lbl">Table ×{result.table} maîtrisée</div>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="section-label">
          <span class="dot" />
          Fin de partie
        </div>
        <div class="selection-info" style={{ textAlign: 'center' }}>
          {endReasonText}
          {!result.tableMastered && (
            <>
              <br />
              Continue à t'entraîner pour atteindre la tuile ×10 !
            </>
          )}
        </div>
      </div>

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
