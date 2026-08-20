import { useEffect, useRef, useState } from 'preact/hooks';
import { playBonusSound, playCorrectSound, playWrongSound } from '../game/audio';
import { diversityMultiplierFor, tableDifficultyInfo } from '../game/difficulty';
import { computeBadges, NEW_RECORD_BADGE } from '../game/badges';
import { getLeaderboardKey, peekPreviousBest } from '../game/leaderboard';
import { generateDistractors, QuestionSupplier } from '../game/questions';
import { pick, shuffle } from '../game/random';
import { comboMultiplier, computeAnswerPoints, timeAttackBonusMs } from '../game/scoring';
import type { AnswerMode, DifficultyTier, GameMode, GameResult, LeaderboardScope, PerTableStats } from '../game/types';
import { Keypad } from './Keypad';
import { QcmAnswers } from './QcmAnswers';

const ENCOURAGEMENTS = ['Incroyable !', 'En Feu !', 'Génie !', 'Fantastique !', 'Imbattable !', 'Trop fort !', 'Éclair !', 'Machine de guerre !'];

export interface GameEffects {
  flashScreen: (color: 'green' | 'red') => void;
  spawnSparks: () => void;
  showToast: (text: string) => void;
}

interface Engine {
  supplier: QuestionSupplier;
  score: number;
  combo: number;
  maxCombo: number;
  streak: number;
  questionsTotal: number;
  questionsCorrect: number;
  errors: number;
  responseTimes: number[];
  timeLeftMs: number;
  totalTimeMs: number;
  rafId: number | null;
  lastTs: number | null;
  running: boolean;
  currentAnswer: number;
  currentTable: number;
  currentMultiplier: number;
  questionStartTs: number;
  perTableStats: PerTableStats;
  gameStartTs: number;
  diversityMultiplier: number;
  boardScope: LeaderboardScope;
}

function recordTableStat(stats: PerTableStats, table: number, correct: boolean): void {
  const entry = stats[table] ?? { correct: 0, total: 0 };
  entry.total++;
  if (correct) entry.correct++;
  stats[table] = entry;
}

function updateTimerDom(timerEl: HTMLElement | null, fillEl: HTMLElement | null, timeLeftMs: number, totalMs: number): void {
  const seconds = Math.ceil(timeLeftMs / 1000);
  if (timerEl) {
    timerEl.textContent = String(seconds);
    timerEl.classList.remove('warn', 'danger');
    if (seconds <= 5) timerEl.classList.add('danger');
    else if (seconds <= 10) timerEl.classList.add('warn');
  }
  if (fillEl) {
    const ratio = Math.max(0, timeLeftMs / totalMs);
    fillEl.style.width = Math.min(ratio, 1) * 100 + '%';
    fillEl.style.background = seconds <= 5 ? 'linear-gradient(90deg,#ff3b5c,#ff9d2e)' : 'linear-gradient(90deg,var(--green),var(--cyan))';
  }
}

interface GameProps {
  tables: ReadonlySet<number>;
  answerMode: AnswerMode;
  gameMode: GameMode;
  effects: GameEffects;
  onGameEnd: (result: GameResult) => void;
}

export function Game({ tables, answerMode, gameMode, effects, onGameEnd }: GameProps) {
  const timerValueRef = useRef<HTMLDivElement>(null);
  const timerBarFillRef = useRef<HTMLDivElement>(null);

  const engineRef = useRef<Engine | null>(null);
  function getEngine(): Engine {
    if (!engineRef.current) engineRef.current = makeEngine();
    return engineRef.current;
  }

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboTag, setComboTag] = useState<{ mult: number; key: number }>({ mult: 0, key: 0 });
  const [onFire, setOnFire] = useState(false);
  const [hyperspace, setHyperspace] = useState(false);

  const [questionText, setQuestionText] = useState('');
  const [questionKey, setQuestionKey] = useState(0);
  const [difficultyTag, setDifficultyTag] = useState<{ tier: DifficultyTier; text: string }>({ tier: 'easy', text: '' });
  const [qcmOptions, setQcmOptions] = useState<number[]>([]);
  const [qcmFeedback, setQcmFeedback] = useState<{ correctValue: number; wrongValue: number | null } | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');

  function makeEngine(): Engine {
    return {
      supplier: new QuestionSupplier(Array.from(tables)),
      score: 0,
      combo: 0,
      maxCombo: 0,
      streak: 0,
      questionsTotal: 0,
      questionsCorrect: 0,
      errors: 0,
      responseTimes: [],
      timeLeftMs: gameMode === 'classic' ? 60000 : 30000,
      totalTimeMs: gameMode === 'classic' ? 60000 : 30000,
      rafId: null,
      lastTs: null,
      running: false,
      currentAnswer: 0,
      currentTable: 0,
      currentMultiplier: 0,
      questionStartTs: 0,
      perTableStats: {},
      gameStartTs: 0,
      diversityMultiplier: 1,
      boardScope: 'general',
    };
  }

  function updateFireMode(): void {
    const streak = getEngine().streak;
    if (streak >= 10) {
      setHyperspace(true);
      setOnFire(true);
    } else if (streak >= 5) {
      setHyperspace(false);
      setOnFire(true);
    } else {
      setOnFire(false);
      setHyperspace(false);
    }
  }

  function generateQuestion(): void {
    const engine = getEngine();
    const q = engine.supplier.next();
    const correct = q.table * q.multiplier;
    engine.currentAnswer = correct;
    engine.currentTable = q.table;
    engine.currentMultiplier = q.multiplier;
    engine.questionStartTs = performance.now();

    setTypedAnswer('');
    setQuestionText(`${q.table} × ${q.multiplier}`);
    setQuestionKey((k) => k + 1);

    const diff = tableDifficultyInfo(q.table);
    setDifficultyTag({ tier: diff.tier, text: `Table ${q.table} · ${diff.label} · points x${diff.mult}` });
    setQcmFeedback(null);

    if (answerMode === 'qcm') {
      const distractors = generateDistractors(q.table, q.multiplier, correct);
      setQcmOptions(shuffle([correct, ...distractors]));
    } else {
      setQcmOptions([]);
    }
  }

  function endGame(): void {
    const engine = getEngine();
    engine.running = false;
    if (engine.rafId !== null) cancelAnimationFrame(engine.rafId);
    setOnFire(false);
    setHyperspace(false);

    const badges = computeBadges({
      perTableStats: engine.perTableStats,
      maxCombo: engine.maxCombo,
      gameMode,
      elapsedRealMs: performance.now() - engine.gameStartTs,
      errors: engine.errors,
      questionsTotal: engine.questionsTotal,
      questionsCorrect: engine.questionsCorrect,
      responseTimes: engine.responseTimes,
      selectedTables: Array.from(tables),
    });

    const key = getLeaderboardKey(gameMode, engine.boardScope);
    const previousBest = peekPreviousBest(key);
    const isNewRecord = engine.score > 0 && engine.score > previousBest;
    if (isNewRecord) badges.push(NEW_RECORD_BADGE);

    onGameEnd({
      score: engine.score,
      maxCombo: engine.maxCombo,
      questionsCorrect: engine.questionsCorrect,
      questionsTotal: engine.questionsTotal,
      badges,
      isNewRecord,
      gameMode,
      boardScope: engine.boardScope,
    });
  }

  function timerLoop(ts: number): void {
    const engine = getEngine();
    if (!engine.running) return;
    if (engine.lastTs === null) engine.lastTs = ts;
    const delta = ts - engine.lastTs;
    engine.lastTs = ts;

    engine.timeLeftMs -= delta;
    if (engine.timeLeftMs <= 0) {
      engine.timeLeftMs = 0;
      updateTimerDom(timerValueRef.current, timerBarFillRef.current, engine.timeLeftMs, engine.totalTimeMs);
      endGame();
      return;
    }
    updateTimerDom(timerValueRef.current, timerBarFillRef.current, engine.timeLeftMs, engine.totalTimeMs);
    engine.rafId = requestAnimationFrame(timerLoop);
  }

  function handleAnswer(isCorrect: boolean, wrongValue: number | null): void {
    const engine = getEngine();
    if (!engine.running) return;
    const responseTime = performance.now() - engine.questionStartTs;
    engine.questionsTotal++;
    recordTableStat(engine.perTableStats, engine.currentTable, isCorrect);

    if (answerMode === 'qcm') {
      setQcmFeedback({ correctValue: engine.currentAnswer, wrongValue: isCorrect ? null : wrongValue });
    }

    if (isCorrect) {
      engine.questionsCorrect++;
      engine.combo++;
      engine.streak++;
      engine.maxCombo = Math.max(engine.maxCombo, engine.combo);
      engine.responseTimes.push(responseTime);

      const difficultyMult = tableDifficultyInfo(engine.currentTable).mult;
      const points = computeAnswerPoints({
        comboAfter: engine.combo,
        responseTimeMs: responseTime,
        difficultyMult,
        diversityMultiplier: engine.diversityMultiplier,
      });
      engine.score += points;

      playCorrectSound(engine.combo);
      effects.flashScreen('green');
      updateFireMode();
      if (engine.streak >= 5) effects.spawnSparks();

      const mult = comboMultiplier(engine.combo);
      if (mult >= 2 && Math.random() < 0.5) effects.showToast(pick(ENCOURAGEMENTS));

      if (gameMode === 'classic' && engine.streak > 0 && engine.streak % 5 === 0) {
        engine.timeLeftMs += 3000;
        effects.showToast('+3s Bonus Combo !');
        playBonusSound();
      }
      if (gameMode === 'timeattack') {
        engine.timeLeftMs += timeAttackBonusMs(responseTime);
      }

      setComboTag((prev) => ({ mult, key: prev.key + 1 }));
    } else {
      engine.errors++;
      engine.combo = 0;
      engine.streak = 0;
      playWrongSound();
      effects.flashScreen('red');
      updateFireMode();

      if (gameMode === 'timeattack') {
        engine.timeLeftMs -= 3000;
      }
    }

    setScore(engine.score);
    setCombo(engine.combo);

    const delay = answerMode === 'qcm' ? 550 : 120;
    setTimeout(() => {
      if (engine.running) {
        if (engine.timeLeftMs <= 0) endGame();
        else generateQuestion();
      }
    }, delay);
  }

  function submitTypedAnswer(current: string): void {
    if (current === '') return;
    const val = parseInt(current, 10);
    handleAnswer(val === getEngine().currentAnswer, null);
  }

  // Démarrage de la partie au montage de l'écran.
  useEffect(() => {
    const engine = getEngine();
    engine.running = true;
    engine.gameStartTs = performance.now();
    engine.diversityMultiplier = diversityMultiplierFor(tables.size);
    engine.boardScope = tables.size === 1 ? Array.from(tables)[0]! : 'general';

    setScore(0);
    setCombo(0);
    generateQuestion();
    updateTimerDom(timerValueRef.current, timerBarFillRef.current, engine.timeLeftMs, engine.totalTimeMs);

    engine.lastTs = null;
    engine.rafId = requestAnimationFrame(timerLoop);

    return () => {
      engine.running = false;
      if (engine.rafId !== null) cancelAnimationFrame(engine.rafId);
    };
  }, []);

  // Support du clavier physique en mode "clavier".
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent): void {
      if (!getEngine().running || answerMode !== 'keyboard') return;
      if (e.key >= '0' && e.key <= '9') {
        setTypedAnswer((t) => (t.length < 4 ? t + e.key : t));
      } else if (e.key === 'Backspace') {
        setTypedAnswer((t) => t.slice(0, -1));
      } else if (e.key === 'Enter') {
        submitTypedAnswer(typedAnswer);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [answerMode, typedAnswer]);

  const classes = ['screen', 'active'];
  if (onFire) classes.push('on-fire');
  if (hyperspace) classes.push('hyperspace');

  return (
    <section id="screen-game" class={classes.join(' ')}>
      <div class="hud">
        <div class="hud-box">
          <div class="hud-label">Temps</div>
          <div class="hud-value" id="timer-value" ref={timerValueRef}>
            {Math.ceil(getEngine().timeLeftMs / 1000)}
          </div>
        </div>
        <div class="hud-box">
          <div class="hud-label">Score</div>
          <div class="hud-value">{score}</div>
        </div>
        <div class="hud-box" id="combo-box">
          <div class="hud-label">Combo</div>
          <div class="hud-value">{combo}</div>
          <div key={comboTag.key} class={`combo-tag${comboTag.key > 0 ? ' show' : ''}`}>
            x{comboTag.mult}
          </div>
        </div>
      </div>

      <div class="timer-bar-track">
        <div class="timer-bar-fill" ref={timerBarFillRef} />
      </div>

      <div class="panel question-box">
        <div key={questionKey} id="question-text" class="pop">
          {questionText}
        </div>
        <div class={`difficulty-tag diff-${difficultyTag.tier}`}>{difficultyTag.text}</div>
      </div>

      {answerMode === 'qcm' ? (
        <div class="panel" id="qcm-panel">
          <QcmAnswers
            options={qcmOptions}
            feedback={qcmFeedback}
            onAnswer={(value) => handleAnswer(value === getEngine().currentAnswer, value)}
          />
        </div>
      ) : (
        <div class="panel" id="keyboard-panel">
          <div id="keyboard-area">
            <div id="answer-display">{typedAnswer}</div>
            <Keypad
              onDigit={(d) => setTypedAnswer((t) => (t.length < 4 ? t + d : t))}
              onClear={() => setTypedAnswer((t) => t.slice(0, -1))}
              onValidate={() => submitTypedAnswer(typedAnswer)}
            />
          </div>
        </div>
      )}
    </section>
  );
}
