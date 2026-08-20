interface ModeSelectProps {
  onSelectSolo: () => void;
  onSelectDuel: () => void;
  onSelect2048: () => void;
  onViewLeaderboard: () => void;
}

export function ModeSelect({ onSelectSolo, onSelectDuel, onSelect2048, onViewLeaderboard }: ModeSelectProps) {
  return (
    <section class="screen active">
      <h1 class="neon-title">⚡ MULTI FUSION ⚡</h1>

      <button type="button" class="mode-card mode-card--solo" onClick={onSelectSolo}>
        <span class="mode-card-icon">🎮</span>
        <span class="mode-card-title">Solo</span>
        <span class="mode-card-desc">Choisis tes tables, QCM ou clavier, contre le chrono</span>
      </button>

      <button type="button" class="mode-card mode-card--duel" onClick={onSelectDuel}>
        <span class="mode-card-icon">⚔️</span>
        <span class="mode-card-title">Duel</span>
        <span class="mode-card-desc">2 joueurs, même écran, premier qui répond marque le point</span>
      </button>

      <button type="button" class="mode-card mode-card--2048" onClick={onSelect2048}>
        <span class="mode-card-icon">🔢</span>
        <span class="mode-card-title">2048</span>
        <span class="mode-card-desc">Fusionne les tuiles d'une table de multiplication, façon 2048</span>
      </button>

      <button type="button" class="btn-secondary" style={{ width: '100%', marginTop: '4px' }} onClick={onViewLeaderboard}>
        🏆 Voir le classement
      </button>
    </section>
  );
}
