import type { Badge } from '../game/types';

interface BadgesGridProps {
  badges: Badge[];
}

export function BadgesGrid({ badges }: BadgesGridProps) {
  if (badges.length === 0) {
    return <div class="no-badge-msg">Aucun badge cette fois... Retente ta chance pour en débloquer ! 🎯</div>;
  }

  return (
    <div class="badges-grid">
      {badges.map((b, i) => (
        <div key={b.name} class="badge-card" style={{ animationDelay: `${i * 0.12}s` }}>
          <span class="icon">{b.icon}</span>
          <div class="name">{b.name}</div>
          <div class="desc">{b.desc}</div>
        </div>
      ))}
    </div>
  );
}
