export interface ToggleOption<T extends string> {
  value: T;
  icon: string;
  label: string;
  hint: string;
  modeClass: string;
}

interface ToggleGroupProps<T extends string> {
  options: readonly ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function ToggleGroup<T extends string>({ options, value, onChange }: ToggleGroupProps<T>) {
  return (
    <div class="toggle-group">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          class={`toggle-btn ${opt.modeClass}${opt.value === value ? ' active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.icon} {opt.label}
          <small>{opt.hint}</small>
        </button>
      ))}
    </div>
  );
}
