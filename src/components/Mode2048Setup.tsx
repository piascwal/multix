import { useState } from 'preact/hooks';
import { TablesGrid } from './TablesGrid';

interface Mode2048SetupProps {
  defaultTable: number | null;
  onStart: (table: number) => void;
  onBack: () => void;
}

export function Mode2048Setup({ defaultTable, onStart, onBack }: Mode2048SetupProps) {
  const [table, setTable] = useState<number | null>(defaultTable);
  const [error, setError] = useState('');

  function handleStart() {
    if (table === null) {
      setError('Choisis une table à réviser !');
      return;
    }
    setError('');
    onStart(table);
  }

  return (
    <section class="screen active">
      <h1 class="neon-title" style={{ fontSize: 'clamp(24px,6vw,38px)' }}>
        🔢 MODE 2048
      </h1>

      <div class="panel">
        <div class="section-label">
          <span class="dot" />
          Choisis UNE table à réviser
        </div>
        <TablesGrid selected={table === null ? new Set() : new Set([table])} onToggle={(t) => setTable(t)} />
        <div class="selection-info">
          Les tuiles affichent la table choisie (ex : <strong>4×3</strong>) et fusionnent avec leur résultat (
          <strong>12</strong>). Premier objectif : atteindre la tuile ×10 !
        </div>
      </div>

      <div class="hint-error">{error}</div>
      <button type="button" class="btn-start" onClick={handleStart}>
        🚀 COMMENCER
      </button>
      <button type="button" class="btn-secondary" style={{ width: '100%', marginTop: '12px' }} onClick={onBack}>
        ⬅ Retour au menu
      </button>
    </section>
  );
}
