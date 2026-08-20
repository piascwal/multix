interface KeypadProps {
  onDigit: (digit: string) => void;
  onClear: () => void;
  onValidate: () => void;
}

const LAYOUT = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'validate'] as const;

export function Keypad({ onDigit, onClear, onValidate }: KeypadProps) {
  return (
    <div class="keypad">
      {LAYOUT.map((key) => {
        if (key === 'clear') {
          return (
            <button key={key} type="button" class="key-btn clear" onClick={onClear}>
              ⌫
            </button>
          );
        }
        if (key === 'validate') {
          return (
            <button key={key} type="button" class="key-btn validate" onClick={onValidate}>
              ✓
            </button>
          );
        }
        return (
          <button key={key} type="button" class="key-btn" onClick={() => onDigit(key)}>
            {key}
          </button>
        );
      })}
    </div>
  );
}
