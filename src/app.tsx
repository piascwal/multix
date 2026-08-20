import { useState } from 'preact/hooks';
import { unlockAudio } from './game/audio';
import type { DuelResult } from './game/duel';
import type { AnswerMode, GameMode, GameResult, LeaderboardScope, Mode2048Result } from './game/types';
import { ModeSelect } from './components/ModeSelect';
import { Home } from './components/Home';
import { LeaderboardMenuScreen } from './components/LeaderboardMenuScreen';
import { Game } from './components/Game';
import { Results } from './components/Results';
import { DuelSetup } from './components/DuelSetup';
import { DuelGame } from './components/DuelGame';
import { DuelResults } from './components/DuelResults';
import { Mode2048Setup } from './components/Mode2048Setup';
import { Mode2048Game } from './components/Mode2048Game';
import { Mode2048Results } from './components/Mode2048Results';
import { useEffectsLayer } from './useEffectsLayer';

type Screen =
  | 'mode-select'
  | 'solo-home'
  | 'leaderboard'
  | 'game'
  | 'results'
  | 'duel-setup'
  | 'duel-game'
  | 'duel-results'
  | 'mode2048-setup'
  | 'mode2048-game'
  | 'mode2048-results';

const ALL_TABLES = new Set(Array.from({ length: 11 }, (_, i) => i + 2));

export function App() {
  const [screen, setScreen] = useState<Screen>('mode-select');
  const [tables, setTables] = useState<Set<number>>(new Set());
  const [answerMode, setAnswerMode] = useState<AnswerMode>('qcm');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [playerName, setPlayerName] = useState('');
  const [lastResult, setLastResult] = useState<GameResult | null>(null);
  const [leaderboardScope, setLeaderboardScope] = useState<LeaderboardScope>('general');

  const [duelTables, setDuelTables] = useState<Set<number>>(new Set());
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [duelResult, setDuelResult] = useState<DuelResult | null>(null);

  const [table2048, setTable2048] = useState<number | null>(null);
  const [result2048, setResult2048] = useState<Mode2048Result | null>(null);

  const effectsLayer = useEffectsLayer();

  function toggleTable(table: number): void {
    setTables((prev) => {
      const next = new Set(prev);
      if (next.has(table)) next.delete(table);
      else next.add(table);
      return next;
    });
  }

  function selectAll(currentlyAllSelected: boolean): void {
    setTables(currentlyAllSelected ? new Set() : new Set(ALL_TABLES));
  }

  function toggleDuelTable(table: number): void {
    setDuelTables((prev) => {
      const next = new Set(prev);
      if (next.has(table)) next.delete(table);
      else next.add(table);
      return next;
    });
  }

  function handleStart(): void {
    unlockAudio();
    setScreen('game');
  }

  function handleViewLeaderboard(): void {
    setLeaderboardScope(tables.size === 1 ? Array.from(tables)[0]! : 'general');
    setScreen('leaderboard');
  }

  function handleGameEnd(result: GameResult): void {
    setLastResult(result);
    setScreen('results');
  }

  function handleStartDuel(p1: string, p2: string): void {
    setPlayer1Name(p1);
    setPlayer2Name(p2);
    unlockAudio();
    setScreen('duel-game');
  }

  function handleDuelEnd(result: DuelResult): void {
    setDuelResult(result);
    setScreen('duel-results');
  }

  function handleStart2048(table: number): void {
    setTable2048(table);
    unlockAudio();
    setScreen('mode2048-game');
  }

  function handle2048End(result: Mode2048Result): void {
    setResult2048(result);
    setScreen('mode2048-results');
  }

  return (
    <>
      {effectsLayer.layer}
      <div id="app">
        {screen === 'mode-select' && (
          <ModeSelect
            onSelectSolo={() => setScreen('solo-home')}
            onSelectDuel={() => setScreen('duel-setup')}
            onSelect2048={() => setScreen('mode2048-setup')}
            onViewLeaderboard={handleViewLeaderboard}
          />
        )}

        {screen === 'solo-home' && (
          <Home
            tables={tables}
            onToggleTable={toggleTable}
            onSelectAll={selectAll}
            answerMode={answerMode}
            onAnswerModeChange={setAnswerMode}
            gameMode={gameMode}
            onGameModeChange={setGameMode}
            onStart={handleStart}
            onBack={() => setScreen('mode-select')}
          />
        )}

        {screen === 'leaderboard' && (
          <LeaderboardMenuScreen initialScope={leaderboardScope} onBack={() => setScreen('mode-select')} />
        )}

        {screen === 'game' && (
          <Game
            tables={tables}
            answerMode={answerMode}
            gameMode={gameMode}
            effects={effectsLayer}
            onGameEnd={handleGameEnd}
          />
        )}

        {screen === 'results' && lastResult && (
          <Results
            result={lastResult}
            defaultPlayerName={playerName}
            onLaunchConfetti={effectsLayer.launchConfetti}
            onSaveName={setPlayerName}
            onMenu={() => setScreen('mode-select')}
            onReplay={() => setScreen('game')}
          />
        )}

        {screen === 'duel-setup' && (
          <DuelSetup
            tables={duelTables}
            onToggleTable={toggleDuelTable}
            defaultPlayer1Name={player1Name}
            defaultPlayer2Name={player2Name}
            onStart={handleStartDuel}
            onBack={() => setScreen('mode-select')}
          />
        )}

        {screen === 'duel-game' && (
          <DuelGame
            tables={duelTables}
            player1Name={player1Name}
            player2Name={player2Name}
            effects={effectsLayer}
            onDuelEnd={handleDuelEnd}
          />
        )}

        {screen === 'duel-results' && duelResult && (
          <DuelResults
            result={duelResult}
            onMenu={() => setScreen('mode-select')}
            onReplay={() => setScreen('duel-game')}
          />
        )}

        {screen === 'mode2048-setup' && (
          <Mode2048Setup defaultTable={table2048} onStart={handleStart2048} onBack={() => setScreen('mode-select')} />
        )}

        {screen === 'mode2048-game' && table2048 !== null && (
          <Mode2048Game table={table2048} effects={effectsLayer} onGameEnd={handle2048End} />
        )}

        {screen === 'mode2048-results' && result2048 && (
          <Mode2048Results
            result={result2048}
            onMenu={() => setScreen('mode-select')}
            onReplay={() => setScreen('mode2048-game')}
          />
        )}
      </div>
    </>
  );
}
