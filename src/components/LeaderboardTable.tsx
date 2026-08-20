import { useEffect, useRef } from 'preact/hooks';
import type { LeaderboardEntry } from '../game/types';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  highlightId?: string | null;
}

export function LeaderboardTable({ entries, highlightId }: LeaderboardTableProps) {
  const highlightRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (highlightId && highlightRef.current) {
      const timer = setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [highlightId, entries]);

  return (
    <div class="lb-scroll">
      <table class="lb-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Joueur</th>
            <th>Score</th>
            <th>Combo</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', opacity: 0.6, padding: '16px' }}>
                Aucun score enregistré pour le moment
              </td>
            </tr>
          ) : (
            entries.map((entry, idx) => {
              const isHighlighted = entry.id === highlightId;
              return (
                <tr key={entry.id} ref={isHighlighted ? highlightRef : null} class={isHighlighted ? 'current-entry' : ''}>
                  <td>{idx + 1}</td>
                  <td>{entry.name}</td>
                  <td>{entry.score}</td>
                  <td>{entry.combo}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
