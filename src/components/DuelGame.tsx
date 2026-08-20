import { useEffect, useRef, useState } from 'preact/hooks';
import { playCorrectSound, playWrongSound } from '../game/audio';
import { tableDifficultyInfo } from '../game/difficulty';
import { checkDuelWinner, type DuelPlayer, type DuelResult } from '../game/duel';
import { generateDistractors, QuestionSupplier } from '../game/questions';
import { shuffle } from '../game/random';
import type { DifficultyTier } from '../game/types';
import { DuelQcmPanel } from './DuelQcmPanel';

interface DuelEngine {
  supplier: QuestionSupplier;
  currentAnswer: number;
  roundWinner: DuelPlayer | null;
  scoreP1: number;
  scoreP2: number;
}

interface DuelGameProps {
  tables: ReadonlySet<number>;
  player1Name: string;
  player2Name: string;
  effects: { flashScreen: (color: 'green' | 'red') => void };
  onDuelEnd: (result: DuelResult) => void;
}

export function DuelGame({ tables, player1Name, player2Name, effects, onDuelEnd }: DuelGameProps) {
  const engineRef = useRef<DuelEngine | null>(null);
  function getEngine(): DuelEngine {
    if (!engineRef.current) {
      engineRef.current = {
        supplier: new QuestionSupplier(Array.from(tables)),
        currentAnswer: 0,
        roundWinner: null,
        scoreP1: 0,
        scoreP2: 0,
      };
    }
    return engineRef.current;
  }

  const [questionText, setQuestionText] = useState('');
  const [questionKey, setQuestionKey] = useState(0);
  const [difficultyTag, setDifficultyTag] = useState<{ tier: DifficultyTier; text: string }>({ tier: 'easy', text: '' });
  const [options, setOptions] = useState<number[]>([]);
  const [wrongP1, setWrongP1] = useState<Set<number>>(new Set());
  const [wrongP2, setWrongP2] = useState<Set<number>>(new Set());
  const [roundWinner, setRoundWinner] = useState<DuelPlayer | null>(null);
  const [scoreP1, setScoreP1] = useState(0);
  const [scoreP2, setScoreP2] = useState(0);

  function nextQuestion(): void {
    const engine = getEngine();
    const q = engine.supplier.next();
    const correct = q.table * q.multiplier;
    engine.currentAnswer = correct;
    engine.roundWinner = null;

    setQuestionText(`${q.table} × ${q.multiplier}`);
    setQuestionKey((k) => k + 1);
    const diff = tableDifficultyInfo(q.table);
    setDifficultyTag({ tier: diff.tier, text: `Table ${q.table} · ${diff.label}` });

    const distractors = generateDistractors(q.table, q.multiplier, correct);
    setOptions(shuffle([correct, ...distractors]));
    setWrongP1(new Set());
    setWrongP2(new Set());
    setRoundWinner(null);
  }

  function handleGuess(player: DuelPlayer, value: number): void {
    const engine = getEngine();
    if (engine.roundWinner !== null) return; // manche déjà décidée, clic tardif ignoré

    if (value !== engine.currentAnswer) {
      playWrongSound();
      if (player === 1) setWrongP1((prev) => new Set(prev).add(value));
      else setWrongP2((prev) => new Set(prev).add(value));
      return;
    }

    engine.roundWinner = player;
    if (player === 1) engine.scoreP1++;
    else engine.scoreP2++;

    playCorrectSound(1);
    effects.flashScreen('green');
    setRoundWinner(player);
    setScoreP1(engine.scoreP1);
    setScoreP2(engine.scoreP2);

    const winner = checkDuelWinner({ player1: engine.scoreP1, player2: engine.scoreP2 });
    setTimeout(() => {
      if (winner) {
        onDuelEnd({ winner, scoreP1: engine.scoreP1, scoreP2: engine.scoreP2, player1Name, player2Name });
      } else {
        nextQuestion();
      }
    }, 900);
  }

  useEffect(() => {
    nextQuestion();
  }, []);

  const revealedCorrectValue = roundWinner !== null ? getEngine().currentAnswer : null;

  return (
    <section class="screen active">
      <h1 class="neon-title" style={{ fontSize: 'clamp(20px,5vw,32px)' }}>
        ⚔️ DUEL
      </h1>

      <div class="panel question-box">
        <div key={questionKey} id="question-text" class="pop">
          {questionText}
        </div>
        <div class={`difficulty-tag diff-${difficultyTag.tier}`}>{difficultyTag.text}</div>
      </div>

      <div class="duel-arena">
        <div class={`duel-panel${roundWinner === 1 ? ' duel-winner' : ''}`}>
          <div class="duel-panel-header">
            <span class="duel-player-name">{player1Name}</span>
            <span class="duel-player-score">{scoreP1} / 10</span>
          </div>
          <DuelQcmPanel
            options={options}
            wrongAttempts={wrongP1}
            revealedCorrectValue={revealedCorrectValue}
            onAnswer={(v) => handleGuess(1, v)}
          />
        </div>

        <div class="duel-divider" />

        <div class={`duel-panel${roundWinner === 2 ? ' duel-winner' : ''}`}>
          <div class="duel-panel-header">
            <span class="duel-player-name">{player2Name}</span>
            <span class="duel-player-score">{scoreP2} / 10</span>
          </div>
          <DuelQcmPanel
            options={options}
            wrongAttempts={wrongP2}
            revealedCorrectValue={revealedCorrectValue}
            onAnswer={(v) => handleGuess(2, v)}
          />
        </div>
      </div>
    </section>
  );
}
