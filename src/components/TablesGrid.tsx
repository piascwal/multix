import { tableDifficultyInfo } from '../game/difficulty';

interface TablesGridProps {
  selected: ReadonlySet<number>;
  onToggle: (table: number) => void;
}

const TABLES = Array.from({ length: 11 }, (_, i) => i + 2); // 2..12

export function TablesGrid({ selected, onToggle }: TablesGridProps) {
  return (
    <div class="tables-grid">
      {TABLES.map((table) => {
        const diff = tableDifficultyInfo(table);
        const isSelected = selected.has(table);
        return (
          <button
            key={table}
            type="button"
            class={`table-badge diff-${diff.tier}${isSelected ? ' selected' : ''}`}
            title={`${diff.label} · points x${diff.mult}`}
            onClick={() => onToggle(table)}
          >
            {table}
          </button>
        );
      })}
    </div>
  );
}
