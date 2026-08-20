import { useState } from 'preact/hooks';
import { DUEL_TARGET_SCORE } from '../game/duel';
import { TablesGrid } from './TablesGrid';

interface DuelSetupProps {
  tables: ReadonlySet<number>;
  onToggleTable: (table: number) => void;
  defaultPlayer1Name: string;
  defaultPlayer2Name: string;
  onStart: (player1Name: string, player2Name: string) => void;
  onBack: () => void;
}

export function DuelSetup({ tables, onToggleTable, defaultPlayer1Name, defaultPlayer2Name, onStart, onBack }: DuelSetupProps) {
  const [player1Name, setPlayer1Name] = useState(defaultPlayer1Name);
  const [player2Name, setPlayer2Name] = useState(defaultPlayer2Name);
  const [error, setError] = useState('');

  function handleStart() {
    if (tables.size === 0) {
      setError('Sélectionne au moins une table de multiplication !');
      return;
    }
    setError('');
    onStart(player1Name.trim() || 'Joueur 1', player2Name.trim() || 'Joueur 2');
  }

  return (
    <section class="screen active">
      <h1 class="neon-title" style={{ fontSize: 'clamp(24px,6vw,38px)' }}>
        ⚔️ MODE DUEL
      </h1>

      <div class="panel">
        <div class="section-label">
          <span class="dot" />
          Choisissez vos tables
        </div>
        <TablesGrid selected={tables} onToggle={onToggleTable} />
        <div class="difficulty-legend">
          <span>
            <span class="legend-dot" style={{ background: 'var(--green)' }} />
            Facile (2,5,10)
          </span>
          <span>
            <span class="legend-dot" style={{ background: 'var(--orange)' }} />
            Moyen
          </span>
          <span>
            <span class="legend-dot" style={{ background: 'var(--red)' }} />
            Difficile ★
          </span>
        </div>
      </div>

      <div class="panel">
        <div class="section-label">
          <span class="dot" />
          Joueurs
        </div>
        <input
          type="text"
          maxLength={15}
          placeholder="Joueur 1"
          value={player1Name}
          onInput={(e) => setPlayer1Name((e.target as HTMLInputElement).value)}
          style={{ marginBottom: '10px' }}
        />
        <input
          type="text"
          maxLength={15}
          placeholder="Joueur 2"
          value={player2Name}
          onInput={(e) => setPlayer2Name((e.target as HTMLInputElement).value)}
        />
      </div>

      <div class="hint-error">{error}</div>
      <button type="button" class="btn-start" onClick={handleStart}>
        ⚔️ COMMENCER LE DUEL
      </button>
      <div class="selection-info" style={{ marginTop: '12px', textAlign: 'center' }}>
        Premier à {DUEL_TARGET_SCORE} points gagne · QCM uniquement · même écran, un joueur de chaque côté
      </div>
      <button type="button" class="btn-secondary" style={{ width: '100%', marginTop: '12px' }} onClick={onBack}>
        ⬅ Retour au menu
      </button>
    </section>
  );
}
