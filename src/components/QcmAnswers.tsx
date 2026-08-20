interface QcmFeedback {
  correctValue: number;
  wrongValue: number | null;
}

interface QcmAnswersProps {
  options: number[];
  feedback: QcmFeedback | null;
  onAnswer: (value: number) => void;
}

export function QcmAnswers({ options, feedback, onAnswer }: QcmAnswersProps) {
  return (
    <div id="qcm-answers">
      {options.map((value) => {
        const classes = ['qcm-btn'];
        if (feedback) {
          classes.push('disabled');
          if (value === feedback.correctValue) classes.push('correct');
          if (value === feedback.wrongValue) classes.push('wrong');
        }
        return (
          <button
            key={value}
            type="button"
            class={classes.join(' ')}
            onClick={() => onAnswer(value)}
            disabled={feedback !== null}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}
