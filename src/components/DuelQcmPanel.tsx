interface DuelQcmPanelProps {
  options: number[];
  wrongAttempts: ReadonlySet<number>;
  /** Non-null une fois la manche décidée : révèle la bonne réponse des deux côtés. */
  revealedCorrectValue: number | null;
  onAnswer: (value: number) => void;
}

export function DuelQcmPanel({ options, wrongAttempts, revealedCorrectValue, onAnswer }: DuelQcmPanelProps) {
  const roundOver = revealedCorrectValue !== null;
  return (
    <div class="duel-qcm">
      {options.map((value) => {
        const isWrong = wrongAttempts.has(value);
        const isCorrectReveal = revealedCorrectValue === value;
        const classes = ['qcm-btn'];
        if (isWrong) classes.push('wrong');
        if (isCorrectReveal) classes.push('correct');
        const disabled = roundOver || isWrong;
        if (disabled) classes.push('disabled');
        return (
          <button key={value} type="button" class={classes.join(' ')} disabled={disabled} onClick={() => onAnswer(value)}>
            {value}
          </button>
        );
      })}
    </div>
  );
}
